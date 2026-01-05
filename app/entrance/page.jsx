/**
 * Entrance Monitor Page
 * Real-time display of available parking slots for entrance monitors
 */

"use client"

import { useState, useEffect } from "react"
import { Car, CheckCircle, Clock, AlertTriangle, Loader2, Wifi, WifiOff } from "lucide-react"

export default function EntranceMonitorPage() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [connected, setConnected] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  async function fetchSlots() {
    try {
      const response = await fetch("/api/slots")
      const data = await response.json()

      if (data.success) {
        setSlots(data.slots)
        setError(null)
        setConnected(true)
        setLastUpdate(new Date())
      } else {
        setError(data.error || "Failed to fetch slots")
        setConnected(false)
      }
    } catch (err) {
      console.error("Error fetching slots:", err)
      setError("Connection lost")
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
    // Refresh every 2 seconds for real-time updates
    const interval = setInterval(fetchSlots, 2000)
    return () => clearInterval(interval)
  }, [])

  const availableCount = slots.filter((s) => s.status === "AVAILABLE").length
  const occupiedCount = slots.filter((s) => ["PAID", "ACTIVE", "OVERSTAY"].includes(s.status)).length

  function getSlotVisual(status) {
    switch (status) {
      case "AVAILABLE":
        return {
          bgClass: "bg-gradient-to-br from-emerald-500/20 to-emerald-600/30",
          borderClass: "border-emerald-500/50",
          iconBg: "bg-emerald-500",
          icon: <CheckCircle className="w-8 h-8 text-white" />,
          label: "AVAILABLE",
          labelClass: "text-emerald-400",
          pulseClass: "animate-pulse",
        }
      case "PAID":
        return {
          bgClass: "bg-gradient-to-br from-blue-500/20 to-blue-600/30",
          borderClass: "border-blue-500/50",
          iconBg: "bg-blue-500",
          icon: <Clock className="w-8 h-8 text-white" />,
          label: "RESERVED",
          labelClass: "text-blue-400",
          pulseClass: "",
        }
      case "ACTIVE":
        return {
          bgClass: "bg-gradient-to-br from-amber-500/20 to-amber-600/30",
          borderClass: "border-amber-500/50",
          iconBg: "bg-amber-500",
          icon: <Car className="w-8 h-8 text-white" />,
          label: "OCCUPIED",
          labelClass: "text-amber-400",
          pulseClass: "",
        }
      case "OVERSTAY":
        return {
          bgClass: "bg-gradient-to-br from-red-500/20 to-red-600/30",
          borderClass: "border-red-500/50",
          iconBg: "bg-red-500",
          icon: <AlertTriangle className="w-8 h-8 text-white" />,
          label: "OVERSTAY",
          labelClass: "text-red-400",
          pulseClass: "animate-pulse",
        }
      default:
        return {
          bgClass: "bg-muted/30",
          borderClass: "border-border",
          iconBg: "bg-muted",
          icon: <Car className="w-8 h-8 text-muted-foreground" />,
          label: "UNKNOWN",
          labelClass: "text-muted-foreground",
          pulseClass: "",
        }
    }
  }

  function formatTime(date) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    })
  }

  function formatDate(date) {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function formatPrice(price) {
    return `₹${price}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float"
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 p-6 lg:p-10">
        {/* Header */}
        <header className="mb-8 animate-fade-in">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground">Parking Availability</h1>
                  <p className="text-muted-foreground">Entrance Monitor - Real-time Status</p>
                </div>
              </div>
            </div>

            {/* Time and Status */}
            <div className="flex flex-col items-end gap-2">
              <div className="text-4xl lg:text-5xl font-mono font-bold text-foreground tabular-nums">
                {formatTime(currentTime)}
              </div>
              <div className="text-muted-foreground">{formatDate(currentTime)}</div>
              <div className="flex items-center gap-2 mt-2">
                {connected ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/20 border border-accent/30">
                    <Wifi className="w-4 h-4 text-accent" />
                    <span className="text-sm text-accent font-medium">Live</span>
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/20 border border-destructive/30">
                    <WifiOff className="w-4 h-4 text-destructive" />
                    <span className="text-sm text-destructive font-medium">Disconnected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 animate-slide-up">
            <p className="text-muted-foreground text-sm mb-1">Total Slots</p>
            <p className="text-4xl font-bold text-foreground">{slots.length}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/20 backdrop-blur border border-emerald-500/30 rounded-2xl p-6 animate-slide-up stagger-1">
            <p className="text-emerald-400 text-sm mb-1">Available</p>
            <p className="text-4xl font-bold text-emerald-400">{availableCount}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/20 backdrop-blur border border-amber-500/30 rounded-2xl p-6 animate-slide-up stagger-2">
            <p className="text-amber-400 text-sm mb-1">Occupied</p>
            <p className="text-4xl font-bold text-amber-400">{occupiedCount}</p>
          </div>
          <div className="bg-card/80 backdrop-blur border border-border rounded-2xl p-6 animate-slide-up stagger-3">
            <p className="text-muted-foreground text-sm mb-1">Occupancy</p>
            <p className="text-4xl font-bold text-foreground">
              {slots.length > 0 ? Math.round((occupiedCount / slots.length) * 100) : 0}%
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-16 h-16 text-primary animate-spin mb-4" />
            <p className="text-xl text-muted-foreground">Loading parking data...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6">
              <WifiOff className="w-10 h-10 text-destructive" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">Connection Error</h3>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Attempting to reconnect...</p>
          </div>
        )}

        {/* Slots Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {slots.map((slot, index) => {
              const visual = getSlotVisual(slot.status)
              return (
                <div
                  key={slot._id}
                  className={`
                    relative overflow-hidden rounded-3xl border-2 p-6 lg:p-8 
                    transition-all duration-500 hover:scale-[1.02]
                    ${visual.bgClass} ${visual.borderClass}
                    animate-scale-in
                  `}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Slot Number */}
                  <div className="text-center mb-6">
                    <span className="text-6xl lg:text-7xl font-bold text-foreground/20">
                      {slot.slotId.replace("SLOT-", "")}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div
                      className={`w-16 h-16 rounded-2xl ${visual.iconBg} flex items-center justify-center shadow-lg ${visual.pulseClass}`}
                    >
                      {visual.icon}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <p className={`text-xl font-bold ${visual.labelClass}`}>{visual.label}</p>
                    <p className="text-sm text-muted-foreground mt-1">{slot.slotId}</p>

                    {/* Time remaining for active/paid slots */}
                    {slot.status === "ACTIVE" && slot.remainingMinutes > 0 && (
                      <div className="mt-3 px-3 py-1.5 rounded-full bg-background/50 inline-block">
                        <span className="text-sm text-amber-400 font-medium">{slot.remainingMinutes} min left</span>
                      </div>
                    )}

                    {slot.status === "OVERSTAY" && slot.exceededMinutes > 0 && (
                      <div className="mt-3 px-3 py-1.5 rounded-full bg-red-500/20 inline-block animate-pulse">
                        <span className="text-sm text-red-400 font-medium">+{slot.exceededMinutes} min over</span>
                      </div>
                    )}

                    {/* Price for paid slots */}
                    {slot.status === "PAID" && slot.price > 0 && (
                      <div className="mt-3 px-3 py-1.5 rounded-full bg-background/50 inline-block">
                        <span className="text-sm text-blue-400 font-medium">{formatPrice(slot.price)}</span>
                      </div>
                    )}
                  </div>

                  {/* Glow effect for available slots */}
                  {slot.status === "AVAILABLE" && (
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-500/5 to-transparent animate-pulse" />
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && slots.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <Car className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-2">No Parking Slots</h3>
            <p className="text-muted-foreground">Initialize slots from the admin panel.</p>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 text-center text-sm text-muted-foreground animate-fade-in">
          <p>Last updated: {formatTime(lastUpdate)}</p>
          <p className="mt-1">Prepaid Parking System - Entrance Monitor</p>
        </footer>
      </div>
    </div>
  )
}
