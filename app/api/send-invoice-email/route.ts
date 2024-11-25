import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const pdfFile = formData.get('pdf') as File
    const to = formData.get('to') as string
    const invoiceNumber = formData.get('invoiceNumber') as string

    if (!pdfFile || !to || !invoiceNumber) {
      return NextResponse.json(
        { error: 'Eksik bilgi' },
        { status: 400 }
      )
    }

    // Save the file temporarily
    const bytes = await pdfFile.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Create temp directory if it doesn't exist
    const tempDir = join(process.cwd(), 'temp')
    await mkdir(tempDir, { recursive: true })
    
    const tempFilePath = join(tempDir, `invoice-${invoiceNumber}.pdf`)
    
    await writeFile(tempFilePath, buffer)

    // Configure email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    // Send email
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: `Fatura #${invoiceNumber}`,
      text: `Fatura #${invoiceNumber} ektedir.`,
      attachments: [
        {
          filename: `fatura-${invoiceNumber}.pdf`,
          path: tempFilePath,
        }
      ]
    })

    // Clean up temp file
    await writeFile(tempFilePath, '')
      .catch(console.error)

    return NextResponse.json({ 
      success: true, 
      message: 'E-posta başarıyla gönderildi' 
    })

  } catch (error) {
    console.error('E-posta gönderme hatası:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'E-posta gönderilirken bir hata oluştu',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    )
  }
}