import { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import Card from './Card';
import Badge from './Badge';
import { api, timeAgo } from '../api';

const TransactionsView = () => {
  const [transactions, setTransactions] = useState([]);

  const load = () => api.getTransactions().then((res) => setTransactions(res.transactions));

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#451a03]">x402 Transactions</h2>
        <p className="text-sm text-[#92400e] mt-1">Autonomous pay-per-call settlements on Avalanche Fuji</p>
      </div>

      <Card className="p-0">
        {transactions.length === 0 ? (
          <div className="p-12 text-center text-[#92400e]">
            <ArrowRightLeft className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No x402 transactions yet. Run an agent from the dashboard.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#e2d5c4]">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-5 hover:bg-[#fbf7f1]">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-[#451a03]">{tx.target}</h4>
                    <p className="text-sm text-[#92400e]">{tx.agent} · {tx.type}</p>
                    {tx.receipt && (
                      <p className="text-xs text-[#b45309] mt-1 font-mono">Receipt: {tx.receipt}</p>
                    )}
                    {tx.analysis && (
                      <p className="text-xs text-[#78350f] mt-2 max-w-xl">{tx.analysis}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#d97706]">{tx.amount}</p>
                    <p className="text-xs text-[#92400e]">{timeAgo(tx.time)}</p>
                    <div className="mt-2 flex gap-1 justify-end">
                      <Badge variant="verified">{tx.status}</Badge>
                      {tx.simulated && <Badge variant="warning">demo</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TransactionsView;
