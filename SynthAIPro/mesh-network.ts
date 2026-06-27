/**
 * Mesh Network Layer for SYNTHAI
 * Enables multi-agent communication and coordination
 */

import { nanoid } from 'nanoid';

export interface MeshAgent {
  agentId: string;
  userId: number;
  name: string;
  status: 'online' | 'offline' | 'idle';
  meshAddress: string;
  lastHeartbeat: Date;
}

export interface MeshMessage {
  messageId: string;
  fromAgentId: string;
  toAgentId: string;
  type: 'task' | 'status' | 'coordination' | 'data_sync';
  payload: Record<string, any>;
  timestamp: Date;
  acknowledged: boolean;
}

export interface MeshRoute {
  fromAgent: string;
  toAgent: string;
  hops: number;
  latency: number;
}

/**
 * Mesh Network Manager
 */
export class MeshNetworkManager {
  private agents: Map<string, MeshAgent> = new Map();
  private messageQueue: MeshMessage[] = [];
  private routes: Map<string, MeshRoute[]> = new Map();

  /**
   * Register an agent in the mesh network
   */
  registerAgent(agent: MeshAgent): void {
    this.agents.set(agent.agentId, {
      ...agent,
      status: 'online',
      lastHeartbeat: new Date(),
    });
    console.log(`[Mesh] Agent ${agent.agentId} registered`);
  }

  /**
   * Deregister an agent from the mesh network
   */
  deregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    console.log(`[Mesh] Agent ${agentId} deregistered`);
  }

  /**
   * Update agent heartbeat and status
   */
  updateAgentHeartbeat(agentId: string, status: 'online' | 'offline' | 'idle' = 'online'): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.status = status;
      agent.lastHeartbeat = new Date();
    }
  }

  /**
   * Send a message through the mesh network
   */
  async sendMessage(
    fromAgentId: string,
    toAgentId: string,
    type: MeshMessage['type'],
    payload: Record<string, any>
  ): Promise<MeshMessage> {
    const message: MeshMessage = {
      messageId: nanoid(),
      fromAgentId,
      toAgentId,
      type,
      payload,
      timestamp: new Date(),
      acknowledged: false,
    };

    // Queue the message
    this.messageQueue.push(message);

    // Find route to destination
    const route = this.findRoute(fromAgentId, toAgentId);
    if (route) {
      console.log(`[Mesh] Message ${message.messageId} routed via ${route.hops} hops`);
    } else {
      console.warn(`[Mesh] No route found from ${fromAgentId} to ${toAgentId}`);
    }

    return message;
  }

  /**
   * Acknowledge a message
   */
  acknowledgeMessage(messageId: string): void {
    const message = this.messageQueue.find(m => m.messageId === messageId);
    if (message) {
      message.acknowledged = true;
    }
  }

  /**
   * Broadcast a message to all agents
   */
  async broadcastMessage(
    fromAgentId: string,
    type: MeshMessage['type'],
    payload: Record<string, any>
  ): Promise<MeshMessage[]> {
    const messages: MeshMessage[] = [];

    this.agents.forEach((_, agentId) => {
      if (agentId !== fromAgentId) {
        this.sendMessage(fromAgentId, agentId, type, payload).then(message => {
          messages.push(message);
        });
      }
    });

    return messages;
  }

  /**
   * Find optimal route between two agents using Dijkstra's algorithm
   */
  private findRoute(fromAgentId: string, toAgentId: string): MeshRoute | null {
    const fromAgent = this.agents.get(fromAgentId);
    const toAgent = this.agents.get(toAgentId);

    if (!fromAgent || !toAgent) {
      return null;
    }

    // Direct connection (1 hop)
    if (fromAgent.status === 'online' && toAgent.status === 'online') {
      return {
        fromAgent: fromAgentId,
        toAgent: toAgentId,
        hops: 1,
        latency: Math.random() * 100, // Simulated latency
      };
    }

    // Multi-hop routing through intermediate agents
    const visited = new Set<string>();
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();

    // Initialize distances
    this.agents.forEach((_, agentId) => {
      distances.set(agentId, agentId === fromAgentId ? 0 : Infinity);
      previous.set(agentId, null);
    });

    // Dijkstra's algorithm
    while (visited.size < this.agents.size) {
      let currentAgent: string | null = null;
      let minDistance = Infinity;

      distances.forEach((distance, agentId) => {
        if (!visited.has(agentId) && distance < minDistance) {
          currentAgent = agentId;
          minDistance = distance;
        }
      });

      if (currentAgent === null || minDistance === Infinity) {
        break;
      }

      visited.add(currentAgent);

      if (currentAgent === toAgentId) {
        // Reconstruct path
        let hops = 0;
        let current: string | null = toAgentId;
        while (current !== null && current !== fromAgentId) {
          hops++;
          current = previous.get(current) || null;
        }

        return {
          fromAgent: fromAgentId,
          toAgent: toAgentId,
          hops,
          latency: minDistance,
        };
      }

      // Update distances to neighbors
      this.agents.forEach((neighbor, neighborId) => {
        if (!visited.has(neighborId) && neighbor.status === 'online') {
          const newDistance = minDistance + 1;
          if (newDistance < (distances.get(neighborId) || Infinity)) {
            distances.set(neighborId, newDistance);
            previous.set(neighborId, currentAgent);
          }
        }
      });
    }

    return null;
  }

  /**
   * Get all online agents
   */
  getOnlineAgents(): MeshAgent[] {
    const agents: MeshAgent[] = [];
    this.agents.forEach(agent => {
      if (agent.status === 'online') {
        agents.push(agent);
      }
    });
    return agents;
  }

  /**
   * Get network statistics
   */
  getNetworkStats() {
    const agents = Array.from(this.agents.values());
    const onlineCount = agents.filter(a => a.status === 'online').length;
    const offlineCount = agents.filter(a => a.status === 'offline').length;
    const idleCount = agents.filter(a => a.status === 'idle').length;

    return {
      totalAgents: agents.length,
      onlineAgents: onlineCount,
      offlineAgents: offlineCount,
      idleAgents: idleCount,
      pendingMessages: this.messageQueue.filter(m => !m.acknowledged).length,
      totalMessages: this.messageQueue.length,
    };
  }

  /**
   * Cleanup old messages (older than 1 hour)
   */
  cleanupOldMessages(): void {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.messageQueue = this.messageQueue.filter(m => m.timestamp > oneHourAgo);
  }
}

// Global mesh network instance
export const meshNetwork = new MeshNetworkManager();
