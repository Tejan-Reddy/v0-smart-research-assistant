"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Users, FileText, Clock, Zap, Target, Award, Calendar, Download } from "lucide-react"

interface AnalyticsData {
  creditsUsed: number
  creditsTotal: number
  reportsGenerated: number
  sourcesProcessed: number
  avgResponseTime: number
  successRate: number
}

const usageData = [
  { date: "2024-01-01", reports: 2, sources: 5, credits: 8 },
  { date: "2024-01-02", reports: 4, sources: 3, credits: 12 },
  { date: "2024-01-03", reports: 1, sources: 7, credits: 15 },
  { date: "2024-01-04", reports: 6, sources: 4, credits: 22 },
  { date: "2024-01-05", reports: 3, sources: 6, credits: 18 },
  { date: "2024-01-06", reports: 5, sources: 2, credits: 16 },
  { date: "2024-01-07", reports: 8, sources: 9, credits: 35 },
]

const sourceTypeData = [
  { name: "PDFs", value: 45, color: "#ef4444" },
  { name: "Images", value: 25, color: "#3b82f6" },
  { name: "Websites", value: 20, color: "#10b981" },
  { name: "Data Feeds", value: 10, color: "#8b5cf6" },
]

const reportTypeData = [
  { type: "Market Analysis", count: 12, avgTime: "3.2m" },
  { type: "Competitor Research", count: 8, avgTime: "2.8m" },
  { type: "Trend Analysis", count: 6, avgTime: "4.1m" },
  { type: "Document Summary", count: 15, avgTime: "1.9m" },
]

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7d")

  const analytics: AnalyticsData = {
    creditsUsed: 47,
    creditsTotal: 100,
    reportsGenerated: 41,
    sourcesProcessed: 23,
    avgResponseTime: 2.8,
    successRate: 98.5,
  }

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <div className={`flex items-center gap-1 text-xs ${trend === "up" ? "text-green-400" : "text-red-400"}`}>
              {trend === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change}
            </div>
          )}
        </div>
        <div className="p-2 rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </Card>
  )

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
            <span>{analytics.reportsGenerated} reports generated</span>
            <span>{analytics.creditsTotal - analytics.creditsUsed} credits remaining</span>
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <StatCard
          title="Reports Generated"
          value={analytics.reportsGenerated}
          change="+12% vs last week"
          icon={FileText}
          trend="up"
        />
        <StatCard
          title="Sources Processed"
          value={analytics.sourcesProcessed}
          change="+8% vs last week"
          icon={Users}
          trend="up"
        />
        <StatCard
          title="Avg Response Time"
          value={`${analytics.avgResponseTime}s`}
          change="-0.3s vs last week"
          icon={Clock}
          trend="up"
        />
        <StatCard
          title="Success Rate"
          value={`${analytics.successRate}%`}
          change="+1.2% vs last week"
          icon={Target}
          trend="up"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="usage" className="space-y-4">
        <TabsList>
          <TabsTrigger value="usage">Usage Trends</TabsTrigger>
          <TabsTrigger value="sources">Source Types</TabsTrigger>
          <TabsTrigger value="reports">Report Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Usage</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  formatter={(value, name) => [
                    value,
                    name === "credits" ? "Credits Used" : name === "reports" ? "Reports" : "Sources",
                  ]}
                />
                <Area type="monotone" dataKey="credits" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                <Area type="monotone" dataKey="reports" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Source Distribution</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sourceTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sourceTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Usage"]} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Source Breakdown</h3>
              <div className="space-y-3">
                {sourceTypeData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Report Types & Performance</h3>
            <div className="space-y-4">
              {reportTypeData.map((report, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{report.type}</p>
                    <p className="text-sm text-muted-foreground">{report.count} reports generated</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{report.avgTime}</p>
                    <p className="text-xs text-muted-foreground">avg time</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Insights */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Insights</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Top Performing Sources
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>AI Research Paper.pdf</span>
                <Badge variant="secondary">95% accuracy</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>competitor-website.com</span>
                <Badge variant="secondary">92% accuracy</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Market Analysis.png</span>
                <Badge variant="secondary">88% accuracy</Badge>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 text-primary" />
              Quick Stats
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Fastest report generation</span>
                <span className="font-medium">1.2s</span>
              </div>
              <div className="flex justify-between">
                <span>Most active day</span>
                <span className="font-medium">Yesterday</span>
              </div>
              <div className="flex justify-between">
                <span>Peak usage time</span>
                <span className="font-medium">2-4 PM</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
