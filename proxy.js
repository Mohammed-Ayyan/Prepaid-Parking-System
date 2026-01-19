import { NextResponse } from 'next/server'

export function proxy(request) {
  const url = request.nextUrl.pathname

  // Bot protection for API routes
  if (url.startsWith('/api/')) {
    // Allow public endpoints
    const publicEndpoints = ['/api/auth']
    if (publicEndpoints.some(endpoint => url.startsWith(endpoint))) {
      return NextResponse.next()
    }

    // === METHOD 1: IP-based bot blocking ===
    const clientIP = 
      request.headers.get('x-forwarded-for')?.split(',')[0] || 
      request.headers.get('x-real-ip') ||
      request.ip ||
      'unknown'

    // Block known malicious IPs
    const blockedIPs = [
      '10.223.143.13',  // Suspicious bot traffic
      // Add more suspicious IPs here
    ]

    if (blockedIPs.includes(clientIP)) {
      console.log(`[SECURITY] Bot traffic blocked from IP ${clientIP} at ${url}`)
      return new Promise(() => {})
    }

    // === METHOD 2: Bot fingerprinting ===
    const userAgent = request.headers.get('user-agent') || ''
    const accept = request.headers.get('accept') || ''
    const acceptLanguage = request.headers.get('accept-language')
    const secFetchSite = request.headers.get('sec-fetch-site')
    const secFetchMode = request.headers.get('sec-fetch-mode')
    
    // Whitelist legitimate API clients
    const isLegitimateClient = (
      userAgent.includes('Postman') ||
      userAgent.includes('curl') ||
      userAgent.includes('Insomnia') ||
      userAgent.includes('HTTPie') ||
      userAgent.includes('python-requests')
    )
    
    // Verify browser legitimacy
    const isLegitBrowser = (
      acceptLanguage !== null ||
      secFetchSite !== null ||
      secFetchMode !== null ||
      accept.includes('text/html') ||
      userAgent.includes('Mozilla') ||
      userAgent.includes('Chrome') ||
      userAgent.includes('Safari') ||
      userAgent.includes('Firefox') ||
      userAgent.includes('Edge')
    )

    // Detect bot-like patterns (missing browser headers, suspicious UA)
    const isSuspiciousBot = (
      !isLegitBrowser &&
      !isLegitimateClient &&
      (userAgent === '' || 
       userAgent.length < 10 ||
       (accept === '' || accept === '*/*'))
    )

    if (isSuspiciousBot) {
      console.log(`[SECURITY] Suspicious bot detected and blocked at ${url}`)
      console.log(`  IP: ${clientIP}`)
      console.log(`  User-Agent: "${userAgent}"`)
      console.log(`  Accept: "${accept}"`)
      return new Promise(() => {})
    }

    // Allow legitimate traffic (browsers and known API tools)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}