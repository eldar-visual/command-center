import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await dbConnect();
    const { email, password } = await request.json();

    // טריק למערכת חדשה: יצירת משתמש אדמין ראשון באופן אוטומטי אם ה-DB ריק
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      const hashedAdminPassword = await bcrypt.hash('123456', 10);
      await User.create({
        name: 'אבירם',
        email: 'aviram@eldarvisual.com',
        password: hashedAdminPassword,
        role: 'admin'
      });
    }

    // 1. חיפוש המשתמש במסד הנתונים
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: 'משתמש לא נמצא. בדוק את כתובת המייל.' }, { status: 401 });
    }

    // 2. בדיקת סיסמה (השוואה לסיסמה המוצפנת)
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'סיסמה שגויה.' }, { status: 401 });
    }

    // 3. יצירת תשובת הצלחה והגדרת עוגיות (Cookies) מאובטחות
    const response = NextResponse.json({ 
      success: true, 
      user: { name: user.name, email: user.email, role: user.role } 
    });

    response.cookies.set('isLoggedIn', 'true', { path: '/' });
    response.cookies.set('userId', user._id.toString(), { path: '/' });
    response.cookies.set('userRole', user.role, { path: '/' });
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'שגיאת שרת פנימית' }, { status: 500 });
  }
}