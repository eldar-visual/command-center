import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login", // דף שאליו יופנו משתמשים לא מחוברים
  },
});

export const config = {
  //Matcher מגדיר על אילו דפים המידלוור ירוץ.
  // כרגע הגדרנו הגנה רק על נתיבי אדמין כדי לאפשר כניסה חלקה לדף הבית.
  matcher: ["/admin/:path*"], 
};