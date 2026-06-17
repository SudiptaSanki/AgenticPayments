const store = require('./store');
const x402Client = require('./x402Client');
const guardrails = require('./guardrails');
const registry = require('./registry');
const wallet = require('./wallet');
const { checkPaymentEligibility } = require('./reputationGate');
const { completeText } = require('./aiProviders');

const PAYMENT_COST = 0.01;
const ORACLE_COST = 0.005;

const API_ROUTES = {
  'Trading Agent': { path: '/api/premium-agent-data', cost: PAYMENT_COST, label: 'Premium Agent Data API' },
  'Data Agent': { path: '/api/premium-oracle-data', cost: ORACLE_COST, label: 'Oracle Price Feed API' },
  'DeFi Agent': { path: '/api/premium-agent-data', cost: PAYMENT_COST, label: 'Premium Agent Data API' },
  'Oracle Agent': { path: '/api/premium-oracle-data', cost: ORACLE_COST, label: 'Oracle Price Feed API' },
  'General Agent': { path: '/api/premium-agent-data', cost: PAYMENT_COST, label: 'Premium Agent Data API' },
};

function getApiForAgent(agent) {
  return API_ROUTES[agent.type] || API_ROUTES['General Agent'];
}

async function runAgent(agentId, task = 'Analyze AVAX market signals and fetch premium trading data') {
  const agent = store.getAgent(agentId);
  if (!agent) throw new Error('Agent not found');

  const api = getApiForAgent(agent);
  const spendCheck = guardrails.canSpend(agent, api.cost);
  if (!spendCheck.allowed) {
    store.updateAgent(agentId, { status: 'Warning' });
    throw new Error(spendCheck.reason);
  }

  const repCheck = await checkPaymentEligibility(agent);
  if (!repCheck.allowed) {
    store.updateAgent(agentId, { status: 'Warning' });
    throw new Error(repCheck.reason);
  }

  store.updateAgent(agentId, { status: 'Active' });

  const x402Result = await x402Client.fetchWithPayment(api.path);
  if (!x402Result.response.ok) {
    store.updateAgent(agentId, { status: 'Warning' });
    throw new Error('x402 payment flow failed');
  }

  guardrails.recordSpend(agent, api.cost);
  store.updateAgent(agentId, {
    spentTodayAvax: agent.spentTodayAvax,
    status: 'Idle',
  });

  const messages = [
    {
      role: 'system',
      content:
        'You are an autonomous DeFi agent on Avalanche Fuji. Analyze data and give a concise trading insight in 2-3 sentences.',
    },
    {
      role: 'user',
      content: `Task: ${task}\nAPI (${api.label}): ${JSON.stringify(x402Result.data)}`,
    },
  ];

  let analysis = await completeText(agent.model, messages, x402Result.data, task);

  const tx = store.addTransaction({
    id: `tx_${Date.now()}`,
    agentId: agent.id,
    agent: agent.name,
    type: 'x402 Pay-per-call',
    target: api.label,
    amount: `${api.cost} AVAX`,
    receipt: x402Result.receipt,
    simulated: x402Result.simulated,
    status: 'Settled',
    time: new Date().toISOString(),
    analysis: analysis.slice(0, 200),
    reputationWarning: repCheck.warning || null,
  });

  if (agent.registryId) {
    const newRep = Math.min(100, agent.reputation + 2);
    await registry.updateReputation(agent.registryId, newRep);
    store.updateAgent(agentId, { reputation: newRep, verified: newRep >= 80 });
  }

  return {
    agent: store.getAgent(agentId),
    transaction: tx,
    premiumData: x402Result.data,
    analysis,
    payment: {
      receipt: x402Result.receipt,
      amount: api.cost,
      simulated: x402Result.simulated,
    },
    reputationCheck: repCheck,
  };
}

async function runAllAgents(task) {
  const agents = store.getAgents();
  const results = [];
  const errors = [];

  for (const agent of agents) {
    try {
      const result = await runAgent(agent.id, task || `Autonomous task for ${agent.name}`);
      results.push(result);
    } catch (err) {
      errors.push({ agentId: agent.id, name: agent.name, error: err.message });
    }
  }

  return { results, errors, ran: results.length, failed: errors.length };
}

async function getDashboardStats() {
  const agents = store.getAgents();
  const transactions = store.getTransactions();
  const balance = await wallet.getBalance();
  const registryAgents = await registry.listAgents();
  const { MODELS, getProviderStatus } = require('./aiProviders');

  const totalSpentToday = agents.reduce((s, a) => s + a.spentTodayAvax, 0);
  const avgRep =
    agents.length > 0
      ? Math.round(agents.reduce((s, a) => s + a.reputation, 0) / agents.length)
      : 0;
  const needsVerification = agents.filter((a) => !a.verified).length;
  const activeCount = agents.filter((a) => a.status === 'Active').length;

  return {
    walletBalance: `${parseFloat(balance).toFixed(4)} AVAX`,
    walletAddress: wallet.getAddress(),
    walletLive: wallet.isLive(),
    totalSpentToday: `${totalSpentToday.toFixed(4)} AVAX`,
    agentCount: agents.length,
    activeCount,
    avgReputation: avgRep,
    needsVerification,
    registryCount: registryAgents.length,
    registryOnChain: registry.isOnChain(),
    openaiConfigured: getProviderStatus().openai,
    groqConfigured: getProviderStatus().groq,
    geminiConfigured: getProviderStatus().gemini,
    models: Object.keys(MODELS),
    agents,
    transactions: transactions.slice(0, 10),
  };
}

module.exports = { runAgent, runAllAgents, getDashboardStats, PAYMENT_COST, getApiForAgent };
