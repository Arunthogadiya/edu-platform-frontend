import React from 'react';
import { Trophy } from 'lucide-react';

const DashboardSidebar: React.FC = () => {
  const teacherLinks = [
    {
      name: 'Home',
      href: '/teacher/dashboard/home',
      icon: HomeIcon,
      description: 'Go to the home page'
    },
    {
      name: 'Activities',
      href: '/teacher/dashboard/activities',
      icon: Trophy,
      description: 'Track student activities and achievements'
    },
    {
      name: 'Profile',
      href: '/teacher/dashboard/profile',
      icon: UserIcon,
      description: 'View and edit your profile'
    },
  ];

  return (
    <div>
      <ul>
        {teacherLinks.map((link) => (
          <li key={link.name}>
            <a href={link.href}>
              <link.icon />
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DashboardSidebar;
