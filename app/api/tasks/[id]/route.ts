import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  try {
    const { db } = await connectToDatabase()
    const task = await db.collection('tasks').findOne({ id })

    if (!task) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error('Görev alınırken hata oluştu:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  try {
    const { db } = await connectToDatabase()
    const body = await req.json()

    console.log('Updating task with id:', id)
    console.log('Update body:', body)

    const result = await db.collection('tasks').findOneAndUpdate(
      { id },
      { $set: { ...body, updatedAt: new Date() } },
      { returnDocument: 'after' }
    )

    console.log('Update result:', result)

    if (!result) {
      console.log('Task not found for update')
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Görev güncellenirken hata oluştu:', error)
    return NextResponse.json({ error: 'Görev güncellenirken bir hata oluştu' }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  try {
    const { db } = await connectToDatabase()
    const result = await db.collection('tasks').deleteOne({ id })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Görev başarıyla silindi' })
  } catch (error) {
    console.error('Görev silinirken hata oluştu:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

// Add this new function to handle label updates
export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
  try {
    const { db } = await connectToDatabase()
    const { label } = await req.json()

    const result = await db.collection('tasks').findOneAndUpdate(
      { id },
      { $addToSet: { labels: label } },
      { returnDocument: 'after' }
    )

    if (!result) {
      return NextResponse.json({ error: 'Görev bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Etiket eklenirken hata oluştu:', error)
    return NextResponse.json({ error: 'Etiket eklenirken bir hata oluştu' }, { status: 500 })
  }
}