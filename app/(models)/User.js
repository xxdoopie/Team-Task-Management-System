import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';


const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'employee'],
    default: 'employee'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=60&h=60&fit=crop&crop=face'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date
  },
  completionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  }
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Add a condition to calculate completion rate only for employees
UserSchema.methods.calculateCompletionRate = async function() {
  if (this.role !== 'employee') return; // Only calculate for employees

  const Task = mongoose.model('Task');
  const totalTasks = await Task.countDocuments({ assignedTo: this._id });
  const completedTasks = await Task.countDocuments({ assignedTo: this._id, status: 'Completed' });

  this.completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  await this.save();
};

export default mongoose.models.User || mongoose.model('User', UserSchema);