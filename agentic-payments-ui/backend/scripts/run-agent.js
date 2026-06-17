#!/usr/bin/env node
/**
 * Autonomous Agent CLI — demo x402 payment flow without the UI.
 * Usage: node scripts/run-agent.js [agentId]
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const agentEngine = require('../services/agentEngine');
const store = require('../services/store');
const wallet = require('../services/wallet');

async function main() {
  const agentId = process.argv[2] || 'agt_2';
  const agent = store.getAgent(agentId);

  console.log('\n🤖 Agentic Pay — Autonomous Agent CLI\n');
  console.log(`Wallet:  ${wallet.isLive() ? wallet.getAddress() : 'DEMO MODE'}`);
  console.log(`Agent:   ${agent?.name || agentId} (${agent?.model || 'unknown'})`);
  console.log(`Task:    Fetch premium data via x402 and analyze\n`);

  if (!agent) {
    console.error(`Agent ${agentId} not found. Available:`, store.getAgents().map((a) => a.id).join(', '));
    process.exit(1);
  }

  try {
    const result = await agentEngine.runAgent(agentId, 'CLI autonomous run — analyze AVAX market');
    console.log('✅ x402 payment settled');
    console.log(`   Amount:  ${result.payment.amount} AVAX`);
    console.log(`   Receipt: ${result.payment.receipt}`);
    console.log(`   Mode:    ${result.payment.simulated ? 'simulated' : 'live Fuji'}`);
    console.log('\n📊 Premium data:', JSON.stringify(result.premiumData, null, 2));
    console.log('\n🧠 AI Analysis:\n', result.analysis);
    console.log('');
  } catch (err) {
    console.error('❌', err.message);
    process.exit(1);
  }
}

main();
