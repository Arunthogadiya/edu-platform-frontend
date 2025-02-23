import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RoleButton } from './RoleButton';
import { UtilityBar } from './UtilityBar';
import { HelpModal } from '../../ui/HelpModal';

export type UserRole = 'parent' | 'teacher';
export type AuthAction = 'login' | 'register';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  
  const handleAuthAction = (role: UserRole, action: AuthAction) => {
    navigate(`/auth/${role}/${action}`);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('welcome.title')}</h1>
          <p className="text-gray-600">{t('welcome.selectRole')}</p>
        </div>
        
        {/* <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800 text-sm">{t('welcome.beta')}</p>
        </div> */}

        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">{t('roles.parent')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <RoleButton
                role="parent"
                icon={<Users className="h-6 w-6" />}
                onClick={() => handleAuthAction('parent', 'login')}
                label={t('auth.login')}
              />
              <RoleButton
                role="parent"
                icon={<Users className="h-6 w-6" />}
                onClick={() => handleAuthAction('parent', 'register')}
                label={t('auth.register')}
                variant="secondary"
              />
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-700">{t('roles.teacher')}</h2>
            <div className="grid grid-cols-2 gap-3">
              <RoleButton
                role="teacher"
                icon={<GraduationCap className="h-6 w-6" />}
                onClick={() => handleAuthAction('teacher', 'login')}
                label={t('auth.login')}
              />
              <RoleButton
                role="teacher"
                icon={<GraduationCap className="h-6 w-6" />}
                onClick={() => handleAuthAction('teacher', 'register')}
                label={t('auth.register')}
                variant="secondary"
              />
            </div>
          </div>
        </div>

        <UtilityBar
          selectedLanguage={i18n.language}
          onLanguageChange={handleLanguageChange}
          onHelpClick={() => setIsHelpModalOpen(true)}
        />
      </div>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
