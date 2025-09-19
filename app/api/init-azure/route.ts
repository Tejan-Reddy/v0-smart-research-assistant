import { NextResponse } from 'next/server'
import { azureCognitiveSearch } from '@/lib/azure-cognitive-search'

export async function GET() {
  try {
    console.log('🚀 Initializing Azure services...')
    
    // Check environment variables
    console.log('Environment check:')
    console.log('AZURE_SEARCH_ENDPOINT:', process.env.AZURE_SEARCH_ENDPOINT ? 'SET' : 'NOT SET')
    console.log('AZURE_SEARCH_API_KEY:', process.env.AZURE_SEARCH_API_KEY ? 'SET' : 'NOT SET')
    
    // Initialize search index
    console.log('📋 Creating search index...')
    await azureCognitiveSearch.createIndex()
    console.log('✅ Search index created/verified')
    
    return NextResponse.json({ 
      success: true, 
      message: 'Azure Cognitive Search index initialized successfully' 
    })
  } catch (error) {
    console.error('❌ Failed to initialize Azure services:', error)
    
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : 'No stack trace'
    }, { status: 500 })
  }
}