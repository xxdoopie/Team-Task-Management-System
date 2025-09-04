import mongoose from 'mongoose';

const TodoItemSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  }
});

const AttachmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['link', 'file'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number // for file uploads
  },
  mimeType: {
    type: String // for file uploads
  }
});

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: { type: String, required: false },
  priority: {
    type: String,
    enum: ['Low Priority', 'Medium Priority', 'High Priority'],
    default: 'Medium Priority'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed'],
    default: 'Pending'
  },
  dueDate: {
    type: Date,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  todoItems: [TodoItemSchema],
  attachments: [AttachmentSchema],
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  estimatedHours: {
    type: Number
  },
  actualHours: {
    type: Number
  },
  tags: [String],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    text: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Calculate completion percentage based on todo items
TaskSchema.pre('save', function(next) {
  if (this.todoItems && this.todoItems.length > 0) {
    const completedItems = this.todoItems.filter(item => item.completed).length;
    this.completionPercentage = Math.round((completedItems / this.todoItems.length) * 100);
    
    // Auto-update status based on completion
    if (this.completionPercentage === 0) {
      this.status = 'Pending';
    } else if (this.completionPercentage === 100) {
      this.status = 'Completed';
    } else {
      this.status = 'In Progress';
    }
  }
  next();
});

// Add a pre-save hook to validate and normalize attachment URLs
TaskSchema.pre('save', function(next) {
  if (this.attachments && this.attachments.length > 0) {
    this.attachments = this.attachments.map((attachment) => {
      if (attachment.type === 'link' && !/^https?:\/\//i.test(attachment.url)) {
        attachment.url = `http://${attachment.url}`;
      }
      return attachment;
    });
  }
  next();
});

// Middleware to update employee completion rate when task status changes
TaskSchema.post('save', async function(doc) {
  if (this.isModified('status') && this.status === 'Completed') {
    const User = mongoose.model('User');

    for (const employeeId of this.assignedTo) {
      const totalTasks = await Task.countDocuments({ assignedTo: employeeId });
      const completedTasks = await Task.countDocuments({ assignedTo: employeeId, status: 'Completed' });

      const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      await User.findByIdAndUpdate(employeeId, { completionRate });
    }
  }
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);