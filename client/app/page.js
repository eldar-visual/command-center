'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

const API_URL = 'https://command-center-server.onrender.com/api/data';

export default function Home() {
  const [items, setItems] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // נתוני טופס
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSection, setNewSection] = useState('docs'); // docs, buttons, visuals
  const [newImage, setNewImage] = useState('');

  // שליטה על "הצג עוד"
  const [showAllDocs, setShowAllDocs] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) setItems(await res.json());
    } catch (error) { console.error(error); }
  };

  // פונקציית עזר: חילוץ תמונה מיוטיוב או Favicon
  const getImage = (url, customImage) => {
    if (customImage) return customImage;
    
    // בדיקה אם זה יוטיוב
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) {
      return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }
    
    // ברירת מחדל: Favicon של גוגל
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
    } catch {
        return '/globe.svg';
    }
  };

  // פונקציית עזר: צבעים רנדומליים לכפתורים
  const getRandomColor = () => {
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#1A535C', '#FF9F1C', '#2EC4B6'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    let formattedUrl = newUrl.startsWith('http') ? newUrl : `https://${newUrl}`;

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
          title: newTitle, 
          value: formattedUrl, 
          section: newSection,
          imageUrl: newImage
      }),
    });
    
    setIsModalOpen(false);
    fetchData();
    setNewTitle(''); setNewUrl(''); setNewImage('');
  };

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if(!confirm('למחוק?')) return;
    // כאן צריך לממש מחיקה בשרת, כרגע נמחק לוקאלית
    setItems(items.filter(i => i._id !== id));
  };

  // --- סינון לפי סוגים ---
  const docs = items.filter(i => i.section === 'docs');
  const buttons = items.filter(i => i.section === 'buttons');
  const visuals = items.filter(i => i.section === 'visuals');

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>מרכז שליטה</h1>
      </header>

      {/* --- חלק 1: מסמכים וקישורים (רשימה) --- */}
      <section className={styles.docsSection}>
        <h3 style={{color:'#888', marginBottom:'10px'}}>מסמכים וקישורים</h3>
        {docs.slice(0, showAllDocs ? docs.length : 5).map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.docItem} style={{borderRightColor: getRandomColor()}}>
                <span>{item.title}</span>
                <button onClick={(e) => handleDelete(e, item._id)} style={{background:'none', border:'none', color:'#444', cursor:'pointer'}}>✕</button>
            </a>
        ))}
        {docs.length > 5 && (
            <div className={styles.showMoreBtn} onClick={() => setShowAllDocs(!showAllDocs)}>
                {showAllDocs ? 'הצג פחות' : `הצג עוד ${docs.length - 5} פריטים...`}
            </div>
        )}
      </section>

      {/* --- חלק 2: כפתורים מהירים (Pills) --- */}
      <div className={styles.buttonsGrid}>
        {buttons.map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.pillButton} style={{borderColor: getRandomColor()}}>
                {item.title}
            </a>
        ))}
      </div>

      <div className={styles.divider}></div>

      {/* --- חלק 3: מועדפים ויזואליים (Youtube/Cards) --- */}
      <div className={styles.visualsGrid}>
        {visuals.map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.visualCard}>
                <img src={getImage(item.value, item.imageUrl)} alt={item.title} className={styles.cardImage} />
                <div className={styles.cardTitleOverlay}>{item.title}</div>
                <button className={styles.deleteBtn} onClick={(e) => handleDelete(e, item._id)}>✕</button>
            </a>
        ))}
      </div>

      {/* --- כפתור הוספה --- */}
      <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>+</button>

      {/* --- מודל הוספה --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <form className={styles.modal} onSubmit={handleAdd}>
            <h2>הוספת פריט חדש</h2>
            
            <input placeholder="שם הפריט" value={newTitle} onChange={e=>setNewTitle(e.target.value)} className={styles.input} required />
            <input placeholder="קישור (URL)" value={newUrl} onChange={e=>setNewUrl(e.target.value)} className={styles.input} required />
            
            <select value={newSection} onChange={e=>setNewSection(e.target.value)} className={styles.select}>
                <option value="docs">קישור רגיל / מסמך (רשימה)</option>
                <option value="buttons">כפתור מהיר (אמצע)</option>
                <option value="visuals">כרטיסייה / יוטיוב (למטה)</option>
            </select>

            {newSection === 'visuals' && (
                <input placeholder="לינק לתמונה (אופציונלי)" value={newImage} onChange={e=>setNewImage(e.target.value)} className={styles.input} />
            )}

            <button type="submit" style={{width:'100%', padding:'10px', background:'#007cf0', border:'none', color:'white', borderRadius:'5px', cursor:'pointer'}}>שמור</button>
          </form>
        </div>
      )}
    </main>
  );
}