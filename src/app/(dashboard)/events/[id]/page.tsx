"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  ArrowLeft,
  Check,
  X,
  Share2,
  Edit,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserViewModel } from "@/viewmodels/useUserViewModel";
import { useEventsViewModel } from "@/viewmodels/useEventsViewModel";
import { formatDate, formatTime } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const { user, isLoading: userLoading } = useUserViewModel();
  const { currentEvent, fetchEventDetails, updateRSVP, deleteEvent, isLoading, error } =
    useEventsViewModel(user?.id);

  useEffect(() => {
    if (eventId && user?.id) {
      fetchEventDetails(eventId);
    }
  }, [eventId, user?.id, fetchEventDetails]);

  const handleRSVP = async (response: "yes" | "no") => {
    const result = await updateRSVP(eventId, response);
    if (result.success) {
      toast({
        title: response === "yes" ? "You're going!" : "RSVP Updated",
        description:
          response === "yes"
            ? "We'll send you a reminder before the event."
            : "Thanks for letting us know.",
        variant: "success",
      });
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/events/${eventId}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: currentEvent?.title,
          text: `Check out this event: ${currentEvent?.title}`,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Link Copied",
          description: "Event link copied to clipboard",
        });
      }
    } catch {
      // User cancelled share
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    const result = await deleteEvent(eventId);
    if (result.success) {
      toast({
        title: "Event Deleted",
        description: "The event has been deleted.",
      });
      router.push("/events");
    }
  };

  // Show loading while user is authenticating OR while event data is being fetched
  if (isLoading || userLoading) {
    return (
      <div className="min-h-screen">
        <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 animate-pulse" />
        <div className="p-4 lg:p-8 space-y-4">
          <div className="h-8 bg-muted rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-muted rounded w-1/2 animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !currentEvent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 bg-card p-8 rounded-xl border shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Event Not Found</h1>
          <p className="text-muted-foreground">
            The event you are looking for does not exist or has been deleted.
          </p>
          <div className="pt-4">
            <Link href="/events">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userAttendee = currentEvent.attendees?.find((a) => a.user_id === user?.id);
  const userRsvp = userAttendee?.rsvp;
  const isCreator = currentEvent.creator_id === user?.id;
  const isPast = new Date(currentEvent.start_time) < new Date();

  const yesAttendees = currentEvent.attendees?.filter((a) => a.rsvp === "yes") || [];
  const noAttendees = currentEvent.attendees?.filter((a) => a.rsvp === "no") || [];
  const pendingAttendees = currentEvent.attendees?.filter((a) => a.rsvp === "pending") || [];

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative h-48 lg:h-56 bg-gradient-to-br from-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Link href="/events">
            <Button variant="secondary" size="icon" className="rounded-full">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Date badge */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-card/90 backdrop-blur rounded-xl p-3 text-center shadow-lg">
            <div className="text-2xl font-bold text-primary">
              {new Date(currentEvent.start_time).getDate()}
            </div>
            <div className="text-xs text-muted-foreground uppercase">
              {new Date(currentEvent.start_time).toLocaleDateString("en-US", {
                month: "short",
              })}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-2">
              {currentEvent.group && (
                <Badge variant="secondary">{currentEvent.group.name}</Badge>
              )}
              {isPast && <Badge variant="outline">Past Event</Badge>}
            </div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-white">
              {currentEvent.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="px-4 lg:px-8 py-3">
          {!isPast ? (
            <div className="flex items-center gap-2">
              <Button
                variant={userRsvp === "yes" ? "default" : "outline"}
                className="flex-1 sm:flex-none"
                onClick={() => handleRSVP("yes")}
              >
                <Check className="w-4 h-4 mr-2" />
                Going
              </Button>
              <Button
                variant={userRsvp === "no" ? "destructive" : "outline"}
                className="flex-1 sm:flex-none"
                onClick={() => handleRSVP("no")}
              >
                <X className="w-4 h-4 mr-2" />
                Can&apos;t Go
              </Button>
              <div className="hidden sm:flex items-center gap-2 ml-auto">
                <Button variant="ghost" size="icon" onClick={handleShare}>
                  <Share2 className="w-4 h-4" />
                </Button>
                {isCreator && (
                  <>
                    <Link href={`/events/${eventId}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={handleDelete}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">This event has ended</p>
              <Button variant="ghost" size="sm" onClick={handleShare}>
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-8 max-w-4xl mx-auto">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Details */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{formatDate(currentEvent.start_time)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(currentEvent.start_time)} - {formatTime(currentEvent.end_time)}
                    </p>
                  </div>
                </div>

                {currentEvent.location && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{currentEvent.location}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-sm text-muted-foreground">
                      {currentEvent.yesCount} going
                      {currentEvent.participant_limit &&
                        ` · ${currentEvent.participant_limit - (currentEvent.yesCount || 0)} spots left`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {currentEvent.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {currentEvent.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Attendees */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Responses</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="going">
                  <TabsList className="w-full">
                    <TabsTrigger value="going" className="flex-1">
                      Going ({yesAttendees.length})
                    </TabsTrigger>
                    <TabsTrigger value="not-going" className="flex-1">
                      Not Going ({noAttendees.length})
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="flex-1">
                      Pending ({pendingAttendees.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="going" className="mt-4">
                    {yesAttendees.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No one has confirmed yet
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {yesAttendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={attendee.user?.avatar_url || undefined} />
                              <AvatarFallback>
                                {attendee.user?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {attendee.user?.full_name || "Unknown"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="not-going" className="mt-4">
                    {noAttendees.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        No one has declined
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {noAttendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={attendee.user?.avatar_url || undefined} />
                              <AvatarFallback>
                                {attendee.user?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {attendee.user?.full_name || "Unknown"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="mt-4">
                    {pendingAttendees.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">
                        Everyone has responded
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {pendingAttendees.map((attendee) => (
                          <div
                            key={attendee.id}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted"
                          >
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={attendee.user?.avatar_url || undefined} />
                              <AvatarFallback>
                                {attendee.user?.full_name?.charAt(0) || "U"}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">
                              {attendee.user?.full_name || "Unknown"}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Organizer */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={currentEvent.creator?.avatar_url || undefined} />
                    <AvatarFallback>
                      {currentEvent.creator?.full_name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {currentEvent.creator?.full_name || "Unknown"}
                    </p>
                    <p className="text-xs text-muted-foreground">Event Creator</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Going</span>
                    <Badge variant="success">{yesAttendees.length}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Not Going</span>
                    <Badge variant="destructive">{noAttendees.length}</Badge>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Pending</span>
                    <Badge variant="pending">{pendingAttendees.length}</Badge>
                  </div>
                  {currentEvent.participant_limit && (
                    <>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Capacity</span>
                        <span className="font-medium">
                          {yesAttendees.length}/{currentEvent.participant_limit}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}



