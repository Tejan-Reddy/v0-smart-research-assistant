"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Brain, ArrowLeft, Search, FileText, Clock, TrendingUp, Plus, Trash2 } from "lucide-react"

interface Notebook {
  id: string
  title: string
  lastModified: string
  messageCount: number
  sourceCount: number
  status: "active" | "archived"
  createdAt: string
}

interface ActivityLog {
  id: string
  type: "notebook_created" | "report_generated" | "source_added"
  title: string
  timestamp: string
  notebookId?: string
}

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [notebooks] = useState<Notebook[]>([
    {
      id: "1",
      title: "AI Market Research",
      lastModified: "2 hours ago",
      messageCount: 12,
      sourceCount: 5,
      status: "active",
      createdAt: "2024-01-15",
    },
    {
      id: "2",
      title: "Competitor Analysis Q4",
      lastModified: "1 day ago",
      messageCount: 8,
      sourceCount: 3,
      status: "active",
      createdAt: "2024-01-14",
    },
    {
      id: "3",
      title: "Product Strategy Review",
      lastModified: "3 days ago",
      messageCount: 15,
      sourceCount: 7,
      status: "archived",
      createdAt: "2024-01-12",
    },
    {
      id: "4",
      title: "Customer Feedback Analysis",
      lastModified: "1 week ago",
      messageCount: 6,
      sourceCount: 4,
      status: "active",
      createdAt: "2024-01-08",
    },
  ])

  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: "1",
      type: "report_generated",
      title: "Market Analysis Report generated",
      timestamp: "2 hours ago",
      notebookId: "1",
    },
    {
      id: "2",
      type: "source_added",
      title: "PDF document added to AI Market Research",
      timestamp: "3 hours ago",
      notebookId: "1",
    },
    {
      id: "3",
      type: "notebook_created",
      title: "New notebook 'AI Market Research' created",
      timestamp: "2 days ago",
      notebookId: "1",
    },
    {
      id: "4",
      type: "report_generated",
      title: "Competitor Analysis Report generated",
      timestamp: "1 day ago",
      notebookId: "2",
    },
  ])

  const filteredNotebooks = notebooks.filter((notebook) =>
    notebook.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleBackToHome = () => {
    window.location.href = "/"
  }

  const handleCreateNotebook = () => {
    window.location.href = "/workspace"
  }

  const handleOpenNotebook = (id: string) => {
    window.location.href = `/workspace?notebook=${id}`
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "notebook_created":
        return <Plus className="h-4 w-4 text-green-400" />
      case "report_generated":
        return <FileText className="h-4 w-4 text-blue-400" />
      case "source_added":
        return <TrendingUp className="h-4 w-4 text-purple-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 glass-effect">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-balance">Research History</h1>
            </div>
          </div>

          <Button onClick={handleCreateNotebook}>
            <Plus className="h-4 w-4 mr-2" />
            New Notebook
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Notebooks */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold">All Notebooks</h2>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search notebooks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredNotebooks.length === 0 ? (
                  <Card className="p-8 text-center">
                    <div className="text-muted-foreground">
                      {searchQuery ? "No notebooks match your search" : "No notebooks found"}
                    </div>
                  </Card>
                ) : (
                  filteredNotebooks.map((notebook) => (
                    <Card
                      key={notebook.id}
                      className="p-6 hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleOpenNotebook(notebook.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{notebook.title}</h3>
                            <Badge variant={notebook.status === "active" ? "default" : "secondary"}>
                              {notebook.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
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
                          <div className="text-xs text-muted-foreground">Created on {notebook.createdAt}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            Open
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Sidebar - Recent Activity */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activityLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-3">
                      <div className="mt-1">{getActivityIcon(log.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{log.title}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Notebooks</span>
                    <span className="font-medium">{notebooks.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Notebooks</span>
                    <span className="font-medium">{notebooks.filter((n) => n.status === "active").length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Messages</span>
                    <span className="font-medium">{notebooks.reduce((sum, n) => sum + n.messageCount, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Sources</span>
                    <span className="font-medium">{notebooks.reduce((sum, n) => sum + n.sourceCount, 0)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
