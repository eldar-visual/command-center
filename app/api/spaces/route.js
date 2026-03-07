import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Space from '@/models/Space';
import { cookies } from 'next/headers';

export async function POST(request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    // חובה שיהיה משתמש מחובר כדי לשייך לו את המרחב
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // יצירת המרחב במסד הנתונים עם השיוך ליוזר
    const newSpace = await Space.create({ 
      ...body, 
      userId: userId 
    });

    return NextResponse.json(newSpace, { status: 201 });
  } catch (error) {
    console.error("Error saving space:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}