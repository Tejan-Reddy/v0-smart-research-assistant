import { type NextRequest, NextResponse } from "next/server"
import { flexpriceService } from "@/lib/flexprice"

// GET /api/billing - Get user's billing usage and credits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const [usage, hasCredits] = await Promise.all([
      flexpriceService.getUserUsage(userId),
      flexpriceService.hasCredits(userId, 1) // Check if user has at least 1 credit
    ])

    const pricing = flexpriceService.getPricing()

    return NextResponse.json({
      success: true,
      usage,
      hasCredits,
      pricing,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Billing API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to get billing information",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

// POST /api/billing - Record usage and charge credits
export async function POST(request: NextRequest) {
  try {
    const { userId, eventType, metadata, credits } = await request.json()

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: "Missing required fields: userId, eventType" },
        { status: 400 }
      )
    }

    // Check if user has sufficient credits
    const hasCredits = await flexpriceService.hasCredits(userId, credits || 1)
    if (!hasCredits) {
      return NextResponse.json(
        { 
          error: "Insufficient credits",
          code: "INSUFFICIENT_CREDITS"
        },
        { status: 402 } // Payment Required
      )
    }

    // Record the usage
    await flexpriceService.recordUsage({
      userId,
      eventType,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      credits: credits || 1
    })

    // Get updated usage
    const usage = await flexpriceService.getUserUsage(userId)

    return NextResponse.json({
      success: true,
      message: "Usage recorded successfully",
      usage,
      creditsCharged: credits || 1
    })
  } catch (error) {
    console.error("Billing record error:", error)
    return NextResponse.json(
      { 
        error: "Failed to record usage",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

// PATCH /api/billing/webhook - Handle Flexprice webhooks
export async function PATCH(request: NextRequest) {
  try {
    const signature = request.headers.get("x-flexprice-signature")
    const rawBody = await request.text()

    if (!signature) {
      return NextResponse.json(
        { error: "Missing signature" },
        { status: 400 }
      )
    }

    // Verify webhook signature
    const isValid = flexpriceService.verifyWebhook(rawBody, signature)
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      )
    }

    const payload = JSON.parse(rawBody)
    
    // Handle different webhook events
    switch (payload.event_type) {
      case "credit.added":
        console.log(`Credits added for user ${payload.user_id}: ${payload.credits}`)
        break
      case "credit.depleted":
        console.log(`Credits depleted for user ${payload.user_id}`)
        // Could send notification to user
        break
      case "subscription.created":
        console.log(`Subscription created for user ${payload.user_id}`)
        break
      default:
        console.log(`Unhandled webhook event: ${payload.event_type}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}