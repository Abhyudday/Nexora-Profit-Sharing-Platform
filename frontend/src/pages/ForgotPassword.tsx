import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

export default function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
      toast.success('Password reset instructions sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a]" />
        <div className="absolute top-[-20%] left-[20%] w-[50%] h-[50%] rounded-full bg-brand-600/10 blur-[100px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[30%] h-[30%] rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card border-slate-700/50 bg-slate-800/50 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl ring-1 ring-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Forgot Password</h1>
            <p className="text-slate-400">
              {submitted 
                ? "Check your email for instructions" 
                : "Enter your email to reset your password"}
            </p>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-lg shadow-glow hover:shadow-glow-accent transition-all duration-300"
              >
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6 mb-6 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <p className="text-sm text-green-200">
                If an account exists with <strong>{email}</strong>, you will receive password reset instructions shortly.
              </p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
