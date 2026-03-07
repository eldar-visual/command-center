'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, Mail, Lock, User, X, MailOpen } from 'lucide-react'; 
import styles from './login.module.css';

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showMailModal, setShowMailModal] = useState(false);
  const router = useRouter();

 const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        // ההתחברות הצליחה! השרת כבר שתל את העוגיות, נשאר רק לרענן ולעבור לדף הבית
        router.refresh(); 
        router.push('/');
      } else {
        // מציג את השגיאה שקיבלנו מהשרת (משתמש לא קיים / סיסמה שגויה)
        setError(data.error);
      }
    } catch (err) {
      setError('שגיאת תקשורת. אנא נסה שוב מאוחר יותר.');
    }
  };

  const openMailProvider = (provider) => {
    // התיקון הקריטי: לאן נשלחים המיילים של בקשות ההרשמה
    const to = 'aviram@eldarvisual.com';
    const subject = 'בקשת הרשמה למערכת EldarVisual';
    const body = 'אני מעוניין להירשם לשירות.\n\nהשם המלא שלי: \nהאימייל שלי: ';
    
    let url = '';
    switch(provider) {
      case 'gmail':
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(url, '_blank');
        break;
      case 'outlook':
        url = `https://outlook.live.com/mail/0/deeplink/compose?to=${to}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(url, '_blank');
        break;
      case 'yahoo':
        url = `https://compose.mail.yahoo.com/?to=${to}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.open(url, '_blank');
        break;
      case 'other':
        // הפעלת אפליקציית הדואר המקומית (Mailto)
        url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = url;
        break;
      default:
        break;
    }
    
    // סגירת החלונית לאחר הלחיצה
    setShowMailModal(false);
  };

  return (
    <div className={styles.loginWrapper}>
      <motion.div animate={{ y: 0 }} className={styles.loginCard}>
        <h1 className={styles.loginTitle}>EldarVisual</h1>
        <p className={styles.loginSubtitle}>התחבר למרכז השליטה שלך</p>

        <form onSubmit={handleLogin} className={styles.form}>
          <div className={styles.inputGroup}>
            <User size={18} className={styles.inputIcon} />
            <input 
              type="email" 
              placeholder="אימייל" 
              required 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
          </div>
          <div className={styles.inputGroup}>
            <Lock size={18} className={styles.inputIcon} />
            <input 
              type="password" 
              placeholder="סיסמה" 
              required 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
            />
          </div>
          {error && <p className={styles.errorMsg}>{error}</p>}
          
          <button type="submit" className={styles.loginBtn}>
            כניסה למערכת <LogIn size={18} />
          </button>
        </form>

        <div className={styles.divider}><span>או</span></div>

        <button type="button" onClick={() => setShowMailModal(true)} className={styles.registerBtn}>
           בקשת הרשמה <Mail size={18} />
        </button>
      </motion.div>

      <AnimatePresence>
        {showMailModal && (
          <div className={styles.modalOverlay}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.modalContent}
            >
              <button onClick={() => setShowMailModal(false)} className={styles.closeModalBtn}>
                <X size={20} />
              </button>
              
              <div className={styles.modalHeader}>
                <MailOpen size={36} color="#3b82f6" />
                <h3>בחר שירות דואר</h3>
                <p>איך תרצה לשלוח לנו את הבקשה?</p>
              </div>

              <div className={styles.providersGrid}>
                <button type="button" onClick={() => openMailProvider('gmail')} className={styles.providerBtn}>
                  <Mail color="#DB4437" size={24} />
                  Gmail
                </button>
                <button type="button" onClick={() => openMailProvider('outlook')} className={styles.providerBtn}>
                  <Mail color="#0078D4" size={24} />
                  Outlook
                </button>
                <button type="button" onClick={() => openMailProvider('yahoo')} className={styles.providerBtn}>
                  <Mail color="#6001D2" size={24} />
                  Yahoo
                </button>
                <button type="button" onClick={() => openMailProvider('other')} className={`${styles.providerBtn} ${styles.otherBtn}`}>
                  <Mail color="#94a3b8" size={24} />
                  אפליקציית דואר במחשב
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}