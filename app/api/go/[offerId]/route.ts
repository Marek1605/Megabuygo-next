import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.API_URL || 'http://localhost:3000'

export async function POST(
  request: NextRequest,
  { params }: { params: { offerId: string } }
) {
  const offerId = params.offerId

  try {
    // Forward to Go backend
    const res = await fetch(`${API_URL}/api/v1/go/${offerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.ok) {
      const data = await res.json()
      return NextResponse.json(data)
    }

    // Fallback - just return the offer ID for redirect
    return NextResponse.json({ redirect_url: null, offer_id: offerId })
  } catch (error) {
    console.error('Click tracking error:', error)
    return NextResponse.json({ redirect_url: null, offer_id: offerId })
  }
}
