const express = require('express');
const Project = require('../models/Project');
const protect = require('../middleware/auth');
const router  = express.Router();

router.use(protect);

async function load(id, uid, res) {
  const p = await Project.findById(id);
  if (!p) { res.status(404).json({message:'Project not found'}); return null; }
  const ok = p.owner.equals(uid) || p.members.map(String).includes(String(uid));
  if (!ok) { res.status(403).json({message:'Forbidden'}); return null; }
  return p;
}

router.get('/:pid/tasks', async (req,res,next)=>{
  try {
    const p = await Project.findById(req.params.pid).populate('tasks.assignee','name email');
    if(!p) return res.status(404).json({message:'Not found'});
    res.json(p.tasks);
  } catch(e){next(e);}
});

router.post('/:pid/tasks', async (req,res,next)=>{
  try {
    const p = await load(req.params.pid, req.user._id, res);
    if(!p) return;
    const { title, notes, status, priority, assignee, deadline } = req.body;
    if (!title?.trim()) return res.status(400).json({message:'Title required'});
    p.tasks.push({ title, notes, status, priority, assignee:assignee||null, deadline });
    await p.save();
    await p.populate('tasks.assignee','name email');
    res.status(201).json(p.tasks[p.tasks.length-1]);
  } catch(e){next(e);}
});

router.put('/:pid/tasks/:tid', async (req,res,next)=>{
  try {
    const p = await load(req.params.pid, req.user._id, res);
    if(!p) return;
    const t = p.tasks.id(req.params.tid);
    if(!t) return res.status(404).json({message:'Task not found'});
    const { title, notes, status, priority, assignee, deadline } = req.body;
    if(title    !==undefined) t.title    = title;
    if(notes    !==undefined) t.notes    = notes;
    if(status   !==undefined) t.status   = status;
    if(priority !==undefined) t.priority = priority;
    if(assignee !==undefined) t.assignee = assignee||null;
    if(deadline !==undefined) t.deadline = deadline;
    await p.save();
    await p.populate('tasks.assignee','name email');
    res.json(p.tasks.id(req.params.tid));
  } catch(e){next(e);}
});

router.delete('/:pid/tasks/:tid', async (req,res,next)=>{
  try {
    const p = await load(req.params.pid, req.user._id, res);
    if(!p) return;
    const t = p.tasks.id(req.params.tid);
    if(!t) return res.status(404).json({message:'Task not found'});
    t.deleteOne();
    await p.save();
    res.json({message:'Deleted'});
  } catch(e){next(e);}
});

module.exports = router;
