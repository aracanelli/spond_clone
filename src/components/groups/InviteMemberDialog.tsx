"use client";

import { useState } from "react";
import { UserPlus, Mail, Copy, Check } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGroupsViewModel } from "@/viewmodels/useGroupsViewModel";
import { toast } from "@/hooks/use-toast";
import type { MemberRole } from "@/models/database.types";

interface InviteMemberDialogProps {
  open: boolean;
  onClose: () => void;
  groupId: string;
  userId?: string;
}

export function InviteMemberDialog({
  open,
  onClose,
  groupId,
  userId,
}: InviteMemberDialogProps) {
  const { inviteMember } = useGroupsViewModel(userId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    role: "player" as MemberRole,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${groupId}`;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    const result = await inviteMember(groupId, formData.email.trim(), formData.role);
    setIsSubmitting(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Invitation Sent",
        description: `An invitation has been sent to ${formData.email}`,
        variant: "success",
      });
      setFormData({ email: "", role: "player" });
      onClose();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Invite link copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setFormData({ email: "", role: "player" });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-2">
            <UserPlus className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-center">Invite Members</DialogTitle>
          <DialogDescription className="text-center">
            Invite people to join your group via email or share link.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Invite */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="member@example.com"
                  value={formData.email}
                  onChange={(e) => {
                    setFormData((prev) => ({ ...prev, email: e.target.value }));
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  className={errors.email ? "border-destructive" : ""}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, role: value as MemberRole }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={handleSubmit} className="w-full" disabled={isSubmitting}>
              <Mail className="w-4 h-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Invitation"}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or share link
              </span>
            </div>
          </div>

          {/* Share Link */}
          <div className="space-y-2">
            <Label>Invite Link</Label>
            <div className="flex gap-2">
              <Input value={inviteLink} readOnly className="text-sm" />
              <Button variant="outline" size="icon" onClick={handleCopyLink}>
                {copied ? (
                  <Check className="w-4 h-4 text-success" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can join the group
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}





