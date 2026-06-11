const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:    { type:String, required:true, trim:true },
  notes:    { type:String, default:'' },
  status:   { type:String, enum:['todo','inprogress','review','done'], default:'todo' },
  priority: { type:String, enum:['low','medium','high'], default:'medium' },
  assignee: { type:mongoose.Schema.Types.ObjectId, ref:'User', default:null },
  deadline: { type:String, default:'' },
}, { timestamps:true });

const projectSchema = new mongoose.Schema({
  name:        { type:String, required:true, trim:true },
  description: { type:String, default:'' },
  deadline:    { type:String, default:'' },
  palette:     { type:Number, default:0, min:0, max:5 },
  owner:       { type:mongoose.Schema.Types.ObjectId, ref:'User', required:true },
  members:     [{ type:mongoose.Schema.Types.ObjectId, ref:'User' }],
  tasks:       [taskSchema],
}, { timestamps:true });

projectSchema.virtual('progress').get(function() {
  if (!this.tasks.length) return 0;
  return Math.round(this.tasks.filter(t=>t.status==='done').length / this.tasks.length * 100);
});
projectSchema.set('toJSON', { virtuals:true });

module.exports = mongoose.model('Project', projectSchema);
