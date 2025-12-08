"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Image } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  createGroup: (data: { name: string; description?: string; image_url?: string }) => Promise<{ data?: any; error?: string }>;
}

export function CreateGroupDialog({ open, onClose, createGroup }: CreateGroupDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image_url: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [debugLog, setDebugLog] = useState<string[]>([]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await createGroup({
      name: formData.name.trim(),
      description: formData.description.trim() || undefined,
      image_url: formData.image_url.trim() || undefined,
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
        description: "Group created successfully!",
        variant: "success",
      });
      setFormData({ name: "", description: "", image_url: "" });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: "", description: "", image_url: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && !isSubmitting && handleClose()}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-2">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center">Create a New Group</DialogTitle>
          <DialogDescription className="text-center">
            Create a group to organize events and communicate with members.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4 py-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Weekend Soccer Club"
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              className={errors.name ? "border-destructive" : ""}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this group about?"
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Group Image URL</Label>
            <div className="flex gap-2">
              <Input
                id="image"
                placeholder="https://example.com/image.jpg"
                value={formData.image_url}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, image_url: e.target.value }))
                }
              />
              {formData.image_url && (
                <div className="w-10 h-10 rounded-lg border overflow-hidden shrink-0">
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Group"}
          </Button>
        </div>
        {debugLog.length > 0 && (
          <div className="mt-4 p-2 bg-muted rounded text-xs font-mono">
            {debugLog.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}



