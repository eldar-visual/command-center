'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

// client/app/page.js
const API_URL = 'https://command-center-6pqx.onrender.com/api/data';

export default function Home() {
  // אתחול כרשימה ריקה כדי למנוע שגיאות בהתחלה
  const [items, setItems] = useState([]); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // נתוני טופס
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSection, setNewSection] = useState('docs'); 
  const [newImage, setNewImage] = useState('');

  // שליטה על "הצג עוד"
  const [showAllDocs, setShowAllDocs] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        // --- תיקון בטיחות: בדיקה שהתקבלה רשימה ---
        if (Array.isArray(data)) {
            setItems(data);
        } else {
            console.error("Data received is not an array:", data);
            setItems([]); // אם התקבל זבל, נשים רשימה ריקה
        }
      } else {
          console.error("Server returned error:", res.status);
      }
    } catch (error) { console.error("Fetch error:", error); }
  };

  const getImage = (url, customImage) => {
    if (customImage) return customImage;
    if (!url) return '/globe.svg'; // הגנה מפני לינק ריק

    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    } catch {
        return '/globe.svg';
    }
  };

  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C', '#2EC4B6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newUrl) return; // הגנה
    
    let formattedUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;

    try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
              title: newTitle, 
              value: formattedUrl, 
              section: newSection,
              imageUrl: newImage
          }),
        });

        if (res.ok) {
            await fetchData(); // רענון הנתונים
            setIsModalOpen(false);
            // איפוס הטופס
            setNewTitle(''); 
            setNewUrl(''); 
            setNewImage('');
        } else {
            alert('שגיאה בשמירה לשרת');
        }
    } catch (e) {
        console.error(e);
        alert('שגיאת תקשורת');
    }
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if(!confirm('למחוק?')) return;
    
    // מחיקה אופטימית (מהמסך מיד)
    setItems(prevItems => prevItems.filter(i => i._id !== id));
  };

  // --- סינון בטוח ---
  // השימוש ב- (items || []) מבטיח שלא נקרוס גם אם items הוא null
  const safeItems = Array.isArray(items) ? items : [];
  
  const docs = safeItems.filter(i => i.section === 'docs' || !i.section); // ברירת מחדל ל-docs
  const buttons = safeItems.filter(i => i.section === 'buttons');
  const visuals = safeItems.filter(i => i.section === 'visuals');

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>מרכז שליטה</h1>
      </header>

      {/* --- חלק 1: מסמכים וקישורים --- */}
      <section className={styles.docsSection}>
        <h3 style={{color:'#888', marginBottom:'10px', fontSize: '1.2rem'}}>📌 מסמכים וקישורים</h3>
        {docs.length === 0 && <p style={{color:'#555'}}>אין פריטים עדיין...</p>}
        
        {docs.slice(0, showAllDocs ? docs.length : 5).map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.docItem} style={{borderRightColor: getRandomColor()}}>
                <span style={{fontSize:'1.1rem'}}>{item.title}</span>
                <button onClick={(e) => handleDelete(e, item._id)} className={styles.deleteBtn} style={{position:'static', width:'auto', background:'none'}}>✕</button>
            </a>
        ))}
        {docs.length > 5 && (
            <div className={styles.showMoreBtn} onClick={() => setShowAllDocs(!showAllDocs)}>
                {showAllDocs ? 'הצג פחות' : `הצג עוד ${docs.length - 5} פריטים...`}
            </div>
        )}
      </section>

      {/* --- חלק 2: כפתורים מהירים --- */}
      <div className={styles.divider}></div>
      <div className={styles.buttonsGrid}>
        {buttons.map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.pillButton} style={{borderColor: getRandomColor()}}>
                {item.title}
            </a>
        ))}
      </div>

      {/* --- חלק 3: ויזואלי (יוטיוב) --- */}
      <div className={styles.divider}></div>
      <div className={styles.visualsGrid}>
        {visuals.map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.visualCard}>
                <img src={getImage(item.value, item.imageUrl)} alt={item.title} className={styles.cardImage} />
                <div className={styles.cardTitleOverlay}>{item.title}</div>
                <button className={styles.deleteBtn} onClick={(e) => handleDelete(e, item._id)}>✕</button>
            </a>
        ))}
      </div>

      <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>+</button>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <form className={styles.modal} onSubmit={handleAdd}>
            <h2 style={{color:'white', marginBottom:'20px'}}>הוספת פריט חדש</h2>
            
            <input placeholder="שם הפריט" value={newTitle} onChange={e=>setNewTitle(e.target.value)} className={styles.input} required />
            <input placeholder="קישור (URL)" value={newUrl} onChange={e=>setNewUrl(e.target.value)} className={styles.input} required />
            
            <label style={{color:'#ccc', display:'block', marginTop:'10px', marginBottom:'5px'}}>איפה להציג?</label>
            <select value={newSection} onChange={e=>setNewSection(e.target.value)} className={styles.select}>
                <option value="docs">רשימה (למעלה)</option>
                <option value="buttons">כפתור (באמצע)</option>
                <option value="visuals">כרטיסייה גדולה (למטה)</option>
            </select>

            {newSection === 'visuals' && (
                <input placeholder="לינק לתמונה (אופציונלי)" value={newImage} onChange={e=>setNewImage(e.target.value)} className={styles.input} />
            )}

            <button type="submit" style={{width:'100%', padding:'12px', background:'#007cf0', border:'none', color:'white', borderRadius:'8px', cursor:'pointer', marginTop:'20px', fontWeight:'bold', fontSize:'1rem'}}>שמור</button>
          </form>
        </div>
      )}
    </main>
  );
}