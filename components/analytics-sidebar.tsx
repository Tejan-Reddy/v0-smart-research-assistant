"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { Mic, FileText, BarChart3, TrendingUp, Clock, Zap, Users, CreditCard } from "lucide-react"

export function AnalyticsSidebar() {
  const [showFullAnalytics, setShowFullAnalytics] = useState(false)

  const analytics = {
    creditsUsed: 47,
    creditsTotal: 100,
    reportsGenerated: 41,
    sourcesProcessed: 23,
    avgResponseTime: 2.8,
    successRate: 98.5,
  }

  const recentActivity = [
    { id: 1, title: "Market Analysis Report", time: "2 minutes ago", type: "report" },
    { id: 2, title: "Competitor Research", time: "1 hour ago", type: "research" },
    { id: 3, title: "PDF Analysis Complete", time: "3 hours ago", type: "processing" },
    { id: 4, title: "Audio File Processed", time: "5 hours ago", type: "indexing" },
    { id: 5, title: "Trend Analysis Generated", time: "1 day ago", type: "report" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-balance">Analytics</h2>
        <Dialog open={showFullAnalytics} onOpenChange={setShowFullAnalytics}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Analytics Dashboard</DialogTitle>
            </DialogHeader>
            <AnalyticsDashboard />
          </DialogContent>
        </Dialog>
      </div>

      {/* Enhanced Usage Stats */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Credits Used</span>
            <Badge variant={analytics.creditsUsed > 80 ? "destructive" : "secondary"}>
              {analytics.creditsUsed}/{analytics.creditsTotal}
            </Badge>
          </div>
          <Progress value={(analytics.creditsUsed / analytics.creditsTotal) * 100} className="h-2" />
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="text-center">
              <p className="font-medium text-primary">{analytics.reportsGenerated}</p>
              <p className="text-muted-foreground">Reports</p>
            </div>
            <div className="text-center">
              <p className="font-medium text-primary">{analytics.sourcesProcessed}</p>
              <p className="text-muted-foreground">Sources</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <p className="text-sm font-medium">{analytics.avgResponseTime}s</p>
          <p className="text-xs text-muted-foreground">Avg Time</p>
        </Card>

        <Card className="p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-green-400" />
          </div>
          <p className="text-sm font-medium">{analytics.successRate}%</p>
          <p className="text-xs text-muted-foreground">Success</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer text-center">
          <Mic className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Audio Overview</p>
          <Badge variant="outline" className="text-xs mt-1">
            Coming Soon
          </Badge>
        </Card>

        <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer text-center">
          <FileText className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Reports</p>
          <Badge variant="secondary" className="text-xs mt-1">
            {analytics.reportsGenerated}
          </Badge>
        </Card>

        <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer text-center">
          <CreditCard className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Flashcards</p>
          <Badge variant="outline" className="text-xs mt-1">
            Beta
          </Badge>
        </Card>

        <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer text-center">
          <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Usage Stats</p>
          <Badge variant="secondary" className="text-xs mt-1">
            Live
          </Badge>
        </Card>
      </div>

      <Separator />

      {/* Enhanced Recent Activity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground">Recent Activity</h3>
          <Button variant="ghost" size="sm" className="text-xs h-6">
            View All
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {recentActivity.map((activity) => (
            <Card key={activity.id} className="p-3 hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-start gap-2">
                <div className="mt-1">
                  {activity.type === "report" && <FileText className="h-3 w-3 text-blue-400" />}
                  {activity.type === "research" && <BarChart3 className="h-3 w-3 text-purple-400" />}
                  {activity.type === "processing" && <Zap className="h-3 w-3 text-yellow-400" />}
                  {activity.type === "indexing" && <Users className="h-3 w-3 text-green-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Usage Insights */}
      <Card className="p-4">
        <h4 className="text-sm font-medium mb-3">Today's Insights</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Peak usage</span>
            <span className="font-medium">2:30 PM</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Most used source</span>
            <span className="font-medium">PDFs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fastest report</span>
            <span className="font-medium">1.2s</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
