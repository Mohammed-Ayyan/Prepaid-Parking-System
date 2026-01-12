import { NextResponse } from "next/server"
import { findActiveSession, updateSlot, calculateTimeInfo, setPendingCommand } from "@/lib/parking-store"
import { pushCommand } from "@/lib/command-emitter"

export async function POST(request) {
  try {
    const { slotId, event } = await request.json()

    if (!slotId || !event) {
      return NextResponse.json({ success: false, error: "slotId and event are required" }, { status: 400 })
    }

    console.log(`[IOT EVENT] Received ${event} for slot ${slotId}`)

    const session = await findActiveSession(slotId)

    switch (event) {
      case "CAR_ENTERED":
        if (!session) {
          return NextResponse.json({ success: false, error: "No paid session found for this slot" }, { status: 400 })
        }

        const activatedSession = await updateSlot(slotId, {
          status: "ACTIVE",
          startTime: new Date().toISOString(),
        })

        console.log(`[IOT] Car entered slot ${slotId}, session now ACTIVE`)
        // Do NOT send any command - barrier stays open, Arduino will handle closing
        
        return NextResponse.json({ success: true, message: "Session activated", session: activatedSession })

      case "CAR_EXITED":
        if (!session) {
          return NextResponse.json({ success: true, message: "No active session, slot already available" })
        }

        const completedSession = await updateSlot(slotId, {
          status: "AVAILABLE",
          endTime: new Date().toISOString(),
          paidMinutes: 0,
          startTime: null,
          overstayMinutes: 0,
        })

        console.log(`[IOT] Car exited slot ${slotId}, session COMPLETED`)
        // Arduino automatically closes barrier on exit - no command needed
        
        return NextResponse.json({ success: true, message: "Session completed", session: completedSession })

      case "OVERSTAY":
        if (!session) {
          return NextResponse.json({ success: false, error: "No active session found for this slot" }, { status: 400 })
        }

        await setPendingCommand(slotId, "LOCK_BARRIER")
        pushCommand(slotId, "LOCK_BARRIER")
        
        const timeInfo = calculateTimeInfo(session)
        const overstaySession = await updateSlot(slotId, {
          status: "OVERSTAY",
          overstayMinutes: timeInfo.exceededMinutes,
        })

        console.log(`[IOT] Overstay detected for slot ${slotId}: ${timeInfo.exceededMinutes} minutes`)
        
        return NextResponse.json({
          success: true,
          message: "Overstay recorded, barrier locked",
          session: overstaySession,
          overstayMinutes: timeInfo.exceededMinutes,
          espCommand: "LOCK_BARRIER"
        })

      default:
        return NextResponse.json({ success: false, error: `Unknown event: ${event}` }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing IOT event:", error)
    return NextResponse.json({ success: false, error: "Failed to process event" }, { status: 500 })
  }
}