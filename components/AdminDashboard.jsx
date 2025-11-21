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
  FileText,
  FolderKanban,
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

const AdminDashboard = ({ userRole, faculty, onLogout, onCreateRequest }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false); // สำหรับควบคุมการแสดง/ซ่อนเมนูบนมือถือ

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <SPULogo size="sm" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">HR@SPU Personnel System</h1>
              <p className="text-sm text-gray-600">
                {userRole === 'hr' ? 'สำนักงานบุคคล (HR)' : faculty?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                // ลบค่า useAdminDashboard จาก localStorage และ reload
                if (typeof window !== 'undefined') {
                  localStorage.removeItem('spu_hr_useAdminDashboard');
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center text-sm transition"
            >
              <LayoutDashboard size={16} className="mr-2" />
              Standard View
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center text-sm transition"
            >
              <LogOut size={16} className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Horizontal Navigation Menu */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
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
              {activeMenu === 'applications' && 'Applications'}
              {activeMenu === 'projects' && 'Projects'}
              {activeMenu === 'positions' && 'Positions'}
              {activeMenu === 'email-templates' && 'Email Templates'}
              {activeMenu === 'email-logs' && 'Email Logs'}
              {activeMenu === 'user-management' && 'User Management'}
            </span>
          </div>

          {/* Navigation Menu - Desktop (Horizontal) */}
          <nav className="hidden lg:flex space-x-1 overflow-x-auto">
            <button
              onClick={() => setActiveMenu('dashboard')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'dashboard'
                  ? 'bg-pink-100 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveMenu('applications')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'applications'
                  ? 'bg-pink-100 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileText size={18} />
              <span>Applications</span>
            </button>
            <button
              onClick={() => setActiveMenu('projects')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'projects'
                  ? 'bg-pink-100 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FolderKanban size={18} />
              <span>Projects</span>
            </button>
            <button
              onClick={() => setActiveMenu('positions')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'positions'
                  ? 'bg-pink-100 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users size={18} />
              <span>Positions</span>
            </button>
            <button
              onClick={() => setActiveMenu('email-templates')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'email-templates'
                  ? 'bg-pink-100 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Mail size={18} />
              <span>Email Templates</span>
            </button>
            <button
              onClick={() => setActiveMenu('email-logs')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'email-logs'
                  ? 'bg-pink-100 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FileCheck size={18} />
              <span>Email Logs</span>
            </button>
            <button
              onClick={() => setActiveMenu('user-management')}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition whitespace-nowrap ${
                activeMenu === 'user-management'
                  ? 'bg-pink-100 text-pink-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
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
                  setActiveMenu('applications');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === 'applications'
                    ? 'bg-pink-100 text-pink-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FileText size={20} />
                <span>Applications</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu('projects');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  activeMenu === 'projects'
                    ? 'bg-pink-100 text-pink-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <FolderKanban size={20} />
                <span>Projects</span>
              </button>
              <button
                onClick={() => {
                  setActiveMenu('positions');
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
                      <Bar dataKey="count" fill="#ec4899" />
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

          {/* Other Menu Views */}
          {activeMenu !== 'dashboard' && (
            <div className="bg-white rounded-lg shadow p-12 text-center border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {activeMenu === 'applications' && 'Applications'}
                {activeMenu === 'projects' && 'Projects'}
                {activeMenu === 'positions' && 'Positions'}
                {activeMenu === 'email-templates' && 'Email Templates'}
                {activeMenu === 'email-logs' && 'Email Logs'}
                {activeMenu === 'user-management' && 'User Management'}
              </h2>
              <p className="text-gray-600">
                This feature is coming soon...
              </p>
            </div>
          )}
        </main>
    </div>
  );
};

export default AdminDashboard;

