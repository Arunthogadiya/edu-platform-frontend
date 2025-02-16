import React from 'react';
import { UserRole } from './RoleSelectionPage';

interface RoleButtonProps {
  role: UserRole;
  icon: React.ReactNode;
  onClick: () => void;
  label?: string;
  variant?: 'primary' | 'secondary';
}

export const RoleButton: React.FC<RoleButtonProps> = ({ 
  role, 
  icon, 
  onClick,
  label = role.charAt(0).toUpperCase() + role.slice(1),
  variant = 'primary'
}) => {
  const baseStyles = "w-full flex items-center justify-center space-x-2 p-4 rounded-lg transition-colors";
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
  };

  return (
    <button
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]}`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );
};
