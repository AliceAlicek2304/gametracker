import React, { useEffect, useState } from 'react';
import styles from './EventManagement.module.css';
import { showToast } from '../utils/toast';
import { apiFetch } from '../utils/apiHelper';

type EventItem = {
  id: number;
  title: string;
  description?: string;
  startAt?: string;
  endAt?: string;
  imageUrl?: string;
  link?: string;
  version?: string;
  metadata?: string;
  isActive?: boolean;
  createdAt?: string;
}

const buildHeaders = (contentType?: string): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

const escapeHtml = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const renderFormattedText = (input: string) => {
  if (!input) return '';
  let out = escapeHtml(input);
  out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/\r?\n/g, '<br/>');
  return out;
}

const EventManagement: React.FC = () => {
  const [items, setItems] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all'|'active'|'inactive'>('all');
  const [sortOption, setSortOption] = useState<'createdDesc'|'createdAsc'|'titleAsc'|'titleDesc'>('createdDesc');
  const [showDetail, setShowDetail] = useState<EventItem | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState<null | { id: number; title?: string; currentImage?: string }>(null);
  const [createForm, setCreateForm] = useState({ title: '', description: '', startAt: '', endAt: '', link: '', version: '', metadata: '', isActive: true });
  const [form, setForm] = useState({ title: '', description: '', startAt: '', endAt: '', link: '', version: '', metadata: '', isActive: true });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 21;

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('events', { headers: buildHeaders() });
      if (res.ok) {
        const data: EventItem[] = await res.json();
        data.sort((a,b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0));
        setItems(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchItems(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch('events', {
        method: 'POST',
        headers: buildHeaders('application/json'),
        body: JSON.stringify({ title: createForm.title, description: createForm.description, startAt: createForm.startAt || null, endAt: createForm.endAt || null, link: createForm.link, version: createForm.version, metadata: createForm.metadata, isActive: createForm.isActive }),
      });
      if (res.ok) {
        const data = await res.json();
        setShowCreate(false);
  setCreateForm({ title: '', description: '', startAt: '', endAt: '', link: '', version: '', metadata: '', isActive: true });
        setShowUpload({ id: data.id, title: data.title, currentImage: data.imageUrl });
        fetchItems();
        showToast.success('Event created successfully');
      } else {
        const txt = await res.text();
        showToast.error(txt || 'Create failed');
      }
    } catch (err) { console.error(err); showToast.error('Network error'); }
  }

  const openEdit = (it: EventItem) => { setEditingId(it.id); setForm({ title: it.title || '', description: it.description || '', startAt: it.startAt || '', endAt: it.endAt || '', link: it.link || '', version: it.version || '', metadata: it.metadata || '', isActive: !!it.isActive }); }

  const openUploadModal = (it: EventItem) => { setShowUpload({ id: it.id, title: it.title, currentImage: it.imageUrl }); setUploadFile(null); }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    try {
      const res = await apiFetch(`events/${editingId}`, {
        method: 'PUT',
        headers: buildHeaders('application/json'),
        body: JSON.stringify({ title: form.title, description: form.description, startAt: form.startAt || null, endAt: form.endAt || null, link: form.link, version: form.version, metadata: form.metadata, isActive: form.isActive }),
      });
      if (res.ok) {
        setEditingId(null);
  setForm({ title: '', description: '', startAt: '', endAt: '', link: '', version: '', metadata: '', isActive: true });
        fetchItems();
        showToast.success('Event updated successfully');
      } else {
        const txt = await res.text();
        showToast.error(txt || 'Update failed');
      }
    } catch (err) { console.error(err); showToast.error('Network error'); }
  }

  const handleDeactivate = async (id: number, active?: boolean) => {
    try {
      const res = await apiFetch(`events/${id}/deactivate`, { method: 'PATCH', headers: buildHeaders('application/json'), body: JSON.stringify({ isActive: !active }) });
      if (res.ok) {
        fetchItems();
        if (showDetail && showDetail.id === id) setShowDetail({ ...showDetail, isActive: !active });
        showToast.success(active ? 'Event deactivated' : 'Event activated');
      } else showToast.error('Action failed');
    } catch (err) { console.error(err); showToast.error('Network error'); }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure to delete this event?')) return;
    try {
      const res = await apiFetch(`events/${id}`, { method: 'DELETE', headers: buildHeaders() });
      if (res.ok) {
        fetchItems();
        setShowDetail(null);
        showToast.success('Event deleted successfully');
      } else showToast.error('Delete failed');
    } catch (err) { console.error(err); showToast.error('Network error'); }
  }

  const handleUploadImage = async (id: number, f: File) => {
    const fd = new FormData(); fd.append('image', f);
    const res = await apiFetch(`events/${id}/upload-image`, { method: 'POST', headers: buildHeaders(), body: fd });
    if (res.ok) {
      fetchItems();
      showToast.success('Image uploaded successfully');
    } else showToast.error('Upload failed');
    return res.ok;
  }

  const displayed = (() => {
    const q = search.trim().toLowerCase();
    let filtered = items.filter(i => {
      if (activeFilter === 'active' && !i.isActive) return false;
      if (activeFilter === 'inactive' && i.isActive) return false;
      if (!q) return true;
      const title = (i.title || '').toLowerCase();
    const desc = (i.description || '').toLowerCase();
      return title.includes(q) || desc.includes(q);
    });
    filtered.sort((a,b) => {
      if (sortOption === 'createdDesc') return (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0);
      if (sortOption === 'createdAsc') return (a.createdAt ? new Date(a.createdAt).getTime() : 0) - (b.createdAt ? new Date(b.createdAt).getTime() : 0);
      if (sortOption === 'titleAsc') return (a.title || '').localeCompare(b.title || '');
      if (sortOption === 'titleDesc') return (b.title || '').localeCompare(a.title || '');
      return 0;
    });
    return filtered;
  })();

  const totalPages = Math.ceil(displayed.length / itemsPerPage);
  const paginated = displayed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [search, activeFilter, sortOption]);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.title}>Event Management</div>
        <div className={styles.topBarCenter}>
          <input className={styles.searchInput} placeholder="Search title or description" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className={styles.select} value={activeFilter} onChange={e=>setActiveFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className={styles.select} value={sortOption} onChange={e=>setSortOption(e.target.value as any)}>
            <option value="createdDesc">Created (newest)</option>
            <option value="createdAsc">Created (oldest)</option>
            <option value="titleAsc">Title (A → Z)</option>
            <option value="titleDesc">Title (Z → A)</option>
          </select>
        </div>
        <div className={styles.controls}>
          <button className={styles.btn} onClick={() => { setCreateForm({ title: '', description: '', startAt: '', endAt: '', link: '', version: '', metadata: '', isActive: true }); setShowCreate(true); }}>Create Event</button>
          <button className={styles.btn} onClick={() => fetchItems()}>Refresh</button>
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? <div className={styles.loading}>Loading...</div> : (
          paginated.map(it => (
            <div key={it.id} className={styles.card}>
              <div style={{width:'100%',height:'100%',display:'flex',flexDirection:'column'}}>
                <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowDetail(it)}>
                  {it.imageUrl ? <img src={it.imageUrl} alt={it.title} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} /> : <div style={{width:'100%',height:'100%',background:'#111'}} />}
                </div>
                <div className={styles.cardOverlay} style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
                  <div>
                    <div className={styles.cardTitle}>{it.title}</div>
                    <div className={styles.cardSubtitle}>{it.version ? `${it.version}` : ''} {it.startAt ? `• ${it.startAt}` : ''}</div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>← Prev</button>
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button key={page} className={`${styles.pageNum} ${currentPage === page ? styles.active : ''}`} onClick={() => setCurrentPage(page)}>{page}</button>
            ))}
          </div>
          <button className={styles.pageBtn} onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>Next →</button>
        </div>
      )}

      {showCreate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ position: 'relative' }}>
            <button className={styles.closeBtn} onClick={() => setShowCreate(false)} title="Close">×</button>
            <h3>Create Event</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.formRow}><label>Title</label><input type="text" value={createForm.title} onChange={e=>setCreateForm({...createForm, title: e.target.value})} /></div>
              <div className={styles.formRow}><label>Description</label><textarea value={createForm.description} onChange={e=>setCreateForm({...createForm, description: e.target.value})} rows={3} /></div>
              <div className={styles.formRow}><label>Start At</label><input type="datetime-local" value={createForm.startAt} onChange={e=>setCreateForm({...createForm, startAt: e.target.value})} /></div>
              <div className={styles.formRow}><label>End At</label><input type="datetime-local" value={createForm.endAt} onChange={e=>setCreateForm({...createForm, endAt: e.target.value})} /></div>
              <div className={styles.formRow}><label>Link</label><input type="text" value={createForm.link} onChange={e=>setCreateForm({...createForm, link: e.target.value})} /></div>
              <div className={styles.formRow}><label>Version</label><input type="text" value={createForm.version} onChange={e=>setCreateForm({...createForm, version: e.target.value})} /></div>
              <div className={styles.formRow}><label>Metadata</label><input type="text" value={createForm.metadata} onChange={e=>setCreateForm({...createForm, metadata: e.target.value})} /></div>
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
            <h3>Edit Event</h3>
            <form onSubmit={handleUpdate}>
              <div className={styles.formRow}><label>Title</label><input type="text" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} /></div>
              <div className={styles.formRow}><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={3} /></div>
              <div className={styles.formRow}><label>Start At</label><input type="datetime-local" value={form.startAt} onChange={e=>setForm({...form, startAt: e.target.value})} /></div>
              <div className={styles.formRow}><label>End At</label><input type="datetime-local" value={form.endAt} onChange={e=>setForm({...form, endAt: e.target.value})} /></div>
              <div className={styles.formRow}><label>Link</label><input type="text" value={form.link} onChange={e=>setForm({...form, link: e.target.value})} /></div>
              <div className={styles.formRow}><label>Version</label><input type="text" value={form.version} onChange={e=>setForm({...form, version: e.target.value})} /></div>
              <div className={styles.formRow}><label>Metadata</label><input type="text" value={form.metadata} onChange={e=>setForm({...form, metadata: e.target.value})} /></div>
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
            <h3>Upload Image for {showUpload.title}</h3>
            <div className={styles.formRow}>
              <div className={styles.filePreview} style={{display:'flex',alignItems:'center',gap:8}}>
                {showUpload.currentImage ? <img src={showUpload.currentImage} alt={showUpload.title} style={{width:64,height:64,objectFit:'cover',borderRadius:8}} /> : <div style={{width:64,height:64,background:'#111',borderRadius:8}} />}
                <div style={{fontWeight:600}}>{showUpload.title}</div>
              </div>
            </div>
            <div className={styles.formRow}><input type="file" onChange={e=> setUploadFile(e.target.files?.[0] || null)} /></div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button className={styles.smallBtn} onClick={() => setShowUpload(null)}>Cancel</button>
              <button className={styles.smallBtn} onClick={async () => {
                if (!uploadFile || !showUpload) { showToast.warning('Please select a file'); return; }
                const ok = await handleUploadImage(showUpload.id, uploadFile);
                if (ok) setShowUpload(null);
              }}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{width:820, maxWidth: '96vw', position: 'relative'}}>
            <button className={styles.closeBtn} onClick={() => setShowDetail(null)} title="Close">×</button>
            <h3>{showDetail.title}</h3>
            <div style={{display:'flex',gap:16, flexWrap: 'wrap'}}>
              <div style={{minWidth:200}}>
                {showDetail.imageUrl ? <img src={showDetail.imageUrl} alt={showDetail.title} style={{width:200,height:200,objectFit:'cover',borderRadius:8}} /> : <div style={{width:200,height:200,background:'#111',borderRadius:8}} />}
                <div style={{display:'flex',gap:8,marginTop:12,flexDirection:'column'}}>
                  <button className={styles.smallBtn} onClick={() => { setShowDetail(null); openUploadModal(showDetail); }}>Upload Image</button>
                  <button className={styles.smallBtn} onClick={() => { setShowDetail(null); openEdit(showDetail); }}>Edit</button>
                  <button className={`${styles.smallBtn} ${styles.muted}`} onClick={() => handleDeactivate(showDetail.id, showDetail.isActive)}>{showDetail.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button className={`${styles.smallBtn} ${styles.danger}`} onClick={async ()=>{ if (!confirm('Delete?')) return; await handleDelete(showDetail.id); setShowDetail(null); }}>Delete</button>
                </div>
              </div>
              <div style={{flex:1, minWidth: 300}}>
                <div style={{marginBottom:12,padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8}}>
                  <div style={{marginBottom:8}}><strong>Version:</strong> {showDetail.version || ''}</div>
                  <div style={{marginBottom:8}}><strong>Active:</strong> {showDetail.isActive ? 'Yes' : 'No'}</div>
                  <div style={{marginBottom:8}}><strong>Created:</strong> {showDetail.createdAt || ''}</div>
                  <div style={{marginBottom:8}}><strong>Start:</strong> {showDetail.startAt || ''}</div>
                  <div style={{marginBottom:8}}><strong>End:</strong> {showDetail.endAt || ''}</div>
                </div>

                <div style={{marginBottom:12,padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8}}>
                  <strong>Short Description:</strong>
                  <div style={{marginTop:6, lineHeight:1.5}} dangerouslySetInnerHTML={{__html: renderFormattedText(String(showDetail.description || ''))}} />
                </div>

                {showDetail.link && (
                  <div style={{marginBottom:12,padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8}}>
                    <strong>Link:</strong>
                    <div style={{marginTop:6}}><a href={showDetail.link} target="_blank" rel="noreferrer">{showDetail.link}</a></div>
                  </div>
                )}

                {showDetail.metadata && (
                  <div style={{marginBottom:12,padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8}}>
                    <strong>Metadata:</strong>
                    <div style={{marginTop:6}}>{showDetail.metadata}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EventManagement;
