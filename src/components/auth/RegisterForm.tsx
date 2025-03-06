import React, { useState } from 'react';
import { Mail, Lock, User, Phone, School, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { authService, RegisterRequest } from '@/services/authService';
import { motion } from 'framer-motion';

interface RegisterFormProps {
  role: 'parent' | 'teacher';
  onSuccess: (data: any) => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ role, onSuccess }) => {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [studentId, setStudentId] = useState('');
  const [subject, setSubject] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const registerData: RegisterRequest = {
        name,
        email,
        password,
        role,
        language: i18n.language || 'en',
        phone,
        ...(role === 'parent' && { student_id: parseInt(studentId) }),
        ...(role === 'teacher' && { subject })
      };

      const response = await authService.register(registerData);
      onSuccess(response);
    } catch (err) {
      console.error('Registration error:', err);
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    {
      id: "name",
      label: t('auth.fullName'),
      icon: User,
      value: name,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
      type: "text",
      placeholder: t('auth.enterName'),
      required: true,
      delay: 0.1
    },
    {
      id: "email",
      label: t('auth.email'),
      icon: Mail,
      value: email,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
      type: "email",
      placeholder: t('auth.enterEmail'),
      required: true,
      delay: 0.15
    },
    {
      id: "password",
      label: t('auth.password'),
      icon: Lock,
      value: password,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value),
      type: "password",
      placeholder: t('auth.enterPassword'),
      required: true,
      delay: 0.2
    },
    {
      id: "phone",
      label: t('auth.phone'),
      icon: Phone,
      value: phone,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value),
      type: "tel",
      placeholder: t('auth.enterPhone'),
      required: true,
      delay: 0.25
    }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formFields.map((field) => (
        <motion.div
          key={field.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: field.delay }}
        >
          <label className="block text-sm font-medium text-blue-100 mb-1">{field.label}</label>
          <div className="relative">
            <field.icon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type={field.type}
              value={field.value}
              onChange={field.onChange}
              className="pl-10 w-full p-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-300"
              placeholder={field.placeholder}
              required={field.required}
            />
          </div>
        </motion.div>
      ))}

      {role === 'teacher' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-blue-100 mb-1">{t('auth.subject')}</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="pl-10 w-full p-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-300"
              placeholder={t('auth.enterSubject')}
              required
            />
          </div>
        </motion.div>
      )}

      {role === 'parent' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <label className="block text-sm font-medium text-blue-100 mb-1">{t('auth.studentId')}</label>
          <div className="relative">
            <School className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <input
              type="number"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              className="pl-10 w-full p-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg
                       focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-300"
              placeholder={t('auth.enterStudentId')}
              required
            />
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert className="bg-red-800/50 border border-red-500/50">
            <AlertDescription className="text-white">{error}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-600 hover:to-purple-600
                 text-white font-medium py-2.5 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]
                 disabled:opacity-50 shadow-lg"
        whileHover={{ boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)" }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            <span>{t('auth.registering')}</span>
          </div>
        ) : (
          t('auth.register')
        )}
      </motion.button>
    </form>
  );
};