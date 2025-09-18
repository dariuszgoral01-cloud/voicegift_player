'use client'

import { useState } from 'react'
import { Share2, Copy, MessageCircle, Mail, Check } from 'lucide-react'

interface ShareComponentProps {
  url: string
  title: string
  description?: string
}

export default function ShareComponent({ url, title, description }: ShareComponentProps) {
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description || 'Listen to my voice message',
          url: url,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      setShowShareMenu(true)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const shareViaWhatsApp = () => {
    const message = encodeURIComponent(`${title}\n\n${description || 'Listen to my voice message'}\n\n${url}`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(`${description || 'Listen to my voice message'}\n\n${url}`)
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank')
  }

  return (
    <div className="relative">
      <button
        onClick={handleWebShare}
        className="flex items-center space-x-2 btn-primary"
      >
        <Share2 size={20} />
        <span>Share</span>
      </button>

      {showShareMenu && (
        <div className="absolute left-0 z-10 p-4 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg bottom-full min-w-64">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Share this message</h3>
            <button
              onClick={() => setShowShareMenu(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="mb-3">
            <label className="block mb-1 text-sm text-gray-600">Link:</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={url}
                readOnly
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50"
              />
              <button
                onClick={copyToClipboard}
                className="p-2 text-gray-600 transition-colors duration-200 hover:text-orange-500"
                title="Copy link"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
            {copied && (
              <p className="mt-1 text-xs text-green-500">Link copied to clipboard!</p>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={shareViaWhatsApp}
              className="flex items-center w-full p-3 space-x-3 text-left transition-colors duration-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center justify-center w-8 h-8 text-white bg-green-500 rounded-full">
                <MessageCircle size={16} />
              </div>
              <span className="text-gray-800">Share via WhatsApp</span>
            </button>

            <button
              onClick={shareViaEmail}
              className="flex items-center w-full p-3 space-x-3 text-left transition-colors duration-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center justify-center w-8 h-8 text-white bg-blue-500 rounded-full">
                <Mail size={16} />
              </div>
              <span className="text-gray-800">Share via Email</span>
            </button>

            <button
              onClick={copyToClipboard}
              className="flex items-center w-full p-3 space-x-3 text-left transition-colors duration-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center justify-center w-8 h-8 text-white bg-gray-500 rounded-full">
                <Copy size={16} />
              </div>
              <span className="text-gray-800">Copy Link</span>
            </button>
          </div>
        </div>
      )}

      {showShareMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-5 md:hidden"
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  )
}