"use client";

import { useState } from "react";
import { z } from "zod";

// Canadian and US carriers
export const CARRIERS = [
  { value: "bell", label: "Bell" },
  { value: "rogers", label: "Rogers" },
  { value: "telus", label: "Telus" },
  { value: "fido", label: "Fido" },
  { value: "koodo", label: "Koodo" },
  { value: "virgin-mobile", label: "Virgin Mobile" },
  { value: "videotron", label: "Videotron" },
  { value: "at&t", label: "AT&T" },
  { value: "verizon", label: "Verizon" },
  { value: "t-mobile", label: "T-Mobile" },
  { value: "sprint", label: "Sprint" },
  { value: "other", label: "Other" },
] as const;

const onboardingSchema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[\d\s\-\+\(\)]+$/, "Invalid phone number format"),
  carrier: z.string().min(1, "Please select a carrier"),
  allowSms: z.boolean(),
});

export type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingState {
  step: number;
  formData: OnboardingFormData;
  errors: Partial<Record<keyof OnboardingFormData, string>>;
  isSubmitting: boolean;
}

export function useOnboardingViewModel() {
  const [state, setState] = useState<OnboardingState>({
    step: 1,
    formData: {
      phoneNumber: "",
      carrier: "",
      allowSms: true,
    },
    errors: {},
    isSubmitting: false,
  });

  const updateFormData = (field: keyof OnboardingFormData, value: string | boolean) => {
    setState((prev) => ({
      ...prev,
      formData: {
        ...prev.formData,
        [field]: value,
      },
      errors: {
        ...prev.errors,
        [field]: undefined,
      },
    }));
  };

  const validateForm = (): boolean => {
    try {
      onboardingSchema.parse(state.formData);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Partial<Record<keyof OnboardingFormData, string>> = {};
        error.errors.forEach((e) => {
          const field = e.path[0] as keyof OnboardingFormData;
          errors[field] = e.message;
        });
        setState((prev) => ({ ...prev, errors }));
      }
      return false;
    }
  };

  const nextStep = () => {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 3) }));
  };

  const prevStep = () => {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
  };

  const setSubmitting = (isSubmitting: boolean) => {
    setState((prev) => ({ ...prev, isSubmitting }));
  };

  const skipOnboarding = () => {
    return {
      phoneNumber: "",
      carrier: "",
      allowSms: false,
    };
  };

  return {
    ...state,
    carriers: CARRIERS,
    updateFormData,
    validateForm,
    nextStep,
    prevStep,
    setSubmitting,
    skipOnboarding,
  };
}



