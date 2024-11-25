// pages/invoices/index.tsx or components/invoice-list.tsx
import { InvoiceActions } from '@/components/invoice-actions'

// ... other imports and component code

export function InvoiceList() {
  // ... existing code

  return (
    <div>
      {/* ... other invoice list code */}
      {invoices.map((invoice) => (
        <div key={invoice.id}>
          {/* ... invoice details */}
          <InvoiceActions invoiceId={invoice.id} />
        </div>
      ))}
    </div>
  )
}