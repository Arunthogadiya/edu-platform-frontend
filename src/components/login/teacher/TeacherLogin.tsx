import React, { useState } from 'react';
import { Mail, Key, School, Phone, ArrowLeft, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';

const TeacherLogin = () => {
  const [loginMethod, setLoginMethod] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [phone, setPhone] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [multiDeviceAlert, setMultiDeviceAlert] = useState(false);

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulate 2FA trigger
    setShowTwoFactor(true);
  };

  const handleTwoFactorSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulate multi-device detection
    setMultiDeviceAlert(true);
  };

  const renderLoginForm = () => {
    switch (loginMethod) {
      case 'email':
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your.email@school.edu"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Login
            </button>
          </form>
        );
      case 'school':
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School ID</label>
              <div className="relative">
                <School className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={schoolId}
                  onChange={(e) => setSchoolId(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your school ID"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>
        );
      case 'phone':
        return (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your phone number"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Send OTP
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  const renderTwoFactor = () => (
    <form onSubmit={handleTwoFactorSubmit} className="space-y-4">
      <div className="text-center mb-4">
        <Mail className="mx-auto h-12 w-12 text-green-500 mb-2" />
        <h2 className="text-xl font-semibold">Check your email</h2>
        <p className="text-gray-600">We've sent a verification code to your email</p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Verification Code</label>
        <input
          type="text"
          value={twoFactorCode}
          onChange={(e) => setTwoFactorCode(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter 6-digit code"
          maxLength={6}
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Verify
      </button>
    </form>
  );

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6 bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Login</h1>
        </div>

        {multiDeviceAlert && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertCircle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              You are logged in on another device. Would you like to continue?
            </AlertDescription>
          </Alert>
        )}

        {!showTwoFactor ? (
          <>
            <div className="flex space-x-4 border-b border-gray-200">
              {[
                { id: 'email', label: 'Email' },
                { id: 'school', label: 'School ID' },
                { id: 'phone', label: 'Phone' }
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setLoginMethod(method.id)}
                  className={`pb-2 px-1 ${
                    loginMethod === method.id
                      ? 'border-b-2 border-green-500 text-green-600 font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>

            {renderLoginForm()}

            <div className="text-center">
              <button className="text-blue-600 hover:text-blue-800 text-sm">
                Forgot password?
              </button>
            </div>
          </>
        ) : (
          renderTwoFactor()
        )}
      </div>
    </div>
  );
};

export default TeacherLogin;