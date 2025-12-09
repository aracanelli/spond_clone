"use client";

import { SignIn } from "@clerk/nextjs";
import { motion } from "framer-motion";

export default function SignInPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative z-10"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">S</span>
        </div>
        <h1 className="text-3xl font-display font-bold gradient-text">Welcome Back</h1>
        <p className="text-muted-foreground mt-2">Sign in to continue to Spond</p>
      </div>
      
      <SignIn
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "bg-card/80 backdrop-blur-xl border-border shadow-2xl rounded-2xl",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton: "border-border hover:bg-accent transition-all",
            socialButtonsBlockButtonText: "font-medium",
            dividerLine: "bg-border",
            dividerText: "text-muted-foreground",
            formFieldLabel: "text-foreground",
            formFieldInput: "bg-background border-input rounded-lg",
            formButtonPrimary: "bg-primary hover:bg-primary/90 rounded-lg transition-all",
            footerActionLink: "text-primary hover:text-primary/80",
            identityPreviewEditButton: "text-primary",
          },
        }}
      />
    </motion.div>
  );
}





