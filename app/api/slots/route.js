

import { NextResponse } from "next/server"
import { ensureSlotsExist, getSlotWithFreshTime } from "@/lib/parking-store"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const slotId = searchParams.get("slotId")

    if (slotId) {
      const slot = await getSlotWithFreshTime(slotId)
      if (!slot) {
        return NextResponse.json({ success: false, error: "Slot not found" }, { status: 404 })
      }
      return NextResponse.json({ success: true, slot })
    }

    const slots = await ensureSlotsExist()
    return NextResponse.json({ success: true, slots })
  } catch (error) {
    console.error("Error fetching slots:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch slots" }, { status: 500 })
  }
}
