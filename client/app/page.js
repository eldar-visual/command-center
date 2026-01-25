'use client';
import { useState, useEffect } from 'react';
import { Info, Plus, Trash2, Edit2, Link as LinkIcon, Pencil } from 'lucide-react'; 
import styles from './page.module.css';

const API_URL = 'https://command-center-6pqx.onrender.com/api/data';
// כתובת מיוחדת לשינוי שם טאב
const RENAME_TAB_URL = 'https://command-center-6pqx.onrender.com/api/tabs/rename';

export default function Home() {
  const [items, setItems] = useState([]);
  
  const [tabs, setTabs] = useState([]); 
  const [activeTab, setActiveTab] = useState('');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  // מודלים ועריכה
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('docs'); 
  const [editingItemId, setEditingItemId] = useState(null); 
  const [formData, setFormData] = useState({ title: '', value: '', imageUrl: '', category: '' });
  
  // מחיקה
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  // שינוי שם טאב (חדש!)
  const [isRenameTabModalOpen, setIsRenameTabModalOpen] = useState(false);
  const [tabToRename, setTabToRename] = useState('');
  const [newNameForTab, setNewNameForTab] = useState('');

  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    fetchData();
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

        const docItems = data.filter(i => i.section === 'docs' || !i.section);
        const uniqueCategories = new Set(docItems.map(i => i.category || 'כללי'));
        const calculatedTabs = Array.from(uniqueCategories).sort();
        
        setTabs(calculatedTabs);

        setActiveTab(prev => {
            if (calculatedTabs.includes(prev)) return prev;
            return calculatedTabs.length > 0 ? calculatedTabs[0] : '';
        });
      }
    } catch (error) { console.error("Error:", error); }
  };

  // --- הוספה / עריכת פריט ---
  const openAddModal = (type) => {
      setEditingItemId(null); 
      setModalType(type);
      const defaultCategory = type === 'docs' ? (activeTab || 'כללי') : 'כללי';
      setFormData({ title: '', value: '', imageUrl: '', category: defaultCategory });
      setIsModalOpen(true);
  };

  const openEditModal = (item) => {
      setEditingItemId(item._id);
      setModalType(item.section || 'docs');
      setFormData({
          title: item.title,
          value: item.value,
          imageUrl: item.imageUrl || '',
          category: item.category || 'כללי' 
      });
      setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.value) return;

    let formattedUrl = formData.value.startsWith('http') ? formData.value : `https://${formData.value}`;
    const categoryToSend = formData.category || 'כללי';

    const payload = {
      title: formData.title,
      value: formattedUrl,
      section: modalType === 'visuals' ? 'visuals' : modalType === 'buttons' ? 'buttons' : 'docs',
      imageUrl: formData.imageUrl,
      category: categoryToSend
    };

    try {
        let res;
        if (editingItemId) {
            res = await fetch(`${API_URL}/${editingItemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        } else {
            res = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
        }

        if (res.ok) {
            await fetchData();
            setIsModalOpen(false);
            setEditingItemId(null);
            if (!tabs.includes(categoryToSend) && modalType === 'docs') {
                setActiveTab(categoryToSend);
            }
        }
    } catch (e) { console.error(e); }
  };

  // --- שינוי שם טאב (הלוגיקה החדשה) ---
  const openRenameTabModal = () => {
      if (!contextMenu?.targetName) return;
      setTabToRename(contextMenu.targetName);
      setNewNameForTab(contextMenu.targetName);
      setIsRenameTabModalOpen(true);
      setContextMenu(null); // סגירת התפריט
  };

  const handleRenameTabSubmit = async (e) => {
      e.preventDefault();
      if (!newNameForTab.trim() || newNameForTab === tabToRename) {
          setIsRenameTabModalOpen(false);
          return;
      }

      try {
          // שליחת בקשה לשרת לעדכן את כל הפריטים
          const res = await fetch(RENAME_TAB_URL, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ oldName: tabToRename, newName: newNameForTab }),
          });

          if (res.ok) {
              await fetchData(); // רענון הנתונים יביא את השמות החדשים
              if (activeTab === tabToRename) setActiveTab(newNameForTab); // עדכון הטאב הפעיל אם צריך
              setIsRenameTabModalOpen(false);
          }
      } catch (error) {
          console.error("Error renaming tab:", error);
      }
  };


  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
        await fetch(`${API_URL}/${itemToDelete}`, { method: 'DELETE' });
        await fetchData(); 
        setIsDeleteModalOpen(false);
    } catch (error) { console.error(error); }
  };

  const handleAddTab = () => {
      if (newTabName.trim()) {
          if (!tabs.includes(newTabName)) {
              setTabs([...tabs, newTabName]);
          }
          setActiveTab(newTabName);
          setNewTabName('');
          setIsAddingTab(false);
      }
  };

  const handleTabContextMenu = (e, tab) => {
      e.preventDefault();
      setContextMenu({ x: e.pageX, y: e.pageY, targetName: tab });
  };

  const deleteTab = () => {
      if (!contextMenu?.targetName) return;
      const tabToDelete = contextMenu.targetName;
      setTabs(tabs.filter(t => t !== tabToDelete));
      if (activeTab === tabToDelete) setActiveTab(tabs[0] || '');
      setContextMenu(null);
  };

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

  const currentTabItems = items.filter(i => i.section === 'docs' && (i.category === activeTab || (!i.category && activeTab === 'כללי')));
  const quickAccessItems = items.filter(i => i.section === 'buttons');
  const visualsItems = items.filter(i => i.section === 'visuals');

  return (
    <main className={styles.main}>
      
      <div className={styles.headerWrapper}>
        <div className={styles.infoIconWrapper}>
            <Info size={24} />
            <div className={styles.versionTooltip}>גרסה 1.0.5</div>
        </div>
        <div style={{textAlign: 'center'}}>
            <h1 className={styles.title}>מרכז שליטה</h1>
            <div className={styles.subtitle}>PERSONAL DASHBOARD V5.4</div>
        </div>
      </div>

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
                autoFocus className={styles.newTabInput} value={newTabName}
                onChange={e => setNewTabName(e.target.value)}
                onBlur={handleAddTab} onKeyDown={e => e.key === 'Enter' && handleAddTab()}
                placeholder="שם..."
            />
        ) : (
            <button className={styles.addTabBtn} onClick={() => setIsAddingTab(true)}><Plus size={18} /></button>
        )}
      </div>

      <section className={styles.contentArea}>
        <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{activeTab || 'רשימה'}</h2>
            <button className={styles.addItemBtn} onClick={() => openAddModal('docs')}>
                <Plus size={18} /> פריט חדש
            </button>
        </div>

        <div className={styles.itemsList}>
            {currentTabItems.length === 0 && <p style={{color:'#64748b', textAlign:'center'}}>
                {tabs.length === 0 ? 'אין טאבים עדיין.' : 'הטאב ריק.'}
            </p>}
            
            {currentTabItems.map(item => (
                <div key={item._id} className={styles.itemRow}>
                    <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                        <LinkIcon size={16} color="#3b82f6" />
                        <a href={item.value} target="_blank" style={{color:'inherit', textDecoration:'none', fontSize:'1.1rem'}}>{item.title}</a>
                    </div>
                    <div className={styles.itemActions}>
                        <button className={styles.actionBtn} onClick={() => openEditModal(item)}><Edit2 size={16} /></button>
                        <button className={`${styles.actionBtn} ${styles.deleteAction}`} onClick={() => { setItemToDelete(item._id); setIsDeleteModalOpen(true); }}>
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))}
        </div>
      </section>

      <div className={styles.divider}></div>

      <div className={styles.quickAccessContainer}>
        {quickAccessItems.map(item => (
            <a key={item._id} href={item.value} target="_blank" className={styles.quickBtn}>
                <img src={getImage(item.value)} style={{width:16, height:16, borderRadius:'50%'}} alt="" />
                {item.title}
                <button 
                    style={{marginLeft:'5px', background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:'0.8rem'}}
                    onClick={(e) => { e.preventDefault(); openEditModal(item); }}
                >✎</button>
            </a>
        ))}
        {quickAccessItems.length < 8 && (
            <button className={styles.addQuickBtn} onClick={() => openAddModal('buttons')}><Plus size={20} /></button>
        )}
      </div>

      <div className={styles.visualsGrid}>
        {visualsItems.map(item => (
             <div key={item._id} style={{position:'relative'}}>
                 <a href={item.value} target="_blank" className={styles.visualCard}>
                    <img src={getImage(item.value, item.imageUrl)} className={styles.visualImg} alt={item.title} />
                    <div className={styles.visualOverlay}>{item.title}</div>
                </a>
                <button 
                    style={{position:'absolute', top:5, left:5, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', padding:5, cursor:'pointer', color:'white', zIndex:10}}
                    onClick={(e) => { e.preventDefault(); openEditModal(item); }}
                >
                    <Edit2 size={14} />
                </button>
             </div>
        ))}
         <button className={styles.visualCard} style={{background: 'rgba(255,255,255,0.05)', border:'2px dashed #334155', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}} 
                 onClick={() => openAddModal('visuals')}>
            <Plus size={40} />
         </button>
      </div>

      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <form className={styles.modal} onSubmit={handleSave}>
            <h2 style={{color:'white', marginBottom:'20px'}}>
                {editingItemId ? 'עריכת פריט' : 'הוספת פריט חדש'}
            </h2>
            <label style={{color:'#94a3b8', fontSize:'0.9rem'}}>כותרת</label>
            <input value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className={styles.input} required />
            <label style={{color:'#94a3b8', fontSize:'0.9rem'}}>כתובת (URL)</label>
            <input value={formData.value} onChange={e=>setFormData({...formData, value: e.target.value})} className={styles.input} required />
            {modalType === 'docs' && (
                <>
                    <label style={{color:'#94a3b8', fontSize:'0.9rem'}}>בחירת טאב (קטגוריה)</label>
                    <select 
                        value={formData.category} 
                        onChange={e=>setFormData({...formData, category: e.target.value})} 
                        className={styles.select}
                        style={{marginBottom: '15px'}}
                    >
                        {tabs.map(tab => (
                            <option key={tab} value={tab}>{tab}</option>
                        ))}
                         {/* הוספת אפשרות ליצור טאב חדש דרך העריכה */}
                         <option value={newTabName || 'חדש...'}>+ טאב חדש...</option>
                    </select>
                </>
            )}
            {modalType === 'visuals' && (
                 <>
                    <label style={{color:'#94a3b8', fontSize:'0.9rem'}}>תמונה (אופציונלי)</label>
                    <input value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})} className={styles.input} />
                 </>
            )}
            <div className={styles.modalButtons}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                <button type="submit" className={styles.btnPrimary}>שמור</button>
            </div>
          </form>
        </div>
      )}

      {/* --- Rename Tab Modal --- */}
      {isRenameTabModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsRenameTabModalOpen(false)}>
          <form className={styles.modal} onSubmit={handleRenameTabSubmit}>
            <h2 style={{color:'white', marginBottom:'20px'}}>שינוי שם טאב</h2>
            <input 
                value={newNameForTab} 
                onChange={e => setNewNameForTab(e.target.value)} 
                className={styles.input} 
                autoFocus
                required 
            />
            <div className={styles.modalButtons}>
                <button type="button" onClick={() => setIsRenameTabModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                <button type="submit" className={styles.btnPrimary}>שמור</button>
            </div>
          </form>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsDeleteModalOpen(false)}>
          <div className={styles.modal} style={{textAlign: 'center'}}>
            <h3>מחיקת פריט</h3>
            <p style={{color:'#94a3b8', margin:'10px 0 20px'}}>בטוח? אי אפשר להתחרט אחר כך.</p>
            <div className={styles.modalButtons}>
                <button onClick={() => setIsDeleteModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                <button onClick={confirmDelete} className={styles.btnDanger}>מחק</button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
          <div className={styles.contextMenu} style={{ top: contextMenu.y, left: contextMenu.x }}>
              <div className={styles.contextMenuItem} onClick={openRenameTabModal}>
                  <Pencil size={14} /> שנה שם
              </div>
              <div className={`${styles.contextMenuItem} ${styles.deleteItem}`} onClick={deleteTab}>
                  <Trash2 size={14} /> מחק טאב
              </div>
          </div>
      )}

    </main>
  );
}