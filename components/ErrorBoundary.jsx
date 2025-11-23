/**
 * ============================================================================
 * Component: Error Boundary (ErrorBoundary.jsx)
 * ============================================================================
 * 
 * หน้าที่หลัก:
 * - จับ Error ที่เกิดขึ้นใน Component Tree
 * - แสดง Error UI แทนที่จะให้แอป crash
 * - ป้องกันหน้าเว็บแสดงเป็นหน้าขาวว่างเปล่า
 * 
 * ============================================================================
 */

import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // อัปเดต state เพื่อให้แสดง fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error ไปยัง error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // แสดง fallback UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h2>
              <p className="text-gray-600 mb-6">
                เกิดข้อผิดพลาดในการโหลดหน้าเว็บ กรุณาลองรีเฟรชหน้าหรือติดต่อผู้ดูแลระบบ
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg text-left">
                <p className="text-sm font-mono text-red-600 break-all">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-700 cursor-pointer">รายละเอียด</summary>
                    <pre className="text-xs text-gray-600 mt-2 overflow-auto max-h-40">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-pink-500 text-white py-3 rounded-lg hover:bg-pink-600 transition font-medium"
              >
                รีเฟรชหน้า
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                กลับไปหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

