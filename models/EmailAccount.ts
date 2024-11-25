import mongoose from 'mongoose'

const EmailAccountSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  email: { type: String, required: true },
  provider: { type: String, required: true },
  credentials: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
    select: false // Güvenlik için varsayılan olarak seçilmez
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.models.EmailAccount || mongoose.model('EmailAccount', EmailAccountSchema)