import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DashboardData from '@/models/DashboardData';
import { cookies } from 'next/headers';

export async function POST(request) {
  await dbConnect();
  
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('userId')?.value;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // יצירת המסמך/סרטון החדש במסד הנתונים
    const newItem = await DashboardData.create({ 
      ...body, 
      userId: userId 
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error saving data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}