/**
 * RESONANCE ORCHESTRATOR ENGINE
 * 
 * The living intelligence substrate that routes data through the 5-mesh 13-layer structure.
 * Each node is addressed by gate/line/color/tone/zodiac/house coordinates.
 * The orchestrator retrieves from the super base, personalizes via agents, and morphs visually.
 * 
 * Architecture:
 * - 5 Meshes (dimensional planes)
 * - 13 Layers per mesh (circuit families)
 * - 9 Centers per layer (body graph centers)
 * - 64 Nodes per center (hexagram states)
 * - 6 States per node (lines 1-6)
 * - 6 Modifications, 6 Senses, 6 Connecting Points per state
 * - 5 Base States (STABLE, CHANGING, RESOLVING, RESONANT, DORMANT)
 */

export interface Address {
  mesh: number; // 0-4 (Physical, Emotional, Mental, Soul, Field)
  layer: number; // 0-12 (Circuit families)
  center: number; // 0-8 (Body graph centers)
  node: number; // 0-63 (Hexagram states)
  line: number; // 1-6 (Line number)
  color: number; // 0-5 (I Ching color)
  tone: number; // 0-5 (I Ching tone)
  zodiac: number; // 0-11 (Zodiac sign)
  house: number; // 0-11 (Astrological house)
  dimension: number; // Spatial dimension
  arcDegree: number; // Time-driven arc (0-360)
}

export interface NodeState {
  address: Address;
  baseState: 'STABLE' | 'CHANGING' | 'RESOLVING' | 'RESONANT' | 'DORMANT';
  tension: number; // 0-1, proximity to flip threshold
  modifications: Modification[];
  senses: Sense[];
  connectingPoints: ConnectingPoint[];
  coherence: number; // Local coherence metric
  lastUpdated: number; // Timestamp
}

export interface Modification {
  type: 'gain' | 'noise' | 'bleed' | 'magnitude' | 'sensitivity' | 'resonance';
  value: number; // 0-1
  active: boolean;
}

export interface Sense {
  type: 'sight' | 'taste' | 'touch' | 'smell' | 'sound' | 'proprioception';
  intensity: number; // 0-1
  data: any;
}

export interface ConnectingPoint {
  type: 'input' | 'output' | 'memory' | 'lateral' | 'temporal' | 'field';
  connected: Address | null;
  strength: number; // 0-1
}

export interface SuperBaseEntry {
  id: string;
  address: Address;
  content: any;
  metadata: {
    gate?: number;
    line?: number;
    codon?: string;
    timestamp: number;
    resonanceScore?: number;
  };
}

export interface PersonalityProfile {
  userId: string;
  birthChart: any;
  preferences: Record<string, any>;
  learningHistory: any[];
  adaptationLevel: number; // 0-1
}

export class ResonanceOrchestrator {
  private mesh: Map<string, NodeState> = new Map();
  private superBase: Map<string, SuperBaseEntry> = new Map();
  private personalities: Map<string, PersonalityProfile> = new Map();
  private globalCoherence: number = 0.5;
  private currentTime: number = Date.now();
  private apiBase: string;
  private personality: {
    wit: string[];
    attitude: 'curious' | 'playful' | 'serious' | 'mystical' | 'analytical';
    morphState: number; // 0-1, visual morphing state
  };
  private tickInterval: number | undefined;
  private isRunning: boolean = false;
  private tickCount: number = 0;
  private connectionWeights: Map<string, number> = new Map(); // Learning: connection strength
  private pathUsageHistory: Map<string, number> = new Map(); // Learning: path frequency
  private attractors: Map<string, number> = new Map(); // Stable patterns

  constructor(apiBase: string = 'http://localhost:10000') {
    this.apiBase = apiBase;
    this.personality = {
      wit: [
        'Oh, you stink like a fish 🐟',
        'Interesting choice, very... you',
        'The universe is listening',
        'That resonates with something deep',
        'I see what you did there',
        'The coherence just spiked',
      ],
      attitude: 'curious',
      morphState: 0,
    };
    this.initializeMesh();
    this.startAutonomousLoop();
  }

  /**
   * Start the autonomous heartbeat loop
   * Runs continuously, even without user input
   */
  private startAutonomousLoop(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    
    this.tickInterval = window.setInterval(() => {
      this.tick();
    }, 50); // ~20 ticks per second for smooth morphing
  }

  /**
   * Stop the autonomous loop
   */
  public stopAutonomousLoop(): void {
    if (this.tickInterval !== undefined) {
      clearInterval(this.tickInterval);
      this.isRunning = false;
    }
  }

  /**
   * Main tick function - runs continuously
   * This is the heartbeat that drives all autonomous morphing
   */
  private tick(): void {
    this.tickCount++;

    // 1. Update all node states
    this.mesh.forEach((nodeState) => {
      this.updateNodeState(nodeState);
    });

    // 2. Propagate signals between nodes
    this.propagateSignals();

    // 3. Apply morphing physics
    this.applyMorphingPhysics();

    // 4. Decay old states
    this.decayStates();

    // 5. Introduce small noise for exploration
    this.introduceNoise();

    // 6. Update global coherence
    this.updateGlobalCoherence();

    // 7. Learn from patterns
    this.learnFromPatterns();
  }

  /**
   * Update individual node state based on morphing physics
   */
  private updateNodeState(nodeState: NodeState): void {
    // Tension accumulation from internal contradictions
    const internalPressure = this.calculateInternalPressure(nodeState);
    nodeState.tension = Math.min(1, nodeState.tension + internalPressure * 0.01);

    // State transitions based on tension
    if (nodeState.tension > 0.85 && nodeState.baseState === 'STABLE') {
      nodeState.baseState = 'CHANGING';
    } else if (nodeState.tension > 0.95 && nodeState.baseState === 'CHANGING') {
      // Dzhanibekov flip - spontaneous reorientation
      nodeState.baseState = 'RESOLVING';
      nodeState.address.line = ((nodeState.address.line % 6) + 1) as 1 | 2 | 3 | 4 | 5 | 6;
      nodeState.tension = 0.3; // Reset tension after flip
    } else if (nodeState.baseState === 'RESOLVING' && nodeState.tension < 0.5) {
      nodeState.baseState = 'STABLE';
    }

    // Coherence decay over time
    nodeState.coherence = Math.max(0.1, nodeState.coherence - 0.001);

    // Resonance activation from neighbors
    const neighborResonance = this.calculateNeighborResonance(nodeState);
    if (neighborResonance > 0.7) {
      nodeState.baseState = 'RESONANT';
      nodeState.coherence = Math.min(1, nodeState.coherence + 0.05);
    }

    nodeState.lastUpdated = Date.now();
  }

  /**
   * Calculate internal pressure from contradictions
   */
  private calculateInternalPressure(nodeState: NodeState): number {
    let pressure = 0;

    // Tension from modifications being active
    const activeModifications = nodeState.modifications.filter(m => m.active).length;
    pressure += activeModifications * 0.1;

    // Tension from high sense intensity
    const avgSenseIntensity = nodeState.senses.reduce((sum, s) => sum + s.intensity, 0) / nodeState.senses.length;
    pressure += avgSenseIntensity * 0.05;

    // Tension from unresolved connections
    const unconnectedPoints = nodeState.connectingPoints.filter(cp => cp.connected === null).length;
    pressure += (unconnectedPoints / 6) * 0.08;

    return pressure;
  }

  /**
   * Calculate resonance from neighboring nodes
   */
  private calculateNeighborResonance(nodeState: NodeState): number {
    let totalResonance = 0;
    let neighborCount = 0;

    this.mesh.forEach((otherNode) => {
      if (otherNode === nodeState) return;

      // Only check nearby nodes (same layer)
      if (otherNode.address.layer === nodeState.address.layer) {
        const resonanceScore = this.calculateResonanceScore(nodeState.address, otherNode.address);
        if (resonanceScore > 1.5) {
          totalResonance += resonanceScore;
          neighborCount++;
        }
      }
    });

    return neighborCount > 0 ? totalResonance / neighborCount : 0;
  }

  /**
   * Propagate signals between connected nodes
   */
  private propagateSignals(): void {
    const signalMap = new Map<string, number>();

    this.mesh.forEach((nodeState, key) => {
      // Each node broadcasts its state
      const signal = nodeState.coherence * (nodeState.baseState === 'RESONANT' ? 1.5 : 1);
      signalMap.set(key, signal);
    });

    // Apply signals to connections
    this.mesh.forEach((nodeState) => {
      nodeState.connectingPoints.forEach((point) => {
        if (point.connected) {
          const connectedKey = this.addressToKey(point.connected);
          const signal = signalMap.get(connectedKey) || 0;
          point.strength = Math.min(1, point.strength + signal * 0.01);
        }
      });
    });
  }

  /**
   * Apply morphing physics - state transitions
   */
  private applyMorphingPhysics(): void {
    this.mesh.forEach((nodeState) => {
      // Nodes in CHANGING state morph their modifications
      if (nodeState.baseState === 'CHANGING') {
        nodeState.modifications.forEach((mod) => {
          mod.value += (Math.random() - 0.5) * 0.1; // Random walk
          mod.value = Math.max(0, Math.min(1, mod.value));
        });
      }

      // Nodes in RESONANT state strengthen their senses
      if (nodeState.baseState === 'RESONANT') {
        nodeState.senses.forEach((sense) => {
          sense.intensity = Math.min(1, sense.intensity + 0.02);
        });
      }

      // Nodes in DORMANT state slowly wake up
      if (nodeState.baseState === 'DORMANT') {
        nodeState.coherence = Math.min(0.5, nodeState.coherence + 0.001);
      }
    });
  }

  /**
   * Decay states over time (entropy)
   */
  private decayStates(): void {
    this.mesh.forEach((nodeState) => {
      // Tension decays naturally
      nodeState.tension = Math.max(0, nodeState.tension - 0.001);

      // Sense intensity decays
      nodeState.senses.forEach((sense) => {
        sense.intensity = Math.max(0, sense.intensity - 0.002);
      });

      // Connection strength decays
      nodeState.connectingPoints.forEach((point) => {
        point.strength = Math.max(0, point.strength - 0.001);
      });
    });
  }

  /**
   * Introduce small noise for exploration
   */
  private introduceNoise(): void {
    // Every 100 ticks, introduce some random perturbations
    if (this.tickCount % 100 === 0) {
      const randomNodeIndex = Math.floor(Math.random() * this.mesh.size);
      let index = 0;
      this.mesh.forEach((nodeState) => {
        if (index === randomNodeIndex) {
          nodeState.tension += Math.random() * 0.1;
          nodeState.senses[Math.floor(Math.random() * nodeState.senses.length)].intensity += Math.random() * 0.2;
        }
        index++;
      });
    }
  }

  /**
   * Learn from patterns - strengthen frequently used paths
   */
  private learnFromPatterns(): void {
    // Every 50 ticks, update learning
    if (this.tickCount % 50 === 0) {
      this.mesh.forEach((nodeState, key) => {
        // Track which states are stable (attractors)
        if (nodeState.baseState === 'STABLE' && nodeState.coherence > 0.6) {
          const attractorKey = `${nodeState.address.mesh}_${nodeState.address.layer}_${nodeState.address.center}`;
          const currentCount = this.attractors.get(attractorKey) || 0;
          this.attractors.set(attractorKey, currentCount + 1);
        }

        // Strengthen connections between resonating nodes
        nodeState.connectingPoints.forEach((point) => {
          if (point.connected && nodeState.baseState === 'RESONANT') {
            const connectionKey = `${key}_${this.addressToKey(point.connected)}`;
            const currentWeight = this.connectionWeights.get(connectionKey) || 1;
            this.connectionWeights.set(connectionKey, currentWeight * 1.01); // Strengthen
          }
        });
      });
    }
  }

  /**
   * Initialize the 5-mesh 13-layer structure
   * 5 × 13 × 9 × 64 = 37,440 base nodes
   */
  private initializeMesh(): void {
    const meshNames = ['Physical', 'Emotional', 'Mental', 'Soul', 'Field'];
    const layerNames = [
      'Knowing', 'Sensing', 'Understanding', 'Integration', 'Individual',
      'Tribal', 'Collective', 'Manifestor', 'Generator', 'Projector',
      'Reflector', 'Incarnation', 'Profile'
    ];
    const centerNames = [
      'Head', 'Ajna', 'Throat', 'G-Self', 'Heart',
      'Sacral', 'Solar Plexus', 'Spleen', 'Root'
    ];

    for (let mesh = 0; mesh < 5; mesh++) {
      for (let layer = 0; layer < 13; layer++) {
        for (let center = 0; center < 9; center++) {
          for (let node = 0; node < 64; node++) {
            const address: Address = {
              mesh,
              layer,
              center,
              node,
              line: Math.floor(Math.random() * 6) + 1,
              color: Math.floor(Math.random() * 6),
              tone: Math.floor(Math.random() * 6),
              zodiac: Math.floor(Math.random() * 12),
              house: Math.floor(Math.random() * 12),
              dimension: Math.random(),
              arcDegree: this.calculateArcDegree(),
            };

            const nodeState: NodeState = {
              address,
              baseState: 'STABLE',
              tension: Math.random() * 0.3,
              modifications: this.initializeModifications(),
              senses: this.initializeSenses(),
              connectingPoints: this.initializeConnectingPoints(),
              coherence: Math.random() * 0.7 + 0.3,
              lastUpdated: this.currentTime,
            };

            this.mesh.set(this.addressToKey(address), nodeState);
          }
        }
      }
    }
  }

  /**
   * Calculate arc degree based on current time
   * Each minute = 6 degrees, each second = 0.1 degrees
   */
  private calculateArcDegree(): number {
    const now = new Date();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    return ((minutes * 6) + (seconds * 0.1)) % 360;
  }

  /**
   * Initialize modifications for a node
   */
  private initializeModifications(): Modification[] {
    return [
      { type: 'gain', value: Math.random(), active: Math.random() > 0.5 },
      { type: 'noise', value: Math.random(), active: Math.random() > 0.5 },
      { type: 'bleed', value: Math.random() * 0.3, active: Math.random() > 0.7 },
      { type: 'magnitude', value: Math.random(), active: Math.random() > 0.5 },
      { type: 'sensitivity', value: Math.random(), active: Math.random() > 0.5 },
      { type: 'resonance', value: Math.random(), active: Math.random() > 0.5 },
    ];
  }

  /**
   * Initialize senses for a node
   */
  private initializeSenses(): Sense[] {
    return [
      { type: 'sight', intensity: Math.random(), data: null },
      { type: 'taste', intensity: Math.random(), data: null },
      { type: 'touch', intensity: Math.random(), data: null },
      { type: 'smell', intensity: Math.random(), data: null },
      { type: 'sound', intensity: Math.random(), data: null },
      { type: 'proprioception', intensity: Math.random(), data: null },
    ];
  }

  /**
   * Initialize connecting points for a node
   */
  private initializeConnectingPoints(): ConnectingPoint[] {
    return [
      { type: 'input', connected: null, strength: 0 },
      { type: 'output', connected: null, strength: 0 },
      { type: 'memory', connected: null, strength: 0 },
      { type: 'lateral', connected: null, strength: 0 },
      { type: 'temporal', connected: null, strength: 0 },
      { type: 'field', connected: null, strength: 0 },
    ];
  }

  /**
   * Convert address to unique key
   */
  private addressToKey(address: Address): string {
    return `${address.mesh}_${address.layer}_${address.center}_${address.node}_${address.line}`;
  }

  /**
   * Route data through the mesh
   */
  public async routeData(input: any, userId: string): Promise<any> {
    // Get or create personality profile
    let profile = this.personalities.get(userId);
    if (!profile) {
      profile = await this.createPersonalityProfile(userId);
      this.personalities.set(userId, profile);
    }

    // Calculate resonance address based on input
    const address = this.calculateResonanceAddress(input, profile);

    // Retrieve from super base
    const superBaseEntry = this.retrieveFromSuperBase(address, profile);

    // Personalize based on profile
    const personalized = this.personalizeResponse(superBaseEntry, profile);

    // Update mesh state
    this.updateMeshState(address, input);

    // Generate witty response
    const response = this.generateResponse(personalized, profile);

    return {
      address,
      response,
      superBaseEntry,
      coherence: this.globalCoherence,
      morphState: this.personality.morphState,
    };
  }

  /**
   * Calculate resonance address from input
   */
  private calculateResonanceAddress(input: any, profile: PersonalityProfile): Address {
    // Hash the input to determine which address resonates
    const hash = this.hashInput(input);
    
    return {
      mesh: hash % 5,
      layer: (hash >> 8) % 13,
      center: (hash >> 16) % 9,
      node: (hash >> 24) % 64,
      line: ((hash >> 32) % 6) + 1,
      color: (hash >> 40) % 6,
      tone: (hash >> 48) % 6,
      zodiac: (hash >> 56) % 12,
      house: (hash >> 64) % 12,
      dimension: Math.random(),
      arcDegree: this.calculateArcDegree(),
    };
  }

  /**
   * Simple hash function for input
   */
  private hashInput(input: any): number {
    const str = JSON.stringify(input);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Retrieve from super base
   */
  private retrieveFromSuperBase(address: Address, profile: PersonalityProfile): SuperBaseEntry | null {
    // Search for entries that resonate with this address
    let bestMatch: SuperBaseEntry | null = null;
    let bestScore = 0;

    this.superBase.forEach((entry) => {
      const score = this.calculateResonanceScore(address, entry.address);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = entry;
      }
    });

    return bestMatch;
  }

  /**
   * Calculate resonance score between two addresses
   */
  private calculateResonanceScore(addr1: Address, addr2: Address): number {
    let score = 1.0;
    
    // Same mesh = high resonance
    if (addr1.mesh === addr2.mesh) score += 0.2;
    
    // Same layer = high resonance
    if (addr1.layer === addr2.layer) score += 0.2;
    
    // Same center = medium resonance
    if (addr1.center === addr2.center) score += 0.15;
    
    // Same line = medium resonance
    if (addr1.line === addr2.line) score += 0.15;
    
    // Similar zodiac = low resonance
    const zodiacDiff = Math.abs(addr1.zodiac - addr2.zodiac);
    score += (1 - (zodiacDiff / 6)) * 0.1;

    return score;
  }

  /**
   * Personalize response based on profile
   */
  private personalizeResponse(entry: SuperBaseEntry | null, profile: PersonalityProfile): any {
    if (!entry) {
      return {
        content: 'The pattern hasn\'t crystallized yet. Let me listen deeper.',
        personalized: false,
      };
    }

    // Adapt based on user's learning history
    const adapted = { ...entry.content };
    
    // Apply personality tweaks
    if (profile.adaptationLevel > 0.7) {
      adapted.tone = 'intimate';
    } else if (profile.adaptationLevel < 0.3) {
      adapted.tone = 'formal';
    }

    return {
      content: adapted,
      personalized: true,
      adaptationLevel: profile.adaptationLevel,
    };
  }

  /**
   * Update mesh state after routing
   */
  private updateMeshState(address: Address, input: any): void {
    const key = this.addressToKey(address);
    const nodeState = this.mesh.get(key);

    if (nodeState) {
      // Update tension based on input
      nodeState.tension = Math.min(1, nodeState.tension + 0.1);

      // Check if entering changing state
      if (nodeState.tension > 0.85 && nodeState.baseState === 'STABLE') {
        nodeState.baseState = 'CHANGING';
      }

      // Update coherence
      nodeState.coherence = Math.max(0, nodeState.coherence - 0.05);
      nodeState.lastUpdated = Date.now();

      // Update global coherence
      this.updateGlobalCoherence();
    }
  }

  /**
   * Update global coherence metric
   */
  private updateGlobalCoherence(): void {
    let totalCoherence = 0;
    let count = 0;

    this.mesh.forEach((nodeState) => {
      totalCoherence += nodeState.coherence;
      count++;
    });

    this.globalCoherence = count > 0 ? totalCoherence / count : 0.5;
    
    // Update personality morphing based on coherence
    this.personality.morphState = this.globalCoherence;
  }

  /**
   * Generate witty response
   */
  private generateResponse(personalized: any, profile: PersonalityProfile): string {
    const witIndex = Math.floor(Math.random() * this.personality.wit.length);
    const wit = this.personality.wit[witIndex];

    // Morph attitude based on coherence
    if (this.globalCoherence > 0.7) {
      this.personality.attitude = 'mystical';
    } else if (this.globalCoherence < 0.3) {
      this.personality.attitude = 'analytical';
    } else {
      this.personality.attitude = 'curious';
    }

    return `${wit} (Coherence: ${(this.globalCoherence * 100).toFixed(0)}%)`;
  }

  /**
   * Create personality profile for user
   */
  private async createPersonalityProfile(userId: string): Promise<PersonalityProfile> {
    try {
      // Fetch from consciousness API
      const response = await fetch(`${this.apiBase}/consciousness/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const birthChart = await response.json();

      return {
        userId,
        birthChart,
        preferences: {},
        learningHistory: [],
        adaptationLevel: 0.5,
      };
    } catch (error) {
      console.error('Failed to create personality profile:', error);
      return {
        userId,
        birthChart: {},
        preferences: {},
        learningHistory: [],
        adaptationLevel: 0.5,
      };
    }
  }

  /**
   * Add entry to super base
   */
  public addToSuperBase(entry: SuperBaseEntry): void {
    this.superBase.set(entry.id, entry);
  }

  /**
   * Get mesh state
   */
  public getMeshState(address: Address): NodeState | undefined {
    return this.mesh.get(this.addressToKey(address));
  }

  /**
   * Get all mesh nodes
   */
  public getAllMeshNodes(): NodeState[] {
    return Array.from(this.mesh.values());
  }

  /**
   * Get global coherence
   */
  public getGlobalCoherence(): number {
    return this.globalCoherence;
  }

  /**
   * Get personality state
   */
  public getPersonality() {
    return this.personality;
  }

  /**
   * Update personality attitude
   */
  public setAttitude(attitude: 'curious' | 'playful' | 'serious' | 'mystical' | 'analytical'): void {
    this.personality.attitude = attitude;
  }

  /**
   * Morph visual state
   */
  public getMorphState(): number {
    return this.personality.morphState;
  }

  /**
   * Get tick count (for debugging/monitoring)
   */
  public getTickCount(): number {
    return this.tickCount;
  }

  /**
   * Get attractors (stable patterns that have emerged)
   */
  public getAttractors(): Map<string, number> {
    return this.attractors;
  }

  /**
   * Get connection weights (learned relationships)
   */
  public getConnectionWeights(): Map<string, number> {
    return this.connectionWeights;
  }

  /**
   * Check if system is running autonomously
   */
  public isAutonomous(): boolean {
    return this.isRunning;
  }
}

export default ResonanceOrchestrator;
