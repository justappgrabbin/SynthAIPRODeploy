/**
 * Hugging Face LLM Integration for SYNTHAI
 * Uses Hugging Face Inference API for AI responses
 */

import { neuralNetwork } from './neural-network';

export interface HFMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface HFChatResponse {
  generated_text?: string;
  error?: string;
}

export interface ChatOptions {
  conversationHistory: HFMessage[];
  personalizationContext?: {
    zodiacSign: string;
    lifePathNumber: number;
    name: string;
  };
  projectContext?: {
    activeProjects: number;
    recentCommitments: string[];
  };
  temperature?: number;
  maxTokens?: number;
}

/**
 * Hugging Face LLM Service
 */
export class HuggingFaceLLM {
  private apiKey: string;
  private modelId: string;
  private apiUrl: string;

  constructor(apiKey?: string, modelId: string = 'mistralai/Mistral-7B-Instruct-v0.1') {
    this.apiKey = apiKey || process.env.HUGGINGFACE_API_KEY || '';
    this.modelId = modelId;
    this.apiUrl = `https://api-inference.huggingface.co/models/${this.modelId}`;

    if (!this.apiKey) {
      console.warn('[HF LLM] No Hugging Face API key provided. Set HUGGINGFACE_API_KEY environment variable.');
    }
  }

  /**
   * Generate a chat response using Hugging Face
   */
  async generateChatResponse(options: ChatOptions): Promise<string> {
    try {
      // Build system prompt with neural network rules
      const systemPrompt = this.buildSystemPrompt(options.personalizationContext, options.projectContext);

      // Format messages for Hugging Face
      const formattedMessages = this.formatMessagesForHF([
        { role: 'system', content: systemPrompt },
        ...options.conversationHistory,
      ]);

      // Call Hugging Face API
      const response = await this.callHuggingFaceAPI(formattedMessages, {
        temperature: options.temperature || 0.7,
        max_new_tokens: options.maxTokens || 512,
      });

      if (response.error) {
        console.error('[HF LLM] API Error:', response.error);
        return 'I encountered an error processing your request. Please try again.';
      }

      // Extract generated text
      const generatedText = response.generated_text || '';
      const assistantMessage = this.extractAssistantMessage(generatedText);

      return assistantMessage || 'I apologize, but I could not generate a response. Please try again.';
    } catch (error) {
      console.error('[HF LLM] Error generating response:', error);
      return 'An error occurred while processing your request. Please try again later.';
    }
  }

  /**
   * Stream chat response from Hugging Face
   */
  async *streamChatResponse(options: ChatOptions): AsyncGenerator<string> {
    try {
      const systemPrompt = this.buildSystemPrompt(options.personalizationContext, options.projectContext);

      const formattedMessages = this.formatMessagesForHF([
        { role: 'system', content: systemPrompt },
        ...options.conversationHistory,
      ]);

      // For streaming, we'll use the text generation endpoint
      const stream = await this.streamHuggingFaceAPI(formattedMessages, {
        temperature: options.temperature || 0.7,
        max_new_tokens: options.maxTokens || 512,
      });

      for await (const chunk of stream) {
        if (chunk.token?.text) {
          yield chunk.token.text;
        }
      }
    } catch (error) {
      console.error('[HF LLM] Error streaming response:', error);
      yield 'An error occurred while processing your request.';
    }
  }

  /**
   * Build system prompt with personalization and neural network rules
   */
  private buildSystemPrompt(
    personalization?: ChatOptions['personalizationContext'],
    projectContext?: ChatOptions['projectContext']
  ): string {
    let prompt = neuralNetwork.generateSystemPrompt();

    if (personalization) {
      prompt += `\n\nUser Profile:\n`;
      prompt += `- Name: ${personalization.name}\n`;
      prompt += `- Zodiac Sign: ${personalization.zodiacSign}\n`;
      prompt += `- Life Path Number: ${personalization.lifePathNumber}\n`;
      prompt += `- Personalize responses to align with their astrological and numerological profile.\n`;
    }

    if (projectContext) {
      prompt += `\n\nProject Context:\n`;
      prompt += `- Active Projects: ${projectContext.activeProjects}\n`;
      if (projectContext.recentCommitments.length > 0) {
        prompt += `- Recent Commitments: ${projectContext.recentCommitments.join(', ')}\n`;
      }
      prompt += `- Help track and follow up on these projects and commitments.\n`;
    }

    prompt += `\n\nRespond conversationally and helpfully. Be concise but thorough.`;

    return prompt;
  }

  /**
   * Format messages for Hugging Face API
   */
  private formatMessagesForHF(messages: HFMessage[]): string {
    return messages
      .map(msg => {
        const role = msg.role.charAt(0).toUpperCase() + msg.role.slice(1);
        return `${role}: ${msg.content}`;
      })
      .join('\n');
  }

  /**
   * Extract assistant message from generated text
   */
  private extractAssistantMessage(generatedText: string): string {
    // Look for "Assistant:" prefix and extract text after it
    const assistantMatch = generatedText.match(/Assistant:\s*([\s\S]*?)(?:\n\n|$)/);
    if (assistantMatch && assistantMatch[1]) {
      return assistantMatch[1].trim();
    }

    // If no "Assistant:" prefix, return the last non-empty line
    const lines = generatedText.split('\n').filter(line => line.trim());
    return lines[lines.length - 1] || '';
  }

  /**
   * Call Hugging Face Inference API
   */
  private async callHuggingFaceAPI(
    prompt: string,
    params: { temperature: number; max_new_tokens: number }
  ): Promise<HFChatResponse> {
    if (!this.apiKey) {
      return { error: 'Hugging Face API key not configured' };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: params.temperature,
            max_new_tokens: params.max_new_tokens,
            do_sample: true,
            top_p: 0.95,
            top_k: 50,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('[HF LLM] API Error Response:', error);
        return { error: `API Error: ${response.status}` };
      }

      const data = await response.json();

      // Hugging Face returns an array of objects with generated_text
      if (Array.isArray(data) && data[0]?.generated_text) {
        return { generated_text: data[0].generated_text };
      }

      return { error: 'Unexpected response format' };
    } catch (error) {
      console.error('[HF LLM] Fetch Error:', error);
      return { error: String(error) };
    }
  }

  /**
   * Stream from Hugging Face API
   */
  private async *streamHuggingFaceAPI(
    prompt: string,
    params: { temperature: number; max_new_tokens: number }
  ): AsyncGenerator<any> {
    if (!this.apiKey) {
      console.error('[HF LLM] No API key configured');
      return;
    }

    try {
      const response = await fetch(`${this.apiUrl}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            temperature: params.temperature,
            max_new_tokens: params.max_new_tokens,
            do_sample: true,
            top_p: 0.95,
            top_k: 50,
          },
          stream: true,
        }),
      });

      if (!response.ok) {
        console.error('[HF LLM] Stream API Error:', response.status);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');

        for (let i = 0; i < lines.length - 1; i++) {
          const line = lines[i].trim();
          if (line.startsWith('data:')) {
            try {
              const data = JSON.parse(line.slice(5));
              yield data;
            } catch (e) {
              // Ignore parse errors
            }
          }
        }

        buffer = lines[lines.length - 1];
      }

      if (buffer.trim().startsWith('data:')) {
        try {
          const data = JSON.parse(buffer.slice(5));
          yield data;
        } catch (e) {
          // Ignore parse errors
        }
      }
    } catch (error) {
      console.error('[HF LLM] Stream Error:', error);
    }
  }

  /**
   * List available models
   */
  async getAvailableModels(): Promise<string[]> {
    return [
      'mistralai/Mistral-7B-Instruct-v0.1',
      'meta-llama/Llama-2-7b-chat-hf',
      'tiiuae/falcon-7b-instruct',
      'google/flan-t5-xl',
      'bigscience/bloom',
    ];
  }

  /**
   * Change the model
   */
  setModel(modelId: string): void {
    this.modelId = modelId;
    this.apiUrl = `https://api-inference.huggingface.co/models/${this.modelId}`;
    console.log(`[HF LLM] Model changed to: ${modelId}`);
  }

  /**
   * Get current model
   */
  getModel(): string {
    return this.modelId;
  }
}

// Global instance
export const huggingFaceLLM = new HuggingFaceLLM();
