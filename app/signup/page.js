'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './signup.module.css';
// השורה שפתרה את השגיאה בתמונה:
import { User, Mail, Lock, Key, AlertCircle } from 'lucide-react'; 

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', inviteCode: '' });
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
        router.push('/login');
      } else {
        setError(data.message || 'שגיאה בהרשמה');
      }
    } catch (err) {
      setError('שגיאת תקשורת עם השרת');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupWrapper}>
      <div className={styles.signupCard}>
        <h1 className={styles.title}>EldarVisual</h1>
        <p className={styles.subtitle}>צור חשבון חדש (למוזמנים בלבד)</p>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          
          <div className={styles.inputGroup}>
            <User className={styles.inputIcon} size={18} />
            <input 
              type="text" placeholder="שם מלא" required 
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <Mail className={styles.inputIcon} size={18} />
            <input 
              type="email" placeholder="אימייל" required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock className={styles.inputIcon} size={18} />
            <input 
              type="password" placeholder="סיסמה" required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>

          <div className={styles.inputGroup}>
            <Key className={styles.inputIcon} size={18} style={{ color: '#fbbf24' }} />
            <input 
              type="text" placeholder="קוד הזמנה סודי" required 
              onChange={(e) => setFormData({...formData, inviteCode: e.target.value})}
              style={{ border: '1px solid #fbbf24' }}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'יוצר חשבון...' : 'הרשמה למערכת'}
          </button>
        </form>

        <div className={styles.footerText}>
          כבר יש לך חשבון? <Link href="/login" className={styles.link}>התחבר כאן</Link>
        </div>
      </div>
    </div>
  );
}