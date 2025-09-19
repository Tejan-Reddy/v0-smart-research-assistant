// Azure service configuration and clients
export const azureConfig = {
  // Azure Blob Storage
  blobStorage: {
    accountName: process.env.AZURE_STORAGE_ACCOUNT_NAME || "",
    accountKey: process.env.AZURE_STORAGE_ACCOUNT_KEY || "",
    containerName: "research-sources",
  },

  // Azure AI Vision
  aiVision: {
    endpoint: process.env.AZURE_AI_VISION_ENDPOINT || "",
    apiKey: process.env.AZURE_AI_VISION_KEY || "",
  },

  // Azure Cognitive Search
  cognitiveSearch: {
    endpoint: process.env.AZURE_SEARCH_ENDPOINT || "",
    apiKey: process.env.AZURE_SEARCH_API_KEY || "",
    indexName: "research-index",
  },

  // Azure Cosmos DB
  cosmosDb: {
    endpoint: process.env.AZURE_COSMOS_ENDPOINT || "",
    key: process.env.AZURE_COSMOS_KEY || "",
    databaseName: "ResearchAI",
    containerName: "usage-tracking",
  },
}

// Environment variables that need to be set in Vercel
export const requiredEnvVars = [
  "AZURE_STORAGE_ACCOUNT_NAME",
  "AZURE_STORAGE_ACCOUNT_KEY",
  "AZURE_AI_VISION_ENDPOINT",
  "AZURE_AI_VISION_KEY",
  "AZURE_SEARCH_ENDPOINT",
  "AZURE_SEARCH_API_KEY",
  "AZURE_COSMOS_ENDPOINT",
  "AZURE_COSMOS_KEY",
]
