import { CosmosClient } from "@azure/cosmos"
import { azureConfig } from "./azure-config"

interface UsageRecord {
  id: string
  userId: string
  action: "report_generated" | "source_processed" | "search_performed" | "summary_generated"
  timestamp: string
  metadata: {
    reportType?: string
    sourceType?: string
    processingTime?: number
    creditsUsed?: number
    success?: boolean
    sourcesUsed?: number
    error?: string
    [key: string]: any // Allow additional properties
  }
}

interface UserUsage {
  userId: string
  totalCreditsUsed: number
  totalReports: number
  totalSources: number
  lastActivity: string
  subscription: "free" | "pro" | "enterprise"
  creditLimit: number
}

class AzureCosmosDBService {
  private cosmosClient: CosmosClient | null = null

  private initializeClient() {
    if (!this.cosmosClient) {
      const { endpoint, key } = azureConfig.cosmosDb

      if (!endpoint || !key) {
        throw new Error("Azure Cosmos DB credentials not configured")
      }

      this.cosmosClient = new CosmosClient({ endpoint, key })
    }
    return this.cosmosClient
  }

  private async getContainer() {
    const client = this.initializeClient()
    const { databaseName, containerName } = azureConfig.cosmosDb

    const { database } = await client.databases.createIfNotExists({ id: databaseName })
    const { container } = await database.containers.createIfNotExists({
      id: containerName,
      partitionKey: "/userId",
    })

    return container
  }

  async recordUsage(usage: Omit<UsageRecord, "id" | "timestamp">): Promise<void> {
    try {
      const container = await this.getContainer()

      const record: UsageRecord = {
        id: `${usage.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        ...usage,
      }

      await container.items.create(record)
    } catch (error) {
      console.error("Error recording usage:", error)
      throw new Error("Failed to record usage")
    }
  }

  async getUserUsage(userId: string): Promise<UserUsage | null> {
    try {
      const container = await this.getContainer()

      const query = `
        SELECT 
          c.userId,
          COUNT(1) as totalRecords,
          SUM(c.metadata.creditsUsed) as totalCreditsUsed,
          SUM(CASE WHEN c.action = 'report_generated' THEN 1 ELSE 0 END) as totalReports,
          SUM(CASE WHEN c.action = 'source_processed' THEN 1 ELSE 0 END) as totalSources,
          MAX(c.timestamp) as lastActivity
        FROM c 
        WHERE c.userId = @userId
        GROUP BY c.userId
      `

      const { resources } = await container.items
        .query({
          query,
          parameters: [{ name: "@userId", value: userId }],
        })
        .fetchAll()

      if (resources.length === 0) {
        return {
          userId,
          totalCreditsUsed: 0,
          totalReports: 0,
          totalSources: 0,
          lastActivity: new Date().toISOString(),
          subscription: "free",
          creditLimit: 100,
        }
      }

      const usage = resources[0]
      return {
        userId: usage.userId,
        totalCreditsUsed: usage.totalCreditsUsed || 0,
        totalReports: usage.totalReports || 0,
        totalSources: usage.totalSources || 0,
        lastActivity: usage.lastActivity,
        subscription: "pro", // This would come from user profile
        creditLimit: 100,
      }
    } catch (error) {
      console.error("Error getting user usage:", error)
      throw new Error("Failed to get user usage")
    }
  }

  async getUsageAnalytics(userId: string, days = 7): Promise<any[]> {
    try {
      const container = await this.getContainer()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const query = `
        SELECT 
          LEFT(c.timestamp, 10) as date,
          c.action,
          COUNT(1) as count,
          AVG(c.metadata.processingTime) as avgProcessingTime
        FROM c 
        WHERE c.userId = @userId 
          AND c.timestamp >= @startDate
        GROUP BY LEFT(c.timestamp, 10), c.action
        ORDER BY date DESC
      `

      const { resources } = await container.items
        .query({
          query,
          parameters: [
            { name: "@userId", value: userId },
            { name: "@startDate", value: startDate.toISOString() },
          ],
        })
        .fetchAll()

      return resources
    } catch (error) {
      console.error("Error getting usage analytics:", error)
      throw new Error("Failed to get usage analytics")
    }
  }
}

export const azureCosmosDB = new AzureCosmosDBService()
