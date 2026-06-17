import { useState, useEffect, useCallback } from 'react';
import { Cpu, Wallet, ShieldCheck, Plus, ArrowRightLeft, CheckCircle2, Play, Loader2 } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import { api, timeAgo } from '../api';

const DashboardView = ({ onNavigate }) => {
  const [stats, setStats] = useState(null);
  const [running, setRunning] = useState(null);
  const [runningAll, setRunningAll] = useState(false);
  const [error, setError] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await api.getDashboard();
      setStats(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, [load]);

  const handleRunAll = async () => {
    setRunningAll(true);
    setError(null);
    try {
      const result = await api.runAllAgents('Fleet-wide AVAX market scan');
      setLastResult(result.results[result.results.length - 1] || null);
      if (result.errors.length) {
        setError(`${result.failed} agent(s) failed: ${result.errors.map((e) => e.name).join(', ')}`);
      }
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunningAll(false);
    }
  };

  const handleRun = async (agentId) => {
    setRunning(agentId);
    setError(null);
    try {
      const result = await api.runAgent(agentId, 'Fetch premium AVAX trading signals and analyze');
      setLastResult(result);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(null);
    }
  };

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64 text-[#92400e]">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading live dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      {!stats.walletLive && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-lg text-sm">
          <strong>Demo mode:</strong> Add <code>PRIVATE_KEY</code> to backend <code>.env</code> for real Fuji AVAX payments.
          x402 flow still runs with simulated receipts.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#92400e]">Wallet Balance</p>
              <h3 className="text-2xl font-bold text-[#451a03] mt-1">{stats.walletBalance}</h3>
            </div>
            <div className="p-3 bg-[#fef3c7] rounded-lg">
              <Wallet className="w-5 h-5 text-[#d97706]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowRightLeft className="w-4 h-4 mr-1" />
            <span>{stats.totalSpentToday} spent today</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#92400e]">Active Agents</p>
              <h3 className="text-2xl font-bold text-[#451a03] mt-1">{stats.agentCount} Deployed</h3>
            </div>
            <div className="p-3 bg-[#fef3c7] rounded-lg">
              <Cpu className="w-5 h-5 text-[#d97706]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-[#92400e]">
            <span>{stats.activeCount} currently executing tasks</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-[#92400e]">Avg. Reputation (ERC-8004)</p>
              <h3 className="text-2xl font-bold text-[#451a03] mt-1">{stats.avgReputation} / 100</h3>
            </div>
            <div className="p-3 bg-[#fef3c7] rounded-lg">
              <ShieldCheck className="w-5 h-5 text-[#d97706]" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-orange-600">
            <span>{stats.needsVerification} agent{stats.needsVerification !== 1 ? 's' : ''} need verification</span>
          </div>
        </Card>
      </div>

      {lastResult && (
        <Card className="p-5 border-[#d97706]">
          <h3 className="font-bold text-[#451a03] mb-2">Latest Autonomous Run — {lastResult.agent.name}</h3>
          <p className="text-sm text-[#92400e] mb-2">
            Paid {lastResult.payment.amount} AVAX via x402
            {lastResult.payment.simulated ? ' (simulated)' : ''} — receipt: {lastResult.payment.receipt?.slice(0, 18)}...
          </p>
          <p className="text-sm text-[#451a03] whitespace-pre-wrap">{lastResult.analysis}</p>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[#451a03]">Your Autonomous Fleet</h2>
            <div className="flex gap-2">
              <button
                onClick={handleRunAll}
                disabled={runningAll}
                className="flex items-center gap-2 border border-[#d97706] text-[#d97706] hover:bg-[#fef3c7] px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {runningAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                Run All
              </button>
              <button
                onClick={() => onNavigate?.('agents')}
                className="flex items-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" /> Deploy Agent
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {stats.agents.map((agent) => (
              <Card key={agent.id} className="p-5 flex items-center justify-between hover:border-[#d97706] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${agent.status === 'Active' ? 'bg-green-100' : agent.status === 'Warning' ? 'bg-orange-100' : 'bg-gray-100'}`}>
                    <Cpu className={`w-6 h-6 ${agent.status === 'Active' ? 'text-green-600' : agent.status === 'Warning' ? 'text-orange-600' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#451a03] flex items-center gap-2">
                      {agent.name}
                      {agent.verified && <CheckCircle2 className="w-4 h-4 text-[#d97706]" />}
                    </h4>
                    <p className="text-sm text-[#92400e]">{agent.type} · {agent.model?.split('/')[1]}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-[#451a03]">{agent.dailyCapAvax - agent.spentTodayAvax} AVAX left</p>
                    <p className="text-xs text-[#92400e]">Daily cap: {agent.dailyCapAvax}</p>
                  </div>
                  <Badge variant={agent.reputation > 80 ? 'success' : agent.reputation > 50 ? 'warning' : 'default'}>
                    {agent.reputation}
                  </Badge>
                  <button
                    onClick={() => handleRun(agent.id)}
                    disabled={running === agent.id}
                    className="flex items-center gap-1 bg-[#451a03] hover:bg-[#78350f] text-white px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50"
                  >
                    {running === agent.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                    Run
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[#451a03]">Live x402 Activity</h2>
          <Card className="p-0">
            <div className="divide-y divide-[#e2d5c4]">
              {stats.transactions.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#92400e]">No transactions yet. Run an agent to see x402 payments.</div>
              ) : (
                stats.transactions.map((tx) => (
                  <div key={tx.id} className="p-4 hover:bg-[#fbf7f1] transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-[#451a03]">{tx.target}</span>
                      <span className="text-sm font-bold text-[#d97706]">{tx.amount}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-[#92400e]">{tx.agent}</span>
                      <span className="text-[#a16207]">{timeAgo(tx.time)}</span>
                    </div>
                    <div className="mt-2 flex gap-2">
                      <Badge variant={tx.status === 'Settled' ? 'verified' : 'default'}>{tx.type}</Badge>
                      {tx.simulated && <Badge variant="warning">simulated</Badge>}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-3 border-t border-[#e2d5c4] bg-[#fcfaf8] text-center">
              <button onClick={() => onNavigate?.('transactions')} className="text-sm font-medium text-[#d97706] hover:text-[#b45309]">
                View All Activity →
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
