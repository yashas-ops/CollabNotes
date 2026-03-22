import mongoose from 'mongoose';

const collaboratorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  permission: {
    type: String,
    enum: ['view', 'edit'],
    default: 'view'
  }
}, { _id: false });

const versionSchema = new mongoose.Schema({
  content: {
    type: mongoose.Schema.Types.Mixed
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    default: 'Untitled',
    trim: true
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  collaborators: [collaboratorSchema],
  versions: [versionSchema]
}, {
  timestamps: true
});

documentSchema.index({ owner: 1 });
documentSchema.index({ 'collaborators.userId': 1 });
documentSchema.index({ updatedAt: -1 });
documentSchema.index({ owner: 1, updatedAt: -1 });
documentSchema.index({ title: 'text' });

documentSchema.methods.hasAccess = function(userId, requiredPermission = 'view') {
  const isOwner = this.owner.toString() === userId.toString();
  if (isOwner) return true;
  
  const collaborator = this.collaborators.find(
    c => c.userId.toString() === userId.toString()
  );
  
  if (!collaborator) return false;
  
  if (requiredPermission === 'view') return true;
  return collaborator.permission === 'edit';
};

documentSchema.methods.canEdit = function(userId) {
  return this.hasAccess(userId, 'edit');
};

documentSchema.methods.addVersion = function(content) {
  if (this.versions.length >= 50) {
    this.versions.shift();
  }
  this.versions.push({ content, createdAt: new Date() });
};

export default mongoose.model('Document', documentSchema);
