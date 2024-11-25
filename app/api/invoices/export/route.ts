import { NextResponse } from 'next/server'
import * as XLSX from 'xlsx'

export async function POST(req: Request) {
  try {
    const { format, data } = await req.json()
    
    let exportData
    let contentType
    let fileData

    switch (format) {
      case 'json':
        exportData = JSON.stringify(data, null, 2)
        contentType = 'application/json'
        fileData = new Blob([exportData], { type: contentType })
        break

      case 'csv':
        // Flatten the data structure for CSV
        const flatData = {
          // From
          'from_name': data.billFrom.name,
          'from_address': data.billFrom.address,
          'from_zip': data.billFrom.zip,
          'from_city': data.billFrom.city,
          'from_country': data.billFrom.country,
          'from_email': data.billFrom.email,
          'from_phone': data.billFrom.phone,
          
          // To
          'to_name': data.billTo.name,
          'to_address': data.billTo.address,
          'to_zip': data.billTo.zip,
          'to_city': data.billTo.city,
          'to_country': data.billTo.country,
          'to_email': data.billTo.email,
          'to_phone': data.billTo.phone,
          
          // Invoice Details
          'invoice_number': data.invoiceDetails.invoiceNumber,
          'issue_date': data.invoiceDetails.issueDate,
          'due_date': data.invoiceDetails.dueDate,
          'currency': data.invoiceDetails.currency,
          
          // Payment Info
          'bank_name': data.paymentInfo.bankName,
          'account_name': data.paymentInfo.accountName,
          'account_number': data.paymentInfo.accountNumber,
          
          // Summary Info
          'discount_enabled': data.summaryInfo.discount,
          'discount_amount': data.summaryInfo.discountAmount,
          'discount_mode': data.summaryInfo.discountMode,
          'tax_enabled': data.summaryInfo.tax,
          'tax_amount': data.summaryInfo.taxAmount,
          'tax_mode': data.summaryInfo.taxMode,
          'shipping_enabled': data.summaryInfo.shipping,
          'shipping_amount': data.summaryInfo.shippingAmount,
          'shipping_mode': data.summaryInfo.shippingMode,
          'additional_notes': data.summaryInfo.additionalNotes,
          'payment_terms': data.summaryInfo.paymentTerms,
          'status': data.summaryInfo.status,
        }
        
        // Convert to CSV
        const csvRows = [
          Object.keys(flatData).join(','),
          Object.values(flatData).map(value => `"${value}"`).join(',')
        ]
        exportData = csvRows.join('\n')
        contentType = 'text/csv'
        fileData = new Blob([exportData], { type: contentType })
        break

      case 'xlsx':
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet([data])
        XLSX.utils.book_append_sheet(wb, ws, 'Invoice')
        exportData = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' })
        contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        fileData = new Blob([exportData], { type: contentType })
        break

      case 'xml':
        // Convert JSON to XML
        const toXML = (obj: any): string => {
          let xml = ''
          for (const prop in obj) {
            if (obj[prop] instanceof Array) {
              xml += obj[prop].map((item: any) => `<${prop}>${toXML(item)}</${prop}>`).join('')
            } else if (typeof obj[prop] === 'object') {
              xml += `<${prop}>${toXML(obj[prop])}</${prop}>`
            } else {
              xml += `<${prop}>${obj[prop]}</${prop}>`
            }
          }
          return xml
        }
        
        exportData = `<?xml version="1.0" encoding="UTF-8"?>\n<invoice>${toXML(data)}</invoice>`
        contentType = 'application/xml'
        fileData = new Blob([exportData], { type: contentType })
        break

      default:
        throw new Error('Unsupported format')
    }

    return new NextResponse(fileData, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename=invoice.${format}`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return new NextResponse(JSON.stringify({ error: 'Export failed' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}