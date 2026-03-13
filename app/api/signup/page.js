'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// הוספנו את הייבוא החסר של האייקונים - זה מה שיפתור את הרינדור
import { User, Mail, Lock, Key } from 'lucide-react'; 

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        alert('ההרשמה הצליחה! כעת ניתן להתחבר');
        router.push('/login'); 
      } else {
        setError(data.message || 'משהו השתבש');
      }
    } catch (err) {
      setError('שגיאת תקשורת עם השרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0b0f19', direction: 'rtl', padding: '20px' }}>
      <div style={{ background: '#1a2235', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', width: '100%', maxWidth: '420px', textAlign: 'center', boxShadow: '0 25px 50px rgba(0,0,0,0.5)' }}>
        <h1 style={{ color: 'white', fontSize: '2.2rem', fontWeight: '800', marginBottom: '10px' }}>EldarVisual</h1>
        <p style={{ color: '#94a3b8', fontSize: '1rem', marginBottom: '30px' }}>צור חשבון חדש (למוזמנים בלבד)</p>

        {error && <div style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' }}>
          
          {/* שם מלא */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px', display: 'flex', alignItems: 'center' }}>
            <User style={{ position: 'absolute', right: '15px', color: '#64748b', zIndex: 10 }} size={18} />
            <input 
              type="text" placeholder="שם מלא" required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              style={{ width: '100%', padding: '14px 45px 14px 15px', borderRadius: '12px', border: '1px solid #2d3748', background: '#f1f5f9', color: '#0f172a', outline: 'none', fontSize: '1rem' }}
            />
          </div>

          {/* אימייל */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px', display: 'flex', alignItems: 'center' }}>
            <Mail style={{ position: 'absolute', right: '15px', color: '#64748b', zIndex: 10 }} size={18} />
            <input 
              type="email" placeholder="אימייל" required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              style={{ width: '100%', padding: '14px 45px 14px 15px', borderRadius: '12px', border: '1px solid #2d3748', background: '#f1f5f9', color: '#0f172a', outline: 'none', fontSize: '1rem' }}
            />
          </div>

          {/* סיסמה */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px', display: 'flex', alignItems: 'center' }}>
            <Lock style={{ position: 'absolute', right: '15px', color: '#64748b', zIndex: 10 }} size={18} />
            <input 
              type="password" placeholder="סיסמה" required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              style={{ width: '100%', padding: '14px 45px 14px 15px', borderRadius: '12px', border: '1px solid #2d3748', background: '#f1f5f9', color: '#0f172a', outline: 'none', fontSize: '1rem' }}
            />
          </div>

          {/* קוד הזמנה */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px', display: 'flex', alignItems: 'center' }}>
            <Key style={{ position: 'absolute', right: '15px', color: '#fbbf24', zIndex: 10 }} size={18} />
            <input 
              type="text" placeholder="קוד הזמנה סודי" required 
              style={{ width: '100%', padding: '14px 45px 14px 15px', borderRadius: '12px', border: '1px solid #fbbf24', background: '#f1f5f9', color: '#0f172a', outline: 'none', fontSize: '1rem' }}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', maxWidth: '240px', padding: '14px', borderRadius: '12px', border: 'none', background: '#3b82f6', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', fontSize: '1.1rem' }}
          >
            {loading ? 'רושם משתמש...' : 'הרשמה למערכת'}
          </button>
        </form>

        <div style={{ marginTop: '25px', color: '#94a3b8', fontSize: '0.95rem' }}>
          כבר יש לך חשבון? <a href="/login" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>התחבר כאן</a>
        </div>
      </div>
    </div>
  );
}