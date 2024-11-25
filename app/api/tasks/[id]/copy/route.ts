import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  let body;
  try {
    const { db } = await connectToDatabase()
    
    console.log('Request method:', req.method)
    console.log('Request headers:', Object.fromEntries(req.headers))

    // Check if the request has a body
    const hasBody = req.headers.get('content-length') && parseInt(req.headers.get('content-length')!) > 0
    console.log('Has body:', hasBody)

    // Log the raw request body
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    // Attempt to parse the JSON body
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    // Validate the body
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    console.log('Parsed body:', body);

    // Find the original task
    const originalTask = await db.collection('tasks').findOne({ id: params.id })

    if (!originalTask) {
      return NextResponse.json(
        { error: 'Orijinal görev bulunamadı' },
        { status: 404 }
      )
    }

    // Find the highest current task number
    const lastTask = await db.collection('tasks').find().sort({ taskNumber: -1 }).limit(1).toArray()
    const lastTaskNumber = lastTask.length > 0 && lastTask[0].taskNumber !== undefined
      ? lastTask[0].taskNumber
      : 999

    const newTaskNumber = (lastTaskNumber as number) + 1
    const newTaskId = `TASK-${newTaskNumber.toString().padStart(4, '0')}`

    // Create the new task
    const newTask = {
      id: newTaskId,
      taskNumber: newTaskNumber,
      title: body.title || `${originalTask.title} (Copy)`,
      status: body.status || originalTask.status,
      priority: body.priority || originalTask.priority,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const result = await db.collection('tasks').insertOne(newTask)

    if (result.acknowledged) {
      return NextResponse.json(newTask, { status: 201 })
    } else {
      throw new Error('Görev kopyalanırken bir hata oluştu')
    }
  } catch (error) {
    console.error('Görev kopyalanırken hata oluştu:', error)
    return NextResponse.json(
      { error: 'Görev kopyalanırken bir hata oluştu' },
      { status: 500 }
    )
  }
}