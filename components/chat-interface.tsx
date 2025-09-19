"use client"

import type React from "react"

import { useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Bot, User, FileText, ExternalLink, ImageIcon, Database, Copy, Download, Share } from "lucide-react"

interface ChatInterfaceProps {
  initialDisplay?: React.ReactNode
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  citations?: Citation[]
  report?: ResearchReport
}

interface Citation {
  id: string
  title: string
  sourceType: "pdf" | "image" | "url" | "feed" | "document"
  pageNumber?: number
  url?: string
}

interface ResearchReport {
  title: string
  executiveSummary: string
  keyFindings: string[]
  sections: {
    title: string
    content: string
    citations: string[]
  }[]
  recommendations: string[]
  sources: any[]
}

export function ChatInterface({ initialDisplay }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("")

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    sendMessage({ text: inputValue })
    setInputValue("")
  }

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-3 w-3 text-red-400" />
      case "image":
        return <ImageIcon className="h-3 w-3 text-blue-400" />
      case "url":
        return <ExternalLink className="h-3 w-3 text-green-400" />
      case "feed":
        return <Database className="h-3 w-3 text-purple-400" />
      default:
        return <FileText className="h-3 w-3 text-gray-400" />
    }
  }

  const renderMessage = (message: any) => {
    const isUser = message.role === "user"

    return (
      <div key={message.id} className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="h-4 w-4 text-primary" />
          </div>
        )}

        <div className={`max-w-[80%] ${isUser ? "order-first" : ""}`}>
          <Card className={`p-4 ${isUser ? "bg-primary text-primary-foreground" : "bg-card"}`}>
            <div className="space-y-3">
              {/* Message Content */}
              <div className="prose prose-sm max-w-none">
                {message.parts?.map((part: any, index: number) => {
                  if (part.type === "text") {
                    return (
                      <div key={index} className="whitespace-pre-wrap">
                        {part.text}
                      </div>
                    )
                  }

                  if (part.type === "tool-searchSources" && part.state === "output-available") {
                    return (
                      <div key={index} className="mt-4">
                        <h4 className="font-medium mb-2">Found {part.output.results.length} relevant sources:</h4>
                        <div className="space-y-2">
                          {part.output.results.map((result: any, idx: number) => (
                            <Card key={idx} className="p-3 bg-muted/50">
                              <div className="flex items-start gap-2">
                                {getSourceIcon(result.sourceType)}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{result.title}</p>
                                  <p className="text-xs text-muted-foreground line-clamp-2">{result.content}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {Math.round(result.relevanceScore * 100)}% match
                                    </Badge>
                                    {result.pageNumber && (
                                      <span className="text-xs text-muted-foreground">Page {result.pageNumber}</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  }

                  if (part.type === "tool-generateReport" && part.state === "output-available") {
                    const report = part.output.report
                    return (
                      <div key={index} className="mt-4">
                        <Card className="p-6 bg-accent/50">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">{report.title}</h3>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                              <Button size="sm" variant="outline">
                                <Download className="h-3 w-3 mr-1" />
                                Export
                              </Button>
                              <Button size="sm" variant="outline">
                                <Share className="h-3 w-3 mr-1" />
                                Share
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">Executive Summary</h4>
                              <p className="text-sm text-muted-foreground">{report.executiveSummary}</p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Key Findings</h4>
                              <ul className="text-sm space-y-1">
                                {report.keyFindings.map((finding, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-primary">•</span>
                                    <span>{finding}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {report.sections.map((section, idx) => (
                              <div key={idx}>
                                <h4 className="font-medium mb-2">{section.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{section.content}</p>
                                {section.citations.length > 0 && (
                                  <div className="flex gap-1 flex-wrap">
                                    {section.citations.map((citationId, citIdx) => (
                                      <Badge key={citIdx} variant="secondary" className="text-xs">
                                        [{citIdx + 1}]
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}

                            <div>
                              <h4 className="font-medium mb-2">Recommendations</h4>
                              <ul className="text-sm space-y-1">
                                {report.recommendations.map((rec, idx) => (
                                  <li key={idx} className="flex items-start gap-2">
                                    <span className="text-primary">→</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <Separator />

                            <div>
                              <h4 className="font-medium mb-2">Sources ({report.sources.length})</h4>
                              <div className="space-y-1">
                                {report.sources.map((source, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-xs">
                                    <Badge variant="outline">[{idx + 1}]</Badge>
                                    {getSourceIcon(source.sourceType)}
                                    <span className="truncate">{source.title}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    )
                  }

                  return null
                })}
              </div>
            </div>
          </Card>

          <div className="text-xs text-muted-foreground mt-1 px-1">
            {(() => {
              if (!message.createdAt) return new Date().toLocaleTimeString()
              const date = new Date(message.createdAt)
              return isNaN(date.getTime()) ? new Date().toLocaleTimeString() : date.toLocaleTimeString()
            })()}
          </div>
        </div>

        {isUser && (
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
        )}
      </div>
    )
  }

  const renderContent = (content: string) => {
    // Basic markdown for bolding and lists
    let formattedContent = content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    formattedContent = formattedContent.replace(/(\n- .*)+/g, (match) => {
      const items = match.trim().split('\n').map(item => `<li>${item.substring(2)}</li>`).join('')
      return `<ul>${items}</ul>`
    })
    return <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
  }

  return (
    <div className="flex flex-col h-full bg-background/70 backdrop-blur-sm">
      <ScrollArea className="flex-1 p-6">
        <div className="space-y-6">
          {messages.length === 0 && initialDisplay
            ? initialDisplay
            : messages.map((m) => renderMessage(m))}
        </div>
      </ScrollArea>

      {/* Chat Input */}
      <div className="border-t border-border/50 p-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Ask a question about your sources..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="pr-12 h-12 text-base"
                disabled={false}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-2 top-2 h-8 w-8 p-0"
                disabled={!inputValue.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            ResearchAI can make mistakes. Verify important information with original sources.
          </p>
        </div>
      </div>
    </div>
  )
}
