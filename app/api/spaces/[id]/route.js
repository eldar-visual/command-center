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

export async function DELETE(request, { params }) {
  await dbConnect();
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (id === 'default') {
    return NextResponse.json({ message: 'Cannot delete default space' }, { status: 400 });
  }

  try {
    const deletedSpace = await Space.findByIdAndDelete(id);
    if (!deletedSpace) {
      return NextResponse.json({ message: 'Space not found' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Space deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting space:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}