"use client";

import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, X, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function RSVPConfirmPage() {
  const searchParams = useSearchParams();
  const response = searchParams.get("response");
  const title = searchParams.get("title");
  const eventId = searchParams.get("event");

  const isYes = response === "yes";

  return (
    <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="overflow-hidden">
          <div
            className={`h-2 ${
              isYes
                ? "bg-gradient-to-r from-success to-primary"
                : "bg-gradient-to-r from-destructive to-secondary"
            }`}
          />
          <CardContent className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${
                isYes ? "bg-success/10" : "bg-destructive/10"
              }`}
            >
              {isYes ? (
                <Check className="w-10 h-10 text-success" />
              ) : (
                <X className="w-10 h-10 text-destructive" />
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h1 className="text-2xl font-display font-bold mb-2">
                {isYes ? "You're Going!" : "RSVP Updated"}
              </h1>
              <p className="text-muted-foreground mb-6">
                {isYes
                  ? `We've marked you as attending "${title}". See you there!`
                  : `Thanks for letting us know you can't make it to "${title}".`}
              </p>

              <div className="flex flex-col gap-3">
                {eventId && (
                  <Link href={`/events/${eventId}`}>
                    <Button variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Event Details
                    </Button>
                  </Link>
                )}
                <Link href="/dashboard">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Changed your mind?{" "}
          <Link href={`/events/${eventId}`} className="text-primary hover:underline">
            Update your RSVP
          </Link>
        </p>
      </motion.div>
    </div>
  );
}





