import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap } from 'lucide-react';
import { RoleButton } from './RoleButton';
import { UtilityBar } from './UtilityBar';

export type UserRole = 'parent' | 'teacher';

export const RoleSelectionPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'other'>('en');
  const navigate = useNavigate();
  
  const handleRoleSelect = (role: UserRole) => {
    navigate(`/auth/${role}`);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to EduPal</h1>
          <p className="text-gray-600">Please select your role to continue</p>
        </div>

        <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">
            Notice: This is a beta version. Some features may be limited or under development.
          </p>
        </div>

        <div className="space-y-4">
          <RoleButton
            role="parent"
            icon={<Users className="h-6 w-6" />}
            onClick={() => handleRoleSelect('parent')}
          />
          <RoleButton
            role="teacher"
            icon={<GraduationCap className="h-6 w-6" />}
            onClick={() => handleRoleSelect('teacher')}
          />
        </div>

        <UtilityBar 
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
        />
      </div>
    </div>
  );
};
