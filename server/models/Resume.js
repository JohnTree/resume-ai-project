const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  personalInfo: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    website: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' }
  },
  summary: {
    type: String,
    default: ''
  },
  experience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, default: '' },
    current: { type: Boolean, default: false },
    description: { type: String, default: '' },
    achievements: [{ type: String }]
  }],
  education: [{
    school: { type: String, required: true },
    degree: { type: String, required: true },
    major: { type: String, default: '' },
    startDate: { type: String, required: true },
    endDate: { type: String, default: '' },
    gpa: { type: String, default: '' },
    description: { type: String, default: '' }
  }],
  skills: [{
    category: { type: String, required: true },
    items: [{ type: String }],
    level: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' }
  }],
  projects: [{
    name: { type: String, required: true },
    description: { type: String, default: '' },
    technologies: [{ type: String }],
    url: { type: String, default: '' },
    github: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' }
  }],
  certifications: [{
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String, required: true },
    url: { type: String, default: '' }
  }],
  languages: [{
    name: { type: String, required: true },
    level: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'], default: 'conversational' }
  }],
  template: {
    type: String,
    default: 'modern'
  },
  theme: {
    primaryColor: { type: String, default: '#2563eb' },
    secondaryColor: { type: String, default: '#64748b' },
    fontFamily: { type: String, default: 'Inter' }
  },
  isPublic: {
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

// 更新时间中间件
resumeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Resume', resumeSchema);