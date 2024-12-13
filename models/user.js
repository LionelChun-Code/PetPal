const mongoose = require('mongoose');

// Define User schema
// 定義 User 模式
const userSchema = new mongoose.Schema({
  // 其他字段
  username: {
    type: String,
    required: [true, 'Username is required'],
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [20, 'Username cannot be longer than 20 characters']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 6 characters long'],
    maxlength: [60, 'Password length must be at most 60 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ["Super Admin", "Admin", "User", "Guest"],
    default: 'user',
    required: [true, 'Role is required']
  },
  isActivated: {
    type: Boolean,
    default: true
  },
  isDormant: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Set middleware to update the updatedAt field before saving
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
