'use client';
import { useState } from 'react';
import styles from './settings.module.css';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';

export default function SettingsPage() {
  const [formData, setFormData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      return setStatus({ type: 'error', msg: 'הסיסמאות החדשות לא תואמות' });
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oldPassword: formData.oldPassword, 
          newPassword: formData.newPassword 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', msg: 'הסיסמה עודכנה בהצלחה!' });
        setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setStatus({ type: 'error', msg: data.error || 'משהו השתבש' });
      }
    } catch (err) {
      setStatus({ type: 'error', msg: 'שגיאת תקשורת עם השרת' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.settingsContainer}>
<button 
  onClick={() => router.push('/')} 
  style={{
    background: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#94a3b8',
    padding: '10px 20px',
    borderRadius: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    marginBottom: '30px'
  }}
  onMouseEnter={(e) => { 
    e.currentTarget.style.color = '#fff'; 
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; 
  }}
  onMouseLeave={(e) => { 
    e.currentTarget.style.color = '#94a3b8'; 
    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'; 
  }}
>
  <ChevronRight size={18} /> חזרה לדאשבורד
</button>      
      <div className={styles.card}>
        <h2>אבטחה והגדרות</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>סיסמה נוכחית</label>
            <input 
              type="password" 
              required
              value={formData.oldPassword}
              onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>סיסמה חדשה</label>
            <input 
              type="password" 
              required
              value={formData.newPassword}
              onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>אימות סיסמה חדשה</label>
            <input 
              type="password" 
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
            />
          </div>

          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'מעדכן...' : 'שמור סיסמה חדשה'}
          </button>

          {status.msg && (
            <div className={`${styles.message} ${styles[status.type]}`}>
              {status.msg}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}