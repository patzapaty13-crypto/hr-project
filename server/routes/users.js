/**
 * ============================================================================
 * Users API Routes
 * ============================================================================
 */

import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = express.Router();
const dbAdmin = getFirestore();
const appId = process.env.APP_ID || 'spu-hr-simple';

/**
 * GET /api/users
 * ดึงผู้ใช้ทั้งหมด
 */
router.get('/', async (req, res) => {
  try {
    let users = [];
    
    if (dbAdmin) {
      const usersRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('users');
      const snapshot = await usersRef.get();
      users = snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      }));
    }
    
    res.json({
      success: true,
      data: users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:id
 * ดึงผู้ใช้ตาม ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let user = null;
    
    if (dbAdmin) {
      const docRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('users').doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        user = { uid: docSnap.id, ...docSnap.data() };
      }
    }
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/users
 * สร้างผู้ใช้ใหม่
 */
router.post('/', async (req, res) => {
  try {
    const userData = req.body;
    
    // Validation
    if (!userData.email || !userData.role) {
      return res.status(400).json({
        success: false,
        error: 'Email and role are required'
      });
    }
    
    let docRef = null;
    
    if (dbAdmin) {
      const usersRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('users');
      docRef = await usersRef.add(userData);
    }
    
    res.status(201).json({
      success: true,
      data: {
        uid: docRef.id,
        ...userData
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/:id
 * อัปเดตผู้ใช้
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    if (dbAdmin) {
      const docRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('users').doc(id);
      await docRef.update(updateData);
    }
    
    res.json({
      success: true,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/users/:id
 * ลบผู้ใช้
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (dbAdmin) {
      const docRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('users').doc(id);
      await docRef.delete();
    }
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

