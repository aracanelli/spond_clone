"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useUserViewModel } from "@/viewmodels/useUserViewModel";
import { useGroupsViewModel } from "@/viewmodels/useGroupsViewModel";
import { useEventsViewModel } from "@/viewmodels/useEventsViewModel";
import { toast } from "@/hooks/use-toast";

export default function CreateEventPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedGroupId = searchParams.get("groupId");

  const { user } = useUserViewModel();
  const { groups } = useGroupsViewModel(user?.id);
  const { createEvent } = useEventsViewModel(user?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    group_id: preselectedGroupId || "",
    subgroup_id: "",
    title: "",
    description: "",
    location: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    participant_limit: "",
    is_recurring: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedGroup = groups.find((g) => g.id === formData.group_id);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.group_id) {
      newErrors.group_id = "Please select a group";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Event title is required";
    }
    if (!formData.start_date) {
      newErrors.start_date = "Start date is required";
    }
    if (!formData.start_time) {
      newErrors.start_time = "Start time is required";
    }
    if (!formData.end_date) {
      newErrors.end_date = "End date is required";
    }
    if (!formData.end_time) {
      newErrors.end_time = "End time is required";
    }

    // Check if end is after start
    if (formData.start_date && formData.end_date && formData.start_time && formData.end_time) {
      const start = new Date(`${formData.start_date}T${formData.start_time}`);
      const end = new Date(`${formData.end_date}T${formData.end_time}`);
      if (end <= start) {
        newErrors.end_time = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    
    const startTime = new Date(`${formData.start_date}T${formData.start_time}`).toISOString();
    const endTime = new Date(`${formData.end_date}T${formData.end_time}`).toISOString();

    const result = await createEvent({
      group_id: formData.group_id,
      subgroup_id: formData.subgroup_id || null,
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      location: formData.location.trim() || undefined,
      start_time: startTime,
      end_time: endTime,
      participant_limit: formData.participant_limit ? parseInt(formData.participant_limit) : null,
      is_recurring: formData.is_recurring,
    });

    setIsSubmitting(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Event created successfully!",
        variant: "success",
      });
      router.push(`/events/${result.data?.id}`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card border-b border-border/50">
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/events">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-display font-bold">Create Event</h1>
              <p className="text-muted-foreground text-sm">
                Set up a new event for your group
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="p-4 lg:p-8 max-w-2xl mx-auto">
        <motion.form
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Group Selection */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Group
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Select Group *</Label>
                <Select
                  value={formData.group_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, group_id: value, subgroup_id: "" }))
                  }
                >
                  <SelectTrigger className={errors.group_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Choose a group" />
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
                  <Label>Subgroup (Optional)</Label>
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
            </CardContent>
          </Card>

          {/* Event Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                Event Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Weekly Practice Session"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className={errors.title ? "border-destructive" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-destructive">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add details about the event..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location
                </Label>
                <Input
                  id="location"
                  placeholder="Enter venue or address"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Date & Time */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Date & Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                    className={errors.start_date ? "border-destructive" : ""}
                  />
                  {errors.start_date && (
                    <p className="text-sm text-destructive">{errors.start_date}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start_time">Start Time *</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, start_time: e.target.value }))
                    }
                    className={errors.start_time ? "border-destructive" : ""}
                  />
                  {errors.start_time && (
                    <p className="text-sm text-destructive">{errors.start_time}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, end_date: e.target.value }))
                    }
                    className={errors.end_date ? "border-destructive" : ""}
                  />
                  {errors.end_date && (
                    <p className="text-sm text-destructive">{errors.end_date}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end_time">End Time *</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, end_time: e.target.value }))
                    }
                    className={errors.end_time ? "border-destructive" : ""}
                  />
                  {errors.end_time && (
                    <p className="text-sm text-destructive">{errors.end_time}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="participant_limit">Participant Limit</Label>
                <Input
                  id="participant_limit"
                  type="number"
                  placeholder="Leave empty for unlimited"
                  value={formData.participant_limit}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, participant_limit: e.target.value }))
                  }
                  min="1"
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Recurring Event</p>
                  <p className="text-sm text-muted-foreground">
                    This event repeats on a schedule
                  </p>
                </div>
                <Switch
                  checked={formData.is_recurring}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, is_recurring: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-3">
            <Link href="/events" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}





