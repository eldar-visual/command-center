'use client';
import { useState, useEffect, useRef } from 'react';
import { Info, Plus, Trash2, Edit2, Link as LinkIcon, ExternalLink } from 'lucide-react'; // אייקונים
import styles from './page.module.css';

// הכתובת של השרת שלך
const API_URL = 'https://command-center-6pqx.onrender.com/api/data';

export default function Home() {
  const [items, setItems] = useState([]);
  
  // --- טאבים (קטגוריות) ---
  // נתחיל עם רשימה ריקה, והיא תתמלא מהדאטה-בייס
  const [tabs, setTabs] = useState(['כללי']); 
  const [activeTab, setActiveTab] = useState('כללי');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  // --- מודלים (הוספה/מחיקה) ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('docs'); // 'docs', 'buttons', 'visuals'
  
  const [formData, setFormData] = useState({ title: '', value: '', imageUrl: '' });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // --- קליק ימני (Context Menu) ---
  const [contextMenu, setContextMenu] = useState(null); // { x, y, type, targetId, targetName }

  useEffect(() => {
    fetchData();
    // סגירת תפריט קליק ימני בלחיצה בכל מקום
    const handleClick = () => setContextMenu(null);
    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
        
        // חילוץ הקטגוריות הקיימות מהמידע כדי לבנות את הטאבים
        const existingCategories = new Set(data.map(i => i.category).filter(c => c && c !== 'general'));
        setTabs(['כללי', ...Array.from(existingCategories)]);
      }
    } catch (error) { console.error("Error:", error); }
  };

  // --- לוגיקה של הוספה ---
  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.value) return;

    let formattedUrl = formData.value.startsWith('http') ? formData.value : `https://${formData.value}`;
    
    // קביעת הקטגוריה: אם זה כפתור או תמונה - קטגוריה כללית, אחרת - הטאב הפעיל
    let categoryToSave = activeTab;
    let sectionToSave = 'docs';

    if (modalType === 'buttons') { sectionToSave = 'buttons'; categoryToSave = 'general'; }
    else if (modalType === 'visuals') { sectionToSave = 'visuals'; categoryToSave = 'general'; }
    else { sectionToSave = 'docs'; }

    const payload = {
      title: formData.title,
      value: formattedUrl,
      section: sectionToSave,
      imageUrl: formData.imageUrl,
      category: categoryToSave 
    };

    try {
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
            await fetchData();
            setIsModalOpen(false);
            setFormData({ title: '', value: '', imageUrl: '' });
        }
    } catch (e) { console.error(e); }
  };

  // --- לוגיקה של מחיקת פריט ---
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
        await fetch(`${API_URL}/${itemToDelete}`, { method: 'DELETE' });
        setItems(prev => prev.filter(i => i._id !== itemToDelete));
        setIsDeleteModalOpen(false);
    } catch (error) { console.error(error); }
  };

  // --- ניהול טאבים ---
  const handleAddTab = () => {
      if (newTabName.trim()) {
          setTabs([...tabs, newTabName]);
          setActiveTab(newTabName);
          setNewTabName('');
          setIsAddingTab(false);
      }
  };

  const handleTabContextMenu = (e, tab) => {
      e.preventDefault();
      if (tab === 'כללי') return; // אי אפשר למחוק את הראשי
      setContextMenu({
          x: e.pageX,
          y: e.pageY,
          type: 'tab',
          targetName: tab
      });
  };

  const deleteTab = async () => {
      if (!contextMenu?.targetName) return;
      // כאן בעתיד נמחק את כל הפריטים ששייכים לטאב הזה מהדאטה בייס
      // כרגע רק נסיר מהתצוגה
      const tabToDelete = contextMenu.targetName;
      setTabs(tabs.filter(t => t !== tabToDelete));
      if (activeTab === tabToDelete) setActiveTab('כללי');
      setContextMenu(null);
  };

  // --- עזרים ---
  const getImage = (url, customImage) => {
    if (customImage) return customImage;
    if (!url) return '/globe.svg';
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(youtubeRegex);
    if (match && match[1]) return `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg`;
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
    } catch { return '/globe.svg'; }
  };

  // פילטורים
  const currentTabItems = items.filter(i => i.section === 'docs' && (i.category === activeTab || (!i.category && activeTab === 'כללי')));
  const quickAccessItems = items.filter(i => i.section === 'buttons');
  const visualsItems = items.filter(i => i.section === 'visuals');

  return (
    <main className={styles.main}>
      
      {/* --- Header --- */}
      <div className={styles.headerWrapper}>
        <div className={styles.infoIconWrapper}>
            <Info size={24} />
            <div className={styles.versionTooltip}>גרסה 1.0.2</div>
        </div>
        <div style={{textAlign: 'center'}}>
            <h1 className={styles.title}>מרכז שליטה</h1>
            <div className={styles.subtitle}>PERSONAL DASHBOARD V5.4</div>
        </div>
      </div>

      {/* --- Tabs --- */}
      <div className={styles.tabsContainer}>
        {tabs.map(tab => (
            <button 
                key={tab} 
                className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
                onClick={() => setActiveTab(tab)}
                onContextMenu={(e) => handleTabContextMenu(e, tab)}
            >
                {tab}
            </button>
        ))}
        
        {isAddingTab ? (
            <input 
                autoFocus
                className={styles.newTabInput}
                value={newTabName}
                onChange={e => setNewTabName(e.target.value)}
                onBlur={handleAddTab}
                onKeyDown={e => e.key === 'Enter' && handleAddTab()}
                placeholder="שם..."
            />
        ) : (
            <button className={styles.addTabBtn} onClick={() => setIsAddingTab(true)}>
                <Plus size={18} />
            </button>
        )}
      </div>

      {/* --- Main Content (Items List) --- */}
      <section className={styles.contentArea}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{activeTab}</h2>
            <button className={styles.addItemBtn} onClick={() => { setModalType('docs'); setIsModalOpen(true); }}>
                <Plus size={18} /> פריט חדש
            </button>
        </div>

        <div className={styles.itemsList}>
            {currentTabItems.length === 0 && <p style={{color:'#64748b', textAlign:'center'}}>אין פריטים בטאב זה. לחץ על + להוספה.</p>}
            
            {currentTabItems.map(item => (
                <div key={item._id} className={styles.itemRow}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        <LinkIcon size={16} color="#3b82f6" />
                        <a href={item.value} target="_blank" style={{color:'inherit', textDecoration:'none', fontSize:'1.1rem'}}>{item.title}</a>
                    </div>
                    <div className={styles.itemActions}>
                        <button className={styles.actionBtn}><Edit2 size={16} /></button>
                        <button className={`${styles.actionBtn} ${styles.deleteAction}`} onClick={() => { setItemToDelete(item._id); setIsDeleteModalOpen(true); }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </section>

      <div className={styles.divider}></div>

      {/* --- Quick Access (Buttons) --- */}
      <div className={styles.quickAccessContainer}>
        {quickAccessItems.map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.quickBtn}>
                <img src={getImage(item.value)} style={{width:16, height:16, borderRadius:'50%'}} alt="" />
                {item.title}
            </a>
        ))}
        {quickAccessItems.length < 8 && (
            <button className={styles.addQuickBtn} onClick={() => { setModalType('buttons'); setIsModalOpen(true); }}>
                <Plus size={20} />
            </button>
        )}
      </div>

      {/* --- Visuals (Favorites) --- */}
      <div className={styles.visualsGrid}>
        {visualsItems.map(item => (
             <a key={item._id} href={item.value} target="_blank" className={styles.visualCard}>
                <img src={getImage(item.value, item.imageUrl)} className={styles.visualImg} alt={item.title} />
                <div className={styles.visualOverlay}>{item.title}</div>
            </a>
        ))}
         <button className={styles.visualCard} style={{background: 'rgba(255,255,255,0.05)', border:'2px dashed #334155', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}} 
                 onClick={() => { setModalType('visuals'); setIsModalOpen(true); }}>
            <Plus size={40} />
         </button>
      </div>

      {/* --- Modal Add Item --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <form className={styles.modal} onSubmit={handleAdd}>
            <h2 style={{color:'white', marginBottom:'20px'}}>
                {modalType === 'docs' ? 'הוספת פריט לרשימה' : modalType === 'buttons' ? 'הוספת כפתור מהיר' : 'הוספת מועדף ויזואלי'}
            </h2>
            <input placeholder="כותרת" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className={styles.input} required autoFocus />
            <input placeholder="קישור (URL)" value={formData.value} onChange={e=>setFormData({...formData, value: e.target.value})} className={styles.input} required />
            
            {modalType === 'visuals' && (
                 <input placeholder="קישור לתמונה (אופציונלי)" value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})} className={styles.input} />
            )}

            <div className={styles.modalButtons}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                <button type="submit" className={styles.btnPrimary}>שמור</button>
            </div>
          </form>
        </div>
      )}

      {/* --- Modal Delete --- */}
      {isDeleteModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsDeleteModalOpen(false)}>
          <div className={styles.modal} style={{textAlign: 'center'}}>
            <h3>מחיקת פריט</h3>
            <p style={{color:'#94a3b8', margin:'10px 0 20px'}}>פעולה זו לא ניתנת לביטול.</p>
            <div className={styles.modalButtons}>
                <button onClick={() => setIsDeleteModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                <button onClick={confirmDelete} className={styles.btnDanger}>מחק</button>
            </div>
          </div>
        </div>
      )}

      {/* --- Context Menu (Right Click) --- */}
      {contextMenu && (
          <div className={styles.contextMenu} style={{ top: contextMenu.y, left: contextMenu.x }}>
              <div className={styles.contextMenuItem}><Edit2 size={14} /> שנה שם</div>
              <div className={`${styles.contextMenuItem} ${styles.deleteItem}`} onClick={deleteTab}>
                  <Trash2 size={14} /> מחק טאב
              </div>
          </div>
      )}

    </main>
  );
}