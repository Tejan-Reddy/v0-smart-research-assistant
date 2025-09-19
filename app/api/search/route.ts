import { type NextRequest, NextResponse } from "next/server"
import { azureCognitiveSearch } from "@/lib/azure-cognitive-search"

export async function POST(request: NextRequest) {
  try {
    const { query, sourceTypes, limit = 10 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    const results = await azureCognitiveSearch.searchDocuments(query, {
      sourceTypes,
      top: limit,
    })

    return NextResponse.json({
      success: true,
      results: results.map((result) => ({
        id: result.id,
        title: result.title,
        content: result.content.substring(0, 300) + "...",
        sourceType: result.sourceType,
        relevanceScore: Math.round(result.relevanceScore * 100) / 100,
        highlights: result.highlights,
        sourceUrl: result.sourceUrl,
        pageNumber: result.pageNumber,
      })),
    })
  } catch (error) {
    console.error("Search error:", error)
    return NextResponse.json({ error: "Failed to search documents" }, { status: 500 })
  }
}
