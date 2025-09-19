import { azureConfig } from "./azure-config"

interface SearchDocument {
  id: string
  title: string
  content: string
  sourceType: "pdf" | "image" | "url" | "feed" | "document"
  sourceUrl?: string
  pageNumber?: number
  extractedText?: string
  metadata?: Record<string, any>
  timestamp: string
}

interface SearchResult {
  id: string
  title: string
  content: string
  sourceType: string
  relevanceScore: number
  highlights?: string[]
  sourceUrl?: string
  pageNumber?: number
}

class AzureCognitiveSearchService {
  private get headers() {
    const { apiKey } = azureConfig.cognitiveSearch

    if (!apiKey) {
      throw new Error("Azure Cognitive Search API key not configured")
    }

    return {
      "Content-Type": "application/json",
      "api-key": apiKey,
    }
  }

  async createIndex(): Promise<void> {
    try {
      console.log("🔧 Azure config check:", {
        endpoint: azureConfig.cognitiveSearch.endpoint,
        hasApiKey: !!azureConfig.cognitiveSearch.apiKey,
        indexName: azureConfig.cognitiveSearch.indexName
      })

      const indexDefinition = {
        name: azureConfig.cognitiveSearch.indexName,
        fields: [
          { name: "id", type: "Edm.String", key: true, searchable: false },
          { name: "title", type: "Edm.String", searchable: true, filterable: true, retrievable: true },
          { name: "content", type: "Edm.String", searchable: true, retrievable: true },
          { name: "sourceType", type: "Edm.String", filterable: true, facetable: true },
          { name: "sourceUrl", type: "Edm.String", searchable: false },
          { name: "pageNumber", type: "Edm.Int32", filterable: true },
          { name: "extractedText", type: "Edm.String", searchable: true },
          { name: "timestamp", type: "Edm.DateTimeOffset", filterable: true, sortable: true },
        ],
        suggesters: [
          {
            name: "sg",
            searchMode: "analyzingInfixMatching",
            sourceFields: ["title", "content"],
          },
        ],
      }

      const url = `${azureConfig.cognitiveSearch.endpoint}/indexes?api-version=2023-11-01`
      console.log("🌐 Request URL:", url)
      console.log("📄 Index definition:", JSON.stringify(indexDefinition, null, 2))

      const response = await fetch(url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(indexDefinition),
      })

      console.log("📊 Response status:", response.status, response.statusText)

      if (!response.ok && response.status !== 409) {
        const errorText = await response.text()
        console.error("❌ Error response body:", errorText)
        throw new Error(`Failed to create search index: ${response.status} ${response.statusText} - ${errorText}`)
      }

      if (response.status === 409) {
        console.log("ℹ️ Index already exists, skipping creation")
      } else {
        console.log("✅ Index created successfully")
      }
    } catch (error) {
      console.error("Error creating search index:", error)
      throw new Error("Failed to create search index")
    }
  }

  async indexDocument(document: SearchDocument): Promise<void> {
    try {
      const { metadata, ...restOfDoc } = document as any;
      const indexData = {
        value: [
          {
            "@search.action": "mergeOrUpload",
            ...restOfDoc,
          },
        ],
      }

      const response = await fetch(`${azureConfig.cognitiveSearch.endpoint}/indexes/${azureConfig.cognitiveSearch.indexName}/docs/index?api-version=2023-11-01`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(indexData),
      })

      if (!response.ok) {
        const errorBody = await response.json();
        console.error("Error body:", JSON.stringify(errorBody, null, 2));
        throw new Error(`Failed to index document: ${response.statusText}`)
      }

      // Wait a moment and verify the document is searchable
      console.log("⏳ Waiting for document to be searchable...")
      await new Promise(resolve => setTimeout(resolve, 2000)) // Wait 2 seconds
      
      // Verify document is searchable
      try {
        const searchResponse = await fetch(`${azureConfig.cognitiveSearch.endpoint}/indexes/${azureConfig.cognitiveSearch.indexName}/docs/search?api-version=2023-11-01`, {
          method: "POST",
          headers: this.headers,
          body: JSON.stringify({
            search: `id:${document.id}`,
            top: 1
          }),
        })
        
        if (searchResponse.ok) {
          const searchResult = await searchResponse.json()
          if (searchResult.value && searchResult.value.length > 0) {
            console.log("✅ Document verified as searchable")
          } else {
            console.log("⚠️ Document indexed but not yet searchable")
          }
        }
      } catch (verifyError) {
        console.log("⚠️ Could not verify document searchability:", verifyError)
        // Don't fail the entire operation if verification fails
      }
    } catch (error) {
      console.error("Error indexing document:", error)
      throw new Error("Failed to index document")
    }
  }

  async searchDocuments(
    query: string,
    options: {
      sourceTypes?: string[]
      top?: number
      skip?: number
    } = {},
  ): Promise<SearchResult[]> {
    try {
      console.log("🔧 Azure config check:", {
        endpoint: azureConfig.cognitiveSearch.endpoint,
        hasApiKey: !!azureConfig.cognitiveSearch.apiKey
      })

      const { sourceTypes, top = 10, skip = 0 } = options

      const searchRequest = {
        search: query,
        top: top,
        skip: skip,
        highlight: "content",
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
        orderby: "search.score() desc",
        ...(sourceTypes && sourceTypes.length > 0 && {
          filter: sourceTypes.map((type) => `sourceType eq '${type}'`).join(" or ")
        })
      }

      const url = `${azureConfig.cognitiveSearch.endpoint}/indexes/${azureConfig.cognitiveSearch.indexName}/docs/search?api-version=2023-11-01`
      console.log("🌐 Search URL:", url)
      console.log("📄 Search request:", JSON.stringify(searchRequest, null, 2))

      const response = await fetch(url, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(searchRequest),
      })

      console.log("📊 Search response status:", response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Search error response body:", errorText)
        throw new Error(`Search request failed: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await response.json()
      console.log("✅ Search successful, found documents:", result.value?.length || 0)

      return result.value.map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        content: doc.content,
        sourceType: doc.sourceType,
        relevanceScore: doc["@search.score"],
        highlights: doc["@search.highlights"]?.content,
        sourceUrl: doc.sourceUrl,
        pageNumber: doc.pageNumber,
      }))
    } catch (error) {
      console.error("Error searching documents:", error)
      throw new Error("Failed to search documents")
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      const deleteData = {
        value: [
          {
            "@search.action": "delete",
            id: documentId,
          },
        ],
      }

      const response = await fetch(`${azureConfig.cognitiveSearch.endpoint}/indexes/${azureConfig.cognitiveSearch.indexName}/docs/index?api-version=2023-11-01`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(deleteData),
      })

      if (!response.ok) {
        throw new Error(`Failed to delete document: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error deleting document:", error)
      throw new Error("Failed to delete document")
    }
  }
}

export const azureCognitiveSearch = new AzureCognitiveSearchService()
