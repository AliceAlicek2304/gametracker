import React, { useEffect, useState } from 'react';
import styles from './SetEchoManagement.module.css';

type SetEcho = {
  id: number;
  icon?: string;
  name: string;
  description?: string;
  skill?: string;
  isActive?: boolean;
  createdDate?: string;
}

const buildHeaders = (contentType?: string): HeadersInit => {
  const headers: Record<string,string> = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

const SetEchoManagement: React.FC = () => {
  const [items, setItems] = useState<SetEcho[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<null | SetEcho>(null);
  const [showUpload, setShowUpload] = useState<null | { id: number; name?: string; currentIcon?: string }>(null);
  const [form, setForm] = useState({ name: '', description: '', skill: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortOption, setSortOption] = useState<'createdDesc' | 'createdAsc' | 'nameAsc' | 'nameDesc'>('createdDesc');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/set-echoes', { headers: buildHeaders() });
      if (res.ok) {
        const data: SetEcho[] = await res.json();
        data.sort((a,b) => (b.createdDate ? new Date(b.createdDate).getTime() : 0) - (a.createdDate ? new Date(a.createdDate).getTime() : 0));
        setItems(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(()=>{ fetchItems(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/set-echoes', { method: 'POST', headers: buildHeaders('application/json'), body: JSON.stringify({ name: form.name, description: form.description, skill: form.skill }) });
      if (res.ok) {
        const data = await res.json();
        setShowCreate(false); setForm({ name: '', description: '', skill: '' });
        // open upload modal to add icon
        setShowUpload({ id: data.id, name: data.name, currentIcon: data.icon });
        fetchItems();
      } else { const txt = await res.text(); alert(txt || 'Create failed'); }
    } catch (err) { console.error(err); }
  }

  const openEdit = (s: SetEcho) => { setShowEdit(s); setForm({ name: s.name, description: s.description || '', skill: s.skill || '' }); }
  const openUploadModal = (s: SetEcho) => { setShowUpload({ id: s.id, name: s.name, currentIcon: s.icon }); setUploadFile(null); }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    try {
      const res = await fetch(`/api/set-echoes/${showEdit.id}`, { method: 'PUT', headers: buildHeaders('application/json'), body: JSON.stringify({ name: form.name, description: form.description, skill: form.skill }) });
      if (res.ok) { setShowEdit(null); setForm({ name: '', description: '', skill: '' }); fetchItems(); }
    } catch (err) { console.error(err); }
  }

  const handleDeactivate = async (id: number, active: boolean) => {
    try {
      const res = await fetch(`/api/set-echoes/${id}/deactivate`, { method: 'PATCH', headers: buildHeaders('application/json'), body: JSON.stringify({ isActive: !active }) });
      if (res.ok) fetchItems();
    } catch (err) { console.error(err); }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure to delete this item?')) return;
    try {
      const res = await fetch(`/api/set-echoes/${id}`, { method: 'DELETE', headers: buildHeaders() });
      if (res.ok) fetchItems();
    } catch (err) { console.error(err); }
  }

  const handleUploadIcon = async (id: number, f: File) => {
    const fd = new FormData(); fd.append('icon', f);
    const res = await fetch(`/api/set-echoes/${id}/upload-icon`, { method: 'POST', headers: buildHeaders(), body: fd });
    if (res.ok) fetchItems();
    return res.ok;
  }

  const displayed = (() => {
    const q = search.trim().toLowerCase();
    let filtered = items.filter(i => {
      if (activeFilter === 'active' && !i.isActive) return false;
      if (activeFilter === 'inactive' && i.isActive) return false;
      if (!q) return true;
      const name = (i.name || '').toLowerCase();
      const desc = (i.description || '').toLowerCase();
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

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.title}>Set Echo Management</div>
        <div className={styles.topBarCenter}>
          <input placeholder="Search name or description" value={search} onChange={e=>setSearch(e.target.value)} className={styles.searchInput} />
          <select value={activeFilter} onChange={e=>setActiveFilter(e.target.value as any)} className={styles.select}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select value={sortOption} onChange={e=>setSortOption(e.target.value as any)} className={styles.select}>
            <option value="createdDesc">Created (newest)</option>
            <option value="createdAsc">Created (oldest)</option>
            <option value="nameAsc">Name (A → Z)</option>
            <option value="nameDesc">Name (Z → A)</option>
          </select>
        </div>
        <div className={styles.controls}>
          <button className={styles.btn} onClick={() => { setForm({ name: '', description: '', skill: '' }); setShowCreate(true); }}>Create Set Echo</button>
          <button className={styles.btn} onClick={() => fetchItems()}>Refresh</button>
        </div>
      </div>

      <table className={styles.table}>
        <thead><tr><th>Icon</th><th>Name</th><th>Description</th><th>Active</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={6}>Loading...</td></tr> : (
            displayed.map(i => (
              <tr key={i.id}>
                <td>{i.icon ? <img src={i.icon} className={styles.iconImg} alt="icon" /> : <div style={{width:48,height:48,background:'#eee',borderRadius:6}}/>}</td>
                <td>{i.name}</td>
                <td>{i.description}</td>
                <td>{i.isActive ? 'Yes' : 'No'}</td>
                <td>{i.createdDate ? new Date(i.createdDate).toLocaleString() : ''}</td>
                <td className={styles.actions}>
                  <button className={`${styles.smallBtn} ${styles.muted}`} onClick={()=>openEdit(i)}>Edit</button>
                  <button className={`${styles.smallBtn} ${styles.muted}`} onClick={()=>openUploadModal(i)}>Upload Icon</button>
                  <button className={`${styles.smallBtn} ${styles.danger}`} onClick={()=>handleDelete(i.id)}>Delete</button>
                  <button className={styles.smallBtn} onClick={()=>handleDeactivate(i.id, !!i.isActive)}>{i.isActive ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {showCreate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Create Set Echo</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.formRow}><label>Name</label><input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required /></div>
              <div className={styles.formRow}><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={4} /></div>
              <div className={styles.formRow}><label>Skill</label><textarea value={form.skill} onChange={e=>setForm({...form, skill: e.target.value})} rows={4} /></div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button type="button" className={styles.smallBtn} onClick={()=>setShowCreate(false)}>Cancel</button>
                <button className={styles.smallBtn} type="submit">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEdit && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit Set Echo</h3>
            <form onSubmit={handleUpdate}>
              <div className={styles.formRow}><label>Name</label><input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required /></div>
              <div className={styles.formRow}><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={4} /></div>
              <div className={styles.formRow}><label>Skill</label><textarea value={form.skill} onChange={e=>setForm({...form, skill: e.target.value})} rows={4} /></div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button type="button" className={styles.smallBtn} onClick={()=>{ setShowEdit(null); setForm({ name:'', description:'', skill: '' }); }}>Cancel</button>
                <button className={styles.smallBtn} type="submit">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showUpload && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Upload Icon for {showUpload.name || `#${showUpload.id}`}</h3>
            <div className={styles.formRow}>{showUpload.currentIcon ? <img src={showUpload.currentIcon} alt="current" style={{width:80,height:80,objectFit:'cover',borderRadius:8}} /> : <div style={{width:80,height:80,background:'#222',borderRadius:8}} />}</div>
            <div className={styles.formRow}><input type="file" onChange={e=> setUploadFile(e.target.files?.[0] || null)} /></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button type="button" className={styles.smallBtn} onClick={()=>{ setShowUpload(null); setUploadFile(null); }}>Cancel</button>
              <button className={styles.smallBtn} onClick={async ()=>{
                if (!uploadFile || !showUpload) return alert('Choose a file first');
                const ok = await handleUploadIcon(showUpload.id, uploadFile);
                if (ok) { setShowUpload(null); setUploadFile(null); fetchItems(); } else alert('Upload failed');
              }}>Upload</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default SetEchoManagement;
