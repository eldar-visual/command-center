'use client';
import { useEffect, useState } from 'react';
import styles from './admin.module.css';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  // שליפת המשתמשים מה-API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/admin/users');
        if (!res.ok) {
          if (res.status === 403) throw new Error('אין לך הרשאות אדמין לצפות בדף זה');
          throw new Error('שגיאה בטעינת המשתמשים');
        }
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className={styles.center}><div className={styles.loader}></div> טוען נתונים...</div>;
  if (error) return <div className={styles.errorContainer}><h3>שגיאה: {error}</h3><button onClick={() => router.push('/')}>חזרה לדף הבית</button></div>;

  return (
    <div className={styles.adminWrapper}>
      <div className={styles.sidebarPlaceholder}>
        {/* כאן אפשר להכניס את ה-Sidebar הקיים שלך אם תרצה */}
      </div>

      <main className={styles.content}>
        <header className={styles.header}>
          <div>
            <h1>ניהול משתמשים</h1>
            <p>רשימת כל המשתמשים הרשומים במערכת</p>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{users.length}</span>
            <span className={styles.statLabel}>משתמשים סה"כ</span>
          </div>
        </header>

        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>שם מלא</th>
                <th>אימייל</th>
                <th>תפקיד</th>
                <th>תאריך הצטרפות</th>
                <th>סטטוס</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className={styles.userName}>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={user.role === 'admin' ? styles.roleAdmin : styles.roleUser}>
                      {user.role === 'admin' ? 'מנהל' : 'משתמש'}
                    </span>
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString('he-IL')}</td>
                  <td>
                    <span className={styles.statusActive}>פעיל</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}