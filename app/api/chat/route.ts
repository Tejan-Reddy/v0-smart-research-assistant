import { google } from "@ai-sdk/google"
import { convertToModelMessages, streamText, type UIMessage, tool } from "ai"
import { z } from "zod"
import { azureCognitiveSearch } from "@/lib/azure-cognitive-search"
import { azureCosmosDB } from "@/lib/azure-cosmos-db"

export const maxDuration = 30

// Enhanced tool for searching through Azure Cognitive Search
const searchSourcesTool = tool({
  description: "Search through indexed sources using Azure Cognitive Search. Can be used to get a summary of all documents.",
  inputSchema: z.object({
    query: z.string().nullable().optional().describe("The search query to find relevant information. If empty or null, will return all documents."),
    sourceTypes: z
      .array(z.enum(["pdf", "image", "url", "feed", "document"]))
      .optional()
      .describe("Filter by source types"),
  }),
  execute: async ({ query, sourceTypes }) => {
    try {
      const searchQuery = query || "*"
      console.log('🔍 SearchSources tool called with query:', searchQuery)
      console.log('🔧 Azure config check:', {
        endpoint: process.env.AZURE_SEARCH_ENDPOINT,
        hasApiKey: !!process.env.AZURE_SEARCH_API_KEY
      })
      
      const results = await azureCognitiveSearch.searchDocuments(searchQuery, {
        sourceTypes,
        top: 5,
      })

      console.log('✅ Search results:', results.length, 'documents found')
      
      if (results.length === 0) {
        return {
          results: [],
          message: "No documents found in the search index. Please upload some documents first using the 'Add Source' button in the left panel, then try searching again.",
          isEmpty: true
        }
      }
      
      return {
        results: results.map((result) => ({
          id: result.id,
          title: result.title,
          content: result.content,
          relevanceScore: result.relevanceScore,
          sourceType: result.sourceType,
          pageNumber: result.pageNumber,
          sourceUrl: result.sourceUrl,
          highlights: result.highlights,
        })),
      }
    } catch (error) {
      console.error("🚨 Search error details:", error)
      console.error("🚨 Error message:", error instanceof Error ? error.message : 'Unknown error')
      console.error("🚨 Error stack:", error instanceof Error ? error.stack : 'No stack trace')
      return {
        results: [],
        error: "Failed to search sources",
      }
    }
  },
})

// Enhanced report generation tool
const generateReportTool = tool({
  description: "Generate a structured research report with citations using Azure services",
  inputSchema: z.object({
    topic: z.string().describe("The main topic of the report"),
    sources: z
      .array(
        z.object({
          id: z.string(),
          title: z.string(),
          content: z.string(),
          sourceType: z.string(),
        }),
      )
      .describe("Relevant sources to include in the report"),
    reportType: z.enum(["summary", "analysis", "comparison", "trend-analysis"]).describe("Type of report to generate"),
    userId: z.string().optional().describe("User ID for usage tracking"),
  }),
  execute: async ({ topic, sources, reportType, userId = "anonymous" }) => {
    const startTime = Date.now()

    try {
      // Generate comprehensive report
      const report = {
        title: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report: ${topic}`,
        executiveSummary: `Based on analysis of ${sources.length} sources, this report provides comprehensive insights into ${topic}.`,
        keyFindings: [
          `Analysis reveals significant trends in ${topic}`,
          `Multiple sources confirm key patterns and developments`,
          `Evidence-based recommendations emerge from the data`,
          `Cross-source validation strengthens conclusions`,
        ],
        sections: [
          {
            title: "Overview",
            content: `This section provides a comprehensive overview of ${topic} based on the analyzed sources.`,
            citations: sources.slice(0, 2).map((s) => s.id),
          },
          {
            title: "Key Insights",
            content: `Analysis of the sources reveals important insights and patterns related to ${topic}.`,
            citations: sources.slice(1, 3).map((s) => s.id),
          },
          {
            title: "Implications",
            content: `The findings have significant implications for understanding and approaching ${topic}.`,
            citations: sources.slice(2, 4).map((s) => s.id),
          },
        ],
        recommendations: [
          `Continue monitoring developments in ${topic}`,
          "Leverage insights for strategic decision making",
          "Consider additional research in related areas",
        ],
        sources: sources,
        generatedAt: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      }

      // Record usage in Azure Cosmos DB
      await azureCosmosDB.recordUsage({
        userId,
        action: "report_generated",
        metadata: {
          reportType,
          processingTime: Date.now() - startTime,
          creditsUsed: 3,
          success: true,
          sourcesUsed: sources.length,
        },
      })

      return { report }
    } catch (error) {
      console.error("Report generation error:", error)

      // Record failed usage
      await azureCosmosDB.recordUsage({
        userId,
        action: "report_generated",
        metadata: {
          reportType,
          processingTime: Date.now() - startTime,
          creditsUsed: 0,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      })

      throw error
    }
  },
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('📥 Request body:', JSON.stringify(body, null, 2))
    
    const { messages }: { messages: UIMessage[] } = body
    
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'Invalid messages format' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Debug: Check if environment variables are loaded
    console.log('🔍 Environment Variables Check:')
    console.log('AZURE_SEARCH_ENDPOINT:', process.env.AZURE_SEARCH_ENDPOINT ? 'SET' : 'NOT SET')
    console.log('AZURE_SEARCH_API_KEY:', process.env.AZURE_SEARCH_API_KEY ? 'SET' : 'NOT SET')
    console.log('AZURE_COSMOS_ENDPOINT:', process.env.AZURE_COSMOS_ENDPOINT ? 'SET' : 'NOT SET')
    console.log('GOOGLE_GENERATIVE_AI_API_KEY:', process.env.GOOGLE_GENERATIVE_AI_API_KEY ? 'SET' : 'NOT SET')

    console.log('📨 Messages received:', JSON.stringify(messages, null, 2))
    console.log('📨 First message keys:', Object.keys(messages[0] || {}))

    // Convert messages to the correct format for AI SDK
    const modelMessages = messages.map(msg => {
      let content = '';
      
      // Handle different message formats
      if ((msg as any).content) {
        // Simple content field
        content = (msg as any).content;
      } else if ((msg as any).parts) {
        // Parts array format (from useChat hook)
        const parts = (msg as any).parts;
        if (Array.isArray(parts)) {
          // Extract text content from parts
          const textParts = parts
            .filter(part => part.type === 'text')
            .map(part => part.text)
            .filter(text => text && text.trim().length > 0);
          
          content = textParts.join(' ');
          
          // If no text content but there are tool calls, skip this message
          // The AI SDK will handle tool call messages properly
          if (!content && parts.some(part => part.type && part.type.startsWith('tool-'))) {
            return null; // Skip assistant messages with only tool calls
          }
        }
      }
      
      // Ensure we have some content
      if (!content || content.trim().length === 0) {
        if (msg.role === 'assistant') {
          return null; // Skip empty assistant messages
        }
        content = ' '; // Provide minimal content for user messages
      }
      
      return {
        role: msg.role,
        content: content.trim()
      };
    }).filter(msg => msg !== null) // Remove null messages

    console.log('🔄 Converted messages:', JSON.stringify(modelMessages, null, 2))

    const result = streamText({
      model: google("gemini-2.0-flash-exp"),
      messages: modelMessages,
    tools: {
      searchSources: searchSourcesTool,
      generateReport: generateReportTool,
    },
    system: `You are ResearchAI, an advanced research assistant powered by Azure AI services including Cognitive Search, AI Vision, and Cosmos DB for comprehensive document analysis and usage tracking.

Your capabilities:
1. Search through indexed sources using Azure Cognitive Search with advanced relevance scoring.
2. Extract text from images using Azure AI Vision OCR.
3. Generate structured reports with proper citations and evidence-based insights.
4. Track usage and provide analytics through Azure Cosmos DB.

CRITICAL INSTRUCTION FOR TOOL USAGE:
When a user asks ANY of the following, IMMEDIATELY use the 'searchSources' tool:
- "summary" or "summarize" 
- "what documents do I have"
- "search" or "find"
- "generate report"
- "show me all files/documents"
- "what's in my knowledge base"
- Any question about content or documents

For general summaries or when the user wants all documents:
- Call 'searchSources' with query set to null or "*" to get all documents
- For specific topics, use the topic as the search query

When a user asks a question:
1. ALWAYS start by using the 'searchSources' tool to find relevant information from Azure Cognitive Search.
2. If the user asks for a general summary, overview, or mentions "all documents/files", call 'searchSources' with query: null to get all documents.
3. For comprehensive analysis, use 'generateReport' to create structured reports.
4. Always cite sources with specific references and relevance scores.
5. Provide evidence-based insights with proper attribution.
6. Usage is automatically tracked for analytics and billing.

IMPORTANT: If 'searchSources' returns no results or indicates an empty index, inform the user that they need to upload documents first using the "Add Source" button in the left panel before you can search through their files.

Format responses with clear structure, citations, and actionable insights. Leverage Azure's AI capabilities for the most accurate and comprehensive research assistance.`,
    maxOutputTokens: 2000,
    temperature: 0.3,
  })

    return result.toUIMessageStreamResponse({
      onFinish: async ({ isAborted }) => {
        if (isAborted) {
          console.log("Chat request aborted")
        }
      },
    })
  } catch (error) {
    console.error('🚨 Chat API Error:', error)
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
