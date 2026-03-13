'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import styles from './login.module.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');
  
  console.log("מנסה להתחבר עם:", email);

  try {
    const res = await signIn('credentials', {
      email: email,
      password: password,
      redirect: false, // אנחנו מטפלים בהעברה ידנית
    });

    console.log("תגובה מ-NextAuth:", res);

    if (res?.error) {
      setError('אימייל או סיסמה שגויים');
      setLoading(false);
    } else {
  console.log("התחברות הצליחה! מבצע רענון וניתוב...");
  // שימוש ב-replace מבטיח שהדפדפן לא יוכל לחזור אחורה ללוגין בלחיצת 'אחורה'
  window.location.replace('/'); 
}
  } catch (err) {
    console.error("שגיאה בתהליך ההתחברות:", err);
    setError('שגיאת תקשורת במערכת');
    setLoading(false);
  }
};

return (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0b0f19', direction: 'rtl' }}>
    <div style={{ background: '#1a2235', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '95%', maxWidth: '400px', textAlign: 'center' }}>
      <h1 style={{ color: 'white', fontSize: '2.2rem', marginBottom: '5px' }}>EldarVisual</h1>
      <p style={{ color: '#8494aa', marginBottom: '30px' }}>התחבר למרכז השליטה שלך</p>

      {error && <div style={{ color: '#ef4444', marginBottom: '15px', fontSize: '0.9rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
        
        {/* שדה אימייל - מוגבל ל-300px */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px', display: 'flex', alignItems: 'center' }}>
          <Mail style={{ position: 'absolute', right: '15px', color: '#64748b', zIndex: 10 }} size={18} />
          <input 
            type="email" 
            placeholder="אימייל" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #2d3748', background: '#f1f5f9', color: '#0f172a', outline: 'none' }}
          />
        </div>

        {/* שדה סיסמה - מוגבל ל-300px */}
        <div style={{ position: 'relative', width: '100%', maxWidth: '300px', display: 'flex', alignItems: 'center' }}>
          <Lock style={{ position: 'absolute', right: '15px', color: '#64748b', zIndex: 10 }} size={18} />
          <input 
            type="password" 
            placeholder="סיסמה" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '12px 45px 12px 15px', borderRadius: '12px', border: '1px solid #2d3748', background: '#f1f5f9', color: '#0f172a', outline: 'none' }}
          />
        </div>

        {/* כפתור קצר וממורכז */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ width: '200px', padding: '12px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          {loading ? 'מתחבר...' : <>כניסה למערכת <LogIn size={18} /></>}
        </button>
      </form>
    </div>
  </div>
);
}