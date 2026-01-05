/**
 * Header Component
 * Reusable navigation header
 */

import Link from "next/link"
import { Car, ArrowLeft, Settings, LayoutDashboard, Monitor } from "lucide-react"

export default function Header({ title, showBack = false, backHref = "/", showNav = true }) {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {showBack ? (
              <Link
                href={backHref}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back</span>
              </Link>
            ) : (
              <Link href="/" className="flex items-center gap-2">
                <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-bold text-lg text-foreground hidden sm:inline">ParkSmart</span>
              </Link>
            )}

            {title && (
              <>
                <div className="w-px h-6 bg-border hidden sm:block" />
                <h1 className="text-lg font-semibold text-foreground">{title}</h1>
              </>
            )}
          </div>

          {/* Right side - Navigation */}
          {showNav && (
            <nav className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/entrance"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Monitor className="w-4 h-4" />
                <span className="hidden sm:inline">Monitor</span>
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  )
}
