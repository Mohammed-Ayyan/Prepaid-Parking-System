// This utility manages real-time event listeners for each parking slot.
// It uses globalThis to maintain state across Hot Module Replacement in development.
if (!globalThis.commandEmitters) {
  globalThis.commandEmitters = new Map()
}

/**
 * Gets the set of listener functions for a specific slot.
 */
export const getEmitter = (slotId) => {
  if (!globalThis.commandEmitters.has(slotId)) {
    globalThis.commandEmitters.set(slotId, new Set())
  }
  return globalThis.commandEmitters.get(slotId)
}

/**
 * Pushes a command to all hardware devices listening to a specific slot.
 */
export const pushCommand = (slotId, command) => {
  const emitters = getEmitter(slotId)
  console.log(`[v0] Pushing command ${command} to ${emitters.size} listeners for ${slotId}`)
  emitters.forEach((emit) => emit(command))
}
