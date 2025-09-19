import { type NextRequest, NextResponse } from "next/server"
import { azureBlobStorage } from "@/lib/azure-blob-storage"
import { azureAIVision } from "@/lib/azure-ai-vision"
import { azureCognitiveSearch } from "@/lib/azure-cognitive-search"
import { azureCosmosDB } from "@/lib/azure-cosmos-db"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Upload API called")
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = (formData.get("userId") as string)
    
    if (!userId) {
      console.error("❌ User ID is required")
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (!file) {
      console.error("❌ No file provided")
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    console.log(`📄 Received file: ${file.name} for user: ${userId}`)

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Upload to Azure Blob Storage
    console.log("☁️ Uploading to Azure Blob Storage...")
    const fileUrl = await azureBlobStorage.uploadFile(file, fileName)
    console.log(`✅ File uploaded to: ${fileUrl}`)

    // Process based on file type
    let extractedText = ""
    let processingTime = Date.now()

    console.log(`⚙️ Processing file type: ${file.type}`)
    if (file.type.startsWith("image/") || file.type === "application/pdf") {
      // Extract text from image or PDF using Azure AI Vision
      console.log("👁️ Extracting text with Azure AI Vision...")
      const visionResult = await azureAIVision.extractTextFromImage(fileUrl)
      extractedText = visionResult.text
      console.log("👁️ Text extracted from image/PDF")
    } else {
      // For other text files, read content directly
      console.log("📝 Reading text from file...")
      extractedText = await file.text()
      console.log("📝 Text read from file")
    }

    processingTime = Date.now() - processingTime
    console.log(`⏱️ Processing time: ${processingTime}ms`)

    // Index in Azure Cognitive Search
    console.log("🔍 Indexing in Azure Cognitive Search...")
    const documentId = Buffer.from(fileName).toString("base64url")
    const indexableDocument = {
      id: documentId,
      title: file.name,
      content: extractedText,
      sourceType: file.type.startsWith("image/")
        ? ("image" as const)
        : file.type === "application/pdf"
          ? ("pdf" as const)
          : ("document" as const),
      sourceUrl: fileUrl,
      extractedText,
      timestamp: new Date().toISOString(),
    }
    await azureCognitiveSearch.indexDocument(indexableDocument)
    console.log("✅ Document indexed successfully")

    // Record usage in Azure Cosmos DB
    console.log("💾 Recording usage in Azure Cosmos DB...")
    await azureCosmosDB.recordUsage({
      userId,
      action: "source_processed",
      metadata: {
        sourceType: indexableDocument.sourceType,
        processingTime,
        creditsUsed: 1,
        success: true,
      },
    })
    console.log("✅ Usage recorded successfully")

    return NextResponse.json({
      message: "File uploaded and processed successfully",
      document: indexableDocument,
    })
  } catch (error) {
    console.error("🚨 Upload API Error:", error)
    return NextResponse.json(
      { error: "Failed to process file", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
