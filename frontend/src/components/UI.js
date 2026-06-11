import React, { useEffect } from 'react';
import { T, inputStyle } from '../tokens';

export function Avatar({ name='', color=T.blue, size=28 }) {
  const initials = name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
  return (
    <div title={name} style={{
      width:size,height:size,borderRadius:'50%',
      background:color+'30',border:`1.5px solid ${color}55`,
      display:'flex',alignItems:'center',justifyContent:'center',
      flexShrink:0,fontSize:size*0.36,fontWeight:700,color,userSelect:'none',
    }}>{initials||'?'}</div>
  );
}

export function Pill({ label, color, tiny }) {
  return (
    <span style={{
      fontSize:tiny?10:11,fontWeight:700,letterSpacing:'0.04em',
      padding:tiny?'1px 6px':'2px 8px',borderRadius:4,
      background:color+'22',color,border:`1px solid ${color}33`,whiteSpace:'nowrap',
    }}>{label}</span>
  );
}

export function ProgressRing({ pct, color, size=56, sw=5 }) {
  const r=(size-sw*2)/2, circ=2*Math.PI*r, fill=pct/100*circ;
  return (
    <div style={{position:'relative',width:size,height:size,flexShrink:0}}>
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.border} strokeWidth={sw}/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color}
          strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={`${fill} ${circ}`}
          style={{transition:'stroke-dasharray .6s cubic-bezier(.4,0,.2,1)'}}/>
      </svg>
      <span style={{
        position:'absolute',inset:0,display:'flex',alignItems:'center',
        justifyContent:'center',fontSize:size*0.24,fontWeight:800,color,
      }}>{pct}%</span>
    </div>
  );
}

export function BarProgress({ pct, color, h=4 }) {
  return (
    <div style={{background:T.border,borderRadius:h,height:h,overflow:'hidden'}}>
      <div style={{width:`${pct}%`,height:'100%',background:color,borderRadius:h,transition:'width .5s ease'}}/>
    </div>
  );
}

export function Btn({ children, onClick, type='button', variant='primary', sm, disabled, full, color }) {
  const v={
    primary:{bg:color||T.blue,text:'#fff',border:'none'},
    ghost:{bg:'transparent',text:T.textSub,border:`1px solid ${T.border}`},
    danger:{bg:T.rose+'18',text:T.rose,border:`1px solid ${T.rose}44`},
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      background:v.bg,color:v.text,border:v.border,borderRadius:8,
      padding:sm?'5px 12px':'9px 20px',fontSize:sm?12:13,fontWeight:700,
      cursor:disabled?'default':'pointer',opacity:disabled?.5:1,
      width:full?'100%':undefined,fontFamily:'inherit',transition:'opacity .15s',whiteSpace:'nowrap',
    }}>{children}</button>
  );
}

export function Modal({ title, onClose, width=500, children }) {
  useEffect(()=>{
    const fn=e=>{if(e.key==='Escape')onClose();};
    window.addEventListener('keydown',fn);
    return ()=>window.removeEventListener('keydown',fn);
  },[onClose]);
  return (
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{
      position:'fixed',inset:0,background:'rgba(0,0,0,.75)',backdropFilter:'blur(4px)',
      display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:16,
    }}>
      <div style={{
        background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,
        padding:'28px 28px 24px',width:'100%',maxWidth:width,
        maxHeight:'90vh',overflowY:'auto',boxShadow:'0 32px 64px rgba(0,0,0,.6)',
      }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
          <h2 style={{margin:0,fontSize:17,fontWeight:800,color:T.text}}>{title}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',color:T.textMuted,fontSize:18,cursor:'pointer'}}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Field({ label, children }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:5}}>
      <label style={{fontSize:11,fontWeight:700,color:T.textSub,letterSpacing:'0.07em'}}>{label}</label>
      {children}
    </div>
  );
}

export function TextInput({ label, value, onChange, placeholder, type='text', name }) {
  return <Field label={label}><input name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} style={inputStyle}/></Field>;
}

export function TextArea({ label, value, onChange, placeholder, rows=3 }) {
  return <Field label={label}><textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} style={{...inputStyle,resize:'vertical'}}/></Field>;
}

export function SelectInput({ label, value, onChange, options }) {
  return (
    <Field label={label}>
      <select value={value} onChange={onChange} style={{...inputStyle,cursor:'pointer'}}>
        {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </Field>
  );
}

export function Toast({ msg }) {
  if(!msg) return null;
  return (
    <div style={{
      position:'fixed',bottom:28,left:'50%',transform:'translateX(-50%)',
      background:'#1A2236',border:'1px solid #2E3D5C',borderRadius:10,
      padding:'10px 20px',fontSize:13,fontWeight:600,color:'#E2E8F0',
      boxShadow:'0 8px 32px rgba(0,0,0,.5)',zIndex:9999,pointerEvents:'none',
    }}>{msg}</div>
  );
}

export function Spinner() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',padding:60}}>
      <div style={{
        width:36,height:36,borderRadius:'50%',
        border:'3px solid #1E2A40',borderTopColor:'#3B82F6',
        animation:'spin .8s linear infinite',
      }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
