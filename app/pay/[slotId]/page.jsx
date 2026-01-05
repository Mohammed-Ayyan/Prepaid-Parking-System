/**
 * Payment Page
 * Modern payment interface with custom duration slider
 */

"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Header from "@/components/parking/header"
import { CreditCard, CheckCircle, AlertCircle, Loader2, Sparkles, Timer, Zap } from "lucide-react"

const PRICE_PER_30_MIN = 20
const OVERSTAY_PENALTY_RATE = 40 // ₹40 per 30 min for overstay

export default function PaymentPage() {
  const params = useParams()
  const slotId = params.slotId
  const router = useRouter()

  const [slotData, setSlotData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [customMinutes, setCustomMinutes] = useState(60)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Fetch slot data and check for overstay
  useEffect(() => {
    async function fetchSlot() {
      try {
        const res = await fetch(`/api/slots?slotId=${slotId}`)
        const data = await res.json()
        if (data.success) {
          setSlotData(data.slot)
          const exceeded = data.slot.exceededMinutes || data.slot.overstayMinutes || 0

          // If overstaying, set customMinutes to exactly the exceeded time initially
          if (data.slot.status === "OVERSTAY") {
            setCustomMinutes(Math.max(15, Math.ceil(exceeded / 15) * 15))
          }
        }
      } catch (err) {
        console.error("[v0] Error fetching slot:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchSlot()
  }, [slotId])

  const isOverstay = slotData?.status === "OVERSTAY"

  // Calculate price based on status (regular vs overstay penalty)
  const price = useMemo(() => {
    const rate = isOverstay ? OVERSTAY_PENALTY_RATE : PRICE_PER_30_MIN
    return (customMinutes / 30) * rate
  }, [customMinutes, isOverstay])

  // Format duration display
  function formatDuration(minutes) {
    if (minutes < 60) return `${minutes} minutes`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (mins === 0) return `${hours} hour${hours > 1 ? "s" : ""}`
    return `${hours}h ${mins}m`
  }

  async function handlePayment() {
    setProcessing(true)
    setError(null)

    try {
      const response = await fetch("/api/payment/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId, minutes: customMinutes }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(true)
        setTimeout(() => router.push("/dashboard"), 2500)
      } else {
        setError(data.error || "Payment failed. Please try again.")
      }
    } catch (err) {
      console.error("Payment error:", err)
      setError("Cannot connect to server. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header title={isOverstay ? "Overstay Payment" : "Payment"} showBack backHref="/dashboard" showNav={false} />

      <main className="max-w-lg mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Checking slot status...</p>
          </div>
        ) : success ? (
          <div className="text-center py-12 animate-scale-in">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-accent/30 to-accent/10 flex items-center justify-center animate-pulse-glow">
              <CheckCircle className="w-12 h-12 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground mb-2">Barrier will open for {slotId}</p>
            <p className="text-sm text-accent font-medium mb-4">Duration: {formatDuration(customMinutes)}</p>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              Redirecting to dashboard...
            </div>
          </div>
        ) : (
          <>
            {/* Payment Card */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden animate-slide-up shadow-xl">
              {/* Header */}
              <div
                className={`bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 p-6 border-b border-border relative overflow-hidden ${
                  isOverstay
                    ? "bg-gradient-to-r from-destructive/20 via-orange-500/10 to-destructive/20"
                    : "bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20"
                }`}
              >
                <div className="absolute inset-0 animate-shimmer" />
                <div className="relative flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
                      isOverstay
                        ? "bg-gradient-to-br from-destructive to-orange-500"
                        : "bg-gradient-to-br from-primary to-accent"
                    }`}
                  >
                    {isOverstay ? (
                      <AlertCircle className="w-7 h-7 text-white" />
                    ) : (
                      <CreditCard className="w-7 h-7 text-primary-foreground" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">
                      {isOverstay ? "Overstay Settlement" : "Reserve Parking"}
                    </h2>
                    <p className="text-muted-foreground">{slotId}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Warning for overstay users */}
                {isOverstay && (
                  <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 animate-pulse">
                    <p className="text-sm font-semibold text-orange-500 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Overstay Detected: {slotData.exceededMinutes || slotData.overstayMinutes || 0} minutes
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Please pay for the exceeded time plus any additional time you need to exit.
                    </p>
                  </div>
                )}

                {/* Error Message */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/30 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <Timer className="w-4 h-4 text-primary" />
                    {isOverstay ? "Additional Duration to Pay" : "Select Parking Duration"}
                  </label>

                  {/* Duration Display */}
                  <div className="text-center py-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl border border-primary/20">
                    <p className="text-4xl font-bold text-foreground mb-1">{formatDuration(customMinutes)}</p>
                    <p className="text-muted-foreground text-sm">Parking time</p>
                  </div>

                  <div className="px-2">
                    <input
                      type="range"
                      min={
                        isOverstay
                          ? Math.max(
                              15,
                              Math.ceil((slotData.exceededMinutes || slotData.overstayMinutes || 0) / 15) * 15,
                            )
                          : "15"
                      }
                      max="1440"
                      step="15"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Number(e.target.value))}
                      className="w-full h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2">
                      <span>
                        {isOverstay
                          ? formatDuration(
                              Math.max(
                                15,
                                Math.ceil((slotData.exceededMinutes || slotData.overstayMinutes || 0) / 15) * 15,
                              ),
                            )
                          : "15 min"}
                      </span>
                      <span>24 hours</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center">
                    {slotData && slotData.status === "OVERSTAY" ? (
                      <button
                        key={slotData.id || "overstay"}
                        onClick={() =>
                          setCustomMinutes(
                            Math.max(
                              15,
                              Math.ceil((slotData.exceededMinutes || slotData.overstayMinutes || 0) / 15) * 15,
                            ),
                          )
                        }
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      >
                        {formatDuration(
                          Math.max(
                            15,
                            Math.ceil((slotData.exceededMinutes || slotData.overstayMinutes || 0) / 15) * 15,
                          ),
                        )}
                      </button>
                    ) : (
                      <>
                        {(
                          slotData?.presets || [
                            { label: "1h", minutes: 60 },
                            { label: "2h", minutes: 120 },
                            { label: "4h", minutes: 240 },
                            { label: "8h", minutes: 480 },
                            { label: "12h", minutes: 720 },
                            { label: "24h", minutes: 1440 },
                          ]
                        ).map((preset) => (
                          <button
                            key={preset.minutes}
                            onClick={() => setCustomMinutes(preset.minutes)}
                            className={`
                              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300
                              ${
                                customMinutes === preset.minutes
                                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                              }
                            `}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                {/* Price Summary */}
                <div className="bg-muted/50 rounded-xl p-5 space-y-3 border border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium text-foreground">{formatDuration(customMinutes)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Rate</span>
                    <span className="font-medium text-foreground">
                      ₹{isOverstay ? OVERSTAY_PENALTY_RATE : PRICE_PER_30_MIN}/30 min
                      {isOverstay && " (Penalty Rate)"}
                    </span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between items-center">
                    <span className="font-medium text-foreground">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        ₹{price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notice */}
                <div className="flex items-start gap-3 p-4 rounded-xl bg-chart-3/10 border border-chart-3/30">
                  <Sparkles className="w-5 h-5 text-chart-3 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="text-sm font-medium text-chart-3">Demo Mode</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This is an academic project. No real payment will be processed.
                    </p>
                  </div>
                </div>

                {/* Confirm Button */}
                <button
                  onClick={handlePayment}
                  disabled={processing}
                  className="group w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground font-semibold rounded-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,146,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 group-hover:animate-pulse" />
                      Confirm Payment - ₹{price.toFixed(2)}
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
