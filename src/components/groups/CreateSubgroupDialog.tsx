"use client";

import { useState } from "react";
import { Users } from "lucide-react";
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
import { useGroupsViewModel } from "@/viewmodels/useGroupsViewModel";
import { toast } from "@/hooks/use-toast";

interface CreateSubgroupDialogProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  userId?: string;
}

export function CreateSubgroupDialog({
  open,
  onClose,
  groupId,
  userId,
}: CreateSubgroupDialogProps) {
  const { createSubgroup } = useGroupsViewModel(userId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Subgroup name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await createSubgroup(groupId, {
      name: formData.name.trim(),
      type: formData.type.trim() || undefined,
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
        description: "Subgroup created successfully!",
        variant: "success",
      });
      setFormData({ name: "", type: "" });
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({ name: "", type: "" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-2">
            <Users className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center">Create Subgroup</DialogTitle>
          <DialogDescription className="text-center">
            Create a subgroup to organize members within your group.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Subgroup Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Team A, Beginners"
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
            <Label htmlFor="type">Type (Optional)</Label>
            <Input
              id="type"
              placeholder="e.g., Team, Skill Level"
              value={formData.type}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, type: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



