import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, Gift, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

export default function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    referralCode: searchParams.get('ref') || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/register', formData);
      toast.success('Registration successful! Please check your email.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a]" />
        <div className="absolute top-[20%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent-500/10 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md my-8">
        <div className="glass-card border-slate-700/50 bg-slate-800/50 backdrop-blur-2xl p-8 rounded-2xl shadow-2xl ring-1 ring-white/10">
          <div className="text-center mb-8">
            <div className="inline-flex justify-center mb-6 p-4 bg-slate-900/50 rounded-full ring-1 ring-white/10 shadow-lg">
              <img 
                src="/assets/nexora-logo.svg" 
                alt="Nexora Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-3xl font-display font-bold text-white mb-2">Create Account</h1>
            <p className="text-slate-400">Join the future of algorithmic trading</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                Username
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="text"
                  required
                  className="input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="email"
                  required
                  className="input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                Phone
              </label>
              <div className="relative group">
                <Phone className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="tel"
                  required
                  className="input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="+1 234 567 890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">
                Referral Code <span className="text-slate-600 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative group">
                <Gift className="absolute left-4 top-3.5 h-5 w-5 text-slate-500 group-focus-within:text-brand-400 transition-colors" />
                <input
                  type="text"
                  className="input pl-12 bg-slate-900/50 border-slate-700 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-brand-500/20"
                  placeholder="Enter referral code"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({ ...formData, referralCode: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full py-3 mt-4 text-lg shadow-glow hover:shadow-glow-accent transition-all duration-300"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="h-5 w-5 ml-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-700/50 pt-6">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
