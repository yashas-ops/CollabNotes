import mongoose from 'mongoose';

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
    index: true
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true
  },
  permission: {
    type: String,
    enum: ['view', 'edit'],
    default: 'edit'
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

inviteSchema.index({ email: 1, documentId: 1 }, { unique: true });

export default mongoose.model('Invite', inviteSchema);
