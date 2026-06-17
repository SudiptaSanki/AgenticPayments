import { Cpu, Wallet, ShieldCheck, Activity, ArrowRightLeft, Settings } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', icon: Activity, label: 'Dashboard' },
    { id: 'agents', icon: Cpu, label: 'My Agents' },
    { id: 'transactions', icon: ArrowRightLeft, label: 'x402 Transactions' },
    { id: 'reputation', icon: ShieldCheck, label: 'ERC-8004 Registry' },
    { id: 'wallet', icon: Wallet, label: 'Funding & Wallets' },
  ];

  return (
    <div className="w-64 bg-[#fcfaf8] border-r border-[#e2d5c4] h-screen flex flex-col">
      <div className="p-6 flex items-center gap-3 border-b border-[#e2d5c4]">
        <div className="bg-[#d97706] p-2 rounded-lg">
          <Cpu className="text-white w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl text-[#451a03] tracking-tight">Agentic Pay</h1>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#f3e8d6] text-[#92400e]'
                  : 'text-[#78350f] hover:bg-[#fbf7f1]'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#d97706]' : 'text-[#b45309]'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#e2d5c4]">
        <button
          onClick={() => setActiveTab('settings')}
          className={`w-full flex items-center gap-3 px-4 py-2 text-sm rounded-lg ${
            activeTab === 'settings' ? 'bg-[#f3e8d6] text-[#92400e]' : 'text-[#78350f] hover:bg-[#fbf7f1]'
          }`}
        >
          <Settings className="w-5 h-5 text-[#b45309]" />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
