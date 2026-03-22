import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. No token provided.'
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Invalid token format.'
      });
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findById(decoded.userId).select('_id username email').lean();
      
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User not found.'
        });
      }
      
      req.user = user;
      req.userId = decoded.userId;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token.'
      });
    }
  } catch (error) {
    console.error('[AUTH] Unexpected authentication error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error.'
    });
  }
};
