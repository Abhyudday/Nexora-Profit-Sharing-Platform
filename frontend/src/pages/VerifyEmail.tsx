import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '../utils/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }
    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      await api.post('/auth/verify-email', { token });
      setStatus('success');
      setMessage('Email verified successfully! You can now login.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Verification failed');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-slate-900">
      {/* Background Mesh Gradient */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[#0f172a]" />
        <div className="absolute top-[30%] left-[30%] w-[40%] h-[40%] rounded-full bg-brand-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="glass-card border-slate-700/50 bg-slate-800/50 backdrop-blur-2xl p-10 rounded-2xl shadow-2xl ring-1 ring-white/10">
          {status === 'loading' && (
            <>
              <div className="mx-auto w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mb-6">
                <Loader2 className="h-10 w-10 text-brand-500 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verifying Email...</h2>
              <p className="text-slate-400">Please wait while we verify your account.</p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verified!</h2>
              <p className="text-slate-300 mb-8">{message}</p>
              <Link to="/login" className="btn btn-primary w-full justify-center">
                Go to Login
              </Link>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6 ring-1 ring-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                <XCircle className="h-10 w-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Verification Failed</h2>
              <p className="text-red-300 mb-8">{message}</p>
              <Link to="/login" className="btn btn-secondary w-full justify-center">
                Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
