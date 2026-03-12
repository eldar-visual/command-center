import { Heebo } from 'next/font/google';
import './globals.css';

// מייבאים את Heebo ישירות דרך Next.js (עם משקלים שמתאימים לממשק)
const heebo = Heebo({ 
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    // ה- className של heebo מחיל את הפונט על כל האפליקציה באופן אוטומטי
    <html lang="he" dir="rtl" className={heebo.className}>
      <body>{children}</body>
    </html>
  );
}