import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, GraduationCap, Brain, ChevronRight, Globe, BookOpen, Zap } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RoleButton } from './RoleButton';
import { UtilityBar } from './UtilityBar';
import { HelpModal } from '../../ui/HelpModal';
import { motion } from 'framer-motion';

export type UserRole = 'parent' | 'teacher';
export type AuthAction = 'login' | 'register';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  
  useEffect(() => {
    // Trigger animation complete after initial animations
    const timer = setTimeout(() => setAnimationComplete(true), 1200);
    return () => clearTimeout(timer);
  }, []);
  
  const handleAuthAction = (role: UserRole, action: AuthAction) => {
    navigate(`/auth/${role}/${action}`);
  };

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  // Particle effect for background
  const particles = Array.from({ length: 20 }).map((_, index) => ({
    id: index,
    size: Math.random() * 6 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10
  }));

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 flex items-center justify-center p-4 overflow-hidden relative">
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
        animate={{ opacity: 0.7 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 rounded-full border-4 border-indigo-500 border-opacity-20 blur-xl" />
      </motion.div>

      <motion.div 
        className="w-full max-w-lg mx-auto backdrop-blur-lg bg-white bg-opacity-10 p-8 rounded-2xl shadow-2xl border border-white border-opacity-20 transition-all duration-300 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Animated hero illustration */}
        <motion.div 
          className="flex justify-center mb-8 select-none"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="relative">
            <svg 
              width="240" 
              height="160" 
              viewBox="0 0 600 400" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-lg"
            >
              {/* Central brain hub */}
              <motion.path 
                d="M300 80C400 80 480 150 480 230C480 310 400 380 300 380C200 380 120 310 120 230C120 150 200 80 300 80Z" 
                fill="url(#brain_gradient)" 
                fillOpacity="0.3"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.5 }}
              />
              
              {/* Pulsing core */}
              <motion.circle 
                cx="300" 
                cy="230" 
                r="50" 
                fill="url(#core_gradient)"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 0.9, 1] }}
                transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
              />
              
              {/* Connection lines with animation */}
              {[
                "M220 170L300 230", "M300 230L380 170", 
                "M220 290L300 230", "M300 230L380 290",
                "M300 150L300 230", "M300 230L300 310",
                "M240 230L300 230", "M300 230L360 230"
              ].map((path, index) => (
                <motion.path 
                  key={index} 
                  d={path} 
                  stroke="url(#line_gradient)" 
                  strokeWidth="3" 
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 0.8, 1] }}
                  transition={{ duration: 1.5, delay: 0.5 + (index * 0.1) }}
                />
              ))}
              
              {/* Education feature nodes */}
              {[
                { cx: 220, cy: 170, icon: "grade", delay: 0.8 }, 
                { cx: 380, cy: 170, icon: "language", delay: 1.0 },
                { cx: 220, cy: 290, icon: "social", delay: 1.2 }, 
                { cx: 380, cy: 290, icon: "talent", delay: 1.4 },
                { cx: 300, cy: 150, icon: "voice", delay: 1.6 },
                { cx: 300, cy: 310, icon: "insight", delay: 1.8 },
                { cx: 240, cy: 230, icon: "parent", delay: 2.0 },
                { cx: 360, cy: 230, icon: "teacher", delay: 2.2 }
              ].map((node, index) => (
                <React.Fragment key={index}>
                  <motion.circle 
                    cx={node.cx} 
                    cy={node.cy} 
                    r="22" 
                    fill="#FFFFFF" 
                    fillOpacity="0.15"
                    stroke="rgba(255,255,255,0.6)" 
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.6, delay: node.delay }}
                  />
                  
                  {/* Node icons */}
                  {node.icon === "grade" && (
                    <motion.path 
                      d={`M${node.cx-10} ${node.cy-8}L${node.cx} ${node.cy-15}L${node.cx+10} ${node.cy-8}L${node.cx+7} ${node.cy+5}L${node.cx} ${node.cy}L${node.cx-7} ${node.cy+5}Z`}
                      stroke="rgba(255,255,255,0.9)" 
                      strokeWidth="2"
                      fill="none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: node.delay + 0.2 }}
                    />
                  )}
                  {node.icon === "language" && (
                    <motion.circle 
                      cx={node.cx} 
                      cy={node.cy} 
                      r="10" 
                      stroke="rgba(255,255,255,0.9)" 
                      strokeWidth="2"
                      fill="none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: node.delay + 0.2 }}
                    >
                      <motion.path 
                        d={`M${node.cx-5} ${node.cy}L${node.cx+5} ${node.cy}M${node.cx} ${node.cy-5}L${node.cx} ${node.cy+5}`}
                        stroke="rgba(255,255,255,0.9)" 
                        strokeWidth="2"
                      />
                    </motion.circle>
                  )}
                  {node.icon === "social" && (
                    <motion.path 
                      d={`M${node.cx-8} ${node.cy-3}C${node.cx-8} ${node.cy-8},${node.cx+8} ${node.cy-8},${node.cx+8} ${node.cy-3}M${node.cx-5} ${node.cy+5}C${node.cx-5} ${node.cy+2},${node.cx+5} ${node.cy+2},${node.cx+5} ${node.cy+5}`}
                      stroke="rgba(255,255,255,0.9)" 
                      strokeWidth="2"
                      fill="none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: node.delay + 0.2 }}
                    />
                  )}
                  {node.icon === "talent" && (
                    <motion.path 
                      d={`M${node.cx} ${node.cy-10}L${node.cx} ${node.cy+10}M${node.cx-10} ${node.cy}L${node.cx+10} ${node.cy}M${node.cx-7} ${node.cy-7}L${node.cx+7} ${node.cy+7}M${node.cx-7} ${node.cy+7}L${node.cx+7} ${node.cy-7}`}
                      stroke="rgba(255,255,255,0.9)" 
                      strokeWidth="2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: node.delay + 0.2 }}
                    />
                  )}
                  {node.icon === "voice" && (
                    <motion.path 
                      d={`M${node.cx-5} ${node.cy-8}C${node.cx-12} ${node.cy},${node.cx-12} ${node.cy},${node.cx-5} ${node.cy+8}M${node.cx+5} ${node.cy-8}C${node.cx+12} ${node.cy},${node.cx+12} ${node.cy},${node.cx+5} ${node.cy+8}`}
                      stroke="rgba(255,255,255,0.9)" 
                      strokeWidth="2"
                      fill="none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: node.delay + 0.2 }}
                    />
                  )}
                  {node.icon === "insight" && (
                    <motion.path 
                      d={`M${node.cx-10} ${node.cy-5}L${node.cx+10} ${node.cy-5}M${node.cx-7} ${node.cy}L${node.cx+7} ${node.cy}M${node.cx-4} ${node.cy+5}L${node.cx+4} ${node.cy+5}`}
                      stroke="rgba(255,255,255,0.9)" 
                      strokeWidth="2"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: node.delay + 0.2 }}
                    />
                  )}
                  {node.icon === "parent" && (
                    <motion.path 
                      d={`M${node.cx-5} ${node.cy-7}C${node.cx-5} ${node.cy-12},${node.cx+5} ${node.cy-12},${node.cx+5} ${node.cy-7}C${node.cx+5} ${node.cy-2},${node.cx-5} ${node.cy-2},${node.cx-5} ${node.cy-7}M${node.cx} ${node.cy-7}L${node.cx} ${node.cy+8}M${node.cx-7} ${node.cy+3}L${node.cx} ${node.cy+8}L${node.cx+7} ${node.cy+3}`}
                      stroke="rgba(255,255,255,0.9)" 
                      strokeWidth="2"
                      fill="none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: node.delay + 0.2 }}
                    />
                  )}
                  {node.icon === "teacher" && (
                    <motion.path 
                      d={`M${node.cx-8} ${node.cy-5}L${node.cx+8} ${node.cy-5}L${node.cx+8} ${node.cy+5}L${node.cx-8} ${node.cy+5}ZM${node.cx-3} ${node.cy-5}L${node.cx-3} ${node.cy-10}L${node.cx+3} ${node.cy-10}L${node.cx+3} ${node.cy-5}`}
                      stroke="rgba(255,255,255,0.9)" 
                      strokeWidth="2"
                      fill="none"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: node.delay + 0.2 }}
                    />
                  )}
                </React.Fragment>
              ))}
              
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="brain_gradient" x1="120" y1="80" x2="480" y2="380" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366F1" />
                  <stop offset="0.5" stopColor="#8B5CF6" />
                  <stop offset="1" stopColor="#EC4899" />
                </linearGradient>
                <linearGradient id="core_gradient" x1="270" y1="200" x2="330" y2="260" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#60A5FA" />
                  <stop offset="1" stopColor="#7C3AED" />
                </linearGradient>
                <linearGradient id="line_gradient" x1="0%" y1="0%" x2="100%" y2="100%" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#93C5FD" />
                  <stop offset="1" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </svg>

            {/* Floating labels with names of features */}
            <motion.div 
              className="absolute text-xs text-white font-medium px-2 py-1 bg-indigo-600 bg-opacity-60 rounded-full top-8 left-2 backdrop-blur-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.4, duration: 0.5 }}
            >
              Grades
            </motion.div>
            
            <motion.div 
              className="absolute text-xs text-white font-medium px-2 py-1 bg-purple-600 bg-opacity-60 rounded-full top-8 right-2 backdrop-blur-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.5, duration: 0.5 }}
            >
              Language
            </motion.div>
            
            <motion.div 
              className="absolute text-xs text-white font-medium px-2 py-1 bg-indigo-600 bg-opacity-60 rounded-full bottom-8 left-2 backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.6, duration: 0.5 }}
            >
              Social
            </motion.div>
            
            <motion.div 
              className="absolute text-xs text-white font-medium px-2 py-1 bg-purple-600 bg-opacity-60 rounded-full bottom-8 right-2 backdrop-blur-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2.7, duration: 0.5 }}
            >
              Talents
            </motion.div>
          </div>
        </motion.div>

        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        >
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
            {t('welcome.title')}
          </h1>
          <p className="text-white text-opacity-80">{t('welcome.selectRole')}</p>
        </motion.div>
        
        <div className="space-y-8 mb-8">
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="inline-block w-1 h-6 bg-blue-400 rounded-full"></span>
              {t('roles.parent')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <RoleButton
                  role="parent"
                  icon={<Users className="h-5 w-5" />}
                  onClick={() => handleAuthAction('parent', 'login')}
                  label={t('auth.login')}
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <RoleButton
                  role="parent"
                  icon={<Users className="h-5 w-5" />}
                  onClick={() => handleAuthAction('parent', 'register')}
                  label={t('auth.register')}
                  variant="secondary"
                />
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="inline-block w-1 h-6 bg-purple-400 rounded-full"></span>
              {t('roles.teacher')}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <RoleButton
                  role="teacher"
                  icon={<GraduationCap className="h-5 w-5" />}
                  onClick={() => handleAuthAction('teacher', 'login')}
                  label={t('auth.login')}
                />
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <RoleButton
                  role="teacher"
                  icon={<GraduationCap className="h-5 w-5" />}
                  onClick={() => handleAuthAction('teacher', 'register')}
                  label={t('auth.register')}
                  variant="secondary"
                />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <UtilityBar
            selectedLanguage={i18n.language}
            onLanguageChange={handleLanguageChange}
            onHelpClick={() => setIsHelpModalOpen(true)}
          />
        </motion.div>

        {/* Feature highlights */}
        <motion.div 
          className="mt-6 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: animationComplete ? 1 : 0 }}
          transition={{ duration: 0.8 }}
        >
          {[
            { icon: <Brain className="h-4 w-4" />, text: "AI-Powered" },
            { icon: <Globe className="h-4 w-4" />, text: "Multilingual" },
            { icon: <Zap className="h-4 w-4" />, text: "Talent Tracking" },
            { icon: <BookOpen className="h-4 w-4" />, text: "Educational Insights" }
          ].map((feature, index) => (
            <motion.div 
              key={index}
              className="px-3 py-1 bg-white bg-opacity-10 backdrop-blur-sm rounded-full text-xs text-white flex items-center gap-1"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.8 }}
              transition={{ delay: 3 + (index * 0.15), duration: 0.5 }}
              whileHover={{ scale: 1.05, opacity: 1 }}
            >
              {feature.icon}
              <span>{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
