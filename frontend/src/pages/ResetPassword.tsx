import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, Check, RefreshCw, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link');
      navigate('/login');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword,
      });
      setSuccess(true);
      toast.success('Password reset successful!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a]" />
        <div className="absolute bottom-[20%] left-[10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="glass-card border-slate-700/50 bg-slate-800/50 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl ring-1 ring-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-display font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400">Create a new secure password</p>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">New Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    type="password"
                    required
                    className="input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500/20"
                    placeholder="Enter new password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 ml-1">Confirm Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                  <input
                    type="password"
                    required
                    className="input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500/20"
                    placeholder="Confirm new password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full py-3 text-lg shadow-glow hover:shadow-glow-accent transition-all duration-300"
              >
                {loading ? <RefreshCw className="h-5 w-5 animate-spin" /> : 'Reset Password'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Success!</h3>
              <p className="text-slate-400 mb-6">Your password has been reset successfully. Redirecting you to login...</p>
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
