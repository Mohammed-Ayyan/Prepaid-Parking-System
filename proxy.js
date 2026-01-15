import { NextResponse } from 'next/server'

export function proxy(request) {
  const url = request.nextUrl.pathname

  // Only protect API routes
  if (url.startsWith('/api/')) {
    // Allow these public endpoints (if you want login/auth to work)
    const publicEndpoints = ['/api/auth']
    if (publicEndpoints.some(endpoint => url.startsWith(endpoint))) {
      return NextResponse.next()
    }

    // Get request info
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    const referer = request.headers.get('referer')
    const userAgent = request.headers.get('user-agent') || ''

    // Block common API testing tools
    const blockedAgents = ['postman', 'insomnia', 'curl', 'wget', 'python-requests', 'axios']
    const isBlockedTool = blockedAgents.some(agent => userAgent.toLowerCase().includes(agent))

    if (isBlockedTool) {
      console.log(`[BLOCKED] API tool detected: ${userAgent}`)
      // Return empty response that hangs - no status, no body
      return new Promise(() => {}) // Never resolves = timeout
    }

    // Check if request is from same origin
    // For server-side Next.js requests, there's no origin but referer should be present
    const hasValidReferer = referer && referer.includes(host)
    const hasValidOrigin = origin && origin.includes(host)

    // Allow ONLY if:
    // - Has valid referer from same domain, OR
    // - Has valid origin from same domain
    // - No origin AND no referer = BLOCK (this blocks Postman/curl/ESP)
    if (!hasValidReferer && !hasValidOrigin) {
      console.log(`[BLOCKED] External request to ${url}`)
      console.log(`  Origin: ${origin}`)
      console.log(`  Referer: ${referer}`)
      console.log(`  User-Agent: ${userAgent}`)
      // Return empty response that hangs - no status, no body
      return new Promise(() => {}) // Never resolves = timeout
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}