/**
 * MongoDB Parking Store
 * Handles all database operations for parking slots
 */

import clientPromise from "./mongodb"

const DB_NAME = "parking_system"
const COLLECTION_NAME = "slots"

// Get the slots collection
async function getCollection() {
  const client = await clientPromise
  return client.db(DB_NAME).collection(COLLECTION_NAME)
}

// Helper function to calculate time remaining
export function calculateTimeInfo(session) {
  if (!session.startTime || session.status === "COMPLETED" || session.status === "AVAILABLE") {
    return { remainingMinutes: 0, exceededMinutes: 0 }
  }

  const now = new Date()
  const startTime = new Date(session.startTime)
  const elapsedMs = now.getTime() - startTime.getTime()
  const elapsedMinutes = Math.floor(elapsedMs / (1000 * 60))
  const remainingMinutes = (session.paidMinutes || 0) - elapsedMinutes

  if (remainingMinutes > 0) {
    return { remainingMinutes, exceededMinutes: 0 }
  } else {
    // Return absolute value of negative remaining time as exceeded minutes
    return {
      remainingMinutes: 0,
      exceededMinutes: Math.abs(remainingMinutes),
    }
  }
}

// Get all slots
export async function getAllSlots() {
  const collection = await getCollection()
  const slots = await collection.find({}).toArray()

  const updatedSlots = []

  for (const slot of slots) {
    const timeInfo = calculateTimeInfo(slot)

    let finalStatus = slot.status
    if (timeInfo.exceededMinutes > 0 && (slot.status === "ACTIVE" || slot.status === "PAID")) {
      finalStatus = "OVERSTAY"
      await collection.updateOne({ _id: slot._id }, { $set: { status: "OVERSTAY", updatedAt: new Date() } })
    }

    updatedSlots.push({
      ...slot,
      _id: slot._id.toString(),
      status: finalStatus,
      remainingMinutes: timeInfo.remainingMinutes,
      // Fallback to overstayMinutes if exceededMinutes is 0 but it's an overstay
      exceededMinutes: timeInfo.exceededMinutes || slot.overstayMinutes || 0,
    })
  }

  return updatedSlots
}

// Find slot by slotId
export async function findSlotBySlotId(slotId) {
  const collection = await getCollection()
  return await collection.findOne({ slotId })
}

// Find active session for slot
export async function findActiveSession(slotId) {
  const collection = await getCollection()
  return await collection.findOne({
    slotId,
    status: { $in: ["PAID", "ACTIVE", "OVERSTAY"] },
  })
}

// Update slot
export async function updateSlot(slotId, updates) {
  const collection = await getCollection()
  const result = await collection.findOneAndUpdate({ slotId }, { $set: updates }, { returnDocument: "after" })
  return result
}

// Reset slot to available
export async function resetSlot(slotId) {
  const collection = await getCollection()
  const result = await collection.findOneAndUpdate(
    { slotId },
    {
      $set: {
        status: "AVAILABLE",
        paidMinutes: 0,
        startTime: null,
        endTime: null,
        overstayMinutes: 0,
        updatedAt: new Date(),
      },
    },
    { returnDocument: "after" },
  )
  return result
}

// Initialize slots (creates them if they don't exist)
export async function initializeSlots(count = 4) {
  const collection = await getCollection()

  // Clear existing slots
  await collection.deleteMany({})

  // Create new slots
  const slots = []
  for (let i = 1; i <= count; i++) {
    slots.push({
      slotId: `SLOT-${i}`,
      status: "AVAILABLE",
      paidMinutes: 0,
      startTime: null,
      endTime: null,
      overstayMinutes: 0,
      createdAt: new Date(),
    })
  }

  await collection.insertMany(slots)
  return await getAllSlots()
}

// Ensure slots exist (called on first load)
export async function ensureSlotsExist(count = 4) {
  const collection = await getCollection()
  const existingCount = await collection.countDocuments()

  if (existingCount === 0) {
    return await initializeSlots(count)
  }

  return await getAllSlots()
}

export async function addSlot(slotId) {
  const collection = await getCollection()

  // Check if slot already exists
  const existing = await collection.findOne({ slotId })
  if (existing) {
    return { error: "Slot already exists" }
  }

  const newSlot = {
    slotId,
    status: "AVAILABLE",
    paidMinutes: 0,
    startTime: null,
    endTime: null,
    overstayMinutes: 0,
    createdAt: new Date(),
  }

  await collection.insertOne(newSlot)
  return { success: true, slot: newSlot }
}

export async function deleteSlot(slotId) {
  const collection = await getCollection()
  const result = await collection.deleteOne({ slotId })
  return result.deletedCount > 0
}

export async function getNextSlotNumber() {
  const collection = await getCollection()
  const slots = await collection.find({}).sort({ createdAt: -1 }).toArray()

  if (slots.length === 0) return 1

  // Find highest slot number
  let maxNum = 0
  for (const slot of slots) {
    const match = slot.slotId.match(/SLOT-(\d+)/)
    if (match) {
      const num = Number.parseInt(match[1], 10)
      if (num > maxNum) maxNum = num
    }
  }

  return maxNum + 1
}

export async function setPendingCommand(slotId, command) {
  const collection = await getCollection()
  return await collection.updateOne({ slotId }, { $set: { pendingCommand: command, updatedAt: new Date() } })
}

export async function clearPendingCommand(slotId) {
  const collection = await getCollection()
  return await collection.updateOne({ slotId }, { $set: { pendingCommand: null, updatedAt: new Date() } })
}

export async function getSlotWithFreshTime(slotId) {
  const collection = await getCollection()
  let slot = await collection.findOne({ slotId })
  if (!slot) return null

  const timeInfo = calculateTimeInfo(slot)

  let finalStatus = slot.status
  if (timeInfo.exceededMinutes > 0 && (slot.status === "ACTIVE" || slot.status === "PAID")) {
    finalStatus = "OVERSTAY"
    await collection.updateOne(
      { _id: slot._id }, 
      { $set: { 
        status: "OVERSTAY",
        pendingCommand: "LOCK_BARRIER",
        updatedAt: new Date() 
      } }
    )
    
    // Refresh slot data after update
    slot = await collection.findOne({ slotId })
  }

  return {
    ...slot,
    _id: slot._id.toString(),
    status: finalStatus,
    remainingMinutes: timeInfo.remainingMinutes,
    exceededMinutes: timeInfo.exceededMinutes || slot.overstayMinutes || 0,
    pendingCommand: slot.pendingCommand || null,
  }
}