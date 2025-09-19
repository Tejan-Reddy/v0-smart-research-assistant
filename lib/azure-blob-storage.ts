import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob"
import { azureConfig } from "./azure-config"

class AzureBlobStorageService {
  private blobServiceClient: BlobServiceClient | null = null

  private initializeClient() {
    if (!this.blobServiceClient) {
      const { accountName, accountKey } = azureConfig.blobStorage

      if (!accountName || !accountKey) {
        throw new Error("Azure Blob Storage credentials not configured")
      }

      const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey)
      this.blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential,
      )
    }
    return this.blobServiceClient
  }

  async uploadFile(file: File, fileName: string): Promise<string> {
    try {
      const blobServiceClient = this.initializeClient()
      const containerClient = blobServiceClient.getContainerClient(azureConfig.blobStorage.containerName)

      // Ensure container exists
      await containerClient.createIfNotExists({
        access: "blob",
      })

      const blockBlobClient = containerClient.getBlockBlobClient(fileName)

      // Convert File to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer()

      await blockBlobClient.uploadData(arrayBuffer, {
        blobHTTPHeaders: {
          blobContentType: file.type,
        },
      })

      return blockBlobClient.url
    } catch (error) {
      console.error("Error uploading file to Azure Blob Storage:", error)
      throw new Error("Failed to upload file")
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      const blobServiceClient = this.initializeClient()
      const containerClient = blobServiceClient.getContainerClient(azureConfig.blobStorage.containerName)
      const blockBlobClient = containerClient.getBlockBlobClient(fileName)

      await blockBlobClient.delete()
    } catch (error) {
      console.error("Error deleting file from Azure Blob Storage:", error)
      throw new Error("Failed to delete file")
    }
  }

  async getFileUrl(fileName: string): Promise<string> {
    const blobServiceClient = this.initializeClient()
    const containerClient = blobServiceClient.getContainerClient(azureConfig.blobStorage.containerName)
    const blockBlobClient = containerClient.getBlockBlobClient(fileName)

    return blockBlobClient.url
  }
}

export const azureBlobStorage = new AzureBlobStorageService()
