import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    await dbConnect();

    const userExists = await User.findOne({ email });
    if (userExists) return NextResponse.json({ error: "משתמש כבר קיים" }, { status: 400 });

    // הצפנה חובה - בלי זה לא תוכל להיכנס בלוגין
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({ name, email, password: hashedPassword, role: "user" });

    return NextResponse.json({ message: "נרשמת בהצלחה" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "שגיאת שרת" }, { status: 500 });
  }
}