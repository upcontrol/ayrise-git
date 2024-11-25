import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("invoiceDB");

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid invoice ID' }, { status: 400 });
    }

    const invoice = await db.collection("invoices").findOne({ _id: new ObjectId(id) });

    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json(
      { message: 'Failed to fetch invoice', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await clientPromise;
    const db = client.db("invoiceDB");

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ message: 'Invalid invoice ID' }, { status: 400 });
    }

    const body = await request.json();
    
    // Remove _id from the update data to prevent MongoDB errors
    const { _id, ...updatedInvoice } = body;

    const result = await db.collection("invoices").updateOne(
      { _id: new ObjectId(id) },
      { $set: {
        ...updatedInvoice,
        updatedAt: new Date().toISOString()
      }}
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    // Fetch the updated document
    const updatedDocument = await db.collection("invoices").findOne({ _id: new ObjectId(id) });

    return NextResponse.json({ 
      message: 'Invoice updated successfully',
      invoice: updatedDocument
    }, { status: 200 });
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json(
      { message: 'Failed to update invoice', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}