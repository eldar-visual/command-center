import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DashboardData from '@/models/DashboardData';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";


export async function POST(request) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id; // מושכים את ה-ID מהסשן המאובטח

    if (!userId) {
      return NextResponse.json({ error: 'חובה להתחבר כדי לשמור נתונים' }, { status: 401 });
    }

    const body = await request.json();

    // יצירת הפריט החדש כשהוא מוצמד למשתמש הספציפי
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

export async function GET() {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // שולף רק את מה ששייך למשתמש המחובר
    const items = await DashboardData.find({ userId: userId });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}