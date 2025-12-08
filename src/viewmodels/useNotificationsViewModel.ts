"use client";

import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase/client";

interface NotificationState {
  isPushSupported: boolean;
  isPushEnabled: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useNotificationsViewModel(userId?: string) {
  const [state, setState] = useState<NotificationState>({
    isPushSupported: false,
    isPushEnabled: false,
    isLoading: true,
    error: null,
  });

  const checkPushSupport = useCallback(async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState((prev) => ({ ...prev, isPushSupported: false, isLoading: false }));
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      setState({
        isPushSupported: true,
        isPushEnabled: !!subscription,
        isLoading: false,
        error: null,
      });
    } catch {
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }, []);

  const subscribeToPush = async () => {
    if (!userId || !state.isPushSupported) {
      return { error: "Push not supported or user not authenticated" };
    }

    try {
      const registration = await navigator.serviceWorker.ready;

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      // Save subscription to database
      const subscriptionJson = subscription.toJSON();
      const { error } = await supabase.from("push_subscriptions").insert({
        user_id: userId,
        subscription_json: JSON.parse(JSON.stringify(subscriptionJson)),
      });

      if (error) throw error;

      setState((prev) => ({ ...prev, isPushEnabled: true }));
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to subscribe to push";
      setState((prev) => ({ ...prev, error: message }));
      return { error: message };
    }
  };

  const unsubscribeFromPush = async () => {
    if (!userId) return { error: "User not authenticated" };

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Remove from database
      await supabase.from("push_subscriptions").delete().eq("user_id", userId);

      setState((prev) => ({ ...prev, isPushEnabled: false }));
      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to unsubscribe" };
    }
  };

  const sendTestNotification = async () => {
    if (!userId) return { error: "User not authenticated" };

    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) throw new Error("Failed to send test notification");

      return { success: true };
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Failed to send test notification" };
    }
  };

  return {
    ...state,
    checkPushSupport,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  };
}

