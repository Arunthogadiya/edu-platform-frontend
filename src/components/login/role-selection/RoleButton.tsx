import React from 'react';
import { UserRole } from './RoleSelectionPage';

interface RoleButtonProps {
  role: UserRole;
  icon: React.ReactNode;
  onClick: () => void;
}

export const RoleButton: React.FC<RoleButtonProps> = ({ role, icon, onClick }) => {
  const buttonStyles = {
    parent: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    teacher: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center space-x-3 bg-gradient-to-r ${buttonStyles[role]} 
        text-white p-4 rounded-lg transition-all duration-300 ease-out transform hover:scale-[1.02]
        shadow-md hover:shadow-lg active:scale-[0.98] focus:outline-none focus:ring-2 
        focus:ring-offset-2 focus:ring-${role === 'parent' ? 'blue' : 'green'}-400`}
    >
      <div className="transition-transform duration-200 group-hover:scale-110">
        {icon}
      </div>
      <span className="text-lg font-medium">
        I am a {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    </button>
  );
};
