/**
 * ============================================================================
 * Component: Admin Dashboard (AdminDashboard.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - แสดง Dashboard สำหรับ Admin/HR
 * - แสดง Summary Cards (Total, Pending, Reviewing, Accepted, Rejected)
 * - แสดง Bar Chart - Applications by Position
 * - แสดง Pie Chart - Match Percentage Distribution
 * - Navigation Menu
 * 
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  LogOut, 
  Building, 
  Briefcase, 
  Plus,
  LayoutDashboard,
  Users,
  Mail,
  FileCheck,
  UserCog,
  Menu,
  X
} from 'lucide-react';
import SPULogo from './SPULogo';
import { getLocalRequests } from '../utils/localStorage';
import { db, appId } from '../config/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { FACULTIES } from '../constants';

const AdminDashboard = ({ userRole, faculty, onLogout, onCreateRequest, onSwitchToStandard }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  // เก็บ activeMenu ใน localStorage เพื่อให้คงอยู่หลัง refresh
  const [activeMenu, setActiveMenu] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('spu_hr_activeMenu');
      return saved || 'dashboard';
    }
    return 'dashboard';
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false); // สำหรับควบคุมการแสดง/ซ่อนเมนูบนมือถือ
  const [users, setUsers] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // ========================================================================
  // useEffect Hook: ดึงข้อมูลคำขอ
  // ========================================================================
  useEffect(() => {
    if (!db) {
      // ใช้ Local Storage (Demo Mode)
      const localRequests = getLocalRequests();
      let data = localRequests.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      if (userRole === 'hr') {
        setRequests(data);
      } else {
        setRequests(data.filter(r => r.facultyId === faculty?.id));
      }
      setLoading(false);

      const handleStorageChange = () => {
        const updated = getLocalRequests();
        setRequests(userRole === 'hr' ? updated : updated.filter(r => r.facultyId === faculty?.id));
      };
      window.addEventListener('localStorageUpdate', handleStorageChange);
      return () => window.removeEventListener('localStorageUpdate', handleStorageChange);
    } else {
      // ใช้ Firestore
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'requests'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        let filtered = userRole === 'hr' ? data : data.filter(r => r.facultyId === faculty?.id);
        setRequests(filtered.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA;
        }));
        setLoading(false);
      }, (error) => {
        console.error('Error fetching requests:', error);
        setLoading(false);
      });
      return () => unsubscribe();
    }
  }, [userRole, faculty, db]);

  // ดึงข้อมูลผู้ใช้ - อัปเดตแบบเรียลไทม์
  useEffect(() => {
    if (activeMenu !== 'user-management') return;

    if (!db) {
      // Demo Mode: อ่านจาก localStorage และตั้งค่า listener
      const fetchUsers = () => {
        const localUsers = JSON.parse(localStorage.getItem('spu_hr_users') || '[]');
        setUsers(localUsers);
      };
      
      // ดึงข้อมูลครั้งแรก
      fetchUsers();
      
      // ตั้งค่า listener สำหรับการเปลี่ยนแปลงใน localStorage
      const handleStorageChange = () => {
        fetchUsers();
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('localStorageUpdate', handleStorageChange);
      
      // อัปเดตทุก 2 วินาที (สำหรับ demo mode)
      const interval = setInterval(fetchUsers, 2000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('localStorageUpdate', handleStorageChange);
        clearInterval(interval);
      };
    } else {
      // Firestore: ใช้ real-time listener
      try {
        const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
        const unsubscribe = onSnapshot(usersRef, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
          setUsers(data);
        }, (error) => {
          console.error('Error fetching users:', error);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up users listener:', error);
      }
    }
  }, [activeMenu, db]);

  // ดึงข้อมูล Email Logs - อัปเดตแบบเรียลไทม์
  useEffect(() => {
    if (activeMenu !== 'email-logs') return;

    if (!db) {
      // Demo Mode: อ่านจาก localStorage และตั้งค่า listener
      const fetchEmailLogs = () => {
        const logs = JSON.parse(localStorage.getItem('spu_hr_email_logs') || '[]');
        setEmailLogs(logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
      };
      
      // ดึงข้อมูลครั้งแรก
      fetchEmailLogs();
      
      // ตั้งค่า listener สำหรับการเปลี่ยนแปลงใน localStorage
      const handleStorageChange = () => {
        fetchEmailLogs();
      };
      
      window.addEventListener('storage', handleStorageChange);
      window.addEventListener('localStorageUpdate', handleStorageChange);
      
      // อัปเดตทุก 2 วินาที (สำหรับ demo mode)
      const interval = setInterval(fetchEmailLogs, 2000);
      
      return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('localStorageUpdate', handleStorageChange);
        clearInterval(interval);
      };
    } else {
      // Firestore: ใช้ real-time listener
      try {
        const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'email_logs');
        const unsubscribe = onSnapshot(logsRef, (snapshot) => {
          const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setEmailLogs(data.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
        }, (error) => {
          console.error('Error fetching email logs:', error);
        });
        return () => unsubscribe();
      } catch (error) {
        console.error('Error setting up email logs listener:', error);
      }
    }
  }, [activeMenu, db]);

  // ========================================================================
  // คำนวณสถิติ
  // ========================================================================
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'submitted' || r.status === 'hr_review').length,
    reviewing: requests.filter(r => r.status === 'vp_hr' || r.status === 'president').length,
    accepted: requests.filter(r => r.status === 'recruiting' || r.status === 'confirmed').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  // ========================================================================
  // คำนวณข้อมูลสำหรับ Bar Chart - Applications by Position
  // ========================================================================
  const positionData = requests.reduce((acc, req) => {
    const pos = req.position || 'No Position';
    acc[pos] = (acc[pos] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.entries(positionData)
    .map(([position, count]) => ({ position, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 positions

  // ========================================================================
  // คำนวณข้อมูลสำหรับ Pie Chart - Status Distribution
  // ========================================================================
  const statusData = [
    { name: 'Pending', value: stats.pending, color: '#fbbf24' },
    { name: 'Reviewing', value: stats.reviewing, color: '#3b82f6' },
    { name: 'Accepted', value: stats.accepted, color: '#10b981' },
    { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // ========================================================================
  // Render
  // ========================================================================
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white text-gray-900 border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SPULogo size="sm" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">HR@SPU Personnel System</h1>
              <p className="text-sm text-gray-600">
                {userRole === 'hr' ? 'สำนักงานบุคคล (HR)' : faculty?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // เรียกใช้ onSwitchToStandard เพื่อสลับกลับไปหน้า Dashboard ปกติ
                if (onSwitchToStandard) {
                  onSwitchToStandard();
                } else {
                  // Fallback: ถ้าไม่มี prop ให้ใช้วิธีเดิม (แต่ไม่ควรเกิดขึ้น)
                  if (typeof window !== 'undefined') {
                    localStorage.removeItem('spu_hr_useAdminDashboard');
                    window.location.reload();
                  }
                }
              }}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg flex items-center text-sm transition shadow-sm font-semibold"
            >
              <LayoutDashboard size={16} className="mr-2" />
              Standard View
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg flex items-center text-sm transition shadow-sm font-semibold"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Horizontal Navigation Menu */}
      <div className="bg-white border-b border-pink-200 shadow-sm sticky top-0 z-50">
        <div className="px-4 sm:px-6">
          {/* Mobile Menu Button */}
          <div className="flex items-center justify-between py-3 lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <span className="text-sm font-medium text-gray-700">
              {activeMenu === 'dashboard' && 'Dashboard'}
              {activeMenu === 'positions' && 'Positions'}
              {activeMenu === 'email-templates' && 'Email Templates'}
              {activeMenu === 'email-logs' && 'Email Logs'}
              {activeMenu === 'user-management' && 'User Management'}
            </span>
          </div>

          {/* Navigation Menu - Desktop (Horizontal) */}
          <nav className="hidden lg:flex space-x-1 overflow-x-auto">
            <button
              onClick={() => {
                setActiveMenu('dashboard');
                localStorage.setItem('spu_hr_activeMenu', 'dashboard');
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'dashboard'
                  ? 'bg-pink-200 text-pink-800 font-medium'
                  : 'text-gray-700 hover:bg-pink-50'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setActiveMenu('positions');
                localStorage.setItem('spu_hr_activeMenu', 'positions');
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'positions'
                  ? 'bg-pink-200 text-pink-800 font-medium'
                  : 'text-gray-700 hover:bg-pink-50'
              }`}
            >
              <Users size={18} />
              <span>Positions</span>
            </button>
            <button
              onClick={() => {
                setActiveMenu('email-templates');
                localStorage.setItem('spu_hr_activeMenu', 'email-templates');
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'email-templates'
                  ? 'bg-pink-200 text-pink-800 font-medium'
                  : 'text-gray-700 hover:bg-pink-50'
              }`}
            >
              <Mail size={18} />
              <span>Email Templates</span>
            </button>
            <button
              onClick={() => {
                setActiveMenu('email-logs');
                localStorage.setItem('spu_hr_activeMenu', 'email-logs');
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'email-logs'
                  ? 'bg-pink-200 text-pink-800 font-medium'
                  : 'text-gray-700 hover:bg-pink-50'
              }`}
            >
              <FileCheck size={18} />
              <span>Email Logs</span>
            </button>
            <button
              onClick={() => {
                setActiveMenu('user-management');
                localStorage.setItem('spu_hr_activeMenu', 'user-management');
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'user-management'
                  ? 'bg-pink-200 text-pink-800 font-medium'
                  : 'text-gray-700 hover:bg-pink-50'
              }`}
            >
              <UserCog size={18} />
              <span>User Management</span>
            </button>
          </nav>

          {/* Mobile Menu - Slide Down */}
          <nav
            className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${
              isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="py-2 space-y-1">
              <button
                onClick={() => {
                  setActiveMenu('dashboard');
                  localStorage.setItem('spu_hr_activeMenu', 'dashboard');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === 'dashboard'
                    ? 'bg-pink-100 text-pink-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu('positions');
                  localStorage.setItem('spu_hr_activeMenu', 'positions');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === 'positions'
                    ? 'bg-pink-100 text-pink-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Users size={20} />
                <span>Positions</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu('email-templates');
                  localStorage.setItem('spu_hr_activeMenu', 'email-templates');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === 'email-templates'
                    ? 'bg-pink-100 text-pink-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Mail size={20} />
                <span>Email Templates</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu('email-logs');
                  localStorage.setItem('spu_hr_activeMenu', 'email-logs');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === 'email-logs'
                    ? 'bg-pink-100 text-pink-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileCheck size={20} />
                <span>Email Logs</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu('user-management');
                  localStorage.setItem('spu_hr_activeMenu', 'user-management');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === 'user-management'
                    ? 'bg-pink-100 text-pink-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <UserCog size={20} />
                <span>User Management</span>
              </button>
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="p-4 sm:p-6">
        {activeMenu === 'dashboard' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-gray-800 mb-2">{stats.total}</div>
                  <div className="text-sm text-gray-600">Total Applications</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.pending}</div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{stats.reviewing}</div>
                  <div className="text-sm text-gray-600">Reviewing</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">{stats.accepted}</div>
                  <div className="text-sm text-gray-600">Accepted</div>
                </div>
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="text-3xl font-bold text-red-600 mb-2">{stats.rejected}</div>
                  <div className="text-sm text-gray-600">Rejected</div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Bar Chart - Applications by Position */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Applications by Position
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="position" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        fontSize={12}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#f9a8d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Pie Chart - Status Distribution */}
                <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Status Distribution
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Requests Table */}
              <div className="bg-white rounded-lg shadow border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-800">Recent Requests</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Faculty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            Loading...
                          </td>
                        </tr>
                      ) : requests.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                            No requests found
                          </td>
                        </tr>
                      ) : (
                        requests.slice(0, 10).map((request) => (
                          <tr key={request.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {request.createdAt?.seconds
                                ? new Date(request.createdAt.seconds * 1000).toLocaleDateString('th-TH')
                                : '-'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {request.facultyName}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {request.position}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs rounded ${
                                request.status === 'submitted' || request.status === 'hr_review'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : request.status === 'vp_hr' || request.status === 'president'
                                  ? 'bg-blue-100 text-blue-800'
                                  : request.status === 'recruiting' || request.status === 'confirmed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {request.status === 'submitted' ? 'Pending' :
                                 request.status === 'hr_review' ? 'Pending' :
                                 request.status === 'vp_hr' ? 'Reviewing' :
                                 request.status === 'president' ? 'Reviewing' :
                                 request.status === 'recruiting' ? 'Accepted' :
                                 request.status === 'confirmed' ? 'Accepted' :
                                 'Rejected'}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
        )}

        {/* Positions View */}
        {activeMenu === 'positions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">ตำแหน่งทั้งหมด</h2>
                <p className="text-sm text-gray-600 mt-1">รายการตำแหน่งที่เปิดรับสมัครทั้งหมด</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ตำแหน่ง</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คณะ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">จำนวน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่สร้าง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">Loading...</td>
                      </tr>
                    ) : requests.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">ไม่พบข้อมูลตำแหน่ง</td>
                      </tr>
                    ) : (
                      requests.map((request) => (
                        <tr 
                          key={request.id} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            alert(`รายละเอียดคำขอ\n\nตำแหน่ง: ${request.position}\nคณะ: ${request.facultyName}\nประเภท: ${request.type === 'new' ? 'อัตราใหม่' : 'ทดแทน'}\nจำนวน: ${request.amount} ตำแหน่ง\nสถานะ: ${request.status}\nวันที่สร้าง: ${request.createdAt?.seconds ? new Date(request.createdAt.seconds * 1000).toLocaleDateString('th-TH') : '-'}`);
                          }}
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">{request.position}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{request.facultyName}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {request.type === 'new' ? 'อัตราใหม่' : 'ทดแทน'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{request.amount} ตำแหน่ง</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded ${
                              request.status === 'submitted' || request.status === 'hr_review'
                                ? 'bg-yellow-100 text-yellow-800'
                                : request.status === 'vp_hr' || request.status === 'president'
                                ? 'bg-blue-100 text-blue-800'
                                : request.status === 'recruiting' || request.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {request.status === 'submitted' ? 'รอตรวจสอบ' :
                               request.status === 'hr_review' ? 'กำลังตรวจสอบ' :
                               request.status === 'vp_hr' ? 'รอ VP พิจารณา' :
                               request.status === 'president' ? 'รออธิการบดีพิจารณา' :
                               request.status === 'recruiting' ? 'ประกาศรับสมัคร' :
                               request.status === 'confirmed' ? 'ยืนยันแล้ว' :
                               'ปฏิเสธ'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {request.createdAt?.seconds
                              ? new Date(request.createdAt.seconds * 1000).toLocaleDateString('th-TH')
                              : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Email Templates View */}
        {activeMenu === 'email-templates' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Email Templates</h2>
                  <p className="text-sm text-gray-600 mt-1">จัดการเทมเพลตอีเมลสำหรับระบบ</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedTemplate(null);
                    setShowTemplateModal(true);
                  }}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
                >
                  + สร้าง Template ใหม่
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">แจ้งเตือนคำขอใหม่</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">ส่งเมื่อมีการสร้างคำขอใหม่</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedTemplate('new-request');
                        setShowTemplateModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                    >
                      แก้ไข
                    </button>
                    <button 
                      onClick={() => {
                        alert('ตัวอย่าง Email Template: แจ้งเตือนคำขอใหม่\n\nสวัสดี,\n\nมีการสร้างคำขอใหม่:\n- ตำแหน่ง: [Position]\n- คณะ: [Faculty]\n- จำนวน: [Amount] ตำแหน่ง\n\nกรุณาตรวจสอบและดำเนินการ\n\nขอบคุณ');
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                    >
                      ดูตัวอย่าง
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">ยืนยันคำขอ</h3>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">ส่งพร้อม confirmation link สำหรับยืนยันคำขอ</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedTemplate('confirmation');
                        setShowTemplateModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                    >
                      แก้ไข
                    </button>
                    <button 
                      onClick={() => {
                        alert('ตัวอย่าง Email Template: ยืนยันคำขอ\n\nสวัสดี,\n\nคำขอของคุณได้รับการยืนยันแล้ว\n\nกรุณาคลิกลิงก์ด้านล่างเพื่อยืนยัน:\n[Confirmation Link]\n\nขอบคุณ');
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                    >
                      ดูตัวอย่าง
                    </button>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">อัปเดตสถานะ</h3>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Inactive</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">แจ้งเตือนเมื่อสถานะคำขอเปลี่ยนแปลง</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        setSelectedTemplate('status-update');
                        setShowTemplateModal(true);
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                    >
                      แก้ไข
                    </button>
                    <button 
                      onClick={() => {
                        alert('ตัวอย่าง Email Template: อัปเดตสถานะ\n\nสวัสดี,\n\nสถานะคำขอของคุณได้เปลี่ยนแปลง:\n- ตำแหน่ง: [Position]\n- สถานะใหม่: [New Status]\n\nกรุณาตรวจสอบในระบบ\n\nขอบคุณ');
                      }}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded transition"
                    >
                      ดูตัวอย่าง
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Logs View */}
        {activeMenu === 'email-logs' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">Email Logs</h2>
                <p className="text-sm text-gray-600 mt-1">ประวัติการส่งอีเมลทั้งหมด</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">วันที่ส่ง</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ผู้รับ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ประเภท</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">หัวข้อ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {emailLogs.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          <div className="py-8">
                            <Mail size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">ยังไม่มีประวัติการส่งอีเมล</p>
                            <p className="text-sm text-gray-500 mt-2">ประวัติการส่งอีเมลจะแสดงที่นี่เมื่อมีการส่งอีเมล</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      emailLogs.map((log, index) => (
                        <tr 
                          key={log.id || index} 
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            alert(`รายละเอียด Email Log\n\nวันที่ส่ง: ${log.timestamp ? new Date(log.timestamp).toLocaleString('th-TH') : log.createdAt?.seconds ? new Date(log.createdAt.seconds * 1000).toLocaleString('th-TH') : '-'}\nผู้รับ: ${log.recipient || log.to || '-'}\nประเภท: ${log.type || log.template || 'Notification'}\nหัวข้อ: ${log.subject || '-'}\nสถานะ: ${log.status === 'success' || log.success ? 'สำเร็จ' : 'ล้มเหลว'}\nข้อความ: ${log.message || log.error || '-'}`);
                          }}
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {log.timestamp 
                              ? new Date(log.timestamp).toLocaleString('th-TH')
                              : log.createdAt?.seconds
                              ? new Date(log.createdAt.seconds * 1000).toLocaleString('th-TH')
                              : '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{log.recipient || log.to || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{log.type || log.template || 'Notification'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{log.subject || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-xs rounded ${
                              log.status === 'success' || log.success
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {log.status === 'success' || log.success ? 'สำเร็จ' : 'ล้มเหลว'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Management View */}
        {activeMenu === 'user-management' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow border border-gray-200">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                  <p className="text-sm text-gray-600 mt-1">จัดการผู้ใช้และสิทธิ์การเข้าถึง</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedUser(null);
                    setShowUserModal(true);
                  }}
                  className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
                >
                  + เพิ่มผู้ใช้
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">อีเมล</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">บทบาท</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">คณะ/หน่วยงาน</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">สถานะ</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">การจัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                          <div className="py-8">
                            <UserCog size={48} className="mx-auto text-gray-400 mb-4" />
                            <p className="text-gray-600">ยังไม่มีข้อมูลผู้ใช้</p>
                            <p className="text-sm text-gray-500 mt-2">ผู้ใช้ที่ลงทะเบียนจะแสดงที่นี่</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => {
                        const roleLabels = {
                          'hr': 'เจ้าหน้าที่ฝ่ายบุคคล',
                          'vp_hr': 'รองอธิการบดี',
                          'president': 'อธิการบดี',
                          'faculty': 'คณะ/หน่วยงาน'
                        };
                        const facultyName = user.facultyId 
                          ? (FACULTIES.find(f => f.id === user.facultyId)?.name || user.facultyId)
                          : '-';
                        
                        return (
                          <tr key={user.uid} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.email || '-'}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{roleLabels[user.role] || user.role}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{facultyName}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Active</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => {
                                    setSelectedUser(user);
                                    setShowUserModal(true);
                                  }}
                                  className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition"
                                >
                                  แก้ไข
                                </button>
                                <button 
                                  onClick={() => {
                                    if (confirm(`คุณต้องการลบผู้ใช้ ${user.email} หรือไม่?`)) {
                                      // ลบผู้ใช้
                                      if (!db) {
                                        // Demo Mode
                                        const localUsers = JSON.parse(localStorage.getItem('spu_hr_users') || '[]');
                                        const updated = localUsers.filter(u => u.uid !== user.uid);
                                        localStorage.setItem('spu_hr_users', JSON.stringify(updated));
                                        setUsers(updated);
                                        alert('ลบผู้ใช้สำเร็จ');
                                      } else {
                                        // Firestore
                                        alert('ฟีเจอร์ลบผู้ใช้จาก Firestore กำลังพัฒนา');
                                      }
                                    }
                                  }}
                                  className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded transition"
                                >
                                  ลบ
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* User Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {selectedUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">อีเมล</label>
                  <input 
                    type="email" 
                    defaultValue={selectedUser?.email || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="user@spu.ac.th"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">บทบาท</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option value="hr" selected={selectedUser?.role === 'hr'}>เจ้าหน้าที่ฝ่ายบุคคล</option>
                    <option value="vp_hr" selected={selectedUser?.role === 'vp_hr'}>รองอธิการบดี</option>
                    <option value="president" selected={selectedUser?.role === 'president'}>อธิการบดี</option>
                    <option value="faculty" selected={selectedUser?.role === 'faculty'}>คณะ/หน่วยงาน</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">คณะ/หน่วยงาน</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500">
                    <option value="">- เลือกคณะ -</option>
                    {FACULTIES.map(faculty => (
                      <option key={faculty.id} value={faculty.id} selected={selectedUser?.facultyId === faculty.id}>
                        {faculty.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      alert(selectedUser ? 'อัปเดตข้อมูลผู้ใช้สำเร็จ' : 'เพิ่มผู้ใช้สำเร็จ');
                      setShowUserModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
                  >
                    {selectedUser ? 'อัปเดต' : 'เพิ่ม'}
                  </button>
                  <button
                    onClick={() => {
                      setShowUserModal(false);
                      setSelectedUser(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Template Modal */}
        {showTemplateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                {selectedTemplate ? 'แก้ไข Email Template' : 'สร้าง Email Template ใหม่'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">ชื่อ Template</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="ชื่อ Template"
                    defaultValue={selectedTemplate === 'new-request' ? 'แจ้งเตือนคำขอใหม่' : selectedTemplate === 'confirmation' ? 'ยืนยันคำขอ' : selectedTemplate === 'status-update' ? 'อัปเดตสถานะ' : ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">หัวข้ออีเมล</label>
                  <input 
                    type="text" 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="Subject"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">เนื้อหาอีเมล</label>
                  <textarea 
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                    placeholder="เนื้อหาอีเมล..."
                    defaultValue={selectedTemplate === 'new-request' ? 'สวัสดี,\n\nมีการสร้างคำขอใหม่:\n- ตำแหน่ง: {{position}}\n- คณะ: {{faculty}}\n- จำนวน: {{amount}} ตำแหน่ง\n\nกรุณาตรวจสอบและดำเนินการ\n\nขอบคุณ' : selectedTemplate === 'confirmation' ? 'สวัสดี,\n\nคำขอของคุณได้รับการยืนยันแล้ว\n\nกรุณาคลิกลิงก์ด้านล่างเพื่อยืนยัน:\n{{confirmation_link}}\n\nขอบคุณ' : selectedTemplate === 'status-update' ? 'สวัสดี,\n\nสถานะคำขอของคุณได้เปลี่ยนแปลง:\n- ตำแหน่ง: {{position}}\n- สถานะใหม่: {{new_status}}\n\nกรุณาตรวจสอบในระบบ\n\nขอบคุณ' : ''}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      alert(selectedTemplate ? 'อัปเดต Template สำเร็จ' : 'สร้าง Template สำเร็จ');
                      setShowTemplateModal(false);
                      setSelectedTemplate(null);
                    }}
                    className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition font-semibold"
                  >
                    {selectedTemplate ? 'อัปเดต' : 'สร้าง'}
                  </button>
                  <button
                    onClick={() => {
                      setShowTemplateModal(false);
                      setSelectedTemplate(null);
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
                  >
                    ยกเลิก
                  </button>
                </div>
              </div>
            </div>
            </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;

