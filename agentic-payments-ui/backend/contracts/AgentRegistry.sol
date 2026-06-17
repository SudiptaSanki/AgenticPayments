// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AgentRegistry — ERC-8004 inspired identity & reputation registry for Agentic Pay
/// @notice Deploy on Avalanche Fuji via Remix IDE, then set REGISTRY_CONTRACT_ADDRESS in .env
contract AgentRegistry {
    struct Agent {
        string name;
        address owner;
        uint256 reputation;
        bool verified;
        uint256 registeredAt;
    }

    mapping(uint256 => Agent) public agents;
    mapping(address => uint256) public addressToAgentId;
    uint256 public agentCount;

    event AgentRegistered(uint256 indexed agentId, address indexed owner, string name);
    event ReputationUpdated(uint256 indexed agentId, uint256 newScore);

    function registerAgent(string memory name) external returns (uint256) {
        require(bytes(name).length > 0, "Name required");
        agentCount++;
        agents[agentCount] = Agent({
            name: name,
            owner: msg.sender,
            reputation: 50,
            verified: false,
            registeredAt: block.timestamp
        });
        addressToAgentId[msg.sender] = agentCount;
        emit AgentRegistered(agentCount, msg.sender, name);
        return agentCount;
    }

    function updateReputation(uint256 agentId, uint256 score) external {
        require(agentId > 0 && agentId <= agentCount, "Invalid agent");
        require(score <= 100, "Max score 100");
        agents[agentId].reputation = score;
        if (score >= 80) {
            agents[agentId].verified = true;
        }
        emit ReputationUpdated(agentId, score);
    }

    function getAgent(uint256 agentId) external view returns (Agent memory) {
        require(agentId > 0 && agentId <= agentCount, "Invalid agent");
        return agents[agentId];
    }
}
