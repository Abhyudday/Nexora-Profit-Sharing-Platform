import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  Wallet, Users, TrendingUp, Gift, LogOut, Copy, 
  ArrowUpRight, ArrowDownLeft, X, Menu,
  LayoutDashboard, ChevronRight, Bell, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { RootState } from '../store/store';
import { logout } from '../store/authSlice';

export default function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  
  // Modals state
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showBonusBreakdown, setShowBonusBreakdown] = useState(false);
  const [showNetworkTreeModal, setShowNetworkTreeModal] = useState(false);
  
  // Forms & Data state
  const [depositForm, setDepositForm] = useState({ amount: '', walletAddress: '', txHash: '' });
  const [withdrawForm, setWithdrawForm] = useState({ amount: '', walletAddress: '' });
  const [depositWalletInfo, setDepositWalletInfo] = useState<any>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [withdrawalTimeStatus, setWithdrawalTimeStatus] = useState<any>(null);
  const [bonusBreakdown, setBonusBreakdown] = useState<any>(null);
  const [networkTree, setNetworkTree] = useState<any>(null);
  
  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data } = await api.get('/user/dashboard');
      setDashboardData(data);
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositWallet = async () => {
    setLoadingWallet(true);
    try {
      const { data } = await api.get('/config/deposit-wallet');
      setDepositWalletInfo(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch deposit wallet');
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchWithdrawalTimeStatus = async () => {
    try {
      const { data } = await api.get('/config/withdrawal-time-window');
      setWithdrawalTimeStatus(data);
      return data;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch withdrawal status');
      return null;
    }
  };

  const fetchBonusBreakdown = async () => {
    try {
      const { data } = await api.get('/user/daily-bonus-breakdown');
      setBonusBreakdown(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch bonus breakdown');
    }
  };

  const fetchNetworkTree = async () => {
    try {
      const { data } = await api.get('/user/network-tree');
      setNetworkTree(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch network tree');
    }
  };

  const handleOpenNetworkTree = () => {
    setShowNetworkTreeModal(true);
    fetchNetworkTree();
  };

  useEffect(() => {
    if (showBonusBreakdown) {
      fetchBonusBreakdown();
    }
  }, [showBonusBreakdown]);

  const handleOpenDepositModal = () => {
    setShowDepositModal(true);
    fetchDepositWallet();
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transactions/deposit', depositForm);
      toast.success('Deposit request submitted successfully!');
      setShowDepositModal(false);
      setDepositForm({ amount: '', walletAddress: '', txHash: '' });
      fetchDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit deposit');
    }
  };

  const handleOpenWithdrawModal = async () => {
    const timeStatus = await fetchWithdrawalTimeStatus();
    if (!timeStatus?.isEnabled) {
      toast.error(timeStatus?.message || 'Withdrawals are currently disabled');
      return;
    }
    setShowWithdrawModal(true);
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/transactions/withdrawal', withdrawForm);
      toast.success('Withdrawal request submitted successfully!');
      setShowWithdrawModal(false);
      setWithdrawForm({ amount: '', walletAddress: '' });
      fetchDashboard();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit withdrawal');
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/register?ref=${dashboardData?.user?.referralCode}`;
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied!');
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600 mb-4"></div>
          <p className="text-slate-500 font-medium animate-pulse">Loading Nexora Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 fixed h-full z-30 flex flex-col border-r border-slate-800`}
      >
        <div className="p-6 flex items-center justify-center border-b border-slate-800">
          <img 
            src="/assets/nexora-logo.svg" 
            alt="Nexora" 
            className={`h-10 transition-all ${sidebarOpen ? 'w-auto' : 'w-10'}`} 
          />
          {sidebarOpen && <span className="ml-3 font-display font-bold text-xl tracking-tight">NEXORA</span>}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            isActive={true} 
            isOpen={sidebarOpen} 
          />
          <NavItem 
            icon={<Wallet />} 
            label="Transactions" 
            isOpen={sidebarOpen} 
          />
          <NavItem 
            icon={<Users />} 
            label="Network" 
            onClick={handleOpenNetworkTree}
            isOpen={sidebarOpen} 
          />
          {user?.isAdmin && (
            <NavItem 
              icon={<Menu />} 
              label="Admin Panel" 
              onClick={() => navigate('/admin')}
              isOpen={sidebarOpen} 
              className="text-accent-400 hover:bg-accent-500/10 hover:text-accent-400"
            />
          )}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={handleLogout}
            className={`flex items-center w-full p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${!sidebarOpen && 'justify-center'}`}
          >
            <LogOut className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3 font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
          <div className="flex justify-between items-center px-8 py-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-4 py-2 w-64">
                <Search className="h-4 w-4 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  className="bg-transparent border-none focus:outline-none text-sm w-full text-slate-600 placeholder-slate-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
                <div className="text-right hidden md:block">
                  <p className="text-sm font-semibold text-slate-900">{user?.username}</p>
                  <p className="text-xs text-slate-500">{user?.email}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">Dashboard Overview</h1>
              <p className="text-slate-500 mt-1">Here's what's happening with your portfolio today.</p>
            </div>
            <div className="flex gap-3">
              <button onClick={handleOpenDepositModal} className="btn btn-primary">
                <ArrowDownLeft className="h-5 w-5" />
                Deposit
              </button>
              <button onClick={handleOpenWithdrawModal} className="btn btn-secondary">
                <ArrowUpRight className="h-5 w-5" />
                Withdraw
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label="Total Balance" 
              value={`$${dashboardData?.user?.balance?.toFixed(2) || '0.00'}`}
              icon={<Wallet className="h-6 w-6 text-white" />}
              gradient="from-brand-600 to-brand-400"
              subValue="Available Funds"
            />
            <StatCard 
              label="Direct Referrals" 
              value={dashboardData?.stats?.directReferrals || 0}
              icon={<Users className="h-6 w-6 text-white" />}
              gradient="from-purple-600 to-purple-400"
              subValue="Active Members"
            />
            <StatCard 
              label="Yesterday's Profit" 
              value={`${dashboardData?.stats?.yesterdayProfitPercent?.toFixed(2) || '0.00'}%`}
              icon={<TrendingUp className="h-6 w-6 text-white" />}
              gradient="from-emerald-500 to-teal-400"
              subValue="Trading Performance"
            />
            <StatCard 
              label="Daily Bonus" 
              value={`$${dashboardData?.stats?.todayBonus?.toFixed(2) || '0.00'}`}
              icon={<Gift className="h-6 w-6 text-white" />}
              gradient="from-accent-500 to-accent-400"
              subValue="Click for Breakdown"
              onClick={() => setShowBonusBreakdown(true)}
              cursor="cursor-pointer"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Quick Actions & Referral */}
            <div className="lg:col-span-1 space-y-8">
              <div className="card">
                <h3 className="heading-lg mb-4 text-xl">Referral Program</h3>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                  <p className="text-sm text-slate-500 mb-2">Your Unique Referral Link</p>
                  <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/register?ref=${dashboardData?.user?.referralCode}`}
                      className="flex-1 text-xs text-slate-600 bg-transparent border-none focus:ring-0"
                    />
                    <button onClick={copyReferralLink} className="p-2 text-brand-600 hover:bg-brand-50 rounded-md transition-colors">
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-slate-500">Referral Code:</span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded">{dashboardData?.user?.referralCode}</span>
                </div>
              </div>

              <div className="card cursor-pointer group" onClick={handleOpenNetworkTree}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="heading-lg text-xl">Network Status</h3>
                  <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-brand-600 transition-colors" />
                </div>
                <div className="space-y-4">
                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600 text-sm">Member Level</span>
                      <span className="font-bold text-brand-600 bg-brand-50 px-3 py-1 rounded-full text-xs border border-brand-100">
                        {dashboardData?.user?.level}
                      </span>
                   </div>
                   <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-slate-600 text-sm">Network Volume</span>
                      <span className="font-bold text-slate-900">${dashboardData?.stats?.totalNetworkBalance?.toFixed(2) || '0.00'}</span>
                   </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="lg:col-span-2">
              <div className="card h-full">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="heading-lg text-xl">Recent Transactions</h3>
                  <button className="text-sm text-brand-600 font-medium hover:text-brand-700">View All</button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="text-xs text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        <th className="pb-3 pl-2 font-semibold">Type</th>
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 pr-2 text-right font-semibold">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {dashboardData?.recentTransactions?.slice(0, 5).map((tx: any) => (
                        <tr key={tx.id} className="group hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                          <td className="py-4 pl-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg ${
                                tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' :
                                tx.type === 'WITHDRAWAL' ? 'bg-red-100 text-red-600' :
                                tx.type === 'PROFIT' ? 'bg-blue-100 text-blue-600' :
                                'bg-purple-100 text-purple-600'
                              }`}>
                                {tx.type === 'DEPOSIT' ? <ArrowDownLeft className="h-4 w-4" /> :
                                 tx.type === 'WITHDRAWAL' ? <ArrowUpRight className="h-4 w-4" /> :
                                 tx.type === 'PROFIT' ? <TrendingUp className="h-4 w-4" /> :
                                 <Gift className="h-4 w-4" />}
                              </div>
                              <span className="font-medium text-slate-900 capitalize">{tx.type.toLowerCase()}</span>
                            </div>
                          </td>
                          <td className="py-4 text-slate-500">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                              tx.status === 'COMPLETED' || tx.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                              tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                          <td className={`py-4 pr-2 text-right font-bold ${
                            tx.type === 'WITHDRAWAL' || (tx.type === 'PROFIT' && tx.amount < 0) ? 'text-slate-900' : 'text-green-600'
                          }`}>
                            {tx.type === 'WITHDRAWAL' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                      {(!dashboardData?.recentTransactions || dashboardData.recentTransactions.length === 0) && (
                         <tr>
                           <td colSpan={4} className="py-8 text-center text-slate-500">
                             No transactions found.
                           </td>
                         </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals - Keep existing logic but update UI styles */}
      {showDepositModal && (
        <ModalWrapper title="Deposit Funds" onClose={() => setShowDepositModal(false)}>
          {/* ... Deposit Form Content ... */}
           {loadingWallet ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600 mx-auto" />
                <p className="mt-3 text-slate-600">Loading payment information...</p>
              </div>
            ) : depositWalletInfo ? (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-brand-50 to-blue-50 rounded-xl p-6 border border-brand-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Wallet className="h-5 w-5 text-brand-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">Send {depositWalletInfo.tokenName}</h4>
                      <p className="text-xs text-slate-500">Network: {depositWalletInfo.network}</p>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg p-4 border border-brand-100 shadow-sm mb-4">
                    <p className="text-xs text-slate-500 mb-1">Admin Wallet Address</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm font-mono text-slate-700 break-all">{depositWalletInfo.walletAddress}</code>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(depositWalletInfo.walletAddress);
                          toast.success('Address copied!');
                        }}
                        className="text-brand-600 hover:text-brand-700"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
                    <div className="shrink-0 mt-0.5">⚠️</div>
                    <p>Only send {depositWalletInfo.tokenName} on the {depositWalletInfo.network} network. Sending other tokens will result in permanent loss.</p>
                  </div>
                </div>

                <form onSubmit={handleDeposit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount Sent ({depositWalletInfo.tokenName})</label>
                    <input
                      type="number"
                      required
                      step="0.0001"
                      className="input"
                      placeholder="0.00"
                      value={depositForm.amount}
                      onChange={(e) => setDepositForm({ ...depositForm, amount: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Wallet Address</label>
                    <input
                      type="text"
                      required
                      className="input"
                      placeholder="0x..."
                      value={depositForm.walletAddress}
                      onChange={(e) => setDepositForm({ ...depositForm, walletAddress: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Transaction Hash</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="TxHash (Optional)"
                      value={depositForm.txHash}
                      onChange={(e) => setDepositForm({ ...depositForm, txHash: e.target.value })}
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => setShowDepositModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                    <button type="submit" className="btn btn-primary flex-1">Submit Request</button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-red-500 mb-4">Wallet information unavailable.</p>
                <button onClick={() => setShowDepositModal(false)} className="btn btn-secondary">Close</button>
              </div>
            )}
        </ModalWrapper>
      )}

      {showWithdrawModal && (
        <ModalWrapper title="Withdraw Funds" onClose={() => setShowWithdrawModal(false)}>
           {withdrawalTimeStatus && (
              <div className={`mb-6 p-4 rounded-xl border ${withdrawalTimeStatus.isEnabled ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex gap-3">
                  <div className="shrink-0">
                    {withdrawalTimeStatus.isEnabled ? <div className="h-2 w-2 rounded-full bg-green-500 mt-2" /> : <div className="h-2 w-2 rounded-full bg-amber-500 mt-2" />}
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${withdrawalTimeStatus.isEnabled ? 'text-green-800' : 'text-amber-800'}`}>
                      {withdrawalTimeStatus.isEnabled ? 'Withdrawals Enabled' : 'Withdrawals Paused'}
                    </h4>
                    <p className="text-xs text-slate-600 mt-1">Window: {withdrawalTimeStatus.timeWindow} (GMT+7)</p>
                    <p className="text-xs text-slate-600">Min Amount: ${withdrawalTimeStatus.minWithdrawal || 10}</p>
                  </div>
                </div>
              </div>
            )}
            
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Amount (USDT)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400">$</span>
                  <input
                    type="number"
                    required
                    min="10"
                    step="0.01"
                    className="input pl-8"
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({ ...withdrawForm, amount: e.target.value })}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs">
                  <span className="text-slate-500">Available: ${dashboardData?.user?.balance?.toFixed(2)}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">TRC20 Wallet Address</label>
                <input
                  type="text"
                  required
                  className="input"
                  placeholder="T..."
                  value={withdrawForm.walletAddress}
                  onChange={(e) => setWithdrawForm({ ...withdrawForm, walletAddress: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowWithdrawModal(false)} className="btn btn-secondary flex-1">Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Request Withdrawal</button>
              </div>
            </form>
        </ModalWrapper>
      )}

      {showBonusBreakdown && (
        <ModalWrapper title="Daily Bonus History" onClose={() => setShowBonusBreakdown(false)} maxWidth="max-w-3xl">
          {bonusBreakdown ? (
            <div className="space-y-6">
               <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
                  <p className="text-purple-100 text-sm">Total Bonus Today</p>
                  <h3 className="text-4xl font-bold mt-1">${bonusBreakdown.totalDailyBonus?.toFixed(2) || '0.00'}</h3>
                  <p className="text-xs text-purple-200 mt-2">{new Date(bonusBreakdown.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
               </div>

               <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
                 {bonusBreakdown.bonuses?.length > 0 ? (
                   bonusBreakdown.bonuses.map((bonus: any, idx: number) => (
                     <div key={idx} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm flex justify-between items-center">
                       <div>
                         <p className="font-bold text-slate-800">{bonus.bonusType}</p>
                         <p className="text-xs text-slate-500">{bonus.description || 'Level Bonus'}</p>
                       </div>
                       <div className="text-right">
                         <span className="block font-bold text-green-600">+${bonus.bonusAmount.toFixed(2)}</span>
                         <span className="text-xs text-slate-400">{new Date(bonus.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                     <Gift className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                     <p className="text-slate-500">No bonuses received today yet.</p>
                   </div>
                 )}
               </div>
            </div>
          ) : (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
            </div>
          )}
        </ModalWrapper>
      )}

      {showNetworkTreeModal && (
        <ModalWrapper title="Network Hierarchy" onClose={() => setShowNetworkTreeModal(false)} maxWidth="max-w-6xl">
           {networkTree ? (
             <div className="space-y-6">
               <div className="flex items-center gap-4 p-4 bg-brand-50 rounded-xl border border-brand-100">
                 <div className="h-12 w-12 bg-brand-100 rounded-full flex items-center justify-center text-brand-600 font-bold text-xl">
                   {networkTree.root?.username?.charAt(0)}
                 </div>
                 <div>
                   <h4 className="font-bold text-slate-900">{networkTree.root?.username} (You)</h4>
                   <p className="text-xs text-slate-500">Rank: <span className="text-brand-600 font-semibold">{networkTree.root?.ranking}</span> • ID: {networkTree.root?.id}</p>
                 </div>
                 <div className="ml-auto text-right">
                   <p className="text-xs text-slate-500">Total Network Balance</p>
                   <p className="text-xl font-bold text-slate-900">${dashboardData?.stats?.totalNetworkBalance?.toFixed(2)}</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto">
                 {networkTree.levels?.map((level: any) => (
                   <div key={level.level} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                     <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex justify-between items-center">
                       <span className="font-bold text-slate-700">Level {level.level}</span>
                       <span className="text-xs bg-slate-200 px-2 py-1 rounded text-slate-600">{level.count} Members</span>
                     </div>
                     <div className="p-2 space-y-2 max-h-64 overflow-y-auto">
                       {level.users.map((u: any) => (
                         <div key={u.id} className="flex justify-between items-center p-2 hover:bg-slate-50 rounded-lg transition-colors text-sm">
                           <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                             <div>
                               <p className="font-medium text-slate-800">{u.username}</p>
                               <p className="text-[10px] text-slate-400">{u.ranking}</p>
                             </div>
                           </div>
                           <span className={`font-medium ${u.balance > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                             ${u.balance.toFixed(2)}
                           </span>
                         </div>
                       ))}
                       {level.users.length === 0 && <p className="text-xs text-center text-slate-400 py-2">No members</p>}
                     </div>
                   </div>
                 ))}
               </div>
             </div>
           ) : (
             <div className="flex justify-center py-12">
               <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
             </div>
           )}
        </ModalWrapper>
      )}

    </div>
  );
}

// Subcomponents
function NavItem({ icon, label, isActive, onClick, isOpen, className }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 ${
        isActive 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      } ${!isOpen && 'justify-center'} ${className}`}
      title={!isOpen ? label : ''}
    >
      <span className="shrink-0">{icon}</span>
      {isOpen && <span className="ml-3 font-medium whitespace-nowrap">{label}</span>}
    </button>
  );
}

function StatCard({ label, value, icon, gradient, subValue, onClick, cursor }: any) {
  return (
    <div 
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-card border border-slate-100 hover:shadow-lg transition-all duration-300 ${cursor || ''}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-slate-500 text-sm font-medium">{label}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-gray-200`}>
          {icon}
        </div>
      </div>
      <div className="flex items-center text-xs text-slate-400">
        <span className="bg-slate-100 px-2 py-1 rounded text-slate-600 font-medium mr-2">
          {subValue}
        </span>
      </div>
    </div>
  );
}

function ModalWrapper({ title, children, onClose, maxWidth = 'max-w-lg' }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxWidth} flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200`}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return <RefreshCw className={className} />; 
}
const RefreshCw = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" height="24" viewBox="0 0 24 24" 
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
    className={className}
  >
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M3 21v-5h5" />
  </svg>
);
