
import { NextResponse } from "next/server"
import { getSlotWithFreshTime, clearPendingCommand } from "@/lib/parking-store"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const slotId = searchParams.get("slotId")

  if (!slotId) {
    return NextResponse.json({ error: "slotId is required" }, { status: 400 })
  }

  const slot = await getSlotWithFreshTime(slotId)
  if (!slot) {
    return NextResponse.json({ error: "Slot not found" }, { status: 404 })
  }

  const command = slot.pendingCommand

  
  if (command) {
    await clearPendingCommand(slotId)
    console.log(`[IOT] Command ${command} delivered to ${slotId} and cleared from DB`)
  }

  return NextResponse.json({
    slotId: slot.slotId,
    status: slot.status,
    command: command || "NONE",
  })
}
