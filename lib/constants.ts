// Application constants and text content
export const APP_CONSTANTS = {
  // Application metadata
  APP_NAME: "ResearchAI",
  APP_DESCRIPTION: "Smart Research Assistant with AI-powered analysis",
  
  // User interface text
  UI_TEXT: {
    // Navigation
    HOME: "Home",
    HISTORY: "History", 
    WORKSPACE: "Workspace",
    
    // Actions
    CREATE_NEW: "Create New",
    BROWSE_EXISTING: "Browse Existing", 
    UPLOAD_SOURCE: "Upload Source",
    ASK_QUESTION: "Ask a Question",
    GENERATE_REPORT: "Generate Report",
    
    // Placeholders
    SEARCH_PLACEHOLDER: "Search...",
    QUESTION_PLACEHOLDER: "Ask a question about your sources...",
    NOTEBOOK_SEARCH_PLACEHOLDER: "Search notebooks...",
    SOURCE_SEARCH_PLACEHOLDER: "Search sources...",
    
    // Status messages
    NO_DATA: "No data available",
    LOADING: "Loading...",
    ERROR: "An error occurred",
    SUCCESS: "Success",
    
    // Empty states
    NO_NOTEBOOKS: "No notebooks found",
    NO_SOURCES: "No sources added yet",
    NO_ACTIVITY: "No recent activity",
    NO_SEARCH_RESULTS: "No results match your search",
    
    // File upload
    UPLOAD_DESCRIPTION: "Upload documents, images, or other files to use as sources for your research assistant.",
    DRAG_DROP_TEXT: "Drag and drop files here, or click to browse",
    FILE_SIZE_LIMIT: "Maximum file size: 10MB",
    SUPPORTED_FORMATS: "Supported formats: PDF, Images, Documents, Audio",
    
    // Analytics
    PERFORMANCE_INSIGHTS: "Performance Insights",
    TOP_SOURCES: "Top Performing Sources", 
    QUICK_STATS: "Quick Stats",
    RECENT_ACTIVITY: "Recent Activity",
    
    // Billing
    CREDITS_USED: "Credits Used",
    CREDITS_REMAINING: "Credits Remaining",
    UPGRADE_PLAN: "Upgrade Plan",
    BILLING_HISTORY: "Billing History",
  },
  
  // File types and extensions
  FILE_TYPES: {
    PDF: "pdf",
    IMAGE: "image", 
    DOCUMENT: "document",
    AUDIO: "audio",
    URL: "url",
    FEED: "feed",
  },
  
  // Status types
  STATUS: {
    INDEXED: "indexed",
    PROCESSING: "processing", 
    ERROR: "error",
    UPLOADING: "uploading",
    COMPLETED: "completed",
  },
  
  // Activity types
  ACTIVITY_TYPES: {
    REPORT: "report",
    RESEARCH: "research",
    PROCESSING: "processing", 
    INDEXING: "indexing",
  },
  
  // Error messages
  ERRORS: {
    USER_ID_REQUIRED: "User ID is required",
    INSUFFICIENT_CREDITS: "Insufficient credits",
    FILE_TOO_LARGE: "File size exceeds maximum limit",
    UNSUPPORTED_FORMAT: "Unsupported file format",
    UPLOAD_FAILED: "Upload failed",
    PROCESSING_FAILED: "Processing failed",
    API_ERROR: "API request failed",
    NETWORK_ERROR: "Network connection error",
  },
  
  // Success messages
  SUCCESS: {
    FILE_UPLOADED: "File uploaded successfully",
    SOURCE_ADDED: "Source added successfully", 
    REPORT_GENERATED: "Report generated successfully",
    SETTINGS_SAVED: "Settings saved successfully",
  },
} as const

export type AppConstants = typeof APP_CONSTANTS