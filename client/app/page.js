'use client';
import { useState, useEffect } from 'react';
import { 
  Info, Plus, Trash2, Edit2, Link as LinkIcon, Pencil 
} from 'lucide-react'; 
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy, 
  rectSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './page.module.css';

const API_URL = 'https://command-center-6pqx.onrender.com/api/data';
const REORDER_URL = 'https://command-center-6pqx.onrender.com/api/data/reorder';
const RENAME_TAB_URL = 'https://command-center-6pqx.onrender.com/api/tabs/rename';

// --- רכיב עזר לפריט נגרר (Sortable Item) ---
function SortableItem({ id, children, className, style }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    
    const dndStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...style
    };

    return (
        <div ref={setNodeRef} style={dndStyle} {...attributes} {...listeners} className={className}>
            {children}
        </div>
    );
}

// --- פונקציית צבעים רנדומליים (אך עקביים לפי טקסט) ---
const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
};

// פלטת צבעי ניאון לטאבים ולכפתורים
const neonColors = ['#ff00ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000', '#3b82f6', '#8b5cf6', '#f43f5e'];
const getRandomNeon = (id) => {
    const index = id.charCodeAt(0) % neonColors.length;
    return neonColors[index];
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [tabs, setTabs] = useState([]); 
  const [activeTab, setActiveTab] = useState('');
  
  // States for Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('docs'); 
  const [editingItemId, setEditingItemId] = useState(null); 
  const [formData, setFormData] = useState({ title: '', value: '', imageUrl: '', category: '' });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const [contextMenu, setContextMenu] = useState(null);
  
  // Tab Rename
  const [isRenameTabModalOpen, setIsRenameTabModalOpen] = useState(false);
  const [tabToRename, setTabToRename] = useState('');
  const [newNameForTab, setNewNameForTab] = useState('');

  // Add Tab
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  // DND Sensors (גרירה)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), // מרחק מינימלי למנוע קליקים בטעות
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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
        // מיון לפי הסדר (Order)
        const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(sortedData);

        const docItems = sortedData.filter(i => i.section === 'docs' || !i.section);
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

  // --- לוגיקת גרירה (Drag End) ---
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // מציאת הפריט הישן והחדש
    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);

    // עדכון מקומי מהיר (כדי שהמשתמש יראה מיד)
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    // שמירה בשרת
    // אנחנו שולחים רק את ה-ID והמיקום החדש שלו לכל המערך
    const reorderPayload = newItems.map((item, index) => ({
        _id: item._id,
        order: index
    }));

    try {
        await fetch(REORDER_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: reorderPayload })
        });
    } catch (e) {
        console.error("Failed to save order", e);
    }
  };

  // ... (שאר הפונקציות: handleSave, openAddModal וכו' נשארות ללא שינוי)
  // לצורך הקיצור לא העתקתי את הכל שוב, אבל אתה צריך את כל הפונקציות מהקוד הקודם (handleSave, confirmDelete, וכו')
  // הנה ה-handleSave לדוגמה (כי הוא קריטי):
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
      category: categoryToSend,
      order: items.length // מוסיף לסוף הרשימה
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
            if (!tabs.includes(categoryToSend) && modalType === 'docs') setActiveTab(categoryToSend);
        }
    } catch (e) { console.error(e); }
  };

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
          if (!tabs.includes(newTabName)) setTabs([...tabs, newTabName]);
          setActiveTab(newTabName);
          setNewTabName('');
          setIsAddingTab(false);
      }
  };

  const handleTabContextMenu = (e, tab) => {
      e.preventDefault();
      setContextMenu({ x: e.pageX, y: e.pageY, targetName: tab });
  };
  
  const openRenameTabModal = () => {
      if (!contextMenu?.targetName) return;
      setTabToRename(contextMenu.targetName);
      setNewNameForTab(contextMenu.targetName);
      setIsRenameTabModalOpen(true);
      setContextMenu(null);
  };

  const handleRenameTabSubmit = async (e) => {
      e.preventDefault();
      if (!newNameForTab.trim() || newNameForTab === tabToRename) { setIsRenameTabModalOpen(false); return; }
      try {
          const res = await fetch(RENAME_TAB_URL, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ oldName: tabToRename, newName: newNameForTab }),
          });
          if (res.ok) {
              await fetchData();
              if (activeTab === tabToRename) setActiveTab(newNameForTab);
              setIsRenameTabModalOpen(false);
          }
      } catch (error) { console.error(error); }
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

  // פילטורים
  const currentTabItems = items.filter(i => i.section === 'docs' && (i.category === activeTab || (!i.category && activeTab === 'כללי')));
  const quickAccessItems = items.filter(i => i.section === 'buttons');
  const visualsItems = items.filter(i => i.section === 'visuals');

  return (
    <main className={styles.main}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        
        <div className={styles.headerWrapper}>
            <div className={styles.infoIconWrapper}>
                <Info size={24} />
                <div className={styles.versionTooltip}>גרסה 2.0 - גרירה וצבע</div>
            </div>
            <div style={{textAlign: 'center'}}>
                <h1 className={styles.title}>מרכז שליטה</h1>
                <div className={styles.subtitle}>PERSONAL DASHBOARD V6.0</div>
            </div>
        </div>

        {/* --- Tabs ( עם צבעים רנדומליים לקו התחתון) --- */}
        <div className={styles.tabsContainer}>
            {tabs.map(tab => {
                const isActive = activeTab === tab;
                const tabColor = getRandomNeon(tab);
                return (
                    <button 
                        key={tab} 
                        className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
                        style={isActive ? { borderColor: tabColor, color: '#fff' } : {}}
                        onClick={() => setActiveTab(tab)}
                        onContextMenu={(e) => handleTabContextMenu(e, tab)}
                    >
                        {tab}
                    </button>
                );
            })}
            {isAddingTab ? (
                <input autoFocus className={styles.newTabInput} value={newTabName} onChange={e => setNewTabName(e.target.value)} onBlur={handleAddTab} onKeyDown={e => e.key === 'Enter' && handleAddTab()} placeholder="שם..." />
            ) : (
                <button className={styles.addTabBtn} onClick={() => setIsAddingTab(true)}><Plus size={18} /></button>
            )}
        </div>

        {/* --- List Area (Draggable) --- */}
        <section className={styles.contentArea}>
            <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>{activeTab || 'רשימה'}</h2>
                <button className={styles.addItemBtn} onClick={() => openAddModal('docs')}><Plus size={18} /> פריט חדש</button>
            </div>

            <div className={styles.itemsList}>
                <SortableContext items={currentTabItems.map(i => i._id)} strategy={verticalListSortingStrategy}>
                    {currentTabItems.map(item => (
                        <SortableItem key={item._id} id={item._id} className={styles.itemRow}>
                            <div style={{display:'flex', alignItems:'center', gap:'15px', flex: 1}}>
                                <span style={{cursor: 'grab', color: '#475569'}}>⋮⋮</span>
                                <LinkIcon size={16} color="#3b82f6" />
                                <a href={item.value} target="_blank" style={{color:'inherit', textDecoration:'none', fontSize:'1.1rem'}}>{item.title}</a>
                            </div>
                            <div className={styles.itemActions}>
                                <button className={styles.actionBtn} onClick={() => openEditModal(item)}><Edit2 size={16} /></button>
                                <button className={`${styles.actionBtn} ${styles.deleteAction}`} onClick={() => { setItemToDelete(item._id); setIsDeleteModalOpen(true); }}><Trash2 size={16} /></button>
                            </div>
                        </SortableItem>
                    ))}
                </SortableContext>
                {currentTabItems.length === 0 && <p style={{textAlign:'center', color:'#666'}}>ריק כאן...</p>}
            </div>
        </section>

        <div className={styles.divider}></div>

        {/* --- Quick Access (Draggable + Random Borders) --- */}
        <div className={styles.quickAccessContainer}>
            <SortableContext items={quickAccessItems.map(i => i._id)} strategy={rectSortingStrategy}>
                {quickAccessItems.map(item => {
                    const borderColor = getRandomNeon(item.title); // צבע לפי שם
                    return (
                        <SortableItem key={item._id} id={item._id} className={styles.quickBtn} style={{borderColor: borderColor}}>
                             <img src={getImage(item.value)} style={{width:16, height:16, borderRadius:'50%'}} alt="" />
                             {item.title}
                             <button style={{marginLeft:'5px', background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:'0.8rem'}} onClick={(e) => { e.preventDefault(); openEditModal(item); }}>✎</button>
                        </SortableItem>
                    );
                })}
            </SortableContext>
            {quickAccessItems.length < 8 && <button className={styles.addQuickBtn} onClick={() => openAddModal('buttons')}><Plus size={20} /></button>}
        </div>

        {/* --- Visuals (Draggable) --- */}
        <div className={styles.visualsGrid}>
            <SortableContext items={visualsItems.map(i => i._id)} strategy={rectSortingStrategy}>
                {visualsItems.map(item => (
                    <SortableItem key={item._id} id={item._id} style={{position:'relative'}}>
                         <a href={item.value} target="_blank" className={styles.visualCard}>
                            <img src={getImage(item.value, item.imageUrl)} className={styles.visualImg} alt={item.title} />
                            <div className={styles.visualOverlay}>{item.title}</div>
                        </a>
                        <button style={{position:'absolute', top:5, left:5, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', padding:5, cursor:'pointer', color:'white', zIndex:10}} onClick={(e) => { e.preventDefault(); openEditModal(item); }}><Edit2 size={14} /></button>
                    </SortableItem>
                ))}
            </SortableContext>
             <button className={styles.visualCard} style={{background: 'rgba(255,255,255,0.05)', border:'2px dashed #334155', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b'}} onClick={() => openAddModal('visuals')}><Plus size={40} /></button>
        </div>

      </DndContext>

      {/* --- Modals --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <form className={styles.modal} onSubmit={handleSave}>
            <h2 style={{color:'white', marginBottom:'20px'}}>{editingItemId ? 'עריכה' : 'חדש'}</h2>
            <input value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className={styles.input} placeholder="כותרת" required />
            <input value={formData.value} onChange={e=>setFormData({...formData, value: e.target.value})} className={styles.input} placeholder="URL" required />
            {modalType === 'docs' && (
                <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className={styles.select}>
                    {tabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                    <option value={newTabName || 'חדש...'}>+ טאב חדש...</option>
                </select>
            )}
             {modalType === 'visuals' && <input value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})} className={styles.input} placeholder="תמונה" />}
            <div className={styles.modalButtons}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                <button type="submit" className={styles.btnPrimary}>שמור</button>
            </div>
          </form>
        </div>
      )}
      
      {/* שאר המודלים (מחיקה, שינוי שם טאב) נשארים זהים למה שהיה קודם... תוודא שהם קיימים בקוד שלך */}
       {isRenameTabModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsRenameTabModalOpen(false)}>
          <form className={styles.modal} onSubmit={handleRenameTabSubmit}>
            <h2 style={{color:'white', marginBottom:'20px'}}>שינוי שם טאב</h2>
            <input value={newNameForTab} onChange={e => setNewNameForTab(e.target.value)} className={styles.input} autoFocus required />
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
            <h3>למחוק?</h3>
            <div className={styles.modalButtons}>
                <button onClick={() => setIsDeleteModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                <button onClick={confirmDelete} className={styles.btnDanger}>מחק</button>
            </div>
          </div>
        </div>
      )}

      {contextMenu && (
          <div className={styles.contextMenu} style={{ top: contextMenu.y, left: contextMenu.x }}>
              <div className={styles.contextMenuItem} onClick={openRenameTabModal}><Pencil size={14} /> שנה שם</div>
              <div className={`${styles.contextMenuItem} ${styles.deleteItem}`} onClick={deleteTab}><Trash2 size={14} /> מחק טאב</div>
          </div>
      )}

    </main>
  );
}