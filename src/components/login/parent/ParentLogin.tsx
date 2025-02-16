import React, { useState, useEffect } from 'react';
import { Phone, School, ArrowLeft, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../../ui/alert';
import { useNavigate } from 'react-router-dom';
import { dummyParentData } from '../../../data/dummyParentData';

const ParentLogin = () => {
  const [loginMethod, setLoginMethod] = useState('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (loginSuccess && userData) {
      // Store auth state
      sessionStorage.setItem('isAuthenticated', 'true');
      // Store user data
      sessionStorage.setItem('userData', JSON.stringify(userData));
      
      const timer = setTimeout(() => {
        navigate('/parent/dashboard', { state: { userData } });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [loginSuccess, userData, navigate]);

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate against dummy data
    if (loginMethod === 'phone') {
      const user = dummyParentData.phones.find(p => p.phone === phoneNumber);
      if (user) {
        setUserData(user);
        setShowOTP(true);
        setResendTimer(30);
        setError('');
      } else {
        setError('Phone number not found');
      }
    } else {
      const user = dummyParentData.schoolIds.find(s => s.id === schoolId);
      if (user) {
        setUserData(user);
        setShowOTP(true);
        setResendTimer(30);
        setError('');
      } else {
        setError('School ID not found');
      }
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOTP = [...otp];
    newOTP[index] = value;
    setOtp(newOTP);

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }
    // For demo, accept any 6-digit code
    if (otpValue.length === 6) {
      sessionStorage.setItem('isAuthenticated', 'true');
      setLoginSuccess(true);
    }
  };

  const handleResendOTP = () => {
    setResendTimer(30);
    // Implement resend OTP logic here
  };

  const renderLoginForm = () => {
    switch (loginMethod) {
      case 'phone':
        return (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="pl-10 w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your mobile number"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Get OTP
            </button>
          </form>
        );
      case 'school':
        return (
          <form onSubmit={handleSendOTP} className="space-y-4">
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Continue
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  const renderOTPForm = () => (
    <form onSubmit={handleVerifyOTP} className="space-y-6">
      <div className="text-center">
        <Phone className="mx-auto h-12 w-12 text-blue-500 mb-2" />
        <h2 className="text-xl font-semibold">Enter verification code</h2>
        <p className="text-gray-600 mt-1">
          We've sent a 6-digit code to {phoneNumber}
        </p>
      </div>

      <div className="flex justify-center space-x-2">
        {otp.map((digit, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            value={digit}
            onChange={(e) => handleOTPChange(index, e.target.value)}
            onKeyDown={(e) => handleOTPKeyDown(index, e)}
            className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={1}
            pattern="[0-9]"
          />
        ))}
      </div>

      {error && (
        <Alert className="bg-red-50 border-red-200">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
      >
        Verify
      </button>

      <div className="text-center">
        {resendTimer > 0 ? (
          <div className="flex items-center justify-center text-gray-600">
            <Clock className="h-4 w-4 mr-1" />
            Resend OTP in {resendTimer}s
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResendOTP}
            className="text-blue-600 hover:text-blue-800"
          >
            Resend OTP
          </button>
        )}
      </div>
    </form>
  );

  return (
    <div className="min-h-screen w-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto space-y-6 bg-white p-8 rounded-xl shadow-lg">
        {loginSuccess ? (
          <div className="text-center space-y-3">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="text-xl font-semibold text-gray-900">Login Successful!</h2>
            <p className="text-gray-600">Redirecting to dashboard...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <button 
                onClick={() => {
                  if (showOTP) {
                    setShowOTP(false);
                    setOtp(['', '', '', '', '', '']);
                    setError('');
                  } else {
                    window.history.back();
                  }
                }}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5 mr-1" />
                {showOTP ? 'Change Number' : 'Back'}
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Parent Login</h1>
            </div>

            {error && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {!showOTP ? (
              <>
                <div className="flex space-x-4 border-b border-gray-200">
                  {[
                    { id: 'phone', label: 'Phone' },
                    { id: 'school', label: 'School ID' }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setLoginMethod(method.id)}
                      className={`pb-2 px-1 ${
                        loginMethod === method.id
                          ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>

                {renderLoginForm()}
              </>
            ) : (
              renderOTPForm()
            )}
          </>
        )}

        {!showOTP && (
          <div className="text-center">
            <button className="text-blue-600 hover:text-blue-800 text-sm">
              Contact school admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentLogin;