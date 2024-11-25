'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ArrowRight, ArrowLeft, Upload, FileUp, Download, Plus, FileDown, Check, MoreVertical, ChevronUp, ChevronDown, PenLine, RefreshCw, Trash2 } from 'lucide-react'
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
}

export default function AddInvoicePage() {
  const [activeTab, setActiveTab] = useState(1)
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
            <label className="text-sm font-medium mb-1 block">Name:</label>
            <Input
              placeholder="Your name"
              value={formData.billFrom.name}
              onChange={(e) => handleInputChange('billFrom', 'name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Address:</label>
            <Input
              placeholder="Your address"
              value={formData.billFrom.address}
              onChange={(e) => handleInputChange('billFrom', 'address', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Zip:</label>
            <Input
              placeholder="Your zip code"
              value={formData.billFrom.zip}
              onChange={(e) => handleInputChange('billFrom', 'zip', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">City:</label>
            <Input
              placeholder="Your city"
              value={formData.billFrom.city}
              onChange={(e) => handleInputChange('billFrom', 'city', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Country:</label>
            <Input
              placeholder="Your country"
              value={formData.billFrom.country}
              onChange={(e) => handleInputChange('billFrom', 'country', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email:</label>
            <Input
              type="email"
              placeholder="Your email"
              value={formData.billFrom.email}
              onChange={(e) => handleInputChange('billFrom', 'email', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Phone:</label>
            <Input
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
            <label className="text-sm font-medium mb-1 block">Name:</label>
            <Input
              placeholder="Receiver name"
              value={formData.billTo.name}
              onChange={(e) => handleInputChange('billTo', 'name', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Address:</label>
            <Input
              placeholder="Receiver address"
              value={formData.billTo.address}
              onChange={(e) => handleInputChange('billTo', 'address', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Zip:</label>
            <Input
              placeholder="Receiver zip code"
              value={formData.billTo.zip}
              onChange={(e) => handleInputChange('billTo', 'zip', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">City:</label>
            <Input
              placeholder="Receiver city"
              value={formData.billTo.city}
              onChange={(e) => handleInputChange('billTo', 'city', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Country:</label>
            <Input
              placeholder="Receiver country"
              value={formData.billTo.country}
              onChange={(e) => handleInputChange('billTo', 'country', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Email:</label>
            <Input
              type="email"
              placeholder="Receiver email"
              value={formData.billTo.email}
              onChange={(e) => handleInputChange('billTo', 'email', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Phone:</label>
            <Input
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
        <label className="text-sm font-medium mb-2 block">Invoice Logo:</label>
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
          <label className="text-sm font-medium mb-2 block">Invoice Number:</label>
          <Input
            placeholder="Invoice number"
            value={formData.invoiceDetails.invoiceNumber}
            onChange={(e) => handleInputChange('invoiceDetails', 'invoiceNumber', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Currency:</label>
          <Select
            value={formData.invoiceDetails.currency}
            onValueChange={(value) => handleInputChange('invoiceDetails', 'currency', value)}
          >
            <SelectTrigger>
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
          <label className="text-sm font-medium mb-2 block">Issue Date:</label>
          <Input
            type="date"
            value={formData.invoiceDetails.issueDate}
            onChange={(e) => handleInputChange('invoiceDetails', 'issueDate', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Due Date:</label>
          <Input
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
              <label className="text-sm font-medium">Name:</label>
              <Input
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleLineItemChange(item.id, 'name', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity:</label>
              <Input
                type="number"
                placeholder="0"
                value={item.quantity}
                onChange={(e) => handleLineItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rate: ({formData.invoiceDetails.currency})</label>
              <Input
                type="number"
                placeholder="0"
                value={item.rate}
                onChange={(e) => handleLineItemChange(item.id, 'rate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description:</label>
            <Textarea
              placeholder="Item description"
              value={item.description}
              onChange={(e) => handleLineItemChange(item.id, 'description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <p className="font-medium">
              Total: {calculateItemTotal(item).toFixed(2)} {formData.invoiceDetails.currency}
            </p>
          </div>
        </div>
      ))}

      <Button
        onClick={addNewLineItem}
        className="w-full flex items-center justify-center gap-2"
        variant="default"
      >
        <Plus className="w-4 h-4" />
        Add a new item
      </Button>
    </div>
  )

  const renderPaymentInfoTab = () => (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Payment Information:</h2>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Bank Name:</label>
          <Input
            placeholder="Bank Name"
            value={formData.paymentInfo.bankName}
            onChange={(e) => handlePaymentInfoChange('bankName', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Account Name:</label>
          <Input
            placeholder="Account Name"
            value={formData.paymentInfo.accountName}
            onChange={(e) => handlePaymentInfoChange('accountName', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Account Number:</label>
          <Input
            placeholder="Account Number"
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
      
      <div className="space-y-6">
        <div>
          <label className="text-sm font-medium mb-2 block">Signature:</label>
          <div 
            className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => {/* Implement signature functionality */}}
          >
            {formData.summaryInfo.signature ? (
              <img
                src={formData.summaryInfo.signature}
                alt="Signature"
                className="max-h-32 mx-auto"
              />
            ) : (
              <div className="py-4">
                <PenLine className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Click to add signature</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="discount"
                checked={formData.summaryInfo.discount}
                onCheckedChange={(checked) => handleSummaryInfoChange('discount', checked)}
              />
              <Label htmlFor="discount">Discount</Label>
            </div>
            {formData.summaryInfo.discount && (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.summaryInfo.discountAmount}
                  onChange={(e) => handleSummaryInfoChange('discountAmount', parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
                <span>{formData.summaryInfo.discountMode === 'percentage' ? '%' : formData.invoiceDetails.currency}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => toggleMode('discountMode')}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="tax"
                checked={formData.summaryInfo.tax}
                onCheckedChange={(checked) => handleSummaryInfoChange('tax', checked)}
              />
              <Label htmlFor="tax">Tax</Label>
            </div>
            {formData.summaryInfo.tax && (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.summaryInfo.taxAmount}
                  onChange={(e) => handleSummaryInfoChange('taxAmount', parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
                <span>{formData.summaryInfo.taxMode === 'percentage' ? '%' : formData.invoiceDetails.currency}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => toggleMode('taxMode')}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="shipping"
                checked={formData.summaryInfo.shipping}
                onCheckedChange={(checked) => handleSummaryInfoChange('shipping', checked)}
              />
              <Label htmlFor="shipping">Shipping</Label>
            </div>
            {formData.summaryInfo.shipping && (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.summaryInfo.shippingAmount}
                  onChange={(e) => handleSummaryInfoChange('shippingAmount', parseFloat(e.target.value) || 0)}
                  className="w-24"
                />
                <span>{formData.summaryInfo.shippingMode === 'percentage' ? '%' : formData.invoiceDetails.currency}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => toggleMode('shippingMode')}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Subtotal</span>
            <span>{calculateSubtotal().toFixed(2)} {formData.invoiceDetails.currency}</span>
          </div>
          {formData.summaryInfo.discount && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Discount {formData.summaryInfo.discountMode === 'percentage' && `(${formData.summaryInfo.discountAmount}%)`}</span>
              <span>-{calculateAmount('discount').toFixed(2)} {formData.invoiceDetails.currency}</span>
            </div>
          )}
          {formData.summaryInfo.tax && (
            <div className="flex justify-between text-sm">
              <span>Tax {formData.summaryInfo.taxMode === 'percentage' && `(${formData.summaryInfo.taxAmount}%)`}</span>
              <span>+{calculateAmount('tax').toFixed(2)} {formData.invoiceDetails.currency}</span>
            </div>
          )}
          {formData.summaryInfo.shipping && (
            <div className="flex justify-between text-sm">
              <span>Shipping {formData.summaryInfo.shippingMode === 'percentage' && `(${formData.summaryInfo.shippingAmount}%)`}</span>
              <span>+{calculateAmount('shipping').toFixed(2)} {formData.invoiceDetails.currency}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-medium pt-2 border-t">
            <span>Total Amount</span>
            <span>{calculateTotal().toFixed(2)} {formData.invoiceDetails.currency}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="include-words"
            checked={formData.summaryInfo.includeTotalInWords}
            onCheckedChange={(checked) => handleSummaryInfoChange('includeTotalInWords', checked)}
          />
          <Label htmlFor="include-words">Include Total in Words?</Label>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Additional Notes:</label>
          <Textarea
            placeholder="Your additional notes"
            value={formData.summaryInfo.additionalNotes}
            onChange={(e) => handleSummaryInfoChange('additionalNotes', e.target.value)}
            rows={4}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Payment Terms:</label>
          <Textarea
            placeholder="Ex: Net 30"
            value={formData.summaryInfo.paymentTerms}
            onChange={(e) => handleSummaryInfoChange('paymentTerms', e.target.value)}
            rows={4}
          />
        </div>
      </div>
    </div>
  )

  function renderPreview() {
    return (
      <div className="border rounded-lg p-4 min-h-[400px]">
        {formData.invoiceDetails.logo && (
          <img
            src={formData.invoiceDetails.logo}
            alt="Invoice logo"
            className="max-h-16 mb-4"
          />
        )}
        <h4 className="text-xl font-bold mb-4">
          Invoice #{formData.invoiceDetails.invoiceNumber || ''}
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Bill to:</span>
            <span>{formData.billTo.name}</span>
          </div>
          <div className="flex justify-between">
            <span>Invoice date:</span>
            <span>{formData.invoiceDetails.issueDate || 'Invalid Date'}</span>
          </div>
          <div className="flex justify-between">
            <span>Due date:</span>
            <span>{formData.invoiceDetails.dueDate || 'Invalid Date'}</span>
          </div>
        </div>

        <div className="mt-6">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">ITEM</th>
                <th className="text-right py-2">QTY</th>
                <th className="text-right py-2">RATE</th>
                <th className="text-right py-2">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {formData.lineItems.map((item) => (
                <tr key={item.id}>
                  <td className="py-2">
                    <div>{item.name || ''}</div>
                    {item.description && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </div>
                    )}
                  </td>
                  <td className="text-right py-2">{item.quantity}</td>
                  <td className="text-right py-2">
                    {item.rate} {formData.invoiceDetails.currency}
                  </td>
                  <td className="text-right py-2">
                    {calculateItemTotal(item).toFixed(2)} {formData.invoiceDetails.currency}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t">
                <td colSpan={3} className="text-right py-2">Subtotal:</td>
                <td className="text-right py-2">
                  {calculateSubtotal().toFixed(2)} {formData.invoiceDetails.currency}
                </td>
              </tr>
              {formData.summaryInfo.discount && (
                <tr>
                  <td colSpan={3} className="text-right py-2">
                    Discount {formData.summaryInfo.discountMode === 'percentage' && `(${formData.summaryInfo.discountAmount}%)`}:
                  </td>
                  <td className="text-right py-2 text-red-500">
                    -{calculateAmount('discount').toFixed(2)} {formData.invoiceDetails.currency}
                  </td>
                </tr>
              )}
              {formData.summaryInfo.tax && (
                <tr>
                  <td colSpan={3} className="text-right py-2">
                    Tax {formData.summaryInfo.taxMode === 'percentage' && `(${formData.summaryInfo.taxAmount}%)`}:
                  </td>
                  <td className="text-right py-2">
                    +{calculateAmount('tax').toFixed(2)} {formData.invoiceDetails.currency}
                  </td>
                </tr>
              )}
              {formData.summaryInfo.shipping && (
                <tr>
                  <td colSpan={3} className="text-right py-2">
                    Shipping {formData.summaryInfo.shippingMode === 'percentage' && `(${formData.summaryInfo.shippingAmount}%)`}:
                  </td>
                  <td className="text-right py-2">
                    +{calculateAmount('shipping').toFixed(2)} {formData.invoiceDetails.currency}
                  </td>
                </tr>
              )}
              <tr>
                <td colSpan={3} className="text-right py-2 font-medium">Total:</td>
                <td className="text-right py-2 font-medium">
                  {calculateTotal().toFixed(2)} {formData.invoiceDetails.currency}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-6">
          <h5 className="font-medium text-blue-600">Additional notes:</h5>
          <p className="mt-2 text-sm">{formData.summaryInfo.additionalNotes}</p>
          
          <h5 className="font-medium text-blue-600 mt-4">Payment terms:</h5>
          <p className="mt-2 text-sm">{formData.summaryInfo.paymentTerms}</p>
          
          <p className="mt-2 text-sm">Please send the payment to this address</p>
          <div className="text-sm mt-1">
            <p>Bank: {formData.paymentInfo.bankName}</p>
            <p>Account name: {formData.paymentInfo.accountName}</p>
            <p>Account no: {formData.paymentInfo.accountNumber}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">INVOICE</h1>
            <p className="text-gray-500 text-sm">Generate Invoice</p>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-background hover:bg-muted"
                )}
              >
                {tab.title}
              </button>
            ))}
          </div>

          <Card className="p-6">
            {activeTab === 1 && renderFromToTab()}
            {activeTab === 2 && renderInvoiceDetailsTab()}
            {activeTab === 3 && renderLineItemsTab()}
            {activeTab === 4 && renderPaymentInfoTab()}
            {activeTab === 5 && renderSummaryTab()}

            <div className="flex justify-between mt-6">
              {activeTab > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setActiveTab(activeTab - 1)}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              {activeTab < 5 && (
                <Button
                  onClick={() => setActiveTab(activeTab + 1)}
                  className="flex items-center ml-auto"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {activeTab === 5 && (
                <Button
                  onClick={() => {/* Handle form submission */}}
                  className="flex items-center ml-auto"
                >
                  Generate Invoice
                  <FileDown className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-1">ACTIONS</h2>
            <p className="text-sm text-gray-500 mb-6">Operations and preview</p>

            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <FileUp className="w-4 h-4 mr-2" />
                Load Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Export Invoice
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Plus className="w-4 h-4 mr-2" />
                New Invoice
              </Button>
              <Button className="w-full justify-start">
                <FileDown className="w-4 h-4 mr-2" />
                Generate PDF
              </Button>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4">Live Preview:</h3>
              {renderPreview()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}