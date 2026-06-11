import React from 'react';
import { T, STATUS, PRIORITY } from '../tokens';
import { Pill, Avatar } from './UI';
import { deadlineMeta } from '../utils';

export default function ListView({ tasks, onEdit, onStatusChange, onDelete }) {
  if(!tasks.length) return <div style={{textAlign:'center',padding:60,color:T.textMuted,fontSize:13}}>No tasks match your filters</div>;
  return (
    <div style={{border:`1px solid ${T.border}`,borderRadius:14,overflow:'hidden'}}>
      <div style={{display:'grid',gridTemplateColumns:'1fr 110px 90px 80px 130px 88px',padding:'10px 18px',background:T.surfacePop,fontSize:10,fontWeight:800,color:T.textMuted,letterSpacing:'0.09em',borderBottom:`1px solid ${T.border}`}}>
        <span>TASK</span><span>STATUS</span><span>PRIORITY</span><span>ASSIGNEE</span><span>DEADLINE</span><span>ACTIONS</span>
      </div>
      {tasks.map((task,i)=>{
        const dl=deadlineMeta(task.deadline,task.status==='done');
        const tid=task._id||task.id;
        return (
          <div key={tid} style={{display:'grid',gridTemplateColumns:'1fr 110px 90px 80px 130px 88px',padding:'12px 18px',alignItems:'center',background:i%2===0?T.surface:T.surfaceHigh,borderBottom:i<tasks.length-1?`1px solid ${T.border}`:'none'}}>
            <div>
              <div style={{fontSize:13,fontWeight:600,color:T.text}}>{task.title}</div>
              {task.notes&&<div style={{fontSize:11,color:T.textMuted,marginTop:2}}>{task.notes.slice(0,48)}{task.notes.length>48?'…':''}</div>}
            </div>
            <select value={task.status} onChange={e=>onStatusChange(tid,e.target.value)} style={{background:STATUS[task.status]?.ring+'22',color:STATUS[task.status]?.color,border:`1px solid ${STATUS[task.status]?.ring+'44'}`,borderRadius:6,padding:'3px 6px',fontSize:10,fontWeight:700,cursor:'pointer',outline:'none',fontFamily:'inherit'}}>
              {Object.entries(STATUS).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
            </select>
            <Pill label={PRIORITY[task.priority]?.label||'Medium'} color={PRIORITY[task.priority]?.color||'#F59E0B'} tiny/>
            {task.assignee?<Avatar name={task.assignee.name||task.assignee} size={26}/>:<span style={{color:T.textMuted,fontSize:11}}>—</span>}
            <span style={{fontSize:11,fontWeight:600,color:dl.color}}>{dl.text}</span>
            <div style={{display:'flex',gap:6}}>
              <button onClick={()=>onEdit(task)} style={{background:'none',border:`1px solid ${T.border}`,color:T.textSub,borderRadius:5,padding:'3px 8px',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>Edit</button>
              <button onClick={()=>onDelete(tid)} style={{background:'none',border:`1px solid #F43F5E44`,color:'#F43F5E',borderRadius:5,padding:'3px 8px',fontSize:11,cursor:'pointer',fontFamily:'inherit'}}>✕</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
