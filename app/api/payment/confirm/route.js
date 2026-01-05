
import { NextResponse } from "next/server"
import { findActiveSession, updateSlot, setPendingCommand } from "@/lib/parking-store"
import { pushCommand } from "@/lib/command-emitter"

export async function POST(request) {
  try {
    const { slotId, minutes } = await request.json()

    if (!slotId || !minutes) {
      return NextResponse.json({ success: false, error: "slotId and minutes are required" }, { status: 400 })
    }

    const existingSession = await findActiveSession(slotId)

    if (existingSession) {
     
      if (existingSession.status === "OVERSTAY") {
        const updated = await updateSlot(slotId, {
          paidMinutes: existingSession.paidMinutes + minutes,
          status: "ACTIVE",
          overstayMinutes: 0,
        })

        await setPendingCommand(slotId, "UNLOCK")
        pushCommand(slotId, "UNLOCK")

        console.log(`[PAYMENT] Extra payment for slot ${slotId}: ${minutes} minutes added`)
        console.log(`[ESP COMMAND] Sending UNLOCK command to slot ${slotId}`)

        return NextResponse.json({
          success: true,
          message: "Extra payment confirmed, slot unlocked",
          session: updated,
          espCommand: "UNLOCK",
        })
      }

      return NextResponse.json({ success: false, error: "Slot already has an active session" }, { status: 400 })
    }

    const updated = await updateSlot(slotId, {
      status: "PAID",
      paidMinutes: minutes,
      startTime: null,
      endTime: null,
      overstayMinutes: 0,
    })

    await setPendingCommand(slotId, "OPEN_BARRIER")
    pushCommand(slotId, "OPEN_BARRIER")

    console.log(`[PAYMENT] Payment confirmed for slot ${slotId}: ${minutes} minutes`)
    console.log(`[ESP COMMAND] Sending OPEN_BARRIER command to slot ${slotId}`)

    return NextResponse.json({
      success: true,
      message: "Payment confirmed, barrier will open",
      session: updated,
      espCommand: "OPEN_BARRIER",
    })
  } catch (error) {
    console.error("Error confirming payment:", error)
    return NextResponse.json({ success: false, error: "Failed to confirm payment" }, { status: 500 })
  }
}
