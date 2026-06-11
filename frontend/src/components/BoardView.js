import React from 'react';
import { T, STATUS, PRIORITY } from '../tokens';
import { Pill, BarProgress, Avatar } from './UI';
import { deadlineMeta } from '../utils';

function TaskCard({ task, onEdit, onStatusChange }) {
  const pri = PRIORITY[task.priority]||PRIORITY.medium;
  const dl  = deadlineMeta(task.deadline, task.status==='done');
  return (
    <div onClick={()=>onEdit(task)} style={{
      background:T.surface,borderRadius:10,padding:13,
      border:`1px solid ${T.border}`,cursor:'pointer',
    }}>
      <p style={{margin:'0 0 10px',fontSize:12,fontWeight:600,color:T.text,lineHeight:1.45}}>{task.title}</p>
      {task.notes&&<p style={{margin:'0 0 10px',fontSize:11,color:T.textMuted,lineHeight:1.4}}>{task.notes.slice(0,55)}{task.notes.length>55?'…':''}</p>}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <Pill label={pri.label} color={pri.color} tiny/>
          <span style={{fontSize:10,fontWeight:600,color:dl.color}}>{dl.text}</span>
        </div>
        {task.assignee&&<Avatar name={task.assignee.name||task.assignee} size={22}/>}
      </div>
      <select value={task.status} onClick={e=>e.stopPropagation()}
        onChange={e=>{e.stopPropagation();onStatusChange(task._id||task.id,e.target.value);}}
        style={{
          width:'100%',background:STATUS[task.status]?.ring+'22',
          color:STATUS[task.status]?.color,
          border:`1px solid ${STATUS[task.status]?.ring+'44'}`,
          borderRadius:6,padding:'4px 7px',fontSize:10,
          fontWeight:700,cursor:'pointer',outline:'none',fontFamily:'inherit',
        }}>
        {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
      </select>
    </div>
  );
}

export default function BoardView({ tasks, onEdit, onStatusChange }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,minHeight:300}}>
      {Object.entries(STATUS).map(([status,cfg])=>{
        const col=tasks.filter(t=>t.status===status);
        return (
          <div key={status} style={{background:T.surfaceHigh,borderRadius:14,padding:14}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:14}}>
              <div style={{width:8,height:8,borderRadius:'50%',background:cfg.color}}/>
              <span style={{fontSize:11,fontWeight:800,color:cfg.color,letterSpacing:'0.08em'}}>{cfg.label.toUpperCase()}</span>
              <span style={{marginLeft:'auto',fontSize:11,fontWeight:700,background:cfg.color+'20',color:cfg.color,padding:'1px 8px',borderRadius:10}}>{col.length}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {col.map(t=><TaskCard key={t._id||t.id} task={t} onEdit={onEdit} onStatusChange={onStatusChange}/>)}
              {col.length===0&&<div style={{textAlign:'center',padding:'24px 0',color:T.textMuted,fontSize:12}}>Empty</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
