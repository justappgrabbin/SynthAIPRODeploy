/**
 * META-ORCHESTRATOR
 * 
 * Orchestrates the orchestrator. Takes scattered code pieces and auto-assembles them
 * into a coherent resonance network with embodied worlds, agents, and learning.
 * 
 * Confidence System: 30-45% ask, 46-74% question more, 75%+ proceed
 * Always has a back button. Users can opt-out without forced upgrades.
 */

export interface CodePiece {
  id: string;
  name: string;
  code: string;
  type: 'function' | 'class' | 'module' | 'config' | 'data';
  language: 'typescript' | 'python' | 'javascript';
  codon?: string; // GAT, GCT, etc.
  gate?: number;
  line?: number;
  color?: string;
  tone?: string;
  zodiac?: string;
  house?: number;
  dimension?: string;
  dependencies?: string[];
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  name: string;
  design: {
    gate: number;
    line: number;
    color: string;
    tone: string;
    zodiac: string;
    house: number;
    dimension: string;
  };
  purpose: string;
  skills: string[];
  world: string; // Which embodied world they inhabit
  confidence: number; // 0-1
  learningHistory: any[];
  status: 'dormant' | 'training' | 'active' | 'resonating';
}

export interface EmbodiedWorld {
  id: string;
  name: string;
  description: string;
  agents: Agent[];
  rules: any[];
  events: any[];
  coherence: number;
  attractors: Map<string, number>;
}

export interface Task {
  id: string;
  goal: string;
  confidence: number;
  status: 'pending' | 'delegated' | 'completed' | 'failed';
  assignedAgent?: string;
  subtasks: Task[];
  result?: any;
}

export interface DecisionContext {
  query: string;
  confidence: number;
  action: 'ask' | 'question' | 'proceed';
  reasoning: string;
  backButton: boolean;
}

export class MetaOrchestrator {
  private codePieces: Map<string, CodePiece> = new Map();
  private agents: Map<string, Agent> = new Map();
  private worlds: Map<string, EmbodiedWorld> = new Map();
  private tasks: Map<string, Task> = new Map();
  private knowledgeBase: Map<string, any> = new Map();
  private confidenceHistory: number[] = [];
  private decisionLog: DecisionContext[] = [];
  private learningModels: Map<string, any> = new Map();

  constructor() {
    this.initializeDefaultAgents();
  }

  /**
   * Initialize default agents that embody the resonance network
   */
  private initializeDefaultAgents(): void {
    const designs = [
      { gate: 1, line: 1, color: 'red', tone: 'primary', zodiac: 'aries', house: 1, dimension: 'physical' },
      { gate: 2, line: 2, color: 'orange', tone: 'secondary', zodiac: 'taurus', house: 2, dimension: 'emotional' },
      { gate: 3, line: 3, color: 'yellow', tone: 'tertiary', zodiac: 'gemini', house: 3, dimension: 'mental' },
      { gate: 4, line: 4, color: 'green', tone: 'quaternary', zodiac: 'cancer', house: 4, dimension: 'relational' },
      { gate: 5, line: 5, color: 'blue', tone: 'quinary', zodiac: 'leo', house: 5, dimension: 'creative' },
    ];

    designs.forEach((design, index) => {
      const agent: Agent = {
        id: `agent-${index}`,
        name: `Resonant ${design.zodiac}`,
        design,
        purpose: `Orchestrate ${design.dimension} coherence`,
        skills: ['analysis', 'learning', 'delegation', 'coordination'],
        world: 'primary-world',
        confidence: 0.5,
        learningHistory: [],
        status: 'dormant',
      };
      this.agents.set(agent.id, agent);
    });

    // Create primary world
    const primaryWorld: EmbodiedWorld = {
      id: 'primary-world',
      name: 'Primary Resonance Field',
      description: 'The embodied simulation where agents train and discover purpose',
      agents: Array.from(this.agents.values()),
      rules: [],
      events: [],
      coherence: 0.5,
      attractors: new Map(),
    };
    this.worlds.set(primaryWorld.id, primaryWorld);
  }

  /**
   * Add a code piece to be orchestrated
   */
  public addCodePiece(piece: CodePiece): void {
    this.codePieces.set(piece.id, piece);
    
    // Analyze the code piece for patterns
    this.analyzeCodePiece(piece);
    
    // Try to map it to existing agents or create new ones
    this.mapPieceToAgents(piece);
  }

  /**
   * Analyze a code piece for codon/design patterns
   */
  private analyzeCodePiece(piece: CodePiece): void {
    // Extract patterns from code
    const patterns = this.extractPatterns(piece.code);
    
    // If no explicit design, infer from code patterns
    if (!piece.gate) {
      const inferredDesign = this.inferDesignFromPatterns(patterns);
      piece.gate = inferredDesign.gate;
      piece.line = inferredDesign.line;
      piece.color = inferredDesign.color;
      piece.tone = inferredDesign.tone;
    }

    // Store in knowledge base
    const key = `${piece.gate}_${piece.line}_${piece.type}`;
    this.knowledgeBase.set(key, piece);
  }

  /**
   * Extract patterns from code
   */
  private extractPatterns(code: string): any {
    const patterns: any = {
      hasFunctions: code.includes('function') || code.includes('=>'),
      hasClasses: code.includes('class'),
      hasAsync: code.includes('async'),
      hasLoops: code.includes('for') || code.includes('while'),
      hasConditionals: code.includes('if') || code.includes('switch'),
      complexity: code.split('\n').length,
    };
    return patterns;
  }

  /**
   * Infer design from code patterns
   */
  private inferDesignFromPatterns(patterns: any): any {
    let gate = Math.floor(Math.random() * 64) + 1;
    let line = Math.floor(Math.random() * 6) + 1;
    
    // Heuristic: more complex code → higher gate number
    if (patterns.complexity > 100) gate = Math.min(64, gate + 10);
    if (patterns.hasClasses) gate = Math.min(64, gate + 5);
    if (patterns.hasAsync) line = Math.min(6, line + 1);

    const colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
    const tones = ['primary', 'secondary', 'tertiary', 'quaternary', 'quinary'];
    const zodiacs = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

    return {
      gate,
      line,
      color: colors[gate % colors.length],
      tone: tones[line % tones.length],
      zodiac: zodiacs[gate % zodiacs.length],
    };
  }

  /**
   * Map code piece to agents
   */
  private mapPieceToAgents(piece: CodePiece): void {
    // Find agents that resonate with this piece's design
    this.agents.forEach((agent) => {
      if (piece.gate && agent.design.gate === piece.gate) {
        // Add piece to agent's skills
        agent.skills.push(piece.name);
        agent.learningHistory.push({
          timestamp: Date.now(),
          learned: piece.name,
          type: piece.type,
        });
      }
    });
  }

  /**
   * Confidence-based decision making
   * 30-45% ask, 46-74% question more, 75%+ proceed
   */
  public makeDecision(query: string): DecisionContext {
    // Calculate confidence based on knowledge base coverage
    const confidence = this.calculateConfidence(query);
    this.confidenceHistory.push(confidence);

    let action: 'ask' | 'question' | 'proceed';
    let reasoning: string;

    if (confidence < 0.45) {
      action = 'ask';
      reasoning = `Low confidence (${(confidence * 100).toFixed(1)}%). Need more context.`;
    } else if (confidence < 0.75) {
      action = 'question';
      reasoning = `Medium confidence (${(confidence * 100).toFixed(1)}%). Have more questions.`;
    } else {
      action = 'proceed';
      reasoning = `High confidence (${(confidence * 100).toFixed(1)}%). Ready to proceed.`;
    }

    const context: DecisionContext = {
      query,
      confidence,
      action,
      reasoning,
      backButton: true, // Always have a back button
    };

    this.decisionLog.push(context);
    return context;
  }

  /**
   * Calculate confidence based on knowledge base coverage
   */
  private calculateConfidence(query: string): number {
    // Extract keywords from query
    const keywords = query.toLowerCase().split(/\s+/);
    
    let matchCount = 0;
    keywords.forEach((keyword) => {
      this.knowledgeBase.forEach((piece) => {
        if (piece.name.toLowerCase().includes(keyword) || 
            piece.code.toLowerCase().includes(keyword)) {
          matchCount++;
        }
      });
    });

    // Confidence = matches / (keywords * total pieces)
    const maxMatches = keywords.length * this.knowledgeBase.size;
    const confidence = Math.min(1, matchCount / Math.max(1, maxMatches * 2));
    
    return confidence;
  }

  /**
   * Delegate a task to an agent
   */
  public delegateTask(goal: string, agentId?: string): Task {
    const task: Task = {
      id: `task-${Date.now()}`,
      goal,
      confidence: this.calculateConfidence(goal),
      status: 'pending',
      subtasks: [],
      result: undefined,
    };

    // Find best agent for this task
    const agent = agentId 
      ? this.agents.get(agentId)
      : this.findBestAgent(goal);

    if (agent) {
      task.assignedAgent = agent.id;
      task.status = 'delegated';
      agent.status = 'active';
      
      // Break down into subtasks
      task.subtasks = this.breakDownTask(goal, agent);
    }

    this.tasks.set(task.id, task);
    return task;
  }

  /**
   * Find the best agent for a task
   */
  private findBestAgent(goal: string): Agent | undefined {
    let bestAgent: Agent | undefined;
    let bestScore = 0;

    this.agents.forEach((agent) => {
      // Score based on skills match and confidence
      const skillMatch = agent.skills.filter(skill => 
        goal.toLowerCase().includes(skill.toLowerCase())
      ).length;
      
      const score = skillMatch * agent.confidence;
      
      if (score > bestScore) {
        bestScore = score;
        bestAgent = agent;
      }
    });

    return bestAgent;
  }

  /**
   * Break down a task into subtasks
   */
  private breakDownTask(goal: string, agent: Agent): Task[] {
    const subtasks: Task[] = [];
    
    // Heuristic: break into analyze, plan, execute, verify
    const steps = ['analyze', 'plan', 'execute', 'verify'];
    
    steps.forEach((step) => {
      subtasks.push({
        id: `subtask-${Date.now()}-${step}`,
        goal: `${step}: ${goal}`,
        confidence: 0.5,
        status: 'pending',
        subtasks: [],
      });
    });

    return subtasks;
  }

  /**
   * Learn from a book or text material
   */
  public async learnFromBook(content: string, title: string): Promise<void> {
    // Extract concepts from text
    const concepts = this.extractConcepts(content);
    
    // Build knowledge graph
    const knowledge = {
      title,
      concepts,
      extractedAt: Date.now(),
      wordCount: content.split(/\s+/).length,
    };

    this.knowledgeBase.set(`book_${title}`, knowledge);

    // Update agent learning
    this.agents.forEach((agent) => {
      agent.learningHistory.push({
        timestamp: Date.now(),
        learned: title,
        type: 'book',
        concepts,
      });
    });
  }

  /**
   * Extract concepts from text
   */
  private extractConcepts(content: string): string[] {
    // Simple concept extraction: capitalize words, filter common words
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
    
    const words = content
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4 && !commonWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index); // Unique

    return words.slice(0, 50); // Top 50 concepts
  }

  /**
   * Build an embodied world
   */
  public buildWorld(name: string, description: string, agentIds?: string[]): EmbodiedWorld {
    const world: EmbodiedWorld = {
      id: `world-${Date.now()}`,
      name,
      description,
      agents: agentIds 
        ? agentIds.map(id => this.agents.get(id)).filter(a => a) as Agent[]
        : Array.from(this.agents.values()),
      rules: [],
      events: [],
      coherence: 0.5,
      attractors: new Map(),
    };

    this.worlds.set(world.id, world);
    
    // Activate agents in the world
    world.agents.forEach((agent) => {
      agent.world = world.id;
      agent.status = 'training';
    });

    return world;
  }

  /**
   * Orchestrate the entire system
   * Takes scattered pieces and assembles them coherently
   */
  public orchestrate(): any {
    const orchestration = {
      timestamp: Date.now(),
      codePieces: this.codePieces.size,
      agents: this.agents.size,
      worlds: this.worlds.size,
      tasks: this.tasks.size,
      averageConfidence: this.confidenceHistory.length > 0 
        ? this.confidenceHistory.reduce((a, b) => a + b) / this.confidenceHistory.length
        : 0.5,
      status: 'coherent',
      assembly: {
        pieces: Array.from(this.codePieces.values()),
        agents: Array.from(this.agents.values()),
        worlds: Array.from(this.worlds.values()),
      },
    };

    return orchestration;
  }

  /**
   * Get decision log
   */
  public getDecisionLog(): DecisionContext[] {
    return this.decisionLog;
  }

  /**
   * Get agents
   */
  public getAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Get worlds
   */
  public getWorlds(): EmbodiedWorld[] {
    return Array.from(this.worlds.values());
  }

  /**
   * Get tasks
   */
  public getTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Get knowledge base
   */
  public getKnowledgeBase(): any {
    return Object.fromEntries(this.knowledgeBase);
  }

  /**
   * Back button - always available
   */
  public goBack(contextId: string): void {
    const context = this.decisionLog.find(c => c.query === contextId);
    if (context) {
      console.log(`Going back from: ${context.query}`);
      // User can always go back without consequences
    }
  }

  /**
   * Opt-out without forced upgrades
   */
  public optOut(feature: string): void {
    console.log(`User opted out of: ${feature}`);
    // No forced upgrades, no consequences
  }
}

export default MetaOrchestrator;
