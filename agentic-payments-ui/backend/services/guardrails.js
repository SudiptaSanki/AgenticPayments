function canSpend(agent, amountAvax) {
  const remaining = agent.dailyCapAvax - agent.spentTodayAvax;
  if (amountAvax > remaining) {
    return {
      allowed: false,
      reason: `Daily cap exceeded. Remaining: ${remaining.toFixed(4)} AVAX`,
    };
  }
  if (agent.reputation < 40) {
    return { allowed: false, reason: 'Reputation too low — agent blocked by guardrails' };
  }
  return { allowed: true };
}

function recordSpend(agent, amountAvax) {
  agent.spentTodayAvax = parseFloat((agent.spentTodayAvax + amountAvax).toFixed(6));
  agent.status = 'Active';
  return agent;
}

module.exports = { canSpend, recordSpend };
