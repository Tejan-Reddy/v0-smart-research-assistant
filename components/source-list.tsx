"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, ImageIcon, Globe, Database, Search, MoreVertical, Trash2, RefreshCw, Eye } from "lucide-react"

interface Source {
  id: number
  name: string
  type: "pdf" | "image" | "url" | "feed"
  size: string
  status: "indexed" | "processing" | "error"
  lastUpdated?: string
}

interface SourceListProps {
  sources: Source[]
  onSourceRemove: (id: number) => void
  onSourceRefresh: (id: number) => void
}

export function SourceList({ sources, onSourceRemove, onSourceRefresh }: SourceListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSources = sources.filter((source) => source.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-400" />
      case "image":
        return <ImageIcon className="h-4 w-4 text-blue-400" />
      case "url":
        return <Globe className="h-4 w-4 text-green-400" />
      case "feed":
        return <Database className="h-4 w-4 text-purple-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "indexed":
        return "default"
      case "processing":
        return "secondary"
      case "error":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search sources..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="space-y-2">
        {filteredSources.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="text-muted-foreground">
              {searchQuery ? "No sources match your search" : "No sources added yet"}
            </div>
          </Card>
        ) : (
          filteredSources.map((source) => (
            <Card key={source.id} className="p-3 hover:bg-accent/50 transition-colors group">
              <div className="flex items-start gap-3">
                <div className="mt-1">{getSourceIcon(source.type)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{source.name}</p>
                      <p className="text-xs text-muted-foreground">{source.size}</p>
                      {source.lastUpdated && (
                        <p className="text-xs text-muted-foreground">Updated {source.lastUpdated}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge variant={getStatusColor(source.status)} className="text-xs">
                        {source.status}
                      </Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {}}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSourceRefresh(source.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onSourceRemove(source.id)} className="text-destructive">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
