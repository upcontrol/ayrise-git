'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FileJson, FileSpreadsheet, FileText, FileType } from 'lucide-react'

interface ExportInvoiceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  invoiceData: any // We'll type this properly later
}

export function ExportInvoiceDialog({
  open,
  onOpenChange,
  invoiceData
}: ExportInvoiceDialogProps) {
  const exportFormats = [
    {
      id: 'json',
      label: 'Export as JSON',
      icon: FileJson,
      handler: () => handleExport('json')
    },
    {
      id: 'csv',
      label: 'Export as CSV',
      icon: FileSpreadsheet,
      handler: () => handleExport('csv')
    },
    {
      id: 'xml',
      label: 'Export as XML',
      icon: FileText,
      handler: () => handleExport('xml')
    },
    {
      id: 'xlsx',
      label: 'Export as XLSX',
      icon: FileType,
      handler: () => handleExport('xlsx')
    }
  ]

  const handleExport = async (format: string) => {
    try {
      const response = await fetch('/api/invoices/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          data: invoiceData
        }),
      })

      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      onOpenChange(false)
    } catch (error) {
      console.error('Export error:', error)
      // You might want to add toast notification here
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export the invoice</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          {exportFormats.map((format) => (
            <Button
              key={format.id}
              variant="outline"
              className="flex items-center gap-2"
              onClick={format.handler}
            >
              <format.icon className="h-4 w-4" />
              {format.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}