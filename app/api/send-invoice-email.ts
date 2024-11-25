import type { NextApiRequest, NextApiResponse } from 'next'
import nodemailer from 'nodemailer'
import formidable from 'formidable'

export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' })
  }

  try {
    const form = formidable({
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
    })

    const [fields, files] = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        resolve([fields, files])
      })
    })

    // Configure nodemailer with Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const pdfFile = Array.isArray(files.pdf) ? files.pdf[0] : files.pdf
    const to = Array.isArray(fields.to) ? fields.to[0] : fields.to
    const invoiceNumber = Array.isArray(fields.invoiceNumber) ? fields.invoiceNumber[0] : fields.invoiceNumber

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: to,
      subject: `Fatura #${invoiceNumber}`,
      text: `Fatura #${invoiceNumber} ektedir.`,
      attachments: [
        {
          filename: `fatura-${invoiceNumber}.pdf`,
          path: pdfFile.filepath,
        }
      ]
    }

    await transporter.sendMail(mailOptions)

    res.status(200).json({ success: true, message: 'E-posta başarıyla gönderildi' })
  } catch (error) {
    console.error('E-posta gönderme hatası:', error)
    res.status(500).json({ 
      success: false, 
      message: 'E-posta gönderilirken bir hata oluştu',
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    })
  }
}