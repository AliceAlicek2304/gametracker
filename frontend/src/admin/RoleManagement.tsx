import React, { useEffect, useState } from 'react';
import styles from './RoleManagement.module.css';
import { showToast } from '../utils/toast';

type Role = {
  id: number;
  icon?: string;
  name: string;
  description?: string;
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

const RoleManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState<null | Role>(null);
  const [showUpload, setShowUpload] = useState<null | { id: number; name?: string; currentIcon?: string }>(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortOption, setSortOption] = useState<'createdDesc' | 'createdAsc' | 'nameAsc' | 'nameDesc'>('createdDesc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchRoles = async () => {
    setLoading(true);
    try {
  const res = await fetch('/api/roles', { headers: buildHeaders() });
      if (res.ok) {
        const data: Role[] = await res.json();
        // Sort newest first by createdDate (fallback to 0 if missing)
        data.sort((a, b) => {
          const ta = a.createdDate ? new Date(a.createdDate).getTime() : 0;
          const tb = b.createdDate ? new Date(b.createdDate).getTime() : 0;
          return tb - ta;
        });
        setRoles(data);
      }
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  }

  useEffect(() => { fetchRoles(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/roles', {
        method: 'POST',
        headers: buildHeaders('application/json'),
        body: JSON.stringify({ name: form.name, description: form.description }),
      });
      if (res.ok) {
        // backend returns the created RoleResponse
        const data = await res.json();
        // close create modal, clear form
        setShowCreate(false);
        setForm({ name: '', description: '' });
        // open the dedicated Upload Icon modal so admin can immediately upload icon
        setShowUpload({ id: data.id, name: data.name, currentIcon: data.icon });
        // refresh list in background
        fetchRoles();
        showToast.success('Role created successfully');
      } else {
        const txt = await res.text();
        showToast.error(txt || 'Create failed');
      }
    } catch (err) {
      console.error(err);
      showToast.error('Network error');
    }
  }

  const openEdit = (r: Role) => { setShowEdit(r); setForm({ name: r.name, description: r.description || '' }); }

  const openUploadModal = (r: Role) => { setShowUpload({ id: r.id, name: r.name, currentIcon: r.icon }); setUploadFile(null); }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEdit) return;
    try {
      // JSON-only update (name/description). Icon handled separately by upload modal.
      const res = await fetch(`/api/roles/${showEdit.id}`, {
        method: 'PUT',
        headers: buildHeaders('application/json'),
        body: JSON.stringify({ name: form.name, description: form.description }),
      });
      if (res.ok) {
        setShowEdit(null);
        setForm({ name: '', description: '' });
        fetchRoles();
        showToast.success('Role updated successfully');
      } else {
        showToast.error('Update failed');
      }
    } catch (err) {
      console.error(err);
      showToast.error('Network error');
    }
  }

  const handleDeactivate = async (id: number, active: boolean) => {
    try {
      const res = await fetch(`/api/roles/${id}/deactivate`, { method: 'PATCH', headers: buildHeaders('application/json'), body: JSON.stringify({ isActive: !active }) });
      if (res.ok) {
        fetchRoles();
        showToast.success(active ? 'Role deactivated' : 'Role activated');
      } else {
        showToast.error('Action failed');
      }
    } catch (err) {
      console.error(err);
      showToast.error('Network error');
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure to delete this role?')) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: 'DELETE', headers: buildHeaders() });
      if (res.ok) {
        fetchRoles();
        showToast.success('Role deleted successfully');
      } else {
        showToast.error('Delete failed');
      }
    } catch (err) {
      console.error(err);
      showToast.error('Network error');
    }
  }

  const handleUploadIcon = async (id: number, f: File) => {
    const fd = new FormData(); fd.append('icon', f);
    const res = await fetch(`/api/roles/${id}/upload-icon`, { method: 'POST', headers: buildHeaders(), body: fd });
    if (res.ok) {
      fetchRoles();
      showToast.success('Icon uploaded successfully');
    } else {
      showToast.error('Upload failed');
    }
    return res.ok;
  }

  // compute displayed roles based on search, filter and sort
  const displayedRoles = (() => {
    const q = search.trim().toLowerCase();
    let filtered = roles.filter(r => {
      if (activeFilter === 'active' && !r.isActive) return false;
      if (activeFilter === 'inactive' && r.isActive) return false;
      if (!q) return true;
      const name = (r.name || '').toLowerCase();
      const desc = (r.description || '').toLowerCase();
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

  // Pagination
  const totalPages = Math.ceil(displayedRoles.length / itemsPerPage);
  const paginatedRoles = displayedRoles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter, sortOption]);

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.title}>Role Character Management</div>
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
          <button className={styles.btn} onClick={() => { setForm({ name: '', description: '' }); setShowCreate(true); }}>Create Role</button>
          <button className={styles.btn} onClick={() => fetchRoles()}>Refresh</button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr><th>Icon</th><th>Name</th><th>Description</th><th>Active</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan={6}>Loading...</td></tr> : (
              paginatedRoles.map(r => (
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
            
              <tr key={r.id}>
                <td>{r.icon ? <img src={r.icon} className={styles.iconImg} alt="icon" /> : <div style={{width:48,height:48,background:'#eee',borderRadius:6}}/>}</td>
                <td>{r.name}</td>
                <td>{r.description}</td>
                <td>{r.isActive ? 'Yes' : 'No'}</td>
                <td>{r.createdDate ? new Date(r.createdDate).toLocaleString() : ''}</td>
                <td className={styles.actions}>
                  <button className={`${styles.smallBtn} ${styles.muted}`} onClick={() => openEdit(r)}>Edit</button>
                  <button className={`${styles.smallBtn} ${styles.muted}`} onClick={() => openUploadModal(r)}>Upload Icon</button>
                  <button className={`${styles.smallBtn} ${styles.danger}`} onClick={() => handleDelete(r.id)}>Delete</button>
                  <button className={styles.smallBtn} onClick={() => handleDeactivate(r.id, !!r.isActive)}>{r.isActive ? 'Deactivate' : 'Activate'}</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>

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
          <div className={styles.modal}>
            <h3>Create Role</h3>
            <form onSubmit={handleCreate}>
              <div className={styles.formRow}><label>Name</label><input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required /></div>
              <div className={styles.formRow}><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={4} /></div>
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
            <h3>Edit Role</h3>
            <form onSubmit={handleUpdate}>
              <div className={styles.formRow}><label>Name</label><input type="text" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} required /></div>
              <div className={styles.formRow}><label>Description</label><textarea value={form.description} onChange={e=>setForm({...form, description: e.target.value})} rows={4} /></div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button type="button" className={styles.smallBtn} onClick={()=>{ setShowEdit(null); setForm({ name: '', description: '' }); }}>Cancel</button>
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
            <div className={styles.formRow}>
              {showUpload.currentIcon ? <img src={showUpload.currentIcon} alt="current" style={{width:80,height:80,objectFit:'cover',borderRadius:8}} /> : <div style={{width:80,height:80,background:'#222',borderRadius:8}} />}
            </div>
            <div className={styles.formRow}>
              <input type="file" onChange={e=> setUploadFile(e.target.files?.[0] || null)} />
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
              <button type="button" className={styles.smallBtn} onClick={()=>{ setShowUpload(null); setUploadFile(null); }}>Cancel</button>
              <button className={styles.smallBtn} onClick={async ()=>{
                if (!uploadFile || !showUpload) {
                  showToast.warning('Please choose a file first');
                  return;
                }
                const ok = await handleUploadIcon(showUpload.id, uploadFile);
                if (ok) { setShowUpload(null); setUploadFile(null); fetchRoles(); }
              }}>Upload</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RoleManagement;
