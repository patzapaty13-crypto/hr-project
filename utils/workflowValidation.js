/**
 * ============================================================================
 * Utility: Workflow Validation (workflowValidation.js)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - ตรวจสอบความถูกต้องก่อนเปลี่ยนสถานะ
 * - ตรวจสอบเงื่อนไขตามคู่มือการปฏิบัติงาน
 * - ให้คำแนะนำที่ชัดเจนและเข้าใจง่าย
 * - ตรวจสอบความปลอดภัยและความครบถ้วนของข้อมูล
 * 
 * ตามคู่มือการปฏิบัติงานการสรรหาคัดเลือกบุคลากรใหม่:
 * - ต้องรออนุมัติอธิการบดีก่อนเริ่มสรรหา (ขั้นตอนที่ 6)
 * - แยกประเภทผู้สมัคร (อาจารย์ vs เจ้าหน้าที่)
 * - ตรวจสอบเอกสารที่จำเป็น
 * 
 * ============================================================================
 */

import { WORKFLOW_STEPS } from '../constants';

/**
 * ============================================================================
 * ตรวจสอบว่าสามารถเปลี่ยนสถานะได้หรือไม่
 * ============================================================================
 * 
 * @param {string} currentStatus - สถานะปัจจุบัน
 * @param {string} newStatus - สถานะใหม่ที่ต้องการเปลี่ยน
 * @param {Object} request - ข้อมูลคำขอ
 * @returns {Object} - { canProceed: boolean, message: string, warnings: Array }
 */
export const validateStatusTransition = (currentStatus, newStatus, request = {}) => {
  // ตรวจสอบลำดับขั้นตอนที่ถูกต้อง
  const currentIndex = WORKFLOW_STEPS.findIndex(step => step.id === currentStatus);
  const newIndex = WORKFLOW_STEPS.findIndex(step => step.id === newStatus);

  // ถ้าไม่พบสถานะ
  if (currentIndex === -1 || newIndex === -1) {
    return {
      canProceed: false,
      message: 'ไม่พบสถานะที่ระบุ กรุณาตรวจสอบอีกครั้ง',
      warnings: []
    };
  }

  // ตรวจสอบว่ากำลังย้อนกลับหรือไม่ (อนุญาตให้ย้อนกลับได้ในบางกรณี)
  if (newIndex < currentIndex) {
    return {
      canProceed: true,
      message: `คุณกำลังย้อนสถานะจาก "${WORKFLOW_STEPS[currentIndex].label}" กลับไปเป็น "${WORKFLOW_STEPS[newIndex].label}"`,
      warnings: ['การย้อนสถานะควรทำเมื่อมีเหตุผลที่จำเป็นเท่านั้น']
    };
  }

  // ตรวจสอบว่าข้ามขั้นตอนหรือไม่ (อนุญาตให้ข้ามได้ 1 ขั้นตอน)
  if (newIndex > currentIndex + 1) {
    return {
      canProceed: false,
      message: `ไม่สามารถข้ามขั้นตอนได้ กรุณาทำตามลำดับ: ${WORKFLOW_STEPS[currentIndex].label} → ${WORKFLOW_STEPS[currentIndex + 1].label}`,
      warnings: []
    };
  }

  // ตรวจสอบเงื่อนไขเฉพาะตามคู่มือ
  const specificChecks = checkSpecificConditions(currentStatus, newStatus, request);
  if (!specificChecks.canProceed) {
    return specificChecks;
  }

  // ผ่านการตรวจสอบทั้งหมด
  return {
    canProceed: true,
    message: `ยืนยันการเปลี่ยนสถานะจาก "${WORKFLOW_STEPS[currentIndex].label}" เป็น "${WORKFLOW_STEPS[newIndex].label}"`,
    warnings: specificChecks.warnings || []
  };
};

/**
 * ============================================================================
 * ตรวจสอบเงื่อนไขเฉพาะตามคู่มือ
 * ============================================================================
 */
const checkSpecificConditions = (currentStatus, newStatus, request) => {
  const warnings = [];

  // 1. ตรวจสอบการเริ่มสรรหา (ต้องรออนุมัติอธิการบดีก่อน)
  if (currentStatus === 'vp_hr' && newStatus === 'recruiting') {
    // ตามคู่มือ: ต้องรออนุมัติอธิการบดีก่อน แต่ในระบบเราใช้ vp_hr เป็นขั้นตอนสุดท้ายก่อน recruiting
    // ดังนั้นควรตรวจสอบว่ามีการอนุมัติจาก vp_hr แล้วหรือยัง
    if (!request.approvedByVP) {
      warnings.push('กรุณาตรวจสอบว่าผู้ช่วยอธิการบดีได้อนุมัติแล้ว');
    }
  }

  // 2. ตรวจสอบการคัดเลือกใบสมัคร (ต้องมีใบสมัครก่อน)
  if (currentStatus === 'sourcing' && newStatus === 'screening') {
    if (!request.hasApplications) {
      return {
        canProceed: false,
        message: 'ยังไม่มีใบสมัคร กรุณาสรรหาผู้สมัครก่อน',
        warnings: []
      };
    }
    warnings.push('กรุณาตรวจสอบว่าได้สรรหาผู้สมัครครบถ้วนแล้ว');
  }

  // 3. ตรวจสอบการส่งให้ต้นสังกัด (ต้องคัดเลือกแล้ว)
  if (currentStatus === 'screening' && newStatus === 'application_review') {
    if (!request.selectedApplications || request.selectedApplications.length === 0) {
      return {
        canProceed: false,
        message: 'กรุณาคัดเลือกใบสมัครก่อนส่งให้ต้นสังกัด',
        warnings: []
      };
    }
    warnings.push('กรุณาตรวจสอบว่าได้คัดเลือกใบสมัครที่เหมาะสมแล้ว');
  }

  // 4. ตรวจสอบการนัดสัมภาษณ์ (ต้องมีผู้สมัครที่ต้นสังกัดเห็นชอบ)
  if (currentStatus === 'application_review' && newStatus === 'interview_scheduled') {
    if (!request.approvedByFaculty) {
      return {
        canProceed: false,
        message: 'กรุณารอให้ต้นสังกัดพิจารณาและเห็นชอบก่อน',
        warnings: []
      };
    }
    warnings.push('กรุณาตรวจสอบว่าต้นสังกัดได้เห็นชอบผู้สมัครแล้ว');
  }

  // 5. ตรวจสอบการเสนออธิการบดี (ต้องมีผลสัมภาษณ์)
  if (currentStatus === 'interview_result' && newStatus === 'president') {
    if (!request.interviewResult) {
      return {
        canProceed: false,
        message: 'กรุณาบันทึกผลการสัมภาษณ์ก่อนเสนออธิการบดี',
        warnings: []
      };
    }
    warnings.push('กรุณาตรวจสอบว่าผลการสัมภาษณ์ถูกต้องและครบถ้วน');
  }

  // 6. ตรวจสอบการแจ้งบุคลากร (ต้องมีอนุมัติจากอธิการบดี)
  if (currentStatus === 'president' && newStatus === 'notified') {
    if (!request.approvedByPresident) {
      return {
        canProceed: false,
        message: 'กรุณารอให้อธิการบดีอนุมัติก่อน',
        warnings: []
      };
    }
    warnings.push('กรุณาเตรียมเอกสารและข้อมูลสำหรับแจ้งบุคลากร');
  }

  return {
    canProceed: true,
    warnings
  };
};

/**
 * ============================================================================
 * ตรวจสอบประเภทผู้สมัคร (อาจารย์ vs เจ้าหน้าที่)
 * ============================================================================
 */
export const getApplicantType = (position) => {
  // ตรวจสอบจากชื่อตำแหน่ง
  const positionLower = (position || '').toLowerCase();
  
  if (positionLower.includes('อาจารย์') || positionLower.includes('lecturer') || positionLower.includes('professor')) {
    return 'lecturer';
  }
  
  return 'staff';
};

/**
 * ============================================================================
 * ตรวจสอบเอกสารที่จำเป็นตามประเภทผู้สมัคร
 * ============================================================================
 */
export const getRequiredDocuments = (applicantType) => {
  const commonDocs = [
    'สำเนาบัตรประชาชน',
    'สำเนาทะเบียนบ้าน',
    'สำเนาวุฒิการศึกษา (Transcript)',
    'รูปถ่าย 1-2 นิ้ว',
    'RESUME (ถ้ามี)',
    'หนังสือรับรองต่างๆ (ถ้ามี)'
  ];

  if (applicantType === 'lecturer') {
    return [
      ...commonDocs,
      'แบบสอบถามความถนัดในการสอน'
    ];
  }

  return commonDocs;
};

/**
 * ============================================================================
 * สร้างคำแนะนำสำหรับแต่ละขั้นตอน
 * ============================================================================
 */
export const getStepGuidance = (status) => {
  const guidance = {
    'submitted': {
      title: 'รับเรื่องจากต้นสังกัด',
      steps: [
        'ตรวจสอบเอกสารที่ส่งมา',
        'ตรวจสอบความครบถ้วนของข้อมูล',
        'ตรวจสอบคุณสมบัติเบื้องต้น'
      ],
      notes: 'กรุณาตรวจสอบให้ละเอียดก่อนรับเรื่อง'
    },
    'hr_review': {
      title: 'HR ตรวจสอบ',
      steps: [
        'ผู้อำนวยการสำนักงานบุคคลให้ข้อมูลประกอบการพิจารณา',
        'ตรวจสอบความเหมาะสมของตำแหน่ง',
        'เตรียมข้อมูลสำหรับเสนอผู้ช่วยอธิการบดี'
      ],
      notes: 'กรุณาเตรียมข้อมูลให้ครบถ้วนก่อนเสนอ'
    },
    'vp_hr': {
      title: 'ผู้ช่วยอธิการบดีพิจารณา',
      steps: [
        'เสนอมหาวิทยาลัยอนุมัติ',
        'สั่งการให้สำนักงานบุคคลสรรหา/คัดเลือก',
        'ดำเนินการคู่ขนานกับการอนุมัติ'
      ],
      notes: 'สามารถเริ่มสรรหาได้ทันทีที่ได้รับอนุมัติ'
    },
    'recruiting': {
      title: 'ประกาศรับสมัคร',
      steps: [
        'เตรียม Job Description',
        'กำหนดคุณสมบัติผู้สมัคร',
        'ประกาศในช่องทางต่างๆ (Website, Email)'
      ],
      notes: 'กรุณาตรวจสอบ Job Description ให้ถูกต้อง'
    },
    'sourcing': {
      title: 'สรรหาผู้สมัคร',
      steps: [
        'รับใบสมัครจากผู้สมัคร (Walk-in)',
        'รับใบสมัครจาก Website',
        'รับใบสมัครจาก Email (บุคลากรภายใน)',
        'ตรวจสอบเอกสารประกอบการสมัคร'
      ],
      notes: 'กรุณาตรวจสอบเอกสารให้ครบถ้วน'
    },
    'screening': {
      title: 'คัดเลือกใบสมัคร',
      steps: [
        'ตรวจสอบคุณสมบัติและประสบการณ์',
        'ใช้ AI วิเคราะห์ Resume vs JD (ถ้ามี)',
        'คัดเลือกใบสมัครที่เหมาะสม',
        'ส่งใบสมัครให้ต้นสังกัดพิจารณา'
      ],
      notes: 'กรุณาคัดเลือกอย่างเป็นธรรมและโปร่งใส'
    },
    'application_review': {
      title: 'ต้นสังกัดพิจารณา',
      steps: [
        'ต้นสังกัดพิจารณาใบสมัคร',
        'ตรวจสอบคุณสมบัติ',
        'ตัดสินใจเห็นชอบหรือไม่เห็นชอบ'
      ],
      notes: 'รอให้ต้นสังกัดพิจารณาให้เสร็จสิ้น'
    },
    'interview_scheduled': {
      title: 'นัดสัมภาษณ์',
      steps: [
        'จัดเตรียม Calendar สำหรับคณะกรรมการ',
        'แจ้งผู้สมัครวันและเวลาสัมภาษณ์',
        'เตรียมเอกสารสำหรับการสัมภาษณ์',
        'แจ้งสถานที่สัมภาษณ์ (ห้อง 306 ชั้น 3 อาคาร 1)'
      ],
      notes: 'กรุณานัดล่วงหน้าและแจ้งให้ชัดเจน'
    },
    'interview': {
      title: 'สัมภาษณ์',
      steps: [
        'คณะกรรมการสัมภาษณ์',
        'ผู้สมัครมาล่วงหน้า (อาจารย์: 15-20 นาที, เจ้าหน้าที่: 1 ชั่วโมง 30 นาที)',
        'ทำแบบทดสอบ (เฉพาะเจ้าหน้าที่)',
        'เริ่มการสัมภาษณ์'
      ],
      notes: 'กรุณาตรวจสอบเอกสารก่อนเริ่มสัมภาษณ์'
    },
    'interview_result': {
      title: 'พิจารณาผลสัมภาษณ์',
      steps: [
        'คณะกรรมการพิจารณาผลสัมภาษณ์',
        'บันทึกผลการประเมิน',
        'ตัดสินใจรับหรือไม่รับ'
      ],
      notes: 'กรุณาบันทึกผลให้ชัดเจนและครบถ้วน'
    },
    'president': {
      title: 'เสนออธิการบดี',
      steps: [
        'พิมพ์บันทึกข้อความขออนุมัติรับ',
        'ส่งให้หัวหน้างานและผู้อำนวยการตรวจทาน',
        'เสนอผู้ช่วยอธิการบดีลงนาม',
        'เสนออธิการบดี'
      ],
      notes: 'กรุณาตรวจสอบเอกสารให้ครบถ้วนก่อนเสนอ'
    },
    'notified': {
      title: 'แจ้งบุคลากร',
      steps: [
        'โทรศัพท์แจ้งผู้สมัคร (แสดงความยินดี, แจ้งวันเริ่มงาน, แจ้งค่าจ้าง)',
        'แจ้งให้ตรวจร่างกาย',
        'แจ้งให้นำเอกสารมาในวันเริ่มงาน',
        'ส่งอีเมล์แจ้งต้นสังกัด'
      ],
      notes: 'กรุณาแจ้งข้อมูลให้ชัดเจนและครบถ้วน'
    }
  };

  return guidance[status] || {
    title: 'ไม่พบคำแนะนำ',
    steps: [],
    notes: ''
  };
};

/**
 * ============================================================================
 * ตรวจสอบความปลอดภัยของข้อมูล
 * ============================================================================
 */
export const validateDataSecurity = (request) => {
  const issues = [];

  // ตรวจสอบว่ามีข้อมูลส่วนบุคคลที่ไม่จำเป็นหรือไม่
  if (request.personalInfo && request.personalInfo.idCard) {
    issues.push('ไม่ควรเก็บเลขบัตรประชาชนในระบบ (ตาม PDPA)');
  }

  if (request.personalInfo && request.personalInfo.address) {
    issues.push('ไม่ควรเก็บที่อยู่ละเอียดในระบบ (ตาม PDPA)');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
};

