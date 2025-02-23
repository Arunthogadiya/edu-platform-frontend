import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Layout, GraduationCap, Calendar, MessageSquare, Bot, Users, HelpCircle, Home, Brain, Star, Trophy, Book } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardErrorBoundary from '../parent/DashboardErrorBoundary';
import VoiceQuery from '../parent/VoiceQuery';
import NotificationBell from '../../common/NotificationBell';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  userType: 'parent' | 'teacher';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('userData') || 'null');
  const isTeacherDashboard = userType === 'teacher';

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

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/select-role');
    }
  }, [navigate]);

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    navigate('/select-role');
  };

  const handleVoiceQueryResult = (result: any) => {
    // Handle voice query results, e.g., navigate to specific sections or update data
    if (result?.result?.subject) {
      navigate(`/parent/dashboard/academics?subject=${result.result.subject.toLowerCase()}`);
    }
  };

  const menuItems = isTeacherDashboard ? [
    { 
      id: 'dashboard', 
      icon: Home, 
      label: 'Home', 
      description: 'Back to main dashboard', 
      path: '/teacher/dashboard',
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    },
    // Only show relevant menu items for teachers
    { 
      id: 'academics', 
      icon: GraduationCap, 
      label: 'Student Performance', 
      description: 'Track academic progress', 
      path: '/teacher/dashboard/performance',
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50'
    },
    { 
      id: 'attendance', 
      icon: Calendar, 
      label: 'Attendance', 
      description: 'Manage attendance', 
      path: '/teacher/dashboard/attendance',
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50'
    },
    { 
      id: 'messages', 
      icon: MessageSquare, 
      label: 'Communication', 
      description: 'Messages & announcements', 
      path: '/teacher/dashboard/communication',
      color: 'text-yellow-600',
      bgColor: 'hover:bg-yellow-50'
    },
    { 
      id: 'behavior', 
      icon: Brain, 
      label: 'Behavior Tracking', 
      description: 'Monitor student behavior', 
      path: '/teacher/dashboard/behavior',
      color: 'text-rose-600',
      bgColor: 'hover:bg-rose-50'
    },
    { 
      id: 'resources', 
      icon: Layout, 
      label: 'Learning Resources', 
      description: 'Manage learning materials', 
      path: '/teacher/dashboard/resources',
      color: 'text-emerald-600',
      bgColor: 'hover:bg-emerald-50'
    },
    { 
      id: 'activities', 
      icon: Trophy, 
      label: 'Activities', 
      description: 'Track student achievements', 
      path: '/teacher/dashboard/activities',
      color: 'text-amber-600',
      bgColor: 'hover:bg-amber-50'
    },
    { 
      id: 'events', 
      icon: Calendar, 
      label: 'Events & Assessments', 
      description: 'Manage class events', 
      path: '/teacher/dashboard/events',
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50'
    }
  ] : [
    // Original parent menu items
    { 
      id: 'dashboard', 
      icon: Home, 
      label: 'Home', 
      description: 'Back to main dashboard', 
      path: '/parent/dashboard',
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    },
    // ...rest of the existing parent menu items...
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
      id: 'community', 
      icon: Users, 
      label: 'Community', 
      description: 'Connect with parents', 
      path: '/parent/dashboard/community',
      color: 'text-indigo-600',
      bgColor: 'hover:bg-indigo-50'
    },
    { 
      id: 'helper', 
      icon: HelpCircle, 
      label: 'Help & Support', 
      description: 'Get assistance', 
      path: '/parent/dashboard/helper',
      color: 'text-red-600',
      bgColor: 'hover:bg-red-50'
    },
    { 
      id: 'behavior', 
      icon: Brain, 
      label: 'Behavior', 
      description: 'Track social-emotional growth', 
      path: '/parent/dashboard/behavior',
      color: 'text-rose-600',
      bgColor: 'hover:bg-rose-50'
    },
    { 
      id: 'talent', 
      icon: Star, 
      label: 'Talent Profile', 
      description: 'Discover potential', 
      path: '/parent/dashboard/talent',
      color: 'text-amber-600',
      bgColor: 'hover:bg-amber-50'
    },
    { 
      id: 'resources', 
      icon: Book, 
      label: 'Learning Resources', 
      description: 'Access study materials', 
      path: '/parent/dashboard/resources',
      color: 'text-emerald-600',
      bgColor: 'hover:bg-emerald-50'
    }
  ];

  return (
    <DashboardErrorBoundary>
      <div className="h-screen w-screen overflow-hidden bg-gray-50">
        {/* Fixed Top Navbar */}
        <nav className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg fixed w-full z-50">
          <div className="max-w-8xl mx-auto flex items-center justify-between h-16">
            <div className="flex items-center px-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg text-white transition-all duration-200 
                  bg-white/5 hover:bg-white/20 active:bg-white/10
                  focus:ring-2 focus:ring-white/20 focus:outline-none"
                aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
              >
                {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="ml-5 text-xl font-bold text-white truncate">
                {/* {userData?.studentName}'s Education Portal */}
                EngageEd
              </h1>
            </div>
            
            <div className="flex items-center space-x-4 px-4">
              <NotificationBell />
              <div className="hidden md:flex items-center p-2 text-white rounded-lg bg-white/5">
                <User size={20} />
                <span className="ml-2 text-sm">{userData?.name}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center p-2 rounded-lg text-white transition-all duration-200 
                  bg-white/5 hover:bg-white/20 active:bg-white/10
                  focus:ring-2 focus:ring-white/20 focus:outline-none"
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
                  className={`w-full flex items-center relative mx-2 rounded-lg
                    ${isSidebarOpen ? 'px-4 py-3' : 'h-12 px-2 justify-center'}
                    ${isActive 
                      ? `bg-gradient-to-r ${item.bgColor.replace('hover:', '')} shadow-lg transform scale-105 
                         ring-1 ring-${item.color.replace('text-', '')}/20` 
                      : 'hover:bg-gray-50 hover:scale-[1.02] hover:shadow-md'}
                    group focus:outline-none
                    transition-all duration-200 ease-in-out my-1`}
                  aria-label={item.label}
                >
                  <div className={`flex-shrink-0 transition-all duration-200 
                    ${isActive 
                      ? `${item.color} transform scale-110 filter drop-shadow-sm` 
                      : `text-gray-500 group-hover:${item.color} group-hover:scale-110`}
                    ${!isSidebarOpen ? 'transform scale-105' : ''}`}>
                    <item.icon size={!isSidebarOpen ? 22 : 24} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  <div className={`ml-4 text-left transition-all duration-200 
                    ${isMobile ? 'opacity-100' : (isSidebarOpen ? 'opacity-100 flex-1' : 'opacity-0 w-0 ml-0')}`}
                  >
                    <div className={`text-base font-medium transition-colors duration-200 
                      ${isActive ? `${item.color} font-semibold filter drop-shadow-sm` : `text-gray-700 group-hover:${item.color}`}`}>
                      {item.label}
                    </div>
                    <div className={`text-sm transition-opacity duration-200 
                      ${isActive ? 'text-gray-600' : 'text-gray-500 group-hover:text-gray-600'}`}>
                      {item.description}
                    </div>
                  </div>
                  {!isMobile && !isSidebarOpen && (
                    <div className={`absolute left-full ml-2 px-2.5 py-1.5 bg-gray-800 text-white text-sm rounded-md 
                      opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap z-50
                      transform translate-x-1 group-hover:translate-x-0 pointer-events-none shadow-lg`}>
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
          className={`fixed top-16 right-0 bottom-0 overflow-auto bg-gray-50 transition-all duration-300 ease-in-out
            ${isMobile ? 'left-0' : (isSidebarOpen ? 'left-72' : 'left-20')}`}
        >
          <div className="h-full w-full p-4">
            <div className="bg-white rounded-xl shadow-sm min-h-full w-full">
              {children}
            </div>
          </div>
        </main>

        {/* Voice Query Component */}
        {userType === 'parent' && <VoiceQuery onQueryResult={handleVoiceQueryResult} />}
      </div>
    </DashboardErrorBoundary>
  );
};

export default DashboardLayout;