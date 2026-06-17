import { useState, useEffect } from 'react';
import { Settings, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import { api } from '../api';

const StatusRow = ({ label, ok, detail }) => (
  <div className="flex items-center justify-between py-3 border-b border-[#e2d5c4] last:border-0">
    <span className="text-sm text-[#92400e]">{label}</span>
    <div className="flex items-center gap-2">
      {detail && <span className="text-xs text-[#b45309]">{detail}</span>}
      {ok ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-orange-500" />}
    </div>
  </div>
);

const SettingsView = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    api.getSettings().then(setSettings).catch(console.error);
  }, []);

  if (!settings) return <div className="text-[#92400e]">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#451a03] flex items-center gap-2">
          <Settings className="w-5 h-5" /> System Settings
        </h2>
        <p className="text-sm text-[#92400e] mt-1">Configuration status for the Agentic Pay speedrun prototype</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="font-bold text-[#451a03] mb-4">Avalanche Fuji</h3>
          <StatusRow label="Agent wallet configured" ok={settings.wallet.live} detail={settings.wallet.live ? settings.wallet.balance : 'demo'} />
          <StatusRow label="Wallet address set" ok={!!settings.wallet.address} />
          <StatusRow label="Network" ok detail={settings.network} />
          <a href="https://core.app/tools/testnet-faucet/" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-[#d97706] hover:underline">
            Fuji Faucet <ExternalLink className="w-3 h-3" />
          </a>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-[#451a03] mb-4">AI Models</h3>
          <StatusRow label="Groq API key" ok={settings.ai.groq} />
          <StatusRow label="Gemini API key" ok={settings.ai.gemini} />
          <StatusRow label="OpenAI API key (optional)" ok={settings.ai.openai} />
          <div className="mt-4 flex flex-wrap gap-2">
            {settings.ai.models.map((m) => (
              <Badge key={m} variant="default">{m.split('/')[1]}</Badge>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-[#451a03] mb-4">x402 Protocol</h3>
          <StatusRow label="Merchant address" ok={settings.x402.merchantAddress !== '0x0000000000000000000000000000000000000000'} />
          <StatusRow label="Premium API cost" ok detail={`${settings.x402.premiumCost} AVAX`} />
          <StatusRow label="Oracle API cost" ok detail={`${settings.x402.oracleCost} AVAX`} />
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-[#451a03] mb-4">ERC-8004 Registry</h3>
          <StatusRow label="On-chain registry" ok={settings.registry.onChain} detail={settings.registry.onChain ? 'Fuji' : 'in-memory'} />
          <StatusRow label="Contract deployed" ok={!!settings.registry.contractAddress} />
          {settings.registry.contractAddress && (
            <p className="text-xs font-mono text-[#b45309] mt-2 break-all">{settings.registry.contractAddress}</p>
          )}
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="font-bold text-[#451a03] mb-3">Quick Setup Commands</h3>
        <pre className="text-xs bg-[#fbf7f1] p-4 rounded-lg overflow-x-auto text-[#451a03]">{`# Generate a Fuji wallet
npm run wallet:setup

# Copy backend/.env.example → backend/.env and fill keys

# Run autonomous agent from CLI (no UI)
npm run agent

# Start full stack
run.bat`}</pre>
      </Card>
    </div>
  );
};

export default SettingsView;
