import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createServerClient } from "@/lib/supabase/client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Configure web-push
webpush.setVapidDetails(
  `mailto:admin@${process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, "") || "example.com"}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("id, subscription_json")
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching subscriptions:", error);
      return NextResponse.json({ error: "Failed to fetch subscriptions" }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: "No push subscriptions found" }, { status: 404 });
    }

    // Send test notification to all subscriptions
    const payload = JSON.stringify({
      title: "Test Notification",
      body: "This is a test notification from Spond!",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: "test-notification",
      data: {
        url: "/notifications",
      },
    });

    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(sub.subscription_json as unknown as webpush.PushSubscription, payload);
          return { success: true };
        } catch (err) {
          // If subscription is invalid, remove it
          if ((err as { statusCode?: number }).statusCode === 410) {
            await supabase
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
          }
          throw err;
        }
      })
    );

    const successCount = results.filter((r) => r.status === "fulfilled").length;

    return NextResponse.json({
      success: true,
      sent: successCount,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error("Error sending test notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}

