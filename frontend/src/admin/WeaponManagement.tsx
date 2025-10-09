import React, { useEffect, useState } from 'react';
import styles from './WeaponManagement.module.css';

type Weapon = {
  id: number;
  name: string;
  weaponType?: string;
  description?: string;
  imageUrl?: string;
  mainStats?: string;
  subStats?: string;
  subStatsType?: string;
  skill?: string;
  rarity?: number;
  isActive?: boolean;
  createdDate?: string;
}

const buildHeaders = (contentType?: string): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

// simple HTML escape + **bold** -> <strong> + newline -> <br/>
function escapeHtml(s: string) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderFormattedText(input: string) {
  if (!input) return '';
  let out = escapeHtml(input);
  out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\r?\n/g, '<br/>');
  return out;
}

const weaponOptions = ['BROADBLADE','GAUNTLETS','PISTOLS','RECTIFIER','SWORD'];
const subStatsOptions = ['Atk','Def','Hp','CritDamage','CritRate','Energy Regen'];

const WeaponManagement: React.FC = () => {
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all'|'active'|'inactive'>('all');
  const [sortOption, setSortOption] = useState<'createdDesc'|'createdAsc'|'nameAsc'|'nameDesc'>('createdDesc');
  const [showDetail, setShowDetail] = useState<Weapon | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState<null | { id: number; name?: string; currentImage?: string }>(null);
  const [createForm, setCreateForm] = useState({ name: '', weaponType: weaponOptions[0], description: '', mainStats: '', subStats: '', subStatsType: subStatsOptions[0], skill: '', rarity: 1 });
  const [form, setForm] = useState({ name: '', weaponType: weaponOptions[0], description: '', mainStats: '', subStats: '', subStatsType: subStatsOptions[0], skill: '', rarity: 1 });
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const fetchWeapons = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/weapons', { headers: buildHeaders() });
      if (res.ok) {
        const data: Weapon[] = await res.json();
        data.sort((a,b) => (b.createdDate ? new Date(b.createdDate).getTime() : 0) - (a.createdDate ? new Date(a.createdDate).getTime() : 0));
        setWeapons(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchWeapons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
  const res = await fetch('/api/weapons', {
    method: 'POST',
    headers: buildHeaders('application/json'),
  body: JSON.stringify({ name: createForm.name, weaponType: createForm.weaponType, description: createForm.description, mainStats: createForm.mainStats, subStats: createForm.subStats, subStatsType: createForm.subStatsType, skill: createForm.skill, rarity: createForm.rarity }),
  });
      if (res.ok) {
        const data = await res.json();
  setShowCreate(false);
  setCreateForm({ name: '', weaponType: weaponOptions[0], description: '', mainStats: '', subStats: '', subStatsType: subStatsOptions[0], skill: '', rarity: 1 });
        setShowUpload({ id: data.id, name: data.name, currentImage: data.imageUrl });
        // refresh list
        fetchWeapons();
      } else {
        const txt = await res.text(); alert(txt || 'Create failed');
      }
    } catch (err) { console.error(err); }
  }

  const openEdit = (w: Weapon) => { setEditingId(w.id); setForm({ name: w.name || '', weaponType: w.weaponType || weaponOptions[0], description: w.description || '', mainStats: w.mainStats || '', subStats: w.subStats || '', subStatsType: w.subStatsType || subStatsOptions[0], skill: w.skill || '', rarity: w.rarity || 1 }); }

  const openUploadModal = (w: Weapon) => { setShowUpload({ id: w.id, name: w.name, currentImage: w.imageUrl }); setUploadFile(null); }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
  const res = await fetch(`/api/weapons/${editingId}`, {
    method: 'PUT',
    headers: buildHeaders('application/json'),
  body: JSON.stringify({ name: form.name, weaponType: form.weaponType, description: form.description, mainStats: form.mainStats, subStats: form.subStats, subStatsType: form.subStatsType, skill: form.skill, rarity: form.rarity }),
  });
  if (res.ok) { setEditingId(null); setForm({ name: '', weaponType: weaponOptions[0], description: '', mainStats: '', subStats: '', subStatsType: subStatsOptions[0], skill: '', rarity: 1 }); fetchWeapons(); }
      else { const txt = await res.text(); alert(txt || 'Update failed'); }
    } catch (err) { console.error(err); }
  }

  const handleDeactivate = async (id: number, active?: boolean) => {
    try {
      const res = await fetch(`/api/weapons/${id}/deactivate`, { method: 'PATCH', headers: buildHeaders('application/json'), body: JSON.stringify({ isActive: !active }) });
      if (res.ok) {
        // refresh list
        fetchWeapons();
        // if detail modal is open for this weapon, update it immediately so UI reflects new state
        if (showDetail && showDetail.id === id) {
          setShowDetail({ ...showDetail, isActive: !active });
        }
      }
    } catch (err) { console.error(err); }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure to delete this weapon?')) return;
    try {
      const res = await fetch(`/api/weapons/${id}`, { method: 'DELETE', headers: buildHeaders() });
      if (res.ok) {
        fetchWeapons();
        setShowDetail(null);
      }
    } catch (err) { console.error(err); }
  }

  const handleUploadImage = async (id: number, f: File) => {
    const fd = new FormData(); fd.append('image', f);
    const res = await fetch(`/api/weapons/${id}/upload-image`, { method: 'POST', headers: buildHeaders(), body: fd });
    if (res.ok) fetchWeapons();
    return res.ok;
  }

  const displayed = (() => {
    const q = search.trim().toLowerCase();
    let filtered = weapons.filter(w => {
      if (activeFilter === 'active' && !w.isActive) return false;
      if (activeFilter === 'inactive' && w.isActive) return false;
      if (!q) return true;
      const name = (w.name || '').toLowerCase();
      const desc = (w.description || '').toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
    filtered.sort((a,b) => {
      if (sortOption === 'createdDesc') return (b.createdDate ? new Date(b.createdDate).getTime() : 0) - (a.createdDate ? new Date(a.createdDate).getTime() : 0);
      if (sortOption === 'createdAsc') return (a.createdDate ? new Date(a.createdDate).getTime() : 0) - (b.createdDate ? new Date(b.createdDate).getTime() : 0);
      if (sortOption === 'nameAsc') return (a.name || '').localeCompare(b.name || '');
      if (sortOption === 'nameDesc') return (b.name || '').localeCompare(a.name || '');
      return 0;
    });
    return filtered;
  })();

  // visual styles for rarity (1..5)
  const rarityStyles: Record<number, React.CSSProperties> = {
    1: { border: '2px solid #9ca3af', boxShadow: '0 4px 12px rgba(156,163,175,0.06)' }, // gray
    2: { border: '2px solid #10b981', boxShadow: '0 4px 12px rgba(16,185,129,0.06)' }, // green
    3: { border: '2px solid #3b82f6', boxShadow: '0 4px 12px rgba(59,130,246,0.06)' }, // blue
    4: { border: '2px solid rebeccapurple', boxShadow: '0 4px 12px rgba(138,43,226,0.08)' }, // purple
    5: { border: '2px solid gold', boxShadow: '0 4px 12px rgba(255,215,0,0.12)' }, // gold
  };

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.title}>Weapon Management</div>
        <div className={styles.topBarCenter}>
          <input className={styles.searchInput} placeholder="Search name or description" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className={styles.select} value={activeFilter} onChange={e=>setActiveFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className={styles.select} value={sortOption} onChange={e=>setSortOption(e.target.value as any)}>
            <option value="createdDesc">Created (newest)</option>
            <option value="createdAsc">Created (oldest)</option>
            <option value="nameAsc">Name (A → Z)</option>
            <option value="nameDesc">Name (Z → A)</option>
          </select>
        </div>
        <div className={styles.controls}>
          <button className={styles.btn} onClick={() => { setCreateForm({ name: '', weaponType: weaponOptions[0], description: '', mainStats: '', subStats: '', subStatsType: subStatsOptions[0], skill: '', rarity: 1 }); setShowCreate(true); }}>Create Weapon</button>
          <button className={styles.btn} onClick={() => fetchWeapons()}>Refresh</button>
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? <div className={styles.loading}>Loading...</div> : (
          displayed.map(w => (
            <div key={w.id} className={styles.card} style={w.rarity ? rarityStyles[w.rarity] || undefined : undefined}>
              <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column'}}>
                <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowDetail(w)}>
                  {w.imageUrl ? <img src={w.imageUrl} alt={w.name} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} /> : <div style={{width:'100%',height:'100%',background:'#111'}} />}
                </div>
                <div className={styles.cardOverlay} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                  <div>
                    <div className={styles.cardTitle}>{w.name}</div>
                    <div className={styles.cardSubtitle}>{w.rarity ? `${w.rarity}★` : ''} {w.weaponType || ''}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showCreate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Create Weapon</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.formRow}>
                <label>Name</label>
                <input type="text" value={createForm.name} onChange={e=>setCreateForm({...createForm, name: e.target.value})} />
              </div>
              <div className={styles.formRow}>
                <label>Weapon Type</label>
                <select value={createForm.weaponType} onChange={e=>setCreateForm({...createForm, weaponType: e.target.value})} className={styles.select}>
                  {weaponOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className={styles.formRow}>
                <label>Sub stats type</label>
                <select value={createForm.subStatsType} onChange={e=>setCreateForm({...createForm, subStatsType: e.target.value})} className={styles.select}>
                  {subStatsOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.formRow}>
                <label>Description</label>
                <textarea value={createForm.description} onChange={e=>setCreateForm({...createForm, description: e.target.value})} rows={4} />
              </div>
              <div className={styles.formRow}>
                <label>Main stats</label>
                <input type="text" value={createForm.mainStats} onChange={e=>setCreateForm({...createForm, mainStats: e.target.value})} />
              </div>
              <div className={styles.formRow}>
                <label>Sub stats</label>
                <input type="text" value={createForm.subStats} onChange={e=>setCreateForm({...createForm, subStats: e.target.value})} />
              </div>
              <div className={styles.formRow}>
                <label>Rarity</label>
                <select value={createForm.rarity} onChange={e=>setCreateForm({...createForm, rarity: Number(e.target.value)})} className={styles.select}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}★</option>)}
                </select>
              </div>
              <div className={styles.formRow}>
                <label>Skill</label>
                <textarea value={createForm.skill} onChange={e=>setCreateForm({...createForm, skill: e.target.value})} rows={3} />
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button type="button" className={styles.smallBtn} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className={styles.smallBtn}>Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit Weapon</h3>
            <form onSubmit={handleUpdate}>
              <div className={styles.formRow}>
                <label>Name</label>
                <input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
              </div>
              <div className={styles.formRow}>
                <label>Weapon Type</label>
                <select value={form.weaponType} onChange={e=>setForm({...form, weaponType: e.target.value})} className={styles.select}>
                  {weaponOptions.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div className={styles.formRow}>
                <label>Sub stats type</label>
                <select value={form.subStatsType} onChange={e=>setForm({...form, subStatsType: e.target.value})} className={styles.select}>
                  {subStatsOptions.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className={styles.formRow}>
                <label>Description</label>
                <textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={4} />
              </div>
              <div className={styles.formRow}>
                <label>Main stats</label>
                <input type="text" value={form.mainStats} onChange={e=>setForm({...form, mainStats: e.target.value})} />
              </div>
              <div className={styles.formRow}>
                <label>Sub stats</label>
                <input type="text" value={form.subStats} onChange={e=>setForm({...form, subStats: e.target.value})} />
              </div>
              <div className={styles.formRow}>
                <label>Rarity</label>
                <select value={form.rarity} onChange={e=>setForm({...form, rarity: Number(e.target.value)})} className={styles.select}>
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}★</option>)}
                </select>
              </div>
              <div className={styles.formRow}>
                <label>Skill</label>
                <textarea value={form.skill} onChange={e=>setForm({...form, skill: e.target.value})} rows={3} />
              </div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button type="button" className={styles.smallBtn} onClick={() => setEditingId(null)}>Cancel</button>
                <button type="submit" className={styles.smallBtn}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpload && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Upload Image for {showUpload.name}</h3>
            <div className={styles.formRow}>
              <div className={styles.filePreview} style={{display:'flex',alignItems:'center',gap:8}}>
                {showUpload.currentImage ? <img src={showUpload.currentImage} alt={showUpload.name} style={{width:64,height:64,objectFit:'cover',borderRadius:8}} /> : <div style={{width:64,height:64,background:'#111',borderRadius:8}} />}
                <div style={{fontWeight:600}}>{showUpload.name}</div>
              </div>
            </div>
            <div className={styles.formRow}>
              <input type="file" onChange={e=> setUploadFile(e.target.files?.[0] || null)} />
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className={styles.smallBtn} onClick={() => setShowUpload(null)}>Cancel</button>
              <button className={styles.smallBtn} onClick={async () => {
                if (!uploadFile || !showUpload) return alert('Select a file');
                const ok = await handleUploadImage(showUpload.id, uploadFile);
                if (ok) setShowUpload(null);
              }}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{width:720}}>
            <h3>{showDetail.name}</h3>
            <div style={{display:'flex',gap:16}}>
              <div style={{minWidth:200}}>
                {showDetail.imageUrl ? <img src={showDetail.imageUrl} alt={showDetail.name} style={{width:200,height:200,objectFit:'cover',borderRadius:8}} /> : <div style={{width:200,height:200,background:'#111',borderRadius:8}} />}
              </div>
              <div style={{flex:1}}>
                <div style={{marginBottom:8}}><strong>Type:</strong> {showDetail.weaponType}</div>
                <div style={{marginBottom:8}}><strong>Active:</strong> {showDetail.isActive ? 'Yes' : 'No'}</div>
                <div style={{marginBottom:8}}><strong>Created:</strong> {showDetail.createdDate || ''}</div>
                <div style={{marginBottom:8}}><strong>Description:</strong>
                  <div style={{marginTop:6}} dangerouslySetInnerHTML={{__html: renderFormattedText(String(showDetail.description || ''))}} />
                </div>
                {showDetail.mainStats && <div style={{marginBottom:8}}><strong>Main stats:</strong> <div style={{marginTop:6}}>{showDetail.mainStats}</div></div>}
                {showDetail.subStats && <div style={{marginBottom:8}}><strong>Sub stats:</strong> <div style={{marginTop:6}}>{showDetail.subStats}</div></div>}
                {showDetail.subStatsType && <div style={{marginBottom:8}}><strong>Sub stats type:</strong> <div style={{marginTop:6}}>{showDetail.subStatsType}</div></div>}
                {showDetail.skill && <div style={{marginBottom:8}}><strong>Skill:</strong> <div style={{marginTop:6}} dangerouslySetInnerHTML={{__html: renderFormattedText(String(showDetail.skill || ''))}} /></div>}
                <div style={{display:'flex',gap:8,marginTop:12}}>
                  <button className={styles.smallBtn} onClick={() => { setShowDetail(null); openUploadModal(showDetail); }}>Upload Image</button>
                  <button className={styles.smallBtn} onClick={() => { setShowDetail(null); openEdit(showDetail); }}>Edit</button>
                  <button
                    className={`${styles.smallBtn} ${styles.muted}`}
                    onClick={() => handleDeactivate(showDetail.id, showDetail.isActive)}
                  >{showDetail.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button className={`${styles.smallBtn} ${styles.danger}`} onClick={() => { if (showDetail) { if (confirm('Are you sure to delete this weapon?')) handleDelete(showDetail.id); } }}>Delete</button>
                  <button className={styles.smallBtn} onClick={() => setShowDetail(null)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default WeaponManagement;
