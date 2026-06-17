const express = require('express');
const Project = require('../models/Project');
const protect = require('../middleware/auth');
const router  = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({$or:[{owner:req.user._id},{members:req.user._id}]})
      .populate('tasks.assignee','name email').sort({createdAt:-1});
    res.json(projects);
  } catch(e){ next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description, deadline, palette } = req.body;
    if (!name?.trim()) return res.status(400).json({ message:'Project name required' });
    const p = await Project.create({ name, description, deadline, palette, owner:req.user._id, members:[req.user._id] });
    res.status(201).json(p);
  } catch(e){ next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const p = await Project.findById(req.params.id).populate('tasks.assignee','name email');
    if (!p) return res.status(404).json({ message:'Not found' });
    res.json(p);
  } catch(e){ next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message:'Not found' });
    if (!p.owner.equals(req.user._id)) return res.status(403).json({ message:'Forbidden' });

    const { name, description, deadline, palette, assignedMembers } = req.body;
    if (name            !== undefined) p.name            = name;
    if (description     !== undefined) p.description     = description;
    if (deadline        !== undefined) p.deadline        = deadline;
    if (palette         !== undefined) p.palette         = palette;
    if (assignedMembers !== undefined) p.assignedMembers = assignedMembers; // ← fix

    await p.save();
    res.json(p);
  } catch(e){ next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message:'Not found' });
    if (!p.owner.equals(req.user._id)) return res.status(403).json({ message:'Forbidden' });
    await p.deleteOne();
    res.json({ message:'Deleted' });
  } catch(e){ next(e); }
});

module.exports = router;