// components/invoice-actions.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Mail } from 'lucide-react'

interface InvoiceActionsProps {
  invoiceId: string
}

export function InvoiceActions({ invoiceId }: InvoiceActionsProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(`/api/invoices/download/${invoiceId}`)
      if (!response.ok) throw new Error('Download failed')
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `invoice-${invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading invoice:', error)
      // You might want to show an error message to the user here
    } finally {
      setIsDownloading(false)
    }
  }

  const handleEmail = () => {
    // Email functionality will be implemented later
    console.log('Email functionality not yet implemented')
  }

  return (
    <div className="flex space-x-2">
      <Button onClick={handleDownload} disabled={isDownloading}>
        <Download className="mr-2 h-4 w-4" />
        {isDownloading ? 'Downloading...' : 'Download'}
      </Button>
      <Button onClick={handleEmail}>
        <Mail className="mr-2 h-4 w-4" />
        Email
      </Button>
    </div>
  )
}