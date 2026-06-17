import { useState, useEffect } from 'react';
import { Activity, Bell, Search } from 'lucide-react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import AgentsView from './components/AgentsView';
import TransactionsView from './components/TransactionsView';
import RegistryView from './components/RegistryView';
import WalletView from './components/WalletView';
import SettingsView from './components/SettingsView';
import { api } from './api';

const VIEWS = {
  dashboard: DashboardView,
  agents: AgentsView,
  transactions: TransactionsView,
  reputation: RegistryView,
  wallet: WalletView,
  settings: SettingsView,
};

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [status, setStatus] = useState(null);
  const ActiveView = VIEWS[activeTab];

  useEffect(() => {
    const load = () => api.getHealth().then(setStatus).catch(() => {});
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-[#f5f1ea] font-sans selection:bg-[#fde68a] selection:text-[#92400e]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-[#e2d5c4] flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#b45309]" />
              <input
                type="text"
                placeholder="Search agents, txns..."
                className="pl-9 pr-4 py-2 bg-[#fcfaf8] border border-[#e2d5c4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#d97706] focus:border-transparent text-[#451a03] placeholder-[#b45309]"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            {status && (
              <span className="text-xs text-[#92400e] hidden md:inline">
                {status.walletLive ? `${status.walletAddress?.slice(0, 6)}...` : 'Demo'} · {status.models?.length} models
              </span>
            )}
            <button className="p-2 text-[#b45309] hover:bg-[#fef3c7] rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#fef3c7] border border-[#fde68a] rounded-full">
              <div className={`w-2 h-2 rounded-full ${status?.walletLive ? 'bg-green-500' : 'bg-amber-500'}`}></div>
              <span className="text-xs font-medium text-[#92400e]">
                {status?.walletLive ? 'Fuji Live' : 'Fuji Demo'}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          {ActiveView ? (
            <ActiveView onNavigate={setActiveTab} />
          ) : (
            <div className="flex items-center justify-center h-full text-[#92400e]">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-[#d97706] opacity-50" />
                <h2 className="text-xl font-medium">{activeTab} Module</h2>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
