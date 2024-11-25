'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ArrowRight, ArrowLeft, Upload, FileUp, Download, Plus, FileDown, Check, MoreVertical, PenLine, RefreshCw, Trash2 } from 'lucide-react'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

interface LineItem {
  id: number;
  name: string;
  quantity: number;
  rate: number;
  description: string;
}

interface PaymentInfo {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface SummaryInfo {
  signature: string | null;
  discount: boolean;
  tax: boolean;
  shipping: boolean;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  discountMode: 'percentage' | 'fixed';
  taxMode: 'percentage' | 'fixed';
  shippingMode: 'percentage' | 'fixed';
  additionalNotes: string;
  paymentTerms: string;
  includeTotalInWords: boolean;
  status: 'beklemede' | 'odendi' | 'iptal';
}

export default function AddInvoicePage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState(1)
  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isLoadDialogOpen, setIsLoadDialogOpen] = useState(false)

  const [formData, setFormData] = useState({
    billFrom: {
      name: '',
      address: '',
      zip: '',
      city: '',
      country: '',
      email: '',
      phone: '',
      customFields: []
    },
    billTo: {
      name: '',
      address: '',
      zip: '',
      city: '',
      country: '',
      email: '',
      phone: '',
      customFields: []
    },
    invoiceDetails: {
      logo: null as string | null,
      invoiceNumber: '',
      issueDate: '',
      dueDate: '',
      currency: 'USD',
      selectedTemplate: ''
    },
    lineItems: [
      {
        id: 1,
        name: '',
        quantity: 0,
        rate: 0,
        description: ''
      }
    ] as LineItem[],
    paymentInfo: {
      bankName: '',
      accountName: '',
      accountNumber: '',
    } as PaymentInfo,
    summaryInfo: {
      signature: null,
      discount: false,
      tax: false,
      shipping: false,
      discountAmount: 0,
      taxAmount: 0,
      shippingAmount: 0,
      discountMode: 'fixed' as const,
      taxMode: 'fixed' as const,
      shippingMode: 'fixed' as const,
      additionalNotes: '',
      paymentTerms: '',
      includeTotalInWords: true,
      status: 'beklemede' as 'beklemede' | 'odendi' | 'iptal',
    } as SummaryInfo
  })

  const handleInputChange = (section: 'billFrom' | 'billTo' | 'invoiceDetails', field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const addCustomInput = (section: 'billFrom' | 'billTo') => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        customFields: [...prev[section].customFields, { label: '', value: '' }]
      }
    }))
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        handleInputChange('invoiceDetails', 'logo', reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLineItemChange = (id: number, field: keyof LineItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }))
  }

  const addNewLineItem = () => {
    setFormData(prev => ({
      ...prev,
      lineItems: [
        ...prev.lineItems,
        {
          id: prev.lineItems.length + 1,
          name: '',
          quantity: 0,
          rate: 0,
          description: ''
        }
      ]
    }))
  }

  const deleteLineItem = (id: number) => {
    setFormData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter(item => item.id !== id)
    }))
  }

  const handlePaymentInfoChange = (field: keyof PaymentInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      paymentInfo: {
        ...prev.paymentInfo,
        [field]: value
      }
    }))
  }

  const handleSummaryInfoChange = (field: keyof SummaryInfo, value: boolean | string | number) => {
    setFormData(prev => ({
      ...prev,
      summaryInfo: {
        ...prev.summaryInfo,
        [field]: value
      }
    }))
  }

  const toggleMode = (field: 'discountMode' | 'taxMode' | 'shippingMode') => {
    setFormData(prev => ({
      ...prev,
      summaryInfo: {
        ...prev.summaryInfo,
        [field]: prev.summaryInfo[field] === 'fixed' ? 'percentage' : 'fixed',
        [`${field.replace('Mode', '')}Amount`]: 0
      }
    }))
  }

  const calculateItemTotal = (item: LineItem) => {
    return item.quantity * item.rate
  }

  const calculateSubtotal = () => {
    return formData.lineItems.reduce((sum, item) => sum + calculateItemTotal(item), 0)
  }

  const calculateAmount = (type: 'discount' | 'tax' | 'shipping') => {
    const subtotal = calculateSubtotal()
    const { summaryInfo } = formData
    const amount = summaryInfo[`${type}Amount`]
    const mode = summaryInfo[`${type}Mode`]

    if (!summaryInfo[type] || amount === 0) return 0
    
    return mode === 'percentage' ? (subtotal * amount) / 100 : amount
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateAmount('discount')
    const tax = calculateAmount('tax')
    const shipping = calculateAmount('shipping')
    
    return subtotal - discount + tax + shipping
  }

  const resetForm = () => {
    setFormData({
      billFrom: {
        name: '',
        address: '',
        zip: '',
        city: '',
        country: '',
        email: '',
        phone: '',
        customFields: []
      },
      billTo: {
        name: '',
        address: '',
        zip: '',
        city: '',
        country: '',
        email: '',
        phone: '',
        customFields: []
      },
      invoiceDetails: {
        logo: null,
        invoiceNumber: '',
        issueDate: '',
        dueDate: '',
        currency: 'USD',
        selectedTemplate: ''
      },
      lineItems: [
        {
          id: 1,
          name: '',
          quantity: 0,
          rate: 0,
          description: ''
        }
      ],
      paymentInfo: {
        bankName: '',
        accountName: '',
        accountNumber: '',
      },
      summaryInfo: {
        signature: null,
        discount: false,
        tax: false,
        shipping: false,
        discountAmount: 0,
        taxAmount: 0,
        shippingAmount: 0,
        discountMode: 'fixed',
        taxMode: 'fixed',
        shippingMode: 'fixed',
        additionalNotes: '',
        paymentTerms: '',
        includeTotalInWords: true,
        status: 'beklemede',
      }
    })
    setActiveTab(1)
  }

  const handleNewInvoice = () => {
    setShowNewInvoiceDialog(true)
  }

  const confirmNewInvoice = () => {
    resetForm()
    setShowNewInvoiceDialog(false)
  }

  const generateInvoice = async () => {
    try {
      setIsGenerating(true)
      
      // Prepare invoice data
      const invoiceData = {
        ...formData,
        total: calculateTotal(),
        subtotal: calculateSubtotal(),
        createdAt: new Date().toISOString(),
        status: formData.summaryInfo.status
      }

      // Send to API
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        throw new Error('Failed to create invoice')
      }

      // Redirect to invoices page
      router.push('/invoice')
      
    } catch (error) {
      console.error('Error generating invoice:', error)
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const exportToPDF = async () => {
    try {
      setIsExporting(true)
      
      // Get the preview element
      const element = document.getElementById('invoice-preview')
      if (!element) return

      // Create canvas from the element
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true
      })

      // Create PDF
      const pdf = new jsPDF({
        format: 'a4',
        unit: 'px'
      })

      // Add image to PDF
      const imgData = canvas.toDataURL('image/png')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)

      // Download PDF
      pdf.save(`invoice-${formData.invoiceDetails.invoiceNumber || 'draft'}.pdf`)

    } catch (error) {
      console.error('Error exporting PDF:', error)
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = async (format: 'json' | 'csv' | 'xml' | 'xlsx') => {
    try {
      setIsExporting(true)
      const response = await fetch('/api/invoices/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          format,
          data: formData
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
      setIsExportDialogOpen(false)
      toast({
        title: "Success",
        description: "Invoice exported successfully",
      })
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Error",
        description: "Failed to export invoice",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = async (e) => {
        const text = e.target?.result
        if (typeof text !== 'string') return

        try {
          let data
          if (file.name.endsWith('.csv')) {
            // Parse CSV
            const rows = text.split('\n')
            const headers = rows[0].split(',')
            const values = rows[1].split(',')
            
            // Create a mapping object
            const mapping = headers.reduce((obj, header, index) => {
              obj[header.trim()] = values[index].replace(/^"|"$/g, '')
              return obj
            }, {} as any)

            // Transform flat data back to nested structure
            data = {
              billFrom: {
                name: mapping.from_name,
                address: mapping.from_address,
                zip: mapping.from_zip,
                city: mapping.from_city,
                country: mapping.from_country,
                email: mapping.from_email,
                phone: mapping.from_phone,
                customFields: []
              },
              billTo: {
                name: mapping.to_name,
                address: mapping.to_address,
                zip: mapping.to_zip,
                city: mapping.to_city,
                country: mapping.to_country,
                email: mapping.to_email,
                phone: mapping.to_phone,
                customFields: []
              },
              invoiceDetails: {
                logo: null,
                invoiceNumber: mapping.invoice_number,
                issueDate: mapping.issue_date,
                dueDate: mapping.due_date,
                currency: mapping.currency,
                selectedTemplate: ''
              },
              lineItems: [],
              paymentInfo: {
                bankName: mapping.bank_name,
                accountName: mapping.account_name,
                accountNumber: mapping.account_number,
              },
              summaryInfo: {
                signature: null,
                discount: mapping.discount_enabled === 'true',
                tax: mapping.tax_enabled === 'true',
                shipping: mapping.shipping_enabled === 'true',
                discountAmount: parseFloat(mapping.discount_amount) || 0,
                taxAmount: parseFloat(mapping.tax_amount) || 0,
                shippingAmount: parseFloat(mapping.shipping_amount) || 0,
                discountMode: mapping.discount_mode,
                taxMode: mapping.tax_mode,
                shippingMode: mapping.shipping_mode,
                additionalNotes: mapping.additional_notes,
                paymentTerms: mapping.payment_terms,
                includeTotalInWords: true,
                status: mapping.status,
              }
            }
          } else {
            // Assume JSON
            data = JSON.parse(text)
          }

          setFormData(data)
          setIsLoadDialogOpen(false)
          toast({
            title: "Success",
            description: "Invoice loaded successfully",
          })
        } catch (error) {
          console.error('Parse error:', error)
          toast({
            title: "Error",
            description: "Failed to parse invoice file",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    } catch (error) {
      console.error('File read error:', error)
      toast({
        title: "Error",
        description: "Failed to read invoice file",
        variant: "destructive",
      })
    }
  }

  const tabs = [
    { id: 1, title: '1. From & To' },
    { id: 2, title: '2. Invoice Details' },
    { id: 3, title: '3. Line Items' },
    { id: 4, title: '4. Payment Info' },
    { id: 5, title: '5. Summary' }
  ]

  const renderFromToTab = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div>
        <h2 className="text-lg font-semibold mb-4">Bill From:</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="from-name" className="text-sm font-medium mb-1 block">Name:</label>
            <Input
              id="from-name"
              placeholder="Your name"
              value={formData.billFrom.name}
              onChange={(e) => handleInputChange('billFrom', 'name', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="from-address" className="text-sm font-medium mb-1 block">Address:</label>
            <Input
              id="from-address"
              placeholder="Your address"
              value={formData.billFrom.address}
              onChange={(e) => handleInputChange('billFrom', 'address', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="from-zip" className="text-sm font-medium mb-1 block">Zip:</label>
            <Input
              id="from-zip"
              placeholder="Your zip code"
              value={formData.billFrom.zip}
              onChange={(e) => handleInputChange('billFrom', 'zip', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="from-city" className="text-sm font-medium mb-1 block">City:</label>
            <Input
              id="from-city"
              placeholder="Your city"
              value={formData.billFrom.city}
              onChange={(e) => handleInputChange('billFrom', 'city', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="from-country" className="text-sm font-medium mb-1 block">Country:</label>
            <Input
              id="from-country"
              placeholder="Your country"
              value={formData.billFrom.country}
              onChange={(e) => handleInputChange('billFrom', 'country', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="from-email" className="text-sm font-medium mb-1 block">Email:</label>
            <Input
              id="from-email"
              type="email"
              placeholder="Your email"
              value={formData.billFrom.email}
              onChange={(e) => handleInputChange('billFrom', 'email', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="from-phone" className="text-sm font-medium mb-1 block">Phone:</label>
            <Input
              id="from-phone"
              placeholder="Your phone number"
              value={formData.billFrom.phone}
              onChange={(e) => handleInputChange('billFrom', 'phone', e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => addCustomInput('billFrom')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Input
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-4">Bill To:</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="to-name" className="text-sm font-medium mb-1 block">Name:</label>
            <Input
              id="to-name"
              placeholder="Receiver name"
              value={formData.billTo.name}
              onChange={(e) => handleInputChange('billTo', 'name', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to-address" className="text-sm font-medium mb-1 block">Address:</label>
            <Input
              id="to-address"
              placeholder="Receiver address"
              value={formData.billTo.address}
              onChange={(e) => handleInputChange('billTo', 'address', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to-zip" className="text-sm font-medium mb-1 block">Zip:</label>
            <Input
              id="to-zip"
              placeholder="Receiver zip code"
              value={formData.billTo.zip}
              onChange={(e) => handleInputChange('billTo', 'zip', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to-city" className="text-sm font-medium mb-1 block">City:</label>
            <Input
              id="to-city"
              placeholder="Receiver city"
              value={formData.billTo.city}
              onChange={(e) => handleInputChange('billTo', 'city', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to-country" className="text-sm font-medium mb-1 block">Country:</label>
            <Input
              id="to-country"
              placeholder="Receiver country"
              value={formData.billTo.country}
              onChange={(e) => handleInputChange('billTo', 'country', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to-email" className="text-sm font-medium mb-1 block">Email:</label>
            <Input
              id="to-email"
              type="email"
              placeholder="Receiver email"
              value={formData.billTo.email}
              onChange={(e) => handleInputChange('billTo', 'email', e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="to-phone" className="text-sm font-medium mb-1 block">Phone:</label>
            <Input
              id="to-phone"
              placeholder="Receiver phone number"
              value={formData.billTo.phone}
              onChange={(e) => handleInputChange('billTo', 'phone', e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => addCustomInput('billTo')}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Input
          </Button>
        </div>
      </div>
    </div>
  )

  const renderInvoiceDetailsTab = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="logo-upload" className="text-sm font-medium mb-2 block">Invoice Logo:</label>
        <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
            id="logo-upload"
          />
          <label htmlFor="logo-upload" className="cursor-pointer">
            {formData.invoiceDetails.logo ? (
              <img
                src={formData.invoiceDetails.logo}
                alt="Invoice logo"
                className="max-h-32 mx-auto"
              />
            ) : (
              <div className="py-4">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to upload image</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="invoice-number" className="text-sm font-medium mb-2 block">Invoice Number:</label>
          <Input
            id="invoice-number"
            placeholder="Invoice number"
            value={formData.invoiceDetails.invoiceNumber}
            onChange={(e) => handleInputChange('invoiceDetails', 'invoiceNumber', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="currency" className="text-sm font-medium mb-2 block">Currency:</label>
          <Select
            value={formData.invoiceDetails.currency}
            onValueChange={(value) => handleInputChange('invoiceDetails', 'currency', value)}
          >
            <SelectTrigger id="currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">United States Dollar (USD)</SelectItem>
              <SelectItem value="EUR">Euro (EUR)</SelectItem>
              <SelectItem value="GBP">British Pound (GBP)</SelectItem>
              <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="issue-date" className="text-sm font-medium mb-2 block">Issue Date:</label>
          <Input
            id="issue-date"
            type="date"
            value={formData.invoiceDetails.issueDate}
            onChange={(e) => handleInputChange('invoiceDetails', 'issueDate', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="due-date" className="text-sm font-medium mb-2 block">Due Date:</label>
          <Input
            id="due-date"
            type="date"
            value={formData.invoiceDetails.dueDate}
            onChange={(e) => handleInputChange('invoiceDetails', 'dueDate', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium mb-2 block">Choose Invoice Template:</label>
        <p className="text-sm text-muted-foreground mb-4">Select one of the predefined templates</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((template) => (
            <div key={template} className="relative">
              <div
                className={cn(
                  "border rounded-lg overflow-hidden cursor-pointer hover:border-primary transition-colors",
                  formData.invoiceDetails.selectedTemplate === `template${template}` && "border-primary"
                )}
                onClick={() => handleInputChange('invoiceDetails', 'selectedTemplate', `template${template}`)}
              >
                <img
                  src={`/placeholder.svg?height=400&width=300`}
                  alt={`Template ${template}`}
                  className="w-full h-auto"
                />
                {formData.invoiceDetails.selectedTemplate === `template${template}` && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <Button
                variant="secondary"
                className="w-full mt-2"
                onClick={() => handleInputChange('invoiceDetails', 'selectedTemplate', `template${template}`)}
              >
                Select
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderLineItemsTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Items:</h2>
      
      {formData.lineItems.map((item, index) => (
        <div key={item.id} className="space-y-4 p-4 border rounded-lg relative">
          <div className="absolute right-4 top-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-lg">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => deleteLineItem(item.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Item
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium">#{index + 1}</span>
            <span className="text-muted-foreground">- {item.name || 'Empty name'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label htmlFor={`item-name-${item.id}`} className="text-sm font-medium">Name:</label>
              <Input
                id={`item-name-${item.id}`}
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleLineItemChange(item.id, 'name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`item-quantity-${item.id}`} className="text-sm font-medium">Quantity:</label>
              <Input
                id={`item-quantity-${item.id}`}
                type="number"
                placeholder="0"
                value={item.quantity}
                onChange={(e) => handleLineItemChange(item.id, 'quantity', parseFloat(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`item-rate-${item.id}`} className="text-sm font-medium">Rate:</label>
              <Input
                id={`item-rate-${item.id}`}
                type="number"
                placeholder="0.00"
                value={item.rate}
                onChange={(e) => handleLineItemChange(item.id, 'rate', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor={`item-description-${item.id}`} className="text-sm font-medium">Description:</label>
            <Textarea
              id={`item-description-${item.id}`}
              placeholder="Item description"
              value={item.description}
              onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
            />
          </div>

          <div className="text-right">
            <span className="font-medium">Total: {formData.invoiceDetails.currency} {calculateItemTotal(item).toFixed(2)}</span>
          </div>
        </div>
      ))}

      <Button onClick={addNewLineItem} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add New Item
      </Button>
    </div>
  )

  const renderPaymentInfoTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Payment Information:</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="bank-name" className="text-sm font-medium mb-1 block">Bank Name:</label>
          <Input
            id="bank-name"
            placeholder="Enter bank name"
            value={formData.paymentInfo.bankName}
            onChange={(e) => handlePaymentInfoChange('bankName', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="account-name" className="text-sm font-medium mb-1 block">Account Name:</label>
          <Input
            id="account-name"
            placeholder="Enter account name"
            value={formData.paymentInfo.accountName}
            onChange={(e) => handlePaymentInfoChange('accountName', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="account-number" className="text-sm font-medium mb-1 block">Account Number:</label>
          <Input
            id="account-number"
            placeholder="Enter account number"
            value={formData.paymentInfo.accountNumber}
            onChange={(e) => handlePaymentInfoChange('accountNumber', e.target.value)}
          />
        </div>
      </div>
    </div>
  )

  const renderSummaryTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Summary:</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label htmlFor="discount-toggle" className="text-sm font-medium">Enable Discount:</label>
          <Switch
            id="discount-toggle"
            checked={formData.summaryInfo.discount}
            onCheckedChange={(checked) => handleSummaryInfoChange('discount', checked)}
          />
        </div>

        {formData.summaryInfo.discount && (
          <div className="pl-6 space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="0.00"
                value={formData.summaryInfo.discountAmount}
                onChange={(e) => handleSummaryInfoChange('discountAmount', parseFloat(e.target.value))}
                className="w-24"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleMode('discountMode')}
              >
                {formData.summaryInfo.discountMode === 'fixed' ? '$' : '%'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label htmlFor="tax-toggle" className="text-sm font-medium">Enable Tax:</label>
          <Switch
            id="tax-toggle"
            checked={formData.summaryInfo.tax}
            onCheckedChange={(checked) => handleSummaryInfoChange('tax', checked)}
          />
        </div>

        {formData.summaryInfo.tax && (
          <div className="pl-6 space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="0.00"
                value={formData.summaryInfo.taxAmount}
                onChange={(e) => handleSummaryInfoChange('taxAmount', parseFloat(e.target.value))}
                className="w-24"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleMode('taxMode')}
              >
                {formData.summaryInfo.taxMode === 'fixed' ? '$' : '%'}
              </Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label htmlFor="shipping-toggle" className="text-sm font-medium">Enable Shipping:</label>
          <Switch
            id="shipping-toggle"
            checked={formData.summaryInfo.shipping}
            onCheckedChange={(checked) => handleSummaryInfoChange('shipping', checked)}
          />
        </div>

        {formData.summaryInfo.shipping && (
          <div className="pl-6 space-y-4">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                placeholder="0.00"
                value={formData.summaryInfo.shippingAmount}
                onChange={(e) => handleSummaryInfoChange('shippingAmount', parseFloat(e.target.value))}
                className="w-24"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleMode('shippingMode')}
              >
                {formData.summaryInfo.shippingMode === 'fixed' ? '$' : '%'}
              </Button>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="additional-notes" className="text-sm font-medium mb-1 block">Additional Notes:</label>
          <Textarea
            id="additional-notes"
            placeholder="Enter any additional notes"
            value={formData.summaryInfo.additionalNotes}
            onChange={(e) => handleSummaryInfoChange('additionalNotes', e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="payment-terms" className="text-sm font-medium mb-1 block">Payment Terms:</label>
          <Textarea
            id="payment-terms"
            placeholder="Enter payment terms"
            value={formData.summaryInfo.paymentTerms}
            onChange={(e) => handleSummaryInfoChange('paymentTerms', e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <label htmlFor="total-in-words-toggle" className="text-sm font-medium">Include Total in Words:</label>
          <Switch
            id="total-in-words-toggle"
            checked={formData.summaryInfo.includeTotalInWords}
            onCheckedChange={(checked) => handleSummaryInfoChange('includeTotalInWords', checked)}
          />
        </div>

        <div>
          <label htmlFor="status" className="text-sm font-medium mb-1 block">Status:</label>
          <Select
            value={formData.summaryInfo.status}
            onValueChange={(value) => handleSummaryInfoChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beklemede">Beklemede</SelectItem>
              <SelectItem value="odendi">Ödendi</SelectItem>
              <SelectItem value="iptal">İptal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Invoice</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <div className="p-6">
              <div className="flex space-x-1 mb-6">
                {tabs.map((tab) => (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "outline"}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    {tab.title}
                  </Button>
                ))}
              </div>

              {activeTab === 1 && renderFromToTab()}
              {activeTab === 2 && renderInvoiceDetailsTab()}
              {activeTab === 3 && renderLineItemsTab()}
              {activeTab === 4 && renderPaymentInfoTab()}
              {activeTab === 5 && renderSummaryTab()}
            </div>
          </Card>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setActiveTab((prev) => Math.max(1, prev - 1))}
              disabled={activeTab === 1}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={() => setActiveTab((prev) => Math.min(5, prev + 1))}
              disabled={activeTab === 5}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-1">ACTIONS</h2>
            <p className="text-sm text-gray-500 mb-6">Operations and preview</p>

            <div className="space-y-3">
              <Dialog open={isLoadDialogOpen} onOpenChange={setIsLoadDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <FileUp className="w-4 h-4 mr-2" />
                    Load Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Load Invoice</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <Label htmlFor="invoice-file">Select invoice file (CSV or JSON)</Label>
                    <Input
                      id="invoice-file"
                      type="file"
                      accept=".csv,.json"
                      onChange={handleFileUpload}
                    />
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Invoice
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Invoice</DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 py-4">
                    <Button
                      variant="outline"
                      onClick={() => handleExport('json')}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Export as JSON
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('csv')}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Export as CSV
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('xml')}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Export as XML
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleExport('xlsx')}
                      className="flex items-center gap-2"
                    >
                      <FileDown className="w-4 h-4" />
                      Export as XLSX
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" className="w-full justify-start" onClick={handleNewInvoice}>
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>

              <Button className="w-full justify-start" onClick={generateInvoice} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <PenLine className="w-4 h-4 mr-2" />
                    Generate Invoice
                  </>
                )}
              </Button>

              <Button variant="outline" className="w-full justify-start" onClick={exportToPDF} disabled={isExporting}>
                {isExporting ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Export as PDF
                  </>
                )}
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Preview:</h3>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div id="invoice-preview" className="text-sm">
                  {/* Add a basic preview of the invoice here */}
                  <p><strong>From:</strong> {formData.billFrom.name}</p>
                  <p><strong>To:</strong> {formData.billTo.name}</p>
                  <p><strong>Invoice Number:</strong> {formData.invoiceDetails.invoiceNumber}</p>
                  <p><strong>Total Amount:</strong> {formData.invoiceDetails.currency} {calculateTotal().toFixed(2)}</p>
                  {/* Add more preview details as needed */}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <AlertDialog open={showNewInvoiceDialog} onOpenChange={setShowNewInvoiceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all current invoice data. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNewInvoice}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}