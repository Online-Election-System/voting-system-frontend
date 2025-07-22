"use client"

import { useState, type ChangeEvent } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface FileUploadProps {
  id: string
  label: string
  onFileChange: (file: File | undefined) => void
  className?: string
  accept?: string
}

export function FileUpload({ id, label, onFileChange, className, accept = "image/*" }: FileUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
      setFileName(file.name)
      onFileChange(file)
    } else {
      setPreviewUrl(null)
      setFileName(null)
      onFileChange(undefined)
    }
  }

  return (
    <div className={cn("grid w-full max-w-sm items-center gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type="file" onChange={handleFileChange} accept={accept} />
      {fileName && <p className="text-sm text-muted-foreground mt-1">Selected file: {fileName}</p>}
      {previewUrl && (
        <div className="mt-2">
          <Image
            src={previewUrl || "/placeholder.svg"}
            alt="File preview"
            width={200}
            height={200}
            className="rounded-md object-cover"
          />
        </div>
      )}
    </div>
  )
}
