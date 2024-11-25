import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      console.log('Unauthorized: No valid session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { username, name, birthDate } = await req.json();
    console.log('Received data:', { username, name, birthDate });

    const { db } = await connectToDatabase();

    const updatedUser = await db.collection('users').findOneAndUpdate(
      { email: session.user.email },
      { $set: { username, name, birthDate } },
      { returnDocument: 'after' }
    );

    if (!updatedUser.value) {
      console.log('User not found:', session.user.email);
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    console.log('User updated successfully:', updatedUser.value);

    return NextResponse.json({
      id: updatedUser.value._id,
      name: updatedUser.value.name,
      email: updatedUser.value.email,
      username: updatedUser.value.username,
      birthDate: updatedUser.value.birthDate,
      avatar: updatedUser.value.avatar,
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}