#!/usr/bin/env node
/**
 * Generate a new Fuji testnet wallet for the agent backend.
 * Usage: node scripts/setup-wallet.js
 */
const { ethers } = require('ethers');

const wallet = ethers.Wallet.createRandom();

console.log('\n🔐 New Agent Wallet Generated (Avalanche Fuji)\n');
console.log('Add these to backend/.env:\n');
console.log(`PRIVATE_KEY=${wallet.privateKey}`);
console.log(`MERCHANT_ADDRESS=${wallet.address}  # or use a separate merchant wallet`);
console.log(`\nAddress: ${wallet.address}`);
console.log('\nFund with test AVAX: https://core.app/tools/testnet-faucet/\n');
