

import { NextResponse } from "next/server"
import { initializeSlots } from "@/lib/parking-store"

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const count = body.slotCount || 4

    const slots = await initializeSlots(count)
    console.log(`[INIT] Created ${count} parking slots`)

    return NextResponse.json({
      success: true,
      message: `Created ${count} slots`,
      slots,
    })
  } catch (error) {
    console.error("Error initializing slots:", error)
    return NextResponse.json({ success: false, error: "Failed to initialize slots" }, { status: 500 })
  }
}
