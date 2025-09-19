import { azureConfig } from "./azure-config"

interface VisionAnalysisResult {
  text: string
  confidence: number
  boundingBoxes: Array<{
    text: string
    boundingBox: number[]
    confidence: number
  }>
}

class AzureAIVisionService {
  private async makeRequest(imageUrl: string, analysisType: "ocr" | "analyze" = "ocr") {
    const { endpoint, apiKey } = azureConfig.aiVision

    if (!endpoint || !apiKey) {
      throw new Error("Azure AI Vision credentials not configured")
    }

    const url = `${endpoint}/vision/v3.2/${analysisType === "ocr" ? "read/analyze" : "analyze"}`

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: imageUrl,
      }),
    })

    if (!response.ok) {
      throw new Error(`Azure AI Vision API error: ${response.statusText}`)
    }

    if (analysisType === "ocr") {
      // For OCR, we need to poll for results
      const operationLocation = response.headers.get("Operation-Location")
      if (!operationLocation) {
        throw new Error("No operation location returned from OCR request")
      }

      return this.pollForOCRResults(operationLocation)
    }

    return response.json()
  }

  private async pollForOCRResults(operationLocation: string, maxAttempts = 10): Promise<any> {
    const { apiKey } = azureConfig.aiVision

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second

      const response = await fetch(operationLocation, {
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      })

      if (!response.ok) {
        throw new Error(`Error polling OCR results: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.status === "succeeded") {
        return result
      } else if (result.status === "failed") {
        throw new Error("OCR processing failed")
      }

      // Continue polling if status is 'running' or 'notStarted'
    }

    throw new Error("OCR processing timed out")
  }

  async extractTextFromImage(imageUrl: string): Promise<VisionAnalysisResult> {
    try {
      const result = await this.makeRequest(imageUrl, "ocr")

      // Process OCR results
      const extractedText: string[] = []
      const boundingBoxes: VisionAnalysisResult["boundingBoxes"] = []

      if (result.analyzeResult?.readResults) {
        for (const page of result.analyzeResult.readResults) {
          for (const line of page.lines || []) {
            extractedText.push(line.text)
            boundingBoxes.push({
              text: line.text,
              boundingBox: line.boundingBox,
              confidence: line.confidence || 0.9,
            })
          }
        }
      }

      return {
        text: extractedText.join(" "),
        confidence: 0.9, // Average confidence
        boundingBoxes,
      }
    } catch (error) {
      console.error("Error extracting text from image:", error)
      throw new Error("Failed to extract text from image")
    }
  }

  async analyzeImage(imageUrl: string): Promise<any> {
    try {
      return await this.makeRequest(imageUrl, "analyze")
    } catch (error) {
      console.error("Error analyzing image:", error)
      throw new Error("Failed to analyze image")
    }
  }
}

export const azureAIVision = new AzureAIVisionService()
