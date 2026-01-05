
import { NextResponse } from "next/server"
import { addSlot, getNextSlotNumber } from "@/lib/parking-store"

export async function POST(request) {
  try {
    const body = await request.json()
    let { slotId } = body

    
    if (!slotId) {
      const nextNum = await getNextSlotNumber()
      slotId = `SLOT-${nextNum}`
    }

    const result = await addSlot(slotId)

    if (result.error) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 })
    }

    console.log(`[ADMIN] New slot added: ${slotId}`)

    return NextResponse.json({
      success: true,
      message: `Slot ${slotId} added successfully`,
      slot: result.slot,
    })
  } catch (error) {
    console.error("Error adding slot:", error)
    return NextResponse.json({ success: false, error: "Failed to add slot" }, { status: 500 })
  }
}
