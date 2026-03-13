import { Heebo } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider'; // ייבוא הקומפוננטה שיוצרת את הסשן

const heebo = Heebo({ 
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '700', '900'],
  display: 'swap',
});

export default function RootLayout({ children }) {
  return (
    <html lang="he" dir="rtl" className={heebo.className}>
      <body>
        {/* עוטפים את הילדים ב-AuthProvider כדי שכל האפליקציה תדע מי המשתמש המחובר */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}