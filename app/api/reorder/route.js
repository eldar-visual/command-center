import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import DashboardData from '@/models/DashboardData';

export async function PUT(request) {
  await dbConnect();
  
  try {
    const updates = await request.json(); // מקבל מערך של אובייקטים: [{ _id, order }]

    // שימוש בפונקציה מהירה במיוחד של מונגו לעדכון עשרות מסמכים בו זמנית
    const bulkOps = updates.map(item => ({
      updateOne: {
        filter: { _id: item._id },
        update: { $set: { order: item.order } }
      }
    }));

    await DashboardData.bulkWrite(bulkOps);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reorder Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}