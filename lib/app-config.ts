// Application configuration
export const appConfig = {
  // Application URLs
  baseUrl: process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
  
  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
  },
  
  // User Configuration
  user: {
    defaultCredits: 100,
    defaultPlan: 'free' as const,
    sessionKey: 'research_assistant_user',
  },
  
  // File Upload Configuration
  upload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt'],
      'application/rtf': ['.rtf'],
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a'],
      'audio/ogg': ['.ogg'],
    },
    maxFiles: 10,
  },
  
  // UI Configuration
  ui: {
    defaultPageSize: 10,
    maxSearchResults: 50,
    animationDuration: 200,
  },
  
  // Feature Flags
  features: {
    liveData: process.env.NODE_ENV === 'production',
    analytics: true,
    billing: process.env.NODE_ENV === 'production',
    fileUpload: true,
  },
  
  // Billing Configuration
  billing: {
    costs: {
      question: 1, // credits per question
      report: 5,   // credits per report
      source: 2,   // credits per source processed
    },
    plans: {
      free: { credits: 100, price: 0 },
      pro: { credits: 1000, price: 9.99 },
      enterprise: { credits: 10000, price: 99.99 },
    },
  },
  
  // Search Configuration
  search: {
    maxResults: 10,
    highlightLength: 200,
    relevanceThreshold: 0.5,
  },
} as const

export type AppConfig = typeof appConfig