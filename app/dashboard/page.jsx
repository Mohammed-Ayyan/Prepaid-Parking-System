
"use client"

import { useState, useEffect } from "react"
import Header from "@/components/parking/header"
import SlotCard from "@/components/parking/slot-card"
import StatusLegend from "@/components/parking/status-legend"
import { RefreshCw, AlertCircle, Loader2 } from "lucide-react"

export default function DashboardPage() {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)

  async function fetchSlots(showRefreshing = false) {
    if (showRefreshing) setRefreshing(true)

    try {
      const response = await fetch("/api/slots")
      const data = await response.json()

      if (data.success) {
        setSlots(data.slots)
        setError(null)
      } else {
        setError(data.error || "Failed to fetch slots")
      }
    } catch (err) {
      console.error("Error fetching slots:", err)
      setError("Cannot connect to server. Please refresh the page.")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchSlots()
    const interval = setInterval(() => fetchSlots(), 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Header title="Parking Dashboard" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with refresh button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Available Slots</h2>
            <p className="text-muted-foreground mt-1">Real-time parking availability</p>
          </div>
          <button
            onClick={() => fetchSlots(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading parking slots...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 mb-8 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-destructive">{error}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Make sure MongoDB is configured and the database is accessible.
              </p>
            </div>
          </div>
        )}

        {/* Slots Grid */}
        {!loading && !error && slots.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {slots.map((slot, index) => (
              <SlotCard key={slot._id} slot={slot} index={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && slots.length === 0 && (
          <div className="text-center py-20 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
              <AlertCircle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No Parking Slots</h3>
            <p className="text-muted-foreground mb-6">Initialize slots from the admin panel to get started.</p>
            <a
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Go to Admin Panel
            </a>
          </div>
        )}

        {/* Status Legend */}
        {!loading && !error && slots.length > 0 && <StatusLegend />}
      </main>
    </div>
  )
}
