// Pathway integration for live data ingestion and incremental updates
interface PathwayConfig {
  apiKey: string
  endpoint: string
}

interface LiveDataSource {
  id: string
  name: string
  type: 'news' | 'blog' | 'research' | 'social'
  url: string
  lastUpdated: string
  isActive: boolean
}

interface LiveDataUpdate {
  sourceId: string
  content: string
  title: string
  url: string
  publishedAt: string
  relevanceScore: number
  tags: string[]
}

interface IncrementalUpdate {
  updateId: string
  timestamp: string
  newDocuments: number
  updatedDocuments: number
  totalDocuments: number
  sources: string[]
}

class PathwayService {
  private config: PathwayConfig

  constructor() {
    this.config = {
      apiKey: process.env.PATHWAY_API_KEY || '',
      endpoint: process.env.PATHWAY_ENDPOINT || ''
    }

    if (!this.config.apiKey) {
      console.warn('Pathway API key not configured')
    }
  }

  // Initialize live data sources
  async initializeSources(): Promise<LiveDataSource[]> {
    try {
      const response = await fetch(`${this.config.endpoint}/sources`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.sources || []
    } catch (error) {
      console.error('Failed to initialize sources:', error)
      // Return empty array when API is not available
      return []
    }
  }

  // Add a new live data source
  async addSource(source: Omit<LiveDataSource, 'id' | 'lastUpdated'>): Promise<LiveDataSource> {
    try {
      const response = await fetch(`${this.config.endpoint}/sources`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(source)
      })

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to add source:', error)
      throw error
    }
  }

  // Get latest updates from all sources
  async getLatestUpdates(since?: string): Promise<LiveDataUpdate[]> {
    try {
      const url = new URL(`${this.config.endpoint}/updates`)
      if (since) {
        url.searchParams.set('since', since)
      }

      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.updates || []
    } catch (error) {
      console.error('Failed to get updates:', error)
      return []
    }
  }

  // Process incremental updates and refresh search index
  async processIncrementalUpdate(): Promise<IncrementalUpdate> {
    try {
      const response = await fetch(`${this.config.endpoint}/process-updates`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.statusText}`)
      }

      const update = await response.json()
      
      // Update our search index with new documents
      await this.updateSearchIndex(update.newDocuments)
      
      return update
    } catch (error) {
      console.error('Failed to process incremental update:', error)
      throw error
    }
  }

  // Search live data with specific query
  async searchLiveData(query: string, sourceTypes?: string[]): Promise<LiveDataUpdate[]> {
    try {
      const response = await fetch(`${this.config.endpoint}/search`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query,
          source_types: sourceTypes,
          limit: 10
        })
      })

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.statusText}`)
      }

      const data = await response.json()
      return data.results || []
    } catch (error) {
      console.error('Failed to search live data:', error)
      return []
    }
  }

  // Get data freshness status
  async getDataFreshness(): Promise<{
    lastUpdate: string
    nextUpdate: string
    activeSources: number
    totalDocuments: number
  }> {
    try {
      const response = await fetch(`${this.config.endpoint}/status`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Pathway API error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Failed to get data freshness:', error)
      return {
        lastUpdate: new Date().toISOString(),
        nextUpdate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        activeSources: 0,
        totalDocuments: 0
      }
    }
  }

  // Update search index with new documents
  private async updateSearchIndex(newDocuments: any[]): Promise<void> {
    // Import Azure Cognitive Search service
    const { azureCognitiveSearch } = await import('./azure-cognitive-search')
    
    for (const doc of newDocuments) {
      try {
        await azureCognitiveSearch.indexDocument({
          id: doc.id,
          title: doc.title,
          content: doc.content,
          sourceType: 'url',
          sourceUrl: doc.url,
          metadata: {
            publishedAt: doc.publishedAt,
            tags: doc.tags,
            isLiveData: true
          },
          timestamp: new Date().toISOString()
        })
      } catch (error) {
        console.error(`Failed to index document ${doc.id}:`, error)
      }
    }
  }

  // Schedule automatic updates (call this in a cron job or interval)
  async scheduleUpdates(intervalMinutes: number = 60): Promise<void> {
    setInterval(async () => {
      try {
        console.log('Processing scheduled live data update...')
        const update = await this.processIncrementalUpdate()
        console.log(`Update completed: ${update.newDocuments} new documents`)
      } catch (error) {
        console.error('Scheduled update failed:', error)
      }
    }, intervalMinutes * 60 * 1000)
  }
}

export const pathwayService = new PathwayService()
export type { LiveDataSource, LiveDataUpdate, IncrementalUpdate }