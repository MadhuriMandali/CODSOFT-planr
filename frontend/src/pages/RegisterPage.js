import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import { authAPI } from '../api';
import { T } from '../tokens';
import { Btn, TextInput } from '../components/UI';

export default function RegisterPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const set = (k,v) => setForm(p=>({...p,[k]:v}));

  const handleSubmit = async e => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await authAPI.register(form);
      signIn(data.user, data.token);
      navigate('/');
    } catch(err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{minHeight:'100vh',background:T.bg,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:18,padding:36,width:'100%',maxWidth:400,boxShadow:'0 32px 64px rgba(0,0,0,.5)'}}>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:32}}>
          <div style={{width:36,height:36,borderRadius:10,background:'linear-gradient(135deg,#3B82F6,#7C3AED)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,fontWeight:900,color:'#fff'}}>P</div>
          <span style={{fontSize:20,fontWeight:900,color:T.text}}>Plan<span style={{color:T.blue}}>r</span></span>
        </div>
        <h1 style={{margin:'0 0 6px',fontSize:22,fontWeight:800,color:T.text}}>Create account</h1>
        <p style={{margin:'0 0 28px',fontSize:13,color:T.textMuted}}>Start managing your projects</p>
        <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
          <TextInput label="FULL NAME" value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Alex Rivera"/>
          <TextInput label="EMAIL" type="email" value={form.email} onChange={e=>set('email',e.target.value)} placeholder="you@company.com"/>
          <TextInput label="PASSWORD" type="password" value={form.password} onChange={e=>set('password',e.target.value)} placeholder="Min. 8 characters"/>
          {error && <div style={{background:T.rose+'18',border:`1px solid ${T.rose}44`,borderRadius:8,padding:'10px 14px',fontSize:12,color:T.rose}}>{error}</div>}
          <Btn type="submit" full disabled={loading||!form.name||!form.email||!form.password}>{loading?'Creating…':'Create account'}</Btn>
        </form>
        <p style={{marginTop:24,textAlign:'center',fontSize:13,color:T.textMuted}}>
          Have an account? <Link to="/login" style={{color:T.blue,fontWeight:600,textDecoration:'none'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
