import React, { useState } from 'react';
import { Mail, Lock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui/alert';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <p className="text-red-800">{error}</p>
        </Alert>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
      >
        {isLoading ? 'Signing in...' : 'Sign in'}
      </button>

      {role === 'teacher' && (
        <div className="mt-4 text-sm text-gray-600">
          {/* <p className="font-medium">Demo credentials:</p>
          <p>Email: teacher1@school.com</p>
          <p>Password: teacher123</p> */}
        </div>
      )}

      {role === 'parent' && (
        <div className="mt-4 text-sm text-gray-600">
          {/* <p className="font-medium">Demo credentials:</p>
          <p>Email: parent@example.com</p>
          <p>Password: parent123</p> */}
        </div>
      )}
    </form>
  );
};