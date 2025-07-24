import React from 'react';

interface TeacherCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  variant?: 'default' | 'gradient' | 'glass';
  size?: 'sm' | 'md' | 'lg';
}

const TeacherCard: React.FC<TeacherCardProps> = ({ 
  children, 
  className = '', 
  title, 
  subtitle, 
  action,
  variant = 'default',
  size = 'md'
}) => {
  const baseClasses = 'teacher-card rounded-xl transition-all duration-300 ease-in-out';
  
  const variantClasses = {
    default: 'bg-white border border-gray-200/50',
    gradient: 'bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/30',
    glass: 'glass-card border-white/20'
  };

  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {(title || subtitle || action) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && (
              <h3 className="text-lg font-display font-semibold text-gray-900 mb-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500">
                {subtitle}
              </p>
            )}
          </div>
          {action && (
            <div className="flex-shrink-0 ml-4">
              {action}
            </div>
          )}
        </div>
      )}
      {children}
    </div>
  );
};

export default TeacherCard;
