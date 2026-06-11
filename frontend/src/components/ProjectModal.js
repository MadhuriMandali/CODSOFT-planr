import React, { useState } from 'react';
import { PALETTES } from '../tokens';
import { Modal, Btn, TextInput, TextArea, Field } from './UI';

export default function ProjectModal({ initial, onSave, onClose }) {
  const [f, setF] = useState({
    name: initial?.name||'', description: initial?.description||'',
    deadline: initial?.deadline||'', palette: initial?.palette??0,
  });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  const pal = PALETTES[f.palette];
  return (
    <Modal title={initial?'Edit project':'New project'} onClose={onClose}>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <TextInput label="PROJECT NAME" value={f.name} onChange={e=>set('name',e.target.value)} placeholder="e.g. Q3 Campaign"/>
        <TextArea label="DESCRIPTION" value={f.description} onChange={e=>set('description',e.target.value)} placeholder="What is this project about?" rows={2}/>
        <TextInput label="DEADLINE" type="date" value={f.deadline} onChange={e=>set('deadline',e.target.value)}/>
        <Field label="COLOR">
          <div style={{display:'flex',gap:10}}>
            {PALETTES.map((p,i)=>(
              <button key={i} onClick={()=>set('palette',i)} style={{
                width:30,height:30,borderRadius:'50%',background:p.bg,border:'none',cursor:'pointer',
                outline:f.palette===i?`3px solid ${p.bg}`:'none',outlineOffset:3,
              }}/>
            ))}
          </div>
        </Field>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
          <Btn variant="ghost" sm onClick={onClose}>Cancel</Btn>
          <Btn sm color={pal.bg} disabled={!f.name.trim()} onClick={()=>onSave(f)}>
            {initial?'Save changes':'Create project'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
