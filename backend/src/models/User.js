const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const schema = new mongoose.Schema({
  name:     { type:String, required:true, trim:true },
  email:    { type:String, required:true, unique:true, lowercase:true, trim:true },
  password: { type:String, required:true, minlength:8, select:false },
}, { timestamps:true });

schema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

schema.methods.comparePassword = function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

schema.methods.toJSON = function() {
  const o = this.toObject();
  delete o.password;
  return o;
};

module.exports = mongoose.model('User', schema);
