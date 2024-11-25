import mongoose from 'mongoose';

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  items: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true }
  }],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, required: true },
  taxAmount: { type: Number, required: true },
  discountRate: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ['beklemede', 'odendi', 'iptal'], default: 'beklemede' },
}, { timestamps: true });

export default mongoose.models.Invoice || mongoose.model('Invoice', InvoiceSchema);