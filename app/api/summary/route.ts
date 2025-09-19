import { NextResponse } from "next/server"
import { azureCognitiveSearch } from "@/lib/azure-cognitive-search"
import { azureCosmosDB } from "@/lib/azure-cosmos-db"

export const maxDuration = 30

// This function handles GET requests to /api/summary
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get("userId") || "anonymous"
  const startTime = Date.now()

  try {
    console.log("🚀 /api/summary called")

    // 1. Search for all documents in Azure Cognitive Search
    console.log("🔍 Searching for all documents...")
    const allDocuments = await azureCognitiveSearch.searchDocuments("*", { top: 100 })
    console.log(`✅ Found ${allDocuments.length} documents.`)

    if (allDocuments.length === 0) {
      return NextResponse.json({
        summary: {
          title: "No Documents Found",
          executiveSummary: "The knowledge base is currently empty. Please upload some documents to get started.",
          keyFindings: [],
          sections: [],
          recommendations: ["Upload documents using the 'Add Source' button."],
          sources: [],
        },
      })
    }

    // 2. Generate a summary report from the documents
    console.log("📝 Generating summary report...")
    const report = {
      title: "Comprehensive Summary of All Indexed Documents",
      executiveSummary: `This report provides a comprehensive overview of all ${allDocuments.length} documents currently indexed in the knowledge base.`,
      keyFindings: [
        `A total of ${allDocuments.length} sources were analyzed.`,
        "Key themes and topics will be extracted from these sources.",
        "This summary provides a high-level starting point for your research.",
      ],
      sections: allDocuments.map((doc, index) => ({
        title: `Source ${index + 1}: ${doc.title}`,
        content: doc.content.substring(0, 200) + (doc.content.length > 200 ? "..." : ""), // Truncate content for summary
        citations: [doc.id],
      })),
      recommendations: [
        "Use the chat interface to ask specific questions about these documents.",
        "Explore individual sources for more detailed information.",
      ],
      sources: allDocuments,
      generatedAt: new Date().toISOString(),
      processingTime: Date.now() - startTime,
    }
    console.log("✅ Report generated successfully.")

    // 3. Record the action in Cosmos DB for analytics
    await azureCosmosDB.recordUsage({
      userId,
      action: "summary_generated",
      metadata: {
        reportType: "full_summary",
        processingTime: Date.now() - startTime,
        creditsUsed: 2, // Assign a credit value for this action
        success: true,
        sourcesUsed: allDocuments.length,
      },
    })
    console.log("💾 Usage recorded in Cosmos DB.")

    return NextResponse.json({ summary: report })
  } catch (error) {
    console.error("🚨 /api/summary Error:", error)
    return NextResponse.json(
      { error: "Failed to generate summary", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
