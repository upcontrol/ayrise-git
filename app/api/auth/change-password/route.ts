// app/api/auth/change-password/route.ts
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    const { db } = await connectToDatabase();

    const user = await db.collection('users').findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: { password: hashedNewPassword } }
    );

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}