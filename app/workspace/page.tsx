"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SourceUploadDialog } from "@/components/source-upload-dialog"
import { SourceList } from "@/components/source-list"
import { ChatInterface } from "@/components/chat-interface"
import { AnalyticsSidebar } from "@/components/analytics-sidebar"
import { ArrowLeft, Brain, Plus } from "lucide-react"

interface Source {
  id: number
  name: string
  type: "pdf" | "image" | "url" | "feed"
  size: string
  status: "indexed" | "processing" | "error"
  lastUpdated?: string
}

export default function WorkspacePage() {
  const [sources, setSources] = useState<Source[]>([
    {
      id: 1,
      name: "AI Research Paper.pdf",
      type: "pdf",
      size: "2.4 MB",
      status: "indexed",
      lastUpdated: "2 hours ago",
    },
    { id: 2, name: "Market Analysis.png", type: "image", size: "1.2 MB", status: "processing" },
  ])

  const handleSourceAdded = (newSource: Omit<Source, "lastUpdated">) => {
    setSources((prev) => [...prev, { ...newSource, lastUpdated: "just now" }])
  }

  const handleSourceRemove = (id: number) => {
    setSources((prev) => prev.filter((source) => source.id !== id))
  }

  const handleSourceRefresh = (id: number) => {
    setSources((prev) =>
      prev.map((source) =>
        source.id === id ? { ...source, status: "processing" as const, lastUpdated: "refreshing..." } : source,
      ),
    )

    setTimeout(() => {
      setSources((prev) =>
        prev.map((source) =>
          source.id === id ? { ...source, status: "indexed" as const, lastUpdated: "just now" } : source,
        ),
      )
    }, 2000)
  }

  const handleBackToHome = () => {
    window.location.href = "/"
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
              <h1 className="text-xl font-bold text-balance">ResearchAI</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              PRO
            </Badge>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Simplified Sources */}
        <div className="w-80 border-r border-border/50 glass-effect">
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-balance">Sources</h2>
            </div>

            <div className="mb-6">
              <SourceUploadDialog onSourceAdded={handleSourceAdded}>
                <Button className="w-full justify-start gap-2 h-10">
                  <Plus className="h-4 w-4" />
                  Add Source
                </Button>
              </SourceUploadDialog>
            </div>

            <Separator className="mb-6" />

            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto">
                <SourceList
                  sources={sources}
                  onSourceRemove={handleSourceRemove}
                  onSourceRefresh={handleSourceRefresh}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Chat */}
        <div className="flex-1 flex flex-col">
          <ChatInterface />
        </div>

        {/* Right Panel - Simplified Analytics */}
        <div className="w-80 border-l border-border/50 glass-effect">
          <AnalyticsSidebar />
        </div>
      </div>
    </div>
  )
}
