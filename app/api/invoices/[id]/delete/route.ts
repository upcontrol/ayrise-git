import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function DELETE(
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

    const result = await db.collection("invoices").deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Invoice deleted successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json(
      { message: 'Failed to delete invoice', error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}