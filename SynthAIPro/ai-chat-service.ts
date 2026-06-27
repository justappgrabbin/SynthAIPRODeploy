/**
 * AI Chat Service for SYNTHAI
 * Integrates Hugging Face LLM with personalization and project tracking
 */

import { huggingFaceLLM, HFMessage } from './huggingface-llm';
import { generatePersonalizationData } from './personalization';
import { getProjectsByUser, getMessagesByConversation } from './db';

export interface AIChatContext {
  userId: number;
  conversationId: number;
  userMessage: string;
  birthDate?: Date;
  zodiacSign?: string;
  lifePathNumber?: number;
  userName?: string;
}

export interface AIChatResponse {
  response: string;
  tokens: number;
  timestamp: Date;
}

/**
 * AI Chat Service
 */
export class AIChatService {
  /**
   * Process user message and generate AI response
   */
  async processMessage(context: AIChatContext): Promise<AIChatResponse> {
    try {
      // Get conversation history
      const conversationHistory = await getMessagesByConversation(context.conversationId);

      // Build message history for LLM
      const hfMessages: HFMessage[] = conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Add current user message
      hfMessages.push({
        role: 'user',
        content: context.userMessage,
      });

      // Get user's projects for context
      const projects = await getProjectsByUser(context.userId);
      const activeProjects = projects.length;
      const recentCommitments = projects.slice(0, 3).map(p => p.title);

      // Prepare personalization context
      const personalizationContext = context.birthDate
        ? generatePersonalizationData(context.birthDate)
        : undefined;

      // Generate response using Hugging Face
      const response = await huggingFaceLLM.generateChatResponse({
        conversationHistory: hfMessages,
        personalizationContext: {
          zodiacSign: context.zodiacSign || personalizationContext?.zodiacSign || 'Unknown',
          lifePathNumber: context.lifePathNumber || personalizationContext?.lifePathNumber || 0,
          name: context.userName || 'Friend',
        },
        projectContext: {
          activeProjects,
          recentCommitments,
        },
        temperature: 0.7,
        maxTokens: 512,
      });

      // Estimate token count (rough approximation)
      const tokens = Math.ceil(response.split(' ').length * 1.3);

      return {
        response,
        tokens,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error('[AI Chat Service] Error processing message:', error);
      throw error;
    }
  }

  /**
   * Stream AI response
   */
  async *streamMessage(context: AIChatContext): AsyncGenerator<string> {
    try {
      // Get conversation history
      const conversationHistory = await getMessagesByConversation(context.conversationId);

      // Build message history for LLM
      const hfMessages: HFMessage[] = conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Add current user message
      hfMessages.push({
        role: 'user',
        content: context.userMessage,
      });

      // Get user's projects for context
      const projects = await getProjectsByUser(context.userId);
      const activeProjects = projects.length;
      const recentCommitments = projects.slice(0, 3).map(p => p.title);

      // Prepare personalization context
      const personalizationContext = context.birthDate
        ? generatePersonalizationData(context.birthDate)
        : undefined;

      // Stream response using Hugging Face
      for await (const chunk of huggingFaceLLM.streamChatResponse({
        conversationHistory: hfMessages,
        personalizationContext: {
          zodiacSign: context.zodiacSign || personalizationContext?.zodiacSign || 'Unknown',
          lifePathNumber: context.lifePathNumber || personalizationContext?.lifePathNumber || 0,
          name: context.userName || 'Friend',
        },
        projectContext: {
          activeProjects,
          recentCommitments,
        },
        temperature: 0.7,
        maxTokens: 512,
      })) {
        yield chunk;
      }
    } catch (error) {
      console.error('[AI Chat Service] Error streaming message:', error);
      throw error;
    }
  }

  /**
   * Generate project-specific suggestions
   */
  async generateProjectSuggestions(userId: number, projectTitle: string): Promise<string[]> {
    try {
      const projects = await getProjectsByUser(userId);
      const currentProject = projects.find(p => p.title === projectTitle);

      if (!currentProject) {
        return [];
      }

      const prompt = `Given a project titled "${projectTitle}", suggest 3 actionable next steps to move it forward. Be concise and practical.`;

      const response = await huggingFaceLLM.generateChatResponse({
        conversationHistory: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        maxTokens: 256,
      });

      // Parse suggestions from response
      const suggestions = response
        .split('\n')
        .filter(line => line.trim().match(/^\d+\.|^-|^•/))
        .map(line => line.replace(/^\d+\.|^-|^•/, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 3);

      return suggestions;
    } catch (error) {
      console.error('[AI Chat Service] Error generating suggestions:', error);
      return [];
    }
  }

  /**
   * Generate commitment reminders
   */
  async generateCommitmentReminder(userId: number, commitmentTitle: string): Promise<string> {
    try {
      const prompt = `Create a friendly and motivating reminder for someone about their commitment: "${commitmentTitle}". Keep it concise and encouraging.`;

      const response = await huggingFaceLLM.generateChatResponse({
        conversationHistory: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        maxTokens: 256,
      });

      return response;
    } catch (error) {
      console.error('[AI Chat Service] Error generating reminder:', error);
      return `Don't forget about your commitment: ${commitmentTitle}`;
    }
  }

  /**
   * Generate personalized greeting
   */
  async generateGreeting(
    userName: string,
    zodiacSign: string,
    lifePathNumber: number
  ): Promise<string> {
    try {
      const prompt = `Generate a warm, personalized greeting for ${userName}, who is a ${zodiacSign} with life path number ${lifePathNumber}. Make it relevant to their astrological profile. Keep it to 1-2 sentences.`;

      const response = await huggingFaceLLM.generateChatResponse({
        conversationHistory: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.8,
        maxTokens: 128,
      });

      return response;
    } catch (error) {
      console.error('[AI Chat Service] Error generating greeting:', error);
      return `Welcome, ${userName}! Let's make today amazing.`;
    }
  }

  /**
   * Analyze sentiment of user message
   */
  async analyzeSentiment(message: string): Promise<'positive' | 'neutral' | 'negative'> {
    try {
      const prompt = `Analyze the sentiment of this message in one word (positive, neutral, or negative): "${message}"`;

      const response = await huggingFaceLLM.generateChatResponse({
        conversationHistory: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        maxTokens: 10,
      });

      const sentiment = response.toLowerCase().trim();

      if (sentiment.includes('positive')) return 'positive';
      if (sentiment.includes('negative')) return 'negative';
      return 'neutral';
    } catch (error) {
      console.error('[AI Chat Service] Error analyzing sentiment:', error);
      return 'neutral';
    }
  }

  /**
   * Extract action items from message
   */
  async extractActionItems(message: string): Promise<string[]> {
    try {
      const prompt = `Extract any action items or tasks mentioned in this message. Return as a numbered list: "${message}"`;

      const response = await huggingFaceLLM.generateChatResponse({
        conversationHistory: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        maxTokens: 256,
      });

      const items = response
        .split('\n')
        .filter(line => line.trim().match(/^\d+\.|^-|^•/))
        .map(line => line.replace(/^\d+\.|^-|^•/, '').trim())
        .filter(line => line.length > 0);

      return items;
    } catch (error) {
      console.error('[AI Chat Service] Error extracting action items:', error);
      return [];
    }
  }
}

// Global instance
export const aiChatService = new AIChatService();
