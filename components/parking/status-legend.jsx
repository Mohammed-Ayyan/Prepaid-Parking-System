/**
 * Status Legend Component
 * Shows color coding for parking slot statuses
 */

import { CheckCircle, CreditCard, Car, AlertTriangle } from "lucide-react"

export default function StatusLegend() {
  const statuses = [
    { status: "AVAILABLE", label: "Ready for payment", icon: CheckCircle, color: "bg-accent" },
    { status: "PAID", label: "Waiting for car", icon: CreditCard, color: "bg-primary" },
    { status: "ACTIVE", label: "Car parked", icon: Car, color: "bg-chart-3" },
    { status: "OVERSTAY", label: "Time exceeded", icon: AlertTriangle, color: "bg-destructive" },
  ]

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border rounded-xl p-6 animate-fade-in">
      <h3 className="font-semibold text-foreground mb-4">Status Legend</h3>
      <div className="flex flex-wrap gap-4">
        {statuses.map(({ status, label, icon: Icon, color }) => (
          <div key={status} className="flex items-center gap-2">
            <div className={`w-3 h-3 ${color} rounded-full`} />
            <Icon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{status}</span> - {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
