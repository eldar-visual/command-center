'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (res.error) {
      setError('אימייל או סיסמה שגויים');
      setLoading(false);
    } else {
      router.push('/');
      router.refresh();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>EldarVisual</h1>
        <p>התחבר למרכז השליטה שלך</p>

        {error && <div className={styles.error}><AlertCircle size={16} /> {error}</div>}

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* קריטי: האייקון חייב להיות בתוך ה-inputGroup */}
          <div className={styles.inputGroup}>
            <Mail className={styles.inputIcon} size={18} />
            <input 
              type="email" 
              placeholder="אימייל" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <Lock className={styles.inputIcon} size={18} />
            <input 
              type="password" 
              placeholder="סיסמה" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'מתחבר...' : <>כניסה למערכת <LogIn size={18} /></>}
          </button>
        </form>

        <div className={styles.footer}>
          <span>אין לך חשבון? </span>
          <a href="mailto:aviram@eldarvisual.com">בקשת הרשמה</a>
        </div>
      </div>
    </div>
  );
}