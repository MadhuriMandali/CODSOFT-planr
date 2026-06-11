import React from 'react';
import { T, STATUS, PRIORITY } from '../tokens';
import { BarProgress } from './UI';
import { daysLeft } from '../utils';

export default function OverviewView({ project }) {
  const tasks = project.tasks||[];
  const card = (children,extra={}) => (
    <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:14,padding:20,...extra}}>{children}</div>
  );
  const head = label => <div style={{fontSize:10,fontWeight:800,color:T.textMuted,letterSpacing:'0.1em',marginBottom:14}}>{label}</div>;

  const overdue  = tasks.filter(t=>{const d=daysLeft(t.deadline);return d!==null&&d<0&&t.status!=='done';});
  const upcoming = tasks.filter(t=>{const d=daysLeft(t.deadline);return d!==null&&d>=0&&d<=7&&t.status!=='done';}).sort((a,b)=>daysLeft(a.deadline)-daysLeft(b.deadline));

  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:18}}>
      {card(<>
        {head('STATUS BREAKDOWN')}
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {Object.entries(STATUS).map(([k,v])=>{
            const count=tasks.filter(t=>t.status===k).length;
            return (
              <div key={k}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:12,color:v.color,fontWeight:700}}>{v.label}</span>
                  <span style={{fontSize:11,color:T.textMuted}}>{count} of {tasks.length}</span>
                </div>
                <BarProgress pct={tasks.length?count/tasks.length*100:0} color={v.color} h={5}/>
              </div>
            );
          })}
        </div>
      </>)}

      {card(<>
        {head('PRIORITY SPLIT')}
        <div style={{display:'flex',gap:10}}>
          {Object.entries(PRIORITY).map(([k,v])=>{
            const count=tasks.filter(t=>t.priority===k).length;
            return (
              <div key={k} style={{flex:1,background:v.color+'18',border:`1px solid ${v.color}33`,borderRadius:10,padding:'16px 10px',textAlign:'center'}}>
                <div style={{fontSize:32,fontWeight:900,color:v.color,lineHeight:1}}>{count}</div>
                <div style={{fontSize:10,fontWeight:700,color:v.color,marginTop:5,letterSpacing:'0.06em'}}>{v.label.toUpperCase()}</div>
              </div>
            );
          })}
        </div>
      </>)}

      {overdue.length>0&&(
        <div style={{background:'#F43F5E0D',border:'1px solid #F43F5E33',borderRadius:14,padding:18}}>
          {head(`⚠ OVERDUE — ${overdue.length} task${overdue.length!==1?'s':''}`)}
          {overdue.map(t=>(
            <div key={t._id} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid #F43F5E22'}}>
              <span style={{fontSize:12,color:T.text}}>{t.title}</span>
              <span style={{fontSize:11,color:'#F43F5E',fontWeight:700}}>{Math.abs(daysLeft(t.deadline))}d ago</span>
            </div>
          ))}
        </div>
      )}

      {card(<>
        {head('DUE THIS WEEK')}
        {upcoming.length===0
          ?<p style={{color:T.textMuted,fontSize:12,margin:0}}>Nothing due in the next 7 days</p>
          :upcoming.map(t=>{
            const d=daysLeft(t.deadline);
            return (
              <div key={t._id} style={{display:'flex',justifyContent:'space-between',padding:'7px 0',borderBottom:`1px solid ${T.border}`}}>
                <span style={{fontSize:12,color:T.text}}>{t.title}</span>
                <span style={{fontSize:11,fontWeight:700,color:d===0?'#F59E0B':T.textSub}}>{d===0?'Today':`${d}d`}</span>
              </div>
            );
          })}
      </>)}
    </div>
  );
}
