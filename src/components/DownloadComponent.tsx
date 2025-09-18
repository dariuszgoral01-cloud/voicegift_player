'use client'

import { useState } from 'react'
import { Download, FileAudio, FileVideo } from 'lucide-react'

interface DownloadComponentProps {
  fileUrl: string
  filename: string
  fileSize: number
  mimeType: string
  isVideo: boolean
}

export default function DownloadComponent({
  fileUrl,
  filename,
  fileSize,
  mimeType,
  isVideo
}: DownloadComponentProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadProgress, setDownloadProgress] = useState(0)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const generateFilename = () => {
    const extension = isVideo ? '.mp4' : '.mp3'
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
    return filename || `voice-message-${timestamp}${extension}`
  }

  const handleDownload = async () => {
    setIsDownloading(true)
    setDownloadProgress(0)

    try {
      // Spróbuj pobrać z progress tracking
      const response = await fetch(fileUrl, {
        mode: 'cors', // Explicit CORS mode
        credentials: 'omit'
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentLength = response.headers.get('content-length')
      const total = contentLength ? parseInt(contentLength, 10) : fileSize

      const reader = response.body?.getReader()
      const chunks: Uint8Array[] = []
      let received = 0

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          
          if (done) break
          
          chunks.push(value)
          received += value.length
          
          if (total > 0) {
            setDownloadProgress((received / total) * 100)
          }
        }
      }

      // Create blob and download - FIXED TYPE ERROR
      const blob = new Blob(chunks as BlobPart[], { type: mimeType })
      const url = window.URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = generateFilename()
      link.style.display = 'none'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      window.URL.revokeObjectURL(url)
      
    } catch (error) {
      console.error('Download error:', error)
      
      // FALLBACK - bezpośredni download przez link
      try {
        const link = document.createElement('a')
        link.href = fileUrl
        link.download = generateFilename()
        link.target = '_blank'
        link.style.display = 'none'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (fallbackError) {
        // Ostateczny fallback - otwórz w nowej karcie
        window.open(fileUrl, '_blank')
        alert('Could not download file directly. Opening in new tab instead.')
      }
      
    } finally {
      setIsDownloading(false)
      setDownloadProgress(0)
    }
  }

  return (
    <div className="relative group">
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center space-x-2 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? (
          <>
            <div className="w-5 h-5 border-2 rounded-full animate-spin border-neutral-text-medium border-t-transparent" />
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <Download size={20} />
            <span>Download</span>
          </>
        )}
      </button>

      {/* Download Progress */}
      {isDownloading && downloadProgress > 0 && (
        <div className="absolute left-0 z-10 w-full p-3 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg top-full">
          <div className="flex items-center mb-2 space-x-3">
            {isVideo ? (
              <FileVideo size={20} className="text-primary-orange" />
            ) : (
              <FileAudio size={20} className="text-primary-orange" />
            )}
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-text-dark">
                {generateFilename()}
              </p>
              <p className="text-xs text-neutral-text-medium">
                {formatFileSize(fileSize)}
              </p>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 transition-all duration-300 rounded-full bg-gradient-to-r from-primary-amber to-primary-orange"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          
          <p className="mt-1 text-xs text-center text-neutral-text-medium">
            {Math.round(downloadProgress)}% complete
          </p>
        </div>
      )}

      {/* File Info Tooltip */}
      <div className="absolute left-0 px-3 py-2 mb-2 text-xs text-white transition-opacity duration-200 bg-black rounded-lg opacity-0 pointer-events-none bottom-full group-hover:opacity-100 whitespace-nowrap">
        <div className="flex items-center space-x-2">
          {isVideo ? (
            <FileVideo size={14} />
          ) : (
            <FileAudio size={14} />
          )}
          <span>{formatFileSize(fileSize)} • {mimeType}</span>
        </div>
        <div className="absolute w-0 h-0 transform -translate-x-1/2 border-t-4 border-l-4 border-r-4 border-transparent top-full left-1/2 border-t-black" />
      </div>
    </div>
  )
}