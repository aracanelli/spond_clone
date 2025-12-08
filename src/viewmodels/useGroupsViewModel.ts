"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Group, GroupWithMembers, Subgroup, MemberRole } from "@/models/database.types";

interface GroupsState {
  groups: GroupWithMembers[];
  currentGroup: GroupWithMembers | null;
  isLoading: boolean;
  error: string | null;
}

export function useGroupsViewModel(userId?: string) {
  const [state, setState] = useState<GroupsState>({
    groups: [],
    currentGroup: null,
    isLoading: true,
    error: null,
  });

  const fetchGroups = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Fetch groups where user is a member
      const { data: memberships, error: memberError } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

      if (memberError) throw memberError;

      if (!memberships || memberships.length === 0) {
        setState({ groups: [], currentGroup: null, isLoading: false, error: null });
        return;
      }

      const groupIds = memberships.map((m) => m.group_id);

      const { data: groups, error: groupsError } = await supabase
        .from("groups")
        .select(`
          *,
          group_members(count),
          subgroups(*)
        `)
        .in("id", groupIds);

      if (groupsError) throw groupsError;

      const groupsWithCount = (groups || []).map((g) => ({
        ...g,
        memberCount: g.group_members?.[0]?.count || 0,
        subgroups: g.subgroups || [],
      }));

      setState((prev) => ({
        ...prev,
        groups: groupsWithCount,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch groups",
      }));
    }
  }, [userId]);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  const createGroup = async (data: { name: string; description?: string; image_url?: string }) => {
    if (!userId) return { error: "Not authenticated" };

    try {
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from("groups")
        .insert({
          name: data.name,
          description: data.description || null,
          image_url: data.image_url || null,
          owner_id: userId,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // Add creator as admin
      const { error: memberError } = await supabase.from("group_members").insert({
        group_id: group.id,
        user_id: userId,
        role: "admin" as MemberRole,
      });

      if (memberError) throw memberError;

      // Refresh groups
      await fetchGroups();

      return { data: group };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to create group" };
    }
  };

  const updateGroup = async (
    groupId: string,
    data: Partial<Pick<Group, "name" | "description" | "image_url">>
  ) => {
    try {
      const { data: group, error } = await supabase
        .from("groups")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", groupId)
        .select()
        .single();

      if (error) throw error;

      await fetchGroups();
      return { data: group };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to update group" };
    }
  };

  const deleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase.from("groups").delete().eq("id", groupId);

      if (error) throw error;

      await fetchGroups();
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to delete group" };
    }
  };

  const fetchGroupDetails = useCallback(async (groupId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { data: group, error } = await supabase
        .from("groups")
        .select(`
          *,
          group_members(*, users(*)),
          subgroups(*)
        `)
        .eq("id", groupId)
        .single();

      if (error) throw error;

      const groupWithDetails: GroupWithMembers = {
        ...group,
        members: group.group_members?.map((m: Record<string, unknown>) => ({
          ...m,
          user: (m.users as Record<string, unknown>) ?? undefined,
        })) as GroupWithMembers["members"],
        subgroups: group.subgroups || [],
        memberCount: group.group_members?.length || 0,
      };

      setState((prev) => ({ ...prev, currentGroup: groupWithDetails, isLoading: false }));
      return { data: groupWithDetails };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch group details";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, []);

  const createSubgroup = async (groupId: string, data: { name: string; type?: string }) => {
    try {
      const { data: subgroup, error } = await supabase
        .from("subgroups")
        .insert({
          group_id: groupId,
          name: data.name,
          type: data.type || null,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchGroupDetails(groupId);
      return { data: subgroup };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to create subgroup" };
    }
  };

  const inviteMember = async (groupId: string, email: string, role: MemberRole = "player") => {
    try {
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

      const { data: invitation, error } = await supabase
        .from("group_invitations")
        .insert({
          group_id: groupId,
          email,
          role,
          token,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { data: invitation };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to send invitation" };
    }
  };

  const updateMemberRole = async (groupId: string, memberId: string, role: MemberRole) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .update({ role })
        .eq("group_id", groupId)
        .eq("user_id", memberId);

      if (error) throw error;

      await fetchGroupDetails(groupId);
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to update role" };
    }
  };

  const removeMember = async (groupId: string, memberId: string) => {
    try {
      const { error } = await supabase
        .from("group_members")
        .delete()
        .eq("group_id", groupId)
        .eq("user_id", memberId);

      if (error) throw error;

      await fetchGroupDetails(groupId);
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to remove member" };
    }
  };

  return {
    ...state,
    fetchGroups,
    createGroup,
    updateGroup,
    deleteGroup,
    fetchGroupDetails,
    createSubgroup,
    inviteMember,
    updateMemberRole,
    removeMember,
  };
}

