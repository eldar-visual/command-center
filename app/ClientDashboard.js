'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Search, Settings, Menu, LogOut, Folder,
  Star, FileText, Play, ExternalLink, ChevronLeft, LayoutGrid, X,
  Edit, Trash2, Pin, MoveRight, Info, RotateCcw,
  Home, Briefcase, Camera, Code, Book, Music, Video, Image as ImageIcon, 
  Mic, Heart, Cloud, Shield, Zap, Target, Umbrella, Coffee, Globe, Key, MapPin,
  FileSpreadsheet, Presentation, File,
  Sun, Moon, Palette 
} from 'lucide-react';

import { DndContext, closestCenter, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors, DragOverlay } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, rectSortingStrategy, horizontalListSortingStrategy, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import styles from './page.module.css';

const ICONS_MAP = { Folder, Home, Briefcase, Camera, Code, Book, Music, Video, ImageIcon, Mic, Heart, Star, Cloud, Shield, Zap, Target, Umbrella, Coffee, Globe, Key, MapPin };
const AVAILABLE_COLORS = ['#ffffff', '#94a3b8', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

const THEMES = {
  'dark-gray': { '--bg-main': '#0f111a', '--bg-sidebar': '#1e293b', '--bg-card': '#1e293b', '--bg-hover': 'rgba(255, 255, 255, 0.05)', '--border-color': '#334155', '--text-main': '#f8fafc', '--text-secondary': '#cbd5e1', '--text-muted': '#64748b', '--brand-color': '#38bdf8', '--card-float-bg': 'rgba(255, 255, 255, 0.02)', '--card-float-border': 'rgba(255, 255, 255, 0.05)', '--shadow-color': 'rgba(0,0,0,0.5)', '--modal-overlay': 'rgba(15, 17, 26, 0.8)', '--placeholder-bg': '#334155', '--play-overlay': 'rgba(0,0,0,0.4)' },
  'light-gray': { '--bg-main': '#f8fafc', '--bg-sidebar': '#ffffff', '--bg-card': '#ffffff', '--bg-hover': 'rgba(0, 0, 0, 0.04)', '--border-color': '#e2e8f0', '--text-main': '#0f172a', '--text-secondary': '#334155', '--text-muted': '#64748b', '--brand-color': '#0ea5e9', '--card-float-bg': '#ffffff', '--card-float-border': '#e2e8f0', '--shadow-color': 'rgba(0,0,0,0.06)', '--modal-overlay': 'rgba(255, 255, 255, 0.8)', '--placeholder-bg': '#e2e8f0', '--play-overlay': 'rgba(255,255,255,0.4)' },
  'dark-blue': { '--bg-main': '#020617', '--bg-sidebar': '#0f172a', '--bg-card': '#0f172a', '--bg-hover': 'rgba(56, 189, 248, 0.1)', '--border-color': '#1e293b', '--text-main': '#f0f9ff', '--text-secondary': '#bae6fd', '--text-muted': '#38bdf8', '--brand-color': '#38bdf8', '--card-float-bg': 'rgba(56, 189, 248, 0.02)', '--card-float-border': 'rgba(56, 189, 248, 0.1)', '--shadow-color': 'rgba(0,0,0,0.6)', '--modal-overlay': 'rgba(2, 6, 23, 0.8)', '--placeholder-bg': '#1e293b', '--play-overlay': 'rgba(0,0,0,0.5)' },
  'light-blue': { '--bg-main': '#f0f9ff', '--bg-sidebar': '#e0f2fe', '--bg-card': '#ffffff', '--bg-hover': 'rgba(2, 132, 199, 0.06)', '--border-color': '#bae6fd', '--text-main': '#0c4a6e', '--text-secondary': '#0369a1', '--text-muted': '#0284c7', '--brand-color': '#0284c7', '--card-float-bg': '#ffffff', '--card-float-border': '#bae6fd', '--shadow-color': 'rgba(2, 132, 199, 0.08)', '--modal-overlay': 'rgba(240, 249, 255, 0.8)', '--placeholder-bg': '#e0f2fe', '--play-overlay': 'rgba(255,255,255,0.5)' },
  'dark-purple': { '--bg-main': '#150b24', '--bg-sidebar': '#1f1238', '--bg-card': '#1f1238', '--bg-hover': 'rgba(168, 85, 247, 0.15)', '--border-color': '#331e54', '--text-main': '#faf5ff', '--text-secondary': '#e9d5ff', '--text-muted': '#c084fc', '--brand-color': '#c084fc', '--card-float-bg': 'rgba(168, 85, 247, 0.03)', '--card-float-border': 'rgba(168, 85, 247, 0.15)', '--shadow-color': 'rgba(0,0,0,0.6)', '--modal-overlay': 'rgba(21, 11, 36, 0.8)', '--placeholder-bg': '#331e54', '--play-overlay': 'rgba(0,0,0,0.5)' },
  'light-purple': { '--bg-main': '#faf5ff', '--bg-sidebar': '#f3e8ff', '--bg-card': '#ffffff', '--bg-hover': 'rgba(147, 51, 234, 0.06)', '--border-color': '#e9d5ff', '--text-main': '#3b0764', '--text-secondary': '#581c87', '--text-muted': '#7e22ce', '--brand-color': '#9333ea', '--card-float-bg': '#ffffff', '--card-float-border': '#e9d5ff', '--shadow-color': 'rgba(147, 51, 234, 0.08)', '--modal-overlay': 'rgba(250, 245, 255, 0.8)', '--placeholder-bg': '#f3e8ff', '--play-overlay': 'rgba(255,255,255,0.5)' },
  'dark-green': { '--bg-main': '#021a10', '--bg-sidebar': '#063622', '--bg-card': '#063622', '--bg-hover': 'rgba(16, 185, 129, 0.15)', '--border-color': '#0b5e3f', '--text-main': '#ecfdf5', '--text-secondary': '#a7f3d0', '--text-muted': '#34d399', '--brand-color': '#10b981', '--card-float-bg': 'rgba(16, 185, 129, 0.02)', '--card-float-border': 'rgba(16, 185, 129, 0.15)', '--shadow-color': 'rgba(0,0,0,0.6)', '--modal-overlay': 'rgba(2, 26, 16, 0.8)', '--placeholder-bg': '#0b5e3f', '--play-overlay': 'rgba(0,0,0,0.5)' },
  'light-green': { '--bg-main': '#ecfdf5', '--bg-sidebar': '#d1fae5', '--bg-card': '#ffffff', '--bg-hover': 'rgba(5, 150, 105, 0.06)', '--border-color': '#a7f3d0', '--text-main': '#022c22', '--text-secondary': '#064e3b', '--text-muted': '#059669', '--brand-color': '#059669', '--card-float-bg': '#ffffff', '--card-float-border': '#a7f3d0', '--shadow-color': 'rgba(5, 150, 105, 0.08)', '--modal-overlay': 'rgba(236, 253, 245, 0.8)', '--placeholder-bg': '#d1fae5', '--play-overlay': 'rgba(255,255,255,0.5)' },
  'dark-red': { '--bg-main': '#1f0909', '--bg-sidebar': '#381010', '--bg-card': '#381010', '--bg-hover': 'rgba(239, 68, 68, 0.15)', '--border-color': '#5c1b1b', '--text-main': '#fef2f2', '--text-secondary': '#fecaca', '--text-muted': '#f87171', '--brand-color': '#ef4444', '--card-float-bg': 'rgba(239, 68, 68, 0.02)', '--card-float-border': 'rgba(239, 68, 68, 0.15)', '--shadow-color': 'rgba(0,0,0,0.6)', '--modal-overlay': 'rgba(31, 9, 9, 0.8)', '--placeholder-bg': '#5c1b1b', '--play-overlay': 'rgba(0,0,0,0.5)' },
  'light-red': { '--bg-main': '#fef2f2', '--bg-sidebar': '#fee2e2', '--bg-card': '#ffffff', '--bg-hover': 'rgba(220, 38, 38, 0.06)', '--border-color': '#fca5a5', '--text-main': '#450a0a', '--text-secondary': '#7f1d1d', '--text-muted': '#dc2626', '--brand-color': '#dc2626', '--card-float-bg': '#ffffff', '--card-float-border': '#fca5a5', '--shadow-color': 'rgba(220, 38, 38, 0.08)', '--modal-overlay': 'rgba(254, 242, 242, 0.8)', '--placeholder-bg': '#fee2e2', '--play-overlay': 'rgba(255,255,255,0.5)' }
};

const getDocIconProps = (url) => {
  if (!url) return { Icon: FileText, color: "var(--brand-color)", bg: "var(--bg-hover)" };
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes('spreadsheets') || lowerUrl.includes('excel')) { return { Icon: FileSpreadsheet, color: "#10b981", bg: "rgba(16, 185, 129, 0.1)" }; }
  if (lowerUrl.includes('presentation') || lowerUrl.includes('slides')) { return { Icon: Presentation, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.1)" }; }
  if (lowerUrl.includes('.pdf')) { return { Icon: File, color: "#ef4444", bg: "rgba(239, 68, 68, 0.1)" }; }
  return { Icon: FileText, color: "var(--brand-color)", bg: "var(--bg-hover)" }; 
};

const defaultGlobalFavorites = [
  { _id: 'g1', title: 'ג׳ימיני', link: 'https://gemini.google.com', section: 'links', isFavorite: true, isPinnedToMain: true, isGlobal: true },
  { _id: 'g2', title: 'Chat GPT', link: 'https://chatgpt.com', section: 'links', isFavorite: true, isPinnedToMain: true, isGlobal: true },
  { _id: 'g3', title: 'Claude', link: 'https://claude.ai', section: 'links', isFavorite: true, isPinnedToMain: true, isGlobal: true },
  { _id: 'g4', title: 'YouTube', link: 'https://youtube.com', section: 'links', isFavorite: true, isPinnedToMain: true, isGlobal: true },
  { _id: 'g5', title: 'Google', link: 'https://google.com', section: 'links', isFavorite: true, isPinnedToMain: true, isGlobal: true },
  { _id: 'g6', title: 'Google Drive', link: 'https://drive.google.com', section: 'links', isFavorite: true, isPinnedToMain: true, isGlobal: true },
  { _id: 'g7', title: 'Gmail', link: 'https://mail.google.com', section: 'links', isFavorite: true, isPinnedToMain: true, isGlobal: true },
  { _id: 'g8', title: 'Facebook', link: 'https://facebook.com', section: 'links', isFavorite: true, isPinnedToMain: true, isGlobal: true }
];

const defaultSpace = { _id: 'default', name: 'אישי', iconName: 'Home', color: 'var(--brand-color)', customTabs: ['יצירה'] };

function SortableItem({ id, children, className, style, onContextMenu, href, onClick }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const combinedStyle = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.15 : 1, zIndex: isDragging ? 0 : 'auto', position: 'relative', cursor: isDragging ? 'grabbing' : 'pointer', ...style };
  const handleClick = (e) => { if (e.defaultPrevented) return; if (onClick) { onClick(e); } else if (href) { window.open(href, '_blank', 'noopener,noreferrer'); } };
  return ( <div ref={setNodeRef} style={combinedStyle} {...attributes} {...listeners} className={className} onContextMenu={onContextMenu} onClick={handleClick}>{children}</div> );
}

export default function ClientDashboard({ initialItems = [], initialSpaces = [], user = { name: 'אורח', role: 'user' } }) {
  const tabsScrollRef = useRef(null);
  const scrollTabsLeft = () => { if (tabsScrollRef.current) { tabsScrollRef.current.scrollBy({ left: -150, behavior: 'smooth' }); } };
  const router = useRouter();
  
  const [isMounted, setIsMounted] = useState(false);
  const [themeMode, setThemeMode] = useState('dark'); 
  const [themeTint, setThemeTint] = useState('blue'); 
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleModeChange = (mode) => { setThemeMode(mode); localStorage.setItem('dash_theme_mode', mode); };
  const handleTintChange = (tint) => { setThemeTint(tint); localStorage.setItem('dash_theme_tint', tint); };
  const activeThemeKey = `${themeMode}-${themeTint}`;
  const activeThemeStyles = THEMES[activeThemeKey] || THEMES['dark-blue'];
  
  const fullItems = initialItems.length > 0 ? initialItems : defaultGlobalFavorites;
  const [spaces, setSpaces] = useState(initialSpaces.length > 0 ? initialSpaces : [defaultSpace]);
  const [activeSpace, setActiveSpace] = useState(spaces[0]);
  const [items, setItems] = useState(fullItems);
  
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCustomTab, setActiveCustomTab] = useState(spaces[0]?.customTabs?.[0] || null);
  const [activeCategoryTab, setActiveCategoryTab] = useState('ראשי');

  const [isAddSpaceModalOpen, setAddSpaceModalOpen] = useState(false);
  const [isAddTabModalOpen, setAddTabModalOpen] = useState(false);
  const [isAddItemModalOpen, setAddItemModalOpen] = useState(false);
  const [newItemSection, setNewItemSection] = useState('visuals'); 
  const [newItemData, setNewItemData] = useState({ title: '', link: '' });
  
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, item: null });
  const [spaceContextMenu, setSpaceContextMenu] = useState({ visible: false, x: 0, y: 0, space: null });
  const [tabContextMenu, setTabContextMenu] = useState({ visible: false, x: 0, y: 0, tabName: null });
  
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [editItemData, setEditItemData] = useState({ _id: '', title: '', link: '', section: '', customTab: '' });
  const [isMoveModalOpen, setMoveModalOpen] = useState(false);
  const [itemToMove, setItemToMove] = useState(null);
  const [moveDestination, setMoveDestination] = useState({ spaceId: '', customTab: '' });

  const [isSettingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingSpaceId, setEditingSpaceId] = useState(null);
  const [editSpaceData, setEditSpaceData] = useState({ name: '', iconName: 'Folder', color: 'var(--brand-color)' });
  const [isRenameSpaceModalOpen, setRenameSpaceModalOpen] = useState(false);
  const [isEditTabModalOpen, setEditTabModalOpen] = useState(false);
  const [editTabName, setEditTabName] = useState('');
  const [oldTabName, setOldTabName] = useState('');
  const [newSpaceName, setNewSpaceName] = useState('');
  const [newTabName, setNewTabName] = useState('');

  const [isDeleteSpaceModalOpen, setDeleteSpaceModalOpen] = useState(false);
  const [spaceToDelete, setSpaceToDelete] = useState(null);
  const [isDeleteTabModalOpen, setDeleteTabModalOpen] = useState(false);
  const [tabToDelete, setTabToDelete] = useState(null);
  const [isMaxPinsModalOpen, setMaxPinsModalOpen] = useState(false);

  const [activeDragId, setActiveDragId] = useState(null);
  const [activeOverId, setActiveOverId] = useState(null); 
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  const [isRecycleBinOpen, setIsRecycleBinOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const currentSpaceId = activeSpace?._id || 'default';
  const currentSpaceTabs = activeSpace?.customTabs || [];

  useEffect(() => { 
    setIsMounted(true); 
    if (window.innerWidth <= 768) { setSidebarOpen(false); }
    
    const savedMode = localStorage.getItem('dash_theme_mode');
    const savedTint = localStorage.getItem('dash_theme_tint');
    if (savedMode) setThemeMode(savedMode);
    if (savedTint) setThemeTint(savedTint);

    const savedSpaceId = localStorage.getItem('dash_spaceId');
    const savedTab = localStorage.getItem('dash_tab');
    const savedCategory = localStorage.getItem('dash_category');
    
    let targetSpace = spaces[0]; 
    if (savedSpaceId) {
        const found = spaces.find(s => s._id === savedSpaceId);
        if (found) targetSpace = found;
    }
    
    setActiveSpace(targetSpace);
    
    const spaceTabs = targetSpace?.customTabs || [];
    if (savedTab && savedTab !== 'null' && spaceTabs.includes(savedTab)) { 
        setActiveCustomTab(savedTab); 
    } else if (spaceTabs.length > 0) { 
        setActiveCustomTab(spaceTabs[0]); 
    } else { 
        setActiveCustomTab(null); 
    }

    if (savedCategory) setActiveCategoryTab(savedCategory);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mouseSensor = useSensor(MouseSensor, { activationConstraint: { distance: 5 } });
  const touchSensor = useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } });
  const keyboardSensor = useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates });
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);

  const handleLogout = () => { document.cookie = "isLoggedIn=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"; window.location.href = '/login'; };
  const renderSpaceIcon = (iconName, color, size = 16) => { const IconComponent = ICONS_MAP[iconName] || Folder; return <IconComponent size={size} color={color || 'var(--text-muted)'} />; };
  const getContextMenuPosition = (e, menuWidth = 220, menuHeight = 250) => { const x = e.clientX + menuWidth > window.innerWidth ? window.innerWidth - menuWidth - 10 : e.clientX; const y = e.clientY + menuHeight > window.innerHeight ? window.innerHeight - menuHeight - 10 : e.clientY; return { x, y }; };
  
  const closeContextMenus = () => { setContextMenu({ visible: false, x: 0, y: 0, item: null }); setSpaceContextMenu({ visible: false, x: 0, y: 0, space: null }); setTabContextMenu({ visible: false, x: 0, y: 0, tabName: null }); setShowThemeMenu(false); };

  const handleDragStart = (event) => { setActiveDragId(event.active.id); };
  const handleDragOver = (event) => { const { over } = event; setActiveOverId(over ? over.id : null); };

  const handleUnifiedDragEnd = async (event) => {
    setActiveDragId(null); setActiveOverId(null); 
    const { active, over } = event; if (!over || active.id === over.id) return;
    if (currentSpaceTabs.includes(active.id) && currentSpaceTabs.includes(over.id)) { const oldIndex = currentSpaceTabs.indexOf(active.id); const newIndex = currentSpaceTabs.indexOf(over.id); const updatedTabs = arrayMove(currentSpaceTabs, oldIndex, newIndex); const updatedSpace = { ...activeSpace, customTabs: updatedTabs }; setSpaces(spaces.map(s => s._id === activeSpace._id ? updatedSpace : s)); setActiveSpace(updatedSpace); if (activeSpace._id !== 'default') { try { await fetch(`/api/spaces/${activeSpace._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customTabs: updatedTabs }) }); } catch (error) {} } return; }
    const activeItem = items.find(i => i._id === active.id); const overItem = items.find(i => i._id === over.id);
    if (activeItem && currentSpaceTabs.includes(over.id)) { if (activeItem.section === 'links') return; const targetTab = over.id; if (activeItem.customTab !== targetTab) { setItems(items.map(i => i._id === activeItem._id ? { ...i, customTab: targetTab } : i)); setActiveCustomTab(targetTab); localStorage.setItem('dash_tab', targetTab); if (!activeItem.isGlobal) { try { await fetch(`/api/data/${activeItem._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customTab: targetTab }) }); } catch (error) {} } } return; }
    if (activeItem && overItem) { let filteredArray = []; if (activeCategoryTab === 'ראשי' || activeCategoryTab === 'מועדפים') { if (favArray.find(i => i._id === active.id)) filteredArray = favArray; } if (filteredArray.length === 0 && (activeCategoryTab === 'ראשי' || activeCategoryTab === 'מסמכים')) { if (documentItems.find(i => i._id === active.id)) filteredArray = documentItems; } if (filteredArray.length === 0 && (activeCategoryTab === 'ראשי' || activeCategoryTab === 'סרטונים')) { if (visualItems.find(i => i._id === active.id)) filteredArray = visualItems; }
      if (filteredArray.length > 0) { const oldIndex = filteredArray.findIndex(i => i._id === active.id); const newIndex = filteredArray.findIndex(i => i._id === over.id); if(oldIndex !== -1 && newIndex !== -1) { const reordered = arrayMove(filteredArray, oldIndex, newIndex); const orderUpdates = reordered.map((item, index) => ({ _id: item._id, order: index })); setItems(prev => prev.map(item => { const update = orderUpdates.find(u => u._id === item._id); return update ? { ...item, order: update.order } : item; })); try { await fetch('/api/reorder', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderUpdates) }); } catch (error) {} } } }
  };

  const handleAddCustomTab = async (e) => { 
    e.preventDefault(); if (!newTabName || currentSpaceTabs.includes(newTabName)) return; 
    const updatedTabs = [...currentSpaceTabs, newTabName]; const updatedSpace = { ...activeSpace, customTabs: updatedTabs }; 
    setSpaces(spaces.map(s => s._id === activeSpace._id ? updatedSpace : s)); 
    setActiveSpace(updatedSpace); 
    setActiveCustomTab(newTabName); 
    localStorage.setItem('dash_tab', newTabName); 
    setAddTabModalOpen(false); setNewTabName(''); 
    if (activeSpace._id !== 'default') { fetch(`/api/spaces/${activeSpace._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customTabs: updatedTabs }) }); } 
  };
  
  const openEditTab = () => { setOldTabName(tabContextMenu.tabName); setEditTabName(tabContextMenu.tabName); setEditTabModalOpen(true); closeContextMenus(); };
  
  const handleSaveEditTab = async (e) => { 
    e.preventDefault(); if (!editTabName || editTabName === oldTabName || currentSpaceTabs.includes(editTabName)) { setEditTabModalOpen(false); return; } 
    const updatedTabs = currentSpaceTabs.map(t => t === oldTabName ? editTabName : t); const updatedSpace = { ...activeSpace, customTabs: updatedTabs }; 
    setSpaces(spaces.map(s => s._id === activeSpace._id ? updatedSpace : s)); setActiveSpace(updatedSpace); 
    const itemsToUpdate = items.filter(i => i.spaceId === activeSpace._id && i.customTab === oldTabName); 
    setItems(items.map(i => (i.spaceId === activeSpace._id && i.customTab === oldTabName) ? { ...i, customTab: editTabName } : i)); 
    if (activeCustomTab === oldTabName) {
      setActiveCustomTab(editTabName); 
      localStorage.setItem('dash_tab', editTabName); 
    }
    setEditTabModalOpen(false); 
    if (activeSpace._id !== 'default') { fetch(`/api/spaces/${activeSpace._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customTabs: updatedTabs }) }); Promise.all(itemsToUpdate.map(item => fetch(`/api/data/${item._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ customTab: editTabName }) }))); } 
  };
  
  const handleDeleteTabClick = () => { setTabToDelete(tabContextMenu.tabName); setDeleteTabModalOpen(true); closeContextMenus(); };
  
 const executeDeleteTab = async () => { 
    if (!tabToDelete) return; 
    const updatedTabs = currentSpaceTabs.filter(t => t !== tabToDelete); 
    const updatedSpace = { ...activeSpace, customTabs: updatedTabs }; 
    setSpaces(spaces.map(s => s._id === activeSpace._id ? updatedSpace : s)); 
    setActiveSpace(updatedSpace); 
    
    const itemsToDelete = items.filter(i => i.spaceId === activeSpace._id && i.customTab === tabToDelete); 
    setItems(items.filter(i => !(i.spaceId === activeSpace._id && i.customTab === tabToDelete))); 
    const nextTab = updatedTabs.length > 0 ? updatedTabs[0] : null;
    setActiveCustomTab(nextTab); 
    localStorage.setItem('dash_tab', nextTab || 'null'); 
    setDeleteTabModalOpen(false); 
    setTabToDelete(null); 
    
    if (activeSpace._id !== 'default') { 
      try { 
        const res = await fetch(`/api/spaces/${activeSpace._id}`, { 
          method: 'PUT', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ customTabs: updatedTabs }) 
        }); 
        if (!res.ok) throw new Error('Failed to update tabs on server');

        // מחיקת כל הפריטים שהיו בתוך הנושא
        await Promise.all(itemsToDelete.map(async (item) => {
          const itemRes = await fetch(`/api/data/${item._id}`, { method: 'DELETE' });
          if (!itemRes.ok) console.error(`Failed to delete item ${item._id}`);
        })); 
      } catch (error) {
        console.error("Failed to delete tab:", error);
        setToastMessage('שגיאה: פעולת המחיקה נכשלה בשרת');
        setTimeout(() => setToastMessage(null), 3000);
      } 
    } 
  };

  const handleAddSpace = async (e) => { 
    e.preventDefault(); if (!newSpaceName) return; 
    const tempId = Date.now().toString(); const newSpace = { _id: tempId, name: newSpaceName, iconName: 'Folder', color: 'var(--brand-color)', customTabs: [] }; 
    setSpaces([...spaces, newSpace]); 
    setActiveSpace(newSpace); 
    setActiveCustomTab(null); 
    setActiveCategoryTab('ראשי'); 
    localStorage.setItem('dash_spaceId', tempId); 
    localStorage.setItem('dash_tab', 'null');
    localStorage.setItem('dash_category', 'ראשי');
    setAddSpaceModalOpen(false); setNewSpaceName(''); 
    try { const res = await fetch('/api/spaces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newSpace.name, iconName: newSpace.iconName, color: newSpace.color, customTabs: [] }) }); if (res.ok) { const savedSpace = await res.json(); setSpaces(prev => prev.map(s => s._id === tempId ? { ...s, _id: savedSpace._id } : s)); setActiveSpace(savedSpace); localStorage.setItem('dash_spaceId', savedSpace._id); } } catch (error) {} 
  };


  
  const handleSpaceContextMenu = (e, space) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    const { x, y } = getContextMenuPosition(e); 
    closeContextMenus(); 
    setSpaceContextMenu({ visible: true, x, y, space }); 
  };
  const handleTabContextMenu = (e, tab) => { 
    e.preventDefault(); 
    e.stopPropagation(); 
    const { x, y } = getContextMenuPosition(e); 
    closeContextMenus(); 
    setTabContextMenu({ visible: true, x, y, tabName: tab }); 
  };
  const openSpaceSettings = (space) => { setEditSpaceData({ name: space.name, iconName: space.iconName || 'Folder', color: space.color || 'var(--brand-color)' }); setEditingSpaceId(space._id); setSettingsModalOpen(true); closeContextMenus(); };
  const handleSaveSpaceSettings = async (e) => { e.preventDefault(); const updatedSpaces = spaces.map(s => s._id === editingSpaceId ? { ...s, name: editSpaceData.name, iconName: editSpaceData.iconName, color: editSpaceData.color } : s); setSpaces(updatedSpaces); if (activeSpace._id === editingSpaceId) setActiveSpace(updatedSpaces.find(s => s._id === editingSpaceId)); setSettingsModalOpen(false); if (editingSpaceId !== 'default') { fetch(`/api/spaces/${editingSpaceId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: editSpaceData.name, iconName: editSpaceData.iconName, color: editSpaceData.color }) }); } };
  const openRenameSpace = () => { if (!spaceContextMenu.space) return; setNewSpaceName(spaceContextMenu.space.name); setRenameSpaceModalOpen(true); closeContextMenus(); };
  const handleRenameSpaceSubmit = async (e) => { e.preventDefault(); const targetSpaceId = spaceContextMenu.space._id; const updatedSpaces = spaces.map(s => s._id === targetSpaceId ? { ...s, name: newSpaceName } : s); setSpaces(updatedSpaces); if (activeSpace._id === targetSpaceId) setActiveSpace(updatedSpaces.find(s => s._id === activeSpace._id)); setRenameSpaceModalOpen(false); if (targetSpaceId !== 'default') { fetch(`/api/spaces/${targetSpaceId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: newSpaceName }) }); } };
  const handleDeleteSpaceClick = () => { if (!spaceContextMenu.space) return; setSpaceToDelete(spaceContextMenu.space); setDeleteSpaceModalOpen(true); closeContextMenus(); };
  
  const executeDeleteSpace = async () => { 
    if (!spaceToDelete) return; 
    const targetSpaceId = spaceToDelete._id; 
    
    // קודם כל עושים את העדכון הוויזואלי (Optimistic Update)
    const updatedSpaces = spaces.filter(s => s._id !== targetSpaceId); 
    setSpaces(updatedSpaces); 
    if (activeSpace._id === targetSpaceId) { 
        const nextSpace = updatedSpaces[0] || null; 
        setActiveSpace(nextSpace); 
        const nextTab = nextSpace?.customTabs?.[0] || null;
        setActiveCustomTab(nextTab); 
        localStorage.setItem('dash_spaceId', nextSpace ? nextSpace._id : 'default'); 
        localStorage.setItem('dash_tab', nextTab || 'null');
    } 
    setDeleteSpaceModalOpen(false); 
    setSpaceToDelete(null); 
    
    // שליחה לשרת עם טיפול בשגיאות
    if (targetSpaceId !== 'default') { 
      try {
        const res = await fetch(`/api/spaces/${targetSpaceId}`, { method: 'DELETE' });
        if (!res.ok) {
          throw new Error('Server failed to delete space');
        }
      } catch (error) {
        console.error("Failed to delete space:", error);
        // במערכת מקצועית, כאן היינו מחזירים את המרחב למסך או מציגים הודעת שגיאה
        setToastMessage('שגיאה: לא הצלחנו למחוק את המרחב מהשרת');
        setTimeout(() => setToastMessage(null), 3000);
      }
    } 
  };

  const handleAddItem = async (e) => { e.preventDefault(); if (!newItemData.title || !newItemData.link) return; const currentPinnedCount = items.filter(i => i.isFavorite && i.isPinnedToMain && (i.spaceId || 'default') === currentSpaceId).length; const shouldPin = newItemSection === 'favorites' && currentPinnedCount < 10; const tempId = Date.now().toString(); const newItem = { _id: tempId, title: newItemData.title, link: newItemData.link, section: newItemSection === 'favorites' ? 'links' : newItemSection, isFavorite: newItemSection === 'favorites', isPinnedToMain: shouldPin, spaceId: currentSpaceId, customTab: newItemSection === 'favorites' ? null : activeCustomTab, order: items.length }; setItems([...items, newItem]); setAddItemModalOpen(false); setNewItemData({ title: '', link: '' }); try { const { _id, ...itemToSave } = newItem; const res = await fetch('/api/data', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(itemToSave) }); if (res.ok) { const savedItem = await res.json(); setItems(prev => prev.map(i => i._id === tempId ? { ...i, _id: savedItem._id } : i)); } } catch (error) {} };
  const handleContextMenu = (e, item) => { e.preventDefault(); const { x, y } = getContextMenuPosition(e); closeContextMenus(); setContextMenu({ visible: true, x, y, item: item }); };
  const handleSetItemColor = async (color) => { if (!contextMenu.item) return; const itemId = contextMenu.item._id; const updatedItems = items.map(i => i._id === itemId ? { ...i, itemColor: color } : i); setItems(updatedItems); closeContextMenus(); if (!contextMenu.item.isGlobal) { try { await fetch(`/api/data/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ itemColor: color }) }); } catch (error) {} } };
  
  const handleDeleteItem = async () => { if (contextMenu.item) { const itemId = contextMenu.item._id; setItems(items.map(i => i._id === itemId ? { ...i, isDeleted: true } : i)); closeContextMenus(); setToastMessage('הפריט הועבר לסל המחזור'); setTimeout(() => setToastMessage(null), 3000); if (!contextMenu.item.isGlobal) { fetch(`/api/data/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDeleted: true }) }); } } };
  const handleRestoreItem = async (itemId) => { setItems(items.map(i => i._id === itemId ? { ...i, isDeleted: false } : i)); setIsRecycleBinOpen(false); try { await fetch(`/api/data/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDeleted: false }) }); } catch (error) {} };
  const handlePermanentDelete = async (itemId) => { setItems(items.filter(i => i._id !== itemId)); setIsRecycleBinOpen(false); try { await fetch(`/api/data/${itemId}`, { method: 'DELETE' }); } catch (error) {} };
  const handleOpenEdit = () => { if (contextMenu.item) { setEditItemData(contextMenu.item); setEditModalOpen(true); closeContextMenus(); } };
  const handleSaveEdit = async (e) => { e.preventDefault(); setItems(items.map(i => i._id === editItemData._id ? editItemData : i)); setEditModalOpen(false); if (!editItemData.isGlobal) fetch(`/api/data/${editItemData._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: editItemData.title, link: editItemData.link }) }); };
  const togglePinToMain = async (e, itemId) => { e.preventDefault(); e.stopPropagation(); const currentPinnedCount = items.filter(i => i.isFavorite && i.isPinnedToMain && (i.spaceId || 'default') === currentSpaceId).length; let newPinState = false; let shouldUpdate = false; const updatedItems = items.map(item => { if (item._id === itemId) { if (!item.isPinnedToMain && currentPinnedCount >= 10) { setMaxPinsModalOpen(true); return item; } newPinState = !item.isPinnedToMain; shouldUpdate = true; return { ...item, isPinnedToMain: newPinState }; } return item; }); setItems(updatedItems); if (shouldUpdate && !items.find(i=>i._id===itemId)?.isGlobal) { fetch(`/api/data/${itemId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isPinnedToMain: newPinState }) }); } };
  const openMoveModal = () => { if (!contextMenu.item) return; setItemToMove(contextMenu.item); setMoveDestination({ spaceId: currentSpaceId, customTab: contextMenu.item.customTab || '' }); setMoveModalOpen(true); closeContextMenus(); };
  const handleMoveSubmit = async (e) => { e.preventDefault(); if (!itemToMove) return; const updatedItems = items.map(i => i._id === itemToMove._id ? { ...i, spaceId: moveDestination.spaceId, customTab: moveDestination.customTab || null } : i ); setItems(updatedItems); setMoveModalOpen(false); try { await fetch(`/api/data/${itemToMove._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spaceId: moveDestination.spaceId, customTab: moveDestination.customTab || null }) }); } catch (error) {} };

  const getFavicon = (url) => { try { return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`; } catch { return '/globe.svg'; } };
  const getThumbnail = (item) => { if (item.imageUrl) return item.imageUrl; const videoLink = item.link || item.url; if (videoLink) { const ytMatch = videoLink.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|shorts\/|watch\?v=|watch\?.+&v=))([^&?]+)/); if (ytMatch) return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`; } return null; };

  const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
  const spaceItems = sortedItems.filter(item => (item.isGlobal || (item.spaceId || 'default') === currentSpaceId) && !item.isDeleted);
  const searchedItems = spaceItems.filter(item => item.title?.toLowerCase().includes(searchQuery.toLowerCase()));
  const deletedItems = items.filter(item => item.isDeleted);

  const favoriteItems = searchedItems.filter(i => i.isFavorite);
  const pinnedFavorites = favoriteItems.filter(i => i.isPinnedToMain);
  const documentItems = searchedItems.filter(i => i.section === 'documents' && (searchQuery !== '' || (i.customTab || null) === activeCustomTab));
  const visualItems = searchedItems.filter(i => i.section === 'visuals' && (searchQuery !== '' || (i.customTab || null) === activeCustomTab));
  const favArray = activeCategoryTab === 'ראשי' ? (searchQuery !== '' ? favoriteItems : pinnedFavorites.slice(0, 10)) : favoriteItems;

  const renderDragOverlay = () => {
    if (!activeDragId) return null;
    const overlayStyle = { opacity: 0.65, transform: 'scale(1.05)', cursor: 'grabbing', pointerEvents: 'none' };
    if (currentSpaceTabs.includes(activeDragId)) { return ( <div className={styles.customTab} style={{ ...overlayStyle, background: 'var(--bg-hover)', border: `2px solid var(--brand-color)`, color: 'var(--text-main)', boxShadow: '0 25px 50px -12px var(--shadow-color)', padding: '10px 20px', borderRadius: '30px', fontWeight: 'bold' }}><span>{activeDragId}</span></div> ); }
    const item = items.find(i => i._id === activeDragId);
    if (item) {
      if (item.section === 'links') { return ( <div className={styles.favCard} style={{ ...overlayStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--bg-card)', boxShadow: '0 25px 50px -12px var(--shadow-color)', padding: '10px', borderRadius: '12px', border: item.itemColor ? `1px solid ${item.itemColor}` : '1px solid transparent' }}><div className={styles.favIcon} style={{ background: 'transparent', padding: 0 }}><img src={getFavicon(item.link || item.url)} alt={item.title} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} /></div><span className={styles.favTitle} style={{ color: 'var(--text-secondary)' }}>{item.title}</span></div> ) } 
      else if (item.section === 'documents') { const { Icon: DocIcon, color: iconColor, bg: iconBg } = getDocIconProps(item.link || item.url); return ( <div className={styles.docRow} style={{ ...overlayStyle, background: 'var(--bg-card)', boxShadow: '0 25px 50px -12px var(--shadow-color)', padding: '15px', borderRadius: '8px', border: item.itemColor ? `1px solid ${item.itemColor}` : '1px solid transparent', display: 'flex', alignItems: 'center', width: '300px' }}><div className={styles.docInfo} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><div className={styles.docIcon} style={{ background: iconBg, padding: '8px', borderRadius: '6px' }}><DocIcon size={20} color={iconColor}/></div><span className={styles.docTitle} style={{ color: 'var(--text-main)' }}>{item.title}</span></div></div> ) } 
      else if (item.section === 'visuals') { const thumb = getThumbnail(item); return ( <div className={styles.squareCard} style={{ ...overlayStyle, background: 'var(--bg-card)', boxShadow: '0 25px 50px -12px var(--shadow-color)', borderRadius: '12px', overflow: 'hidden', width: '250px', border: item.itemColor ? `1px solid ${item.itemColor}` : 'none' }}><div className={styles.squareImageWrapper} style={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>{thumb ? <img src={thumb} alt={item.title} className={styles.cardImage} style={{ width: '100%', height: '100%', objectFit: 'cover' }}/> : <div style={{ background: 'var(--placeholder-bg)', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Play size={32} opacity={0.5} color="var(--text-muted)" /></div>}<div className={styles.playOverlay} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--play-overlay)' }}><Play size={40} fill="white" /></div></div><div className={styles.cardContent} style={{ padding: '12px' }}><h4 style={{ margin: 0, color: 'var(--text-main)' }}>{item.title}</h4></div></div> ) }
    }
    return null;
  };

  const isDraggingItem = activeDragId && !currentSpaceTabs.includes(activeDragId);

  if (!isMounted) return null;

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleUnifiedDragEnd} onDragCancel={() => { setActiveDragId(null); setActiveOverId(null); }}>
      
      <div className={styles.mainLayout} style={activeThemeStyles} onClick={closeContextMenus}>
        
        <div className={`${styles.mobileSidebarOverlay} ${isSidebarOpen ? styles.show : ''}`} onClick={() => setSidebarOpen(false)}></div>

        <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : styles.closed}`}>
          <div className={styles.sidebarHeader} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '20px' : '20px 0' }}>
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className={styles.hamburger}><Menu size={24} /></button>
            {isSidebarOpen && <h2 className={styles.brandTitle} style={{ marginRight: '10px' }}>מרכז השליטה</h2>}
          </div>
          
          <nav className={styles.spacesNav} style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
             <button onClick={() => setAddSpaceModalOpen(true)} className={styles.addSpaceBtn} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '10px' : '10px 0', width: isSidebarOpen ? 'calc(100% - 40px)' : '40px', margin: '0 auto 15px auto', display: 'flex', alignItems: 'center' }} title={!isSidebarOpen ? "הוספת מרחב" : ""}>
               <Plus size={18} /> {isSidebarOpen && <span style={{ marginRight: '8px' }}>הוספת מרחב</span>}
             </button>
             
             <div className={styles.spacesList}>
               {spaces.map(space => (
                 <div key={space._id} className={`${styles.spaceItem} ${activeSpace?._id === space._id ? styles.activeSpace : ''}`} onClick={() => { setActiveSpace(space); setActiveCategoryTab('ראשי'); const firstTab = space.customTabs?.[0] || null; setActiveCustomTab(firstTab); localStorage.setItem('dash_spaceId', space._id); localStorage.setItem('dash_category', 'ראשי'); localStorage.setItem('dash_tab', firstTab || 'null'); if (window.innerWidth <= 768) setSidebarOpen(false); }} onContextMenu={(e) => handleSpaceContextMenu(e, space)} style={{ justifyContent: isSidebarOpen ? 'flex-start' : 'center', padding: isSidebarOpen ? '10px' : '12px 0', width: isSidebarOpen ? 'calc(100% - 40px)' : '40px', margin: '0 auto 5px auto', borderRadius: '8px', display: 'flex', alignItems: 'center' }} title={!isSidebarOpen ? space.name : ""}>
                   <span className={styles.spaceIcon} style={{ margin: isSidebarOpen ? '0' : '0 auto', display: 'flex' }}>{renderSpaceIcon(space.iconName, space.color)}</span> 
                   {isSidebarOpen && <span className={styles.spaceName} style={{ marginRight: '10px', whiteSpace: 'nowrap' }}>{space.name}</span>}
                 </div>
               ))}
             </div>
          </nav>
          
          <div className={styles.sidebarFooter} style={{ padding: isSidebarOpen ? '20px 20px 40px 20px' : '20px 0 40px 0', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div onClick={() => setIsRecycleBinOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', width: isSidebarOpen ? 'calc(100% - 20px)' : '100%', margin: '0 auto', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s' }} title={!isSidebarOpen ? "סל מחזור" : ""} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--brand-color)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
              <Trash2 size={18} /> {isSidebarOpen && <span style={{ marginRight: '10px', whiteSpace: 'nowrap' }}>סל מחזור</span>}
            </div>
            <div onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'flex-start' : 'center', width: isSidebarOpen ? 'calc(100% - 20px)' : '100%', margin: '0 auto', cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.2s' }} title={!isSidebarOpen ? `התנתקות (${user.name})` : ""} onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>
              <LogOut size={18} /> {isSidebarOpen && <span style={{ marginRight: '10px', whiteSpace: 'nowrap' }}>התנתקות ({user.name})</span>}
            </div>
          </div>
        </aside>

        <main className={styles.content}>
          <header className={styles.header}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button onClick={() => setSidebarOpen(true)} className={styles.mobileHamburger}><Menu size={24} /></button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {activeSpace && renderSpaceIcon(activeSpace.iconName, activeSpace.color, 24)}
                <h1 className={styles.spaceTitle} style={{ borderBottom: `3px solid ${activeSpace?.color || 'var(--brand-color)'}`, margin: 0 }}>{activeSpace?.name || 'בחר מרחב'}</h1>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              
              <div style={{ position: 'relative' }}>
                <button onClick={(e) => { e.stopPropagation(); setShowThemeMenu(!showThemeMenu); }} className={styles.settingsBtn} title="עיצוב אישי">
                  <Palette size={20} />
                </button>
                {showThemeMenu && (
                  <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 'calc(100% + 10px)', left: '0', padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', boxShadow: '0 10px 35px var(--shadow-color)', zIndex: 100, width: '260px', cursor: 'default' }}>
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 'bold' }}>תאורה:</div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button onClick={() => handleModeChange('dark')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: themeMode === 'dark' ? 'var(--brand-color)' : 'transparent', color: themeMode === 'dark' ? '#fff' : 'var(--text-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}><Moon size={16}/> כהה</button>
                        <button onClick={() => handleModeChange('light')} style={{ flex: 1, padding: '10px', borderRadius: '8px', background: themeMode === 'light' ? 'var(--brand-color)' : 'transparent', color: themeMode === 'light' ? '#fff' : 'var(--text-main)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', cursor: 'pointer', transition: 'all 0.2s' }}><Sun size={16}/> בהיר</button>
                      </div>
                    </div>
                    <div>
                       <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px', fontWeight: 'bold' }}>גוון המערכת:</div>
                       <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                         <button onClick={() => handleTintChange('gray')} style={{width:'32px', height:'32px', borderRadius:'50%', background:'#64748b', border: themeTint === 'gray' ? '2px solid var(--text-main)' : '2px solid transparent', cursor:'pointer'}} title="אפור" />
                         <button onClick={() => handleTintChange('blue')} style={{width:'32px', height:'32px', borderRadius:'50%', background:'#38bdf8', border: themeTint === 'blue' ? '2px solid var(--text-main)' : '2px solid transparent', cursor:'pointer'}} title="תכלת" />
                         <button onClick={() => handleTintChange('purple')} style={{width:'32px', height:'32px', borderRadius:'50%', background:'#c084fc', border: themeTint === 'purple' ? '2px solid var(--text-main)' : '2px solid transparent', cursor:'pointer'}} title="סגול" />
                         <button onClick={() => handleTintChange('green')} style={{width:'32px', height:'32px', borderRadius:'50%', background:'#10b981', border: themeTint === 'green' ? '2px solid var(--text-main)' : '2px solid transparent', cursor:'pointer'}} title="ירוק" />
                         <button onClick={() => handleTintChange('red')} style={{width:'32px', height:'32px', borderRadius:'50%', background:'#ef4444', border: themeTint === 'red' ? '2px solid var(--text-main)' : '2px solid transparent', cursor:'pointer'}} title="אדום" />
                       </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: 'relative' }}>
                <button onMouseEnter={() => setShowInfoTooltip(true)} onMouseLeave={() => setShowInfoTooltip(false)} className={styles.settingsBtn} style={{ cursor: 'help' }}><Info size={20} /></button>
                {showInfoTooltip && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '10px', padding: '15px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', boxShadow: '0 10px 15px -3px var(--shadow-color)', color: 'var(--text-secondary)', fontSize: '0.85rem', width: 'max-content', zIndex: 100, textAlign: 'right' }}>
                    <strong style={{ display: 'block', color: 'var(--text-main)', marginBottom: '8px', fontSize: '1.05rem' }}>אלדר ויז'ואל</strong>
                    <div style={{ marginBottom: '4px' }}>גרסת מערכת: 3.2.8</div>
                    <div style={{ color: 'var(--text-muted)' }}>&copy; 2026 כל הזכויות שמורות.</div>
                  </div>
                )}
              </div> 
            </div>
          </header>
   
          <div className={styles.searchBar}>
            <Search size={20} className={styles.searchIcon} />
            <input type="text" placeholder="חפש מסמכים, סרטונים ותוכן..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>

          <div className={styles.customTabsWrapper} style={{ display: 'flex', alignItems: 'center', position: 'relative', marginBottom: '30px', marginTop: '10px' }}>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginLeft: '15px', whiteSpace: 'nowrap' }}>נושאים:</span>
            
           <div ref={tabsScrollRef} style={{ display: 'flex', flex: 1, overflowX: 'auto', gap: '10px', paddingBottom: '5px', scrollbarWidth: 'none', msOverflowStyle: 'none', scrollSnapType: 'x mandatory', WebkitMaskImage: 'linear-gradient(to right, transparent 0px, black 25px, black 100%)', maskImage: 'linear-gradient(to right, transparent 0px, black 25px, black 100%)' }} className="hideScrollbar">
                <SortableContext items={currentSpaceTabs} strategy={horizontalListSortingStrategy}>
                  {currentSpaceTabs.map(tab => {
                    const isTargeted = isDraggingItem && activeOverId === tab;
                    return (
                      <SortableItem key={tab} id={tab} onClick={() => { setActiveCustomTab(tab); localStorage.setItem('dash_tab', tab); }} onContextMenu={(e) => handleTabContextMenu(e, tab)} className={styles.customTab} 
                        style={{ flexShrink: 0, scrollSnapAlign: 'center', ...(isTargeted ? { background: 'rgba(16, 185, 129, 0.15)', border: '2px dashed #10b981', transform: 'scale(1.05)', transition: 'all 0.2s', color: '#10b981' } : activeCustomTab === tab ? { background: 'var(--bg-hover)', border: `2px solid ${activeSpace?.color || 'var(--brand-color)'}`, color: 'var(--text-main)' } : { border: '2px solid transparent' }) }}>
                        <span>{tab}</span>
                      </SortableItem>
                    )
                  })}
                </SortableContext>
              <div style={{ flex: '0 0 10px', width: '10px' }}></div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginRight: '15px' }}>
              <button onClick={() => setAddTabModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', padding: '8px 14px', background: 'var(--bg-hover)', borderRadius: '20px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', cursor: 'pointer', whiteSpace: 'nowrap' }}><Plus size={14}/> נושא חדש</button>
              {currentSpaceTabs.length > 3 && ( <button onClick={scrollTabsLeft} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', padding: '0 5px', cursor: 'pointer', zIndex: 2 }}><ChevronLeft size={18} /></button> )}
            </div>
          </div>

          <div className={styles.categoryTabsWrapper}>
            <button onClick={() => { setActiveCategoryTab('ראשי'); localStorage.setItem('dash_category', 'ראשי'); }} className={`${styles.categoryTab} ${activeCategoryTab === 'ראשי' ? styles.activeCategoryTab : ''}`}><LayoutGrid size={16} /> ראשי</button>
            <button onClick={() => { setActiveCategoryTab('מועדפים'); localStorage.setItem('dash_category', 'מועדפים'); }} className={`${styles.categoryTab} ${activeCategoryTab === 'מועדפים' ? styles.activeCategoryTab : ''}`}><Star size={16} /> מועדפים ({favoriteItems.length})</button>
            <button onClick={() => { setActiveCategoryTab('מסמכים'); localStorage.setItem('dash_category', 'מסמכים'); }} className={`${styles.categoryTab} ${activeCategoryTab === 'מסמכים' ? styles.activeCategoryTab : ''}`}><FileText size={16} /> מסמכים ({documentItems.length})</button>
            <button onClick={() => { setActiveCategoryTab('סרטונים'); localStorage.setItem('dash_category', 'סרטונים'); }} className={`${styles.categoryTab} ${activeCategoryTab === 'סרטונים' ? styles.activeCategoryTab : ''}`}><Play size={16} /> סרטונים ({visualItems.length})</button>
          </div>

          <div className={`${styles.scrollableContent} ${styles.animatedContent}`} key={`${activeSpace?._id}-${activeCustomTab}-${activeCategoryTab}-${searchQuery}`}>
            {(activeCategoryTab === 'ראשי' || activeCategoryTab === 'מועדפים') && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}>
                  <h2 className={styles.sectionTitle}><Star size={20} color="var(--brand-color)" /> {activeCategoryTab === 'ראשי' ? 'המועדפים' : ' כל המועדפים'}</h2>
                  {activeCategoryTab === 'ראשי' && favoriteItems.length > pinnedFavorites.length && ( <button onClick={() => setActiveCategoryTab('מועדפים')} className={styles.showAllBtn}>ניהול מועדפים <ChevronLeft size={16}/></button> )}
                </div>
                <div className={styles.favoritesGrid}>
                    <SortableContext items={favArray.map(f=>f._id)} strategy={rectSortingStrategy}>
                      {favArray.map(item => (
                        <SortableItem key={item._id} id={item._id} href={item.link || item.url} className={styles.favCard} onContextMenu={(e) => handleContextMenu(e, item)} 
                           style={{ 
                             display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px',
                             ...(activeCategoryTab === 'מועדפים' && item.isPinnedToMain ? { border: '3px solid var(--brand-color)' } : { border: item.itemColor ? `1px solid ${item.itemColor}` : '1px solid transparent' }),
                             ...(item.itemColor ? { boxShadow: `0 4px 15px ${item.itemColor}25` } : {})
                           }}>
                          {activeCategoryTab === 'מועדפים' && (
                             <button className={styles.pinBtn} onClick={(e) => togglePinToMain(e, item._id)} title={item.isPinnedToMain ? "הסר מהמסך הראשי" : "הצמד למסך הראשי"} style={{ position: 'absolute', top: '5px', left: '5px', background: item.isPinnedToMain ? 'var(--brand-color)' : 'var(--bg-hover)', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer', color: item.isPinnedToMain ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}><Pin size={12} fill={item.isPinnedToMain ? "#fff" : "none"} /></button>
                          )}
                          <div className={styles.favIcon} style={{ padding: 0 }}><img draggable="false" src={getFavicon(item.link || item.url)} alt={item.title} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/globe.svg'; }} /></div>
                          <span className={styles.favTitle}>{item.title}</span>
                        </SortableItem>
                      ))}
                    </SortableContext>
                  {(activeCategoryTab === 'ראשי' || activeCategoryTab === 'מועדפים') && (
                    <button onClick={() => { setNewItemSection('favorites'); setAddItemModalOpen(true); }} className={styles.addGridBtn} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}><Plus size={24}/> <span>הוסף מועדף</span></button>
                  )}  
                </div>
              </section>
            )}

            {(activeCategoryTab === 'ראשי' || activeCategoryTab === 'מסמכים') && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}><FileText size={20} color="var(--brand-color)" /> מסמכים</h2></div>              
                <div className={styles.documentsList}>
                    <SortableContext items={documentItems.map(d=>d._id)} strategy={verticalListSortingStrategy}>
                      {documentItems.map(doc => {
                        const { Icon: DocIcon, color: iconColor, bg: iconBg } = getDocIconProps(doc.link || doc.url);
                        return (
                          <SortableItem key={doc._id} id={doc._id} href={doc.link || doc.url} className={styles.docRow} onContextMenu={(e) => handleContextMenu(e, doc)}
                             style={{ borderColor: doc.itemColor || undefined, boxShadow: doc.itemColor ? `0 4px 15px ${doc.itemColor}25` : undefined }}>
                            <div className={styles.docInfo}>
                              <div className={styles.docIcon} style={{ background: iconBg }}><DocIcon size={20} color={iconColor}/></div>
                              <span className={styles.docTitle}>{doc.title}</span>
                            </div>
                            <ExternalLink size={16} className={styles.openIcon} />
                          </SortableItem>
                        );
                      })}
                    </SortableContext>
                  {documentItems.length === 0 && <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', padding: '10px 0'}}>{!activeCustomTab ? 'צור נושא קודם כדי להוסיף מסמכים.' : 'אין מסמכים בנושא זה.'}</p>}
                  <button onClick={() => { setNewItemSection('documents'); setAddItemModalOpen(true); }} className={styles.addListBtn} disabled={!activeCustomTab} style={{ opacity: activeCustomTab ? 1 : 0.4 }}><Plus size={18}/> הוסף מסמך חדש</button>
                </div>
              </section>
            )}

            {(activeCategoryTab === 'ראשי' || activeCategoryTab === 'סרטונים') && (
              <section className={styles.section}>
                <div className={styles.sectionHeader}><h2 className={styles.sectionTitle}><Play size={20} color="var(--brand-color)" /> סרטונים</h2></div>              
                <div className={styles.visualsGrid}>
                    <SortableContext items={visualItems.map(v=>v._id)} strategy={rectSortingStrategy}>
                      {visualItems.map(vid => {
                        const thumb = getThumbnail(vid);
                        return (
                          <SortableItem key={vid._id} id={vid._id} href={vid.link || vid.url} className={styles.squareCard} onContextMenu={(e) => handleContextMenu(e, vid)}
                             style={{ borderColor: vid.itemColor || undefined, boxShadow: vid.itemColor ? `0 4px 15px ${vid.itemColor}25` : undefined }}>
                            <div className={styles.squareImageWrapper}>
                              {thumb ? <img draggable="false" src={thumb} alt={vid.title} className={styles.cardImage} /> : <div className={styles.placeholderImg}><Play size={32} opacity={0.5} /></div>}
                              <div className={styles.playOverlay}><Play size={40} fill="white" /></div>
                            </div>
                             <div className={styles.cardContent}><h4 className={styles.cardTitle} dir="auto" style={{ width: '100%', margin: 0 }}>{vid.title}</h4></div>
                          </SortableItem>
                        );
                      })}
                    </SortableContext>
                  <button onClick={() => { setNewItemSection('visuals'); setAddItemModalOpen(true); }} className={`${styles.squareCard} ${styles.addSquareBtn}`} disabled={!activeCustomTab} style={{ opacity: activeCustomTab ? 1 : 0.4 }}><Plus size={32} color="var(--text-muted)" /><span>הוסף סרטון</span></button>
                </div>
              </section>
            )}
          </div>
        </main>

        {/* --- חלונות קופצים (Modals) וקליק ימני --- */}
        {contextMenu.visible && (
          <div className={styles.contextMenu} style={{ top: contextMenu.y, left: contextMenu.x }}>
            {contextMenu.item?.isFavorite && ( <button onClick={(e) => { togglePinToMain(e, contextMenu.item._id); closeContextMenus(); }} className={styles.contextMenuItem}><Pin size={16} /> {contextMenu.item.isPinnedToMain ? 'הסר מהמסך הראשי' : 'הצמד למסך הראשי'}</button> )}
            {!contextMenu.item?.isGlobal && <button onClick={openMoveModal} className={styles.contextMenuItem}><MoveRight size={16} /> העבר מיקום...</button>}
            {!contextMenu.item?.isGlobal && <button onClick={handleOpenEdit} className={styles.contextMenuItem}><Edit size={16} /> עריכת פריט</button>}
            
            {!contextMenu.item?.isGlobal && (
              <div style={{ padding: '10px', borderTop: '1px solid var(--border-color)', marginTop: '5px', marginBottom: '5px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>צבע קו מתאר:</div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button onClick={(e) => { e.stopPropagation(); handleSetItemColor(null); }} style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'transparent', border: '1px dashed var(--text-muted)', cursor: 'pointer' }} title="ללא צבע" />
                  {AVAILABLE_COLORS.map(color => (
                    <button key={color} onClick={(e) => { e.stopPropagation(); handleSetItemColor(color); }} style={{ width: '20px', height: '20px', borderRadius: '50%', background: color, border: contextMenu.item?.itemColor === color ? '2px solid var(--text-main)' : 'none', cursor: 'pointer', outline: contextMenu.item?.itemColor === color ? `1px solid ${color}` : 'none' }} title={color} />
                  ))}
                </div>
              </div>
            )}

            {!contextMenu.item?.isGlobal && <button onClick={handleDeleteItem} className={`${styles.contextMenuItem} ${styles.delete}`} style={{ borderTop: '1px solid var(--border-color)' }}><Trash2 size={16} /> מחיקת פריט</button>}
            {contextMenu.item?.isGlobal && <div style={{padding: '10px', fontSize:'0.85rem', color:'var(--text-muted)'}}>זהו פריט קבוע שלא ניתן לעריכה.</div>}
          </div>
        )}

        {spaceContextMenu.visible && ( <div className={styles.contextMenu} style={{ top: spaceContextMenu.y, left: spaceContextMenu.x }}><button onClick={openRenameSpace} className={styles.contextMenuItem}><Edit size={16} /> שנה שם</button><button onClick={() => openSpaceSettings(spaceContextMenu.space)} className={styles.contextMenuItem}><Settings size={16} /> הגדרות ועיצוב</button><button onClick={handleDeleteSpaceClick} className={`${styles.contextMenuItem} ${styles.delete}`}><Trash2 size={16} /> מחק מרחב</button></div> )}
        {tabContextMenu.visible && ( <div className={styles.contextMenu} style={{ top: tabContextMenu.y, left: tabContextMenu.x }}><button onClick={openEditTab} className={styles.contextMenuItem}><Edit size={16} /> שנה שם נושא</button><button onClick={handleDeleteTabClick} className={`${styles.contextMenuItem} ${styles.delete}`}><Trash2 size={16} /> מחק נושא</button></div> )}

        {isDeleteSpaceModalOpen && ( <div className={styles.modalOverlay} onClick={() => setDeleteSpaceModalOpen(false)}><div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', border: '1px solid #ef4444' }}><button onClick={() => setDeleteSpaceModalOpen(false)} className={styles.closeModal}><X size={20}/></button><div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}><Trash2 size={48} color="#ef4444" /></div><h2 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>מחיקת מרחב</h2><p style={{ color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>האם אתה בטוח שברצונך למחוק את המרחב <strong>"{spaceToDelete?.name}"</strong>?<br/><span style={{ color: '#ef4444', fontSize: '0.85rem' }}>פעולה זו תמחק את כל הנושאים, המסמכים והסרטונים שבו לצמיתות ולא ניתנת לביטול.</span></p><div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setDeleteSpaceModalOpen(false)} className={styles.submitModalBtn} style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', flex: 1 }}>ביטול</button><button onClick={executeDeleteSpace} className={styles.submitModalBtn} style={{ background: '#ef4444', color: 'white', flex: 1, border: 'none' }}>כן, מחק מרחב</button></div></div></div> )}
        {isDeleteTabModalOpen && ( <div className={styles.modalOverlay} onClick={() => setDeleteTabModalOpen(false)}><div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', border: '1px solid #ef4444' }}><button onClick={() => setDeleteTabModalOpen(false)} className={styles.closeModal}><X size={20}/></button><div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}><Trash2 size={48} color="#ef4444" /></div><h2 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>מחיקת נושא</h2><p style={{ color: 'var(--text-secondary)', marginBottom: '25px', lineHeight: '1.6', fontSize: '0.95rem' }}>האם אתה בטוח שברצונך למחוק את הנושא <strong>"{tabToDelete}"</strong>?<br/><span style={{ color: '#ef4444', fontSize: '0.85rem' }}>כל המסמכים והסרטונים המשויכים אליו יימחקו לצמיתות.</span></p><div style={{ display: 'flex', gap: '10px' }}><button onClick={() => setDeleteTabModalOpen(false)} className={styles.submitModalBtn} style={{ background: 'var(--bg-hover)', color: 'var(--text-main)', flex: 1 }}>ביטול</button><button onClick={executeDeleteTab} className={styles.submitModalBtn} style={{ background: '#ef4444', color: 'white', flex: 1, border: 'none' }}>כן, מחק נושא</button></div></div></div> )}
        {isMoveModalOpen && ( <div className={styles.modalOverlay} onClick={() => setMoveModalOpen(false)}><div className={styles.modalContent} onClick={(e) => e.stopPropagation()}><button onClick={() => setMoveModalOpen(false)} className={styles.closeModal}><X size={20}/></button><h2>העברת פריט: {itemToMove?.title}</h2><form onSubmit={handleMoveSubmit} className={styles.modalForm}><div style={{ marginBottom: '15px' }}><label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>בחר מרחב יעד:</label><select value={moveDestination.spaceId} onChange={(e) => { const newSpaceId = e.target.value; const targetSpace = spaces.find(s => s._id === newSpaceId); setMoveDestination({ spaceId: newSpaceId, customTab: targetSpace?.customTabs?.[0] || '' }); }} style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }}>{spaces.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}</select></div>{itemToMove?.section !== 'links' && ( <div style={{ marginBottom: '20px' }}><label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>בחר נושא יעד:</label><select value={moveDestination.customTab} onChange={(e) => setMoveDestination({ ...moveDestination, customTab: e.target.value })} style={{ width: '100%', padding: '10px', background: 'var(--bg-main)', border: '1px solid var(--border-color)', color: 'var(--text-main)', borderRadius: '6px' }}>{spaces.find(s => s._id === moveDestination.spaceId)?.customTabs?.map(tab => ( <option key={tab} value={tab}>{tab}</option> ))}{(!spaces.find(s => s._id === moveDestination.spaceId)?.customTabs || spaces.find(s => s._id === moveDestination.spaceId)?.customTabs.length === 0) && ( <option value="" disabled>אין נושאים במרחב זה</option> )}</select></div>)}<button type="submit" className={styles.submitModalBtn} disabled={itemToMove?.section !== 'links' && !moveDestination.customTab}>העבר עכשיו</button></form></div></div> )}
        {isEditTabModalOpen && ( <div className={styles.modalOverlay} onClick={() => setEditTabModalOpen(false)}><div className={styles.modalContent} onClick={(e) => e.stopPropagation()}><button onClick={() => setEditTabModalOpen(false)} className={styles.closeModal}><X size={20}/></button><h2>שינוי שם נושא</h2><form onSubmit={handleSaveEditTab} className={styles.modalForm}><input type="text" value={editTabName} onChange={e => setEditTabName(e.target.value)} required autoFocus /><button type="submit" className={styles.submitModalBtn}>שמור שם חדש</button></form></div></div> )}
        {isSettingsModalOpen && ( <div className={styles.modalOverlay} onClick={() => setSettingsModalOpen(false)}><div className={styles.modalContent} style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}><button onClick={() => setSettingsModalOpen(false)} className={styles.closeModal}><X size={20}/></button><h2 style={{ marginBottom: '20px' }}>הגדרות ועיצוב מרחב</h2><form onSubmit={handleSaveSpaceSettings} className={styles.modalForm}><div style={{ marginBottom: '15px' }}><label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>שם המרחב:</label><input type="text" value={editSpaceData.name} onChange={e => setEditSpaceData({...editSpaceData, name: e.target.value})} required /></div><div style={{ marginBottom: '15px' }}><label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>בחר אייקון:</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', background: 'var(--bg-main)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>{Object.keys(ICONS_MAP).map(iconKey => { const IconCmp = ICONS_MAP[iconKey]; const isSelected = editSpaceData.iconName === iconKey; return ( <button key={iconKey} type="button" onClick={() => setEditSpaceData({...editSpaceData, iconName: iconKey})} style={{ background: isSelected ? 'var(--bg-hover)' : 'transparent', border: isSelected ? `1px solid ${editSpaceData.color}` : '1px solid transparent', padding: '8px', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.2s' }}><IconCmp size={20} color={isSelected ? editSpaceData.color : 'var(--text-muted)'} /></button> )})}</div></div><div style={{ marginBottom: '25px' }}><label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.9rem' }}>צבע ייחודי:</label><div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>{AVAILABLE_COLORS.map(color => ( <button key={color} type="button" onClick={() => setEditSpaceData({...editSpaceData, color: color})} style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: color, border: editSpaceData.color === color ? '3px solid var(--text-main)' : '3px solid transparent', cursor: 'pointer', outline: editSpaceData.color === color ? `1px solid ${color}` : 'none' }} /> ))}</div></div><button type="submit" className={styles.submitModalBtn} style={{ width: '100%' }}>שמור שינויים</button></form></div></div> )}
        {isRenameSpaceModalOpen && ( <div className={styles.modalOverlay} onClick={() => setRenameSpaceModalOpen(false)}><div className={styles.modalContent} onClick={(e) => e.stopPropagation()}><button onClick={() => setRenameSpaceModalOpen(false)} className={styles.closeModal}><X size={20}/></button><h2>שינוי שם מרחב</h2><form onSubmit={handleRenameSpaceSubmit} className={styles.modalForm}><input type="text" value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)} required autoFocus /><button type="submit" className={styles.submitModalBtn}>שמור שם חדש</button></form></div></div> )}
        {isEditModalOpen && ( <div className={styles.modalOverlay} onClick={() => setEditModalOpen(false)}><div className={styles.modalContent} onClick={(e) => e.stopPropagation()}><button onClick={() => setEditModalOpen(false)} className={styles.closeModal}><X size={20}/></button><h2>עריכת פריט</h2><form onSubmit={handleSaveEdit} className={styles.modalForm}><input type="text" placeholder="כותרת" value={editItemData.title} onChange={e => setEditItemData({...editItemData, title: e.target.value})} required autoFocus /><input type="url" placeholder="קישור (URL)" value={editItemData.link || editItemData.url || ''} onChange={e => setEditItemData({...editItemData, link: e.target.value})} required style={{ direction: 'ltr', textAlign: 'left' }} /><button type="submit" className={styles.submitModalBtn}>שמור שינויים</button></form></div></div> )}
        {isAddSpaceModalOpen && ( <div className={styles.modalOverlay} onClick={() => setAddSpaceModalOpen(false)}><div className={styles.modalContent} onClick={(e) => e.stopPropagation()}><button onClick={() => setAddSpaceModalOpen(false)} className={styles.closeModal}><X size={20}/></button><h2>הוספת מרחב חדש</h2><form onSubmit={handleAddSpace} className={styles.modalForm}><input type="text" placeholder="שם המרחב (לדוגמה: פרויקט אלפא)" value={newSpaceName} onChange={e => setNewSpaceName(e.target.value)} autoFocus /><button type="submit" className={styles.submitModalBtn}>צור מרחב</button></form></div></div> )}
        {isAddTabModalOpen && ( <div className={styles.modalOverlay} onClick={() => setAddTabModalOpen(false)}><div className={styles.modalContent} onClick={(e) => e.stopPropagation()}><button onClick={() => setAddTabModalOpen(false)} className={styles.closeModal}><X size={20}/></button><h2>הוספת נושא חדש למרחב ({activeSpace?.name})</h2><form onSubmit={handleAddCustomTab} className={styles.modalForm}><input type="text" placeholder="שם הנושא" value={newTabName} onChange={e => setNewTabName(e.target.value)} autoFocus /><button type="submit" className={styles.submitModalBtn}>הוסף נושא</button></form></div></div> )}
        {isAddItemModalOpen && ( <div className={styles.modalOverlay} onClick={() => setAddItemModalOpen(false)}><div className={styles.modalContent} onClick={(e) => e.stopPropagation()}><button onClick={() => setAddItemModalOpen(false)} className={styles.closeModal}><X size={20}/></button><h2>{newItemSection === 'documents' ? 'הוספת מסמך חדש' : newItemSection === 'favorites' ? 'הוספת מועדף חדש' : 'הוספת סרטון חדש'}</h2><form onSubmit={handleAddItem} className={styles.modalForm}><input type="text" placeholder="כותרת" value={newItemData.title} onChange={e => setNewItemData({...newItemData, title: e.target.value})} required autoFocus /><input type="url" placeholder="הדבק קישור כאן (URL)" value={newItemData.link} onChange={e => setNewItemData({...newItemData, link: e.target.value})} required style={{ direction: 'ltr', textAlign: 'left' }} /><button type="submit" className={styles.submitModalBtn}>הוסף למערכת</button></form></div></div> )}
        
        {isRecycleBinOpen && (
          <div className={styles.modalOverlay} onClick={() => setIsRecycleBinOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}><h2 className={styles.sectionTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}><Trash2 size={24} color="var(--brand-color)" /> סל מחזור</h2><button onClick={() => setIsRecycleBinOpen(false)} className={styles.closeModal}><X size={20} /></button></div>
              <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '5px' }}>
                {deletedItems.length === 0 ? ( <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}><Trash2 size={56} style={{ opacity: 0.2, marginBottom: '15px' }} /><h3 style={{ margin: '0 0 10px 0', color: 'var(--text-secondary)', fontSize: '1.2rem' }}>הכל נקי כאן בינתיים</h3><p style={{ margin: 0, fontSize: '0.95rem', lineHeight: '1.5' }}>אין פריטים שנמחקו לאחרונה.</p></div> ) : ( <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>{deletedItems.map(item => {
                  const { Icon: DocIcon, color: iconColor } = getDocIconProps(item.link || item.url);
                  return ( <div key={item._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)' }}><div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}><div style={{ background: 'var(--bg-hover)', padding: '8px', borderRadius: '6px', display: 'flex' }}>{item.section === 'visuals' ? <Play size={16} color="#a855f7" /> : <DocIcon size={16} color={iconColor} />}</div><span style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{item.title}</span></div><div style={{ display: 'flex', gap: '8px' }}><button onClick={() => handleRestoreItem(item._id)} style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}><RotateCcw size={14} /> שחזור</button><button onClick={() => handlePermanentDelete(item._id)} style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem' }}><Trash2 size={14} /> מחק סופית</button></div></div> )
                })}</div> )}
              </div>
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}><button onClick={() => setIsRecycleBinOpen(false)} className={styles.cancelBtn} style={{ padding: '8px 20px', borderRadius: '8px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer' }}>סגור חלונית</button></div>
            </div>
          </div>
        )}

        {isMaxPinsModalOpen && (
          <div className={styles.modalOverlay} onClick={() => setMaxPinsModalOpen(false)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', border: '1px solid var(--brand-color)' }}>
              <button onClick={() => setMaxPinsModalOpen(false)} className={styles.closeModal}><X size={20}/></button>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><Star size={56} color="var(--brand-color)" /></div>
              <h2 style={{ marginBottom: '15px' }}>הגעת למקסימום מועדפים</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '30px', lineHeight: '1.6', fontSize: '1rem' }}>ניתן להציג עד 10 מועדפים מוצמדים במסך הראשי.<br/><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'block', marginTop: '10px' }}>כדי להצמיד מועדף זה, אנא הסר קודם מועדף אחר מהמסך הראשי (לחיצה על סמל הנעץ שלו).</span></p>
              <button onClick={() => setMaxPinsModalOpen(false)} className={styles.submitModalBtn} style={{ width: '100%' }}>הבנתי, תודה</button>
            </div>
          </div>
        )}

        {toastMessage && (
          <div style={{ position: 'fixed', bottom: '40px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-main)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--text-main)', padding: '12px 24px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 25px -5px var(--shadow-color)', zIndex: 9999, animation: 'floatUpWow 0.3s ease-out forwards' }}>
            <Trash2 size={18} color="#ef4444" />
            <span>{toastMessage}</span>
          </div>
        )}

        <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {renderDragOverlay()}
        </DragOverlay>

      </div>
    </DndContext>
  );
}