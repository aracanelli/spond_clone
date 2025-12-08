"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Loader2, AlertCircle, CheckCircle, XCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";

type RSVPState = "loading" | "invalid" | "expired" | "success" | "error" | "choose";

interface EventDetails {
  id: string;
  title: string;
  start_time: string;
  location?: string;
}

export default function RSVPPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const directResponse = searchParams.get("response");
  
  const [state, setState] = useState<RSVPState>("loading");
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [attendeeId, setAttendeeId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRSVP = useCallback(async (response: "yes" | "no", id?: string) => {
    setIsSubmitting(true);
    
    try {
      const { error } = await supabase
        .from("event_attendees")
        .update({
          rsvp: response,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id || attendeeId!);

      if (error) {
        setState("error");
        setErrorMessage("Failed to update your RSVP. Please try again.");
        return;
      }

      // Redirect to confirmation page
      router.push(`/rsvp/confirm?event=${event?.id}&response=${response}&title=${encodeURIComponent(event?.title || "Event")}`);
    } catch (err) {
      console.error("RSVP submission error:", err);
      setState("error");
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }, [attendeeId, event, router]);

  useEffect(() => {
    const validateToken = async () => {
      // If no token provided, show error
      if (!token) {
        setState("invalid");
        setErrorMessage("No RSVP token provided. Please use the link from your email.");
        return;
      }

      try {
        // Find the attendee by token
        const { data: attendee, error } = await supabase
          .from("event_attendees")
          .select(`
            id,
            rsvp,
            rsvp_token,
            event_id,
            events (
              id,
              title,
              start_time,
              location
            )
          `)
          .eq("rsvp_token", token)
          .single();

        if (error || !attendee) {
          setState("invalid");
          setErrorMessage("This RSVP link is invalid or has already been used. Please contact the event organizer.");
          return;
        }

        // Check if event exists
        const eventData = attendee.events as unknown as EventDetails;
        if (!eventData) {
          setState("invalid");
          setErrorMessage("The event associated with this RSVP no longer exists.");
          return;
        }

        // Check if event has already passed (expired)
        const eventDate = new Date(eventData.start_time);
        if (eventDate < new Date()) {
          setState("expired");
          setErrorMessage(`This event "${eventData.title}" has already taken place.`);
          setEvent(eventData);
          return;
        }

        setEvent(eventData);
        setAttendeeId(attendee.id);

        // If response is provided directly in URL (from email link), process it
        if (directResponse === "yes" || directResponse === "no") {
          setIsSubmitting(true);
          const { error: updateError } = await supabase
            .from("event_attendees")
            .update({
              rsvp: directResponse,
              updated_at: new Date().toISOString(),
            })
            .eq("id", attendee.id);

          if (updateError) {
            setState("error");
            setErrorMessage("Failed to update your RSVP. Please try again.");
            setIsSubmitting(false);
            return;
          }

          // Redirect to confirmation page
          router.push(`/rsvp/confirm?event=${eventData.id}&response=${directResponse}&title=${encodeURIComponent(eventData.title || "Event")}`);
        } else {
          // Show choice UI
          setState("choose");
        }
      } catch (err) {
        console.error("RSVP validation error:", err);
        setState("error");
        setErrorMessage("An unexpected error occurred. Please try again later.");
      }
    };

    validateToken();
  }, [token, directResponse, router]);

  // Loading state
  if (state === "loading") {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primary" />
            <h2 className="text-xl font-semibold mb-2">Validating your RSVP link...</h2>
            <p className="text-muted-foreground">Please wait a moment.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token state
  if (state === "invalid") {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-destructive to-secondary" />
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-destructive/10">
                <AlertCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2">Invalid RSVP Link</h1>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <Link href="/">
                <Button className="w-full">Go to Home</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Expired event state
  if (state === "expired") {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-warning to-secondary" />
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-warning/10">
                <Calendar className="w-10 h-10 text-warning" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2">Event Has Passed</h1>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <Link href="/dashboard">
                <Button className="w-full">Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-destructive to-secondary" />
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-destructive/10">
                <XCircle className="w-10 h-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-display font-bold mb-2">Something Went Wrong</h1>
              <p className="text-muted-foreground mb-6">{errorMessage}</p>
              <Button onClick={() => window.location.reload()} className="w-full">
                Try Again
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Choose response state
  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-primary to-accent" />
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-primary/10">
              <Calendar className="w-10 h-10 text-primary" />
            </div>
            
            <h1 className="text-2xl font-display font-bold mb-2">RSVP to Event</h1>
            {event && (
              <div className="mb-6">
                <p className="text-lg font-semibold text-foreground">{event.title}</p>
                <p className="text-muted-foreground">
                  {new Date(event.start_time).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                {event.location && (
                  <p className="text-muted-foreground text-sm mt-1">{event.location}</p>
                )}
              </div>
            )}

            <p className="text-muted-foreground mb-6">Will you be attending?</p>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleRSVP("no")}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="w-4 h-4 mr-2" />
                )}
                Can&apos;t Make It
              </Button>
              <Button
                className="flex-1 bg-success hover:bg-success/90"
                onClick={() => handleRSVP("yes")}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                I&apos;ll Be There!
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
