import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import PDFDocument from 'pdfkit';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    const client = await clientPromise;
    const db = client.db("invoiceDB");
    const invoice = await db.collection("invoices").findOne({ _id: new ObjectId(id) });

    if (!invoice) {
      return NextResponse.json({ error: 'Fatura bulunamadı' }, { status: 404 });
    }

    const doc = new PDFDocument();
    let buffers: Buffer[] = [];
    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => {});

    // PDF içeriğini oluştur
    doc.fontSize(25).text('Fatura', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12)
      .text(`Fatura Numarası: ${invoice.invoiceNumber}`)
      .text(`Müşteri: ${invoice.customerName}`)
      .text(`Tarih: ${new Date(invoice.date).toLocaleDateString('tr-TR')}`)
      .moveDown();

    doc.text('Ürünler:');
    invoice.items.forEach((item: any) => {
      doc.text(`${item.description} - Miktar: ${item.quantity} - Birim Fiyat: $${item.unitPrice.toFixed(2)}`);
    });

    doc.moveDown()
      .text(`Ara Toplam: $${invoice.subtotal.toFixed(2)}`)
      .text(`Vergi: $${invoice.taxAmount.toFixed(2)}`)
      .text(`Toplam: $${invoice.total.toFixed(2)}`);

    doc.end();

    return new Promise<NextResponse>((resolve) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(new NextResponse(pdfBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="fatura-${invoice.invoiceNumber}.pdf"`,
          },
        }));
      });
    });
  } catch (error) {
    console.error('PDF oluşturma hatası:', error);
    return NextResponse.json({ error: 'PDF oluşturulamadı' }, { status: 500 });
  }
}