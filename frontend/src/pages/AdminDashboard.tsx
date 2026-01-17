import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, DollarSign, TrendingUp, ArrowLeft, 
  X, Calendar, Settings,
  Menu, Search, Filter, Shield, Download,
  LayoutDashboard, FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  
  // Data State
  const [stats, setStats] = useState<any>(null);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'members'>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals State
  const [showTradingModal, setShowTradingModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [selectedDeposit, setSelectedDeposit] = useState<any>(null);

  // Forms
  const [depositWallet, setDepositWallet] = useState('');
  const [tradingForm, setTradingForm] = useState({
    profitPercent: '',
    tradingDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  useEffect(() => {
    fetchData();
    fetchAllUsers();
    fetchRecentTransactions();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, depositsRes, withdrawalsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/deposits/pending'),
        api.get('/admin/withdrawals/pending'),
      ]);
      setStats(statsRes.data);
      setPendingDeposits(depositsRes.data);
      setPendingWithdrawals(withdrawalsRes.data);
    } catch (error) {
      toast.error('Failed to fetch admin data');
    }
  };

  const fetchAllUsers = async () => {
    try {
      const { data } = await api.get('/admin/users?limit=100');
      setAllUsers(data.users);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };
  
  const fetchRecentTransactions = async () => {
    try {
      const { data } = await api.get('/admin/transactions/recent?limit=100');
      setRecentTransactions(data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch recent transactions');
    }
  };

  // ... (Keep existing handler functions largely the same, just condensed here for brevity)
  const handleApproveDeposit = async (id: string) => {
    try {
      await api.post(`/admin/deposits/${id}/approve`);
      toast.success('Deposit approved!');
      fetchData();
      setSelectedDeposit(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve deposit');
    }
  };

  const handleApproveWithdrawal = async (id: string) => {
    try {
      await api.post(`/admin/withdrawals/${id}/approve`, { txHash: '' });
      toast.success('Withdrawal approved!');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve withdrawal');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      await api.post(`/admin/transactions/${id}/reject`, { reason });
      toast.success('Transaction rejected!');
      fetchData();
      setSelectedDeposit(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject transaction');
    }
  };

  const handleSubmitTrading = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/admin/trading-result', tradingForm);
      toast.success('Trading result saved!');
      if (window.confirm('Distribute profit to all users now?')) {
        await api.post(`/admin/trading-result/${data.tradingResult.id}/distribute`);
        toast.success('Profit distributed!');
      }
      setShowTradingModal(false);
      setTradingForm({ profitPercent: '', tradingDate: new Date().toISOString().split('T')[0], description: '' });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save trading result');
    }
  };


  const fetchDepositWallet = async () => {
    try {
      const { data } = await api.get('/config/deposit-wallet');
      setDepositWallet(data.walletAddress);
    } catch (error) { setDepositWallet(''); }
  };

  const handleUpdateWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/config/deposit-wallet', { walletAddress: depositWallet });
      toast.success('Deposit wallet updated!');
      setShowWalletModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update wallet');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Admin Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 fixed h-full z-30 flex flex-col border-r border-slate-800`}>
        <div className="p-6 flex items-center justify-center border-b border-slate-800 bg-slate-900">
           <div className={`p-2 rounded bg-red-600/10 border border-red-500/20 ${sidebarOpen ? 'mr-3' : ''}`}>
             <Shield className="h-6 w-6 text-red-500" />
           </div>
           {sidebarOpen && <span className="font-display font-bold text-lg tracking-tight">NEXORA <span className="text-red-500">ADMIN</span></span>}
        </div>

        <nav className="flex-1 py-6 px-3 space-y-2">
          <NavItem 
            icon={<LayoutDashboard />} 
            label="Overview" 
            isActive={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')}
            isOpen={sidebarOpen} 
          />
          <NavItem 
            icon={<FileText />} 
            label="Transactions" 
            isActive={activeTab === 'transactions'} 
            onClick={() => setActiveTab('transactions')}
            isOpen={sidebarOpen} 
            badge={pendingDeposits.length + pendingWithdrawals.length}
          />
          <NavItem 
            icon={<Users />} 
            label="Member Network" 
            isActive={activeTab === 'members'} 
            onClick={() => setActiveTab('members')}
            isOpen={sidebarOpen} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => navigate('/dashboard')}
            className={`flex items-center w-full p-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors ${!sidebarOpen && 'justify-center'}`}
          >
            <ArrowLeft className="h-5 w-5" />
            {sidebarOpen && <span className="ml-3 font-medium">Back to App</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
             <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <Menu className="h-6 w-6" />
             </button>
             <h1 className="text-xl font-display font-bold text-slate-900">
               {activeTab === 'overview' ? 'Admin Overview' : 
                activeTab === 'transactions' ? 'Transaction Management' : 'Member Management'}
             </h1>
          </div>
          
          <div className="flex gap-3">
            <button 
              onClick={() => setShowTradingModal(true)} 
              className="btn bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-sm shadow-sm"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Input Trading
            </button>
            <button 
              onClick={() => { fetchDepositWallet(); setShowWalletModal(true); }} 
              className="btn bg-slate-900 text-white hover:bg-slate-800 text-sm shadow-lg shadow-slate-900/20"
            >
              <Settings className="h-4 w-4 mr-2" />
              Config
            </button>
          </div>
        </header>

        <main className="p-8 max-w-7xl mx-auto space-y-8">
          
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AdminStatCard label="Total Users" value={stats?.totalUsers || 0} icon={<Users />} color="text-blue-600" bg="bg-blue-50" />
                <AdminStatCard label="Total Balance" value={`$${stats?.totalBalance?.toFixed(2) || '0.00'}`} icon={<DollarSign />} color="text-green-600" bg="bg-green-50" />
                <AdminStatCard label="Net Deposit" value={`$${stats?.netDeposit?.toFixed(2) || '0.00'}`} icon={<TrendingUp />} color="text-brand-600" bg="bg-brand-50" />
                <AdminStatCard label="Total Withdrawals" value={`$${stats?.totalWithdrawals?.toFixed(2) || '0.00'}`} icon={<ArrowLeft className="rotate-45" />} color="text-red-600" bg="bg-red-50" />
              </div>

              {/* Quick Actions / Pendings */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                 <div className="card">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-yellow-500"></div> Pending Deposits
                    </h3>
                    {pendingDeposits.length > 0 ? (
                       <div className="space-y-3">
                         {pendingDeposits.slice(0, 5).map(tx => (
                           <div key={tx.id} onClick={() => setSelectedDeposit(tx)} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-100">
                              <div>
                                 <p className="font-semibold text-slate-900">{tx.user.username}</p>
                                 <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                 <p className="font-bold text-green-600">+${tx.amount.toFixed(2)}</p>
                                 <p className="text-xs text-brand-600 font-medium">Review</p>
                              </div>
                           </div>
                         ))}
                         {pendingDeposits.length > 5 && (
                           <button onClick={() => setActiveTab('transactions')} className="w-full py-2 text-sm text-center text-brand-600 hover:bg-brand-50 rounded-lg">View All Pending</button>
                         )}
                       </div>
                    ) : (
                       <div className="text-center py-8 text-slate-400">No pending deposits</div>
                    )}
                 </div>

                 <div className="card">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <div className="h-2 w-2 rounded-full bg-orange-500"></div> Pending Withdrawals
                    </h3>
                    {pendingWithdrawals.length > 0 ? (
                       <div className="space-y-3">
                         {pendingWithdrawals.slice(0, 5).map(tx => (
                           <div key={tx.id} className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors border border-slate-100">
                              <div>
                                 <p className="font-semibold text-slate-900">{tx.user.username}</p>
                                 <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                              </div>
                              <div className="text-right">
                                 <p className="font-bold text-slate-900">${tx.amount.toFixed(2)}</p>
                                 <p className="text-xs text-brand-600 font-medium">Review</p>
                              </div>
                           </div>
                         ))}
                          {pendingWithdrawals.length > 5 && (
                           <button onClick={() => setActiveTab('transactions')} className="w-full py-2 text-sm text-center text-brand-600 hover:bg-brand-50 rounded-lg">View All Pending</button>
                         )}
                       </div>
                    ) : (
                       <div className="text-center py-8 text-slate-400">No pending withdrawals</div>
                    )}
                 </div>
              </div>
            </>
          )}

          {/* Transactions Tab */}
          {activeTab === 'transactions' && (
             <div className="card overflow-hidden">
                <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input type="text" placeholder="Search transactions..." className="input py-2 pl-9 text-sm" />
                  </div>
                  <div className="flex gap-2">
                    <button className="btn btn-secondary py-2 text-sm"><Filter className="h-4 w-4 mr-2" /> Filter</button>
                    <button className="btn btn-secondary py-2 text-sm"><Download className="h-4 w-4 mr-2" /> Export</button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                      <tr>
                        <th className="px-6 py-4 rounded-l-lg">User</th>
                        <th className="px-6 py-4">Type</th>
                        <th className="px-6 py-4 text-right">Amount</th>
                        <th className="px-6 py-4">Date</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 rounded-r-lg text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {[...pendingDeposits, ...pendingWithdrawals, ...recentTransactions].slice(0, 20).map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-slate-900">{tx.user?.username}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                               tx.type === 'DEPOSIT' ? 'bg-green-50 text-green-700 border-green-100' :
                               tx.type === 'WITHDRAWAL' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                               'bg-blue-50 text-blue-700 border-blue-100'
                            }`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-bold text-slate-700">${tx.amount.toFixed(2)}</td>
                          <td className="px-6 py-4 text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4">
                             <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                tx.status === 'PENDING' ? 'text-yellow-600 bg-yellow-50' : 
                                tx.status === 'APPROVED' || tx.status === 'COMPLETED' ? 'text-green-600 bg-green-50' : 
                                'text-red-600 bg-red-50'
                             }`}>
                                {tx.status}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            {tx.status === 'PENDING' && (
                              <button 
                                onClick={() => setSelectedDeposit(tx)}
                                className="text-brand-600 hover:text-brand-800 font-medium text-xs hover:underline"
                              >
                                Review
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              <div className="flex gap-4 items-center">
                 <div className="relative flex-1">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search members by username or email..." 
                      className="input pl-12"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {allUsers
                    .filter(u => u.username.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
                    .slice(0, 50) // Limit for performance
                    .map(user => (
                      <div key={user.id} className="card hover:shadow-lg transition-all group relative overflow-hidden">
                         <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-white ${user.isAdmin ? 'bg-slate-800' : 'bg-brand-500'}`}>
                                  {user.username.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                   <h4 className="font-bold text-slate-900">{user.username}</h4>
                                   <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${
                               user.balance === 0 ? 'bg-slate-100 text-slate-500' : 'bg-green-100 text-green-700'
                            }`}>
                               ${user.balance.toFixed(2)}
                            </span>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg">
                            <div>
                               <p className="uppercase tracking-wider font-semibold text-[10px]">Level</p>
                               <p className="text-slate-900 font-medium">{user.level}</p>
                            </div>
                            <div>
                               <p className="uppercase tracking-wider font-semibold text-[10px]">Deposited</p>
                               <p className="text-slate-900 font-medium">${user.totalDeposit.toFixed(2)}</p>
                            </div>
                         </div>

                         <div className="flex gap-2">
                            <button 
                              className="btn btn-secondary flex-1 py-1.5 text-xs"
                              disabled
                            >
                              Details
                            </button>
                            <button 
                              className="btn bg-brand-50 text-brand-700 hover:bg-brand-100 border-transparent flex-1 py-1.5 text-xs"
                              disabled
                            >
                              Network
                            </button>
                         </div>
                      </div>
                    ))
                 }
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Modals - Simplified for cleaner code (Re-using similar modal styles) */}
      
      {/* Trading Modal */}
      {showTradingModal && (
        <ModalWrapper title="Input Trading Result" onClose={() => setShowTradingModal(false)}>
          <form onSubmit={handleSubmitTrading} className="space-y-4">
            <div>
              <label className="label">Profit Percentage (%)</label>
              <input type="number" step="0.01" required className="input" value={tradingForm.profitPercent} onChange={e => setTradingForm({...tradingForm, profitPercent: e.target.value})} placeholder="e.g. 1.5" />
            </div>
            <div>
              <label className="label">Date</label>
              <input type="date" required className="input" value={tradingForm.tradingDate} onChange={e => setTradingForm({...tradingForm, tradingDate: e.target.value})} />
            </div>
            <button type="submit" className="btn btn-primary w-full">Submit Result</button>
          </form>
        </ModalWrapper>
      )}

      {/* Deposit Review Modal */}
      {selectedDeposit && (
        <ModalWrapper title="Review Deposit" onClose={() => setSelectedDeposit(null)}>
           <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                 <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                       <p className="text-slate-500 text-xs">User</p>
                       <p className="font-semibold">{selectedDeposit.user.username}</p>
                    </div>
                    <div>
                       <p className="text-slate-500 text-xs">Amount</p>
                       <p className="font-bold text-green-600 text-lg">${selectedDeposit.amount.toFixed(2)}</p>
                    </div>
                    <div className="col-span-2">
                       <p className="text-slate-500 text-xs">Wallet Address</p>
                       <code className="bg-white px-2 py-1 rounded border text-xs block mt-1 break-all">{selectedDeposit.walletAddress || 'N/A'}</code>
                    </div>
                    {selectedDeposit.txHash && (
                      <div className="col-span-2">
                         <p className="text-slate-500 text-xs">Tx Hash</p>
                         <code className="bg-white px-2 py-1 rounded border text-xs block mt-1 break-all">{selectedDeposit.txHash}</code>
                      </div>
                    )}
                 </div>
              </div>
              {selectedDeposit.status === 'PENDING' && (
                <div className="flex gap-3">
                   <button onClick={() => handleApproveDeposit(selectedDeposit.id)} className="btn btn-primary flex-1 bg-green-600 hover:bg-green-700 shadow-none">Approve</button>
                   <button onClick={() => handleReject(selectedDeposit.id)} className="btn bg-red-50 text-red-600 hover:bg-red-100 flex-1">Reject</button>
                </div>
              )}
           </div>
        </ModalWrapper>
      )}

      {/* Wallet Config Modal */}
      {showWalletModal && (
        <ModalWrapper title="Deposit Configuration" onClose={() => setShowWalletModal(false)}>
           <form onSubmit={handleUpdateWallet} className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 p-3 rounded text-xs text-blue-800">
                 Current deposit wallet shown to all users. Ensure this is correct.
              </div>
              <input type="text" className="input font-mono text-sm" value={depositWallet} onChange={e => setDepositWallet(e.target.value)} placeholder="0x..." />
              <button type="submit" className="btn btn-primary w-full">Update Wallet Address</button>
           </form>
        </ModalWrapper>
      )}

    </div>
  );
}

// Components

function NavItem({ icon, label, isActive, onClick, isOpen, badge }: any) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full p-3 rounded-xl transition-all duration-200 group ${
        isActive 
          ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      } ${!isOpen && 'justify-center'}`}
    >
      <span className="shrink-0">{icon}</span>
      {isOpen && (
        <div className="ml-3 flex-1 flex justify-between items-center">
          <span className="font-medium whitespace-nowrap">{label}</span>
          {badge > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>}
        </div>
      )}
    </button>
  );
}

function AdminStatCard({ label, value, icon, color, bg }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-card border border-slate-100">
       <div className="flex justify-between items-start">
          <div>
             <p className="text-slate-500 text-sm font-medium">{label}</p>
             <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
          </div>
          <div className={`p-3 rounded-xl ${bg} ${color}`}>
             {icon}
          </div>
       </div>
    </div>
  );
}

function ModalWrapper({ title, children, onClose }: any) {
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}
