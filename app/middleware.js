import { NextResponse } from 'next/server';

export function middleware(request) {
  const isLoggedIn = request.cookies.get('isLoggedIn');
  const userRole = request.cookies.get('userRole')?.value; // מושך את תפקיד המשתמש
  const path = request.nextUrl.pathname;
  const isLoginPage = path === '/login';

  // 1. מי שלא מחובר - עף אוטומטית לדף ההתחברות
  if (!isLoggedIn && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. מי שמחובר ומנסה להגיע שוב לדף ההתחברות - מועבר לדף הבית
  if (isLoggedIn && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. הגנת הברזל על פאנל הניהול: רק אדמין נכנס!
  if (path.startsWith('/admin') && userRole !== 'admin') {
    // אם לקוח רגיל מנסה להיכנס לאדמין, נזרוק אותו חזרה לדף הבית שלו
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};