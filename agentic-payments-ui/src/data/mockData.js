export const MOCK_AGENTS = [
  { id: 'agt_1', name: 'DeFi Yield Sniper', type: 'Trading Agent', balance: '14.50 AVAX', reputation: 98, status: 'Active', verified: true },
  { id: 'agt_2', name: 'Data Oracle Fetcher', type: 'Data Agent', balance: '2.10 AVAX', reputation: 85, status: 'Idle', verified: true },
  { id: 'agt_3', name: 'Arbitrage Bot v2', type: 'Trading Agent', balance: '0.05 AVAX', reputation: 42, status: 'Warning', verified: false },
];

export const MOCK_TRANSACTIONS = [
  { id: 'tx_992', agent: 'Data Oracle Fetcher', type: 'x402 Pay-per-call', target: 'Weather API', amount: '0.001 AVAX', time: '2 mins ago', status: 'Settled' },
  { id: 'tx_991', agent: 'DeFi Yield Sniper', type: 'Smart Contract Execution', target: 'Aave Pool', amount: '10.00 AVAX', time: '15 mins ago', status: 'Settled' },
  { id: 'tx_990', agent: 'Arbitrage Bot v2', type: 'ERC-8004 Verification', target: 'Registry', amount: '0.00 AVAX', time: '1 hr ago', status: 'Pending' },
  { id: 'tx_989', agent: 'DeFi Yield Sniper', type: 'x402 Micro-fee', target: 'Gas Station', amount: '0.005 AVAX', time: '3 hrs ago', status: 'Settled' },
];
