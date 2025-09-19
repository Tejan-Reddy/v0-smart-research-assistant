"use client"

import { Button } from "@/components/ui/button"
import { Brain, ArrowLeft, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

export default function HistoryPage() {
  const router = useRouter()
  
  const handleBackToHome = () => {
    router.push("/")
  }

  const handleCreateNotebook = () => {
    router.push("/workspace")
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 glass-effect">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleBackToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-balance">Research History</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button onClick={handleCreateNotebook}>
              <Plus className="h-4 w-4 mr-2" />
              New Notebook
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-balance">Research History</h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              Your research history will appear here once you start creating notebooks.
            </p>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold mb-2">No notebooks found</h3>
            <p className="text-muted-foreground mb-6">
              Create your first notebook to get started
            </p>
            <Button onClick={handleCreateNotebook}>
              <Plus className="h-4 w-4 mr-2" />
              Create New Notebook
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
