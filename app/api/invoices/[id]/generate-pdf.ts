import { NextApiRequest, NextApiResponse } from 'next'
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    console.log('İzin verilmeyen metod:', req.method);
    return res.status(405).json({ error: 'Sadece POST metodu kabul edilir' })
  }

  const { id } = req.query
  console.log('Alınan fatura ID\'si:', id);

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Geçersiz fatura ID\'si' })
  }

  try {
    const invoice = await fetchInvoiceFromDatabase(id)

    if (!invoice) {
      console.log('Fatura bulunamadı, ID:', id);
      return res.status(404).json({ error: 'Fatura bulunamadı' })
    }

    console.log('Fatura bulundu:', invoice);

    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage()
    const { width, height } = page.getSize()
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    // Fatura başlığı
    page.drawText(`Fatura #${invoice.invoiceNumber}`, {
      x: 50,
      y: height - 50,
      size: 20,
      font: font,
      color: rgb(0, 0, 0),
    })

    // Müşteri bilgileri
    page.drawText(`Müşteri: ${invoice.customerName}`, {
      x: 50,
      y: height - 80,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    page.drawText(`E-posta: ${invoice.customerEmail}`, {
      x: 50,
      y: height - 100,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    // Fatura detayları
    page.drawText(`Tarih: ${new Date(invoice.date).toLocaleDateString('tr-TR')}`, {
      x: 50,
      y: height - 130,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Toplam: ${invoice.total.toFixed(2)} ${invoice.currency || 'TRY'}`, {
      x: 50,
      y: height - 150,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    page.drawText(`Durum: ${invoice.status}`, {
      x: 50,
      y: height - 170,
      size: 12,
      font: font,
      color: rgb(0, 0, 0),
    })

    // Fatura kalemleri
    if (invoice.lineItems && invoice.lineItems.length > 0) {
      page.drawText('Fatura Kalemleri:', {
        x: 50,
        y: height - 200,
        size: 14,
        font: font,
        color: rgb(0, 0, 0),
      })

      invoice.lineItems.forEach((item, index) => {
        const yPosition = height - 230 - (index * 20)
        page.drawText(`${item.name} - ${item.quantity} x ${item.rate} = ${item.quantity * item.rate} ${invoice.currency || 'TRY'}`, {
          x: 70,
          y: yPosition,
          size: 10,
          font: font,
          color: rgb(0, 0, 0),
        })
      })
    }

    console.log('PDF başarıyla oluşturuldu');
    const pdfBytes = await pdfDoc.save()

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename=fatura-${invoice.invoiceNumber}.pdf`)
    res.send(Buffer.from(pdfBytes))
  } catch (error) {
    console.error('PDF oluşturma hatası:', error)
    res.status(500).json({ error: 'PDF oluşturulurken bir hata oluştu' })
  }
}

async function fetchInvoiceFromDatabase(id: string) {
  try {
    const client = await clientPromise
    const db = client.db('invoiceDB')
    const collection = db.collection('invoices')

    const invoice = await collection.findOne({ _id: new ObjectId(id) })
    return invoice
  } catch (error) {
    console.error('Veritabanından fatura getirme hatası:', error)
    throw error
  }
}