import { useState, useEffect } from 'react';
import { Wallet, ExternalLink, Copy, Check } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import { api } from '../api';

const WalletView = () => {
  const [wallet, setWallet] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getWallet().then(setWallet);
  }, []);

  const copyAddress = () => {
    if (wallet?.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!wallet) return <div className="text-[#92400e]">Loading wallet...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#451a03]">Funding & Wallets</h2>
        <p className="text-sm text-[#92400e] mt-1">Agent wallet on Avalanche Fuji testnet</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-[#fef3c7] rounded-lg">
              <Wallet className="w-6 h-6 text-[#d97706]" />
            </div>
            <div>
              <p className="text-sm text-[#92400e]">Agent Wallet Balance</p>
              <h3 className="text-2xl font-bold text-[#451a03]">{wallet.balance}</h3>
            </div>
          </div>
          <Badge variant={wallet.live ? 'success' : 'warning'}>
            {wallet.live ? 'Live — Fuji Testnet' : 'Demo Mode'}
          </Badge>
        </Card>

        <Card className="p-6">
          <p className="text-sm font-medium text-[#92400e] mb-2">Wallet Address</p>
          {wallet.address ? (
            <div className="flex items-center gap-2">
              <code className="text-xs bg-[#fbf7f1] px-3 py-2 rounded-lg flex-1 break-all">{wallet.address}</code>
              <button onClick={copyAddress} className="p-2 hover:bg-[#fef3c7] rounded-lg">
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#b45309]" />}
              </button>
            </div>
          ) : (
            <p className="text-sm text-[#92400e]">Set PRIVATE_KEY in backend .env to activate wallet</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-[#451a03] mb-3">Setup Checklist</h3>
        <ol className="space-y-2 text-sm text-[#92400e] list-decimal list-inside">
          <li>Copy <code>backend/.env.example</code> to <code>backend/.env</code></li>
          <li>Generate a wallet or import a Fuji testnet private key</li>
          <li>
            Fund with test AVAX from the{' '}
            <a href={wallet.faucet} target="_blank" rel="noreferrer" className="text-[#d97706] hover:underline inline-flex items-center gap-1">
              Avalanche Faucet <ExternalLink className="w-3 h-3" />
            </a>
          </li>
          <li>Set MERCHANT_ADDRESS (can be a second wallet you control)</li>
          <li>Add <code>GROQ_API_KEY</code> and/or <code>GEMINI_API_KEY</code> in <code>backend/.env</code></li>
          <li>Deploy AgentRegistry.sol on Fuji and set REGISTRY_CONTRACT_ADDRESS</li>
        </ol>
      </Card>
    </div>
  );
};

export default WalletView;
