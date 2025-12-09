"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Megaphone, Search, Clock, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreateAnnouncementDialog } from "@/components/announcements/CreateAnnouncementDialog";
import { useUserViewModel } from "@/viewmodels/useUserViewModel";
import { useAnnouncementsViewModel } from "@/viewmodels/useAnnouncementsViewModel";
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

export default function AnnouncementsPage() {
  const { user } = useUserViewModel();
  const { announcements, isLoading } = useAnnouncementsViewModel(user?.id);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-display font-bold">Announcements</h1>
              <p className="text-muted-foreground text-sm">
                Stay updated with group news
              </p>
            </div>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Announcement
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search announcements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 lg:p-8">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-muted rounded w-1/3" />
                      <div className="h-4 bg-muted rounded w-2/3" />
                      <div className="h-4 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="text-center py-16">
            <Megaphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-xl font-semibold mb-2">
              {searchQuery ? "No announcements found" : "No announcements yet"}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Create an announcement to share news with your group"}
            </p>
            {!searchQuery && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredAnnouncements.map((announcement) => (
              <motion.div key={announcement.id} variants={itemVariants}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Avatar className="h-10 w-10 shrink-0">
                        <AvatarImage src={announcement.sender?.avatar_url || undefined} />
                        <AvatarFallback>
                          {announcement.sender?.full_name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold">{announcement.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <span>{announcement.sender?.full_name || "Unknown"}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatDate(announcement.created_at)} at{" "}
                                {formatTime(announcement.created_at)}
                              </span>
                            </div>
                          </div>
                          {announcement.group && (
                            <Badge variant="outline" className="shrink-0">
                              <Users className="w-3 h-3 mr-1" />
                              {announcement.group.name}
                            </Badge>
                          )}
                        </div>

                        <p className="mt-3 text-muted-foreground whitespace-pre-wrap">
                          {announcement.content}
                        </p>

                        {announcement.event && (
                          <div className="mt-4 p-3 rounded-lg bg-muted/50">
                            <p className="text-sm font-medium">Related Event</p>
                            <p className="text-sm text-muted-foreground">
                              {announcement.event.title} •{" "}
                              {formatDate(announcement.event.start_time)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Create Dialog */}
      <CreateAnnouncementDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        userId={user?.id}
      />
    </div>
  );
}





