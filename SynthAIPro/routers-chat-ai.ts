/**
 * AI Chat Router Procedures
 * Add these to the main appRouter in routers.ts
 */

import { protectedProcedure, router } from './_core/trpc';
import { z } from 'zod';
import { aiChatService } from './ai-chat-service';
import { addMessage, getUserById } from './db';

export const aiChatRouter = router({
  /**
   * Send a message and get AI response
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new Error('User not found');

      // Get user details for personalization
      const user = await getUserById(ctx.user.id);
      if (!user) throw new Error('User not found');

      // Save user message
      await addMessage(input.conversationId, ctx.user.id, 'user', input.message);

      // Generate AI response
      const response = await aiChatService.processMessage({
        userId: ctx.user.id,
        conversationId: input.conversationId,
        userMessage: input.message,
        birthDate: user.birthDate || undefined,
        zodiacSign: user.zodiacSign || undefined,
        lifePathNumber: user.lifePathNumber || undefined,
        userName: user.name || 'Friend',
      });

      // Save AI response
      await addMessage(input.conversationId, ctx.user.id, 'assistant', response.response);

      return {
        response: response.response,
        tokens: response.tokens,
        timestamp: response.timestamp,
      };
    }),

  /**
   * Stream AI response
   */
  streamMessage: protectedProcedure
    .input(
      z.object({
        conversationId: z.number(),
        message: z.string().min(1).max(2000),
      })
    )
    .mutation(async function* ({ input, ctx }) {
      if (!ctx.user?.id) throw new Error('User not found');

      // Get user details for personalization
      const user = await getUserById(ctx.user.id);
      if (!user) throw new Error('User not found');

      // Save user message
      await addMessage(input.conversationId, ctx.user.id, 'user', input.message);

      // Stream AI response
      let fullResponse = '';
      for await (const chunk of aiChatService.streamMessage({
        userId: ctx.user.id,
        conversationId: input.conversationId,
        userMessage: input.message,
        birthDate: user.birthDate || undefined,
        zodiacSign: user.zodiacSign || undefined,
        lifePathNumber: user.lifePathNumber || undefined,
        userName: user.name || 'Friend',
      })) {
        fullResponse += chunk;
        yield {
          chunk,
          partial: fullResponse,
        };
      }

      // Save complete AI response
      await addMessage(input.conversationId, ctx.user.id, 'assistant', fullResponse);
    }),

  /**
   * Generate project suggestions
   */
  generateProjectSuggestions: protectedProcedure
    .input(z.object({ projectTitle: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new Error('User not found');
      return aiChatService.generateProjectSuggestions(ctx.user.id, input.projectTitle);
    }),

  /**
   * Generate commitment reminder
   */
  generateReminder: protectedProcedure
    .input(z.object({ commitmentTitle: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.user?.id) throw new Error('User not found');
      return aiChatService.generateCommitmentReminder(ctx.user.id, input.commitmentTitle);
    }),

  /**
   * Generate personalized greeting
   */
  generateGreeting: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user?.id) throw new Error('User not found');

    const user = await getUserById(ctx.user.id);
    if (!user) throw new Error('User not found');

    return aiChatService.generateGreeting(
      user.name || 'Friend',
      user.zodiacSign || 'Unknown',
      user.lifePathNumber || 0
    );
  }),

  /**
   * Analyze sentiment of a message
   */
  analyzeSentiment: protectedProcedure
    .input(z.object({ message: z.string() }))
    .query(async ({ input }) => {
      return aiChatService.analyzeSentiment(input.message);
    }),

  /**
   * Extract action items from message
   */
  extractActionItems: protectedProcedure
    .input(z.object({ message: z.string() }))
    .query(async ({ input }) => {
      return aiChatService.extractActionItems(input.message);
    }),
});
