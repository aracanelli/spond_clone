"use client";

import { motion } from "framer-motion";
import { Calendar, Users, Bell, Megaphone, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserViewModel } from "@/viewmodels/useUserViewModel";
import { useGroupsViewModel } from "@/viewmodels/useGroupsViewModel";
import { useEventsViewModel } from "@/viewmodels/useEventsViewModel";
import { formatDate, formatTime } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const { user, clerkUser } = useUserViewModel();
  const { groups } = useGroupsViewModel(user?.id);
  const { upcomingEvents } = useEventsViewModel(user?.id);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">
                {greeting()}, {clerkUser?.firstName || "there"}!
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Here&apos;s what&apos;s happening with your groups
              </p>
            </div>
            <Avatar className="h-10 w-10">
              <AvatarImage src={clerkUser?.imageUrl} />
              <AvatarFallback>
                {clerkUser?.firstName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      {/* Content */}
      <motion.div
        className="p-4 lg:p-8 space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{groups.length}</p>
                  <p className="text-xs text-muted-foreground">Groups</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{upcomingEvents.length}</p>
                  <p className="text-xs text-muted-foreground">Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Pending RSVPs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Megaphone className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-muted-foreground">Announcements</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Upcoming Events</CardTitle>
                <Link href="/events">
                  <Button variant="ghost" size="sm">
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No upcoming events</p>
                  <Link href="/events/create">
                    <Button variant="link" className="mt-2">
                      Create your first event
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingEvents.slice(0, 3).map((event) => (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <motion.div
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-accent transition-colors"
                        whileHover={{ x: 4 }}
                      >
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center text-sm">
                          <span className="font-bold text-primary">
                            {new Date(event.start_time).getDate()}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(event.start_time).toLocaleDateString("en-US", { month: "short" })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{event.title}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(event.start_time)}</span>
                            {event.group && (
                              <>
                                <span>•</span>
                                <span className="truncate">{event.group.name}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <Badge variant="pending">
                          {event.yesCount} / {event.participant_limit || "∞"}
                        </Badge>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Your Groups */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Your Groups</CardTitle>
                <Link href="/groups">
                  <Button variant="ghost" size="sm">
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>You&apos;re not in any groups yet</p>
                  <Link href="/groups/create">
                    <Button variant="link" className="mt-2">
                      Create a group
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {groups.slice(0, 4).map((group) => (
                    <Link key={group.id} href={`/groups/${group.id}`}>
                      <motion.div
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-colors"
                        whileHover={{ scale: 1.01 }}
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {group.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{group.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {group.memberCount || 0} members
                          </p>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}



