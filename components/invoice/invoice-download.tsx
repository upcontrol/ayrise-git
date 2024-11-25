'use client'

import { useState } from 'react'
import { Download, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

interface InvoiceDownloadProps {
  invoiceId: string
  onSuccess?: () => void
}

export default function Component({ invoiceId, onSuccess }: InvoiceDownloadProps = { invoiceId: '' }) {
  const [isExporting, setIsExporting] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailAddresses, setEmailAddresses] = useState([''])
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const exportToPDF = async () => {
    try {
      setIsExporting(true)
      
      // Get the invoice data
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (!response.ok) throw new Error('Failed to fetch invoice data')
      const invoiceData = await response.json()
      
      // Create a temporary div to render the invoice
      const tempDiv = document.createElement('div')
      tempDiv.id = 'temp-invoice'
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      document.body.appendChild(tempDiv)
      
      // Render invoice content
      tempDiv.innerHTML = `
        <div id="invoice-preview" style="padding: 20px; background: white; font-family: Arial, sans-serif;">
          ${invoiceData.invoiceDetails.logo ? `<img src="${invoiceData.invoiceDetails.logo}" alt="Logo" style="max-height: 50px; margin-bottom: 20px;">` : ''}
          <h2 style="color: #333;">Invoice #${invoiceData.invoiceDetails.invoiceNumber || 'N/A'}</h2>
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <strong>Bill From:</strong><br>
              ${invoiceData.billFrom.name}<br>
              ${invoiceData.billFrom.address}<br>
              ${invoiceData.billFrom.city}, ${invoiceData.billFrom.country}
            </div>
            <div>
              <strong>Bill To:</strong><br>
              ${invoiceData.billTo.name}<br>
              ${invoiceData.billTo.address}<br>
              ${invoiceData.billTo.city}, ${invoiceData.billTo.country}
            </div>
          </div>
          <div style="margin-bottom: 20px;">
            <strong>Invoice Date:</strong> ${new Date(invoiceData.invoiceDetails.issueDate).toLocaleDateString()}<br>
            <strong>Due Date:</strong> ${new Date(invoiceData.invoiceDetails.dueDate).toLocaleDateString()}
          </div>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Item</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Quantity</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Rate</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceData.lineItems.map(item => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${item.name}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.quantity}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.rate.toFixed(2)} ${invoiceData.invoiceDetails.currency}</td>
                  <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${(item.quantity * item.rate).toFixed(2)} ${invoiceData.invoiceDetails.currency}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="text-align: right;">
            <strong>Subtotal:</strong> ${invoiceData.total.toFixed(2)} ${invoiceData.invoiceDetails.currency}<br>
            ${invoiceData.summaryInfo.tax ? `<strong>Tax (${invoiceData.summaryInfo.taxAmount}${invoiceData.summaryInfo.taxMode === 'percentage' ? '%' : ''}):</strong> ${(invoiceData.total * (invoiceData.summaryInfo.taxAmount / 100)).toFixed(2)} ${invoiceData.invoiceDetails.currency}<br>` : ''}
            ${invoiceData.summaryInfo.discount ? `<strong>Discount (${invoiceData.summaryInfo.discountAmount}${invoiceData.summaryInfo.discountMode === 'percentage' ? '%' : ''}):</strong> -${(invoiceData.total * (invoiceData.summaryInfo.discountAmount / 100)).toFixed(2)} ${invoiceData.invoiceDetails.currency}<br>` : ''}
            ${invoiceData.summaryInfo.shipping ? `<strong>Shipping:</strong> ${invoiceData.summaryInfo.shippingAmount.toFixed(2)} ${invoiceData.invoiceDetails.currency}<br>` : ''}
            <h3>Total: ${invoiceData.total.toFixed(2)} ${invoiceData.invoiceDetails.currency}</h3>
          </div>
          ${invoiceData.summaryInfo.additionalNotes ? `
            <div style="margin-top: 20px;">
              <strong>Additional Notes:</strong><br>
              ${invoiceData.summaryInfo.additionalNotes}
            </div>
          ` : ''}
        </div>
      `

      // Create canvas from the element
      const canvas = await html2canvas(document.getElementById('temp-invoice')!, {
        scale: 2,
        logging: false,
        useCORS: true
      })

      // Create PDF
      const pdf = new jsPDF({
        format: 'a4',
        unit: 'pt',
        compress: true
      })

      // Add image to PDF
      const imgData = canvas.toDataURL('image/jpeg', 0.7)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

      // Cleanup
      document.body.removeChild(tempDiv)

      return { pdf, invoiceData }
    } catch (error) {
      console.error('PDF dışa aktarma hatası:', error)
      throw error
    } finally {
      setIsExporting(false)
    }
  }

  const handleDownload = async () => {
    try {
      setIsExporting(true)
      const { pdf, invoiceData } = await exportToPDF()
      pdf.save(`invoice-${invoiceData.invoiceDetails.invoiceNumber || 'draft'}.pdf`)
      toast({
        title: "Başarılı",
        description: "Fatura PDF'i başarıyla indirildi",
      })
      onSuccess?.()
    } catch (error) {
      toast({
        title: "Hata",
        description: "Fatura PDF'i indirilemedi",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }
  
  const handleSendEmail = async (to: string[]) => {
    try {
      setIsSendingEmail(true)
      const { pdf, invoiceData } = await exportToPDF()
      
      // Convert PDF to blob with compression
      const pdfBlob = pdf.output('blob', {
        compress: true,
        putOnlyUsedFonts: true,
        maxImageSize: 1000000
      })
  
      // Create form data
      const formData = new FormData()
      formData.append('pdf', pdfBlob, `fatura-${invoiceData.invoiceDetails.invoiceNumber || 'taslak'}.pdf`)
      formData.append('to', to.join(','))
      formData.append('invoiceNumber', invoiceData.invoiceDetails.invoiceNumber || 'taslak')
  
      const response = await fetch('/api/send-invoice-email', {
        method: 'POST',
        body: formData,
      })
  
      const result = await response.json()
  
      if (!response.ok) {
        throw new Error(result.message || 'E-posta gönderilemedi')
      }
  
      toast({
        title: "Başarılı",
        description: result.message || "Fatura e-postası başarıyla gönderildi",
      })
      setIsDialogOpen(false)
    } catch (error) {
      console.error('E-posta gönderme hatası:', error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Fatura e-postası gönderilemedi",
        variant: "destructive",
      })
    } finally {
      setIsSendingEmail(false)
    }
  }

  const addEmailInput = () => {
    setEmailAddresses([...emailAddresses, ''])
  }

  const updateEmailAddress = (index: number, value: string) => {
    const newEmailAddresses = [...emailAddresses]
    newEmailAddresses[index] = value
    setEmailAddresses(newEmailAddresses)
  }

  const sendToBillFrom = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (!response.ok) throw new Error('Failed to fetch invoice data')
      const invoiceData = await response.json()
      handleSendEmail([invoiceData.billFrom.email])
    } catch (error) {
      console.error('Bill From e-posta gönderme hatası:', error)
      toast({
        title: "Hata",
        description: "Bill From e-postası gönderilemedi",
        variant: "destructive",
      })
    }
  }

  const sendToBillTo = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`)
      if (!response.ok) throw new Error('Failed to fetch invoice data')
      const invoiceData = await response.json()
      handleSendEmail([invoiceData.billTo.email])
    } catch (error) {
      console.error('Bill To e-posta gönderme hatası:', error)
      toast({
        title: "Hata",
        description: "Bill To e-postası gönderilemedi",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex space-x-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDownload}
        disabled={isExporting}
      >
        <Download className="h-4 w-4" />
      </Button>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Mail className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Fatura Gönder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {emailAddresses.map((email, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  type="email"
                  placeholder="E-posta adresi"
                  value={email}
                  onChange={(e) => updateEmailAddress(index, e.target.value)}
                />
                {index === emailAddresses.length - 1 && (
                  <Button onClick={addEmailInput} variant="outline">+</Button>
                )}
              </div>
            ))}
            <Button 
              onClick={() => handleSendEmail(emailAddresses.filter(Boolean))}
              disabled={isSendingEmail}
              className="w-full"
            >
              {isSendingEmail ? 'Gönderiliyor...' : 'Gönder'}
            </Button>
            <div className="flex justify-between mt-4">
              <Button onClick={sendToBillFrom} variant="outline">
                Send From
              </Button>
              <Button onClick={sendToBillTo} variant="outline">
                Send To
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}