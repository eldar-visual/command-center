// client/app/page.js
'use client';
import { useState, useEffect } from 'react';
import styles from './page.module.css';

// הכתובת של השרת ב-RENDER
const API_URL = 'https://command-center-server.onrender.com/api/data';

export default function Home() {
  const [items, setItems] = useState([]);
  
  // מצבים למודל הוספה
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newSection, setNewSection] = useState('docs'); 
  const [newImage, setNewImage] = useState('');

  // מצבים למודל מחיקה
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [showAllDocs, setShowAllDocs] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
            setItems(data);
        } else {
            setItems([]);
        }
      }
    } catch (error) { console.error("Fetch error:", error); }
  };

  const getImage = (url, customImage) => {
    if (customImage) return customImage;
    if (!url) return '/globe.svg';

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
    if (!newUrl) return;
    
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
            await fetchData();
            setIsModalOpen(false);
            setNewTitle(''); setNewUrl(''); setNewImage('');
        }
    } catch (e) {
        console.error(e);
    }
  };

  const openDeleteModal = (e, id) => {
    e.preventDefault();
    e.stopPropagation(); 
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    // מחיקה אופטימית מהתצוגה
    setItems(prevItems => prevItems.filter(i => i._id !== itemToDelete));
    setIsDeleteModalOpen(false); 

    try {
        await fetch(`${API_URL}/${itemToDelete}`, { method: 'DELETE' });
    } catch (error) {
        console.error("Error deleting:", error);
        fetchData();
    }
    setItemToDelete(null);
  };

  const safeItems = Array.isArray(items) ? items : [];
  const docs = safeItems.filter(i => i.section === 'docs' || !i.section);
  const buttons = safeItems.filter(i => i.section === 'buttons');
  const visuals = safeItems.filter(i => i.section === 'visuals');

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1 className={styles.title}>מרכז שליטה</h1>
      </header>

      {/* --- חלק 1: מסמכים --- */}
      <section className={styles.docsSection}>
        <h3 style={{color:'#888', marginBottom:'10px', fontSize: '1.2rem'}}>📌 מסמכים וקישורים</h3>
        {docs.length === 0 && <p style={{color:'#555'}}>אין פריטים עדיין...</p>}
        
        {docs.slice(0, showAllDocs ? docs.length : 5).map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.docItem} style={{borderRightColor: getRandomColor()}}>
                <span style={{fontSize:'1.1rem'}}>{item.title}</span>
                <button onClick={(e) => openDeleteModal(e, item._id)} className={styles.deleteBtn} style={{position:'static', width:'auto', background:'none'}}>✕</button>
            </a>
        ))}
        {docs.length > 5 && (
            <div className={styles.showMoreBtn} onClick={() => setShowAllDocs(!showAllDocs)}>
                {showAllDocs ? 'הצג פחות' : `הצג עוד ${docs.length - 5} פריטים...`}
            </div>
        )}
      </section>

      {/* --- חלק 2: כפתורים --- */}
      <div className={styles.divider}></div>
      <div className={styles.buttonsGrid}>
        {buttons.map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.pillButton} style={{borderColor: getRandomColor()}}>
                {item.title}
            </a>
        ))}
      </div>

      {/* --- חלק 3: ויזואלי --- */}
      <div className={styles.divider}></div>
      <div className={styles.visualsGrid}>
        {visuals.map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.visualCard}>
                <img src={getImage(item.value, item.imageUrl)} alt={item.title} className={styles.cardImage} />
                <div className={styles.cardTitleOverlay}>{item.title}</div>
                <button className={styles.deleteBtn} onClick={(e) => openDeleteModal(e, item._id)}>✕</button>
            </a>
        ))}
      </div>

      <button className={styles.addBtn} onClick={() => setIsModalOpen(true)}>+</button>

      {/* --- מודל הוספה --- */}
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
            <div className={styles.modalButtons}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                <button type="submit" className={styles.btnPrimary}>שמור</button>
            </div>
          </form>
        </div>
      )}

      {/* --- מודל מחיקה --- */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsDeleteModalOpen(false)}>
          <div className={styles.modal} style={{textAlign: 'center'}}>
            <h2 style={{color:'white', marginBottom:'10px'}}>מחיקת פריט</h2>
            <p style={{color:'#ccc', marginBottom:'20px'}}>האם אתה בטוח שברצונך למחוק את הפריט הזה?</p>
            
            <div className={styles.modalButtons}>
                <button onClick={() => setIsDeleteModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                {/* הנה התיקון: השימוש ב-btnDanger לאדום */}
                <button onClick={confirmDelete} className={styles.btnDanger}>מחק</button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}