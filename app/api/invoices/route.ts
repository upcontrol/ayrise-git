// import { NextResponse } from 'next/server'
// import clientPromise from '@/lib/mongodb'
// //import { ObjectId } from 'mongodb'

// export async function GET() {
//   try {
//     const client = await clientPromise
//     const db = client.db("invoiceDB")
    
//     const invoices = await db.collection("invoices").find({}).sort({ date: -1 }).toArray()
    
//     const stats = await Promise.all([
//       db.collection("invoices").countDocuments(),
//       db.collection("invoices").countDocuments({ status: 'odendi' }),
//       db.collection("invoices").aggregate([
//         { $match: { status: 'odendi' } },
//         { $group: { _id: null, total: { $sum: '$total' } } }
//       ]).toArray(),
//       db.collection("invoices").aggregate([
//         { $match: { status: 'beklemede' } },
//         { $group: { _id: null, total: { $sum: '$total' } } }
//       ]).toArray()
//     ])

//     return NextResponse.json({
//       invoices,
//       stats: {
//         totalInvoices: stats[0],
//         totalPaidInvoices: stats[1],
//         totalPaid: stats[2][0]?.total || 0,
//         totalUnpaid: stats[3][0]?.total || 0,
//       }
//     })
//   } catch (error) {
//     console.error('Fatura getirme hatası:', error)
//     return NextResponse.json({ error: 'Faturalar getirilemedi' }, { status: 500 })
//   }
// }

// export async function POST(request: Request) {
//   try {
//     const client = await clientPromise
//     const db = client.db("invoiceDB")
    
//     const body = await request.json()
//     const result = await db.collection("invoices").insertOne(body)
    
//     return NextResponse.json({ message: 'Fatura başarıyla oluşturuldu', invoiceId: result.insertedId })
//   } catch (error) {
//     console.error('Fatura oluşturma hatası:', error)
//     return NextResponse.json({ error: 'Fatura oluşturulamadı' }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("invoiceDB")
    const collection = db.collection("invoices")

    // Get all invoices
    const invoices = await collection.find({}).toArray()

    // Format invoices
    const formattedInvoices = invoices.map(invoice => ({
      _id: invoice._id.toString(),
      invoiceNumber: invoice.invoiceDetails?.invoiceNumber || 'N/A',
      customerName: invoice.billTo?.name || 'N/A',
      customerEmail: invoice.billTo?.email || 'N/A',
      total: Number(invoice.total) || 0,
      date: invoice.createdAt || new Date().toISOString(),
      status: invoice.summaryInfo?.status || 'beklemede'
    }))

    // Calculate statistics
    const stats = formattedInvoices.reduce((acc, invoice) => {
      // Convert string amounts to numbers and handle any potential invalid values
      const total = typeof invoice.total === 'string' ? 
        parseFloat(invoice.total.replace(/[^0-9.-]+/g, "")) : 
        (typeof invoice.total === 'number' ? invoice.total : 0)

      // Update total counts
      acc.totalInvoices++

      // Update status-based counts and amounts
      if (invoice.status === 'odendi') {
        acc.paidInvoices++
        acc.totalPaid += total
      } else if (invoice.status === 'beklemede') {
        acc.totalUnpaid += total
      }
      // Note: 'iptal' status invoices are not included in totalUnpaid

      return acc;
    }, {
      totalInvoices: 0,
      paidInvoices: 0,
      totalPaid: 0,
      totalUnpaid: 0,
    })

    return NextResponse.json({
      totalInvoices: stats.totalInvoices,
      paidInvoices: stats.paidInvoices,
      totalPaid: stats.totalPaid,
      totalUnpaid: stats.totalUnpaid,
      invoices: formattedInvoices
    })

  } catch (error) {
    console.error('Database Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db('invoiceDB')
    
    const body = await request.json()
    
    // Validate required fields
    if (!body.billTo || !body.total) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    const result = await db.collection('invoices').insertOne({
      ...body,
      createdAt: new Date().toISOString()
    })
    
    return NextResponse.json({ 
      success: true, 
      id: result.insertedId.toString() 
    })
  } catch (error) {
    console.error('Database error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("invoiceDB")
    const collection = db.collection("invoices")
    
    const data = await request.json()
    const { _id, ...updateData } = data

    if (!_id) {
      return NextResponse.json(
        { error: 'Missing invoice ID' },
        { status: 400 }
      )
    }

    const result = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: {
          ...updateData,
          updatedAt: new Date().toISOString()
        }
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      _id,
      ...updateData
    })

  } catch (error) {
    console.error('Database Error:', error)
    return NextResponse.json(
      { error: 'Failed to update invoice' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("invoiceDB")
    const collection = db.collection("invoices")
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing invoice ID' },
        { status: 400 }
      )
    }

    const result = await collection.deleteOne({
      _id: new ObjectId(id)
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true,
      _id: id
    })

  } catch (error) {
    console.error('Database Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete invoice' },
      { status: 500 }
    )
  }
}