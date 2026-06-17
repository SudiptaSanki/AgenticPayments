import { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import { api } from '../api';

const RegistryView = () => {
  const [registry, setRegistry] = useState({ agents: [], onChain: false });

  useEffect(() => {
    api.getRegistry().then(setRegistry);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#451a03]">ERC-8004 Registry</h2>
        <p className="text-sm text-[#92400e] mt-1">
          Agent identity & reputation {registry.onChain ? 'on Avalanche Fuji' : '(in-memory demo — deploy contract for on-chain)'}
        </p>
      </div>

      {!registry.onChain && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <p className="text-sm text-amber-900">
            Deploy <code>backend/contracts/AgentRegistry.sol</code> on Fuji via Remix, then set <code>REGISTRY_CONTRACT_ADDRESS</code> in <code>.env</code>.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {registry.agents.length === 0 ? (
          <Card className="p-12 text-center col-span-2 text-[#92400e]">
            <ShieldCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No agents registered yet. Register from the Agents tab.</p>
          </Card>
        ) : (
          registry.agents.map((agent) => (
            <Card key={agent.id} className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-[#451a03] flex items-center gap-2">
                    {agent.name}
                    {agent.verified && <CheckCircle2 className="w-4 h-4 text-[#d97706]" />}
                  </h4>
                  <p className="text-xs text-[#92400e] mt-1 font-mono">ID: {agent.id}</p>
                  <p className="text-xs text-[#92400e] mt-1 font-mono">Owner: {agent.owner?.slice(0, 10)}...</p>
                </div>
                <Badge variant={agent.reputation >= 80 ? 'success' : agent.reputation >= 50 ? 'warning' : 'default'}>
                  {agent.reputation}/100
                </Badge>
              </div>
              <p className="text-xs text-[#b45309] mt-3">
                Registered: {new Date(agent.registeredAt).toLocaleString()}
              </p>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RegistryView;
