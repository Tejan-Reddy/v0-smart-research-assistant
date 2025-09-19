"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Download } from "lucide-react"

interface AnalyticsData {
  creditsUsed: number
  creditsTotal: number
}

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7d")

  const analytics: AnalyticsData = {
    creditsUsed: 47,
    creditsTotal: 100,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics</h2>
          <p className="text-muted-foreground">Track your research activity and usage</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            {timeRange}
          </Button>
        </div>
      </div>

      {/* Usage Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Credit Usage</h3>
          <Badge variant={analytics.creditsUsed > 80 ? "destructive" : "secondary"}>
            {analytics.creditsUsed}/{analytics.creditsTotal} credits
          </Badge>
        </div>
        <div className="space-y-3">
          <Progress value={(analytics.creditsUsed / analytics.creditsTotal) * 100} className="h-3" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Credits used this period</span>
            <span>{analytics.creditsTotal - analytics.creditsUsed} credits remaining</span>
          </div>
        </div>
      </Card>

      {/* Summary Button */}
      <div className="flex justify-center">
        <Button size="lg" className="px-8">
          Summary
        </Button>
      </div>

    </div>
  )
}
