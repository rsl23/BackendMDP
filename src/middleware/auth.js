import admin from 'firebase-admin';
import User from '../models/User.js';
import { errorResponse } from '../utils/responseUtil.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Middleware untuk memverifikasi Firebase token
 * Gunakan ini sebagai pengganti authenticateToken yang lama
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Format: Bearer TOKEN
    
    if (!token) {
      return errorResponse(res, 401, 'Access token required', 
        'No token provided in Authorization header');
    }
    
    // Verifikasi token Firebase
    const decodedToken = await admin.auth().verifyIdToken(token);
    const uid = decodedToken.uid;
    
    // Cari user di Firestore berdasarkan firebase_uid
    const user = await User.findByGoogleUid(uid);
    
    if (!user) {
      console.warn(`User with Firebase UID ${uid} not found in database`);
      return errorResponse(res, 404, 'User not found', 
        'Please complete registration first');
    }
    
    // Siapkan data user untuk controller
    req.user = {
      id: user.id,
      userId: user.id, // Untuk backward compatibility
      firebase_uid: uid,
      email: user.email,
      role: user.role,
      auth_provider: user.auth_provider
    };
    
    console.log(`User authenticated: ${user.email} (${user.id})`);
    next();
  } catch (error) {
    console.error('Firebase token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return errorResponse(res, 401, 'Token expired', 'Please login again');
    }
    
    if (error.code === 'auth/id-token-revoked') {
      return errorResponse(res, 401, 'Token revoked', 'Please login again');
    }
    
    if (error.code === 'auth/argument-error') {
      return errorResponse(res, 403, 'Invalid token format', 'Token is malformed');
    }
    
    return errorResponse(res, 403, 'Token verification failed', error.message);
  }
};

/**
 * Middleware untuk verifikasi Firebase token opsional
 * Tidak error jika tidak ada token
 */
// export const optionalAuth = async (req, res, next) => {
//   try {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//       req.user = null;
//       return next();
//     }

//     // Coba verifikasi token
//     try {
//       const decodedToken = await admin.auth().verifyIdToken(token);
//       const uid = decodedToken.uid;
      
//       // Cari user di database
//       const user = await User.findByGoogleUid(uid);
      
//       if (user) {
//         req.user = {
//           id: user.id,
//           userId: user.id, // Untuk backward compatibility
//           firebase_uid: uid,
//           email: user.email,
//           role: user.role,
//           auth_provider: user.auth_provider
//         };
//       } else {
//         req.user = null;
//       }
//     } catch (error) {
//       console.warn('Optional auth token invalid:', error.message);
//       req.user = null;
//     }
    
//     next();
//   } catch (error) {
//     console.error('Error in optional auth:', error);
//     req.user = null;
//     next();
//   }
// };

/**
 * Middleware untuk memeriksa role user
 * Digunakan setelah authenticateToken
 */
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(res, 403, 'Insufficient permissions', 
        `Required role: ${roles.join(' or ')}`);
    }

    next();
  };
};
