import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'
import clientPromise from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ 
      email, 
      otp,
      otpExpires: { $gt: new Date() }
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid or expired OTP' }, { status: 400 });
    }

    // Mark user as verified if not already
    if (!user.isVerified) {
      await db.collection('users').updateOne(
        { _id: user._id },
        { $set: { isVerified: true } }
      );
    }

    // Clear OTP
    await db.collection('users').updateOne(
      { _id: user._id },
      { $unset: { otp: "", otpExpires: "" } }
    );

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    // Set JWT as httpOnly cookie
    (await
      cookies()).set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    return NextResponse.json({ message: 'Authentication successful' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}