import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  ClipboardCheck, 
  MessageSquare, 
  Calendar, 
  Brain,
  GraduationCap,
  BookOpen
} from 'lucide-react';

const TeacherNavigation = () => {
  const { t } = useTranslation();
  
  const navItems = [
    { 
      path: '/teacher/dashboard', 
      label: 'Student Performance',
      icon: Users,
      description: 'Track academic progress'
    },
    { 
      path: '/teacher/dashboard/attendance', 
      label: 'Attendance',
      icon: ClipboardCheck,
      description: 'Mark & monitor attendance'
    },
    { 
      path: '/teacher/dashboard/communication', 
      label: 'Communication',
      icon: MessageSquare,
      description: 'Messages & announcements'
    },
    { 
      path: '/teacher/dashboard/calendar', 
      label: 'Calendar',
      icon: Calendar,
      description: 'Schedule & events'
    },
    { 
      path: '/teacher/dashboard/behavior', 
      label: 'Behavior',
      icon: Brain,
      description: 'Track student behavior'
    },
    { 
      path: '/teacher/dashboard/assessments', 
      label: 'Assessments',
      icon: GraduationCap,
      description: 'Tests & evaluations'
    },
    { 
      path: '/teacher/dashboard/resources', 
      label: 'Resources',
      icon: BookOpen,
      description: 'Learning materials'
    }
  ];

  return (
    <nav className="p-4 space-y-2">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === '/teacher/dashboard'}
          className={({ isActive }) =>
            `flex items-center px-4 py-3 rounded-lg transition-all duration-200 ${
              isActive 
                ? 'bg-blue-50 text-blue-600' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`
          }
        >
          <item.icon className="h-5 w-5 mr-3 flex-shrink-0" />
          <div>
            <div className="font-medium">{item.label}</div>
            <div className="text-sm text-gray-500">{item.description}</div>
          </div>
        </NavLink>
      ))}
    </nav>
  );
};

export default TeacherNavigation;