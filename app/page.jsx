/**
 * Home Page
 * Modern landing page with hero section and team section
 */

import Link from "next/link"
import { Car, ArrowRight, Shield, Clock, Zap, LayoutDashboard, Settings, Sparkles } from "lucide-react"
import TeamSection from "@/components/team/team-section"

export default function HomePage() {
  const features = [
    {
      icon: Clock,
      title: "Pay in Advance",
      description: "Reserve your spot and pay before you arrive",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "Live monitoring of parking slot status",
    },
    {
      icon: Shield,
      title: "Secure System",
      description: "IoT-enabled barriers for authorized access only",
    },
  ]

  return (
    <main className="min-h-screen bg-background relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1.5s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl animate-pulse" />
        {/* New gradient orbs */}
        <div
          className="absolute top-20 right-1/4 w-64 h-64 bg-chart-3/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute bottom-40 left-1/3 w-48 h-48 bg-accent/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "0.5s" }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center animate-pulse-glow group-hover:scale-110 transition-transform duration-300">
                <Car className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground">ParkSmart</span>
            </div>
            <nav className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-300 hover:scale-105"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-all duration-300 hover:scale-105"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/20 text-primary text-sm font-medium mb-8 animate-fade-in hover:scale-105 transition-transform cursor-default">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>IoT-Powered Smart Parking</span>
            <Sparkles className="w-4 h-4 animate-pulse" />
          </div>

          {/* Title with gradient */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-slide-up leading-tight">
            Prepaid Parking
            <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
              Made Simple
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in stagger-2">
            Experience seamless parking with our smart IoT system. Pay in advance, park with ease, and never worry about
            overstaying again.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in stagger-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,146,255,0.4)] hover:scale-105 active:scale-[0.98]"
            >
              View Parking Slots
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-all duration-300 hover:scale-105 active:scale-[0.98] border border-border hover:border-primary/30"
            >
              <Settings className="w-5 h-5" />
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`
                  group p-6 rounded-xl bg-card/50 border border-border backdrop-blur-sm
                  hover:bg-card hover:border-primary/30 transition-all duration-500
                  hover:shadow-[0_0_40px_rgba(99,146,255,0.15)] hover:-translate-y-2
                  animate-fade-in opacity-0
                `}
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-gradient-to-br group-hover:from-primary/30 group-hover:to-accent/30 transition-all duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <TeamSection />

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-4 bg-card/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-muted-foreground">EIOT Academic Project - Prepaid Parking System</p>
          <p className="text-xs text-muted-foreground mt-2">Built with Next.js, MongoDB, and IoT Integration</p>
        </div>
      </footer>
    </main>
  )
}
