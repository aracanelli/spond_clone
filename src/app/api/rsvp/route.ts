import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/client";

// Force dynamic rendering since we use request.url
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");
    const response = searchParams.get("response");
    const eventId = searchParams.get("event");

    // If only token is provided, redirect to the RSVP page for user to choose
    if (token && !response) {
      const redirectUrl = new URL("/rsvp", process.env.NEXT_PUBLIC_APP_URL || request.url);
      redirectUrl.searchParams.set("token", token);
      if (eventId) redirectUrl.searchParams.set("event", eventId);
      return NextResponse.redirect(redirectUrl);
    }

    // Validate required parameters for direct RSVP
    if (!token || !response) {
      return NextResponse.json({ 
        error: "Missing required parameters",
        details: "Token and response are required" 
      }, { status: 400 });
    }

    if (response !== "yes" && response !== "no") {
      return NextResponse.json({ 
        error: "Invalid response",
        details: "Response must be 'yes' or 'no'" 
      }, { status: 400 });
    }

    const supabase = createServerClient();

    // Find the attendee by token (can work with or without eventId)
    let query = supabase
      .from("event_attendees")
      .select("*, events(*)")
      .eq("rsvp_token", token);
    
    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { data: attendee, error: findError } = await query.single();

    if (findError || !attendee) {
      return NextResponse.json({ 
        error: "Invalid or expired link",
        details: "The RSVP token is invalid or has already been used"
      }, { status: 404 });
    }

    // Check if event has passed
    const eventData = attendee.events as { start_time?: string; title?: string } | null;
    if (eventData?.start_time) {
      const eventDate = new Date(eventData.start_time);
      if (eventDate < new Date()) {
        return NextResponse.json({ 
          error: "Event has passed",
          details: "This event has already taken place"
        }, { status: 410 });
      }
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
      console.error("RSVP update error:", updateError);
      return NextResponse.json({ 
        error: "Failed to update RSVP",
        details: "Database error while updating attendance"
      }, { status: 500 });
    }

    // Redirect to confirmation page
    const redirectUrl = new URL("/rsvp/confirm", process.env.NEXT_PUBLIC_APP_URL || request.url);
    redirectUrl.searchParams.set("event", attendee.event_id);
    redirectUrl.searchParams.set("response", response);
    redirectUrl.searchParams.set("title", eventData?.title || "Event");

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("RSVP error:", error);
    return NextResponse.json({ 
      error: "An error occurred",
      details: "An unexpected error occurred while processing your RSVP"
    }, { status: 500 });
  }
}

// POST endpoint for RSVP updates from the frontend
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, response } = body;

    if (!token || !response) {
      return NextResponse.json({ 
        error: "Missing required parameters",
        details: "Token and response are required"
      }, { status: 400 });
    }

    if (response !== "yes" && response !== "no") {
      return NextResponse.json({ 
        error: "Invalid response",
        details: "Response must be 'yes' or 'no'"
      }, { status: 400 });
    }

    const supabase = createServerClient();

    // Find the attendee by token
    const { data: attendee, error: findError } = await supabase
      .from("event_attendees")
      .select("*, events(*)")
      .eq("rsvp_token", token)
      .single();

    if (findError || !attendee) {
      return NextResponse.json({ 
        error: "Invalid or expired link",
        details: "The RSVP token is invalid or has already been used"
      }, { status: 404 });
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
      return NextResponse.json({ 
        error: "Failed to update RSVP",
        details: "Database error while updating attendance"
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      message: `RSVP updated to ${response}`
    });
  } catch (error) {
    console.error("RSVP POST error:", error);
    return NextResponse.json({ 
      error: "An error occurred",
      details: "An unexpected error occurred while processing your RSVP"
    }, { status: 500 });
  }
}



