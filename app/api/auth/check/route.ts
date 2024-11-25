// import { NextResponse } from 'next/server'
// import { cookies } from 'next/headers'
// import { jwtVerify } from 'jose'

// export async function GET() {
//   try {
//     const cookieStore = cookies()
//     const token = cookieStore.get('token')

//     if (!token) {
//       return NextResponse.json({ isAuthenticated: false }, { status: 401 })
//     }

//     try {
//       await jwtVerify(token.value, new TextEncoder().encode(process.env.JWT_SECRET))
//       return NextResponse.json({ isAuthenticated: true })
//     } catch (error) {
//       console.error('Token verification failed:', error)
//       return NextResponse.json({ isAuthenticated: false }, { status: 401 })
//     }
//   } catch (error) {
//     console.error('Error in GET /api/auth/check:', error)
//     return NextResponse.json({ isAuthenticated: false, error: 'Internal server error' }, { status: 500 })
//   }
// }

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const tokenCookie = cookieStore.get('token')

    if (!tokenCookie) {
      return NextResponse.json({ isAuthenticated: false }, { status: 200 })
    }

    const token = tokenCookie.value

    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
      
      if (!payload.userId) {
        return NextResponse.json({ isAuthenticated: false }, { status: 200 })
      }

      const client = await clientPromise
      const db = client.db()
      
      const user = await db.collection('users').findOne(
        { _id: new ObjectId(payload.userId) },
        { projection: { password: 0 } }
      )

      if (!user) {
        return NextResponse.json({ isAuthenticated: false }, { status: 200 })
      }

      return NextResponse.json({ 
        isAuthenticated: true, 
        user: {
          name: user.name || user.email.split('@')[0],
          email: user.email,
          avatar: user.avatar || '/images/default-avatar.png'
        }
      })
    } catch (error) {
      console.error('Token verification failed:', error)
      return NextResponse.json({ isAuthenticated: false }, { status: 200 })
    }
  } catch (error) {
    console.error('Error in GET /api/auth/check:', error)
    return NextResponse.json({ isAuthenticated: false }, { status: 200 })
  }
}