import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("event");
    const token = searchParams.get("token");
    const response = searchParams.get("response");

    if (!eventId || !token || !response) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (response !== "yes" && response !== "no") {
      return NextResponse.json({ error: "Invalid response" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Find the attendee by token
    const { data: attendee, error: findError } = await supabase
      .from("event_attendees")
      .select("*, events(*)")
      .eq("event_id", eventId)
      .eq("rsvp_token", token)
      .single();

    if (findError || !attendee) {
      return NextResponse.json({ error: "Invalid or expired link" }, { status: 404 });
    }

    // Update RSVP
    const { error: updateError } = await supabase
      .from("event_attendees")
      .update({
        rsvp: response,
        updated_at: new Date().toISOString(),
      })
      .eq("id", attendee.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to update RSVP" }, { status: 500 });
    }

    // Redirect to confirmation page
    const redirectUrl = new URL(`/rsvp/confirm`, process.env.NEXT_PUBLIC_APP_URL);
    redirectUrl.searchParams.set("event", eventId);
    redirectUrl.searchParams.set("response", response);
    redirectUrl.searchParams.set("title", attendee.events?.title || "Event");

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}



