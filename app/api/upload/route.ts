import { type NextRequest, NextResponse } from "next/server"
import { azureBlobStorage } from "@/lib/azure-blob-storage"
import { azureAIVision } from "@/lib/azure-ai-vision"
import { azureCognitiveSearch } from "@/lib/azure-cognitive-search"
import { azureCosmosDB } from "@/lib/azure-cosmos-db"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const userId = (formData.get("userId") as string) || "anonymous"

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`

    // Upload to Azure Blob Storage
    const fileUrl = await azureBlobStorage.uploadFile(file, fileName)

    // Process based on file type
    let extractedText = ""
    let processingTime = Date.now()

    if (file.type.startsWith("image/")) {
      // Extract text from image using Azure AI Vision
      const visionResult = await azureAIVision.extractTextFromImage(fileUrl)
      extractedText = visionResult.text
    } else if (file.type === "application/pdf") {
      // For PDF, you would typically use a PDF parsing library
      // For demo purposes, we'll simulate text extraction
      extractedText = `Extracted text from PDF: ${file.name}`
    } else {
      // For other text files, read content directly
      extractedText = await file.text()
    }

    processingTime = Date.now() - processingTime

    // Index in Azure Cognitive Search
    const searchDocument = {
      id: fileName,
      title: file.name,
      content: extractedText,
      sourceType: file.type.startsWith("image/")
        ? ("image" as const)
        : file.type === "application/pdf"
          ? ("pdf" as const)
          : ("document" as const),
      sourceUrl: fileUrl,
      extractedText,
      metadata: {
        fileSize: file.size,
        fileType: file.type,
        uploadedAt: new Date().toISOString(),
      },
      timestamp: new Date().toISOString(),
    }

    await azureCognitiveSearch.indexDocument(searchDocument)

    // Record usage in Cosmos DB
    await azureCosmosDB.recordUsage({
      userId,
      action: "source_processed",
      metadata: {
        sourceType: searchDocument.sourceType,
        processingTime,
        creditsUsed: 1,
        success: true,
      },
    })

    return NextResponse.json({
      success: true,
      file: {
        id: fileName,
        name: file.name,
        type: searchDocument.sourceType,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        status: "indexed",
        url: fileUrl,
        extractedText: extractedText.substring(0, 200) + "...",
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Failed to upload and process file" }, { status: 500 })
  }
}
