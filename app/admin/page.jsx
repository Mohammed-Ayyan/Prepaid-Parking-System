/**
 * Admin Page
 * Protected admin panel with slot management
 */

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/parking/header"
import {
  Settings,
  RefreshCw,
  AlertCircle,
  Loader2,
  LogOut,
  Plus,
  Unlock,
  RotateCcw,
  DoorOpen,
  Car,
  Clock,
  Zap,
  Trash2,
  PlusCircle,
} from "lucide-react"

export default function AdminPage() {
  const router = useRouter()
  const [authenticated, setAuthenticated] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actionFeedback, setActionFeedback] = useState(null)
  const [newSlotName, setNewSlotName] = useState("")
  const [addingSlot, setAddingSlot] = useState(false)

  // Check authentication on load
  useEffect(() => {
    async function checkAuth() {
      try {
        const response = await fetch("/api/admin/auth")
        const data = await response.json()

        if (data.authenticated) {
          setAuthenticated(true)
          fetchSlots()
        } else {
          router.push("/admin/login")
        }
      } catch (err) {
        router.push("/admin/login")
      } finally {
        setCheckingAuth(false)
      }
    }
    checkAuth()
  }, [router])

  async function fetchSlots() {
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
      setError("Cannot connect to server.")
    } finally {
      setLoading(false)
    }
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" })
      router.push("/admin/login")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  async function initializeSlots() {
    showFeedback("info", "Initializing slots...")
    try {
      const response = await fetch("/api/slots/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotCount: 4 }),
      })

      const data = await response.json()

      if (data.success) {
        showFeedback("success", "Slots initialized successfully!")
        fetchSlots()
      } else {
        showFeedback("error", data.error || "Failed to initialize")
      }
    } catch (err) {
      showFeedback("error", "Failed to initialize slots")
    }
  }

  async function sendCommand(slotId, command) {
    showFeedback("info", `Sending ${command}...`)
    try {
      const response = await fetch("/api/admin/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, command }),
      })

      const data = await response.json()

      if (data.success) {
        showFeedback("success", `${command} sent to ${slotId}`)
        fetchSlots()
      } else {
        showFeedback("error", data.error || "Command failed")
      }
    } catch (err) {
      showFeedback("error", `Failed to send ${command}`)
    }
  }

  async function simulateEvent(slotId, event) {
    showFeedback("info", `Simulating ${event}...`)
    try {
      const response = await fetch("/api/iot/event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, event }),
      })

      const data = await response.json()

      if (data.success) {
        showFeedback("success", `Simulated ${event} for ${slotId}`)
        fetchSlots()
      } else {
        showFeedback("error", data.error || "Simulation failed")
      }
    } catch (err) {
      showFeedback("error", `Failed to simulate ${event}`)
    }
  }

  async function addNewSlot() {
    setAddingSlot(true)
    showFeedback("info", "Adding new slot...")

    try {
      const response = await fetch("/api/slots/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: newSlotName || undefined }),
      })

      const data = await response.json()

      if (data.success) {
        showFeedback("success", data.message)
        setNewSlotName("")
        fetchSlots()
      } else {
        showFeedback("error", data.error || "Failed to add slot")
      }
    } catch (err) {
      showFeedback("error", "Failed to add slot")
    } finally {
      setAddingSlot(false)
    }
  }

  async function deleteSlot(slotId) {
    if (!confirm(`Are you sure you want to delete ${slotId}? This action cannot be undone.`)) {
      return
    }

    showFeedback("info", `Deleting ${slotId}...`)

    try {
      const response = await fetch("/api/slots/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId }),
      })

      const data = await response.json()

      if (data.success) {
        showFeedback("success", data.message)
        fetchSlots()
      } else {
        showFeedback("error", data.error || "Failed to delete slot")
      }
    } catch (err) {
      showFeedback("error", "Failed to delete slot")
    }
  }

  function showFeedback(type, message) {
    setActionFeedback({ type, message })
    if (type !== "info") {
      setTimeout(() => setActionFeedback(null), 3000)
    }
  }

  function getStatusStyles(status) {
    switch (status) {
      case "AVAILABLE":
        return "bg-accent/10 border-accent/30"
      case "PAID":
        return "bg-primary/10 border-primary/30"
      case "ACTIVE":
        return "bg-chart-3/10 border-chart-3/30"
      case "OVERSTAY":
        return "bg-destructive/10 border-destructive/30"
      default:
        return "bg-muted border-border"
    }
  }

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    )
  }

  // Not authenticated - should redirect
  if (!authenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title="Admin Panel" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Settings className="w-6 h-6 text-primary" />
              Control Panel
            </h2>
            <p className="text-muted-foreground mt-1">Manage parking slots and simulate events</p>
          </div>
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>

        {/* Feedback Toast */}
        {actionFeedback && (
          <div
            className={`fixed top-20 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg animate-slide-up ${
              actionFeedback.type === "success"
                ? "bg-accent/20 border border-accent/30 text-accent"
                : actionFeedback.type === "error"
                  ? "bg-destructive/20 border border-destructive/30 text-destructive"
                  : "bg-primary/20 border border-primary/30 text-primary"
            }`}
          >
            {actionFeedback.type === "info" && <Loader2 className="w-4 h-4 animate-spin" />}
            <span className="text-sm font-medium">{actionFeedback.message}</span>
          </div>
        )}

        <div className="bg-card border border-border rounded-xl p-6 mb-6 animate-fade-in">
          <div className="flex flex-col gap-4">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-accent" />
                Add New Slot
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create a new parking slot. Leave name empty for auto-numbering.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Custom slot name (e.g., VIP-1) or leave empty"
                value={newSlotName}
                onChange={(e) => setNewSlotName(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                onClick={addNewSlot}
                disabled={addingSlot}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingSlot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add Slot
              </button>
            </div>
          </div>
        </div>

        {/* Initialize Section */}
        <div className="bg-card border border-border rounded-xl p-6 mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-foreground flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-primary" />
                System Reset
              </h3>
              <p className="text-sm text-muted-foreground mt-1">Reset all slots to default (4 slots)</p>
            </div>
            <button
              onClick={initializeSlots}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reset to 4 Slots
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 mb-8 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <p className="text-destructive">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-muted-foreground">Loading slots...</p>
          </div>
        )}

        {/* Slots Management */}
        {!loading && !error && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Manage Slots ({slots.length} total)</h3>
            </div>

            {slots.length === 0 ? (
              <div className="text-center py-12 bg-card border border-border rounded-xl">
                <p className="text-muted-foreground">No slots found. Add a new slot or reset to defaults.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {slots.map((slot, index) => (
                  <div
                    key={slot._id}
                    className={`border-2 rounded-xl p-6 transition-all animate-fade-in ${getStatusStyles(slot.status)}`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Slot Info Row */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-background/50 flex items-center justify-center">
                          <Car className="w-6 h-6 text-foreground" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-foreground">{slot.slotId}</h4>
                          <p className="text-sm text-muted-foreground">
                            Status: <span className="font-medium text-foreground">{slot.status}</span>
                            {slot.paidMinutes > 0 && ` • Paid: ${slot.paidMinutes} min`}
                          </p>
                        </div>
                      </div>

                      {/* Admin Commands */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => sendCommand(slot.slotId, "FORCE_OPEN_BARRIER")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          <DoorOpen className="w-4 h-4" />
                          Open Barrier
                        </button>
                        <button
                          onClick={() => sendCommand(slot.slotId, "UNLOCK_SLOT")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-chart-3 text-chart-3-foreground text-sm font-medium hover:bg-chart-3/90 transition-colors"
                        >
                          <Unlock className="w-4 h-4" />
                          Unlock
                        </button>
                        <button
                          onClick={() => sendCommand(slot.slotId, "RESET_SLOT")}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset
                        </button>
                        {slot.status === "AVAILABLE" && (
                          <button
                            onClick={() => deleteSlot(slot.slotId)}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-destructive/20 text-destructive text-sm font-medium hover:bg-destructive/30 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* IOT Simulation */}
                    <div className="pt-4 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5" />
                        Simulate IOT Events (for testing)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => simulateEvent(slot.slotId, "CAR_ENTERED")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                        >
                          <Car className="w-3.5 h-3.5" />
                          CAR_ENTERED
                        </button>
                        <button
                          onClick={() => simulateEvent(slot.slotId, "CAR_EXITED")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                        >
                          <Car className="w-3.5 h-3.5" />
                          CAR_EXITED
                        </button>
                        <button
                          onClick={() => simulateEvent(slot.slotId, "OVERSTAY")}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-xs font-medium hover:bg-secondary/80 transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          OVERSTAY
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* API Reference */}
        <div className="mt-12 bg-card border border-border rounded-xl p-6 animate-fade-in">
          <h3 className="font-semibold text-foreground mb-4">API Reference for ESP/Arduino</h3>
          <div className="bg-muted/50 rounded-lg p-4 font-mono text-sm space-y-2">
            <p className="text-primary">POST /api/iot/event</p>
            <p className="text-muted-foreground pl-4">Body: {'{ "slotId": "SLOT-1", "event": "CAR_ENTERED" }'}</p>
            <p className="text-muted-foreground pl-4">Events: CAR_ENTERED, CAR_EXITED, OVERSTAY</p>
          </div>
        </div>
      </main>
    </div>
  )
}
