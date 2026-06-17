const registry = require('./registry');

const MIN_REPUTATION_TO_PAY = 40;

async function checkPaymentEligibility(agent) {
  if (agent.reputation < MIN_REPUTATION_TO_PAY) {
    return {
      allowed: false,
      reason: `Reputation ${agent.reputation} below minimum ${MIN_REPUTATION_TO_PAY}`,
    };
  }

  if (!agent.registryId) {
    return {
      allowed: true,
      warning: 'Agent not registered on ERC-8004 — payment proceeding with caution',
    };
  }

  const registryAgents = await registry.listAgents();
  const entry = registryAgents.find((a) => a.id === agent.registryId);
  if (entry && entry.reputation < MIN_REPUTATION_TO_PAY) {
    return {
      allowed: false,
      reason: `ERC-8004 reputation ${entry.reputation} too low for autonomous payments`,
    };
  }

  return { allowed: true, registryEntry: entry };
}

module.exports = { checkPaymentEligibility, MIN_REPUTATION_TO_PAY };
