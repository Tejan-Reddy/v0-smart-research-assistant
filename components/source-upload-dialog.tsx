"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, ImageIcon, X, CheckCircle, AlertCircle, Music } from "lucide-react"
import { useDropzone } from "react-dropzone"

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

    // Simulate upload progress
    newFiles.forEach((uploadFile) => {
      simulateUpload(uploadFile.id)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "text/*": [".txt", ".md"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "audio/*": [".mp3", ".wav", ".m4a", ".aac", ".ogg"],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
  })

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles((prev) =>
        prev.map((file) => {
          if (file.id === fileId) {
            if (file.progress < 100) {
              return { ...file, progress: file.progress + 10 }
            } else if (file.status === "uploading") {
              return { ...file, status: "processing" }
            } else if (file.status === "processing") {
              // Simulate processing completion
              setTimeout(() => {
                setUploadedFiles((prev) => prev.map((f) => (f.id === fileId ? { ...f, status: "completed" } : f)))

                // Add to sources list
                onSourceAdded({
                  id: Date.now(),
                  name: file.file.name,
                  type: file.type,
                  size: `${(file.file.size / 1024 / 1024).toFixed(1)} MB`,
                  status: "indexed",
                })
              }, 2000)

              clearInterval(interval)
              return { ...file, status: "processing" }
            }
          }
          return file
        }),
      )
    }, 200)
  }

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
            Upload Source
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Source</DialogTitle>
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
                {isDragActive ? "Drop files here" : "Drag & drop files here"}
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
