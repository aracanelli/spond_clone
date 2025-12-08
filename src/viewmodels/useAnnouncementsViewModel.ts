"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { AnnouncementWithDetails } from "@/models/database.types";

interface AnnouncementsState {
  announcements: AnnouncementWithDetails[];
  isLoading: boolean;
  error: string | null;
}

interface CreateAnnouncementData {
  group_id: string;
  subgroup_id?: string | null;
  title: string;
  content: string;
  event_id?: string | null;
}

export function useAnnouncementsViewModel(userId?: string, groupId?: string) {
  const [state, setState] = useState<AnnouncementsState>({
    announcements: [],
    isLoading: true,
    error: null,
  });

  const fetchAnnouncements = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Get user's groups
      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

      const groupIds = memberships?.map((m) => m.group_id) || [];

      if (groupIds.length === 0) {
        setState({ announcements: [], isLoading: false, error: null });
        return;
      }

      let query = supabase
        .from("announcements")
        .select(`
          *,
          users!announcements_sender_id_fkey(*),
          groups(*),
          events(*)
        `)
        .in("group_id", groupIds)
        .order("created_at", { ascending: false });

      if (groupId) {
        query = query.eq("group_id", groupId);
      }

      const { data: announcements, error } = await query;

      if (error) throw error;

      const announcementsWithDetails: AnnouncementWithDetails[] = (announcements || []).map((a) => ({
        ...a,
        sender: a.users ?? undefined,
        group: a.groups ?? undefined,
        event: a.events ?? undefined,
      }));

      setState({
        announcements: announcementsWithDetails,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch announcements",
      }));
    }
  }, [userId, groupId]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const createAnnouncement = async (data: CreateAnnouncementData, sendNotifications = true) => {
    if (!userId) return { error: "Not authenticated" };

    try {
      const { data: announcement, error } = await supabase
        .from("announcements")
        .insert({
          ...data,
          sender_id: userId,
        })
        .select()
        .single();

      if (error) throw error;

      // Optionally send notifications
      if (sendNotifications) {
        await fetch("/api/notifications/announcement", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            announcementId: announcement.id,
            groupId: data.group_id,
            subgroupId: data.subgroup_id,
          }),
        });
      }

      await fetchAnnouncements();
      return { data: announcement };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to create announcement" };
    }
  };

  const deleteAnnouncement = async (announcementId: string) => {
    try {
      const { error } = await supabase.from("announcements").delete().eq("id", announcementId);

      if (error) throw error;

      await fetchAnnouncements();
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to delete announcement" };
    }
  };

  return {
    ...state,
    fetchAnnouncements,
    createAnnouncement,
    deleteAnnouncement,
  };
}

