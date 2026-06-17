require('dotenv').config();
const express = require('express');
const cors = require('cors');

const wallet = require('./services/wallet');
const store = require('./services/store');
const registry = require('./services/registry');
const agentEngine = require('./services/agentEngine');
const { MODELS, getProviderStatus } = require('./services/aiProviders');

const app = express();
app.use(cors());
app.use(express.json());

const MERCHANT = process.env.MERCHANT_ADDRESS || wallet.getAddress() || '0x0000000000000000000000000000000000000000';

const requirePayment = (costAvax, description) => {
  return async (req, res, next) => {
    const paymentReceipt = req.headers['x-402-receipt'];

    if (!paymentReceipt) {
      return res.status(402).json({
        error: 'Payment Required',
        amount: String(costAvax),
        currency: 'AVAX',
        network: 'Avalanche Fuji C-Chain',
        description,
        merchantAddress: MERCHANT,
      });
    }

    const verification = await wallet.verifyPayment(paymentReceipt, MERCHANT, costAvax);
    if (!verification.valid) {
      return res.status(402).json({
        error: 'Payment Required',
        reason: verification.reason || 'Invalid receipt',
        amount: String(costAvax),
        currency: 'AVAX',
        network: 'Avalanche Fuji C-Chain',
        description,
        merchantAddress: MERCHANT,
      });
    }

    req.paymentReceipt = paymentReceipt;
    req.paymentSimulated = verification.simulated;
    next();
  };
};

// ─── Health & config ───────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Agentic Pay x402 Server',
    network: 'Avalanche Fuji',
    walletLive: wallet.isLive(),
    walletAddress: wallet.getAddress(),
    registryOnChain: registry.isOnChain(),
    models: Object.keys(MODELS),
  });
});

app.get('/api/models', (_req, res) => {
  res.json({
    models: Object.entries(MODELS).map(([id, m]) => ({ id, ...m })),
    openaiConfigured: getProviderStatus().openai,
    groqConfigured: getProviderStatus().groq,
    geminiConfigured: getProviderStatus().gemini,
  });
});

// ─── x402 gated resources ──────────────────────────────────────────
app.get(
  '/api/premium-agent-data',
  requirePayment(agentEngine.PAYMENT_COST, 'High-frequency AVAX trading signals'),
  (_req, res) => {
    res.json({
      success: true,
      data: 'Bullish divergence detected on AVAX.',
      confidenceScore: 94,
      source: 'x402 Premium Feed',
      timestamp: new Date().toISOString(),
    });
  }
);

app.get(
  '/api/premium-oracle-data',
  requirePayment(0.005, 'Real-time oracle price feed'),
  (_req, res) => {
    res.json({
      success: true,
      avaxUsd: 28.42 + Math.random() * 2,
      sentiment: 'bullish',
      timestamp: new Date().toISOString(),
    });
  }
);

// ─── Dashboard ─────────────────────────────────────────────────────
app.get('/api/dashboard', async (_req, res) => {
  try {
    const stats = await agentEngine.getDashboardStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Agents CRUD + autonomous run ──────────────────────────────────
app.get('/api/agents', (_req, res) => {
  res.json({ agents: store.getAgents() });
});

app.post('/api/agents', (req, res) => {
  const { name, type, model, dailyCapAvax } = req.body;
  if (!name || !model) {
    return res.status(400).json({ error: 'name and model are required' });
  }

  const agent = store.addAgent({
    id: `agt_${Date.now()}`,
    name,
    type: type || 'General Agent',
    model,
    dailyCapAvax: parseFloat(dailyCapAvax) || 0.5,
    spentTodayAvax: 0,
    reputation: 50,
    status: 'Idle',
    verified: false,
    registryId: null,
    createdAt: new Date().toISOString(),
  });

  res.status(201).json({ agent });
});

app.post('/api/agents/run-all', async (req, res) => {
  try {
    const result = await agentEngine.runAllAgents(req.body.task);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/agents/:id/run', async (req, res) => {
  try {
    const result = await agentEngine.runAgent(req.params.id, req.body.task);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/agents/:id/register', async (req, res) => {
  const agent = store.getAgent(req.params.id);
  if (!agent) return res.status(404).json({ error: 'Agent not found' });

  try {
    const reg = await registry.registerAgent(agent.name);
    store.updateAgent(agent.id, {
      registryId: reg.agentId,
      verified: reg.onChain ? false : reg.entry?.verified,
    });
    res.json({ agent: store.getAgent(agent.id), registry: reg });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Transactions ──────────────────────────────────────────────────
app.get('/api/transactions', (_req, res) => {
  res.json({ transactions: store.getTransactions() });
});

// ─── ERC-8004 Registry ───────────────────────────────────────────
app.get('/api/registry', async (_req, res) => {
  try {
    const agents = await registry.listAgents();
    res.json({ agents, onChain: registry.isOnChain() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── Wallet ────────────────────────────────────────────────────────
app.get('/api/wallet', async (_req, res) => {
  try {
    const balance = await wallet.getBalance();
    res.json({
      address: wallet.getAddress(),
      balance: `${parseFloat(balance).toFixed(4)} AVAX`,
      live: wallet.isLive(),
      network: 'Avalanche Fuji C-Chain',
      rpc: process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
      faucet: 'https://core.app/tools/testnet-faucet/',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── System status (for Settings view) ───────────────────────────
app.get('/api/settings', async (_req, res) => {
  try {
    const balance = await wallet.getBalance();
    res.json({
      wallet: {
        live: wallet.isLive(),
        address: wallet.getAddress(),
        balance: `${parseFloat(balance).toFixed(4)} AVAX`,
      },
      ai: {
        ...getProviderStatus(),
        models: Object.keys(MODELS),
      },
      registry: {
        onChain: registry.isOnChain(),
        contractAddress: process.env.REGISTRY_CONTRACT_ADDRESS || null,
      },
      x402: {
        merchantAddress: MERCHANT,
        premiumCost: agentEngine.PAYMENT_COST,
        oracleCost: 0.005,
      },
      network: 'Avalanche Fuji C-Chain',
      rpc: process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Agentic Pay server running on port ${PORT}`);
  console.log(`Wallet: ${wallet.isLive() ? wallet.getAddress() : 'DEMO MODE (no PRIVATE_KEY)'}`);
  console.log(`Registry: ${registry.isOnChain() ? 'on-chain' : 'in-memory (deploy contract for Fuji)'}`);
});
