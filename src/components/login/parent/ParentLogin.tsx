import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../auth/LoginForm';
import { RegisterForm } from '../../auth/RegisterForm';
import { useTranslation } from 'react-i18next';
import { authService } from '../../../services/authService';
import { motion } from 'framer-motion';

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

  // Particle effect for background
  const particles = Array.from({ length: 12 }).map((_, index) => ({
    id: index,
    size: Math.random() * 5 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 8
  }));

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex flex-col items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-white bg-opacity-20"
          initial={{ 
            width: particle.size, 
            height: particle.size,
            x: `${particle.x}%`, 
            y: `${particle.y}%`, 
            opacity: 0.2 
          }}
          animate={{ 
            x: [`${particle.x}%`, `${(particle.x + 10) % 100}%`],
            y: [`${particle.y}%`, `${(particle.y + 15) % 100}%`],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{ 
            duration: particle.duration, 
            repeat: Infinity, 
            ease: "linear"
          }}
        />
      ))}
      
      {/* Glowing ring animation */}
      <motion.div 
        className="absolute w-full h-full pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full border-4 border-indigo-500 border-opacity-20 blur-xl" />
      </motion.div>
      
      <motion.div 
        className="w-full max-w-md mx-auto backdrop-blur-lg bg-white bg-opacity-10 p-8 rounded-2xl shadow-2xl border border-white border-opacity-20 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {loginSuccess ? (
          <motion.div 
            className="text-center space-y-4"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
            </motion.div>
            <h2 className="text-2xl font-bold text-white">
              {t(isRegistration ? 'auth.registerSuccess' : 'auth.loginSuccess')}
            </h2>
            <p className="text-blue-200">{t('auth.redirecting')}</p>
            <motion.div 
              className="w-16 h-1 bg-blue-400 mx-auto rounded-full"
              initial={{ width: 0 }}
              animate={{ width: 64 }}
              transition={{ duration: 1.5 }}
            />
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <motion.button 
                whileHover={{ x: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/select-role')}
                className="flex items-center px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm
                         text-white hover:bg-white/20 hover:border-white/30 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                {t('auth.back')}
              </motion.button>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500 bg-opacity-50 flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                    {t('roles.parent')} {isRegistration ? t('auth.register') : t('auth.login')}
                  </h1>
                </div>
              </motion.div>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {isRegistration ? (
                <RegisterForm role="parent" onSuccess={handleAuthSuccess} />
              ) : (
                <LoginForm role="parent" onSuccess={handleAuthSuccess} />
              )}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
};

export default ParentLogin;