import mongoose from 'mongoose'

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['Documentation', 'Bug', 'Feature'] },
  description: { type: String, required: true },
  status: { type: String, required: true, enum: ['Todo', 'In Progress', 'Done', 'Canceled', 'Backlog'] },
  priority: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
})

export default mongoose.models.Task || mongoose.model('Task', TaskSchema)