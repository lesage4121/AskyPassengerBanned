import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react'; 
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');             
  const [password, setPassword] = useState('');       
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(''); 

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Incorrect email or password');
      }
    } catch (error) {
      setError('An error occurred while connecting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img 
          src="\asky_background.jpg" 
          alt="Avion ASKY" 
          className="w-full h-full object-cover object-center "
        />
        <div className="absolute inset-0 bg-gradient-to-br from-asky-orange-800/70 via-asky-brown-900/80 to-gray-900/90 dark:from-gray-800/80 dark:via-asky-brown-800/90 dark:to-black/95"></div>
      </div>
      
      <div className="max-w-md w-full space-y-7 p-8">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white drop-shadow-lg">PassBanned</h2>
        </div>

        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 relative z-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
               E-mail address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  required
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-asky-orange-500"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-10 w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-asky-brown-600 hover:bg-asky-brown-700 focus:ring-2 focus:ring-offset-2 focus:ring-asky-brown-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? 'Connecting...' : 'Log in'}
            </button>
          </form>       
        </div>
      </div>
    </div>
  );
}

export default Login;
