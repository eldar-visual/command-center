'use client';
import { useState, useEffect } from 'react';
import { 
  Info, Plus, Trash2, Edit2, Link as LinkIcon, Pencil, Upload 
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
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import styles from './page.module.css';

const API_URL = 'https://command-center-6pqx.onrender.com/api/data';
const REORDER_URL = 'https://command-center-6pqx.onrender.com/api/data/reorder';
const RENAME_TAB_URL = 'https://command-center-6pqx.onrender.com/api/tabs/rename';

const APP_VERSION = "1.0.2"; 

// --- רכיב עזר לפריט נגרר ---
function SortableItem({ id, children, className, style, ...props }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
    const dndStyle = {
        transform: CSS.Transform.toString(transform),
        transition,
        ...style
    };
    return (
        <div ref={setNodeRef} style={dndStyle} {...attributes} {...listeners} className={className} {...props}>
            {children}
        </div>
    );
}

const pastelColors = ['#fca5a5', '#fdba74', '#fde047', '#86efac', '#67e8f9', '#93c5fd', '#c4b5fd', '#f9a8d4'];
const getRandomPastel = (id) => {
    const index = id.length % pastelColors.length;
    return pastelColors[index];
};

export default function Home() {
  const [items, setItems] = useState([]);
  const [tabs, setTabs] = useState([]); 
  const [activeTab, setActiveTab] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('docs'); 
  const [editingItemId, setEditingItemId] = useState(null); 
  const [formData, setFormData] = useState({ title: '', value: '', imageUrl: '', category: '' });
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  
  // Tab Rename & Add
  const [isRenameTabModalOpen, setIsRenameTabModalOpen] = useState(false);
  const [tabToRename, setTabToRename] = useState('');
  const [newNameForTab, setNewNameForTab] = useState('');
  const [isAddingTab, setIsAddingTab] = useState(false);
  const [newTabName, setNewTabName] = useState('');

  // Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
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
        const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setItems(sortedData);

        // חישוב טאבים מתוך פריטי Docs וגם Visuals (כי עכשיו גם Visuals שייכים לטאבים)
        const tabItems = sortedData.filter(i => (i.section === 'docs' || i.section === 'visuals') || !i.section);
        const uniqueCategories = new Set(tabItems.map(i => i.category || 'כללי'));
        let calculatedTabs = Array.from(uniqueCategories).sort();

        const savedTabOrder = localStorage.getItem('tabsOrder');
        if (savedTabOrder) {
            const order = JSON.parse(savedTabOrder);
            calculatedTabs.sort((a, b) => {
                const indexA = order.indexOf(a);
                const indexB = order.indexOf(b);
                if (indexA === -1) return 1;
                if (indexB === -1) return -1;
                return indexA - indexB;
            });
        }
        
        setTabs(calculatedTabs);
        setActiveTab(prev => {
            if (calculatedTabs.includes(prev)) return prev;
            return calculatedTabs.length > 0 ? calculatedTabs[0] : '';
        });
      }
    } catch (error) { console.error("Error:", error); }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    if (tabs.includes(active.id)) {
        const oldIndex = tabs.indexOf(active.id);
        const newIndex = tabs.indexOf(over.id);
        const newTabs = arrayMove(tabs, oldIndex, newIndex);
        setTabs(newTabs);
        localStorage.setItem('tabsOrder', JSON.stringify(newTabs));
        return;
    }

    const oldIndex = items.findIndex((i) => i._id === active.id);
    const newIndex = items.findIndex((i) => i._id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    const reorderPayload = newItems.map((item, index) => ({ _id: item._id, order: index }));
    try {
        await fetch(REORDER_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: reorderPayload })
        });
    } catch (e) { console.error("Failed to save order", e); }
  };

  const handleImageUpload = (e) => {
      const file = e.target.files[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setFormData({ ...formData, imageUrl: reader.result });
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.value) return;
    let formattedUrl = formData.value.startsWith('http') ? formData.value : `https://${formData.value}`;
    
    // אם לא נבחרה קטגוריה (כמו בגישה מהירה), נשתמש ב'כללי' או בטאב הנוכחי
    const categoryToSend = formData.category || (modalType === 'buttons' ? 'general' : activeTab);
    
    const payload = {
      title: formData.title,
      value: formattedUrl,
      section: modalType === 'visuals' ? 'visuals' : modalType === 'buttons' ? 'buttons' : 'docs',
      imageUrl: formData.imageUrl,
      category: categoryToSend,
      order: items.length
    };

    try {
        let res;
        const method = editingItemId ? 'PUT' : 'POST';
        const url = editingItemId ? `${API_URL}/${editingItemId}` : API_URL;
        
        res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            await fetchData();
            setIsModalOpen(false);
            setEditingItemId(null);
            // אם הוספנו פריט לטאב שעדיין לא קיים (וזה לא כפתור גלובלי)
            if (modalType !== 'buttons' && !tabs.includes(categoryToSend)) {
                setActiveTab(categoryToSend);
            }
        }
    } catch (e) { console.error(e); }
  };

  const openAddModal = (type) => {
      setEditingItemId(null); 
      setModalType(type);
      // אם אנחנו מוסיפים רשימה או מועדף ויזואלי - זה הולך לטאב הנוכחי. כפתורים הולכים לכללי.
      const defaultCategory = (type === 'docs' || type === 'visuals') ? (activeTab || 'כללי') : 'כללי';
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
          if (!tabs.includes(newTabName)) {
              const newTabs = [...tabs, newTabName];
              setTabs(newTabs);
              localStorage.setItem('tabsOrder', JSON.stringify(newTabs));
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
      const newTabs = tabs.filter(t => t !== tabToDelete);
      setTabs(newTabs);
      localStorage.setItem('tabsOrder', JSON.stringify(newTabs));
      if (activeTab === tabToDelete) setActiveTab(newTabs[0] || '');
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

  // --- סינון הפריטים לפי הטאב הפעיל ---
  const currentTabItems = items.filter(i => i.section === 'docs' && (i.category === activeTab || (!i.category && activeTab === 'כללי')));
  
  // התיקון כאן: גם Visuals מסוננים עכשיו לפי טאב!
  const currentTabVisuals = items.filter(i => i.section === 'visuals' && (i.category === activeTab || (!i.category && activeTab === 'כללי')));
  
  // כפתורים נשארים גלובליים
  const quickAccessItems = items.filter(i => i.section === 'buttons');

  return (
    <main className={styles.main}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        
        <div className={styles.headerWrapper}>
            <div className={styles.infoIconWrapper}>
                <Info size={24} />
                <div className={styles.versionTooltip}>גרסה {APP_VERSION}</div>
            </div>
            <div style={{textAlign: 'center'}}>
                <h1 className={styles.title}>מרכז שליטה</h1>
            </div>
        </div>

        {/* --- Tabs --- */}
        <div className={styles.tabsContainer}>
            <SortableContext items={tabs} strategy={horizontalListSortingStrategy}>
                {tabs.map(tab => {
                    const isActive = activeTab === tab;
                    const tabColor = getRandomPastel(tab);
                    return (
                        <SortableItem key={tab} id={tab} className={`${styles.tab} ${isActive ? styles.activeTab : ''}`} 
                                      style={isActive ? { borderColor: tabColor, color: '#fff' } : {}}>
                            <div onClick={() => setActiveTab(tab)} onContextMenu={(e) => handleTabContextMenu(e, tab)} style={{width:'100%', height:'100%'}}>
                                {tab}
                            </div>
                        </SortableItem>
                    );
                })}
            </SortableContext>
            
            {isAddingTab ? (
                <input autoFocus className={styles.newTabInput} value={newTabName} onChange={e => setNewTabName(e.target.value)} onBlur={handleAddTab} onKeyDown={e => e.key === 'Enter' && handleAddTab()} placeholder="שם..." />
            ) : (
                <button className={styles.addTabBtn} onClick={() => setIsAddingTab(true)}><Plus size={18} /></button>
            )}
        </div>

        {/* --- List Area --- */}
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

        {/* --- Quick Access (Global) --- */}
        <div className={styles.quickAccessContainer}>
            <SortableContext items={quickAccessItems.map(i => i._id)} strategy={rectSortingStrategy}>
                {quickAccessItems.map(item => {
                    const borderColor = getRandomPastel(item.title);
                    return (
                        <SortableItem 
                            key={item._id} 
                            id={item._id} 
                            className={styles.quickBtn} 
                            style={{borderColor: borderColor, cursor: 'pointer'}} 
                            onClick={() => window.open(item.value, '_blank')} 
                        >
                             <img src={getImage(item.value)} style={{width:16, height:16, borderRadius:'50%'}} alt="" />
                             {item.title}
                             <button 
                                style={{marginLeft:'5px', background:'none', border:'none', cursor:'pointer', color:'#64748b', fontSize:'0.8rem'}} 
                                onClick={(e) => { 
                                    e.preventDefault(); 
                                    e.stopPropagation(); 
                                    openEditModal(item); 
                                }}>
                                ✎
                             </button>
                        </SortableItem>
                    );
                })}
            </SortableContext>
            {quickAccessItems.length < 8 && <button className={styles.addQuickBtn} onClick={() => openAddModal('buttons')}><Plus size={20} /></button>}
        </div>

        {/* --- Visuals (Tab Specific) --- */}
        <div className={styles.visualsGrid}>
            <SortableContext items={currentTabVisuals.map(i => i._id)} strategy={rectSortingStrategy}>
                {currentTabVisuals.map(item => (
                    <SortableItem key={item._id} id={item._id} style={{position:'relative'}}>
                         <a href={item.value} target="_blank" className={styles.visualCard}>
                            <img src={getImage(item.value, item.imageUrl)} className={styles.visualImg} alt={item.title} />
                            <div className={styles.visualTitle}>{item.title}</div>
                        </a>
                        <button style={{position:'absolute', top:5, left:5, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', padding:5, cursor:'pointer', color:'white', zIndex:10}} onClick={(e) => { e.preventDefault(); openEditModal(item); }}><Edit2 size={14} /></button>
                    </SortableItem>
                ))}
            </SortableContext>
             <button className={styles.visualCard} style={{background: 'rgba(255,255,255,0.02)', border:'2px dashed #334155', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748b', minHeight:'150px'}} onClick={() => openAddModal('visuals')}><Plus size={40} /></button>
        </div>

      </DndContext>

      {/* --- Modals (ללא שינוי, למעט זה שעכשיו Visuals יקבלו את הקטגוריה) --- */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}>
          <form className={styles.modal} onSubmit={handleSave}>
            <h2 style={{color:'white', marginBottom:'20px'}}>{editingItemId ? 'עריכה' : 'חדש'}</h2>
            
            <input value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} className={styles.input} placeholder="כותרת" required />
            <input value={formData.value} onChange={e=>setFormData({...formData, value: e.target.value})} className={styles.input} placeholder="URL" required />
            
            {(modalType === 'docs' || modalType === 'visuals') && (
                <select value={formData.category} onChange={e=>setFormData({...formData, category: e.target.value})} className={styles.select}>
                    {tabs.map(tab => <option key={tab} value={tab}>{tab}</option>)}
                    <option value={newTabName || 'חדש...'}>+ טאב חדש...</option>
                </select>
            )}
            
            {modalType === 'visuals' && (
                <div style={{marginBottom:'15px'}}>
                    <input value={formData.imageUrl} onChange={e=>setFormData({...formData, imageUrl: e.target.value})} className={styles.input} placeholder="URL תמונה (או העלה קובץ למטה)" />
                    <div style={{position: 'relative', overflow: 'hidden', display: 'inline-block'}}>
                        <button type="button" className={styles.btnSecondary} style={{display:'flex', gap:'5px', alignItems:'center'}}>
                            <Upload size={16} /> העלה תמונה מהמחשב
                        </button>
                        <input type="file" accept="image/*" onChange={handleImageUpload} style={{position: 'absolute', left: 0, top: 0, opacity: 0, width:'100%', height:'100%', cursor:'pointer'}} />
                    </div>
                    {formData.imageUrl && formData.imageUrl.startsWith('data:') && <p style={{fontSize:'0.8rem', color:'#86efac', marginTop:'5px'}}>תמונה נבחרה בהצלחה!</p>}
                </div>
            )}

            <div className={styles.modalButtons}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.btnSecondary}>ביטול</button>
                <button type="submit" className={styles.btnPrimary}>שמור</button>
            </div>
          </form>
        </div>
      )}
      
       {/* (שאר המודלים... זהים לקודם) */}
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