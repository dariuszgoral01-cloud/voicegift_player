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
