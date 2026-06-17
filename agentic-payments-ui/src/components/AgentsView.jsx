import { useState, useEffect } from 'react';
import { Cpu, Plus, Play, ShieldCheck, Loader2 } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import { api } from '../api';

const AgentsView = () => {
  const [agents, setAgents] = useState([]);
  const [models, setModels] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [running, setRunning] = useState(null);
  const [form, setForm] = useState({ name: '', type: 'Trading Agent', model: '', dailyCapAvax: 0.5 });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const load = async () => {
    const [agentsRes, modelsRes] = await Promise.all([api.getAgents(), api.getModels()]);
    setAgents(agentsRes.agents);
    setModels(modelsRes.models);
    if (!form.model && modelsRes.models.length) {
      setForm((f) => ({ ...f, model: modelsRes.models[0].id }));
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await api.createAgent(form);
      setShowForm(false);
      setForm({ name: '', type: 'Trading Agent', model: models[0]?.id || '', dailyCapAvax: 0.5 });
      setSuccess('Agent deployed successfully');
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRun = async (id) => {
    setRunning(id);
    setError(null);
    try {
      const result = await api.runAgent(id);
      setSuccess(`${result.agent.name} completed autonomous x402 task`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(null);
    }
  };

  const handleRegister = async (id) => {
    setError(null);
    try {
      const result = await api.registerAgent(id);
      setSuccess(`Registered on ERC-8004 (ID: ${result.registry.agentId})`);
      await load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#451a03]">My Agents</h2>
          <p className="text-sm text-[#92400e] mt-1">Deploy autonomous agents with spend guardrails and multi-model AI brains</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Deploy Agent
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-[#92400e]">Agent Name</label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-[#e2d5c4] rounded-lg text-sm"
                placeholder="e.g. Yield Optimizer"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-[#92400e]">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-[#e2d5c4] rounded-lg text-sm"
              >
                <option>Trading Agent</option>
                <option>Data Agent</option>
                <option>DeFi Agent</option>
                <option>Oracle Agent</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#92400e]">AI Model</label>
              <select
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                className="mt-1 w-full px-3 py-2 border border-[#e2d5c4] rounded-lg text-sm"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-[#92400e]">Daily Spend Cap (AVAX)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.dailyCapAvax}
                onChange={(e) => setForm({ ...form, dailyCapAvax: parseFloat(e.target.value) })}
                className="mt-1 w-full px-3 py-2 border border-[#e2d5c4] rounded-lg text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="bg-[#451a03] text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-[#78350f]">
                Deploy Agent
              </button>
            </div>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {agents.map((agent) => (
          <Card key={agent.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#fef3c7] rounded-full">
                  <Cpu className="w-6 h-6 text-[#d97706]" />
                </div>
                <div>
                  <h4 className="font-semibold text-[#451a03]">{agent.name}</h4>
                  <p className="text-sm text-[#92400e]">{agent.type}</p>
                  <p className="text-xs text-[#b45309] mt-1">Model: {agent.model}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right text-sm">
                  <p className="text-[#451a03]">{agent.spentTodayAvax}/{agent.dailyCapAvax} AVAX</p>
                  <Badge variant={agent.reputation > 80 ? 'success' : 'warning'}>Rep: {agent.reputation}</Badge>
                </div>
                {!agent.registryId && (
                  <button
                    onClick={() => handleRegister(agent.id)}
                    className="flex items-center gap-1 px-3 py-2 border border-[#d97706] text-[#d97706] rounded-lg text-xs hover:bg-[#fef3c7]"
                  >
                    <ShieldCheck className="w-3 h-3" /> Register ERC-8004
                  </button>
                )}
                <button
                  onClick={() => handleRun(agent.id)}
                  disabled={running === agent.id}
                  className="flex items-center gap-1 bg-[#d97706] text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  {running === agent.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  Run Autonomous Task
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AgentsView;
