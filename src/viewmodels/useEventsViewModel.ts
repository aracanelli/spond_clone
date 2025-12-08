"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Event, EventWithDetails, RSVPStatus } from "@/models/database.types";

interface EventsState {
  events: EventWithDetails[];
  currentEvent: EventWithDetails | null;
  upcomingEvents: EventWithDetails[];
  isLoading: boolean;
  error: string | null;
}

interface CreateEventData {
  group_id: string;
  subgroup_id?: string | null;
  title: string;
  description?: string;
  location?: string;
  start_time: string;
  end_time: string;
  is_recurring?: boolean;
  recurring_rule?: string;
  participant_limit?: number | null;
}

export function useEventsViewModel(userId?: string, groupId?: string) {
  const [state, setState] = useState<EventsState>({
    events: [],
    currentEvent: null,
    upcomingEvents: [],
    isLoading: true,
    error: null,
  });

  const fetchEvents = useCallback(async () => {
    if (!userId) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      // Get user's groups first
      const { data: memberships } = await supabase
        .from("group_members")
        .select("group_id")
        .eq("user_id", userId);

      const groupIds = memberships?.map((m) => m.group_id) || [];

      if (groupIds.length === 0) {
        setState({ events: [], currentEvent: null, upcomingEvents: [], isLoading: false, error: null });
        return;
      }

      let query = supabase
        .from("events")
        .select(`
          *,
          groups(*),
          subgroups(*),
          users!events_creator_id_fkey(*),
          event_attendees(*, users(*))
        `)
        .in("group_id", groupIds)
        .order("start_time", { ascending: true });

      if (groupId) {
        query = query.eq("group_id", groupId);
      }

      const { data: events, error } = await query;

      if (error) throw error;

      const eventsWithDetails: EventWithDetails[] = (events || []).map((e) => ({
        ...e,
        group: e.groups ?? undefined,
        subgroup: e.subgroups ?? undefined,
        creator: e.users ?? undefined,
        attendees: e.event_attendees?.map((a: Record<string, unknown>) => ({
          ...a,
          user: (a.users as Record<string, unknown>) ?? undefined,
        })) as EventWithDetails["attendees"],
        yesCount: e.event_attendees?.filter((a: { rsvp: string }) => a.rsvp === "yes").length || 0,
        noCount: e.event_attendees?.filter((a: { rsvp: string }) => a.rsvp === "no").length || 0,
        pendingCount: e.event_attendees?.filter((a: { rsvp: string }) => a.rsvp === "pending").length || 0,
      }));

      const now = new Date();
      const upcoming = eventsWithDetails.filter((e) => new Date(e.start_time) > now);

      setState((prev) => ({
        ...prev,
        events: eventsWithDetails,
        upcomingEvents: upcoming,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to fetch events",
      }));
    }
  }, [userId, groupId]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const createEvent = async (data: CreateEventData) => {
    if (!userId) return { error: "Not authenticated" };

    try {
      const { data: event, error: eventError } = await supabase
        .from("events")
        .insert({
          ...data,
          creator_id: userId,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Get all group members to create attendee records
      const { data: members } = await supabase
        .from("group_members")
        .select("user_id")
        .eq("group_id", data.group_id);

      if (members && members.length > 0) {
        const attendees = members.map((m) => ({
          event_id: event.id,
          user_id: m.user_id,
          rsvp: "pending" as RSVPStatus,
          rsvp_token: crypto.randomUUID(),
        }));

        await supabase.from("event_attendees").insert(attendees);
      }

      await fetchEvents();
      return { data: event };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to create event" };
    }
  };

  const updateEvent = async (
    eventId: string,
    data: Partial<Omit<CreateEventData, "group_id" | "creator_id">>
  ) => {
    try {
      const { data: event, error } = await supabase
        .from("events")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", eventId)
        .select()
        .single();

      if (error) throw error;

      await fetchEvents();
      return { data: event };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to update event" };
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId);

      if (error) throw error;

      await fetchEvents();
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to delete event" };
    }
  };

  const fetchEventDetails = useCallback(async (eventId: string) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { data: event, error } = await supabase
        .from("events")
        .select(`
          *,
          groups(*),
          subgroups(*),
          users!events_creator_id_fkey(*),
          event_attendees(*, users(*))
        `)
        .eq("id", eventId)
        .single();

      if (error) throw error;

      const eventWithDetails: EventWithDetails = {
        ...event,
        group: event.groups ?? undefined,
        subgroup: event.subgroups ?? undefined,
        creator: event.users ?? undefined,
        attendees: event.event_attendees?.map((a: Record<string, unknown>) => ({
          ...a,
          user: (a.users as Record<string, unknown>) ?? undefined,
        })) as EventWithDetails["attendees"],
        yesCount: event.event_attendees?.filter((a: { rsvp: string }) => a.rsvp === "yes").length || 0,
        noCount: event.event_attendees?.filter((a: { rsvp: string }) => a.rsvp === "no").length || 0,
        pendingCount: event.event_attendees?.filter((a: { rsvp: string }) => a.rsvp === "pending").length || 0,
      };

      setState((prev) => ({ ...prev, currentEvent: eventWithDetails, isLoading: false }));
      return { data: eventWithDetails };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch event details";
      setState((prev) => ({ ...prev, isLoading: false, error: errorMessage }));
      return { error: errorMessage };
    }
  }, []);

  const updateRSVP = async (eventId: string, response: RSVPStatus) => {
    if (!userId) return { error: "Not authenticated" };

    try {
      const { error } = await supabase
        .from("event_attendees")
        .update({ rsvp: response, updated_at: new Date().toISOString() })
        .eq("event_id", eventId)
        .eq("user_id", userId);

      if (error) throw error;

      await fetchEventDetails(eventId);
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to update RSVP" };
    }
  };

  const getUserRSVP = (eventId: string): RSVPStatus | null => {
    const event = state.events.find((e) => e.id === eventId);
    if (!event || !userId) return null;

    const attendee = event.attendees?.find((a) => a.user_id === userId);
    return attendee?.rsvp || null;
  };

  return {
    ...state,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    fetchEventDetails,
    updateRSVP,
    getUserRSVP,
  };
}

