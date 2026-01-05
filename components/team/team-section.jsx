/**
 * Team Section Component
 * Displays team members with animated progress bars
 */

"use client"

import { useEffect, useState } from "react"
import { Users, Award, Star } from "lucide-react"

const teamMembers = [
  {
    name: "Mohammed Ayyan",
    id: "VVCE24CSE062",
    workDone: 80,
    role: "Project Lead",
    avatar: "MA",
  },
  {
    name: "Mohammed Safwaan",
    id: "VVCE24CSE0623",
    workDone: 7.5,
    role: "Developer",
    avatar: "MS",
  },
  {
    name: "Mohammed Abrar",
    id: "VVCE24CSE0620",
    workDone: 7.5,
    role: "Developer",
    avatar: "AB",
  },
  {
    name: "Ananya",
    id: "VVCE24CSE0623",
    workDone: 2.5,
    role: "Designer",
    avatar: "AN",
  },
  {
    name: "Apeksha",
    id: "VVCE24CSE0623",
    workDone: 2.5,
    role: "Tester",
    avatar: "AP",
  },
]

function ProgressBar({ percentage, delay = 0 }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setWidth(percentage)
    }, delay)
    return () => clearTimeout(timer)
  }, [percentage, delay])

  // Determine color based on percentage
  function getColor(pct) {
    if (pct >= 50) return "from-accent to-accent/70"
    if (pct >= 10) return "from-primary to-primary/70"
    return "from-chart-3 to-chart-3/70"
  }

  return (
    <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
      <div
        className={`h-full bg-gradient-to-r ${getColor(percentage)} rounded-full transition-all duration-1000 ease-out relative`}
        style={{ width: `${width}%` }}
      >
        <div className="absolute inset-0 animate-shimmer" />
      </div>
    </div>
  )
}

function TeamMemberCard({ member, index }) {
  const [showPercentage, setShowPercentage] = useState(false)

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setShowPercentage(true)
      },
      500 + index * 200,
    )
    return () => clearTimeout(timer)
  }, [index])

  return (
    <div
      className="group relative bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm
        hover:bg-card hover:border-primary/30 transition-all duration-500
        hover:shadow-[0_0_40px_rgba(99,146,255,0.15)] hover:-translate-y-2
        animate-fade-in opacity-0"
      style={{ animationDelay: `${0.2 + index * 0.1}s` }}
    >
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative z-10">
        {/* Avatar and Name */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center
            text-lg font-bold text-primary-foreground shadow-lg group-hover:scale-110 transition-transform duration-300"
          >
            {member.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-foreground truncate group-hover:text-primary transition-colors">
              {member.name}
            </h3>
            <p className="text-sm text-muted-foreground font-mono">{member.id}</p>
          </div>
          {member.workDone >= 50 && (
            <div className="shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center animate-float">
              <Star className="w-4 h-4 text-accent fill-accent" />
            </div>
          )}
        </div>

        {/* Role Badge */}
        <div className="mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <Award className="w-3 h-3" />
            {member.role}
          </span>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Work Completed</span>
            <span
              className={`font-bold text-lg transition-all duration-500 ${
                showPercentage ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
              } ${member.workDone >= 50 ? "text-accent" : member.workDone >= 10 ? "text-primary" : "text-chart-3"}`}
            >
              {member.workDone}%
            </span>
          </div>
          <ProgressBar percentage={member.workDone} delay={300 + index * 200} />
        </div>
      </div>
    </div>
  )
}

export default function TeamSection() {
  const totalWork = teamMembers.reduce((sum, member) => sum + member.workDone, 0)

  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
        <div
          className="absolute bottom-0 right-1/4 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
            <Users className="w-4 h-4" />
            <span>Meet Our Team</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            The People Behind
            <span className="block text-primary">ParkSmart</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our dedicated team of developers and designers working on this EIOT Academic Project.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {teamMembers.map((member, index) => (
            <TeamMemberCard key={member.id + member.name} member={member} index={index} />
          ))}
        </div>

        {/* Total Progress */}
        <div className="max-w-xl mx-auto animate-fade-in stagger-6">
          <div className="bg-card/50 border border-border rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Award className="w-5 h-5 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Total Project Progress</h3>
                  <p className="text-sm text-muted-foreground">Combined team contributions</p>
                </div>
              </div>
              <span className="text-3xl font-bold text-primary">{totalWork}%</span>
            </div>
            <ProgressBar percentage={totalWork} delay={800} />
          </div>
        </div>
      </div>
    </section>
  )
}
