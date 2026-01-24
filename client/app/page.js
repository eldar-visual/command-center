// client/app/page.js
'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

// וודא שזו הכתובת הנכונה (RENDER או LOCALHOST)
const API_URL = 'https://command-center-server.onrender.com/api/data';

export default function Home() {
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // הטאב הפעיל כרגע
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // נתוני טופס
  const [newItemName, setNewItemName] = useState('');
  const [newItemUrl, setNewItemUrl] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('general');

  // רשימת הקטגוריות לטאבים
  const categories = [
    { id: 'all', label: 'הכל' },
    { id: 'work', label: 'עבודה' },
    { id: 'design', label: 'עיצוב' },
    { id: 'social', label: 'חברתי' },
    { id: 'docs', label: 'מסמכים' },
  ];

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

  // פונקציה להשגת אייקון אוטומטי (Favicon)
  const getFavicon = (url) => {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch (e) {
        return '/globe.svg'; // אייקון ברירת מחדל אם הלינק שבור
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemUrl) return;

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
            category: newItemCategory, // שולחים גם את הקטגוריה
            type: 'link' 
        }),
      });

      if (res.ok) {
        await fetchData();
        closeModal();
      }
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if(!confirm('למחוק את הפריט?')) return;
    
    // כאן צריך להוסיף בשרת תמיכה במחיקה אמיתית, כרגע זה רק ימחק מהמסך
    // למדריך הבא נסדר את המחיקה בשרת
    const newItems = items.filter(item => item._id !== id);
    setItems(newItems);
  };

  const openModal = () => {
    setNewItemName('');
    setNewItemUrl('');
    setNewItemCategory('general');
    setIsModalOpen(true);
  }

  const closeModal = () => setIsModalOpen(false);

  // סינון הפריטים לפי הטאב שנבחר
  const filteredItems = activeTab === 'all' 
    ? items 
    : items.filter(item => item.category === activeTab);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>COMMAND CENTER</h1>
        <div style={{color: '#888'}}>Aviram Eldar</div>
      </header>

      {/* --- סרגל הטאבים --- */}
      <div className={styles.tabsContainer}>
        {categories.map(cat => (
            <button 
                key={cat.id}
                className={`${styles.tab} ${activeTab === cat.id ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(cat.id)}
            >
                {cat.label}
            </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filteredItems.map((item) => (
          <a 
            key={item._id} 
            href={item.value} 
            target="_blank" 
            rel="noopener noreferrer" 
            className={styles.card}
          >
            {/* אייקון אוטומטי */}
            <img 
                src={getFavicon(item.value)} 
                alt="icon" 
                className={styles.cardIcon}
                onError={(e) => e.target.style.display = 'none'} 
            />
            
            <div className={styles.cardTitle}>{item.title}</div>
            <div style={{fontSize: '0.8rem', color: '#666', marginTop: '5px'}}>{item.category || 'general'}</div>
            
            <button className={styles.deleteBtn} onClick={(e) => handleDeleteItem(e, item._id)}>✕</button>
          </a>
        ))}

        {/* כפתור הוספה */}
        <div className={`${styles.card} ${styles.addCard}`} onClick={openModal}>+</div>
      </div>

      {/* --- חלון הוספה משופר --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => { if(e.target === e.currentTarget) closeModal() }}>
          <div className={styles.modal}>
            <h2>הוספת קיצור דרך</h2>
            <form onSubmit={handleAddItem}>
              
              <div className={styles.inputGroup}>
                <label style={{color: '#888', fontSize: '0.9rem'}}>שם האתר</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  autoFocus
                />
              </div>

              <div className={styles.inputGroup}>
                <label style={{color: '#888', fontSize: '0.9rem'}}>כתובת (URL)</label>
                <input 
                  type="text" 
                  className={styles.input}
                  value={newItemUrl}
                  onChange={(e) => setNewItemUrl(e.target.value)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label style={{color: '#888', fontSize: '0.9rem'}}>קטגוריה</label>
                <select 
                    className={styles.input}
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                >
                    <option value="general">כללי</option>
                    <option value="work">עבודה</option>
                    <option value="design">עיצוב</option>
                    <option value="social">חברתי</option>
                    <option value="docs">מסמכים</option>
                </select>
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