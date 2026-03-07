import dbConnect from '@/lib/mongodb';
import DashboardData from '@/models/DashboardData';
import Space from '@/models/Space';
import User from '@/models/User';
import ClientDashboard from './ClientDashboard';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Page() {
  await dbConnect();

  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('isLoggedIn')?.value;
  const userId = cookieStore.get('userId')?.value; // שולפים את ה-ID של הלקוח
  const userRole = cookieStore.get('userRole')?.value; // בודקים אם הוא מנהל או לקוח

  // אם אין משתמש מחובר - זורקים ללוג-אין
  if (!isLoggedIn || !userId) {
    redirect('/login');
  }

  try {
    // 1. שליפת פרטי המשתמש המחובר מה-DB כדי להציג את שמו בתפריט
    const rawUser = await User.findById(userId).lean();
    if (!rawUser) redirect('/login');

    const currentUser = {
      name: rawUser.name,
      email: rawUser.email,
      role: rawUser.role
    };

    // 2. הלוגיקה החכמה: אילו מרחבים נשלוף?
    let spaceQuery = {}; 
    if (userRole !== 'admin') {
      // אם זה לקוח רגיל, נבקש מה-DB רק את המרחבים שרשומים על שמו
      spaceQuery = { userId: userId };
    }
    // (אם הוא admin, spaceQuery נשאר ריק ולכן ישלוף הכל)

    // 3. שליפת הנתונים במקביל לביצועים מהירים
    const [rawData, rawSpaces] = await Promise.all([
      DashboardData.find({}).sort({ order: 1 }).lean(),
      Space.find(spaceQuery).lean() // משתמשים בשאילתה המסוננת שלנו!
    ]);

    // 4. סריאליזציה (הכנת הנתונים ל-React)
    const serializedData = rawData.map(item => ({
      ...item,
      _id: item._id.toString(),
    }));

    const serializedSpaces = rawSpaces.map(space => ({
      ...space,
      _id: space._id.toString(),
      userId: space.userId?.toString() || null,
    }));

    // מרחב ברירת מחדל אם הלקוח רק נרשם ואין לו כלום עדיין
    const finalSpaces = serializedSpaces.length > 0 
      ? serializedSpaces 
      : [{ _id: 'default', name: 'מרחב אישי', color: '#3b82f6', icon: '🏠' }];

    return (
      <ClientDashboard 
        initialItems={serializedData} 
        initialSpaces={finalSpaces}
        user={currentUser} // מעבירים את המשתמש האמיתי במקום נתונים צרובים
      />
    );

  } catch (error) {
    console.error("Database Fetch Error:", error);
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center', direction: 'rtl' }}>
        <h2>שגיאה בטעינת הנתונים</h2>
        <p>ודא שחיבור ה-MongoDB תקין</p>
      </div>
    );
  }
}