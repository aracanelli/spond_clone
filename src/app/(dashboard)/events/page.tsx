"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Calendar, Search, Clock, MapPin, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserViewModel } from "@/viewmodels/useUserViewModel";
import { useEventsViewModel } from "@/viewmodels/useEventsViewModel";
import { formatDate, formatTime } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function EventsPage() {
  const { user } = useUserViewModel();
  const { events, upcomingEvents, isLoading, getUserRSVP, updateRSVP } = useEventsViewModel(user?.id);
  const [searchQuery, setSearchQuery] = useState("");

  const pastEvents = events.filter((e) => new Date(e.start_time) < new Date());

  const filteredUpcoming = upcomingEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredPast = pastEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRSVP = async (eventId: string, response: "yes" | "no") => {
    await updateRSVP(eventId, response);
  };

  const renderEventCard = (event: typeof events[0]) => {
    const userRsvp = getUserRSVP(event.id);
    const isPast = new Date(event.start_time) < new Date();

    return (
      <motion.div key={event.id} variants={itemVariants}>
        <Card className={`hover:shadow-lg transition-all ${isPast ? "opacity-75" : ""}`}>
          <CardContent className="p-0">
            <div className="flex flex-col lg:flex-row">
              {/* Date badge */}
              <div className="lg:w-24 lg:shrink-0 p-4 lg:p-6 flex lg:flex-col items-center lg:items-center justify-between lg:justify-center gap-2 bg-gradient-to-br from-primary/10 to-secondary/10 lg:rounded-l-xl">
                <div className="text-center">
                  <div className="text-2xl lg:text-3xl font-bold text-primary">
                    {new Date(event.start_time).getDate()}
                  </div>
                  <div className="text-xs text-muted-foreground uppercase">
                    {new Date(event.start_time).toLocaleDateString("en-US", { month: "short" })}
                  </div>
                </div>
                <div className="lg:hidden flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  {formatTime(event.start_time)}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-4 lg:p-6">
                <Link href={`/events/${event.id}`}>
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors">
                    {event.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  <div className="hidden lg:flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {formatTime(event.start_time)}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span className="truncate max-w-[200px]">{event.location}</span>
                    </div>
                  )}
                  {event.group && (
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {event.group.name}
                    </div>
                  )}
                </div>

                {event.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {event.description}
                  </p>
                )}

                {/* RSVP section */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="success" className="gap-1">
                      {event.yesCount} Yes
                    </Badge>
                    <Badge variant="destructive" className="gap-1">
                      {event.noCount} No
                    </Badge>
                    <Badge variant="pending" className="gap-1">
                      {event.pendingCount} Pending
                    </Badge>
                  </div>

                  {!isPast && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={userRsvp === "yes" ? "default" : "outline"}
                        onClick={() => handleRSVP(event.id, "yes")}
                        className="h-8"
                      >
                        Going
                      </Button>
                      <Button
                        size="sm"
                        variant={userRsvp === "no" ? "destructive" : "outline"}
                        onClick={() => handleRSVP(event.id, "no")}
                        className="h-8"
                      >
                        Can&apos;t Go
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Events</h1>
              <p className="text-muted-foreground text-sm">
                View and manage your events
              </p>
            </div>
            <Link href="/events/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </Link>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 lg:p-8">
        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({filteredUpcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({filteredPast.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="w-20 h-20 bg-muted rounded-xl" />
                        <div className="flex-1 space-y-3">
                          <div className="h-5 bg-muted rounded w-1/3" />
                          <div className="h-4 bg-muted rounded w-1/2" />
                          <div className="h-4 bg-muted rounded w-2/3" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredUpcoming.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold mb-2">
                  {searchQuery ? "No events found" : "No upcoming events"}
                </h2>
                <p className="text-muted-foreground mb-6">
                  {searchQuery
                    ? "Try a different search term"
                    : "Create an event to get started"}
                </p>
                {!searchQuery && (
                  <Link href="/events/create">
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredUpcoming.map(renderEventCard)}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {filteredPast.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold mb-2">No past events</h2>
                <p className="text-muted-foreground">
                  Your past events will appear here
                </p>
              </div>
            ) : (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {filteredPast.map(renderEventCard)}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}





