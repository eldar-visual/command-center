'use client';
import { useState, useEffect } from 'react';

const API_URL = 'https://command-center-6pqx.onrender.com/api/data';

export default function Home() {
  const [state, setState] = useState({
    topics: [],
    quickPills: [],
    visualFavs: []
  });
  const [activeTab, setActiveTab] = useState(0);
  const [status, setStatus] = useState('loading'); // loading, error, success
  const [errorMsg, setErrorMsg] = useState('');

  // טעינה מהשרת
  useEffect(() => {
    fetch(API_URL)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setState(data);
        setStatus('success');
      })
      .catch(err => {
        console.error('Error fetching data:', err);
        setStatus('error');
        setErrorMsg('השרת לא זמין. ודא שהרצת את node index.js בתיקיית server.');
      });
  }, []);

  // פונקציית שמירה לשרת
  const saveData = async (newState) => {
    setState(newState); // עדכון אופטימיסטי
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newState)
      });
    } catch (err) {
      alert('שגיאה בשמירה לשרת');
    }
  };

  const addTopic = () => {
    const name = prompt('שם הנושא החדש:');
    if (!name) return;
    const newState = { ...state, topics: [...state.topics, { name, links: [] }] };
    saveData(newState);
  };

  const addLink = () => {
    const title = prompt('כותרת:');
    const url = prompt('URL:');
    if (!title || !url) return;
    
    // ניסיון לחילוץ דומיין עבור תמונה
    let domain = 'google.com';
    try { domain = new URL(url).hostname; } catch(e){}

    const newLink = { 
      title, 
      url, 
      desc: 'תיאור קצר', 
      img: `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
      time: new Date().toLocaleTimeString('he-IL', {hour: '2-digit', minute:'2-digit'})
    };

    const newTopics = [...state.topics];
    // הגנה למקרה שאין טאבים
    if (!newTopics[activeTab]) {
        alert('צור נושא קודם');
        return;
    }
    newTopics[activeTab].links.push(newLink);
    saveData({ ...state, topics: newTopics });
  };

  // תצוגת טעינה ושגיאה
  if (status === 'loading') return <div style={{textAlign:'center', marginTop: '100px', fontSize: '20px'}}>⏳ טוען מערכת...</div>;
  if (status === 'error') return (
    <div style={{textAlign:'center', marginTop: '100px', color: '#f87171'}}>
        <h2 style={{fontSize: '24px', marginBottom: '10px'}}>⛔ שגיאת חיבור</h2>
        <p>{errorMsg}</p>
        <button onClick={() => window.location.reload()} style={{padding: '10px 20px', marginTop: '20px', cursor: 'pointer'}}>נסה שוב</button>
    </div>
  );

  const currentTopic = state.topics[activeTab];

  return (
    <div className="container">
      <header>
        <h1 className="title">מרכז שליטה</h1>
        <p style={{color: '#64748b', letterSpacing: '4px', fontSize: '12px'}}>FULL STACK SYSTEM</p>
      </header>

      {/* טאבים */}
      <div className="tabs-container">
        {state.topics.map((topic, idx) => (
          <div 
            key={idx} 
            className={`tab ${activeTab === idx ? 'active' : ''}`}
            onClick={() => setActiveTab(idx)}
          >
            {topic.name}
          </div>
        ))}
        <button className="tab" onClick={addTopic}>+ נושא</button>
      </div>

      {/* תוכן ראשי */}
      <main className="glass main-content">
        {state.topics.length > 0 && currentTopic ? (
          <>
            <div className="topic-header">
              <h2 style={{margin:0}}>{currentTopic.name}</h2>
              <button className="btn-primary" onClick={addLink}>+ פריט חדש</button>
            </div>

            <div className="links-list">
              {currentTopic.links.map((link, idx) => (
                <div key={idx} className="glass link-item">
                  <img src={link.img} alt="" className="link-thumb" onError={(e) => e.target.style.display='none'} />
                  <div>
                    <a href={link.url} target="_blank" style={{color:'white', fontWeight:'bold', fontSize:'1.1rem', textDecoration:'none', display:'block'}}>{link.title}</a>
                    <div style={{color:'#94a3b8', fontSize:'0.9rem'}}>{link.desc} • {link.time}</div>
                  </div>
                </div>
              ))}
              {currentTopic.links.length === 0 && <p style={{color: '#64748b', textAlign: 'center', marginTop: '50px'}}>אין פריטים עדיין בקטגוריה זו</p>}
            </div>
          </>
        ) : (
          <div style={{textAlign:'center', marginTop:'100px', color: '#94a3b8'}}>
            <h3>עדיין אין נושאים</h3>
            <p>לחץ על "+ נושא" למעלה כדי להתחיל</p>
          </div>
        )}
      </main>

      {/* כפתורים מהירים */}
      <section className="pills-grid">
        <a href="https://google.com" className="pill" target="_blank">Google</a>
        <a href="https://youtube.com" className="pill" target="_blank">YouTube</a>
        <a href="https://chatgpt.com" className="pill" target="_blank">ChatGPT</a>
        <a href="https://whatsapp.com" className="pill" target="_blank">WhatsApp</a>
      </section>
    </div>
  );
}