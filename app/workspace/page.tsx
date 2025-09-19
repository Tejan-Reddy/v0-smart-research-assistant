"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { SourceUploadDialog } from "@/components/source-upload-dialog"
import { SourceList } from "@/components/source-list"
import { ChatInterface } from "@/components/chat-interface"
import { AnalyticsSidebar } from "@/components/analytics-sidebar"
import { ArrowLeft, Brain, Plus, Home, History } from "lucide-react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/user-context"

interface Source {
  id: string
  name: string
  type: "pdf" | "image" | "url" | "feed"
  size: string
  status: "indexed" | "processing" | "error"
  lastUpdated?: string
}

interface SummaryReport {
  title: string
  executiveSummary: string
  keyFindings: string[]
  sections: { title: string; content: string; citations: string[] }[]
  recommendations: string[]
  sources: Source[]
}

export default function WorkspacePage() {
  const router = useRouter()
  const { user } = useUser()
  const [sources, setSources] = useState<Source[]>([])
  const [summary, setSummary] = useState<SummaryReport | null>(null)
  const [isLoadingSummary, setIsLoadingSummary] = useState(true)

  useEffect(() => {
    const fetchSummary = async () => {
      if (!user?.id) return
      setIsLoadingSummary(true)
      try {
        const response = await fetch(`/api/summary?userId=${user.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch summary")
        }
        const data = await response.json()
        setSummary(data.summary)
        // Also populate the sources list from the summary
        setSources(data.summary.sources.map((s: any) => ({
          id: s.id,
          name: s.title,
          type: s.sourceType,
          size: 'N/A', // Size is not available from summary
          status: 'indexed'
        })))
      } catch (error) {
        console.error("Error fetching initial summary:", error)
        // You could set an error state here to show in the UI
      } finally {
        setIsLoadingSummary(false)
      }
    }

    fetchSummary()
  }, [user])

  const handleSourceAdded = (newSource: Omit<Source, "lastUpdated">) => {
    setSources((prev) => {
      // Check if source already exists to prevent duplicates
      const existingSource = prev.find(source => source.id === newSource.id)
      if (existingSource) {
        console.log('Source already exists, skipping duplicate:', newSource.name)
        return prev
      }
      return [...prev, { ...newSource, lastUpdated: "just now" }]
    })
  }

  const handleSourceRemove = (id: string) => {
    setSources((prev) => prev.filter((source) => source.id !== id))
  }

  const handleSourceRefresh = (id: string) => {
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
    router.push("/")
  }

  const handleGoToHistory = () => {
    router.push("/history")
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="border-b border-border/50 glass-effect">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={handleBackToHome}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center gap-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-xl font-bold text-balance">Research Workspace</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              PRO
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleGoToHistory}>
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
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
          <ChatInterface initialDisplay={
            isLoadingSummary ? (
              <div className="flex items-center justify-center h-full">
                <p>Loading initial summary...</p>
              </div>
            ) : summary ? (
              <div className="p-6 overflow-y-auto">
                <h2 className="text-2xl font-bold mb-4">{summary.title}</h2>
                <p className="text-muted-foreground mb-6">{summary.executiveSummary}</p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Key Findings</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {summary.keyFindings.map((finding, i) => <li key={i}>{finding}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Recommendations</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {summary.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Could not load summary. Please try refreshing the page.</p>
              </div>
            )
          } />
        </div>

        {/* Right Panel - Simplified Analytics */}
        <div className="w-80 border-l border-border/50 glass-effect">
          <AnalyticsSidebar />
        </div>
      </div>
    </div>
  )
}
