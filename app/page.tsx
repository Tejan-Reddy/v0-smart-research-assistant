"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Plus, History, ArrowRight, BookOpen } from "lucide-react"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const router = useRouter()

  const handleCreateNotebook = () => {
    router.push("/workspace")
  }

  const handleViewHistory = () => {
    router.push("/history")
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 glass-effect">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-balance">ResearchAI</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              PRO
            </Badge>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleViewHistory}>
              <History className="h-4 w-4 mr-2" />
              History
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-balance">Welcome to ResearchAI</h2>
            <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Your intelligent research assistant for evidence-based insights. Create new research notebooks or continue working on existing ones.
            </p>
          </div>

          {/* Main Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Create New Notebook Card */}
            <Card className="p-8 text-center glass-effect hover:bg-accent/5 transition-all duration-300 group cursor-pointer" onClick={handleCreateNotebook}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Create New Notebook</h3>
              <p className="text-muted-foreground mb-6 text-balance">
                Start a fresh research project with AI-powered analysis and document processing
              </p>
              <Button size="lg" className="group-hover:scale-105 transition-transform">
                <Plus className="h-5 w-5 mr-2" />
                New Notebook
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>

            {/* Access Existing Notebooks Card */}
            <Card className="p-8 text-center glass-effect hover:bg-accent/5 transition-all duration-300 group cursor-pointer" onClick={handleViewHistory}>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-6 group-hover:bg-accent/20 transition-colors">
                <BookOpen className="h-10 w-10 text-accent" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Open Existing Notebook</h3>
              <p className="text-muted-foreground mb-6 text-balance">
                Continue working on your previous research projects and access your notebook history
              </p>
              <Button size="lg" variant="outline" className="group-hover:scale-105 transition-transform">
                <History className="h-5 w-5 mr-2" />
                Browse Notebooks
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
