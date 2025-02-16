import React from 'react';
import { UserRole } from './RoleSelectionPage';

interface RoleButtonProps {
  role: UserRole;
  icon: React.ReactNode;
  onClick: () => void;
}

export const RoleButton: React.FC<RoleButtonProps> = ({ role, icon, onClick }) => {
  const buttonColors = {
    parent: 'bg-blue-600 hover:bg-blue-700',
    teacher: 'bg-green-600 hover:bg-green-700',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-center space-x-3 ${buttonColors[role]} text-white p-4 rounded-lg transition-colors`}
    >
      {icon}
      <span className="text-lg font-medium">
        I am a {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    </button>
  );
};
