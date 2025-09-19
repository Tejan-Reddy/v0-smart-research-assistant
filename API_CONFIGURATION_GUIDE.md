# Smart Research Assistant - API Configuration Guide

## 🔑 Required API Keys and Services

### 1. Azure Services (Core Backend)
Your app already has Azure integration setup. You need these API keys:

#### **Azure AI Vision** (for OCR and image processing)
- **Where configured**: `/lib/azure-config.ts`
- **Environment variables needed**:
  ```env
  AZURE_AI_VISION_ENDPOINT=https://your-region.cognitiveservices.azure.com/
  AZURE_AI_VISION_KEY=your_ai_vision_key
  ```

#### **Azure Blob Storage** (for file storage)
- **Where configured**: `/lib/azure-config.ts`
- **Environment variables needed**:
  ```env
  AZURE_STORAGE_ACCOUNT_NAME=your_storage_account
  AZURE_STORAGE_ACCOUNT_KEY=your_storage_key
  ```

#### **Azure Cognitive Search** (for document indexing and search)
- **Where configured**: `/lib/azure-config.ts`
- **Environment variables needed**:
  ```env
  AZURE_SEARCH_ENDPOINT=https://your-search-service.search.windows.net
  AZURE_SEARCH_API_KEY=your_search_api_key
  ```

#### **Azure Cosmos DB** (for usage tracking and analytics)
- **Where configured**: `/lib/azure-config.ts`
- **Environment variables needed**:
  ```env
  AZURE_COSMOS_ENDPOINT=https://your-cosmos-account.documents.azure.com:443/
  AZURE_COSMOS_KEY=your_cosmos_key
  ```

### 2. Google AI SDK (for Chat Interface)
- **Where used**: `/app/api/chat/route.ts`
- **Environment variables needed**:
  ```env
  GOOGLE_GENERATIVE_AI_API_KEY=your_google_ai_key
  ```

### 3. Flexprice Integration (Billing - NEW)
- **Where to implement**: New service integration
- **Environment variables needed**:
  ```env
  FLEXPRICE_API_KEY=your_flexprice_key
  FLEXPRICE_WEBHOOK_SECRET=your_webhook_secret
  ```

### 4. Pathway Integration (Live Data - NEW)
- **Where to implement**: New data pipeline
- **Environment variables needed**:
  ```env
  PATHWAY_API_KEY=your_pathway_key
  PATHWAY_ENDPOINT=your_pathway_endpoint
  ```

## 📂 Files That Need API Key Implementation

### Existing Files to Update:
1. **`.env.local`** - Add all environment variables
2. **`/lib/azure-config.ts`** - Already configured, just needs env vars
3. **`/app/api/chat/route.ts`** - Already uses Google AI, needs proper key
4. **`/app/api/upload/route.ts`** - Uses Azure services
5. **`/app/api/search/route.ts`** - Uses Azure Cognitive Search
6. **`/app/api/usage/route.ts`** - Uses Cosmos DB

### New Files to Create:
1. **`/lib/flexprice.ts`** - Flexprice billing integration
2. **`/lib/pathway.ts`** - Pathway live data integration
3. **`/app/api/billing/route.ts`** - Billing API endpoint
4. **`/app/api/live-data/route.ts`** - Live data ingestion endpoint

## 🔧 Implementation Priority

### Phase 1: Core Functionality (Immediate)
1. **Azure Services** - Get the existing features working
2. **Google AI** - Enable chat functionality

### Phase 2: Billing Integration
1. **Flexprice** - Add billing per question/report
2. **Usage Tracking** - Enhance existing analytics

### Phase 3: Live Data
1. **Pathway** - Add live data ingestion
2. **Incremental Updates** - Refresh reports with new data

## 🚀 Quick Start Steps

1. **Create Azure Resources**:
   - AI Vision service
   - Storage Account
   - Cognitive Search service
   - Cosmos DB account

2. **Get Google AI API Key**:
   - Go to Google AI Studio
   - Generate API key for Gemini

3. **Set up Environment Variables**:
   - Copy `.env.example` to `.env.local`
   - Add all required API keys

4. **Test Core Features**:
   - File upload and processing
   - Chat interface
   - Search functionality

5. **Add Billing Integration**:
   - Implement Flexprice
   - Add usage counters

6. **Implement Live Data**:
   - Set up Pathway
   - Add incremental updates

Would you like me to start implementing any of these integrations?