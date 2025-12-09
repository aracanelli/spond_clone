"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Calendar, Users, Bell, ArrowRight, Check, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Users,
    title: "Group Management",
    description: "Create and manage groups with subteams. Invite members and assign roles easily.",
  },
  {
    icon: Calendar,
    title: "Event Coordination",
    description: "Schedule events, track RSVPs, and send reminders all in one place.",
  },
  {
    icon: Bell,
    title: "Free Notifications",
    description: "Email, push, and SMS notifications without expensive API costs.",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Works beautifully on any device. Install as a PWA for native-like experience.",
  },
];

const benefits = [
  "Instant RSVP via email magic links",
  "Web push notifications on any device",
  "Free SMS via carrier email gateways",
  "Beautiful mobile and desktop experience",
  "Unlimited groups and events",
  "No credit card required",
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        <div className="absolute inset-0 pattern-dots opacity-30" />
        
        <nav className="relative z-10 px-4 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-display text-xl font-semibold">Spond</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-4 lg:px-8 pt-20 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Free notification stack included
            </motion.div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight">
              Coordinate Your Groups{" "}
              <span className="gradient-text">Without the Hassle</span>
            </h1>
            
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              The modern way to manage sports teams, clubs, and communities. 
              Create events, send announcements, and track RSVPs—all with free notifications.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="xl" className="w-full sm:w-auto">
                  Start for Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button variant="outline" size="xl" className="w-full sm:w-auto">
                  Sign In to Your Account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-card/50">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-display font-bold">
              Everything You Need to Coordinate
            </h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
              From small hobby groups to large organizations, Spond scales with your needs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 rounded-2xl bg-card border hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-6">
                No More Expensive SMS APIs
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We use a clever combination of email magic links, web push notifications, 
                and carrier email gateways to deliver notifications at zero cost.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span>{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/10 to-primary/20 p-8 lg:p-12">
                <div className="w-full h-full rounded-2xl bg-card shadow-2xl overflow-hidden">
                  <div className="h-8 bg-muted flex items-center gap-2 px-4">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-muted rounded w-1/2" />
                    <div className="h-20 bg-muted/50 rounded-lg" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-primary/20 rounded flex-1" />
                      <div className="h-8 bg-secondary/20 rounded flex-1" />
                    </div>
                    <div className="h-16 bg-muted/30 rounded-lg" />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-secondary relative overflow-hidden">
        <div className="absolute inset-0 pattern-dots opacity-10" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-3xl mx-auto px-4 lg:px-8 text-center"
        >
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of groups already using Spond to coordinate their activities.
          </p>
          <Link href="/sign-up">
            <Button size="xl" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Create Your Free Account
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-display font-semibold">Spond</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Spond. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}





