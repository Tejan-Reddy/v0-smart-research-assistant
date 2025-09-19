import { type NextRequest, NextResponse } from "next/server"
import { azureCosmosDB } from "@/lib/azure-cosmos-db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId") || "anonymous"
    const days = Number.parseInt(searchParams.get("days") || "7")

    const [usage, analytics] = await Promise.all([
      azureCosmosDB.getUserUsage(userId),
      azureCosmosDB.getUsageAnalytics(userId, days),
    ])

    return NextResponse.json({
      success: true,
      usage,
      analytics,
    })
  } catch (error) {
    console.error("Usage API error:", error)
    return NextResponse.json({ error: "Failed to get usage data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, action, metadata } = await request.json()

    await azureCosmosDB.recordUsage({
      userId: userId || "anonymous",
      action,
      metadata,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Usage recording error:", error)
    return NextResponse.json({ error: "Failed to record usage" }, { status: 500 })
  }
}
