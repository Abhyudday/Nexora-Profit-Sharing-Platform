import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { setCredentials } from '../store/authSlice';

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await api.post('/auth/resend-verification', { email: unverifiedEmail });
      toast.success('Verification email sent! Please check your inbox.');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to resend verification email');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setEmailNotVerified(false);

    try {
      const { data } = await api.post('/auth/login', formData);
      dispatch(setCredentials({ user: data.user, token: data.token }));
      toast.success('Welcome back to Nexora!');
      navigate('/dashboard');
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.emailNotVerified) {
        setEmailNotVerified(true);
        setUnverifiedEmail(errorData.email);
      } else {
        toast.error(errorData?.error || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a]" />
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-600/20 blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card border-slate-700/50 bg-slate-800/50 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl ring-1 ring-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex justify-center mb-6 p-4 bg-slate-900/50 rounded-full ring-1 ring-white/10 shadow-lg">
              <img 
                src="/assets/nexora-logo.svg" 
                alt="Nexora Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-slate-400">Sign in to continue your trading journey</p>
          </div>

          {emailNotVerified && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-amber-200 font-medium">Email not verified</p>
                  <p className="text-xs text-amber-200/80 mt-1">
                    Please check your inbox for the verification link.
                  </p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={resending}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 ${resending ? 'animate-spin' : ''}`} />
                    {resending ? 'Sending...' : 'Resend verification email'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="email"
                  required
                  className="input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-slate-300">
                  Password
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-xs font-medium text-brand-400 hover:text-brand-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="password"
                  required
                  className="input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 text-lg shadow-glow hover:shadow-glow-accent transition-all duration-300"
            >
              {loading ? (
                <RefreshCw className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-5 w-5 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-slate-400 text-sm">
              Don't have an account?{' '}
              <Link to="/register" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
