import React, { useEffect, useState } from 'react';
import styles from './BannerManagement.module.css';
import { showToast } from '../utils/toast';
import { apiFetch } from '../utils/apiHelper';

type Character = {
  id: number;
  name: string;
  imageUrl?: string;
  rarity?: number;
  element?: string;
};

type Weapon = {
  id: number;
  name: string;
  imageUrl?: string;
  rarity?: number;
  weaponType?: string;
};

type Banner = {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  bannerType: string; // CHARACTER or WEAPON
  // Character banner fields
  featured5StarCharacterId?: number;
  featured5StarCharacterName?: string;
  featured5StarCharacterImageUrl?: string;
  featured4StarCharacter1Id?: number;
  featured4StarCharacter1Name?: string;
  featured4StarCharacter1ImageUrl?: string;
  featured4StarCharacter2Id?: number;
  featured4StarCharacter2Name?: string;
  featured4StarCharacter2ImageUrl?: string;
  featured4StarCharacter3Id?: number;
  featured4StarCharacter3Name?: string;
  featured4StarCharacter3ImageUrl?: string;
  // Weapon banner fields
  featured5StarWeaponId?: number;
  featured5StarWeaponName?: string;
  featured5StarWeaponImageUrl?: string;
  featured4StarWeapon1Id?: number;
  featured4StarWeapon1Name?: string;
  featured4StarWeapon1ImageUrl?: string;
  featured4StarWeapon2Id?: number;
  featured4StarWeapon2Name?: string;
  featured4StarWeapon2ImageUrl?: string;
  featured4StarWeapon3Id?: number;
  featured4StarWeapon3Name?: string;
  featured4StarWeapon3ImageUrl?: string;
  status: string;
  active: boolean;
  createdDate: string;
};

const buildHeaders = (contentType?: string): HeadersInit => {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (contentType) headers['Content-Type'] = contentType;
  return headers;
};

const BannerManagement: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [weapons, setWeapons] = useState<Weapon[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'UPCOMING' | 'ACTIVE' | 'ENDED'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [createForm, setCreateForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    bannerType: 'CHARACTER' as 'CHARACTER' | 'WEAPON',
    // Character fields
    featured5StarCharacterId: 0,
    featured4StarCharacter1Id: 0,
    featured4StarCharacter2Id: 0,
    featured4StarCharacter3Id: 0,
    // Weapon fields
    featured5StarWeaponId: 0,
    featured4StarWeapon1Id: 0,
    featured4StarWeapon2Id: 0,
    featured4StarWeapon3Id: 0,
    isActive: true,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('banners', { headers: buildHeaders() });
      if (res.ok) {
        const data: Banner[] = await res.json();
        data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setBanners(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCharacters = async () => {
    try {
      const res = await apiFetch('characters/active', { headers: buildHeaders() });
      if (res.ok) {
        const data: Character[] = await res.json();
        setCharacters(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWeapons = async () => {
    try {
      const res = await apiFetch('weapons/active', { headers: buildHeaders() });
      if (res.ok) {
        const data: Weapon[] = await res.json();
        setWeapons(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchCharacters();
    fetchWeapons();
  }, []);

  const displayed = (() => {
    const q = search.trim().toLowerCase();
    let filtered = banners.filter((b) => {
      if (statusFilter !== 'all' && b.status !== statusFilter) return false;
      if (!q) return true;
      const name = (b.name || '').toLowerCase();
      
      // Search in character names
      const char5 = (b.featured5StarCharacterName || '').toLowerCase();
      const char41 = (b.featured4StarCharacter1Name || '').toLowerCase();
      const char42 = (b.featured4StarCharacter2Name || '').toLowerCase();
      const char43 = (b.featured4StarCharacter3Name || '').toLowerCase();
      
      // Search in weapon names
      const weapon5 = (b.featured5StarWeaponName || '').toLowerCase();
      const weapon41 = (b.featured4StarWeapon1Name || '').toLowerCase();
      const weapon42 = (b.featured4StarWeapon2Name || '').toLowerCase();
      const weapon43 = (b.featured4StarWeapon3Name || '').toLowerCase();
      
      return name.includes(q) || char5.includes(q) || char41.includes(q) || char42.includes(q) || char43.includes(q) ||
             weapon5.includes(q) || weapon41.includes(q) || weapon42.includes(q) || weapon43.includes(q);
    });
    return filtered;
  })();

  const handleCreate = () => {
    setShowCreate(true);
    setEditingId(null);
    setCreateForm({
      name: '',
      startDate: '',
      endDate: '',
      bannerType: 'CHARACTER',
      featured5StarCharacterId: 0,
      featured4StarCharacter1Id: 0,
      featured4StarCharacter2Id: 0,
      featured4StarCharacter3Id: 0,
      featured5StarWeaponId: 0,
      featured4StarWeapon1Id: 0,
      featured4StarWeapon2Id: 0,
      featured4StarWeapon3Id: 0,
      isActive: true,
    });
  };

  const handleEdit = (banner: Banner) => {
    setShowCreate(true);
    setEditingId(banner.id);
    setCreateForm({
      name: banner.name,
      startDate: banner.startDate.slice(0, 16),
      endDate: banner.endDate.slice(0, 16),
      bannerType: banner.bannerType as 'CHARACTER' | 'WEAPON',
      featured5StarCharacterId: banner.featured5StarCharacterId || 0,
      featured4StarCharacter1Id: banner.featured4StarCharacter1Id || 0,
      featured4StarCharacter2Id: banner.featured4StarCharacter2Id || 0,
      featured4StarCharacter3Id: banner.featured4StarCharacter3Id || 0,
      featured5StarWeaponId: banner.featured5StarWeaponId || 0,
      featured4StarWeapon1Id: banner.featured4StarWeapon1Id || 0,
      featured4StarWeapon2Id: banner.featured4StarWeapon2Id || 0,
      featured4StarWeapon3Id: banner.featured4StarWeapon3Id || 0,
      isActive: banner.active,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      showToast.error('Please enter banner name');
      return;
    }
    if (!createForm.startDate || !createForm.endDate) {
      showToast.error('Please select start and end dates');
      return;
    }

    // Validate based on banner type
    if (createForm.bannerType === 'CHARACTER') {
      if (!createForm.featured5StarCharacterId) {
        showToast.error('Please select 5-star character');
        return;
      }
      if (!createForm.featured4StarCharacter1Id || !createForm.featured4StarCharacter2Id || !createForm.featured4StarCharacter3Id) {
        showToast.error('Please select all three 4-star characters');
        return;
      }
    } else {
      if (!createForm.featured5StarWeaponId) {
        showToast.error('Please select 5-star weapon');
        return;
      }
      if (!createForm.featured4StarWeapon1Id || !createForm.featured4StarWeapon2Id || !createForm.featured4StarWeapon3Id) {
        showToast.error('Please select all three 4-star weapons');
        return;
      }
    }

    const body = {
      name: createForm.name,
      startDate: createForm.startDate,
      endDate: createForm.endDate,
      bannerType: createForm.bannerType,
      featured5StarCharacterId: createForm.bannerType === 'CHARACTER' ? createForm.featured5StarCharacterId : null,
      featured4StarCharacter1Id: createForm.bannerType === 'CHARACTER' ? createForm.featured4StarCharacter1Id : null,
      featured4StarCharacter2Id: createForm.bannerType === 'CHARACTER' ? createForm.featured4StarCharacter2Id : null,
      featured4StarCharacter3Id: createForm.bannerType === 'CHARACTER' ? createForm.featured4StarCharacter3Id : null,
      featured5StarWeaponId: createForm.bannerType === 'WEAPON' ? createForm.featured5StarWeaponId : null,
      featured4StarWeapon1Id: createForm.bannerType === 'WEAPON' ? createForm.featured4StarWeapon1Id : null,
      featured4StarWeapon2Id: createForm.bannerType === 'WEAPON' ? createForm.featured4StarWeapon2Id : null,
      featured4StarWeapon3Id: createForm.bannerType === 'WEAPON' ? createForm.featured4StarWeapon3Id : null,
      isActive: createForm.isActive,
    };

    try {
      const url = editingId ? `banners/${editingId}` : 'banners';
      const method = editingId ? 'PUT' : 'POST';
      const res = await apiFetch(url, {
        method,
        headers: buildHeaders('application/json'),
        body: JSON.stringify(body),
      });

      if (res.ok) {
        showToast.success(editingId ? 'Banner updated successfully' : 'Banner created successfully');
        setShowCreate(false);
        fetchBanners();
      } else {
        const text = await res.text();
        showToast.error(text || 'Failed to save banner');
      }
    } catch (err) {
      showToast.error('Error saving banner');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete banner "${name}"?`)) return;
    try {
      const res = await apiFetch(`banners/${id}`, {
        method: 'DELETE',
        headers: buildHeaders(),
      });
      if (res.ok) {
        showToast.success('Banner deleted successfully');
        fetchBanners();
      } else {
        showToast.error('Failed to delete banner');
      }
    } catch (err) {
      showToast.error('Error deleting banner');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      UPCOMING: styles.statusUpcoming,
      ACTIVE: styles.statusActive,
      ENDED: styles.statusEnded,
    };
    return statusMap[status] || '';
  };

  const getStatusText = (status: string) => {
    const statusText: Record<string, string> = {
      UPCOMING: 'Chưa Diễn Ra',
      ACTIVE: 'Đang Diễn Ra',
      ENDED: 'Đã Kết Thúc',
    };
    return statusText[status] || status;
  };

  const fiveStarChars = characters.filter((c) => c.rarity === 5);
  const fourStarChars = characters.filter((c) => c.rarity === 4);
  const fiveStarWeapons = weapons.filter((w) => w.rarity === 5);
  const fourStarWeapons = weapons.filter((w) => w.rarity === 4);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Banner Management</h1>
        <button className={styles.createBtn} onClick={handleCreate}>
          + Create Banner
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by banner name or character..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className={styles.filterSelect}>
          <option value="all">All Status</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="ACTIVE">Active</option>
          <option value="ENDED">Ended</option>
        </select>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : (
        <div className={styles.bannerList}>
          {displayed.map((banner) => (
            <div key={banner.id} className={styles.bannerCard}>
              <div className={styles.bannerHeader}>
                <h3>{banner.name}</h3>
                <div className={styles.badgeGroup}>
                  <span className={`${styles.statusBadge} ${getStatusBadge(banner.status)}`}>{getStatusText(banner.status)}</span>
                  {!banner.active && <span className={styles.inactiveBadge}>Inactive</span>}
                </div>
              </div>
              <div className={styles.bannerDates}>
                <div>Type: {banner.bannerType === 'CHARACTER' ? '🎭 Character' : '⚔️ Weapon'}</div>
                <div>Start: {new Date(banner.startDate).toLocaleString()}</div>
                <div>End: {new Date(banner.endDate).toLocaleString()}</div>
              </div>
              <div className={styles.characters}>
                {banner.bannerType === 'CHARACTER' ? (
                  <>
                    <div className={styles.featured5Star} data-tooltip={`${banner.featured5StarCharacterName} ★★★★★`}>
                      <img src={banner.featured5StarCharacterImageUrl || '/placeholder.png'} alt={banner.featured5StarCharacterName} />
                      <div className={styles.charName}>{banner.featured5StarCharacterName} ★★★★★</div>
                    </div>
                    <div className={styles.featured4Stars}>
                      <div className={styles.char4Star} data-tooltip={`${banner.featured4StarCharacter1Name} ★★★★`}>
                        <img src={banner.featured4StarCharacter1ImageUrl || '/placeholder.png'} alt={banner.featured4StarCharacter1Name} />
                        <div className={styles.charName}>{banner.featured4StarCharacter1Name} ★★★★</div>
                      </div>
                      <div className={styles.char4Star} data-tooltip={`${banner.featured4StarCharacter2Name} ★★★★`}>
                        <img src={banner.featured4StarCharacter2ImageUrl || '/placeholder.png'} alt={banner.featured4StarCharacter2Name} />
                        <div className={styles.charName}>{banner.featured4StarCharacter2Name} ★★★★</div>
                      </div>
                      <div className={styles.char4Star} data-tooltip={`${banner.featured4StarCharacter3Name} ★★★★`}>
                        <img src={banner.featured4StarCharacter3ImageUrl || '/placeholder.png'} alt={banner.featured4StarCharacter3Name} />
                        <div className={styles.charName}>{banner.featured4StarCharacter3Name} ★★★★</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className={styles.featured5Star} data-tooltip={`${banner.featured5StarWeaponName} ★★★★★`}>
                      <img src={banner.featured5StarWeaponImageUrl || '/placeholder.png'} alt={banner.featured5StarWeaponName} />
                      <div className={styles.charName}>{banner.featured5StarWeaponName} ★★★★★</div>
                    </div>
                    <div className={styles.featured4Stars}>
                      <div className={styles.char4Star} data-tooltip={`${banner.featured4StarWeapon1Name} ★★★★`}>
                        <img src={banner.featured4StarWeapon1ImageUrl || '/placeholder.png'} alt={banner.featured4StarWeapon1Name} />
                        <div className={styles.charName}>{banner.featured4StarWeapon1Name} ★★★★</div>
                      </div>
                      <div className={styles.char4Star} data-tooltip={`${banner.featured4StarWeapon2Name} ★★★★`}>
                        <img src={banner.featured4StarWeapon2ImageUrl || '/placeholder.png'} alt={banner.featured4StarWeapon2Name} />
                        <div className={styles.charName}>{banner.featured4StarWeapon2Name} ★★★★</div>
                      </div>
                      <div className={styles.char4Star} data-tooltip={`${banner.featured4StarWeapon3Name} ★★★★`}>
                        <img src={banner.featured4StarWeapon3ImageUrl || '/placeholder.png'} alt={banner.featured4StarWeapon3Name} />
                        <div className={styles.charName}>{banner.featured4StarWeapon3Name} ★★★★</div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className={styles.actions}>
                <button className={styles.editBtn} onClick={() => handleEdit(banner)}>
                  Edit
                </button>
                <button className={styles.deleteBtn} onClick={() => handleDelete(banner.id, banner.name)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className={styles.modal} onClick={() => setShowCreate(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{editingId ? 'Edit Banner' : 'Create Banner'}</h2>
            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label>Banner Name *</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g., Jiyan Banner"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Banner Type *</label>
                <select
                  value={createForm.bannerType}
                  onChange={(e) => setCreateForm({ ...createForm, bannerType: e.target.value as 'CHARACTER' | 'WEAPON' })}
                >
                  <option value="CHARACTER">🎭 Character Banner</option>
                  <option value="WEAPON">⚔️ Weapon Banner</option>
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Start Date *</label>
                  <input
                    type="datetime-local"
                    value={createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>End Date *</label>
                  <input
                    type="datetime-local"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm({ ...createForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              {createForm.bannerType === 'CHARACTER' ? (
                <>
                  <div className={styles.formGroup}>
                    <label>Featured 5★ Character *</label>
                    <select
                      value={createForm.featured5StarCharacterId}
                      onChange={(e) => setCreateForm({ ...createForm, featured5StarCharacterId: Number(e.target.value) })}
                    >
                      <option value={0}>-- Select 5★ Character --</option>
                      {fiveStarChars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.element})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Featured 4★ Character 1 *</label>
                    <select
                      value={createForm.featured4StarCharacter1Id}
                      onChange={(e) => setCreateForm({ ...createForm, featured4StarCharacter1Id: Number(e.target.value) })}
                    >
                      <option value={0}>-- Select 4★ Character --</option>
                      {fourStarChars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.element})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Featured 4★ Character 2 *</label>
                    <select
                      value={createForm.featured4StarCharacter2Id}
                      onChange={(e) => setCreateForm({ ...createForm, featured4StarCharacter2Id: Number(e.target.value) })}
                    >
                      <option value={0}>-- Select 4★ Character --</option>
                      {fourStarChars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.element})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Featured 4★ Character 3 *</label>
                    <select
                      value={createForm.featured4StarCharacter3Id}
                      onChange={(e) => setCreateForm({ ...createForm, featured4StarCharacter3Id: Number(e.target.value) })}
                    >
                      <option value={0}>-- Select 4★ Character --</option>
                      {fourStarChars.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.element})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label>Featured 5★ Weapon *</label>
                    <select
                      value={createForm.featured5StarWeaponId}
                      onChange={(e) => setCreateForm({ ...createForm, featured5StarWeaponId: Number(e.target.value) })}
                    >
                      <option value={0}>-- Select 5★ Weapon --</option>
                      {fiveStarWeapons.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.weaponType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Featured 4★ Weapon 1 *</label>
                    <select
                      value={createForm.featured4StarWeapon1Id}
                      onChange={(e) => setCreateForm({ ...createForm, featured4StarWeapon1Id: Number(e.target.value) })}
                    >
                      <option value={0}>-- Select 4★ Weapon --</option>
                      {fourStarWeapons.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.weaponType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Featured 4★ Weapon 2 *</label>
                    <select
                      value={createForm.featured4StarWeapon2Id}
                      onChange={(e) => setCreateForm({ ...createForm, featured4StarWeapon2Id: Number(e.target.value) })}
                    >
                      <option value={0}>-- Select 4★ Weapon --</option>
                      {fourStarWeapons.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.weaponType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Featured 4★ Weapon 3 *</label>
                    <select
                      value={createForm.featured4StarWeapon3Id}
                      onChange={(e) => setCreateForm({ ...createForm, featured4StarWeapon3Id: Number(e.target.value) })}
                    >
                      <option value={0}>-- Select 4★ Weapon --</option>
                      {fourStarWeapons.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.weaponType})
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div className={styles.formGroup}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={createForm.isActive}
                    onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })}
                  />
                  <span>Banner Active (hiển thị trên website)</span>
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowCreate(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn}>
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
