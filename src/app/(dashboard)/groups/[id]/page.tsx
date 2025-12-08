"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Calendar,
  Settings,
  Plus,
  UserPlus,
  ChevronRight,
  MoreVertical,
  Crown,
  Shield,
  ArrowLeft,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateSubgroupDialog } from "@/components/groups/CreateSubgroupDialog";
import { InviteMemberDialog } from "@/components/groups/InviteMemberDialog";
import { useUserViewModel } from "@/viewmodels/useUserViewModel";
import { useGroupsViewModel } from "@/viewmodels/useGroupsViewModel";
import { useEventsViewModel } from "@/viewmodels/useEventsViewModel";
import { formatDate } from "@/lib/utils";
import type { MemberRole } from "@/models/database.types";

const roleIcons: Record<MemberRole, typeof Crown> = {
  admin: Crown,
  organizer: Shield,
  player: Users,
};

const roleColors: Record<MemberRole, string> = {
  admin: "text-amber-500",
  organizer: "text-primary",
  player: "text-muted-foreground",
};

export default function GroupDetailPage() {
  const params = useParams();
  const groupId = params.id as string;
  const { user } = useUserViewModel();
  const { currentGroup, fetchGroupDetails, isLoading, error } = useGroupsViewModel(user?.id);
  const { events } = useEventsViewModel(user?.id, groupId);
  const [showSubgroupDialog, setShowSubgroupDialog] = useState(false);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  useEffect(() => {
    if (groupId && user?.id) {
      fetchGroupDetails(groupId);
    }
  }, [groupId, user?.id, fetchGroupDetails]);



  if (isLoading) {
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

  if (error || !currentGroup) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4 bg-card p-8 rounded-xl border shadow-sm max-w-md w-full">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Group Not Found</h1>
          <p className="text-muted-foreground">
            The group you are looking for does not exist or you do not have permission to view it.
          </p>
          <div className="pt-4">
            <Link href="/groups">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Groups
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const userMembership = currentGroup.members?.find((m) => m.user_id === user?.id);
  const isAdmin = userMembership?.role === "admin";
  const isOrganizer = userMembership?.role === "organizer" || isAdmin;

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div className="relative h-48 lg:h-64 bg-gradient-to-br from-primary to-secondary overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 lg:p-8">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl bg-card shadow-xl flex items-center justify-center text-3xl font-bold border-4 border-background">
              {currentGroup.image_url ? (
                <img
                  src={currentGroup.image_url}
                  alt={currentGroup.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <span className="gradient-text">
                  {currentGroup.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <h1 className="text-2xl lg:text-3xl font-display font-bold text-white truncate">
                {currentGroup.name}
              </h1>
              <p className="text-white/80 text-sm mt-1">
                {currentGroup.memberCount} members • {currentGroup.subgroups?.length || 0} subgroups
              </p>
            </div>
            {isAdmin && (
              <Link href={`/groups/${groupId}/settings`}>
                <Button variant="secondary" size="icon" className="shrink-0">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="px-4 lg:px-8 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <Link href={`/events/create?groupId=${groupId}`}>
            <Button size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              New Event
            </Button>
          </Link>
          {isOrganizer && (
            <>
              <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowSubgroupDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Subgroup
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 lg:p-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Description */}
            {currentGroup.description && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{currentGroup.description}</p>
                </CardContent>
              </Card>
            )}

            {/* Subgroups */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Subgroups</CardTitle>
                  {isOrganizer && (
                    <Button variant="ghost" size="sm" onClick={() => setShowSubgroupDialog(true)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!currentGroup.subgroups || currentGroup.subgroups.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No subgroups yet
                  </p>
                ) : (
                  <div className="space-y-2">
                    {currentGroup.subgroups.map((subgroup) => (
                      <motion.div
                        key={subgroup.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                        whileHover={{ x: 2 }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Users className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{subgroup.name}</p>
                            {subgroup.type && (
                              <p className="text-xs text-muted-foreground">{subgroup.type}</p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events Preview */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Upcoming Events</CardTitle>
                  <Link href={`/groups/${groupId}/events`}>
                    <Button variant="ghost" size="sm">
                      View all
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {events.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No upcoming events
                  </p>
                ) : (
                  <div className="space-y-2">
                    {events.slice(0, 3).map((event) => (
                      <Link key={event.id} href={`/events/${event.id}`}>
                        <motion.div
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                          whileHover={{ x: 2 }}
                        >
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center text-xs">
                            <span className="font-bold text-primary">
                              {new Date(event.start_time).getDate()}
                            </span>
                            <span className="text-muted-foreground">
                              {new Date(event.start_time).toLocaleDateString("en-US", { month: "short" })}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{event.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(event.start_time)}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {event.yesCount}/{event.participant_limit || "∞"}
                          </Badge>
                        </motion.div>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Members ({currentGroup.members?.length || 0})
                  </CardTitle>
                  {isOrganizer && (
                    <Button variant="outline" size="sm" onClick={() => setShowInviteDialog(true)}>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentGroup.members?.map((member) => {
                    const RoleIcon = roleIcons[member.role];
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={member.user?.avatar_url || undefined} />
                            <AvatarFallback>
                              {member.user?.full_name?.charAt(0) || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.user?.full_name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{member.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1 capitalize">
                            <RoleIcon className={`w-3 h-3 ${roleColors[member.role]}`} />
                            {member.role}
                          </Badge>
                          {isAdmin && member.user_id !== user?.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Make Admin</DropdownMenuItem>
                                <DropdownMenuItem>Make Organizer</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Remove from Group
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">All Events</h2>
              <Link href={`/events/create?groupId=${groupId}`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  New Event
                </Button>
              </Link>
            </div>

            {events.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="font-semibold mb-2">No events yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create your first event for this group
                  </p>
                  <Link href={`/events/create?groupId=${groupId}`}>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Event
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {events.map((event) => (
                  <Link key={event.id} href={`/events/${event.id}`}>
                    <Card className="hover:shadow-md transition-all hover:-translate-y-0.5">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex flex-col items-center justify-center">
                            <span className="text-xl font-bold text-primary">
                              {new Date(event.start_time).getDate()}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(event.start_time).toLocaleDateString("en-US", { month: "short" })}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{event.title}</h3>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(event.start_time)}
                            </p>
                            {event.location && (
                              <p className="text-sm text-muted-foreground truncate">
                                📍 {event.location}
                              </p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge>
                              {event.yesCount} attending
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <CreateSubgroupDialog
        open={showSubgroupDialog}
        onClose={() => setShowSubgroupDialog(false)}
        groupId={groupId}
        userId={user?.id}
      />
      <InviteMemberDialog
        open={showInviteDialog}
        onClose={() => setShowInviteDialog(false)}
        groupId={groupId}
        userId={user?.id}
      />
    </div>
  );
}



