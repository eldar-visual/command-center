import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic'; // מונע קאשינג של הרשימה בגרסה 15

// שליפת כל המשתמשים (כדי להציג לך אותם בפאנל)
export async function GET() {
  try {
    await dbConnect();
    // אנחנו שולפים את כולם אבל לא שולפים את הסיסמאות המוצפנות החוצה (select -password)
    const users = await User.find({}).select('-password').lean();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'שגיאה בטעינת משתמשים' }, { status: 500 });
  }
}

// יצירת משתמש חדש
export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, password, role } = await request.json();

    // בדיקה אם המייל כבר קיים במערכת
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'משתמש עם אימייל זה כבר קיים במערכת' }, { status: 400 });
    }

    // הצפנת הסיסמה של הלקוח
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // שמירה במסד הנתונים
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'user'
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    return NextResponse.json({ error: 'שגיאה ביצירת המשתמש' }, { status: 500 });
  }
}