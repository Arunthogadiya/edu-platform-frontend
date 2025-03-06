import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/alert';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LoginFormProps {
  role: 'parent' | 'teacher';
  onSuccess: (data: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ role, onSuccess }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError('');
    setIsLoading(true);

    try {
      const response = await authService.login({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        role: role // Explicitly pass the role
      });

      onSuccess(response);

      // Navigate based on role
      navigate(role === 'teacher' ? '/teacher/dashboard' : '/parent/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <label className="block text-sm font-medium text-blue-100 mb-1">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 w-full p-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-300"
            placeholder="Enter your email"
            required
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <label className="block text-sm font-medium text-blue-100 mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 w-full p-2 border border-white/20 bg-white/10 backdrop-blur-sm rounded-lg
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-300"
            placeholder="Enter your password"
            required
          />
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Alert variant="destructive" className="bg-red-800/50 border border-red-500/50 text-white">
            <p>{error}</p>
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
        transition={{ delay: 0.3 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            <span>Signing in...</span>
          </div>
        ) : (
          'Sign in'
        )}
      </motion.button>
    </form>
  );
};