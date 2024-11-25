// pages/api/invoices/download/[id].ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PDFDocument, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  try {
    // Fetch invoice data from your database using the id
    // For this example, we'll use dummy data
    const invoiceData = {
      invoiceNumber: `INV-${id}`,
      customerName: 'John Doe',
      total: 1000,
      // Add other necessary invoice details
    }

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([600, 800])

    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    const logoImage = await pdfDoc.embedPng(fs.readFileSync(logoPath))
    const logoDims = logoImage.scale(0.5)

    page.drawImage(logoImage, {
      x: 50,
      y: 700,
      width: logoDims.width,
      height: logoDims.height,
    })

    page.drawText(`Invoice #${invoiceData.invoiceNumber}`, {
      x: 50,
      y: 650,
      size: 30,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Customer: ${invoiceData.customerName}`, {
      x: 50,
      y: 600,
      size: 12,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Total: $${invoiceData.total.toFixed(2)}`, {
      x: 50,
      y: 550,
      size: 12,
      color: rgb(0, 0, 0),
    })

    // Add more invoice details as needed

    const pdfBytes = await pdfDoc.save()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${id}.pdf`)
    res.send(Buffer.from(pdfBytes))
  } catch (error) {
    console.error('Error generating PDF:', error)
    res.status(500).json({ error: 'Error generating PDF' })
  }
}