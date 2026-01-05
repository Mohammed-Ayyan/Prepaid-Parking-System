import { getEmitter } from "@/lib/command-emitter"

/**
 * GET /api/iot/stream?slotId=SLOT-X
 * Established a persistent SSE connection for the hardware to receive instant commands.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const slotId = searchParams.get("slotId")

  if (!slotId) {
    return new Response("Missing slotId", { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      const emit = (command) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ command })}\n\n`))
        } catch (e) {
          console.error(`[SSE] Failed to emit to ${slotId}:`, e)
        }
      }

      const emitters = getEmitter(slotId)
      emitters.add(emit)

      
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": keep-alive\n\n"))
        } catch (e) {
          
          clearInterval(keepAlive)
        }
      }, 30000)

      request.signal.addEventListener("abort", () => {
        clearInterval(keepAlive)
        emitters.delete(emit)
        console.log(`[SSE] Connection closed for ${slotId}`)
      })
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
