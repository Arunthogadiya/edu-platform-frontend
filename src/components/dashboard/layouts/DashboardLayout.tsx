import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut, Search, Bell, Settings, ChevronRight, GraduationCap, Calendar, MessageSquare, Users, Brain, Award, Activity, BookOpen, HelpCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardErrorBoundary from '../parent/DashboardErrorBoundary';
import VoiceQuery from '../parent/VoiceQuery';
import NotificationBell from '../../common/NotificationBell';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children?: React.ReactNode;
  userType: 'parent' | 'teacher';
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const userData = JSON.parse(localStorage.getItem('userData') || 'null');
  const isTeacherDashboard = userType === 'teacher';

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsCollapsed(true);
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Dashboard', href: '/teacher/dashboard' }
    ];

    if (pathSegments.length > 2) {
      const currentPage = pathSegments[pathSegments.length - 1];
      const pageLabels: { [key: string]: string } = {
        'performance': 'Student Performance',
        'attendance': 'Attendance Management',
        'communication': 'Communication',
        'behavior': 'Behavior Tracking',
        'resources': 'Learning Resources',
        'assessments': 'Assessments',
        'activities': 'Activity Tracking',
        'events': 'Events & Assessments'
      };
      
      if (pageLabels[currentPage]) {
        breadcrumbs.push({ label: pageLabels[currentPage], href: location.pathname });
      }
    }

    return breadcrumbs;
  };

  // Modern Teacher Layout
  if (isTeacherDashboard) {
    return (
      <DashboardErrorBoundary>
        <div className="teacher-dashboard h-screen w-screen overflow-hidden flex">
          {/* Modern Sidebar */}
          <Sidebar 
            isCollapsed={isCollapsed} 
            onToggleCollapse={handleToggleCollapse}
            userType={userType}
          />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Enhanced Modern Header */}
            <header className="teacher-header h-20 flex items-center justify-between px-8 relative z-10">
              {/* Left Section - Enhanced Breadcrumbs */}
              <div className="flex items-center space-x-6">
                <nav className="flex items-center space-x-3 text-sm">
                  {generateBreadcrumbs().map((crumb, index) => (
                    <React.Fragment key={crumb.href}>
                      {index > 0 && (
                        <div className="w-1.5 h-1.5 bg-neutral-300 rounded-full" />
                      )}
                      <button
                        onClick={() => navigate(crumb.href)}
                        className={`px-3 py-2 rounded-lg transition-all duration-300 font-medium ${
                          index === generateBreadcrumbs().length - 1
                            ? 'text-primary-700 bg-primary-50 shadow-sm scale-105'
                            : 'text-neutral-600 hover:text-primary-600 hover:bg-neutral-50'
                        }`}
                      >
                        {crumb.label}
                      </button>
                    </React.Fragment>
                  ))}
                </nav>
              </div>

              {/* Center Section - Enhanced Search Bar */}
              <div className="flex-1 max-w-lg mx-12">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 
                    w-5 h-5 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search students, assignments, resources..."
                    className="w-full pl-12 pr-6 py-4 bg-white/60 border border-neutral-200/60 
                             rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary-500/20 
                             focus:border-primary-300 focus:bg-white backdrop-blur-sm 
                             transition-all duration-300 text-neutral-700 placeholder-neutral-400
                             hover:bg-white/80 hover:border-neutral-300"
                  />
                  {/* Search Enhancement */}
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <kbd className="px-2 py-1 text-xs font-semibold text-neutral-500 bg-neutral-100 
                      border border-neutral-200 rounded-md">⌘K</kbd>
                  </div>
                </div>
              </div>

              {/* Right Section - Enhanced Actions */}
              <div className="flex items-center space-x-4">
                {/* Notification Bell */}
                <button className="relative p-3 rounded-2xl bg-white/60 hover:bg-white/90 
                  transition-all duration-300 hover:scale-105 hover:shadow-md group">
                  <Bell className="w-5 h-5 text-neutral-600 group-hover:text-primary-600" />
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-coral 
                    to-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">3</span>
                  </span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral rounded-full 
                    animate-ping opacity-75"></span>
                </button>
                
                {/* Settings */}
                <button className="p-3 rounded-2xl bg-white/60 hover:bg-white/90 
                  transition-all duration-300 hover:scale-105 hover:shadow-md group">
                  <Settings className="w-5 h-5 text-neutral-600 group-hover:text-primary-600" />
                </button>

                {/* Enhanced User Profile */}
                <div className="flex items-center space-x-4 px-4 py-2 bg-white/60 rounded-2xl 
                  hover:bg-white/90 transition-all duration-300 hover:shadow-md cursor-pointer group">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 
                      rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl 
                      transition-shadow">
                      <span className="text-white text-sm font-bold">
                        {userData?.name?.charAt(0)?.toUpperCase() || 'T'}
                      </span>
                    </div>
                    {/* Online Status */}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-mint rounded-full 
                      border-2 border-white shadow-sm"></div>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-semibold text-neutral-900 group-hover:text-primary-700">
                      {userData?.name || 'Teacher'}
                    </p>
                    <p className="text-xs text-neutral-500 group-hover:text-neutral-600">
                      Teacher Portal • Class 6A
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-neutral-400 group-hover:text-primary-500 
                    transition-colors hidden md:block" />
                </div>

                {/* Enhanced Logout */}
                <button 
                  onClick={handleLogout}
                  className="p-3 rounded-2xl bg-white/60 hover:bg-red-50 hover:text-red-600 
                    transition-all duration-300 hover:scale-105 hover:shadow-md group"
                  aria-label="Sign out"
                >
                  <LogOut className="w-5 h-5 transition-colors" />
                </button>
              </div>
            </header>

            {/* Enhanced Content Area */}
            <main className="flex-1 overflow-auto teacher-content bg-gradient-to-br from-neutral-50/80 to-white/80">
              <div className="h-full relative">
                {/* Content Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 1px 1px, #2d4a8a 1px, transparent 0)`,
                    backgroundSize: '24px 24px'
                  }} />
                </div>
                
                {/* Main Content Container */}
                <div className="relative z-10 h-full">
                  {children}
                </div>
              </div>
            </main>
          </div>

          {/* Mobile Overlay */}
          {isMobile && isSidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}
        </div>
      </DashboardErrorBoundary>
    );
  }

  // Original Parent Layout (unchanged)
  const menuItems = [
    { 
      id: 'dashboard', 
      icon: User, 
      label: 'Home', 
      description: 'Back to main dashboard', 
      path: '/parent/dashboard',
      color: 'text-blue-600',
      bgColor: 'hover:bg-blue-50'
    },
    { 
      id: 'academics', 
      icon: GraduationCap, 
      label: 'Academic Performance', 
      description: 'View grades & performance', 
      path: '/parent/dashboard/academics',
      color: 'text-purple-600',
      bgColor: 'hover:bg-purple-50'
    },
    { 
      id: 'attendance', 
      icon: Calendar, 
      label: 'Attendance & Behavior', 
      description: 'Track attendance & schedule', 
      path: '/parent/dashboard/attendance',
      color: 'text-green-600',
      bgColor: 'hover:bg-green-50'
    },
    { 
      id: 'messages', 
      icon: MessageSquare, 
      label: 'Messages', 
      description: 'Communicate with teachers', 
      path: '/parent/dashboard/messages',
      color: 'text-indigo-600',
      bgColor: 'hover:bg-indigo-50'
    },
    { 
      id: 'community', 
      icon: Users, 
      label: 'Community', 
      description: 'Parent community & forums', 
      path: '/parent/dashboard/community',
      color: 'text-teal-600',
      bgColor: 'hover:bg-teal-50'
    },
    { 
      id: 'behavior', 
      icon: Brain, 
      label: 'Behavior Tracker', 
      description: 'Monitor behavior patterns', 
      path: '/parent/dashboard/behavior',
      color: 'text-orange-600',
      bgColor: 'hover:bg-orange-50'
    },
    { 
      id: 'talent', 
      icon: Award, 
      label: 'Talent Profile', 
      description: 'Skills & achievements', 
      path: '/parent/dashboard/talent',
      color: 'text-yellow-600',
      bgColor: 'hover:bg-yellow-50'
    },
    { 
      id: 'activities', 
      icon: Activity, 
      label: 'Activities', 
      description: 'Extracurricular activities', 
      path: '/parent/dashboard/activities',
      color: 'text-pink-600',
      bgColor: 'hover:bg-pink-50'
    },
    { 
      id: 'resources', 
      icon: BookOpen, 
      label: 'Learning Resources', 
      description: 'Educational materials', 
      path: '/parent/dashboard/resources',
      color: 'text-emerald-600',
      bgColor: 'hover:bg-emerald-50'
    },
    { 
      id: 'helper', 
      icon: HelpCircle, 
      label: 'Help & Support', 
      description: 'Get help & support', 
      path: '/parent/dashboard/helper',
      color: 'text-gray-600',
      bgColor: 'hover:bg-gray-50'
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
        
        {/* Sidebar for Parent */}
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
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content for Parent */}
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

        {/* Voice Query Component for Parent */}
        {userType === 'parent' && <VoiceQuery onQueryResult={handleVoiceQueryResult} />}
      </div>
    </DashboardErrorBoundary>
  );
};

export default DashboardLayout;