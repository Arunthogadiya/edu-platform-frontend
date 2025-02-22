import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../auth/LoginForm';
import { RegisterForm } from '../../auth/RegisterForm';
import { useTranslation } from 'react-i18next';
import { authService } from '../../../services/authService';

const ParentLogin = () => {
  const [loginSuccess, setLoginSuccess] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const isRegistration = window.location.pathname.includes('/register');
  
  useEffect(() => {
    // Check if already logged in - with safe parsing
    try {
      if (authService.isAuthenticated()) {
        const user = authService.getCurrentUser();
        if (user?.role === 'parent') {
          navigate('/parent/dashboard');
        } else {
          // Clear invalid session
          authService.logout();
        }
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
      authService.logout(); // Clear potentially corrupted data
    }
  }, [navigate]);

  const handleAuthSuccess = async (data: any) => {
    setLoginSuccess(true);
    setTimeout(() => {
      navigate('/parent/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6 bg-white p-8 rounded-xl shadow-lg">
        {loginSuccess ? (
          <div className="text-center space-y-3">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">
              {t(isRegistration ? 'auth.registerSuccess' : 'auth.loginSuccess')}
            </h2>
            <p className="text-gray-600">{t('auth.redirecting')}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate('/select-role')}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                {t('auth.back')}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                {t('roles.parent')} {isRegistration ? t('auth.register') : t('auth.login')}
              </h1>
            </div>
            
            {isRegistration ? (
              <RegisterForm role="parent" onSuccess={handleAuthSuccess} />
            ) : (
              <LoginForm role="parent" onSuccess={handleAuthSuccess} />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ParentLogin;