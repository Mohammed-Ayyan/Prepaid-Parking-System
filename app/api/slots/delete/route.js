

import { NextResponse } from "next/server"
import { deleteSlot, findSlotBySlotId } from "@/lib/parking-store"

export async function POST(request) {
  try {
    const { slotId } = await request.json()

    if (!slotId) {
      return NextResponse.json({ success: false, error: "slotId is required" }, { status: 400 })
    }

    
    const slot = await findSlotBySlotId(slotId)
    if (!slot) {
      return NextResponse.json({ success: false, error: `Slot ${slotId} not found` }, { status: 404 })
    }

    
    if (slot.status !== "AVAILABLE") {
      return NextResponse.json(
        { success: false, error: `Cannot delete slot ${slotId} - it is currently in use` },
        { status: 400 },
      )
    }

    const deleted = await deleteSlot(slotId)

    if (!deleted) {
      return NextResponse.json({ success: false, error: "Failed to delete slot" }, { status: 500 })
    }

    console.log(`[ADMIN] Slot deleted: ${slotId}`)

    return NextResponse.json({
      success: true,
      message: `Slot ${slotId} deleted successfully`,
    })
  } catch (error) {
    console.error("Error deleting slot:", error)
    return NextResponse.json({ success: false, error: "Failed to delete slot" }, { status: 500 })
  }
}
