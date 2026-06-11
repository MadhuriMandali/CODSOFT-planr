import React, { useState } from 'react';
import { STATUS, PRIORITY } from '../tokens';
import { Modal, Btn, TextInput, TextArea, SelectInput } from './UI';

export default function TaskModal({ initial, onSave, onDelete, onClose }) {
  const [f, setF] = useState({
    title: initial?.title||'', notes: initial?.notes||'',
    status: initial?.status||'todo', priority: initial?.priority||'medium',
    assignee: initial?.assignee?._id||initial?.assignee||'',
    deadline: initial?.deadline||'',
  });
  const set = (k,v) => setF(p=>({...p,[k]:v}));
  return (
    <Modal title={initial?'Edit task':'New task'} onClose={onClose}>
      <div style={{display:'flex',flexDirection:'column',gap:16}}>
        <TextInput label="TITLE" value={f.title} onChange={e=>set('title',e.target.value)} placeholder="What needs to be done?"/>
        <TextArea label="NOTES" value={f.notes} onChange={e=>set('notes',e.target.value)} placeholder="Optional details…" rows={2}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
          <SelectInput label="STATUS" value={f.status} onChange={e=>set('status',e.target.value)}
            options={Object.entries(STATUS).map(([k,v])=>({value:k,label:v.label}))}/>
          <SelectInput label="PRIORITY" value={f.priority} onChange={e=>set('priority',e.target.value)}
            options={Object.entries(PRIORITY).map(([k,v])=>({value:k,label:v.label}))}/>
        </div>
        <TextInput label="DEADLINE" type="date" value={f.deadline} onChange={e=>set('deadline',e.target.value)}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
          <div>{onDelete&&<Btn variant="danger" sm onClick={onDelete}>Delete task</Btn>}</div>
          <div style={{display:'flex',gap:8}}>
            <Btn variant="ghost" sm onClick={onClose}>Cancel</Btn>
            <Btn sm disabled={!f.title.trim()} onClick={()=>onSave(f)}>Save task</Btn>
          </div>
        </div>
      </div>
    </Modal>
  );
}
