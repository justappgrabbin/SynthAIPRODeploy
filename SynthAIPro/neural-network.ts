/**
 * Self-Editing Neural Network for SYNTHAI
 * Allows the AI to suggest and apply updates to its own knowledge base
 */

import { nanoid } from 'nanoid';

export interface NeuralRule {
  ruleId: string;
  category: string;
  ruleName: string;
  ruleContent: string;
  version: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RuleSuggestion {
  suggestionId: string;
  ruleId: string;
  oldContent: string;
  newContent: string;
  reason: string;
  confidence: number;
  suggestedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: number;
  approvedAt?: Date;
}

export interface NeuralNetworkMetrics {
  totalRules: number;
  activeRules: number;
  pendingSuggestions: number;
  approvedSuggestions: number;
  rejectedSuggestions: number;
  averageConfidence: number;
}

/**
 * Neural Network Manager
 */
export class NeuralNetworkManager {
  private rules: Map<string, NeuralRule> = new Map();
  private suggestions: Map<string, RuleSuggestion> = new Map();
  private ruleHistory: Map<string, NeuralRule[]> = new Map();

  /**
   * Initialize with default rules
   */
  constructor() {
    this.initializeDefaultRules();
  }

  /**
   * Initialize with default rules for SYNTHAI
   */
  private initializeDefaultRules(): void {
    const defaultRules: NeuralRule[] = [
      {
        ruleId: nanoid(),
        category: 'response_style',
        ruleName: 'Conversational Tone',
        ruleContent: 'Always maintain a friendly, conversational tone. Use natural language and avoid overly formal speech.',
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ruleId: nanoid(),
        category: 'personalization',
        ruleName: 'Astrology Awareness',
        ruleContent: 'Reference user zodiac sign and life path number when relevant. Adapt communication to their astrological profile.',
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ruleId: nanoid(),
        category: 'task_tracking',
        ruleName: 'Proactive Follow-up',
        ruleContent: 'Automatically remind users about pending commitments. Suggest next steps based on project status.',
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        ruleId: nanoid(),
        category: 'empathy',
        ruleName: 'Emotional Intelligence',
        ruleContent: 'Recognize emotional context in user messages. Respond with empathy and understanding.',
        version: 1,
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    defaultRules.forEach(rule => {
      this.rules.set(rule.ruleId, rule);
      this.ruleHistory.set(rule.ruleId, [rule]);
    });
  }

  /**
   * Get all active rules
   */
  getActiveRules(): NeuralRule[] {
    const rules: NeuralRule[] = [];
    this.rules.forEach(rule => {
      if (rule.active) {
        rules.push(rule);
      }
    });
    return rules;
  }

  /**
   * Get a specific rule by ID
   */
  getRule(ruleId: string): NeuralRule | null {
    return this.rules.get(ruleId) || null;
  }

  /**
   * Get rules by category
   */
  getRulesByCategory(category: string): NeuralRule[] {
    const rules: NeuralRule[] = [];
    this.rules.forEach(rule => {
      if (rule.category === category && rule.active) {
        rules.push(rule);
      }
    });
    return rules;
  }

  /**
   * Create a new rule
   */
  createRule(
    category: string,
    ruleName: string,
    ruleContent: string
  ): NeuralRule {
    const ruleId = nanoid();
    const rule: NeuralRule = {
      ruleId,
      category,
      ruleName,
      ruleContent,
      version: 1,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.rules.set(ruleId, rule);
    this.ruleHistory.set(ruleId, [rule]);
    console.log(`[Neural] Rule created: ${ruleName}`);

    return rule;
  }

  /**
   * Suggest an update to an existing rule
   */
  suggestRuleUpdate(
    ruleId: string,
    newContent: string,
    reason: string,
    confidence: number = 0.8
  ): RuleSuggestion | null {
    const rule = this.rules.get(ruleId);
    if (!rule) {
      console.warn(`[Neural] Rule not found: ${ruleId}`);
      return null;
    }

    const suggestion: RuleSuggestion = {
      suggestionId: nanoid(),
      ruleId,
      oldContent: rule.ruleContent,
      newContent,
      reason,
      confidence: Math.min(1, Math.max(0, confidence)),
      suggestedAt: new Date(),
      status: 'pending',
    };

    this.suggestions.set(suggestion.suggestionId, suggestion);
    console.log(`[Neural] Rule update suggested for ${rule.ruleName} (confidence: ${suggestion.confidence})`);

    return suggestion;
  }

  /**
   * Get pending suggestions
   */
  getPendingSuggestions(): RuleSuggestion[] {
    const suggestions: RuleSuggestion[] = [];
    this.suggestions.forEach(suggestion => {
      if (suggestion.status === 'pending') {
        suggestions.push(suggestion);
      }
    });
    return suggestions;
  }

  /**
   * Approve a rule update suggestion
   */
  approveSuggestion(suggestionId: string, approvedBy: number): NeuralRule | null {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) {
      console.warn(`[Neural] Suggestion not found: ${suggestionId}`);
      return null;
    }

    const rule = this.rules.get(suggestion.ruleId);
    if (!rule) {
      console.warn(`[Neural] Rule not found: ${suggestion.ruleId}`);
      return null;
    }

    const updatedRule: NeuralRule = {
      ...rule,
      ruleContent: suggestion.newContent,
      version: rule.version + 1,
      updatedAt: new Date(),
    };

    this.rules.set(suggestion.ruleId, updatedRule);

    const history = this.ruleHistory.get(suggestion.ruleId) || [];
    history.push(updatedRule);
    this.ruleHistory.set(suggestion.ruleId, history);

    suggestion.status = 'approved';
    suggestion.approvedBy = approvedBy;
    suggestion.approvedAt = new Date();

    console.log(`[Neural] Rule update approved: ${rule.ruleName} (v${updatedRule.version})`);

    return updatedRule;
  }

  /**
   * Reject a rule update suggestion
   */
  rejectSuggestion(suggestionId: string): RuleSuggestion | null {
    const suggestion = this.suggestions.get(suggestionId);
    if (!suggestion) {
      console.warn(`[Neural] Suggestion not found: ${suggestionId}`);
      return null;
    }

    suggestion.status = 'rejected';
    console.log(`[Neural] Rule update rejected: ${suggestion.suggestionId}`);

    return suggestion;
  }

  /**
   * Get rule version history
   */
  getRuleHistory(ruleId: string): NeuralRule[] {
    return this.ruleHistory.get(ruleId) || [];
  }

  /**
   * Rollback rule to a previous version
   */
  rollbackRule(ruleId: string, version: number): NeuralRule | null {
    const history = this.ruleHistory.get(ruleId) || [];
    const targetRule = history.find(r => r.version === version);

    if (!targetRule) {
      console.warn(`[Neural] Version ${version} not found for rule ${ruleId}`);
      return null;
    }

    const rule = this.rules.get(ruleId);
    if (!rule) {
      return null;
    }

    const rolledBackRule: NeuralRule = {
      ...targetRule,
      version: rule.version + 1,
      updatedAt: new Date(),
    };

    this.rules.set(ruleId, rolledBackRule);
    history.push(rolledBackRule);

    console.log(`[Neural] Rule rolled back to version ${version}: ${rule.ruleName}`);

    return rolledBackRule;
  }

  /**
   * Get network metrics
   */
  getMetrics(): NeuralNetworkMetrics {
    const rules: NeuralRule[] = [];
    const suggestions: RuleSuggestion[] = [];

    this.rules.forEach(rule => rules.push(rule));
    this.suggestions.forEach(suggestion => suggestions.push(suggestion));

    const activeRules = rules.filter(r => r.active).length;
    const pendingSuggestions = suggestions.filter(s => s.status === 'pending').length;
    const approvedSuggestions = suggestions.filter(s => s.status === 'approved').length;
    const rejectedSuggestions = suggestions.filter(s => s.status === 'rejected').length;

    const averageConfidence =
      suggestions.length > 0
        ? suggestions.reduce((sum, s) => sum + s.confidence, 0) / suggestions.length
        : 0;

    return {
      totalRules: rules.length,
      activeRules,
      pendingSuggestions,
      approvedSuggestions,
      rejectedSuggestions,
      averageConfidence,
    };
  }

  /**
   * Generate system prompt from active rules
   */
  generateSystemPrompt(): string {
    const rules = this.getActiveRules();
    const rulesByCategory: Record<string, NeuralRule[]> = {};

    rules.forEach(rule => {
      if (!rulesByCategory[rule.category]) {
        rulesByCategory[rule.category] = [];
      }
      rulesByCategory[rule.category].push(rule);
    });

    let prompt = 'You are SYNTHAI, a personal AI agent. Follow these core rules:\n\n';

    Object.entries(rulesByCategory).forEach(([category, categoryRules]) => {
      prompt += `**${category}:**\n`;
      categoryRules.forEach(rule => {
        prompt += `- ${rule.ruleName}: ${rule.ruleContent}\n`;
      });
      prompt += '\n';
    });

    return prompt;
  }
}

export const neuralNetwork = new NeuralNetworkManager();
