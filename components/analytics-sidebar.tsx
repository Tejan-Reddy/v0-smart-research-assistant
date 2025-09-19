"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AnalyticsDashboard } from "./analytics-dashboard"
import { BarChart3 } from "lucide-react"

export function AnalyticsSidebar() {
  const [showFullAnalytics, setShowFullAnalytics] = useState(false)

  const analytics = {
    creditsUsed: 0,
    creditsTotal: 100,
  }

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
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3">
        <Card className="p-4 hover:bg-accent/50 transition-colors cursor-pointer text-center">
          <BarChart3 className="h-6 w-6 text-primary mx-auto mb-2" />
          <p className="text-sm font-medium">Summary</p>
          <Badge variant="secondary" className="text-xs mt-1">
            Available
          </Badge>
        </Card>
      </div>
    </div>
  )
}