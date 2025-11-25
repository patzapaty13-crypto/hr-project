/**
 * ============================================================================
 * Requests API Routes
 * ============================================================================
 */

import express from 'express';
import { getFirestore } from 'firebase-admin/firestore';

const router = express.Router();
const dbAdmin = getFirestore();
const appId = process.env.APP_ID || 'spu-hr-simple';

/**
 * GET /api/requests
 * ดึงคำขอทั้งหมด (สามารถกรองตาม role และ faculty)
 */
router.get('/', async (req, res) => {
  try {
    const { role, facultyId, status } = req.query;
    
    let requests = [];
    
    if (dbAdmin) {
      const requestsRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('requests');
      
      let query = requestsRef;
      
      // กรองตาม facultyId
      if (facultyId) {
        query = query.where('facultyId', '==', facultyId);
      }
      
      // กรองตาม status
      if (status) {
        query = query.where('status', '==', status);
      }
      
      // เรียงตามเวลา (ถ้ามี createdAt)
      try {
        query = query.orderBy('createdAt', 'desc');
      } catch (error) {
        // ถ้าไม่มี index สำหรับ orderBy จะเรียงใน JavaScript แทน
        console.warn('Cannot orderBy createdAt, will sort in JavaScript');
      }
      
      const snapshot = await query.get();
      requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // เรียงตามเวลาใน JavaScript (ถ้า orderBy ไม่ได้)
      requests.sort((a, b) => {
        const timeA = a.createdAt?.seconds || a.createdAt?._seconds || 0;
        const timeB = b.createdAt?.seconds || b.createdAt?._seconds || 0;
        return timeB - timeA;
      });
    }
    
    // กรองตาม role
    if (role === 'vp_hr') {
      requests = requests.filter(r => r.status === 'hr_review' || r.status === 'vp_hr');
    } else if (role !== 'hr') {
      // Faculty เห็นเฉพาะของตัวเอง
      if (facultyId) {
        requests = requests.filter(r => r.facultyId === facultyId);
      }
    }
    
    res.json({
      success: true,
      data: requests,
      count: requests.length
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/requests/:id
 * ดึงคำขอตาม ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    let request = null;
    
    if (dbAdmin) {
      const docRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('requests').doc(id);
      const docSnap = await docRef.get();
      
      if (docSnap.exists) {
        request = { id: docSnap.id, ...docSnap.data() };
      }
    }
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/requests
 * สร้างคำขอใหม่
 */
router.post('/', async (req, res) => {
  try {
    const requestData = {
      ...req.body,
      createdAt: new Date(),
      status: 'submitted',
      lastUpdated: new Date()
    };
    
    let docRef = null;
    
    if (dbAdmin) {
      const requestsRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('requests');
      docRef = await requestsRef.add(requestData);
    }
    
    res.status(201).json({
      success: true,
      data: {
        id: docRef.id,
        ...requestData
      }
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/requests/:id
 * อัปเดตคำขอ
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastUpdated: new Date()
    };
    
    if (dbAdmin) {
      const docRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('requests').doc(id);
      await docRef.update(updateData);
    }
    
    res.json({
      success: true,
      message: 'Request updated successfully'
    });
  } catch (error) {
    console.error('Error updating request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PATCH /api/requests/:id/status
 * เปลี่ยนสถานะคำขอ
 */
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }
    
    const now = new Date();
    const updateData = {
      status,
      lastUpdated: now
    };
    
    // บันทึกข้อมูลการอนุมัติตามสถานะ
    if (status === 'vp_hr') {
      updateData.vpApproved = true;
      updateData.vpApprovedAt = now;
    } else if (status === 'recruiting') {
      updateData.recruitingStarted = true;
      updateData.recruitingStartedAt = now;
    } else if (status === 'application_review') {
      updateData.screeningCompleted = true;
      updateData.screeningCompletedAt = now;
    } else if (status === 'interview_scheduled') {
      updateData.facultyApproved = true;
      updateData.facultyApprovedAt = now;
    } else if (status === 'president') {
      updateData.interviewCompleted = true;
      updateData.interviewCompletedAt = now;
    } else if (status === 'notified') {
      updateData.presidentApproved = true;
      updateData.presidentApprovedAt = now;
      updateData.notifiedAt = now;
    }
    
    if (dbAdmin) {
      const docRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('requests').doc(id);
      await docRef.update(updateData);
    }
    
    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/requests/:id
 * ลบคำขอ
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (dbAdmin) {
      const docRef = dbAdmin.collection('artifacts').doc(appId)
        .collection('public').doc('data')
        .collection('requests').doc(id);
      await docRef.delete();
    }
    
    res.json({
      success: true,
      message: 'Request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting request:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;

