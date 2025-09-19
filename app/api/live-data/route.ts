import { type NextRequest, NextResponse } from "next/server"
import { pathwayService } from "@/lib/pathway"
import { flexpriceService } from "@/lib/flexprice"

// GET /api/live-data - Get live data updates and freshness status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")
    
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }
    
    const since = searchParams.get("since")
    const query = searchParams.get("query")
    const sourceTypes = searchParams.get("sourceTypes")?.split(",")

    // If it's a search query, charge credits
    if (query) {
      const hasCredits = await flexpriceService.hasCredits(userId, 1)
      if (!hasCredits) {
        return NextResponse.json(
          { 
            error: "Insufficient credits for live data search",
            code: "INSUFFICIENT_CREDITS"
          },
          { status: 402 }
        )
      }

      // Record the usage
      await flexpriceService.recordUsage({
        userId,
        eventType: "question_asked",
        metadata: {
          queryType: "live_data_search",
          queryLength: query.length,
          sourceTypes: sourceTypes || []
        },
        timestamp: new Date().toISOString(),
        credits: 1
      })

      // Search live data
      const results = await pathwayService.searchLiveData(query, sourceTypes)
      return NextResponse.json({
        success: true,
        results,
        query,
        creditsUsed: 1
      })
    }

    // Get updates or freshness status
    const [updates, freshness, sources] = await Promise.all([
      since ? pathwayService.getLatestUpdates(since) : Promise.resolve([]),
      pathwayService.getDataFreshness(),
      pathwayService.initializeSources()
    ])

    return NextResponse.json({
      success: true,
      updates,
      freshness,
      sources: sources.filter(s => s.isActive),
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error("Live data API error:", error)
    return NextResponse.json(
      { 
        error: "Failed to get live data",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

// POST /api/live-data - Trigger manual refresh or add new source
export async function POST(request: NextRequest) {
  try {
    const { action, userId, source } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" },
        { status: 400 }
      )
    }

    if (action === "refresh") {
      // Check credits for manual refresh
      const hasCredits = await flexpriceService.hasCredits(userId, 1)
      if (!hasCredits) {
        return NextResponse.json(
          { 
            error: "Insufficient credits for manual refresh",
            code: "INSUFFICIENT_CREDITS"
          },
          { status: 402 }
        )
      }

      // Record the usage
      await flexpriceService.recordUsage({
        userId,
        eventType: "source_processed",
        metadata: {
          actionType: "manual_refresh",
          processingTime: Date.now()
        },
        timestamp: new Date().toISOString(),
        credits: 1
      })

      // Process incremental update
      const update = await pathwayService.processIncrementalUpdate()
      
      return NextResponse.json({
        success: true,
        message: "Live data refreshed successfully",
        update,
        creditsUsed: 1
      })
    }

    if (action === "add_source" && source) {
      // Add new live data source
      const newSource = await pathwayService.addSource(source)
      
      return NextResponse.json({
        success: true,
        message: "Live data source added successfully",
        source: newSource
      })
    }

    return NextResponse.json(
      { error: "Invalid action. Use 'refresh' or 'add_source'" },
      { status: 400 }
    )
  } catch (error) {
    console.error("Live data POST error:", error)
    return NextResponse.json(
      { 
        error: "Failed to process live data request",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

// PUT /api/live-data/sources - Update source settings
export async function PUT(request: NextRequest) {
  try {
    const { sourceId, isActive } = await request.json()

    if (!sourceId) {
      return NextResponse.json(
        { error: "Missing sourceId" },
        { status: 400 }
      )
    }

    // In a real implementation, you would update the source in your database
    // For now, we'll just return success
    
    return NextResponse.json({
      success: true,
      message: "Source updated successfully",
      sourceId,
      isActive
    })
  } catch (error) {
    console.error("Live data PUT error:", error)
    return NextResponse.json(
      { 
        error: "Failed to update source",
        details: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}