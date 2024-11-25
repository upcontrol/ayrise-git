import { NextResponse } from 'next/server'
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { connectToDatabase } from '@/lib/mongodb'

export async function GET() {
    try {
      const session = await getServerSession(authOptions)
      if (!session || !session.user?.email) {
        console.log("Unauthorized access attempt")
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
  
      const { db } = await connectToDatabase()
      const user = await db.collection('users').findOne({ email: session.user.email })
  
      if (!user) {
        console.log("User not found in database")
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
  
      // Sadece gerekli alanları döndür
      const { username, email, bio, urls } = user
      return NextResponse.json({ username, email, bio, urls })
    } catch (error) {
      console.error('Error fetching user data:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
  }

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const userData = await req.json()

    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: userData },
      { upsert: true }
    )

    if (result.modifiedCount === 0 && result.upsertedCount === 0) {
      return NextResponse.json({ error: 'User not updated' }, { status: 400 })
    }

    return NextResponse.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user data:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}