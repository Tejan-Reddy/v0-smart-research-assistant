"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Cloud, Database, Search, Eye } from "lucide-react"

interface ServiceStatus {
  name: string
  status: "connected" | "error" | "checking"
  icon: React.ComponentType<any>
  description: string
  lastChecked?: string
}

export function AzureStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([
    {
      name: "Blob Storage",
      status: "checking",
      icon: Cloud,
      description: "File storage and management",
    },
    {
      name: "AI Vision",
      status: "checking",
      icon: Eye,
      description: "Image text extraction",
    },
    {
      name: "Cognitive Search",
      status: "checking",
      icon: Search,
      description: "Document indexing and search",
    },
    {
      name: "Cosmos DB",
      status: "checking",
      icon: Database,
      description: "Usage tracking and analytics",
    },
  ])

  const checkServices = async () => {
    setServices((prev) => prev.map((service) => ({ ...service, status: "checking" as const })))

    // Simulate service checks (in real implementation, these would be actual health checks)
    setTimeout(() => {
      setServices((prev) =>
        prev.map((service) => ({
          ...service,
          status: Math.random() > 0.1 ? ("connected" as const) : ("error" as const),
          lastChecked: new Date().toLocaleTimeString(),
        })),
      )
    }, 2000)
  }

  useEffect(() => {
    checkServices()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-400" />
      case "checking":
        return <RefreshCw className="h-4 w-4 text-yellow-400 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return (
          <Badge variant="secondary" className="text-green-400">
            Connected
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      case "checking":
        return <Badge variant="outline">Checking...</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const allConnected = services.every((service) => service.status === "connected")
  const hasErrors = services.some((service) => service.status === "error")

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Azure Services Status</h3>
        <Button variant="outline" size="sm" onClick={checkServices}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {hasErrors && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some Azure services are experiencing issues. This may affect functionality.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-3">
        {services.map((service) => {
          const IconComponent = service.icon
          return (
            <Card key={service.name} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <IconComponent className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">{service.description}</p>
                    {service.lastChecked && (
                      <p className="text-xs text-muted-foreground">Last checked: {service.lastChecked}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  {getStatusBadge(service.status)}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {allConnected && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>All Azure services are connected and operational.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
