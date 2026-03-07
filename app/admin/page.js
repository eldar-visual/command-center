'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users, Mail, Lock, User, Shield, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './admin.module.css';

export default function AdminPanel() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [status, setStatus] = useState({ type: '', message: '' });

  // טעינת רשימת המשתמשים כשהדף עולה
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (res.ok) setUsers(data);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', message: 'יוצר משתמש...' });

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();

    if (res.ok) {
      setStatus({ type: 'success', message: 'המשתמש נוצר בהצלחה!' });
      setFormData({ name: '', email: '', password: '', role: 'user' }); // איפוס טופס
      fetchUsers(); // ריענון הרשימה
      setTimeout(() => setStatus({ type: '', message: '' }), 3000);
    } else {
      setStatus({ type: 'error', message: data.error });
    }
  };

  return (
    <div className={styles.adminWrapper}>
      <header className={styles.header}>
        <div className={styles.headerRight}>
          <Link href="/" className={styles.backBtn}>
            <ArrowRight size={20} /> חזרה לדאשבורד
          </Link>
          <h1 className={styles.title}><Shield size={28} color="#3b82f6" /> ניהול מערכת (Admin)</h1>
        </div>
      </header>

      <main className={styles.dashboardGrid}>
        
        {/* טופס הוספת משתמש */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <UserPlus size={22} color="#3b82f6" />
            <h2>הוספת לקוח חדש</h2>
          </div>
          
          <form onSubmit={handleCreateUser} className={styles.form}>
            <div className={styles.inputGroup}>
              <User size={18} className={styles.inputIcon} />
              <input type="text" placeholder="שם מלא" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            
            <div className={styles.inputGroup}>
              <Mail size={18} className={styles.inputIcon} />
              <input type="email" placeholder="אימייל" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>

            <div className={styles.inputGroup}>
              <Lock size={18} className={styles.inputIcon} />
              <input type="text" placeholder="סיסמה התחלתית" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>

            <div className={styles.selectGroup}>
              <label>הרשאה:</label>
              <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                <option value="user">לקוח (User)</option>
                <option value="admin">מנהל (Admin)</option>
              </select>
            </div>

            {status.message && (
              <p className={`${styles.statusMsg} ${styles[status.type]}`}>{status.message}</p>
            )}

            <button type="submit" className={styles.submitBtn}>
              <UserPlus size={18} /> צור משתמש
            </button>
          </form>
        </section>

        {/* רשימת המשתמשים */}
        <section className={styles.card}>
          <div className={styles.cardHeader}>
            <Users size={22} color="#10b981" />
            <h2>משתמשים רשומים ({users.length})</h2>
          </div>
          
          <div className={styles.usersList}>
            {users.map((user) => (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={user._id} className={styles.userRow}>
                <div className={styles.userInfo}>
                  <div className={styles.avatar}>{user.name[0]}</div>
                  <div>
                    <h4 className={styles.userName}>{user.name}</h4>
                    <span className={styles.userEmail}>{user.email}</span>
                  </div>
                </div>
                <span className={`${styles.roleBadge} ${user.role === 'admin' ? styles.adminBadge : ''}`}>
                  {user.role === 'admin' ? 'מנהל' : 'לקוח'}
                </span>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
}