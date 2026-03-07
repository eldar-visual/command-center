import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DashboardData from '@/models/DashboardData';

// עדכון פריט קיים (שינוי שם/לינק או הצמדה לראשי)
export async function PUT(request, { params }) {
  await dbConnect();
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    const body = await request.json();
    const updatedItem = await DashboardData.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// מחיקת פריט
export async function DELETE(request, { params }) {
  await dbConnect();
  const resolvedParams = await params;
  const { id } = resolvedParams;

  try {
    await DashboardData.findByIdAndDelete(id);
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}