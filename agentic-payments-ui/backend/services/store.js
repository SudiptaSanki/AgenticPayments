const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const AGENTS_FILE = path.join(DATA_DIR, 'agents.json');
const TX_FILE = path.join(DATA_DIR, 'transactions.json');

const DEFAULT_AGENTS = [
  {
    id: 'agt_1',
    name: 'DeFi Yield Sniper',
    type: 'Trading Agent',
    model: 'groq/llama-3.3-70b-versatile',
    dailyCapAvax: 1.0,
    spentTodayAvax: 0,
    reputation: 98,
    status: 'Idle',
    verified: true,
    registryId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agt_2',
    name: 'Data Oracle Fetcher',
    type: 'Data Agent',
    model: 'gemini/gemini-2.0-flash',
    dailyCapAvax: 0.5,
    spentTodayAvax: 0,
    reputation: 85,
    status: 'Idle',
    verified: true,
    registryId: null,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'agt_3',
    name: 'Arbitrage Bot v2',
    type: 'Trading Agent',
    model: 'groq/llama-3.1-8b-instant',
    dailyCapAvax: 0.1,
    spentTodayAvax: 0,
    reputation: 42,
    status: 'Warning',
    verified: false,
    registryId: null,
    createdAt: new Date().toISOString(),
  },
];

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  ensureDataDir();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return [...fallback];
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const store = {
  getAgents() {
    return readJson(AGENTS_FILE, DEFAULT_AGENTS);
  },
  saveAgents(agents) {
    writeJson(AGENTS_FILE, agents);
  },
  getAgent(id) {
    return this.getAgents().find((a) => a.id === id);
  },
  addAgent(agent) {
    const agents = this.getAgents();
    agents.push(agent);
    this.saveAgents(agents);
    return agent;
  },
  updateAgent(id, patch) {
    const agents = this.getAgents();
    const idx = agents.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    agents[idx] = { ...agents[idx], ...patch };
    this.saveAgents(agents);
    return agents[idx];
  },
  getTransactions() {
    return readJson(TX_FILE, []);
  },
  addTransaction(tx) {
    const txs = this.getTransactions();
    txs.unshift(tx);
    writeJson(TX_FILE, txs.slice(0, 100));
    return tx;
  },
};

module.exports = store;
