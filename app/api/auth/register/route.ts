import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    console.log('Staring registration process')
    const { email, name, password } = await request.json();
    console.log('Received data', { email, name })

    console.log('Connecting to MongoDB')
    const client = await clientPromise;
    const db = client.db();
    console.log('Connected to MongoDB')

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Create user
    const user = {
      email,
      password: hashedPassword,
      otp,
      otpExpires: new Date(Date.now() + 10 * 60 * 1000), // OTP expires in 10 minutes
      isVerified: false,
    };

    await db.collection('users').insertOne(user);

    // Send OTP via email
    await sendEmail(
      email,
      'Your OTP for registration',
      `Your OTP is: ${otp}`,
      `<h1>Your OTP is: ${otp}</h1>`
    );

    return NextResponse.json({ message: 'User registered. Please verify your email.' }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'An error occurred' }, { status: 500 });
  }
}