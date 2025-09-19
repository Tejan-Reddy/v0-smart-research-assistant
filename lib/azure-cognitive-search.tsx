import { azureConfig } from "./azure-config"

interface SearchDocument {
  id: string
  title: string
  content: string
  sourceType: "pdf" | "image" | "url" | "feed"
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
  private get baseUrl() {
    const { endpoint, indexName } = azureConfig.cognitiveSearch
    return `${endpoint}/indexes/${indexName}`
  }

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
      const indexDefinition = {
        name: azureConfig.cognitiveSearch.indexName,
        fields: [
          { name: "id", type: "Edm.String", key: true, searchable: false },
          { name: "title", type: "Edm.String", searchable: true, filterable: true },
          { name: "content", type: "Edm.String", searchable: true },
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

      const response = await fetch(`${azureConfig.cognitiveSearch.endpoint}/indexes?api-version=2023-11-01`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(indexDefinition),
      })

      if (!response.ok && response.status !== 409) {
        // 409 = index already exists
        throw new Error(`Failed to create search index: ${response.statusText}`)
      }
    } catch (error) {
      console.error("Error creating search index:", error)
      throw new Error("Failed to create search index")
    }
  }

  async indexDocument(document: SearchDocument): Promise<void> {
    try {
      const indexData = {
        value: [
          {
            "@search.action": "mergeOrUpload",
            ...document,
          },
        ],
      }

      const response = await fetch(`${this.baseUrl}/docs/index?api-version=2023-11-01`, {
        method: "POST",
        headers: this.headers,
        body: JSON.stringify(indexData),
      })

      if (!response.ok) {
        throw new Error(`Failed to index document: ${response.statusText}`)
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
      const { sourceTypes, top = 10, skip = 0 } = options

      const searchParams = new URLSearchParams({
        "api-version": "2023-11-01",
        search: query,
        $top: top.toString(),
        $skip: skip.toString(),
        highlight: "content",
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
        $orderby: "search.score() desc",
      })

      if (sourceTypes && sourceTypes.length > 0) {
        const filter = sourceTypes.map((type) => `sourceType eq '${type}'`).join(" or ")
        searchParams.append("$filter", filter)
      }

      const response = await fetch(`${this.baseUrl}/docs?${searchParams}`, {
        headers: this.headers,
      })

      if (!response.ok) {
        throw new Error(`Search request failed: ${response.statusText}`)
      }

      const result = await response.json()

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

      const response = await fetch(`${this.baseUrl}/docs/index?api-version=2023-11-01`, {
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
