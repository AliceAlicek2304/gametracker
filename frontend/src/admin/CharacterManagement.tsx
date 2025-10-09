import React, { useEffect, useState, useRef } from 'react';
import styles from './CharacterManagement.module.css';
import { showToast } from '../utils/toast';

type Role = { id: number; name: string; icon?: string };

type Stats = { atk?: number; def?: number; hp?: number; atkUp?: number; defUp?: number; hpUp?: number };
type Skill = any;

// Section block: each section groups a description (text) and an optional level table
type LevelRow = { label: string; values: string[] };
type SectionBlock = { id: string; type: 'section'; title?: string; skillType?: string; description?: string; columns: string[]; rows: LevelRow[] };

type Character = {
  id: number;
  name: string;
  rarity?: number;
  roles?: Role[];
  element?: string;
  weaponType?: string;
  isActive?: boolean;
  description?: string;
  imageUrl?: string;
  stats?: Stats;
  skill?: Skill;
  createdDate?: string;
}

const buildHeaders = (contentType?: string): HeadersInit => {
  const headers: Record<string, string> = {};
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

const CharacterManagement: React.FC = () => {
  const [chars, setChars] = useState<Character[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all'|'active'|'inactive'>('all');
  const [sortOption, setSortOption] = useState<'createdDesc'|'createdAsc'|'nameAsc'|'nameDesc'>('createdDesc');
  const [rarityFilter, setRarityFilter] = useState<'all'|'1'|'2'|'3'|'4'|'5'>('all');
  const [showDetail, setShowDetail] = useState<Character | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState<null | { id: number; name?: string; currentImage?: string }>(null);
  const [rolesOptions, setRolesOptions] = useState<Role[]>([]);
  const [roleSearch, setRoleSearch] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement | null>(null);
  const [createForm, setCreateForm] = useState<any>({
    name:'', rarity:5, roleIds: [] as number[], element:'', weaponType:'', description:'',
    atk:0, def:0, hp:0, atkUp:0, defUp:0, hpUp:0,
    // skill will be an object stored as JSON; editor uses skillText
    skill: {}
  });
  const [skillText, setSkillText] = useState<string>('');
  const [skillPreviewOpen, setSkillPreviewOpen] = useState<boolean>(false);
  const [skillSections, setSkillSections] = useState<SectionBlock[]>([]);
  const [openSkillDetails, setOpenSkillDetails] = useState<Record<string, boolean>>({});
  const [skillEditorMode, setSkillEditorMode] = useState<'raw'|'sections'>('sections');
  const [detailTab, setDetailTab] = useState<'profile'|'skills'>('profile');
  const [detailLevel, setDetailLevel] = useState<number>(1);
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  // parse skill sections for currently shown detail (used by detail tabs)
  const parsedSections: any[] = (() => {
    if (!showDetail) return [];
    let raw: any = showDetail.skill;
    let skillObj: any = raw;
    if (typeof raw === 'string') {
      try { skillObj = JSON.parse(raw); } catch (e) { skillObj = raw; }
      if (typeof skillObj === 'string' && (skillObj.trim().startsWith('{') || skillObj.trim().startsWith('['))) {
        try { skillObj = JSON.parse(skillObj); } catch (e) { /* ignore */ }
      }
    }
    if (skillObj && Array.isArray(skillObj.sections)) return skillObj.sections;
    if (skillObj && skillObj.skill && Array.isArray(skillObj.skill.sections)) return skillObj.skill.sections;
    return [];
  })();

  // Mirror backend enums
  const elementOptions = ['AERO','ELECTRO','FUSION','GLACIO','HAVOC','SPECTRO'];
  const weaponOptions = ['BROADBLADE','GAUNTLETS','PISTOLS','RECTIFIER','SWORD'];
  // Skill type options for section
  const skillTypeOptions = ['Normal Attack','Resonance Skill','Forte Circuit','Resonance Liberation','Intro Skill','Outro Skill','Inherent Skill',
    'Resonance Chain 1','Resonance Chain 2','Resonance Chain 3','Resonance Chain 4','Resonance Chain 5','Resonance Chain 6'];

  const fetchChars = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/characters', { headers: buildHeaders() });
      if (res.ok) {
        const data: Character[] = await res.json();
        // default sort newest first
        data.sort((a,b) => (b.createdDate ? new Date(b.createdDate).getTime() : 0) - (a.createdDate ? new Date(a.createdDate).getTime() : 0));
        setChars(data);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchChars(); }, []);

  useEffect(() => { // fetch roles for picker
    fetch('/api/roles', { headers: buildHeaders() }).then(r=>r.ok? r.json():[]).then((data: Role[])=> setRolesOptions(data)).catch(()=>{});
  }, []);

  // close role dropdown when clicking outside
  useEffect(()=>{
    const handler = (e: MouseEvent) => {
      if (!roleDropdownRef.current) return;
      if (!roleDropdownRef.current.contains(e.target as Node)) setShowRoleDropdown(false);
    };
    document.addEventListener('click', handler);
    return ()=> document.removeEventListener('click', handler);
  }, []);

  const displayed = (() => {
    const q = search.trim().toLowerCase();
    let filtered = chars.filter(c => {
      if (activeFilter === 'active' && !c.isActive) return false;
      if (activeFilter === 'inactive' && c.isActive) return false;
      if (rarityFilter !== 'all' && Number(rarityFilter) !== (c.rarity || 0)) return false;
      if (!q) return true;
      const name = (c.name || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
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

  const handleToggleActive = async (id: number, active?: boolean) => {
    try {
      const res = await fetch(`/api/characters/${id}/deactivate`, { method: 'PATCH', headers: buildHeaders('application/json'), body: JSON.stringify({ isActive: !active }) });
      if (res.ok) { fetchChars(); if (showDetail?.id === id) setShowDetail(null); }
    } catch (err) { console.error(err); }
  }

  return (
    <div className={styles.container}>
      <div className={styles.topBar}>
        <div className={styles.title}>Character Management</div>
        <div className={styles.topBarCenter}>
          <input className={styles.searchInput} placeholder="Search name or description" value={search} onChange={e=>setSearch(e.target.value)} />
          <select className={styles.select} value={activeFilter} onChange={e=>setActiveFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select className={styles.select} value={rarityFilter} onChange={e=>setRarityFilter(e.target.value as any)}>
            <option value="all">All Rarities</option>
            <option value="5">5★</option>
            <option value="4">4★</option>
            <option value="3">3★</option>
            <option value="2">2★</option>
            <option value="1">1★</option>
          </select>
          <select className={styles.select} value={sortOption} onChange={e=>setSortOption(e.target.value as any)}>
            <option value="createdDesc">Created (newest)</option>
            <option value="createdAsc">Created (oldest)</option>
            <option value="nameAsc">Name (A → Z)</option>
            <option value="nameDesc">Name (Z → A)</option>
          </select>
        </div>
          <div className={styles.controls}>
          <button className={styles.btn} onClick={() => { setEditingId(null); setCreateForm({ name:'', rarity:5, roleIds: [], element:'', weaponType:'', description:'', atk:0, def:0, hp:0, atkUp:0, defUp:0, hpUp:0, skill: {} }); setSkillText(''); setSkillSections([]); setSkillEditorMode('sections'); setShowCreate(true); }}>Create Character</button>
          <button className={styles.btn} onClick={() => fetchChars()}>Refresh</button>
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? <div className={styles.loading}>Loading...</div> : (
          displayed.map(c => (
            <div key={c.id} className={styles.card} onClick={()=>setShowDetail(c)} style={{border: c.rarity === 5 ? '2px solid gold' : c.rarity === 4 ? '2px solid rebeccapurple' : undefined, boxShadow: c.rarity === 5 ? '0 4px 12px rgba(255,215,0,0.12)' : c.rarity === 4 ? '0 4px 12px rgba(138,43,226,0.08)' : undefined}}>
              {c.imageUrl ? <img src={c.imageUrl} alt={c.name} className={styles.charImg} /> : <div className={styles.charPlaceholder} />}
              <div className={styles.cardOverlay}>
                <div className={styles.cardTitle}>{c.name}</div>
                <div className={styles.cardSubtitle}>{c.rarity ? `${c.rarity}★` : ''} {c.element ? `• ${c.element}` : ''}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {showDetail && (
        <div className={styles.modalOverlay}>
          {/* Make detail modal wider to accommodate the full detail table on large screens */}
          <div className={styles.modal} style={{ width: 'min(1940px, 96vw)', maxWidth: '96vw' }}>
            <h3>{showDetail.name} {showDetail.rarity ? `• ${showDetail.rarity}★` : ''}</h3>
            {/* Three-column layout: left image/actions, center vertical tabs, right scrollable content */}
            <div style={{display:'flex',gap:16,alignItems:'flex-start'}}>
              <div style={{flex:'0 0 220px', display:'flex', flexDirection:'column', alignItems:'stretch'}}>
                {showDetail.imageUrl ? <img src={showDetail.imageUrl} alt={showDetail.name} style={{width:220,height:220,objectFit:'cover',borderRadius:8}} /> : <div style={{width:220,height:220,background:'#111',borderRadius:8}} />}
                {/* Action buttons moved here so they remain visible while right column scrolls */}
          <div style={{marginTop:12, display:'flex', flexWrap:'wrap', gap:8}}>
            <button type="button" className={`${styles.smallBtn} ${styles.muted}`} style={{flex:'0 0 calc(50% - 4px)'}} onClick={()=>{ setShowUpload({ id: showDetail.id, name: showDetail.name, currentImage: showDetail.imageUrl }); setUploadFile(null); }}>Upload Image</button>

            <button type="button" className={`${styles.smallBtn}`} style={{flex:'0 0 calc(50% - 4px)'}} onClick={()=>{
                    if (!showDetail) return;
                    const c = showDetail;
                    setCreateForm({
                      name: c.name || '', rarity: c.rarity || 5, roleIds: (c.roles || []).map(r => r.id), element: c.element || '', weaponType: c.weaponType || '', description: c.description || '',
                      atk: c.stats?.atk || 0, def: c.stats?.def || 0, hp: c.stats?.hp || 0, atkUp: c.stats?.atkUp || 0, defUp: c.stats?.defUp || 0, hpUp: c.stats?.hpUp || 0,
                      skill: c.skill || {}
                    });
                    try {
                      let raw = c.skill;
                      let skillObj: any = raw;
                      if (typeof raw === 'string') {
                        skillObj = JSON.parse(raw);
                        if (typeof skillObj === 'string' && (skillObj.trim().startsWith('{') || skillObj.trim().startsWith('['))) {
                          skillObj = JSON.parse(skillObj);
                        }
                      }
                      let sections = null as any;
                      if (skillObj && Array.isArray(skillObj.sections)) sections = skillObj.sections;
                      else if (skillObj && skillObj.skill && Array.isArray(skillObj.skill.sections)) sections = skillObj.skill.sections;
                      if (sections) {
                        setSkillEditorMode('sections');
                        setSkillSections(sections);
                      } else {
                        setSkillEditorMode('raw');
                        setSkillText(typeof c.skill === 'string' ? c.skill : JSON.stringify(c.skill || {}, null, 2));
                      }
                    } catch (e) {
                      setSkillEditorMode('raw');
                      setSkillText(typeof c.skill === 'string' ? c.skill : JSON.stringify(c.skill || {}, null, 2));
                    }
                    setEditingId(c.id);
                    setShowCreate(true);
                  }}>Edit</button>

                  <button type="button" className={styles.smallBtn} style={{flex:'0 0 calc(50% - 4px)'}} onClick={()=>handleToggleActive(showDetail.id, !!showDetail.isActive)}>{showDetail.isActive ? 'Deactivate' : 'Activate'}</button>
                  <button type="button" className={`${styles.smallBtn} ${styles.danger}`} style={{flex:'0 0 calc(50% - 4px)'}} onClick={() => { if (confirm('Are you sure to delete this character?')) { fetch(`/api/characters/${showDetail.id}`, { method:'DELETE', headers: buildHeaders() }).then(r=>{ if (r.ok) { fetchChars(); setShowDetail(null); } }).catch(()=>{}); } }}>Delete</button>

                  <div style={{flex:'0 0 100%'}}>
                    <button type="button" className={`${styles.smallBtn} ${styles.muted}`} style={{width:'100%'}} onClick={()=>setShowDetail(null)}>Close</button>
                  </div>
                </div>
              </div>
              {/* right: fixed tabs header + scrollable content area */}
              <div style={{flex:1, display:'flex', flexDirection:'column', paddingRight:8}}>
                <div style={{display:'flex',gap:8,marginBottom:12}}>
                  <button type="button" className={styles.smallBtn} onClick={()=>setDetailTab('profile')} style={{background: detailTab === 'profile' ? '#113' : undefined}}>Profile</button>
                  <button type="button" className={styles.smallBtn} onClick={()=>setDetailTab('skills')} style={{background: detailTab === 'skills' ? '#113' : undefined}}>Skills</button>
                </div>

                <div style={{flex:1, maxHeight:'70vh', overflowY:'auto'}}>
                  {detailTab === 'profile' && (
                    <div style={{paddingRight:8}}>
                      {/* Description first */}
                      <div className={styles.profileDescription} style={{marginBottom:12}} dangerouslySetInnerHTML={{__html: renderFormattedText(String(showDetail.description || ''))}} />

                      {/* Row of three bordered boxes: Element, Weapon, Roles */}
                      <div className={styles.infoRow} style={{display:'flex',gap:12,marginBottom:12}}>
                        <div className={styles.infoBox}>
                          <div style={{fontSize:12,opacity:0.8,marginBottom:6}}>Nguyên tố</div>
                          <div style={{fontWeight:700,fontSize:16}}>{showDetail.element || '-'}</div>
                        </div>
                        <div className={styles.infoBox}>
                          <div style={{fontSize:12,opacity:0.8,marginBottom:6}}>Loại vũ khí</div>
                          <div style={{fontWeight:700,fontSize:16}}>{showDetail.weaponType || '-'}</div>
                        </div>
                        <div className={styles.infoBox}>
                          <div style={{fontSize:12,opacity:0.8,marginBottom:6}}>Vai trò</div>
                          <div style={{fontWeight:700,fontSize:16}}>{showDetail.roles?.map(r=>r.name).join(', ') || '-'}</div>
                        </div>
                      </div>

                      {/* Stats table with slider */}
                      <div>
                        <h4 style={{margin: '6px 0 10px 0'}}>Stats by Level</h4>
                        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:8}}>
                          <div style={{fontSize:13}}>Selected Lv: <strong>{detailLevel}</strong></div>
                          <input type="range" min={1} max={90} value={detailLevel} onChange={e=>setDetailLevel(Math.max(1, Math.min(90, parseInt(e.target.value || '1', 10))))} style={{flex:1}} />
                        </div>

                        <table className={styles.statsTable} style={{width:'100%',borderCollapse:'collapse'}}>
                          <thead>
                            <tr>
                              <th style={{textAlign:'left',padding:8,borderBottom:'1px solid #223'}}>Stat (Lv1)</th>
                              <th style={{textAlign:'left',padding:8,borderBottom:'1px solid #223'}}>Stat Up / Lv</th>
                              <th style={{textAlign:'left',padding:8,borderBottom:'1px solid #223'}}>Total at Lv</th>
                            </tr>
                          </thead>
                          <tbody>
                            {['atk','def','hp'].map((k)=>{
                              const base = parseFloat(String((showDetail.stats && (showDetail.stats as any)[k]) || 0));
                              const up = parseFloat(String((showDetail.stats && (showDetail.stats as any)[`${k}Up`]) || 0));
                              const total = base + up * detailLevel;
                              const label = k === 'atk' ? 'ATK' : k === 'def' ? 'DEF' : 'HP';
                              return (
                                <tr key={k} style={{borderBottom:'1px solid #0d2630'}}>
                                  <td style={{padding:8}}>{label}: {Number.isFinite(base) ? base : 0}</td>
                                  <td style={{padding:8}}>{Number.isFinite(up) ? String(up) : '0'}</td>
                                  <td style={{padding:8}}>{Number.isFinite(total) ? total.toFixed(2) : '0'}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {detailTab !== 'profile' && (
                    <div style={{marginTop:8,paddingRight:8}}>
                      <strong>Skill:</strong>
                      <div style={{marginTop:6}}>
                        {(() => {
                          const sections: any[] = parsedSections || [];
                          if (!sections || sections.length === 0) return <div style={{color:'#888'}}>No skill data</div>;
                          // show all sections (Resonance chain included) since we removed the separate resonance tab
                          const filtered = sections;
                          return (
                            <div style={{display:'flex',flexDirection:'column',gap:12}}>
                              {filtered.map((sec: any, i: number) => (
                                <div key={sec.id || i} style={{background:'#08121a',padding:12,borderRadius:8}}>
                                  {/* Skill type shown prominently at top */}
                                  {sec.skillType ? (
                                    <div style={{fontWeight:800,fontSize:18,color:'#9be7ff',marginBottom:8}}>{sec.skillType}</div>
                                  ) : null}
                                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                                    <div>
                                      <div style={{fontWeight:700,fontSize:16,color:'#ddd'}}>{sec.title || `Section ${i+1}`}</div>
                                    </div>
                                    <div style={{display:'flex',gap:8,alignItems:'center'}}>
                                      {/* small badge kept for backwards compatibility */}
                                      {sec.skillType ? <div style={{background:'#112',padding:'4px 8px',borderRadius:999,fontSize:12,color:'#9be7ff'}}>{sec.skillType}</div> : null}
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

                                  <div style={{display:'flex',justifyContent:'flex-end',marginBottom:8}}>
                                    <button type="button" className={styles.smallBtn} onClick={()=> setOpenSkillDetails(prev => ({...prev, [sec.id || i]: !prev[sec.id || i]}))}>
                                      {openSkillDetails[sec.id || i] ? 'Ẩn chi tiết' : 'Chi tiết'}
                                    </button>
                                  </div>

                                  {Array.isArray(sec.columns) && Array.isArray(sec.rows) && sec.rows.length > 0 && openSkillDetails[sec.id || i] && (
                                    <div style={{overflowX:'auto'}}>
                                      <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed', fontSize:12, lineHeight:1.2}}>
                                        <thead>
                                          <tr>
                                            {sec.columns.map((col: string, ci: number) => (
                                              <th key={ci} style={{textAlign:'left',padding:10,borderBottom:'1px solid #223', width: ci===0 ? 260 : undefined, minWidth: ci===0 ? 260 : 84, fontSize:12, lineHeight:1.2}}>
                                                {ci === 0 ? 'Thông số' : `Lv ${col}`}
                                              </th>
                                            ))}
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {sec.rows.map((r: any, ri: number) => (
                                            <tr key={ri} style={{borderBottom:'1px solid #0d2630'}}>
                                              <td style={{padding:10,verticalAlign:'middle', fontSize:12, lineHeight:1.2}}>{r.label}</td>
                                              {sec.columns.slice(1).map((_: string, ci: number)=> (
                                                <td key={ci} style={{padding:10,verticalAlign:'middle', fontSize:12, lineHeight:1.1, wordBreak:'break-word'}} dangerouslySetInnerHTML={{__html: renderFormattedText(r.values && r.values[ci] ? String(r.values[ci]) : '')}} />
                                              ))}
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            
          </div>
        </div>
      )}

        {showCreate && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>{editingId ? 'Edit Character' : 'Create Character'}</h3>
              <form onSubmit={async (e)=>{
                e.preventDefault();
                // build payload matching CreateCharacterRequest
                const payload: any = { ...createForm };
                // assemble skill from editor
                if (skillEditorMode === 'raw') {
                  if (skillText && skillText.trim().length > 0) {
                    try { payload.skill = JSON.parse(skillText); }
                    catch (ex: any) { showToast.error('Skill JSON is invalid: ' + (ex?.message || ex)); return; }
                  }
                } else {
                  // build sections structure
                  try {
                    for (const s of skillSections) {
                      if (!s.title || s.title.trim().length === 0) throw new Error('Each section must have a title (used as skill name)');
                      // allow sections without columns (no table). Only validate row values when columns exist
                      if (Array.isArray(s.columns) && s.columns.length > 0) {
                        const expected = s.columns.length - 1;
                        for (const r of (s.rows || [])) {
                          if (!Array.isArray(r.values) || r.values.length !== expected) throw new Error('Each row must have ' + expected + ' level values');
                        }
                      }
                    }
                    payload.skill = { sections: skillSections };
                  } catch (ex: any) { showToast.error('Skill validation failed: ' + (ex?.message || ex)); return; }
                }
                try {
                  let res: Response;
                  if (editingId) {
                    res = await fetch(`/api/characters/${editingId}`, { method:'PUT', headers: buildHeaders('application/json'), body: JSON.stringify(payload) });
                  } else {
                    res = await fetch('/api/characters', { method:'POST', headers: buildHeaders('application/json'), body: JSON.stringify(payload) });
                  }
                  if (res.ok) {
                    const data = await res.json();
                    setShowCreate(false);
                    // If we were editing an existing character and its detail modal is open,
                    // update it immediately so the user sees changes without closing the modal.
                    if (editingId && showDetail && showDetail.id === editingId) {
                      try { setShowDetail(data); } catch (e) { /* ignore */ }
                    }
                    // Only open upload modal after creating a new character, not when editing
                    if (!editingId) {
                      setShowUpload({ id: data.id, name: data.name, currentImage: data.imageUrl });
                    }
                    fetchChars();
                    showToast.success(editingId ? 'Character updated' : 'Character created');
                    setEditingId(null);
                  }
                  else { const txt = await res.text(); showToast.error(txt || (editingId ? 'Update failed' : 'Create failed')); }
                } catch (err: any) { console.error(err); showToast.error('Network error'); }
              }}>
                <div className={styles.formRow}><label>Name</label><input type="text" value={createForm.name} onChange={e=>setCreateForm({...createForm, name:e.target.value})} required /></div>
                <div className={styles.formRow}><label>Rarity</label>
                  <select value={createForm.rarity} onChange={e=>setCreateForm({...createForm, rarity: Number(e.target.value)})} className={styles.select} required>
                    {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}★</option>)}
                  </select>
                </div>
                <div className={styles.formRow}><label>Roles</label>
                  <div className={styles.roleMulti} ref={roleDropdownRef}>
                      <div className={styles.chipsRow} onClick={() => setShowRoleDropdown(v=>!v)}>
                        {createForm.roleIds && createForm.roleIds.length > 0 ? (
                          createForm.roleIds.map((rid:number) => {
                            const r = rolesOptions.find((x)=>x.id===rid);
                            return r ? (
                              <div key={rid} className={styles.chip} onClick={(e)=>{ e.stopPropagation(); const vals = createForm.roleIds.filter((id:number)=>id!==rid); setCreateForm({...createForm, roleIds: vals}); }}>{r.name} <span className={styles.chipX}>×</span></div>
                            ) : null;
                          })
                        ) : (
                          <div className={styles.placeholder}>Select one or more roles</div>
                        )}
                        <div className={styles.caret}>&#9662;</div>
                      </div>

                      {showRoleDropdown && (
                        <div className={styles.roleDropdown} onClick={e=>e.stopPropagation()}>
                          <input className={styles.roleSearch} placeholder="Search roles..." value={roleSearch} onChange={(e)=>setRoleSearch(e.target.value)} />
                          <div className={styles.roleOptions}>
                              {rolesOptions.filter(r=> r.name.toLowerCase().includes(roleSearch.trim().toLowerCase())).map(r=>{
                              const selected = createForm.roleIds.includes(r.id);
                              return (
                                <label key={r.id} className={styles.roleOption}>
                                  <input type="checkbox" checked={selected} onChange={()=>{
                                    const vals: number[] = Array.from(new Set(selected ? createForm.roleIds.filter((id:number)=>id!==r.id) : [...createForm.roleIds, r.id]));
                                    setCreateForm({...createForm, roleIds: vals});
                                  }} />
                                  <span className={styles.roleName}>{r.name}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      </div>
                    </div>
                <div className={styles.formRow}><label>Element</label>
                  <select className={`${styles.select} ${styles.enumSelect}`} value={createForm.element} onChange={e=>setCreateForm({...createForm, element: e.target.value})} required>
                    <option value="">-- Select element --</option>
                    {elementOptions.map(el => <option key={el} value={el}>{el}</option>)}
                  </select>
                </div>
                <div className={styles.formRow}><label>Weapon Type</label>
                  <select className={`${styles.select} ${styles.enumSelect}`} value={createForm.weaponType} onChange={e=>setCreateForm({...createForm, weaponType: e.target.value})} required>
                    <option value="">-- Select weapon --</option>
                    {weaponOptions.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className={styles.formRow}><label>Description</label><textarea value={createForm.description} onChange={e=>setCreateForm({...createForm, description:e.target.value})} rows={3} /></div>

                <h4>Stats</h4>
                <div style={{display:'flex',gap:8}}>
                  <div style={{flex:1}} className={styles.formRow}><label>ATK</label><input type="number" step="1" value={createForm.atk} onChange={e=>setCreateForm({...createForm, atk: Number(e.target.value)})} required /></div>
                  <div style={{flex:1}} className={styles.formRow}><label>ATK Up</label><input type="number" step="any" value={createForm.atkUp} onChange={e=>setCreateForm({...createForm, atkUp: parseFloat(e.target.value || '0')})} required /></div>
                  <div style={{flex:1}} className={styles.formRow}><label>DEF</label><input type="number" step="1" value={createForm.def} onChange={e=>setCreateForm({...createForm, def: Number(e.target.value)})} required /></div>
                  <div style={{flex:1}} className={styles.formRow}><label>DEF Up</label><input type="number" step="any" value={createForm.defUp} onChange={e=>setCreateForm({...createForm, defUp: parseFloat(e.target.value || '0')})} required /></div>
                </div>
                <div style={{display:'flex',gap:8}}>
                  <div style={{flex:1}} className={styles.formRow}><label>HP</label><input type="number" step="1" value={createForm.hp} onChange={e=>setCreateForm({...createForm, hp: Number(e.target.value)})} required /></div>
                  <div style={{flex:1}} className={styles.formRow}><label>HP Up</label><input type="number" step="any" value={createForm.hpUp} onChange={e=>setCreateForm({...createForm, hpUp: parseFloat(e.target.value || '0')})} required /></div>
                </div>

                <h4>Skill (JSON)</h4>
                <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:8}}>
                  <label style={{display:'flex',alignItems:'center',gap:8}}><input type="radio" name="skillMode" checked={skillEditorMode==='sections'} onChange={()=>setSkillEditorMode('sections')} /> Visual sections</label>
                  <label style={{display:'flex',alignItems:'center',gap:8}}><input type="radio" name="skillMode" checked={skillEditorMode==='raw'} onChange={()=>setSkillEditorMode('raw')} /> Raw JSON</label>
                  <div style={{flex:1}} />
                  <label style={{display:'flex',alignItems:'center',gap:8}}><input type="checkbox" checked={skillPreviewOpen} onChange={e=>setSkillPreviewOpen(e.target.checked)} /> Show preview</label>
                </div>

                {skillEditorMode === 'raw' ? (
                  <div className={styles.formRow}><label>Skill JSON</label>
                    <textarea rows={10} value={skillText} onChange={e=>setSkillText(e.target.value)} placeholder='Paste or edit skill JSON here (sections schema). You can also leave empty.' style={{width:'100%',fontFamily:'monospace'}} />
                  </div>
                ) : (
                  <div className={styles.formRow}><label>Sections</label>
                    <div style={{border:'1px solid #223',padding:8,borderRadius:6}}>

                      {skillSections.length === 0 && <div style={{color:'#888'}}>No sections yet. Add a section to group description + level table.</div>}

                      {(skillSections || []).map((s, idx) => (
                        <div id={`section-${s.id}`} key={s.id} style={{border:'1px solid #112',padding:8,marginBottom:8,borderRadius:6,background:'#061018'}}>
                          {/* show skill type prominently */}
                          {s.skillType ? <div style={{fontWeight:800,fontSize:18,color:'#9be7ff',marginBottom:6}}>{s.skillType}</div> : null}
                          <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                            <strong style={{flex:1}}>{idx+1}. {s.title || 'Section'}</strong>
                            <div style={{display:'flex',gap:6}}>
                              <button type="button" className={styles.smallBtn} onClick={()=>{ if (idx === 0) return; const copy = [...skillSections]; const tmp = copy[idx-1]; copy[idx-1] = copy[idx]; copy[idx] = tmp; setSkillSections(copy); }}>↑</button>
              
                              <button type="button" className={`${styles.smallBtn} ${styles.danger}`} onClick={()=>{ setSkillSections(prev => prev.filter(x=>x.id !== s.id)); }}>Remove</button>
                            </div>
                          </div>

                          <div style={{marginBottom:6}}>
                            <input style={{width:'100%',marginBottom:6}} placeholder='Section title (optional)' value={s.title} onChange={(e)=>{ const copy = [...skillSections]; copy[idx].title = e.target.value; setSkillSections(copy); }} />
                            <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:6,alignItems:'center'}}>
                              <label style={{color:'#ddd',fontSize:12}}>Skill type:</label>
                              <select value={s.skillType || ''} onChange={(e)=>{ const copy = [...skillSections]; copy[idx].skillType = e.target.value || undefined; setSkillSections(copy); }} style={{background:'#07121a',color:'#ddd',border:'1px solid #223',padding:'6px',borderRadius:6}}>
                                <option value="">-- none --</option>
                                {skillTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                            </div>
                            <textarea rows={3} style={{width:'100%',fontFamily:'monospace'}} value={s.description} onChange={(e)=>{ const copy = [...skillSections]; copy[idx].description = e.target.value; setSkillSections(copy); }} />
                          </div>

                          <div style={{overflowX:'auto'}}>
                            <table style={{width:'100%',borderCollapse:'collapse',tableLayout:'fixed'}}>
                              <thead>
                                <tr>
                                  {(s.columns || []).map((col,ci)=> <th key={ci} style={{borderBottom:'1px solid #334',padding:10,textAlign:'left', width: ci===0 ? 260 : undefined, minWidth: ci===0 ? 260 : 84}}>{col}</th>)}
                                  <th style={{borderBottom:'1px solid #334',padding:10,textAlign:'left', minWidth:100}}>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {(s.rows || []).map((r,ri)=> (
                                  <tr key={ri}>
                                    <td style={{padding:10,verticalAlign:'middle'}}>
                                      <input style={{width:'100%',boxSizing:'border-box',height:36,padding:'8px'}} value={r.label} onChange={(e)=>{ const copy = [...skillSections]; copy[idx].rows[ri].label = e.target.value; setSkillSections(copy); }} />
                                    </td>
                                    {(s.columns || []).slice(1).map((_,ci)=> (
                                      <td key={ci} style={{padding:10,verticalAlign:'middle'}}>
                                        <input style={{width:'100%',boxSizing:'border-box',height:36,padding:'8px',textAlign:'center'}} value={(r.values && r.values[ci]) ?? ''} onChange={(e)=>{ const copy = [...skillSections]; copy[idx].rows[ri].values = copy[idx].rows[ri].values || []; copy[idx].rows[ri].values[ci] = e.target.value; setSkillSections(copy); }} />
                                      </td>
                                    ))}
                                    <td style={{padding:10,verticalAlign:'middle'}}><button type="button" className={styles.smallBtn} onClick={()=>{ const copy = [...skillSections]; copy[idx].rows.splice(ri,1); setSkillSections(copy); }}>Remove</button></td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div style={{marginTop:6}}>
                              <button type="button" className={styles.smallBtn} onClick={()=>{ const copy = [...skillSections]; copy[idx].rows.push({ label: 'New Type', values: Array(s.columns.length-1).fill('0') }); setSkillSections(copy); }}>Add Row</button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div style={{display:'flex',gap:8,marginTop:8}}>
                        <button type="button" className={styles.smallBtn} onClick={()=>{
                          const levelCols = ['Lv', '1','2','3','4','5','6','7','8','9','10'];
                          const s: SectionBlock = { id: String(Date.now()), type: 'section', title: '', description: '', columns: levelCols, rows: [{ label: 'Stage 1 DMG', values: Array(10).fill('0') }] };
                          setSkillSections(prev => {
                            const next = [...prev, s];
                            setTimeout(() => {
                              const el = document.getElementById(`section-${s.id}`);
                              if (el && typeof el.scrollIntoView === 'function') el.scrollIntoView({ behavior: 'smooth', block: 'end' });
                            }, 60);
                            return next;
                          });
                        }}>Add Section</button>
                        <div style={{flex:1}} />
                        <button type="button" className={styles.smallBtn} onClick={()=>{ setSkillSections([]); }}>Clear</button>
                      </div>
                    </div>
                  </div>
                )}
                {skillPreviewOpen && (
                  <div style={{marginTop:8,background:'#0f1720',padding:12,borderRadius:6,fontFamily:'monospace',color:'#ddd'}}>
                    <pre style={{whiteSpace:'pre-wrap',margin:0}}>{(()=>{
                      try {
                        if (skillEditorMode === 'raw') return JSON.stringify(skillText ? JSON.parse(skillText) : createForm.skill, null, 2);
                        return JSON.stringify({ sections: skillSections }, null, 2);
                      } catch (e: any) { return 'Invalid JSON: ' + e.message; }
                    })()}</pre>
                  </div>
                )}
                <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                  <button type="button" className={styles.smallBtn} onClick={()=>{ setShowCreate(false); setEditingId(null); }}>Cancel</button>
                  <button className={styles.smallBtn} type="submit">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showUpload && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h3>Upload Image for {showUpload.name || `#${showUpload.id}`}</h3>
              <div className={styles.formRow}>{showUpload.currentImage ? <img src={showUpload.currentImage} alt="current" style={{width:140,height:140,objectFit:'cover',borderRadius:8}} /> : <div style={{width:140,height:140,background:'#111',borderRadius:8}} />}</div>
              <div className={styles.formRow}><input type="file" onChange={e=>setUploadFile(e.target.files?.[0] || null)} /></div>
              <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
                <button className={styles.smallBtn} onClick={()=>{ setShowUpload(null); setUploadFile(null); }}>Cancel</button>
                <button className={styles.smallBtn} onClick={async ()=>{
                  if (!uploadFile || !showUpload) return alert('Choose a file');
                  const fd = new FormData(); fd.append('image', uploadFile);
                  const res = await fetch(`/api/characters/${showUpload.id}/upload-image`, { method:'POST', headers: buildHeaders(), body: fd });
                  if (res.ok) { setShowUpload(null); setUploadFile(null); fetchChars(); }
                  else { alert('Upload failed'); }
                }}>Upload</button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}

export default CharacterManagement;
