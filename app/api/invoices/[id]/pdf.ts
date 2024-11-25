// pages/api/invoices/[id]/pdf.ts
import { NextApiRequest, NextApiResponse } from 'next'
import { PDFDocument, rgb } from 'pdf-lib'
import fs from 'fs'
import path from 'path'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query

  try {
    // Veritabanınızdan fatura verilerini çekin
    // Bu örnekte dummy veri kullanacağız
    const invoiceData = {
      invoiceNumber: `INV-${id}`,
      customerName: 'John Doe',
      total: 1000,
      // Diğer gerekli fatura detaylarını ekleyin
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

    page.drawText(`Fatura #${invoiceData.invoiceNumber}`, {
      x: 50,
      y: 650,
      size: 30,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Müşteri: ${invoiceData.customerName}`, {
      x: 50,
      y: 600,
      size: 12,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Toplam: ${invoiceData.total.toFixed(2)} TL`, {
      x: 50,
      y: 550,
      size: 12,
      color: rgb(0, 0, 0),
    })

    const pdfBytes = await pdfDoc.save()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=fatura-${id}.pdf`)
    res.send(Buffer.from(pdfBytes))
  } catch (error) {
    console.error('PDF oluşturma hatası:', error)
    res.status(500).json({ error: 'PDF oluşturma hatası' })
  }
}