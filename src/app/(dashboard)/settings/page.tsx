"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { UserButton } from "@clerk/nextjs";
import {
  Bell,
  Mail,
  Smartphone,
  MessageSquare,
  User,
  Shield,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUserViewModel } from "@/viewmodels/useUserViewModel";
import { useNotificationsViewModel } from "@/viewmodels/useNotificationsViewModel";
import { CARRIERS } from "@/viewmodels/useOnboardingViewModel";
import { toast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { user, preferences, clerkUser, updatePreferences } = useUserViewModel();
  const {
    isPushSupported,
    isPushEnabled,
    checkPushSupport,
    subscribeToPush,
    unsubscribeFromPush,
    sendTestNotification,
  } = useNotificationsViewModel(user?.id);

  useEffect(() => {
    checkPushSupport();
  }, [checkPushSupport]);

  const handlePushToggle = async (enabled: boolean) => {
    if (enabled) {
      const result = await subscribeToPush();
      if (result.success) {
        toast({
          title: "Push Notifications Enabled",
          description: "You'll receive push notifications for events and announcements.",
          variant: "success",
        });
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to enable push notifications",
          variant: "destructive",
        });
      }
    } else {
      const result = await unsubscribeFromPush();
      if (result.success) {
        toast({
          title: "Push Notifications Disabled",
          description: "You won't receive push notifications anymore.",
        });
      }
    }
  };

  const handlePreferenceUpdate = async (key: string, value: boolean | string) => {
    const result = await updatePreferences({ [key]: value });
    if (!result.error) {
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved.",
      });
    }
  };

  const handleTestNotification = async () => {
    const result = await sendTestNotification();
    if (result.success) {
      toast({
        title: "Test Notification Sent",
        description: "You should receive a notification shortly.",
      });
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to send test notification",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="px-4 lg:px-8 py-4">
          <h1 className="text-2xl font-display font-bold">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account and preferences
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile
              </CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-16 h-16",
                      },
                    }}
                  />
                  <div>
                    <p className="font-medium">{clerkUser?.fullName || "User"}</p>
                    <p className="text-sm text-muted-foreground">
                      {clerkUser?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Email */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Receive event invites and announcements via email
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences?.allow_email ?? true}
                  onCheckedChange={(checked) => handlePreferenceUpdate("allow_email", checked)}
                />
              </div>

              <Separator />

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium">Push Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      {isPushSupported
                        ? "Get instant notifications on your device"
                        : "Not supported in this browser"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={isPushEnabled}
                  onCheckedChange={handlePushToggle}
                  disabled={!isPushSupported}
                />
              </div>

              {isPushEnabled && (
                <div className="ml-13 pl-10">
                  <Button variant="outline" size="sm" onClick={handleTestNotification}>
                    Send Test Notification
                  </Button>
                </div>
              )}

              <Separator />

              {/* SMS via Email Gateway */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                      <MessageSquare className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">Text Message Alerts</p>
                      <p className="text-sm text-muted-foreground">
                        Receive alerts via SMS (free, uses email gateway)
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={preferences?.allow_sms ?? false}
                    onCheckedChange={(checked) => handlePreferenceUpdate("allow_sms", checked)}
                  />
                </div>

                {preferences?.allow_sms && (
                  <div className="ml-13 pl-10 space-y-4">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        defaultValue={preferences?.phone_number || ""}
                        onBlur={(e) => handlePreferenceUpdate("phone_number", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Carrier</Label>
                      <Select
                        defaultValue={preferences?.carrier || ""}
                        onValueChange={(value) => handlePreferenceUpdate("carrier", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your carrier" />
                        </SelectTrigger>
                        <SelectContent>
                          {CARRIERS.map((carrier) => (
                            <SelectItem key={carrier.value} value={carrier.value}>
                              {carrier.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Privacy & Security
              </CardTitle>
              <CardDescription>Manage your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/settings/privacy">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium">Privacy Settings</p>
                    <p className="text-sm text-muted-foreground">
                      Control who can see your information
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>

              <Separator />

              <Link href="/settings/data">
                <div className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors">
                  <div>
                    <p className="font-medium">Data & Storage</p>
                    <p className="text-sm text-muted-foreground">
                      Manage your data and download history
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-sm text-muted-foreground">
                <p>Spond v1.0.0</p>
                <p className="mt-1">Made with ❤️ for communities</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}



