import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Layout, GraduationCap, Calendar, MessageSquare, Bot, Users, HelpCircle, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(sessionStorage.getItem('userData') || 'null');

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && !isSidebarOpen) {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    sessionStorage.removeItem('isAuthenticated');
    sessionStorage.removeItem('userData');
    navigate('/select-role');
  };

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: Home, 
      label: 'Home', 
      description: 'Back to main dashboard', 
      path: '/parent/dashboard',
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    },
    { 
      id: 'academics', 
      icon: GraduationCap, 
      label: 'Grades & Assignments', 
      description: 'View academic progress', 
      path: '/parent/dashboard/academics',
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50'
    },
    { 
      id: 'attendance', 
      icon: Calendar, 
      label: 'Attendance', 
      description: 'Check daily attendance', 
      path: '/parent/dashboard/attendance',
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50'
    },
    { 
      id: 'messages', 
      icon: MessageSquare, 
      label: 'Messages', 
      description: 'Talk to teachers', 
      path: '/parent/dashboard/messages',
      color: 'text-yellow-600',
      bgColor: 'hover:bg-yellow-50'
    },
    { 
      id: 'helper', 
      icon: HelpCircle, 
      label: 'Help & Support', 
      description: 'Get assistance', 
      path: '/parent/dashboard/helper',
      color: 'text-red-600',
      bgColor: 'hover:bg-red-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed Top Navbar */}
      <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg fixed w-full z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
          <div className="flex items-center px-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
              aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
            >
              {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="ml-4 text-xl font-semibold text-white truncate">
              {userData?.studentName}'s Education Portal
            </h1>
          </div>
          
          <div className="flex items-center space-x-4 px-4">
            <div className="hidden md:flex items-center p-2 text-white rounded-lg transition-all duration-200 hover:bg-white/10">
              <User size={20} />
              <span className="ml-2 text-sm">{userData?.name}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center p-2 rounded-lg text-white transition-all duration-200 hover:bg-white/10 active:scale-95"
              aria-label="Sign out"
            >
              <LogOut size={20} />
              <span className="ml-2 text-sm hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </nav>
      
      {/* Sidebar */}
      <div 
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 ease-in-out z-40
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          ${isMobile ? 'w-72' : (isSidebarOpen ? 'w-72' : 'w-20 translate-x-0')}`}
      >
        <div className="py-4 overflow-y-auto h-full">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) {
                    setIsSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center px-4 py-4 transition-all duration-200 relative
                  ${isActive 
                    ? `${item.bgColor} border-l-4 border-current ${item.color}` 
                    : 'border-l-4 border-transparent hover:border-current'}
                  group active:scale-[0.99]`}
                aria-label={item.label}
              >
                <div className={`flex-shrink-0 transition-colors duration-200 ${isActive ? item.color : 'text-gray-500 group-hover:' + item.color}`}>
                  <item.icon size={24} />
                </div>
                <div className={`ml-4 text-left transition-all duration-200 
                  ${isMobile ? 'opacity-100' : (isSidebarOpen ? 'opacity-100' : 'opacity-0')}`}
                >
                  <div className={`text-base font-medium transition-colors duration-200 
                    ${isActive ? item.color : 'text-gray-700 group-hover:' + item.color}`}>
                    {item.label}
                  </div>
                  <div className="text-sm text-gray-500">{item.description}</div>
                </div>
                {!isMobile && !isSidebarOpen && (
                  <div className={`absolute left-full ml-2 p-2 ${item.color} bg-opacity-10 text-sm rounded-md 
                    opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50
                    transform translate-x-2 group-hover:translate-x-0`}>
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main 
        className={`pt-16 transition-all duration-300 ease-in-out
          ${isMobile ? '' : (isSidebarOpen ? 'md:ml-72' : 'md:ml-20')}`}
      >
        <div className="max-w-7xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;