"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { supabase } from "@/lib/supabase/client";
import type { User, UserPreferences } from "@/models/database.types";

interface UserState {
  user: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  error: string | null;
  needsOnboarding: boolean;
}

export function useUserViewModel() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const [state, setState] = useState<UserState>({
    user: null,
    preferences: null,
    isLoading: true,
    error: null,
    needsOnboarding: false,
  });

  const syncUser = useCallback(async () => {
    if (!clerkUser) {
      setState((prev) => ({ ...prev, isLoading: false, user: null }));
      return;
    }

    try {
      // Check if user exists in Supabase
      const { data: existingUser, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("clerk_id", clerkUser.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      let user = existingUser;

      // Create user if doesn't exist
      if (!existingUser) {
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert({
            clerk_id: clerkUser.id,
            email: clerkUser.primaryEmailAddress?.emailAddress || "",
            full_name: clerkUser.fullName,
            avatar_url: clerkUser.imageUrl,
          })
          .select()
          .single();

        if (createError) throw createError;
        user = newUser;
      }

      if (!user) {
        throw new Error("Failed to get or create user");
      }

      // Fetch preferences
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("id, user_id, phone_number, carrier, allow_sms, allow_push, allow_email, created_at, updated_at")
        .eq("user_id", user.id)
        .single();

      // Check if onboarding is needed (no preferences, or SMS enabled but no phone/carrier)
      const needsOnboarding = !preferences || (preferences.allow_sms && (!preferences.phone_number || !preferences.carrier));

      setState({
        user,
        preferences,
        isLoading: false,
        error: null,
        needsOnboarding,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "An error occurred",
      }));
    }
  }, [clerkUser]);

  useEffect(() => {
    if (clerkLoaded) {
      syncUser();
    }
  }, [clerkLoaded, syncUser]);

  const updatePreferences = async (
    updates: Partial<Omit<UserPreferences, "id" | "user_id" | "created_at" | "updated_at">>
  ) => {
    if (!state.user) return { error: "No user found" };

    try {
      console.log("Updating preferences for user:", state.user.id, "Updates:", updates);
      if (state.preferences) {
        console.log("Updating existing preferences record");
        // Update existing preferences
        const { data, error } = await supabase
          .from("user_preferences")
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq("user_id", state.user.id)
          .select()
          .single();

        console.log("Supabase update result:", { data: JSON.stringify(data), error });

        if (error) throw error;
        setState((prev) => ({ ...prev, preferences: data, needsOnboarding: false }));
        return { data };
      } else {
        // Create new preferences
        const { data, error } = await supabase
          .from("user_preferences")
          .insert({
            user_id: state.user.id,
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        setState((prev) => ({ ...prev, preferences: data, needsOnboarding: false }));
        return { data };
      }
    } catch (error) {
      console.error("Error in updatePreferences:", error);
      return { error: error instanceof Error ? error.message : "Failed to update preferences" };
    }
  };

  const completeOnboarding = async (phoneNumber: string, carrier: string, allowSms: boolean) => {
    return updatePreferences({
      phone_number: phoneNumber,
      carrier,
      allow_sms: allowSms,
      allow_push: true,
      allow_email: true,
    });
  };

  return {
    ...state,
    clerkUser,
    syncUser,
    updatePreferences,
    completeOnboarding,
  };
}

