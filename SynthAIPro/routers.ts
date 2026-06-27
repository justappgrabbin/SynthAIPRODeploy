import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from 'zod';
import {
  createConversation,
  getConversationsByUser,
  addMessage,
  getMessagesByConversation,
  createProject,
  getProjectsByUser,
  createScaffoldingConfig,
  getScaffoldingConfigs,
  createIntegration,
  getIntegrations,
  createFile,
  getFiles,
  createAgent,
  getAgentsByUser,
  updateAgentStatus,
  createActivity,
  getActivitiesByUser,
} from './db';
import { generatePersonalizationData, generatePersonalizedGreeting } from './personalization';
import { meshNetwork } from './mesh-network';
import { neuralNetwork } from './neural-network';

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Chat procedures
  chat: router({
    createConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new Error('User not found');
        return createConversation(ctx.user.id, input.title);
      }),

    getConversations: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new Error('User not found');
      return getConversationsByUser(ctx.user.id);
    }),

    addMessage: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          role: z.enum(['user', 'assistant']),
          content: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new Error('User not found');
        return addMessage(input.conversationId, ctx.user.id, input.role, input.content);
      }),

    getMessages: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input }) => {
        return getMessagesByConversation(input.conversationId);
      }),
  }),

  // Projects procedures
  projects: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new Error('User not found');
        const result = await createProject(ctx.user.id, input.title, input.description);
        await createActivity(
          ctx.user.id,
          'project_created',
          `Created project: ${input.title}`,
          input.description
        );
        return result;
      }),

    list: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new Error('User not found');
      return getProjectsByUser(ctx.user.id);
    }),
  }),

  // Personalization procedures
  personalization: router({
    generateData: publicProcedure
      .input(
        z.object({
          birthDate: z.string(),
          birthTime: z.string().optional(),
          birthPlace: z.string().optional(),
        })
      )
      .query(({ input }) => {
        const date = new Date(input.birthDate);
        return generatePersonalizationData(date, input.birthTime);
      }),

    getGreeting: publicProcedure
      .input(
        z.object({
          name: z.string(),
          zodiacSign: z.string(),
          lifePathNumber: z.number(),
        })
      )
      .query(({ input }) => {
        return generatePersonalizedGreeting(input.name, input.zodiacSign, input.lifePathNumber);
      }),
  }),

  // Admin procedures
  admin: router({
    getScaffoldings: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
      return await getScaffoldingConfigs();
    }),

    createScaffolding: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
          configData: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
        if (!ctx.user?.id) throw new Error('User not found');
        return createScaffoldingConfig(input.name, input.description || '', input.configData || {}, ctx.user.id);
      }),

    getIntegrations: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
      return await getIntegrations();
    }),

    createIntegration: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          type: z.string(),
          configData: z.record(z.string(), z.unknown()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
        if (!ctx.user?.id) throw new Error('User not found');
        return createIntegration(input.name, input.type, input.configData || {}, ctx.user.id);
      }),

    getFiles: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
      return await getFiles();
    }),

    uploadFile: protectedProcedure
      .input(
        z.object({
          fileName: z.string(),
          fileKey: z.string(),
          url: z.string(),
          mimeType: z.string().optional(),
          fileSize: z.number().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
        if (!ctx.user?.id) throw new Error('User not found');
        return createFile(input.fileName, input.fileKey, input.url, input.mimeType || '', input.fileSize || 0, ctx.user.id);
      }),
  }),

  // Mesh Network procedures
  meshNetwork: router({
    registerAgent: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          description: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new Error('User not found');
        const agentId = `agent_${ctx.user.id}_${Date.now()}`;
        const result = await createAgent(agentId, ctx.user.id, input.name, input.description);
        meshNetwork.registerAgent({
          agentId,
          userId: ctx.user.id,
          name: input.name,
          status: 'online',
          meshAddress: `user_${ctx.user.id}`,
          lastHeartbeat: new Date(),
        });
        return result;
      }),

    getAgents: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new Error('User not found');
      return getAgentsByUser(ctx.user.id);
    }),

    updateAgentStatus: protectedProcedure
      .input(
        z.object({
          agentId: z.string(),
          status: z.enum(['online', 'offline', 'idle']),
        })
      )
      .mutation(async ({ input }) => {
        meshNetwork.updateAgentHeartbeat(input.agentId, input.status);
        return updateAgentStatus(input.agentId, input.status);
      }),

    getNetworkStats: publicProcedure.query(() => {
      return meshNetwork.getNetworkStats();
    }),
  }),

  // Neural Network procedures
  neuralNetwork: router({
    getActiveRules: publicProcedure.query(() => {
      return neuralNetwork.getActiveRules();
    }),

    getRulesByCategory: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(({ input }) => {
        return neuralNetwork.getRulesByCategory(input.category);
      }),

    getPendingSuggestions: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
      return neuralNetwork.getPendingSuggestions();
    }),

    approveSuggestion: protectedProcedure
      .input(z.object({ suggestionId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
        if (!ctx.user?.id) throw new Error('User not found');
        return neuralNetwork.approveSuggestion(input.suggestionId, ctx.user.id);
      }),

    rejectSuggestion: protectedProcedure
      .input(z.object({ suggestionId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
        return neuralNetwork.rejectSuggestion(input.suggestionId);
      }),

    getMetrics: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') throw new Error('Admin access required');
      return neuralNetwork.getMetrics();
    }),

    getSystemPrompt: publicProcedure.query(() => {
      return neuralNetwork.generateSystemPrompt();
    }),
  }),

  // Activity procedures
  activities: router({
    getActivities: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new Error('User not found');
      return getActivitiesByUser(ctx.user.id, 50);
    }),
  }),
});

export type AppRouter = typeof appRouter;

// Merge AI chat router into the main chat router
// This is handled by the aiChatRouter which extends the chat procedures
