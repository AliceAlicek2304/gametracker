import React, { useEffect, useState } from 'react';
import styles from './EchoManagement.module.css';
import { showToast } from '../utils/toast';

type Echo = { id:number; name:string; imageUrl?:string; description?:string; cost?:number; skill?:any; setEchoId?:number | null; isActive?:boolean; createdDate?:string };
type SetEcho = { id:number; name:string; icon?:string };

const buildHeaders = (contentType?: string): HeadersInit => {
  const headers: Record<string,string> = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
}

// Convert plain description text into safe HTML with newline -> <br> and **bold** -> <strong>
function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderFormattedText(input: string) {
  if (!input) return '';
  // escape first
  let out = escapeHtml(input);
  // simple bold **text**
  out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  // convert newlines to <br>
  out = out.replace(/\r?\n/g, '<br/>');
  return out;
}

const EchoManagement: React.FC = () => {
  const [list, setList] = useState<Echo[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all'|'active'|'inactive'>('all');
  const [sortOption, setSortOption] = useState<'createdDesc'|'createdAsc'|'nameAsc'|'nameDesc'>('createdDesc');
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Echo|null>(null);
  const [showDetail, setShowDetail] = useState<Echo|null>(null);
  const [setEchos, setSetEchos] = useState<SetEcho[]>([]);
  const [showUpload, setShowUpload] = useState<{id:number;name?:string;currentImage?:string}|null>(null);
  const [form, setForm] = useState<any>({ name:'', description:'', cost:0, skill:'', setEchoId: null });
  const [file, setFile] = useState<File|null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 21;

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/echoes', { headers: buildHeaders() });
      if (res.ok) {
        const data = await res.json();
        data.sort((a:any,b:any)=> (b.createdDate? new Date(b.createdDate).getTime():0) - (a.createdDate? new Date(a.createdDate).getTime():0));
        setList(data);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const fetchSetEchoes = async () => {
    try {
      const res = await fetch('/api/set-echoes', { headers: buildHeaders() });
      if (res.ok) {
        const data = await res.json();
        setSetEchos(data);
      }
    } catch (err) { console.error(err); }
  }

  useEffect(()=>{ fetchList(); }, []);
  useEffect(()=>{ fetchSetEchoes(); }, []);

  const displayed = (() => {
    const q = search.trim().toLowerCase();
    let filtered = list.filter(e => {
      if (activeFilter === 'active' && !e.isActive) return false;
      if (activeFilter === 'inactive' && e.isActive) return false;
      if (!q) return true;
      return (e.name||'').toLowerCase().includes(q) || (e.description||'').toLowerCase().includes(q);
    });

    filtered.sort((a,b) => {
      if (sortOption === 'createdDesc') return (b.createdDate ? new Date(b.createdDate).getTime() : 0) - (a.createdDate ? new Date(a.createdDate).getTime() : 0);
      if (sortOption === 'createdAsc') return (a.createdDate ? new Date(a.createdDate).getTime() : 0) - (b.createdDate ? new Date(b.createdDate).getTime() : 0);
      if (sortOption === 'nameAsc') return (a.name||'').localeCompare(b.name||'');
      if (sortOption === 'nameDesc') return (b.name||'').localeCompare(a.name||'');
      return 0;
    });

    return filtered;
  })();

  // Pagination
  const totalPages = Math.ceil(displayed.length / itemsPerPage);
  const paginatedEchoes = displayed.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter, sortOption]);

  const handleOpenCreate = () => { setEditing(null); setForm({ name:'', description:'', cost:0, skill:'', setEchoId: null }); setShowCreate(true); }

  const handleSubmit = async (ev:React.FormEvent) => {
    ev.preventDefault();
    try {
      const payload = { ...form };
      let res: Response;
      if (editing) {
        res = await fetch(`/api/echoes/${editing.id}`, { method:'PUT', headers: buildHeaders('application/json'), body: JSON.stringify(payload) });
      } else {
        res = await fetch('/api/echoes', { method:'POST', headers: buildHeaders('application/json'), body: JSON.stringify(payload) });
      }
      if (res.ok) {
        const data = await res.json();
        setShowCreate(false);
        // open upload modal only for new
        if (!editing) setShowUpload({ id: data.id, name: data.name, currentImage: data.imageUrl });
        fetchList();
        showToast.success(editing ? 'Echo updated successfully' : 'Echo created successfully');
      } else {
        const txt = await res.text(); showToast.error('Save failed: ' + txt);
      }
    } catch (e:any) { showToast.error('Save error: ' + (e?.message || e)); }
  }

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  const handleUpload = async () => {
    if (!showUpload) return;
    if (!file) { showToast.error('Please choose a file'); return; }
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch(`/api/echoes/${showUpload.id}/upload-image`, { method:'POST', headers: getAuthHeader() as any, body: fd });
      if (res.ok) { showToast.success('Uploaded'); setShowUpload(null); fetchList(); }
      else { showToast.error('Upload failed'); }
    } catch (e:any) { showToast.error('Upload error: ' + (e?.message || e)); }
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.title}>Echo Management</div>
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
          <button className={styles.btn} onClick={handleOpenCreate}>Create Echo</button>
          <button className={styles.btn} onClick={()=>fetchList()}>Refresh</button>
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? <div className={styles.loading}>Loading...</div> : (
          paginatedEchoes.map(e=> (
            <div key={e.id} className={styles.card} onClick={()=> { setShowDetail(e); }}>
              {e.imageUrl ? <img src={e.imageUrl} alt={e.name} className={styles.charImg} /> : <div className={styles.charPlaceholder} />}
              <div className={styles.cardOverlay}>
                <div className={styles.cardTitle}>{e.name}</div>
                <div className={styles.cardSubtitle}>{e.cost ? `${e.cost}` : ''}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Prev
          </button>
          
          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`${styles.pageNum} ${currentPage === page ? styles.active : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className={styles.pageBtn}
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {showCreate && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ position: 'relative' }}>
            <button 
              className={styles.closeBtn} 
              onClick={() => { setShowCreate(false); setEditing(null); }}
              title="Close"
            >
              ×
            </button>
            <h3>{editing ? 'Edit Echo' : 'Create Echo'}</h3>
            <form onSubmit={handleSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formCol}><label className={styles.formLabel}>Name</label><input className={styles.formInput} value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
                <div className={styles.formCol}><label className={styles.formLabel}>Cost</label><input type="number" className={styles.formInput} value={form.cost} onChange={e=>setForm({...form,cost: parseInt(e.target.value || '0')})} /></div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formCol}><label className={styles.formLabel}>Set Echo</label>
                  <select className={styles.select} value={form.setEchoId ?? ''} onChange={e=>setForm({...form, setEchoId: e.target.value === '' ? null : parseInt(e.target.value)})}>
                    <option value="">None</option>
                    {setEchos.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
              <div className={styles.formRow}><div className={styles.formCol}><label className={styles.formLabel}>Skill</label><textarea rows={4} className={styles.formInput} value={form.skill} onChange={e=>setForm({...form,skill:e.target.value})} /></div></div>
              <div className={styles.formRow}><div className={styles.formCol}><label className={styles.formLabel}>Description</label><textarea rows={4} className={styles.formInput} value={form.description} onChange={e=>setForm({...form,description:e.target.value})} /></div></div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
                <button type="button" className={`${styles.smallBtn} ${styles.muted}`} onClick={()=>{ setShowCreate(false); setEditing(null); }}>Cancel</button>
                <button type="submit" className={styles.smallBtn}>{editing ? 'Save' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetail && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{width:820, maxWidth: '96vw', position: 'relative'}}>
            <button 
              className={styles.closeBtn} 
              onClick={() => setShowDetail(null)}
              title="Close"
            >
              ×
            </button>
            <h3>{showDetail.name} {showDetail.cost ? `• Cost ${showDetail.cost}` : ''}</h3>
            <div style={{display:'flex',gap:16, flexWrap: 'wrap'}}>
              {/* Left column: Image + Actions */}
              <div style={{minWidth:200}}>
                {showDetail.imageUrl ? <img src={showDetail.imageUrl} alt={showDetail.name} style={{width:200,height:200,objectFit:'cover',borderRadius:8}} /> : <div style={{width:200,height:200,background:'#111',borderRadius:8}} />}
                <div style={{display:'flex',gap:8,marginTop:12,flexDirection:'column'}}>
                  <button className={styles.smallBtn} onClick={() => { setShowDetail(null); setShowUpload({ id: showDetail.id, name: showDetail.name, currentImage: showDetail.imageUrl }); setFile(null); }}>Upload Image</button>
                  <button className={styles.smallBtn} onClick={() => { setShowDetail(null); setEditing(showDetail); setForm({ name: showDetail.name, description: showDetail.description || '', cost: showDetail.cost || 0, skill: showDetail.skill || '', setEchoId: showDetail.setEchoId ?? null, imageUrl: showDetail.imageUrl ?? null }); setShowCreate(true); }}>Edit</button>
                  <button className={`${styles.smallBtn} ${styles.muted}`} onClick={async () => {
                    try {
                      const res = await fetch(`/api/echoes/${showDetail.id}/deactivate`, { method: 'PATCH', headers: buildHeaders('application/json'), body: JSON.stringify({ isActive: !showDetail.isActive }) });
                      if (res.ok) {
                        fetchList();
                        setShowDetail({ ...showDetail, isActive: !showDetail.isActive });
                        showToast.success(showDetail.isActive ? 'Echo deactivated' : 'Echo activated');
                      } else {
                        showToast.error('Action failed');
                      }
                    } catch (err) {
                      console.error(err);
                      showToast.error('Network error');
                    }
                  }}>{showDetail.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button className={`${styles.smallBtn} ${styles.danger}`} onClick={async () => {
                    if (!confirm('Are you sure to delete this echo?')) return;
                    try {
                      const res = await fetch(`/api/echoes/${showDetail.id}`, { method: 'DELETE', headers: buildHeaders() });
                      if (res.ok) {
                        fetchList();
                        setShowDetail(null);
                        showToast.success('Echo deleted successfully');
                      } else {
                        showToast.error('Delete failed');
                      }
                    } catch (err) {
                      console.error(err);
                      showToast.error('Network error');
                    }
                  }}>Delete</button>
                </div>
              </div>
              
              {/* Right column: Info sections */}
              <div style={{flex:1, minWidth: 300}}>
                {/* Basic Info */}
                <div style={{padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8,marginBottom:12}}>
                  <div style={{display:'flex',gap:16,flexWrap:'wrap'}}>
                    <div style={{flex:'1 1 150px'}}>
                      <div style={{fontSize:'0.85rem',opacity:0.7,marginBottom:4}}>Set Echo</div>
                      <div style={{fontWeight:600}}>{setEchos.find(s => s.id === showDetail.setEchoId)?.name || 'None'}</div>
                    </div>
                    <div style={{flex:'1 1 150px'}}>
                      <div style={{fontSize:'0.85rem',opacity:0.7,marginBottom:4}}>Status</div>
                      <div style={{fontWeight:600,color: showDetail.isActive ? '#4ade80' : '#f87171'}}>{showDetail.isActive ? 'Active' : 'Inactive'}</div>
                    </div>
                    <div style={{flex:'1 1 150px'}}>
                      <div style={{fontSize:'0.85rem',opacity:0.7,marginBottom:4}}>Cost</div>
                      <div style={{fontWeight:600}}>{showDetail.cost || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {showDetail.description && (
                  <div style={{padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8,marginBottom:12}}>
                    <div style={{fontSize:'0.85rem',opacity:0.7,marginBottom:8}}>Description</div>
                    <div style={{lineHeight:1.6}}>{showDetail.description}</div>
                  </div>
                )}

                {/* Skill */}
                {showDetail.skill && (
                  <div style={{padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8,marginBottom:12}}>
                    <div style={{fontSize:'0.85rem',opacity:0.7,marginBottom:8}}>Skill</div>
                    <div>
                      {(() => {
                        let raw: any = showDetail.skill;
                        let skillObj: any = raw;
                        if (typeof raw === 'string') {
                          try { skillObj = JSON.parse(raw); } catch (e) { skillObj = raw; }
                          if (typeof skillObj === 'string' && (skillObj.trim().startsWith('{') || skillObj.trim().startsWith('['))) {
                            try { skillObj = JSON.parse(skillObj); } catch (e) { /* ignore */ }
                          }
                        }

                        let sections = null as any;
                        if (skillObj && Array.isArray(skillObj.sections)) sections = skillObj.sections;
                        else if (skillObj && skillObj.skill && Array.isArray(skillObj.skill.sections)) sections = skillObj.skill.sections;

                        if (sections) {
                          return (
                            <div style={{display:'flex',flexDirection:'column',gap:12}}>
                              {sections.map((sec: any, i: number) => (
                                <div key={sec.id || i} style={{background:'#08121a',padding:12,borderRadius:8}}>
                                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                                    <div>
                                      <div style={{fontWeight:700,fontSize:16,color:'#ddd'}}>{sec.title || `Section ${i+1}`}</div>
                                    </div>
                                  </div>

                                  <div style={{color:'#ddd',marginBottom:8}}>
                                    {sec.description ? (
                                      (() => {
                                        const blocks = String(sec.description || '').split(/\n\s*\n/).map(b => b.trim()).filter(Boolean);
                                        return (
                                          <div>
                                            {blocks.map((blk: string, bi: number) => (
                                              <div key={bi} style={{marginBottom:8}}>
                                                {blk.split(/\r?\n/).map((line, li) => (
                                                  <div key={li} style={{marginBottom:6}} dangerouslySetInnerHTML={{__html: renderFormattedText(String(line).trim())}} />
                                                ))}
                                              </div>
                                            ))}
                                          </div>
                                        );
                                      })()
                                    ) : null}
                                  </div>
                                </div>
                              ))}
                            </div>
                          );
                        }

                        // fallback: formatted text preserving bold and newlines for string, or pretty JSON for objects
                        if (typeof skillObj === 'string') {
                          return <div style={{background:'#0f1720',padding:8,borderRadius:6,color:'#ddd'}} dangerouslySetInnerHTML={{__html: renderFormattedText(skillObj)}} />;
                        }
                        try {
                          return <pre style={{whiteSpace:'pre-wrap',background:'#0f1720',padding:8,borderRadius:6,color:'#ddd'}}>{JSON.stringify(skillObj, null, 2)}</pre>;
                        } catch (e) {
                          return <div style={{background:'#0f1720',padding:8,borderRadius:6,color:'#ddd'}} dangerouslySetInnerHTML={{__html: renderFormattedText(String(showDetail.skill))}} />;
                        }
                      })()}
                    </div>
                  </div>
                )}

                {/* Created Date */}
                <div style={{padding:12,background:'rgba(255,255,255,0.02)',borderRadius:8}}>
                  <div style={{fontSize:'0.85rem',opacity:0.7,marginBottom:4}}>Created Date</div>
                  <div>{showDetail.createdDate || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showUpload && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal} style={{ position: 'relative' }}>
            <button 
              className={styles.closeBtn} 
              onClick={() => setShowUpload(null)}
              title="Close"
            >
              ×
            </button>
            <h3>Upload Image for {showUpload.name}</h3>
            <div style={{display:'flex',gap:8,alignItems:'center'}}>
              <input type="file" onChange={e=>setFile(e.target.files ? e.target.files[0] : null)} />
              <div style={{marginLeft:'auto',display:'flex',gap:8}}>
                <button className={`${styles.smallBtn} ${styles.muted}`} onClick={()=> setShowUpload(null)}>Cancel</button>
                <button className={styles.smallBtn} onClick={handleUpload}>Upload</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default EchoManagement;
