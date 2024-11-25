// import { NextResponse } from 'next/server';
// import clientPromise from '@/lib/mongodb';
// import bcrypt from 'bcryptjs';

// export async function POST(request: Request) {
//   try {
//     const { email, password } = await request.json();

//     const client = await clientPromise;
//     const db = client.db();

//     const user = await db.collection('users').findOne({ email });

//     if (!user || !user.isVerified) {
//       return NextResponse.json({ message: 'Invalid credentials or unverified account' }, { status: 400 });
//     }

//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
//     }

//     // Generate OTP
//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
//     // Update user with new OTP
//     await db.collection('users').updateOne(
//       { _id: user._id },
//       { 
//         $set: { 
//           otp,
//           otpExpires: new Date(Date.now() + 10 * 60 * 1000) // OTP expires in 10 minutes
//         }
//       }
//     );

//     // Send OTP via email (implement this part)

//     return NextResponse.json({ message: 'OTP sent to your email' }, { status: 200 });
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
//   }
// }

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ email });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    if (!user.isVerified) {
      console.log('User not verified:', email);
      return NextResponse.json({ message: 'Please verify your email before logging in' }, { status: 400 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      console.log('Password mismatch for user:', email);
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 400 });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // console.log('Login successful for user:', email);
    // console.log('Generated token payload:', { userId: user._id.toString(), email: user.email });

    // Create a new response
    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });

    // Set JWT as httpOnly cookie
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'An error occurred during login' }, { status: 500 });
  }
}