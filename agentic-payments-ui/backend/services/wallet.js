const { ethers } = require('ethers');

class WalletService {
  constructor() {
    this.rpcUrl = process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
    this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
    this.wallet = process.env.PRIVATE_KEY
      ? new ethers.Wallet(process.env.PRIVATE_KEY, this.provider)
      : null;
  }

  isLive() {
    return !!this.wallet;
  }

  getAddress() {
    return this.wallet?.address || null;
  }

  getSigner() {
    return this.wallet;
  }

  async getBalance() {
    if (!this.wallet) return '0';
    const balance = await this.provider.getBalance(this.wallet.address);
    return ethers.formatEther(balance);
  }

  async sendPayment(toAddress, amountAvax) {
    if (!this.wallet) {
      const simulatedHash = `0xdemo${Date.now().toString(16)}${'0'.repeat(40)}`.slice(0, 66);
      return { hash: simulatedHash, simulated: true };
    }

    const tx = await this.wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(String(amountAvax)),
    });
    const receipt = await tx.wait();
    return { hash: receipt.hash, simulated: false };
  }

  async verifyPayment(txHash, merchantAddress, minAmountAvax) {
    if (txHash.startsWith('0xdemo')) {
      return { valid: true, simulated: true };
    }

    const receipt = await this.provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      return { valid: false, reason: 'Transaction not found or failed' };
    }

    const tx = await this.provider.getTransaction(txHash);
    if (!tx) return { valid: false, reason: 'Transaction not found' };

    const toMatch = tx.to?.toLowerCase() === merchantAddress.toLowerCase();
    const minWei = ethers.parseEther(String(minAmountAvax));
    const valueOk = tx.value >= minWei;

    return {
      valid: toMatch && valueOk,
      simulated: false,
      reason: !toMatch ? 'Wrong recipient' : !valueOk ? 'Insufficient amount' : null,
    };
  }
}

module.exports = new WalletService();
