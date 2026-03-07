import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Space from '@/models/Space';

export async function PUT(request, { params }) {
  await dbConnect();
  
  // התיקון הקריטי: בגרסאות החדשות של Next.js חובה לשים await לפני params!
  const resolvedParams = await params; 
  const id = resolvedParams.id;

  if (id === 'default') {
      return NextResponse.json({ message: 'Cannot update default space' });
  }

  try {
    const body = await request.json();
    const updatedSpace = await Space.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedSpace);
  } catch (error) {
    console.error("Error updating space:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}