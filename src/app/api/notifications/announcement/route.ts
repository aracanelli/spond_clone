import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { Resend } from "resend";
import { createServerClient } from "@/lib/supabase/client";
import { buildEmailToSMS } from "@/lib/utils";

// Configure web-push
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:admin@${process.env.NEXT_PUBLIC_APP_URL?.replace(/https?:\/\//, "") || "example.com"}`,
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { announcementId, groupId, subgroupId } = await request.json();

    if (!announcementId || !groupId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Get announcement details
    const { data: announcement, error: announcementError } = await supabase
      .from("announcements")
      .select("*, groups(*)")
      .eq("id", announcementId)
      .single();

    if (announcementError || !announcement) {
      return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
    }

    // Get group members (filtered by subgroup if specified)
    let memberQuery = supabase
      .from("group_members")
      .select("user_id")
      .eq("group_id", groupId);

    if (subgroupId) {
      const { data: subgroupMembers } = await supabase
        .from("subgroup_members")
        .select("user_id")
        .eq("subgroup_id", subgroupId);

      if (subgroupMembers && subgroupMembers.length > 0) {
        memberQuery = memberQuery.in(
          "user_id",
          subgroupMembers.map((m) => m.user_id)
        );
      }
    }

    const { data: members } = await memberQuery;

    if (!members || members.length === 0) {
      return NextResponse.json({ error: "No members to notify" }, { status: 400 });
    }

    const userIds = members.map((m) => m.user_id);

    // Get user preferences and details
    const { data: users } = await supabase
      .from("users")
      .select("*, user_preferences(*)")
      .in("id", userIds);

    if (!users) {
      return NextResponse.json({ error: "No users found" }, { status: 400 });
    }

    const results = {
      email: { sent: 0, failed: 0 },
      push: { sent: 0, failed: 0 },
      sms: { sent: 0, failed: 0 },
    };

    for (const user of users) {
      const prefs = user.user_preferences?.[0];

      // Send Email
      if (prefs?.allow_email !== false && user.email) {
        try {
          await resend.emails.send({
            from: "Spond <notifications@resend.dev>",
            to: user.email,
            subject: `📢 ${announcement.title} - ${announcement.groups?.name}`,
            html: `
              <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0d9488;">${announcement.title}</h2>
                <p style="color: #666; font-size: 14px;">From ${announcement.groups?.name}</p>
                <div style="padding: 20px; background: #f9fafb; border-radius: 8px; margin: 20px 0;">
                  <p style="white-space: pre-wrap;">${announcement.content}</p>
                </div>
                <p style="color: #999; font-size: 12px;">
                  You received this because you're a member of ${announcement.groups?.name}.
                </p>
              </div>
            `,
          });
          results.email.sent++;
        } catch {
          results.email.failed++;
        }
      }

      // Send Push Notification
      if (prefs?.allow_push) {
        const { data: subscriptions } = await supabase
          .from("push_subscriptions")
          .select("subscription_json")
          .eq("user_id", user.id);

        if (subscriptions) {
          for (const sub of subscriptions) {
            try {
              await webpush.sendNotification(
                sub.subscription_json as unknown as webpush.PushSubscription,
                JSON.stringify({
                  title: `📢 ${announcement.title}`,
                  body: announcement.content.substring(0, 100) + (announcement.content.length > 100 ? "..." : ""),
                  icon: "/icon-192.png",
                  badge: "/icon-192.png",
                  tag: `announcement-${announcementId}`,
                  data: {
                    url: `/announcements`,
                  },
                })
              );
              results.push.sent++;
            } catch {
              results.push.failed++;
            }
          }
        }
      }

      // Send SMS via Email Gateway
      if (prefs?.allow_sms && prefs?.phone_number && prefs?.carrier) {
        const smsEmail = buildEmailToSMS(prefs.phone_number, prefs.carrier);
        if (smsEmail) {
          try {
            await resend.emails.send({
              from: "Spond <notifications@resend.dev>",
              to: smsEmail,
              subject: "",
              text: `${announcement.groups?.name}: ${announcement.title}\n\n${announcement.content.substring(0, 140)}`,
            });
            results.sms.sent++;
          } catch {
            results.sms.failed++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Error sending announcement notifications:", error);
    return NextResponse.json({ error: "Failed to send notifications" }, { status: 500 });
  }
}

