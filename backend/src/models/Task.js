const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:    { type: String, required: true, trim: true },
  notes:    { type: String, default: '' },
  status:   { type: String, enum: ['todo','inprogress','review','done'], default: 'todo' },
  priority: { type: String, enum: ['low','medium','high'], default: 'medium' },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deadline: { type: String, default: '' },   // ISO date string YYYY-MM-DD
  order:    { type: Number, default: 0 },
}, { timestamps: true });

module.exports = taskSchema;
