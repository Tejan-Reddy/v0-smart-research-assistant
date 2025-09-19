// Flexprice billing integration for usage tracking and billing
interface FlexpriceConfig {
  apiKey: string
  webhookSecret: string
  baseUrl: string
}

interface UsageEvent {
  userId: string
  eventType: 'question_asked' | 'report_generated' | 'source_processed'
  metadata?: {
    questionLength?: number
    reportType?: string
    sourceType?: string
    processingTime?: number
    queryType?: string
    actionType?: string
    sourceTypes?: string[]
    creditsUsed?: number
    success?: boolean
    sourcesUsed?: number
    error?: string
    [key: string]: any // Allow additional properties
  }
  timestamp: string
  credits: number
}

interface BillingUsage {
  userId: string
  questionsAsked: number
  reportsGenerated: number
  sourcesProcessed: number
  totalCredits: number
  currentPeriodStart: string
  currentPeriodEnd: string
}

class FlexpriceService {
  private config: FlexpriceConfig

  constructor() {
    this.config = {
      apiKey: process.env.FLEXPRICE_API_KEY || '',
      webhookSecret: process.env.FLEXPRICE_WEBHOOK_SECRET || '',
      baseUrl: process.env.FLEXPRICE_BASE_URL || 'https://api.flexprice.com'
    }

    if (!this.config.apiKey) {
      console.warn('Flexprice API key not configured')
    }
  }

  // Record usage event and charge credits
  async recordUsage(event: UsageEvent): Promise<void> {
    try {
      const response = await fetch(`${this.config.baseUrl}/usage`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: event.userId,
          event_type: event.eventType,
          credits_used: event.credits,
          metadata: event.metadata,
          timestamp: event.timestamp
        })
      })

      if (!response.ok) {
        throw new Error(`Flexprice API error: ${response.statusText}`)
      }

      console.log(`Recorded usage: ${event.eventType} for user ${event.userId} - ${event.credits} credits`)
    } catch (error) {
      console.error('Failed to record usage:', error)
      // Don't throw error to prevent blocking user functionality
    }
  }

  // Get user's current billing usage
  async getUserUsage(userId: string): Promise<BillingUsage> {
    try {
      const response = await fetch(`${this.config.baseUrl}/users/${userId}/usage`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        throw new Error(`Flexprice API error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        userId,
        questionsAsked: data.questions_asked || 0,
        reportsGenerated: data.reports_generated || 0,
        sourcesProcessed: data.sources_processed || 0,
        totalCredits: data.total_credits || 0,
        currentPeriodStart: data.current_period_start,
        currentPeriodEnd: data.current_period_end
      }
    } catch (error) {
      console.error('Failed to get user usage:', error)
      // Return default usage if API fails
      return {
        userId,
        questionsAsked: 0,
        reportsGenerated: 0,
        sourcesProcessed: 0,
        totalCredits: 0,
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    }
  }

  // Check if user has sufficient credits
  async hasCredits(userId: string, requiredCredits: number): Promise<boolean> {
    try {
      const usage = await this.getUserUsage(userId)
      const response = await fetch(`${this.config.baseUrl}/users/${userId}/credits`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json()
      return data.available_credits >= requiredCredits
    } catch (error) {
      console.error('Failed to check credits:', error)
      return false
    }
  }

  // Get pricing for different actions
  getPricing() {
    return {
      questionAsked: 1, // 1 credit per question
      reportGenerated: 3, // 3 credits per report
      sourceProcessed: 1, // 1 credit per source processed
      imageOCR: 2, // 2 credits for image OCR
      liveDataRefresh: 1 // 1 credit for live data refresh
    }
  }

  // Verify webhook signature (for webhook endpoints)
  verifyWebhook(payload: string, signature: string): boolean {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', this.config.webhookSecret)
      .update(payload)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  }
}

export const flexpriceService = new FlexpriceService()
export type { UsageEvent, BillingUsage }