import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'לא מורשה' }, { status: 401 });

    const { oldPassword, newPassword } = await req.json();
    await dbConnect();

    // 1. מציאת המשתמש
    const user = await User.findById(session.user.id);
    
    // 2. אימות הסיסמה הישנה
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'הסיסמה הישנה אינה נכונה' }, { status: 400 });
    }

    // 3. הצפנת הסיסמה החדשה ושמירה
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({ message: 'הסיסמה שונתה בהצלחה' });
  } catch (error) {
    return NextResponse.json({ error: 'שגיאת שרת' }, { status: 500 });
  }
}