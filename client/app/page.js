// client/app/page.js
'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

// וודא שהכתובת הזו היא הכתובת של RENDER שלך (כמו שעשינו קודם)
// אם אתה בודק מקומית, זה localhost:5001. אם אתה מעלה ל-Netlify, שים את הכתובת של Render.
const API_URL = 'https://command-center-server.onrender.com/api/data'; 

export default function Home() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // משתנים לשמירת המידע מהטופס
  const [newItemName, setNewItemName] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');

  // טעינת נתונים ראשונית
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault(); // מונע רענון של העמוד
    
    if (!newItemName || !newItemUrl) return;

    // הוספת https אם המשתמש שכח
    let formattedUrl = newItemUrl;
    if (!formattedUrl.startsWith('http')) {
        formattedUrl = `https://${formattedUrl}`;
    }

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            title: newItemName, 
            value: formattedUrl,
            type: 'link' 
        }),
      });

      if (res.ok) {
        await fetchData(); // רענון הרשימה
        closeModal();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.preventDefault(); // מונע כניסה ללינק כשלוחצים מחיקה
    e.stopPropagation();

    if(!confirm('למחוק את הפריט?')) return;

    try {
        // שים לב: בשרת נצטרך להוסיף תמיכה במחיקה, אבל כרגע זה רק ימחק מהתצוגה
        // אם הוספנו תמיכה בשרת ב-DELETE, זה יעבוד. אם לא, צריך להוסיף בשרת.
        // כרגע נשאיר את זה ככה.
        console.log("Deleting...", id);
    } catch (error) {
        console.error(error);
    }
  };

  const openModal = () => {
    setNewItemName('');
    setNewItemUrl('');
    setIsModalOpen(true);
  }

  const closeModal = () => {
    setIsModalOpen(false);
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>COMMAND CENTER</h1>
        <div style={{color: '#888'}}>Aviram Eldar</div>
      </header>

      <div className={styles.grid}>
        {/* כרטיסיות האתרים */}
        {items.map((item) => (
          <a 
            key={item._id} 
            href={item.value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.card}
          >
            {/* אייקון גנרי לכרטיסייה */}
            <div style={{fontSize: '2rem', marginBottom: '10px'}}>🌐</div>
            <div className={styles.cardTitle}>{item.title}</div>
            
            {/* כפתור מחיקה - אופציונלי */}
            <button className={styles.deleteBtn} onClick={(e) => handleDeleteItem(e, item._id)}>✕</button>
          </a>
        ))}

        {/* כפתור ההוספה - פותח את המודל */}
        <div className={`${styles.card} ${styles.addCard}`} onClick={openModal}>
          +
        </div>
      </div>

      {/* --- MODAL (החלון הקופץ) --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => { if(e.target === e.currentTarget) closeModal() }}>
          <div className={styles.modal}>
            <h2>הוספת אתר חדש</h2>
            <form onSubmit={handleAddItem}>
              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  placeholder="שם האתר (למשל: YouTube)" 
                  className={styles.input}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  autoFocus
                />
              </div>
              <div className={styles.inputGroup}>
                <input 
                  type="text" 
                  placeholder="כתובת (למשל: youtube.com)" 
                  className={styles.input}
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                />
              </div>
              <div className={styles.modalButtons}>
                <button type="button" onClick={closeModal} className={styles.btnSecondary}>ביטול</button>
                <button type="submit" className={styles.btnPrimary}>שמור</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}