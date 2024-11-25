import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'

export async function POST(req: Request) {
  console.log('POST isteği alındı');
  try {
    const { db } = await connectToDatabase()
    console.log('Veritabanına bağlanıldı');
    const body = await req.json()
    console.log('İstek gövdesi:', body);

    // En yüksek mevcut görev numarasını bul
    const lastTask = await db.collection('tasks').find().sort({ taskNumber: -1 }).limit(1).toArray()
    console.log('Son görev:', lastTask);

    let lastTaskNumber = 999;
    if (lastTask.length > 0 && lastTask[0].taskNumber) {
      if (typeof lastTask[0].taskNumber === 'number') {
        lastTaskNumber = lastTask[0].taskNumber;
      } else if (typeof lastTask[0].taskNumber === 'string') {
        const match = lastTask[0].taskNumber.match(/\d+/);
        if (match) {
          lastTaskNumber = parseInt(match[0], 10);
        }
      }
    }
    console.log('Son görev numarası:', lastTaskNumber);

    const newTaskNumber = lastTaskNumber + 1
    const newTaskId = `TASK-${newTaskNumber.toString().padStart(4, '0')}`

    const newTask = {
      id: newTaskId,
      taskNumber: newTaskNumber,
      title: body.title || 'Yeni Görev',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    }
    console.log('Yeni görev oluşturuldu:', newTask);

    const result = await db.collection('tasks').insertOne(newTask)
    console.log('Veritabanı sonucu:', result);

    if (result.acknowledged) {
      console.log('Görev başarıyla eklendi');
      return NextResponse.json({ 
        message: 'Görev başarıyla eklendi', 
        task: newTask
      }, { status: 201 })
    } else {
      console.log('Görev eklenirken hata oluştu');
      return NextResponse.json({ error: 'Görev eklenirken bir hata oluştu' }, { status: 500 })
    }
  } catch (error) {
    console.error('Görev eklenirken hata:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function GET() {
  console.log('GET isteği alındı');
  try {
    const { db } = await connectToDatabase()
    const tasks = await db.collection('tasks').find({}).toArray()
    console.log('Görevler alındı:', tasks);
    return NextResponse.json(tasks)
  } catch (error) {
    console.error('Görevler alınırken hata:', error)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}