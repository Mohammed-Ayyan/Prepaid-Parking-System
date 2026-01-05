/**
 * Parking Slot Card Component
 * Displays individual parking slot with status and actions
 */

"use client"

import Link from "next/link"
import { Car, Clock, AlertTriangle, CreditCard, CheckCircle } from "lucide-react"

export default function SlotCard({ slot, index = 0, showPayButton = true }) {
  // Get status styling
  function getStatusStyles(status) {
    switch (status) {
      case "AVAILABLE":
        return {
          bg: "bg-accent/10 border-accent/30",
          badge: "bg-accent/20 text-accent",
          icon: <CheckCircle className="w-5 h-5" />,
          glow: "hover:shadow-[0_0_30px_rgba(74,222,128,0.2)]",
        }
      case "PAID":
        return {
          bg: "bg-primary/10 border-primary/30",
          badge: "bg-primary/20 text-primary",
          icon: <CreditCard className="w-5 h-5" />,
          glow: "hover:shadow-[0_0_30px_rgba(99,146,255,0.2)]",
        }
      case "ACTIVE":
        return {
          bg: "bg-chart-3/10 border-chart-3/30",
          badge: "bg-chart-3/20 text-chart-3",
          icon: <Car className="w-5 h-5" />,
          glow: "hover:shadow-[0_0_30px_rgba(234,179,8,0.2)]",
        }
      case "OVERSTAY":
        return {
          bg: "bg-destructive/10 border-destructive/30",
          badge: "bg-destructive/20 text-destructive",
          icon: <AlertTriangle className="w-5 h-5" />,
          glow: "hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]",
        }
      default:
        return {
          bg: "bg-muted border-border",
          badge: "bg-muted text-muted-foreground",
          icon: <Clock className="w-5 h-5" />,
          glow: "",
        }
    }
  }

  // Format time display
  function formatTime(minutes) {
    if (minutes <= 0) return "0 min"
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const styles = getStatusStyles(slot.status)

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl border-2 p-6 transition-all duration-300
        ${styles.bg} ${styles.glow}
        animate-fade-in opacity-0
        hover:scale-[1.02] hover:-translate-y-1
      `}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-foreground/5 to-transparent rounded-bl-full" />

      {/* Slot header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-foreground">{slot.slotId}</h3>
          <div
            className={`inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full text-sm font-medium ${styles.badge}`}
          >
            {styles.icon}
            <span>{slot.status}</span>
          </div>
        </div>

        {/* Animated indicator */}
        {slot.status === "ACTIVE" && (
          <div className="relative">
            <div className="w-3 h-3 bg-chart-3 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-chart-3 rounded-full animate-ping" />
          </div>
        )}
        {slot.status === "OVERSTAY" && (
          <div className="relative">
            <div className="w-3 h-3 bg-destructive rounded-full animate-pulse" />
            <div className="absolute inset-0 w-3 h-3 bg-destructive rounded-full animate-ping" />
          </div>
        )}
      </div>

      {/* Time information */}
      <div className="min-h-[60px] mb-4">
        {slot.status === "ACTIVE" && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Time Remaining</p>
            <p className="text-2xl font-bold text-chart-3">{formatTime(slot.remainingMinutes)}</p>
          </div>
        )}

        {slot.status === "OVERSTAY" && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Time Exceeded</p>
            <p className="text-2xl font-bold text-destructive">
              +{formatTime(slot.exceededMinutes || slot.overstayMinutes)}
            </p>
          </div>
        )}

        {slot.status === "PAID" && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Paid Duration</p>
            <p className="text-2xl font-bold text-primary">{formatTime(slot.paidMinutes)}</p>
            <p className="text-xs text-muted-foreground animate-pulse">Waiting for car...</p>
          </div>
        )}

        {slot.status === "AVAILABLE" && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ready</p>
            <p className="text-lg font-medium text-accent">Available for parking</p>
          </div>
        )}
      </div>

      {/* Action button */}
      {showPayButton && (slot.status === "AVAILABLE" || slot.status === "OVERSTAY") && (
        <Link
          href={`/pay/${slot.slotId}`}
          className={`
            block w-full text-center py-3 rounded-lg font-medium transition-all duration-300
            ${
              slot.status === "OVERSTAY"
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-primary text-primary-foreground hover:bg-primary/90"
            }
            hover:shadow-lg active:scale-[0.98]
          `}
        >
          {slot.status === "OVERSTAY" ? "Pay Overstay" : "Reserve & Pay"}
        </Link>
      )}
    </div>
  )
}
