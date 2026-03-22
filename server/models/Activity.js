import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['edited', 'shared', 'restored', 'joined', 'left', 'commented'],
    required: true
  },
  details: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

activitySchema.index({ documentId: 1, timestamp: -1 });

activitySchema.statics.logActivity = async function(documentId, userId, username, action, details = '') {
  const activity = new this({
    documentId,
    userId,
    username,
    action,
    details,
    timestamp: new Date()
  });
  await activity.save();
  return activity;
};

export default mongoose.model('Activity', activitySchema);
