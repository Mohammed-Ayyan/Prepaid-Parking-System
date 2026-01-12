
import { NextResponse } from "next/server"
import { findActiveSession, updateSlot, resetSlot, findSlotBySlotId, setPendingCommand } from "@/lib/parking-store"
import { pushCommand } from "@/lib/command-emitter"

export async function POST(request) {
  try {
    const { slotId, command } = await request.json()

    if (!slotId || !command) {
      return NextResponse.json({ success: false, error: "slotId and command are required" }, { status: 400 })
    }

    console.log(`[ADMIN] Received command ${command} for slot ${slotId}`)

    switch (command) {
      case "FORCE_OPEN_BARRIER":
        await setPendingCommand(slotId, "UNLOCK")
        pushCommand(slotId, "FORCE_OPEN_BARRIER")
        return NextResponse.json({
          success: true,
          message: "Barrier opened",
          espCommand: "FORCE_OPEN_BARRIER",
        })

      case "UNLOCK_SLOT":
        const activeSession = await findActiveSession(slotId)
        if (activeSession && activeSession.status === "OVERSTAY") {
          await updateSlot(slotId, { status: "ACTIVE", overstayMinutes: 0 })
        }

        await setPendingCommand(slotId, "UNLOCK")
        pushCommand(slotId, "UNLOCK")
        return NextResponse.json({
          success: true,
          message: "Slot unlocked",
          espCommand: "UNLOCK",
        })

      case "RESET_SLOT":
        const slotExists = await findSlotBySlotId(slotId)
        pushCommand(slotId, "LOCK_BARRIER")
        if (!slotExists) {
          return NextResponse.json({ success: false, error: `Slot ${slotId} not found` }, { status: 404 })
        }

        const resetResult = await resetSlot(slotId)
        console.log(`[ADMIN] Slot ${slotId} reset to AVAILABLE`, resetResult)

        return NextResponse.json({
          success: true,
          message: "Slot reset to available",
          slot: resetResult,
        })

      default:
        return NextResponse.json({ success: false, error: `Unknown command: ${command}` }, { status: 400 })
    }
  } catch (error) {
    console.error("Error processing admin command:", error)
    return NextResponse.json({ success: false, error: "Failed to process command" }, { status: 500 })
  }
}
