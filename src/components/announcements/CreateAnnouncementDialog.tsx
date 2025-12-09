"use client";

import { useState } from "react";
import { Megaphone, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useGroupsViewModel } from "@/viewmodels/useGroupsViewModel";
import { useAnnouncementsViewModel } from "@/viewmodels/useAnnouncementsViewModel";
import { toast } from "@/hooks/use-toast";

interface CreateAnnouncementDialogProps {
  open: boolean;
  onClose: () => void;
  userId?: string;
  preselectedGroupId?: string;
}

export function CreateAnnouncementDialog({
  open,
  onClose,
  userId,
  preselectedGroupId,
}: CreateAnnouncementDialogProps) {
  const { groups } = useGroupsViewModel(userId);
  const { createAnnouncement } = useAnnouncementsViewModel(userId);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sendNotifications, setSendNotifications] = useState(true);
  const [formData, setFormData] = useState({
    group_id: preselectedGroupId || "",
    subgroup_id: "",
    title: "",
    content: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedGroup = groups.find((g) => g.id === formData.group_id);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.group_id) {
      newErrors.group_id = "Please select a group";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await createAnnouncement(
      {
        group_id: formData.group_id,
        subgroup_id: formData.subgroup_id || null,
        title: formData.title.trim(),
        content: formData.content.trim(),
      },
      sendNotifications
    );
    setIsSubmitting(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Announcement Sent",
        description: sendNotifications
          ? "Your announcement has been sent to all group members."
          : "Your announcement has been posted.",
        variant: "success",
      });
      setFormData({ group_id: preselectedGroupId || "", subgroup_id: "", title: "", content: "" });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ group_id: preselectedGroupId || "", subgroup_id: "", title: "", content: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-2">
            <Megaphone className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center">New Announcement</DialogTitle>
          <DialogDescription className="text-center">
            Share important news with your group members.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Group *</Label>
            <Select
              value={formData.group_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, group_id: value, subgroup_id: "" }))
              }
            >
              <SelectTrigger className={errors.group_id ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a group" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.group_id && (
              <p className="text-sm text-destructive">{errors.group_id}</p>
            )}
          </div>

          {selectedGroup?.subgroups && selectedGroup.subgroups.length > 0 && (
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <Select
                value={formData.subgroup_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, subgroup_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All members" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All members</SelectItem>
                  {selectedGroup.subgroups.map((subgroup) => (
                    <SelectItem key={subgroup.id} value={subgroup.id}>
                      {subgroup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Practice Cancelled Tomorrow"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                setErrors((prev) => ({ ...prev, title: "" }));
              }}
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              placeholder="Write your announcement..."
              value={formData.content}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, content: e.target.value }));
                setErrors((prev) => ({ ...prev, content: "" }));
              }}
              rows={4}
              className={errors.content ? "border-destructive" : ""}
            />
            {errors.content && (
              <p className="text-sm text-destructive">{errors.content}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="font-medium">Send Notifications</p>
              <p className="text-sm text-muted-foreground">
                Notify members via email, push, and SMS
              </p>
            </div>
            <Switch checked={sendNotifications} onCheckedChange={setSendNotifications} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            <Send className="w-4 h-4 mr-2" />
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}





