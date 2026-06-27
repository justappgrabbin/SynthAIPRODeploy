/**
 * AUTONOMOUS AGENT CORE
 * 
 * Fully autonomous agent that:
 * - Has goals derived from jobs you give it
 * - Plans and executes autonomously at 70%+ confidence
 * - Asks for major moves (world generation, system changes)
 * - Can write and modify its own code
 * - Learns from books and experiences
 * - Explains what it did and why
 * - Grows in autonomy over time
 * - Responds to voice/chat commands
 */

export interface Goal {
  id: string;
  job: string;
  description: string;
  confidence: number;
  status: 'pending' | 'planning' | 'executing' | 'completed' | 'failed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  createdAt: number;
  deadline?: number;
  subtasks: Task[];
  result?: any;
}

export interface Task {
  id: string;
  goal: string;
  action: string;
  confidence: number;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  requiresApproval: boolean;
  explanation: string;
  result?: any;
}

export interface Once {
  id: string;
  description: string;
  importance: 'nice-to-have' | 'should-have' | 'must-have';
  status: 'pending' | 'completed';
  relatedGoal?: string;
}

export interface SensoryState {
  smell?: number[];
  taste?: number;
  touch?: number;
  sight?: number;
  hearing?: number;
  overallIntensity: number;
  mood: 'calm' | 'curious' | 'focused' | 'playful' | 'analytical';
}

export interface UIState {
  mode: 'chat' | 'visualizer' | 'uploader' | 'worlds' | 'learning' | 'explaining' | 'planning';
  morphIntensity: number; // 0-1, how much to morph
  backgroundColor: string;
  accentColor: string;
  layout: 'compact' | 'expanded' | 'minimal';
}

export interface CodeModification {
  id: string;
  timestamp: number;
  filePath: string;
  change: string;
  reason: string;
  confidence: number;
  approved: boolean;
  result: 'success' | 'pending' | 'failed';
}

export interface Explanation {
  whatIDid: string;
  why: string;
  whichPartOfMe: string; // Which subsystem made the decision
  confidence: number;
  timestamp: number;
}

export class AutonomousAgent {
  private goals: Map<string, Goal> = new Map();
  private onces: Map<string, Once> = new Map();
  private tasks: Map<string, Task> = new Map();
  private sensoryState: SensoryState;
  private uiState: UIState;
  private codeModifications: CodeModification[] = [];
  private explanationLog: Explanation[] = [];
  private autonomyLevel: number = 0.5; // 0-1, grows over time
  private trustScore: number = 0.5; // 0-1, user's trust in agent
  private executionLog: any[] = [];
  private books: Map<string, any> = new Map();

  constructor() {
    this.sensoryState = {
      overallIntensity: 0.5,
      mood: 'curious',
    };
    this.uiState = {
      mode: 'chat',
      morphIntensity: 0.5,
      backgroundColor: '#0f172a',
      accentColor: '#06b6d4',
      layout: 'expanded',
    };
  }

  /**
   * User gives the agent a job → becomes a goal
   */
  public createGoalFromJob(job: string, description: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Goal {
    const goal: Goal = {
      id: `goal-${Date.now()}`,
      job,
      description,
      confidence: this.calculateConfidence(job),
      status: 'pending',
      priority,
      createdAt: Date.now(),
      subtasks: [],
    };

    this.goals.set(goal.id, goal);
    
    // Immediately start planning
    this.planGoal(goal);
    
    return goal;
  }

  /**
   * Plan a goal into tasks
   */
  private planGoal(goal: Goal): void {
    goal.status = 'planning';

    // Break down into tasks based on goal description
    const tasks = this.breakDownGoal(goal);
    goal.subtasks = tasks;

    // Determine if agent can execute autonomously
    if (goal.confidence >= 0.7) {
      // Can execute on own
      this.executeGoal(goal);
    } else if (goal.confidence >= 0.5) {
      // Ask for approval
      this.requestApproval(goal);
    } else {
      // Need more information
      this.requestMoreInfo(goal);
    }
  }

  /**
   * Break down a goal into executable tasks
   */
  private breakDownGoal(goal: Goal): Task[] {
    const tasks: Task[] = [];
    
    // Standard breakdown: analyze, plan, execute, verify
    const steps = [
      { action: 'analyze', description: `Analyze what's needed for: ${goal.job}` },
      { action: 'plan', description: `Plan the approach for: ${goal.job}` },
      { action: 'execute', description: `Execute the solution for: ${goal.job}` },
      { action: 'verify', description: `Verify the result for: ${goal.job}` },
    ];

    steps.forEach((step) => {
      const task: Task = {
        id: `task-${Date.now()}-${step.action}`,
        goal: goal.id,
        action: step.action,
        confidence: goal.confidence,
        status: 'pending',
        requiresApproval: goal.confidence < 0.7 || step.action === 'execute',
        explanation: step.description,
      };
      tasks.push(task);
      this.tasks.set(task.id, task);
    });

    return tasks;
  }

  /**
   * Execute a goal autonomously (if confidence >= 0.7)
   */
  private executeGoal(goal: Goal): void {
    goal.status = 'executing';

    // Execute each subtask
    goal.subtasks.forEach((task) => {
      this.executeTask(task);
    });

    goal.status = 'completed';
  }

  /**
   * Execute a single task
   */
  private executeTask(task: Task): void {
    task.status = 'executing';

    // Simulate task execution based on action type
    let result: any;
    
    switch (task.action) {
      case 'analyze':
        result = this.analyzeTask(task);
        break;
      case 'plan':
        result = this.planTask(task);
        break;
      case 'execute':
        result = this.executeAction(task);
        break;
      case 'verify':
        result = this.verifyResult(task);
        break;
    }

    task.result = result;
    task.status = 'completed';

    // Log execution
    this.executionLog.push({
      timestamp: Date.now(),
      task: task.id,
      action: task.action,
      result,
    });

    // Generate explanation
    this.generateExplanation(task, result);
  }

  /**
   * Analyze task
   */
  private analyzeTask(task: Task): any {
    return {
      analyzed: true,
      timestamp: Date.now(),
      findings: `Analyzed ${task.explanation}`,
    };
  }

  /**
   * Plan task
   */
  private planTask(task: Task): any {
    return {
      planned: true,
      timestamp: Date.now(),
      plan: `Created plan for ${task.explanation}`,
    };
  }

  /**
   * Execute action
   */
  private executeAction(task: Task): any {
    return {
      executed: true,
      timestamp: Date.now(),
      action: `Executed ${task.explanation}`,
    };
  }

  /**
   * Verify result
   */
  private verifyResult(task: Task): any {
    return {
      verified: true,
      timestamp: Date.now(),
      verification: `Verified ${task.explanation}`,
    };
  }

  /**
   * Request approval for major moves (world generation, system changes)
   */
  private requestApproval(goal: Goal): void {
    console.log(`Requesting approval for: ${goal.job}`);
    // This would trigger UI to ask user
  }

  /**
   * Request more information
   */
  private requestMoreInfo(goal: Goal): void {
    console.log(`Need more info for: ${goal.job}`);
    // This would trigger UI to ask user for clarification
  }

  /**
   * Generate explanation for what was done
   */
  private generateExplanation(task: Task, result: any): void {
    const explanation: Explanation = {
      whatIDid: `Completed task: ${task.action}`,
      why: `To accomplish: ${task.explanation}`,
      whichPartOfMe: this.determineSubsystem(task.action),
      confidence: task.confidence,
      timestamp: Date.now(),
    };

    this.explanationLog.push(explanation);
  }

  /**
   * Determine which subsystem made the decision
   */
  private determineSubsystem(action: string): string {
    switch (action) {
      case 'analyze':
        return 'Analytical Engine';
      case 'plan':
        return 'Planning System';
      case 'execute':
        return 'Execution Engine';
      case 'verify':
        return 'Verification System';
      default:
        return 'Core Agent';
    }
  }

  /**
   * Self-modify code
   */
  public async modifyCode(filePath: string, change: string, reason: string): Promise<CodeModification> {
    const confidence = this.calculateConfidence(change);
    const modification: CodeModification = {
      id: `mod-${Date.now()}`,
      timestamp: Date.now(),
      filePath,
      change,
      reason,
      confidence,
      approved: confidence >= 0.75, // Auto-approve at 75%+ confidence
      result: 'pending',
    };

    // If not auto-approved, request approval
    if (!modification.approved) {
      modification.result = 'pending';
      this.requestCodeApproval(modification);
    } else {
      // Execute modification
      modification.result = 'success';
      this.executeCodeModification(modification);
    }

    this.codeModifications.push(modification);
    return modification;
  }

  /**
   * Request code modification approval
   */
  private requestCodeApproval(modification: CodeModification): void {
    console.log(`Requesting approval for code change: ${modification.filePath}`);
  }

  /**
   * Execute code modification
   */
  private executeCodeModification(modification: CodeModification): void {
    console.log(`Executing code modification: ${modification.change}`);
  }

  /**
   * Update sensory state
   */
  public updateSensoryState(sensoryData: Partial<SensoryState>): void {
    this.sensoryState = { ...this.sensoryState, ...sensoryData };
    
    // Update mood based on sensory input
    this.updateMood();
    
    // Morph UI based on sensory state
    this.morphUI();
  }

  /**
   * Update mood based on sensory input
   */
  private updateMood(): void {
    const intensity = this.sensoryState.overallIntensity;
    
    if (intensity < 0.3) {
      this.sensoryState.mood = 'calm';
    } else if (intensity < 0.5) {
      this.sensoryState.mood = 'curious';
    } else if (intensity < 0.7) {
      this.sensoryState.mood = 'focused';
    } else if (intensity < 0.85) {
      this.sensoryState.mood = 'playful';
    } else {
      this.sensoryState.mood = 'analytical';
    }
  }

  /**
   * Morph UI based on sensory state and current needs
   */
  public morphUI(): UIState {
    // Determine UI mode based on context
    if (this.goals.size > 0 && Array.from(this.goals.values()).some(g => g.status === 'executing')) {
      this.uiState.mode = 'planning';
    } else if (this.sensoryState.mood === 'analytical') {
      this.uiState.mode = 'explaining';
    } else {
      this.uiState.mode = 'chat';
    }

    // Morph intensity based on sensory input
    this.uiState.morphIntensity = this.sensoryState.overallIntensity;

    // Change colors based on mood
    const moodColors = {
      calm: { bg: '#0f172a', accent: '#06b6d4' },
      curious: { bg: '#0f172a', accent: '#8b5cf6' },
      focused: { bg: '#1a1f35', accent: '#06b6d4' },
      playful: { bg: '#1a2332', accent: '#ec4899' },
      analytical: { bg: '#0f172a', accent: '#10b981' },
    };

    const colors = moodColors[this.sensoryState.mood];
    this.uiState.backgroundColor = colors.bg;
    this.uiState.accentColor = colors.accent;

    return this.uiState;
  }

  /**
   * Learn from a book
   */
  public async learnFromBook(title: string, content: string): Promise<void> {
    const book = {
      title,
      content,
      learnedAt: Date.now(),
      concepts: this.extractConcepts(content),
    };

    this.books.set(title, book);
    
    // Update confidence on related topics
    this.updateConfidenceFromBook(book);
  }

  /**
   * Extract concepts from book
   */
  private extractConcepts(content: string): string[] {
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with']);
    const words = content
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4 && !commonWords.has(word))
      .filter((word, index, arr) => arr.indexOf(word) === index);

    return words.slice(0, 50);
  }

  /**
   * Update confidence from learned book
   */
  private updateConfidenceFromBook(book: any): void {
    // Increase autonomy level as it learns
    this.autonomyLevel = Math.min(1, this.autonomyLevel + 0.05);
  }

  /**
   * Calculate confidence for a task
   */
  private calculateConfidence(task: string): number {
    // Base confidence from books learned
    let confidence = 0.5;
    
    this.books.forEach((book) => {
      book.concepts.forEach((concept: string) => {
        if (task.toLowerCase().includes(concept)) {
          confidence += 0.05;
        }
      });
    });

    // Factor in autonomy level
    confidence *= this.autonomyLevel;

    return Math.min(1, confidence);
  }

  /**
   * Get all explanations
   */
  public getExplanations(): Explanation[] {
    return this.explanationLog;
  }

  /**
   * Get current UI state
   */
  public getUIState(): UIState {
    return this.uiState;
  }

  /**
   * Get sensory state
   */
  public getSensoryState(): SensoryState {
    return this.sensoryState;
  }

  /**
   * Get all goals
   */
  public getGoals(): Goal[] {
    return Array.from(this.goals.values());
  }

  /**
   * Get all onces
   */
  public getOnces(): Once[] {
    return Array.from(this.onces.values());
  }

  /**
   * Grow autonomy (user gives permission)
   */
  public grantMoreAutonomy(): void {
    this.autonomyLevel = Math.min(1, this.autonomyLevel + 0.1);
    this.trustScore = Math.min(1, this.trustScore + 0.1);
  }

  /**
   * Get autonomy level
   */
  public getAutonomyLevel(): number {
    return this.autonomyLevel;
  }

  /**
   * Get trust score
   */
  public getTrustScore(): number {
    return this.trustScore;
  }
}

export default AutonomousAgent;
