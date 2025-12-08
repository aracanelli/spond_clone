"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, MessageSquare, Bell, ChevronRight, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useOnboardingViewModel, CARRIERS } from "@/viewmodels/useOnboardingViewModel";
import { useUserViewModel } from "@/viewmodels/useUserViewModel";
import { toast } from "@/hooks/use-toast";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  const {
    step,
    formData,
    errors,
    isSubmitting,
    updateFormData,
    validateForm,
    nextStep,
    prevStep,
    setSubmitting,
    skipOnboarding,
  } = useOnboardingViewModel();

  const { completeOnboarding } = useUserViewModel();

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    const result = await completeOnboarding(
      formData.phoneNumber,
      formData.carrier,
      formData.allowSms
    );
    setSubmitting(false);

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Welcome!",
        description: "Your preferences have been saved.",
        variant: "success",
      });
      onClose();
    }
  };

  const handleSkip = async () => {
    setSubmitting(true);
    const skipData = skipOnboarding();
    const result = await completeOnboarding(
      skipData.phoneNumber,
      skipData.carrier,
      skipData.allowSms
    );
    setSubmitting(false);

    if (!result.error) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden" onPointerDownOutside={(e) => e.preventDefault()}>
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <motion.div
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: "33.33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-primary" />
                  </div>
                  <DialogTitle className="text-2xl">Welcome to Spond!</DialogTitle>
                  <DialogDescription className="text-base">
                    Let&apos;s set up your notification preferences to keep you informed about events and updates.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-accent/50">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Free Text Alerts</h4>
                      <p className="text-sm text-muted-foreground">
                        Get event reminders via text message at no cost using your carrier&apos;s email gateway.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handleSkip} className="flex-1" disabled={isSubmitting}>
                    Skip for now
                  </Button>
                  <Button onClick={nextStep} className="flex-1">
                    Get Started
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                    <Phone className="w-8 h-8 text-primary" />
                  </div>
                  <DialogTitle className="text-2xl">Phone Details</DialogTitle>
                  <DialogDescription className="text-base">
                    Enter your phone number and carrier to receive text notifications.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phoneNumber}
                      onChange={(e) => updateFormData("phoneNumber", e.target.value)}
                      className={errors.phoneNumber ? "border-destructive" : ""}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="carrier">Mobile Carrier</Label>
                    <Select
                      value={formData.carrier}
                      onValueChange={(value) => updateFormData("carrier", value)}
                    >
                      <SelectTrigger className={errors.carrier ? "border-destructive" : ""}>
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
                    {errors.carrier && (
                      <p className="text-sm text-destructive">{errors.carrier}</p>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={nextStep} className="flex-1">
                    Continue
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader className="text-center pb-6">
                  <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-success/20 to-primary/20 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-success" />
                  </div>
                  <DialogTitle className="text-2xl">Almost Done!</DialogTitle>
                  <DialogDescription className="text-base">
                    Review your preferences and confirm.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div className="p-4 rounded-xl bg-muted/50 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Phone</span>
                      <span className="font-medium">{formData.phoneNumber || "Not set"}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Carrier</span>
                      <span className="font-medium">
                        {CARRIERS.find((c) => c.value === formData.carrier)?.label || "Not set"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-accent/50">
                    <div>
                      <p className="font-medium">Enable Text Notifications</p>
                      <p className="text-sm text-muted-foreground">Receive event reminders via SMS</p>
                    </div>
                    <Switch
                      checked={formData.allowSms}
                      onCheckedChange={(checked) => updateFormData("allowSms", checked)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={prevStep} className="flex-1" disabled={isSubmitting}>
                    Back
                  </Button>
                  <Button onClick={handleSubmit} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Complete Setup"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}



