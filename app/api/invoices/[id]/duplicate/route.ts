import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function POST(
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

    // Get the original invoice
    const originalInvoice = await db.collection("invoices").findOne({ 
      _id: new ObjectId(id) 
    });

    if (!originalInvoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    // Create a new invoice with the same data but a new ID
    const { _id, ...invoiceData } = originalInvoice;
    
    // Add "Copy" to the invoice number if it exists
    if (invoiceData.invoiceNumber) {
      invoiceData.invoiceNumber = `${invoiceData.invoiceNumber}-Copy`;
    }
    
    // Update creation date
    invoiceData.createdAt = new Date().toISOString();
    invoiceData.updatedAt = new Date().toISOString();

    const result = await db.collection("invoices").insertOne(invoiceData);

    if (!result.insertedId) {
      throw new Error('Failed to create duplicate invoice');
    }

    // Fetch the newly created invoice
    const newInvoice = await db.collection("invoices").findOne({ 
      _id: result.insertedId 
    });

    return NextResponse.json({ 
      message: 'Invoice duplicated successfully',
      invoice: newInvoice
    }, { status: 201 });

  } catch (error) {
    console.error('Error duplicating invoice:', error);
    return NextResponse.json(
      { message: 'Failed to duplicate invoice', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}