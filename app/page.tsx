"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, Plus, History, FileText, Clock, TrendingUp } from "lucide-react"

interface RecentNotebook {
  id: string
  title: string
  lastModified: string
  messageCount: number
  sourceCount: number
}

export default function LandingPage() {
  const [recentNotebooks] = useState<RecentNotebook[]>([
    {
      id: "1",
      title: "AI Market Research",
      lastModified: "2 hours ago",
      messageCount: 12,
      sourceCount: 5,
    },
    {
      id: "2",
      title: "Competitor Analysis Q4",
      lastModified: "1 day ago",
      messageCount: 8,
      sourceCount: 3,
    },
    {
      id: "3",
      title: "Product Strategy Review",
      lastModified: "3 days ago",
      messageCount: 15,
      sourceCount: 7,
    },
  ])

  const handleCreateNotebook = () => {
    window.location.href = "/workspace"
  }

  const handleViewHistory = () => {
    window.location.href = "/history"
  }

  const handleOpenNotebook = (id: string) => {
    window.location.href = `/workspace?notebook=${id}`
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
            <p className="text-xl text-muted-foreground text-balance">
              Your intelligent research assistant for evidence-based insights
            </p>
          </div>

          {/* Create New Notebook */}
          <Card className="p-8 mb-8 text-center glass-effect">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Create New Notebook</h3>
            <p className="text-muted-foreground mb-6">Start a new research project with AI-powered analysis</p>
            <Button size="lg" onClick={handleCreateNotebook}>
              <Plus className="h-5 w-5 mr-2" />
              Create Notebook
            </Button>
          </Card>

          {/* Recent Activity */}
          {recentNotebooks.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Recent Notebooks</h3>
                <Button variant="outline" onClick={handleViewHistory}>
                  View All History
                </Button>
              </div>

              <div className="grid gap-4">
                {recentNotebooks.map((notebook) => (
                  <Card
                    key={notebook.id}
                    className="p-6 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => handleOpenNotebook(notebook.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold mb-2">{notebook.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {notebook.lastModified}
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            {notebook.messageCount} messages
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            {notebook.sourceCount} sources
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        Open
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12">
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">47</div>
              <div className="text-sm text-muted-foreground">Reports Generated</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">23</div>
              <div className="text-sm text-muted-foreground">Sources Processed</div>
            </Card>
            <Card className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">98.5%</div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
