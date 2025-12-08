"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Megaphone, Users, Check, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUserViewModel } from "@/viewmodels/useUserViewModel";

// Mock notifications for now - would be fetched from API
const mockNotifications = [
  {
    id: "1",
    type: "event",
    title: "Practice Tomorrow",
    message: "Soccer practice at 6 PM tomorrow. Don't forget your gear!",
    group: "Weekend Soccer Club",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
  },
  {
    id: "2",
    type: "announcement",
    title: "Schedule Change",
    message: "Next week's practice has been moved to Thursday.",
    group: "Weekend Soccer Club",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: "3",
    type: "rsvp",
    title: "RSVP Reminder",
    message: "You haven't responded to 'Team Dinner' yet.",
    group: "Basketball League",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
];

const getNotificationIcon = (type: string) => {
  switch (type) {
    case "event":
      return Calendar;
    case "announcement":
      return Megaphone;
    case "rsvp":
      return Users;
    default:
      return Bell;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case "event":
      return "bg-primary/10 text-primary";
    case "announcement":
      return "bg-secondary/10 text-secondary";
    case "rsvp":
      return "bg-amber-500/10 text-amber-500";
    default:
      return "bg-muted text-muted-foreground";
  }
};

function formatRelativeTime(timestamp: string) {
  const now = new Date();
  const date = new Date(timestamp);
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { user } = useUserViewModel();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold">Notifications</h1>
              <p className="text-muted-foreground text-sm">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button variant="outline" size="sm" onClick={markAllAsRead}>
                    <Check className="w-4 h-4 mr-2" />
                    Mark all read
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={clearAll}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear all
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 lg:p-8 max-w-2xl mx-auto">
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {notifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-xl font-semibold mb-2">No notifications</h2>
                <p className="text-muted-foreground">
                  You&apos;re all caught up! Check back later.
                </p>
              </div>
            ) : (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {notifications.map((notification, index) => {
                  const Icon = getNotificationIcon(notification.type);
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`transition-all hover:shadow-md ${
                          !notification.read ? "border-primary/30 bg-primary/5" : ""
                        }`}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getNotificationColor(
                                notification.type
                              )}`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {notification.group}
                                  </p>
                                </div>
                                <span className="text-xs text-muted-foreground shrink-0">
                                  {formatRelativeTime(notification.timestamp)}
                                </span>
                              </div>
                              <p className="text-sm mt-2 text-muted-foreground">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-2 mt-3">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Mark read
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="unread">
            {unreadCount === 0 ? (
              <div className="text-center py-16">
                <Check className="w-16 h-16 mx-auto mb-4 text-success/50" />
                <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
                <p className="text-muted-foreground">
                  You have no unread notifications.
                </p>
              </div>
            ) : (
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {notifications
                  .filter((n) => !n.read)
                  .map((notification, index) => {
                    const Icon = getNotificationIcon(notification.type);
                    return (
                      <motion.div
                        key={notification.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="transition-all hover:shadow-md border-primary/30 bg-primary/5">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getNotificationColor(
                                  notification.type
                                )}`}
                              >
                                <Icon className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <p className="font-medium">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {notification.group}
                                    </p>
                                  </div>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    {formatRelativeTime(notification.timestamp)}
                                  </span>
                                </div>
                                <p className="text-sm mt-2 text-muted-foreground">
                                  {notification.message}
                                </p>
                                <div className="flex items-center gap-2 mt-3">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <Check className="w-4 h-4 mr-1" />
                                    Mark read
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteNotification(notification.id)}
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}



