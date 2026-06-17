const { ethers } = require('ethers');
const wallet = require('./wallet');

const REGISTRY_ABI = [
  'function registerAgent(string name) external returns (uint256)',
  'function getAgent(uint256 agentId) external view returns (tuple(string name, address owner, uint256 reputation, bool verified, uint256 registeredAt))',
  'function updateReputation(uint256 agentId, uint256 score) external',
  'function agentCount() external view returns (uint256)',
  'event AgentRegistered(uint256 indexed agentId, address indexed owner, string name)',
];

const memoryRegistry = [];

class RegistryService {
  constructor() {
    this.contractAddress = process.env.REGISTRY_CONTRACT_ADDRESS || null;
    this.contract = null;

    if (this.contractAddress && wallet.isLive()) {
      this.contract = new ethers.Contract(
        this.contractAddress,
        REGISTRY_ABI,
        wallet.getSigner()
      );
    }
  }

  isOnChain() {
    return !!this.contract;
  }

  async registerAgent(name) {
    if (this.contract) {
      const tx = await this.contract.registerAgent(name);
      const receipt = await tx.wait();
      const registered = receipt.logs
        .map((log) => {
          try {
            return this.contract.interface.parseLog(log);
          } catch {
            return null;
          }
        })
        .find((p) => p?.name === 'AgentRegistered');

      const agentId = registered ? Number(registered.args.agentId) : null;
      return { agentId, txHash: receipt.hash, onChain: true };
    }

    const entry = {
      id: memoryRegistry.length + 1,
      name,
      owner: wallet.getAddress() || 'demo-wallet',
      reputation: 50,
      verified: false,
      registeredAt: new Date().toISOString(),
      onChain: false,
    };
    memoryRegistry.push(entry);
    return { agentId: entry.id, txHash: null, onChain: false, entry };
  }

  async listAgents() {
    if (this.contract) {
      const count = Number(await this.contract.agentCount());
      const agents = [];
      for (let i = 1; i <= count; i++) {
        const a = await this.contract.getAgent(i);
        agents.push({
          id: i,
          name: a.name,
          owner: a.owner,
          reputation: Number(a.reputation),
          verified: a.verified,
          registeredAt: new Date(Number(a.registeredAt) * 1000).toISOString(),
          onChain: true,
        });
      }
      return agents;
    }
    return memoryRegistry;
  }

  async updateReputation(agentId, score) {
    if (this.contract) {
      const tx = await this.contract.updateReputation(agentId, score);
      const receipt = await tx.wait();
      return { txHash: receipt.hash, onChain: true };
    }

    const entry = memoryRegistry.find((a) => a.id === agentId);
    if (entry) {
      entry.reputation = score;
      entry.verified = score >= 80;
    }
    return { onChain: false };
  }
}

module.exports = new RegistryService();
