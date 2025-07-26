import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bot, 
  BarChart3, 
  Users, 
  Calendar, 
  MessageSquare, 
  GraduationCap, 
  Brain, 
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Activity,
  CalendarDays
} from 'lucide-react';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  userType: 'parent' | 'teacher';
  isMobile?: boolean;
  isMobileOpen?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggleCollapse, userType, isMobile = false, isMobileOpen = false }) => {
  const location = useLocation();

  // Only show teacher nav items for teacher dashboard
  if (userType !== 'teacher') {
    return null; // Don't render anything for non-teacher users
  }

  const navigationSections = [
    {
      title: 'CORE',
      items: [
        {
          name: 'Dashboard',
          href: '/teacher/dashboard',
          icon: Home,
          description: 'Overview & analytics',
          isNew: false
        },
        {
          name: 'AI Teaching Hub',
          href: '/teacher/dashboard/ai-hub',
          icon: Bot,
          description: 'AI-powered insights',
          isNew: true
        },
        {
          name: 'Analytics',
          href: '/teacher/dashboard/analytics',
          icon: BarChart3,
          description: 'Performance metrics',
          isNew: false
        }
      ]
    },
    {
      title: 'CLASSROOM MANAGEMENT',
      items: [
        {
          name: 'Students',
          href: '/teacher/dashboard/performance',
          icon: Users,
          description: 'Student management',
          isNew: false
        },
        {
          name: 'Attendance',
          href: '/teacher/dashboard/attendance',
          icon: Calendar,
          description: 'Mark & monitor',
          isNew: false
        },
        {
          name: 'Communication',
          href: '/teacher/dashboard/communication',
          icon: MessageSquare,
          description: 'Messages & announcements',
          isNew: false
        }
      ]
    },
    {
      title: 'TOOLS & RESOURCES',
      items: [
        {
          name: 'Assessments',
          href: '/teacher/dashboard/assessments',
          icon: GraduationCap,
          description: 'Tests & evaluations',
          isNew: false
        },
        {
          name: 'Behavior',
          href: '/teacher/dashboard/behavior',
          icon: Brain,
          description: 'Track student behavior',
          isNew: false
        },
        {
          name: 'Resources',
          href: '/teacher/dashboard/resources',
          icon: BookOpen,
          description: 'Learning materials',
          isNew: false
        },
        {
          name: 'Activities',
          href: '/teacher/dashboard/activities',
          icon: Activity,
          description: 'Track activities',
          isNew: false
        },
        {
          name: 'Events',
          href: '/teacher/dashboard/events',
          icon: CalendarDays,
          description: 'Manage events',
          isNew: false
        }
      ]
    }
  ];

  return (
    <div className={`teacher-sidebar flex flex-col h-full transition-all duration-500 ease-in-out ${
      isCollapsed ? 'w-16 collapsed' : 'w-80'
    } ${isMobile ? (isMobileOpen ? 'mobile-open' : '') : ''}`}>
      {/* Enhanced Header */}
      <div className="sidebar-header flex items-center justify-between p-6 border-b border-white/10">
        {!isCollapsed && (
          <div className="header-content flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-coral to-accent rounded-xl flex items-center justify-center shadow-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-display font-bold text-xl tracking-tight">EduPlatform</h2>
              <p className="text-white/60 text-sm font-medium">Teacher Dashboard v2.0</p>
            </div>
          </div>
        )}
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-coral to-accent rounded-xl flex items-center justify-center shadow-lg mx-auto">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300 group flex-shrink-0"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
          )}
        </button>
      </div>

      {/* Enhanced Navigation */}
      <nav className="sidebar-content flex-1 overflow-y-auto py-6 space-y-8">
        {navigationSections.map((section) => (
          <div key={section.title} className="px-4">
            {!isCollapsed && (
              <h3 className="nav-text text-white/40 text-xs font-semibold uppercase tracking-wider mb-4 px-4">
                {section.title}
              </h3>
            )}
            <div className="space-y-2">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href === '/teacher/dashboard' && location.pathname === '/teacher/dashboard');
                
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={`teacher-nav-item group flex items-center px-4 py-4 text-sm font-medium 
                      rounded-xl transition-all duration-300 ease-in-out relative ${
                      isActive 
                        ? 'active text-white bg-white/15 shadow-lg scale-105' 
                        : 'text-white/80 hover:text-white hover:bg-white/10 hover:scale-102'
                    }`}
                  >
                    {/* Background Hover Effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r from-coral/20 to-mint/20 
                      transform transition-transform duration-300 ${
                      isActive ? 'scale-100' : 'scale-0 group-hover:scale-100'
                    }`} />
                    
                    <item.icon className={`nav-icon flex-shrink-0 relative z-10 transition-all duration-300 ${
                      isCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                    } ${isActive ? 'text-coral' : 'group-hover:text-coral'}`} />
                    
                    {!isCollapsed && (
                      <div className="nav-content flex-1 relative z-10 ml-4">
                        <div className="flex items-center">
                          <span className="font-medium">{item.name}</span>
                          {item.isNew && (
                            <span className="ml-3 px-2 py-1 text-xs bg-coral text-white rounded-full 
                              font-semibold animate-pulse">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-white/50 text-xs mt-1 transition-colors group-hover:text-white/70">
                          {item.description}
                        </p>
                      </div>
                    )}
                        
                    {/* Active Indicator */}
                    {isActive && !isCollapsed && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 
                        bg-gradient-to-b from-coral to-mint rounded-l-full shadow-lg" />
                    )}

                    {/* Enhanced Tooltip for collapsed state */}
                    {isCollapsed && (
                      <div className="tooltip absolute left-full ml-4 px-3 py-2 bg-gray-900/95 text-white text-sm 
                        rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-all 
                        duration-300 whitespace-nowrap z-50 shadow-lg backdrop-blur-sm border border-white/10">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-300 mt-1">{item.description}</div>
                        {item.isNew && (
                          <div className="mt-1">
                            <span className="px-1.5 py-0.5 text-xs bg-coral text-white rounded-full">NEW</span>
                          </div>
                        )}
                        {/* Tooltip Arrow */}
                        <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 
                          w-2 h-2 bg-gray-900/95 rotate-45 border-l border-b border-white/10" />
                      </div>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Enhanced Footer */}
      <div className="sidebar-footer p-6 border-t border-white/10">
        {!isCollapsed && (
          <div className="footer-content flex items-center space-x-4 p-4 bg-white/5 rounded-xl backdrop-blur-sm 
            border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="w-10 h-10 bg-gradient-to-br from-mint to-success rounded-xl 
              flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">T</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">Teacher Mode</p>
              <p className="text-white/60 text-xs truncate">Modern Dashboard • Online</p>
            </div>
            <div className="w-3 h-3 bg-mint rounded-full animate-pulse shadow-lg" />
          </div>
        )}

        {/* Collapsed Footer */}
        {isCollapsed && (
          <div className="w-10 h-10 bg-gradient-to-br from-mint to-success rounded-xl 
            flex items-center justify-center shadow-lg mx-auto relative">
            <span className="text-white text-sm font-bold">T</span>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-mint rounded-full 
              animate-pulse shadow-lg border-2 border-white/20" />
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;