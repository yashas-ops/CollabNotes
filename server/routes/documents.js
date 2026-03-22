import express from 'express';
import Document from '../models/Document.js';
import User from '../models/User.js';
import Invite from '../models/Invite.js';
import Activity from '../models/Activity.js';
import { authenticate } from '../middleware/auth.js';
import { sendShareNotification, sendInviteEmail, sendEmailAsync } from '../utils/email.js';
import PDFDocument from 'pdfkit';
import { Document as DocxDocument, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

const router = express.Router();

router.use(authenticate);

const addAccessType = (documents, userId) => {
  const docs = Array.isArray(documents) ? documents : [documents];
  return docs.map(doc => {
    const docObj = doc.toObject ? doc.toObject() : doc;
    const ownerId = docObj.owner?._id ? docObj.owner._id.toString() : docObj.owner?.toString();
    const isOwner = ownerId === userId.toString();
    const isCollaborator = docObj.collaborators?.some(
      c => c.userId && (c.userId._id ? c.userId._id.toString() : c.userId.toString()) === userId.toString()
    );
    return {
      ...docObj,
      accessType: isOwner ? 'owner' : isCollaborator ? 'collaborator' : null
    };
  });
};

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    
    let query = {
      $or: [
        { owner: req.userId },
        { 'collaborators.userId': req.userId }
      ]
    };
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    
    const documents = await Document.find(query)
      .populate('owner', 'username email')
      .select('title owner collaborators updatedAt createdAt')
      .sort({ updatedAt: -1 })
      .lean();
    
    const docsWithAccess = addAccessType(documents, req.userId);
    
    res.json({
      success: true,
      data: docsWithAccess
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch documents.'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title } = req.body;
    
    const document = new Document({
      title: title || 'Untitled',
      owner: req.userId
    });
    
    await document.save();
    
    const docWithAccess = addAccessType(document, req.userId)[0];
    
    res.status(201).json({
      success: true,
      data: docWithAccess
    });
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create document.'
    });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('owner', 'username email')
      .populate('collaborators.userId', 'username email');
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }
    
    const ownerId = document.owner._id ? document.owner._id.toString() : document.owner.toString();
    const isOwner = ownerId === req.userId.toString();
    const isCollaborator = document.collaborators.some(
      c => c.userId && (c.userId._id ? c.userId._id.toString() : c.userId.toString()) === req.userId.toString()
    );
    
    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        success: false,
        error: 'Access denied.'
      });
    }
    
    const docWithAccess = addAccessType(document, req.userId)[0];
    
    res.json({
      success: true,
      data: docWithAccess
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch document.'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }
    
    if (!document.hasAccess(req.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied.'
      });
    }
    
    const { title, content, saveVersion } = req.body;
    const user = await User.findById(req.userId);
    
    if (title !== undefined) {
      if (!document.canEdit(req.userId)) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to edit this document.'
        });
      }
      document.title = title;
    }
    
    if (content !== undefined && document.canEdit(req.userId)) {
      if (saveVersion) {
        document.addVersion(document.content);
      }
      document.content = content;
      
      Activity.logActivity(
        req.params.id,
        req.userId,
        user.username,
        'edited',
        'Updated document content'
      ).catch(err => console.error('Activity log error:', err));
    }
    
    await document.save();
    
    const docWithAccess = addAccessType(document, req.userId)[0];
    
    res.json({
      success: true,
      data: docWithAccess
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update document.'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }
    
    if (document.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the owner can delete this document.'
      });
    }
    
    await Document.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'Document deleted successfully.'
    });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete document.'
    });
  }
});

router.post('/:id/share', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    const user = await User.findById(req.userId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }
    
    if (document.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the owner can share this document.'
      });
    }
    
    const { email, permission } = req.body;
    
    if (!email || !permission) {
      return res.status(400).json({
        success: false,
        error: 'Email and permission are required.'
      });
    }
    
    if (!['view', 'edit'].includes(permission)) {
      return res.status(400).json({
        success: false,
        error: 'Permission must be "view" or "edit".'
      });
    }
    
    const normalizedEmail = email.toLowerCase().trim();
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const documentLink = `${clientUrl}/document/${document._id}`;
    
    const userToShare = await User.findOne({ email: normalizedEmail });
    const inviter = await User.findById(req.userId);

    if (userToShare) {
      if (userToShare._id.toString() === req.userId.toString()) {
        return res.status(400).json({
          success: false,
          error: 'You cannot share with yourself.'
        });
      }
      
      const existingCollaboratorIndex = document.collaborators.findIndex(
        c => c.userId.toString() === userToShare._id.toString()
      );
      
      const isNewCollaborator = existingCollaboratorIndex === -1;
      
      if (existingCollaboratorIndex !== -1) {
        document.collaborators[existingCollaboratorIndex].permission = permission;
      } else {
        document.collaborators.push({
          userId: userToShare._id,
          permission
        });
      }
      
      await document.save();
      
      const updatedDocument = await Document.findById(req.params.id)
        .populate('owner', 'username email')
        .populate('collaborators.userId', 'username email');
      
      Activity.logActivity(
        req.params.id,
        req.userId,
        user.username,
        'shared',
        `Shared document with ${normalizedEmail} (${permission} access)`
      ).catch(err => console.error('Activity log error:', err));
      
      // Fire-and-forget: send share notification email in background
      sendEmailAsync(sendShareNotification, normalizedEmail, document.title, documentLink, inviter.username);
      
      const docWithAccess = addAccessType(updatedDocument, req.userId)[0];
      res.json({
        success: true,
        message: `Document shared with ${normalizedEmail}.`,
        data: docWithAccess
      });
    } else {
      // User not registered yet - send invite email
      const existingInvite = await Invite.findOne({ email: normalizedEmail, documentId: document._id });
      
      if (existingInvite) {
        return res.json({
          success: true,
          message: `Invitation already sent to ${normalizedEmail}.`
        });
      }
      
      const invite = new Invite({
        email: normalizedEmail,
        documentId: document._id,
        permission,
        invitedBy: req.userId
      });
      await invite.save();
      
      Activity.logActivity(
        req.params.id,
        req.userId,
        user.username,
        'shared',
        `Invited ${normalizedEmail} to collaborate (${permission} access)`
      ).catch(err => console.error('Activity log error:', err));
      
      // Fire-and-forget: send invite email in background
      sendEmailAsync(sendInviteEmail, normalizedEmail, document.title, documentLink, inviter.username);
      
      res.json({
        success: true,
        message: `Invitation sent to ${normalizedEmail}.`
      });
    }
  } catch (error) {
    console.error('Share document error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to share document.'
    });
  }
});

router.delete('/:id/share/:userId', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    const user = await User.findById(req.userId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }
    
    if (document.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the owner can remove collaborators.'
      });
    }

    if (document.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove yourself from the document.'
      });
    }
    
    const removedUser = document.collaborators.find(
      c => c.userId.toString() === req.params.userId
    );

    document.collaborators = document.collaborators.filter(
      c => c.userId.toString() !== req.params.userId
    );
    
    await document.save();
    
    Activity.logActivity(
      req.params.id,
      req.userId,
      user.username,
      'shared',
      `Removed collaborator`
    ).catch(err => console.error('Activity log error:', err));
    
    res.json({
      success: true,
      message: 'Collaborator removed.'
    });
  } catch (error) {
    console.error('Remove collaborator error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove collaborator.'
    });
  }
});

router.patch('/:id/collaborators/:userId/role', async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findById(req.userId);
    
    if (!role || !['view', 'edit'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role must be "view" or "edit".'
      });
    }
    
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }
    
    if (document.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Only the owner can change collaborator roles.'
      });
    }
    
    if (document.owner.toString() === req.params.userId) {
      return res.status(400).json({
        success: false,
        error: 'Cannot change owner role.'
      });
    }
    
    const collaborator = document.collaborators.find(
      c => c.userId.toString() === req.params.userId
    );
    
    if (!collaborator) {
      return res.status(404).json({
        success: false,
        error: 'Collaborator not found.'
      });
    }
    
    collaborator.permission = role;
    await document.save();
    
    Activity.logActivity(
      req.params.id,
      req.userId,
      user.username,
      'shared',
      `Changed collaborator role to ${role}`
    ).catch(err => console.error('Activity log error:', err));
    
    res.json({
      success: true,
      data: {
        userId: collaborator.userId,
        permission: collaborator.permission
      }
    });
  } catch (error) {
    console.error('Change role error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to change role.'
    });
  }
});

router.get('/:id/versions', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }
    
    if (!document.hasAccess(req.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied.'
      });
    }
    
    res.json({
      success: true,
      data: document.versions.map(v => ({
        _id: v._id,
        createdAt: v.createdAt
      }))
    });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch versions.'
    });
  }
});

router.post('/:id/restore/:versionId', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    const user = await User.findById(req.userId);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }
    
    if (!document.canEdit(req.userId)) {
      return res.status(403).json({
        success: false,
        error: 'You do not have edit access.'
      });
    }
    
    const version = document.versions.find(
      v => v._id.toString() === req.params.versionId
    );
    
    if (!version) {
      return res.status(404).json({
        success: false,
        error: 'Version not found.'
      });
    }
    
    document.addVersion(document.content);
    document.content = version.content;
    
    await document.save();
    
    Activity.logActivity(
      req.params.id,
      req.userId,
      user.username,
      'restored',
      'Restored document to a previous version'
    ).catch(err => console.error('Activity log error:', err));
    
    const docWithAccess = addAccessType(document, req.userId)[0];
    
    res.json({
      success: true,
      data: docWithAccess
    });
  } catch (error) {
    console.error('Restore version error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to restore version.'
    });
  }
});

router.get('/:id/activity', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found.'
      });
    }
    
    if (!document.hasAccess(req.userId)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied.'
      });
    }
    
    const activities = await Activity.find({ documentId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(50)
      .lean();
    
    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity.'
    });
  }
});

function extractTextFromContent(content) {
  if (!content) return '';
  
  try {
    const parsed = typeof content === 'string' ? JSON.parse(content) : content;
    if (!parsed.content) return '';
    
    const extractText = (node) => {
      if (!node) return '';
      if (node.type === 'text') return node.text || '';
      if (node.content) {
        return node.content.map(extractText).join('');
      }
      return '';
    };
    
    return extractText(parsed);
  } catch (e) {
    return String(content);
  }
}

router.get('/:id/export/pdf', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).send('Document not found.');
    }
    
    if (!document.hasAccess(req.userId)) {
      return res.status(403).send('Access denied.');
    }
    
    const text = extractTextFromContent(document.content);
    const doc = new PDFDocument({ margin: 50 });
    
    res.setHeader('Content-Type', 'application/pdf');
    const filename = `${document.title || 'document'}.pdf`.replace(/[^a-zA-Z0-9.-]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    
    doc.fontSize(24).text(document.title || 'Untitled', { align: 'center' });
    doc.moveDown();
    
    doc.fontSize(12).text(text || 'No content', {
      align: 'left',
      lineGap: 4
    });
    
    doc.end();
  } catch (error) {
    console.error('Export PDF error:', error);
    res.status(500).send('Failed to export PDF.');
  }
});

router.get('/:id/export/docx', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).send('Document not found.');
    }
    
    if (!document.hasAccess(req.userId)) {
      return res.status(403).send('Access denied.');
    }
    
    const text = extractTextFromContent(document.content);
    
    const doc = new DocxDocument({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: document.title || 'Untitled',
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: text || 'No content',
              }),
            ],
          }),
        ],
      }],
    });
    
    const buffer = await Packer.toBuffer(doc);
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    const filename = `${document.title || 'document'}.docx`.replace(/[^a-zA-Z0-9.-]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Export DOCX error:', error);
    res.status(500).send('Failed to export DOCX.');
  }
});

router.get('/:id/export/md', async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    
    if (!document) {
      return res.status(404).send('Document not found.');
    }
    
    if (!document.hasAccess(req.userId)) {
      return res.status(403).send('Access denied.');
    }
    
    const text = extractTextFromContent(document.content);
    
    const markdown = `# ${document.title || 'Untitled'}\n\n${text || 'No content'}`;
    
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    const filename = `${document.title || 'document'}.md`.replace(/[^a-zA-Z0-9.-]/g, '_');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(markdown);
  } catch (error) {
    console.error('Export MD error:', error);
    res.status(500).send('Failed to export Markdown.');
  }
});

export default router;
