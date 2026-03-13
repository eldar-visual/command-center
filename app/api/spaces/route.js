import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Space from '@/models/Space';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // שולף רק את המרחבים (Spaces) ששייכים למשתמש המחובר
    // הוספתי מיון לפי order אם קיים אצלך שדה כזה
    const spaces = await Space.find({ userId: userId }).sort({ createdAt: 1 });
    
    return NextResponse.json(spaces);
  } catch (error) {
    console.error("Error fetching spaces:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // יצירת Space חדש המוצמד למשתמש
    const newSpace = await Space.create({ 
      ...body, 
      userId: userId 
    });

    return NextResponse.json(newSpace, { status: 201 });
  } catch (error) {
    console.error("Error creating space:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}