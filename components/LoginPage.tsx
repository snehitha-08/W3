import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Logo = ({ isLogin }: { isLogin: boolean }) => (
  <div className="text-center text-[#4A4A4A] dark:text-gray-200">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#5E6D55]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3L2 12h3v8h14v-8h3L12 3z" />
      <path d="M9 21V15a1 1 0 011-1h4a1 1 0 011 1v6" />
    </svg>
    <h1 className="text-2xl font-bold tracking-wider mt-2">W3</h1>
    <p className="text-sm text-gray-500 dark:text-gray-400">Wish World Wonders</p>
  </div>
);

const LoginPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();

  const from = (location.state as any)?.from?.pathname || '/profile';

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  };
  
  const clearForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setPhone('');
    setAddress('');
    setError('');
  };

  const handleModeToggle = (mode: 'login' | 'signup') => {
    setIsLogin(mode === 'login');
    clearForm();
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (isLogin) {
      if (!email || !password) {
        setError('Please enter both email and password.');
        setIsLoading(false);
        return;
      }
      
      const result = await login(email, password);
      if (result.success && result.user) {
        if (result.user.isAdmin) {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      } else if (result.success) { // Fallback, just in case
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Login failed. Please try again.');
      }

    } else { // Sign up
      if (!fullName || !phone || !address || !email || !password) {
        setError('Please fill out all fields to sign up.');
        setIsLoading(false);
        return;
      }
      if (phone.length !== 10) {
        setError('Please enter a valid 10-digit phone number.');
        setIsLoading(false);
        return;
      }
      
// Fix: Added loyaltyPoints to the signup payload to satisfy the Required<UserWithPassword> type.
      const result = await signup({ fullName, email, password, phone, address, isAdmin: false, loyaltyPoints: 0 });
      if (result.success) {
        // Successful signup logs the user in automatically
        navigate(from, { replace: true });
      } else {
        setError(result.message || 'Sign up failed. Please try again.');
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex items-center justify-center p-4 min-h-screen">
      <div className="bg-[#F9F8F4] bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 backdrop-blur-sm p-8 md:p-12 rounded-[40px] shadow-2xl w-full max-w-md">
        <div className="mb-8">
          <Logo isLogin={isLogin} />
        </div>
        
        <div className="flex justify-center border-b-2 border-gray-200 dark:border-gray-700 mb-6">
            <button onClick={() => handleModeToggle('login')} className={`w-1/2 py-3 text-lg font-semibold transition-colors ${isLogin ? 'text-[#5E6D55] border-b-4 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}>Login</button>
            <button onClick={() => handleModeToggle('signup')} className={`w-1/2 py-3 text-lg font-semibold transition-colors ${!isLogin ? 'text-[#5E6D55] border-b-4 border-[#5E6D55]' : 'text-gray-500 dark:text-gray-400'}`}>Sign Up</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#5E6D55] focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" required />
              </div>
            </>
          )}
          <div>
            <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#5E6D55] focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" required />
          </div>
          <div>
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#5E6D55] focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" required />
          </div>
          {!isLogin && (
            <>
              <div>
                 <input type="tel" placeholder="10-digit Phone Number" value={phone} onChange={handlePhoneChange} className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#5E6D55] focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" required maxLength={10} pattern="\d{10}" />
              </div>
              <div>
                 <input type="text" placeholder="Default Delivery Address" value={address} onChange={(e) => setAddress(e.target.value)} className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-[#5E6D55] focus:outline-none dark:bg-gray-700 dark:text-white dark:placeholder-gray-400" required />
              </div>
            </>
          )}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button 
            type="submit" 
            className="w-full text-center bg-[#5E6D55] text-white font-semibold py-4 px-6 rounded-2xl text-lg hover:bg-[#4a5744] transition-all duration-300 shadow-lg mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading && (
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isLoading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-gray-600 hover:text-[#5E6D55] hover:underline dark:text-gray-400">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;