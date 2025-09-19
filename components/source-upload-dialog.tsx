"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, ImageIcon, X, CheckCircle, AlertCircle, Music } from "lucide-react"
import { useDropzone } from "react-dropzone"
import { useUser } from "@/lib/user-context"
import { appConfig } from "@/lib/app-config"
import { APP_CONSTANTS } from "@/lib/constants"

interface UploadedFile {
  id: string
  file: File
  progress: number
  status: "uploading" | "processing" | "completed" | "error"
  type: "pdf" | "image" | "document" | "audio"
}

interface SourceUploadDialogProps {
  onSourceAdded: (source: any) => void
  children?: React.ReactNode
}

export function SourceUploadDialog({ onSourceAdded, children }: SourceUploadDialogProps) {
  const [open, setOpen] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const { user } = useUser()

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      progress: 0,
      status: "uploading",
      type: file.type.includes("pdf")
        ? "pdf"
        : file.type.includes("image")
          ? "image"
          : file.type.includes("audio")
            ? "audio"
            : "document",
    }))

    setUploadedFiles((prev) => [...prev, ...newFiles])

    // Start the actual upload process
    newFiles.forEach((uploadFile) => {
      uploadAndProcessFile(uploadFile)
    })
  }, [user])

  const uploadAndProcessFile = async (uploadedFile: UploadedFile) => {
    try {
      const formData = new FormData()
      formData.append("file", uploadedFile.file)
      formData.append("userId", user?.id || "anonymous")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      // Update file status to completed
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "completed" as const, progress: 100 } : f)),
      )

      // Add to sources list
      onSourceAdded({
        id: result.document.id,
        name: result.document.title,
        type: result.document.sourceType,
        size: `${(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB`,
        status: "indexed",
      })
    } catch (error) {
      console.error("Upload and processing error:", error)
      setUploadedFiles((prev) =>
        prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "error" as const } : f)),
      )
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: appConfig.upload.allowedTypes,
    maxSize: appConfig.upload.maxFileSize,
    maxFiles: appConfig.upload.maxFiles,
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== fileId))
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-4 w-4 text-red-400" />
      case "image":
        return <ImageIcon className="h-4 w-4 text-blue-400" />
      case "audio":
        return <Music className="h-4 w-4 text-purple-400" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-400" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button className="gap-2">
            <Upload className="h-4 w-4" />
            {APP_CONSTANTS.UI_TEXT.UPLOAD_SOURCE}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{APP_CONSTANTS.UI_TEXT.UPLOAD_SOURCE}</DialogTitle>
          <DialogDescription>
            {APP_CONSTANTS.UI_TEXT.UPLOAD_DESCRIPTION}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card
            {...getRootProps()}
            className={`p-8 border-2 border-dashed cursor-pointer transition-colors ${
              isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
            }`}
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {isDragActive ? "Drop files here" : APP_CONSTANTS.UI_TEXT.DRAG_DROP_TEXT}
              </h3>
              <p className="text-muted-foreground mb-4">or click to browse files</p>
              <p className="text-sm text-muted-foreground">
                Supports PDF, text files, Word docs, and audio files (max 50MB)
              </p>
            </div>
          </Card>

          {uploadedFiles.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Uploading Files</h4>
              {uploadedFiles.map((file) => (
                <Card key={file.id} className="p-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(file.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{file.file.name}</p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="h-6 w-6 p-0">
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={file.progress} className="flex-1" />
                        <span className="text-xs text-muted-foreground min-w-0">
                          {file.status === "uploading" && `${file.progress}%`}
                          {file.status === "processing" && "Processing..."}
                          {file.status === "completed" && "Complete"}
                          {file.status === "error" && "Error"}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
