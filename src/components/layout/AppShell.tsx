"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { OnboardingModal } from "@/components/onboarding/OnboardingModal";
import { PWAInstallPrompt } from "@/components/pwa/PWAInstallPrompt";
import { useUserViewModel } from "@/viewmodels/useUserViewModel";

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const router = useRouter();
  const { user, isLoading, needsOnboarding, clerkUser } = useUserViewModel();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!isLoading && !clerkUser) {
      router.push("/sign-in");
    }
  }, [isLoading, clerkUser, router]);

  useEffect(() => {
    if (!isLoading && needsOnboarding) {
      setShowOnboarding(true);
    }
  }, [isLoading, needsOnboarding]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  if (!clerkUser) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <MobileNav />

      {/* Main content */}
      <main className="lg:pl-64 pb-20 lg:pb-0">
        <div className="min-h-screen">
          <AnimatePresence mode="wait">
            <motion.div
              key={user?.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        open={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </div>
  );
}





