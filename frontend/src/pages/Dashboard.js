import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useAuth } from '../App';
import { projectAPI, taskAPI } from '../api';
import { T, STATUS, PRIORITY, PALETTES, inputStyle } from '../tokens';
import { calcProgress, daysLeft, deadlineMeta, fmtDate } from '../utils';
import { Avatar, BarProgress, ProgressRing, Btn, Toast, Spinner } from '../components/UI';
import BoardView from '../components/BoardView';
import ListView from '../components/ListView';
import OverviewView from '../components/OverviewView';
import ProjectModal from '../components/ProjectModal';
import TaskModal from '../components/TaskModal';

/* ─── MemberAvatar ─────────────────────────────────────────────────────────── */
function MemberAvatar({ name, size = 28 }) {
  const colors = ['#3B82F6','#7C3AED','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4'];
  const color   = colors[name.charCodeAt(0) % colors.length];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:color,
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.38, fontWeight:800, color:'#fff', flexShrink:0,
      border:'2px solid '+T.surface,
    }}>
      {initials}
    </div>
  );
}

/* ─── MembersPanel ─────────────────────────────────────────────────────────── */
function MembersPanel({ members, assignedIds, onAdd, onToggle, onClose }) {
  const [name, setName] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
  };

  return (
    <div style={{
      position:'absolute', top:'100%', right:0, zIndex:400,
      width:280, background:T.surface,
      border:`1px solid ${T.border}`, borderRadius:12,
      boxShadow:'0 8px 32px rgba(0,0,0,0.18)', padding:16, marginTop:6,
    }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <span style={{ fontSize:13, fontWeight:800, color:T.text }}>Team Members</span>
        <button onClick={onClose} style={{ background:'none', border:'none', color:T.textMuted, fontSize:18, cursor:'pointer', lineHeight:1 }}>×</button>
      </div>

      {/* Add member */}
      <div style={{ display:'flex', gap:6, marginBottom:14 }}>
        <input
          ref={inputRef}
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key==='Enter' && handleAdd()}
          placeholder="Add member name…"
          style={{
            flex:1, background:T.bg, border:`1px solid ${T.border}`,
            borderRadius:7, padding:'6px 10px', fontSize:12,
            color:T.text, fontFamily:'inherit', outline:'none',
          }}
        />
        <button onClick={handleAdd} style={{
          background:T.blue, border:'none', color:'#fff',
          borderRadius:7, padding:'6px 12px', fontSize:12,
          fontWeight:700, cursor:'pointer', fontFamily:'inherit',
        }}>Add</button>
      </div>

      {/* Member list */}
      {members.length === 0
        ? <p style={{ fontSize:12, color:T.textMuted, textAlign:'center', margin:'12px 0' }}>No members yet. Add one above.</p>
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:4, maxHeight:220, overflowY:'auto' }}>
            {members.map(m => {
              const isAssigned = assignedIds.includes(m.id);
              return (
                <label key={m.id} style={{
                  display:'flex', alignItems:'center', gap:10,
                  padding:'7px 10px', borderRadius:8, cursor:'pointer',
                  background: isAssigned ? `${T.blue}12` : 'transparent',
                  border:`1px solid ${isAssigned ? T.blue+'40' : 'transparent'}`,
                }}>
                  <input
                    type="checkbox"
                    checked={isAssigned}
                    onChange={() => onToggle(m.id)}
                    style={{ accentColor:T.blue, width:14, height:14 }}
                  />
                  <MemberAvatar name={m.name} size={26} />
                  <span style={{ fontSize:13, color:T.text, flex:1 }}>{m.name}</span>
                  {isAssigned && <span style={{ fontSize:10, color:T.blue, fontWeight:700 }}>Assigned</span>}
                </label>
              );
            })}
          </div>
        )
      }
    </div>
  );
}

/* ─── Dashboard ────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [projects,    setProjects]    = useState([]);
  const [activeId,    setActiveId]    = useState(null);
  const [view,        setView]        = useState('board');
  const [sidebar,     setSidebar]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [fStatus,     setFStatus]     = useState('all');
  const [fPriority,   setFPriority]   = useState('all');
  const [taskM,       setTaskM]       = useState(null);
  const [projM,       setProjM]       = useState(null);
  const [toast,       setToast]       = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [showMembers, setShowMembers] = useState(false);

  // Global members list persisted in localStorage
  const [members, setMembers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('planr_members') || '[]'); }
    catch { return []; }
  });

  // assignedIds per project: { [projectId]: [memberId, ...] }
  // This is the LOCAL source of truth — synced to DB on every toggle
  const [assignedMap, setAssignedMap] = useState(() => {
    try { return JSON.parse(localStorage.getItem('planr_assigned') || '{}'); }
    catch { return {}; }
  });

  const notify = useCallback(msg => { setToast(msg); setTimeout(() => setToast(null), 2400); }, []);

  useEffect(() => {
    projectAPI.list()
      .then(({ data }) => {
        setProjects(data);
        if (data.length) setActiveId(data[0]._id);

        // Seed assignedMap from DB responses (for projects that already have assignedMembers saved)
        setAssignedMap(prev => {
          const merged = { ...prev };
          data.forEach(p => {
            if (p.assignedMembers?.length && !merged[p._id]) {
              merged[p._id] = p.assignedMembers;
            }
          });
          return merged;
        });
      })
      .catch(() => notify('Failed to load projects'))
      .finally(() => setLoading(false));
  }, [notify]);

  // Persist members & assignedMap to localStorage whenever they change
  useEffect(() => { localStorage.setItem('planr_members',  JSON.stringify(members));    }, [members]);
  useEffect(() => { localStorage.setItem('planr_assigned', JSON.stringify(assignedMap)); }, [assignedMap]);

  const project = projects.find(p => p._id === activeId);
  const pal     = PALETTES[project?.palette ?? 0];

  // Assigned IDs for the active project — always read from local state
  const assignedIds = activeId ? (assignedMap[activeId] || []) : [];

  const filtered = useMemo(() => {
    if (!project?.tasks) return [];
    return project.tasks.filter(t => {
      if (fStatus   !== 'all' && t.status   !== fStatus)   return false;
      if (fPriority !== 'all' && t.priority !== fPriority) return false;
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [project, fStatus, fPriority, search]);

  const allTasks = useMemo(() => projects.flatMap(p => p.tasks || []), [projects]);
  const stats = useMemo(() => ({
    total:   allTasks.length,
    done:    allTasks.filter(t => t.status === 'done').length,
    active:  allTasks.filter(t => t.status === 'inprogress').length,
    overdue: allTasks.filter(t => { const d = daysLeft(t.deadline); return d !== null && d < 0 && t.status !== 'done'; }).length,
  }), [allTasks]);

  /* ── member helpers ── */
  const addMember = name => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setMembers(ms => [...ms, { id, name }]);
  };

  const toggleAssign = async (memberId) => {
    // 1. Compute new list from LOCAL state (not from DB — avoids stale data bug)
    const current = assignedMap[activeId] || [];
    const updated  = current.includes(memberId)
      ? current.filter(id => id !== memberId)
      : [...current, memberId];

    // 2. Update local state immediately (optimistic)
    setAssignedMap(prev => ({ ...prev, [activeId]: updated }));

    // 3. Sync to DB
    try {
      await projectAPI.update(activeId, { assignedMembers: updated });
    } catch {
      // Revert on failure
      setAssignedMap(prev => ({ ...prev, [activeId]: current }));
      notify('Failed to save assignment');
    }
  };

  /* ── project/task mutations ── */
  const createProject = async data => {
    try { const { data:p } = await projectAPI.create(data); setProjects(ps => [...ps,p]); setActiveId(p._id); setProjM(null); notify('Project created'); }
    catch { notify('Failed to create project'); }
  };
  const updateProject = async data => {
    try { const { data:p } = await projectAPI.update(project._id, data); setProjects(ps => ps.map(x => x._id===p._id?p:x)); setProjM(null); notify('Project updated'); }
    catch { notify('Failed to update project'); }
  };
  const deleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await projectAPI.remove(project._id);
      const rest = projects.filter(p => p._id !== project._id);
      setProjects(rest);
      setActiveId(rest[0]?._id || null);
      setAssignedMap(prev => { const n={...prev}; delete n[project._id]; return n; });
      notify('Project deleted');
    } catch { notify('Failed to delete project'); }
  };
  const createTask = async data => {
    try { const { data:t } = await taskAPI.create(activeId, data); setProjects(ps => ps.map(p => p._id!==activeId?p:{...p,tasks:[...(p.tasks||[]),t]})); setTaskM(null); notify('Task created'); }
    catch { notify('Failed to create task'); }
  };
  const updateTask = async (tid, data) => {
    try { const { data:t } = await taskAPI.update(activeId, tid, data); setProjects(ps => ps.map(p => p._id!==activeId?p:{...p,tasks:(p.tasks||[]).map(x=>x._id===t._id?t:x)})); setTaskM(null); notify('Task saved'); }
    catch { notify('Failed to update task'); }
  };
  const deleteTask = async tid => {
    try { await taskAPI.remove(activeId, tid); setProjects(ps => ps.map(p => p._id!==activeId?p:{...p,tasks:(p.tasks||[]).filter(t=>t._id!==tid)})); setTaskM(null); notify('Task deleted'); }
    catch { notify('Failed to delete task'); }
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', background:T.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <Spinner/>
    </div>
  );

  const assignedMembers = members.filter(m => assignedIds.includes(m.id));

  return (
    <div style={{ minHeight:'100vh', background:T.bg, color:T.text, fontFamily:"'Inter',system-ui,sans-serif", display:'flex', flexDirection:'column' }}>

      {/* TOP NAV */}
      <header style={{ height:58, background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'0 20px', display:'flex', alignItems:'center', gap:14, position:'sticky', top:0, zIndex:200, flexShrink:0 }}>
        <button onClick={() => setSidebar(s=>!s)} style={{ background:'none', border:'none', color:T.textMuted, fontSize:18, cursor:'pointer' }}>☰</button>
        <div style={{ display:'flex', alignItems:'center', gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,#3B82F6,#7C3AED)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:900, color:'#fff' }}>P</div>
          <span style={{ fontSize:16, fontWeight:900, letterSpacing:'-0.5px' }}>Plan<span style={{ color:T.blue }}>r</span></span>
        </div>
        <div style={{ flex:1 }}/>
        <div style={{ display:'flex', gap:8 }}>
          {[
            { v:stats.active,                    l:'active',  c:T.blue },
            { v:`${stats.done}/${stats.total}`,  l:'done',    c:T.green },
            { v:stats.overdue,                   l:'overdue', c:stats.overdue>0?T.rose:T.textMuted },
          ].map(s => (
            <span key={s.l} style={{ fontSize:11, fontWeight:700, color:s.c, background:s.c+'18', padding:'3px 10px', borderRadius:20, border:`1px solid ${s.c}30` }}>{s.v} {s.l}</span>
          ))}
        </div>
        <Avatar name={user?.name||'User'} size={30}/>
        <button onClick={signOut} style={{ background:'none', border:`1px solid ${T.border}`, color:T.textMuted, borderRadius:7, padding:'4px 10px', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Sign out</button>
        <Btn sm onClick={() => setProjM('new')}>+ New project</Btn>
      </header>

      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* SIDEBAR */}
        {sidebar && (
          <aside style={{ width:228, background:T.surface, borderRight:`1px solid ${T.border}`, display:'flex', flexDirection:'column', overflowY:'auto', flexShrink:0 }}>
            <div style={{ padding:'16px 18px 10px', fontSize:10, fontWeight:800, color:T.textMuted, letterSpacing:'0.1em' }}>PROJECTS</div>
            {projects.length===0 && <div style={{ padding:'12px 18px', fontSize:12, color:T.textMuted }}>No projects yet</div>}
            {projects.map(p => {
              const pp=PALETTES[p.palette??0], pct=calcProgress(p.tasks), active=p._id===activeId;
              const projAssigned = members.filter(m => (assignedMap[p._id]||[]).includes(m.id));
              return (
                <button key={p._id} onClick={() => { setActiveId(p._id); setView('board'); }} style={{ background:active?pp.bg+'15':'none', border:'none', borderLeft:`2px solid ${active?pp.bg:'transparent'}`, padding:'11px 18px', cursor:'pointer', textAlign:'left', display:'flex', flexDirection:'column', gap:7 }}>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:13, fontWeight:active?800:500, color:active?T.text:T.textSub }}>{p.name}</span>
                    <span style={{ fontSize:11, color:T.textMuted }}>{pct}%</span>
                  </div>
                  <BarProgress pct={pct} color={pp.bg}/>
                  {projAssigned.length > 0 && (
                    <div style={{ display:'flex', marginTop:2 }}>
                      {projAssigned.slice(0,4).map((m,i) => (
                        <div key={m.id} style={{ marginLeft:i===0?0:-6, zIndex:projAssigned.length-i }}>
                          <MemberAvatar name={m.name} size={18}/>
                        </div>
                      ))}
                      {projAssigned.length > 4 && (
                        <div style={{ marginLeft:-6, width:18, height:18, borderRadius:'50%', background:T.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:T.textMuted, fontWeight:700, border:'2px solid '+T.surface }}>
                          +{projAssigned.length-4}
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </aside>
        )}

        {/* MAIN */}
        <main style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {!project ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:16 }}>
              <div style={{ fontSize:48 }}>📋</div>
              <p style={{ color:T.textMuted, fontSize:14 }}>No project selected</p>
              <Btn onClick={() => setProjM('new')}>Create your first project</Btn>
            </div>
          ) : (
            <>
              {/* Project header */}
              <div style={{ background:T.surface, borderBottom:`1px solid ${T.border}`, padding:'18px 24px 0', flexShrink:0 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                    <div style={{ width:4, height:48, borderRadius:4, background:pal.bg }}/>
                    <div>
                      <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                        <h1 style={{ margin:0, fontSize:22, fontWeight:900, letterSpacing:'-0.5px' }}>{project.name}</h1>
                        <button onClick={() => setProjM(project)} style={{ background:'none', border:`1px solid ${T.border}`, color:T.textMuted, borderRadius:5, padding:'2px 8px', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Edit</button>
                        <button onClick={deleteProject} style={{ background:'none', border:'1px solid #F43F5E44', color:'#F43F5E', borderRadius:5, padding:'2px 8px', fontSize:11, cursor:'pointer', fontFamily:'inherit' }}>Delete</button>

                        {/* Members button + avatar chips */}
                        <div style={{ display:'flex', alignItems:'center', gap:8, position:'relative' }}>
                          {assignedMembers.length > 0 && (
                            <div style={{ display:'flex', alignItems:'center' }}>
                              {assignedMembers.slice(0,5).map((m,i) => (
                                <div key={m.id} title={m.name} style={{ marginLeft:i===0?0:-8, zIndex:assignedMembers.length-i }}>
                                  <MemberAvatar name={m.name} size={28}/>
                                </div>
                              ))}
                              {assignedMembers.length > 5 && (
                                <div style={{ marginLeft:-8, width:28, height:28, borderRadius:'50%', background:T.border, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:T.textMuted, fontWeight:700, border:'2px solid '+T.surface }}>
                                  +{assignedMembers.length-5}
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            onClick={e => { e.stopPropagation(); setShowMembers(v => !v); }}
                            style={{
                              display:'flex', alignItems:'center', gap:5,
                              background: showMembers ? `${T.blue}18` : 'none',
                              border:`1px solid ${showMembers ? T.blue+'60' : T.border}`,
                              color: showMembers ? T.blue : T.textMuted,
                              borderRadius:7, padding:'4px 10px', fontSize:11,
                              cursor:'pointer', fontFamily:'inherit', fontWeight:600,
                            }}
                          >
                            <span style={{ fontSize:13 }}>👥</span>
                            {assignedMembers.length === 0 ? 'Assign members' : 'Manage'}
                          </button>

                          {showMembers && (
                            <MembersPanel
                              members={members}
                              assignedIds={assignedIds}
                              onAdd={addMember}
                              onToggle={toggleAssign}
                              onClose={() => setShowMembers(false)}
                            />
                          )}
                        </div>
                      </div>
                      <p style={{ margin:'4px 0 0', fontSize:13, color:T.textMuted }}>{project.description}</p>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:18 }}>
                    {project.deadline && (
                      <div style={{ textAlign:'right' }}>
                        <div style={{ fontSize:10, color:T.textMuted, fontWeight:700, letterSpacing:'0.07em' }}>DEADLINE</div>
                        <div style={{ fontSize:13, fontWeight:700, color:deadlineMeta(project.deadline).color, marginTop:3 }}>{fmtDate(project.deadline)}</div>
                      </div>
                    )}
                    <ProgressRing pct={calcProgress(project.tasks||[])} color={pal.bg} size={58}/>
                  </div>
                </div>

                {/* Tabs + filters */}
                <div style={{ display:'flex', alignItems:'center' }}>
                  {['board','list','overview'].map(tab => (
                    <button key={tab} onClick={() => setView(tab)} style={{ background:'none', border:'none', borderBottom:view===tab?`2px solid ${pal.bg}`:'2px solid transparent', color:view===tab?T.text:T.textMuted, fontWeight:view===tab?800:500, fontSize:13, cursor:'pointer', padding:'8px 16px', marginBottom:-1, textTransform:'capitalize', fontFamily:'inherit' }}>{tab}</button>
                  ))}
                  <div style={{ flex:1 }}/>
                  <div style={{ display:'flex', gap:8, alignItems:'center', paddingBottom:8 }}>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" style={{ ...inputStyle, width:150, padding:'5px 10px', fontSize:11 }}/>
                    <select value={fStatus} onChange={e => setFStatus(e.target.value)} style={{ ...inputStyle, width:'auto', padding:'5px 8px', fontSize:11, cursor:'pointer' }}>
                      <option value="all">All status</option>
                      {Object.entries(STATUS).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <select value={fPriority} onChange={e => setFPriority(e.target.value)} style={{ ...inputStyle, width:'auto', padding:'5px 8px', fontSize:11, cursor:'pointer' }}>
                      <option value="all">All priority</option>
                      {Object.entries(PRIORITY).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <Btn sm color={pal.bg} onClick={() => setTaskM('new')}>+ Task</Btn>
                  </div>
                </div>
              </div>

              {/* View area */}
              <div style={{ flex:1, overflowY:'auto', padding:24 }} onClick={() => showMembers && setShowMembers(false)}>
                {view==='board'    && <BoardView    tasks={filtered} onEdit={setTaskM} onStatusChange={(tid,s) => updateTask(tid,{status:s})}/>}
                {view==='list'     && <ListView     tasks={filtered} onEdit={setTaskM} onStatusChange={(tid,s) => updateTask(tid,{status:s})} onDelete={deleteTask}/>}
                {view==='overview' && <OverviewView project={project}/>}
              </div>
            </>
          )}
        </main>
      </div>

      {projM && <ProjectModal initial={projM==='new'?null:projM} onClose={() => setProjM(null)} onSave={projM==='new'?createProject:updateProject}/>}
      {taskM && <TaskModal initial={taskM==='new'?null:taskM} onClose={() => setTaskM(null)} onSave={data => taskM==='new'?createTask(data):updateTask(taskM._id,data)} onDelete={taskM!=='new'?()=>deleteTask(taskM._id):undefined}/>}
      <Toast msg={toast}/>
    </div>
  );
}





