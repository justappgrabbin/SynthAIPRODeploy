import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { nanoid } from "nanoid";
import { getDb } from "../db";
import { knowledgeBase } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { storagePut } from "../storage";

/**
 * Knowledge Base Router
 * File ingestion, indexing, and retrieval system
 * All files indexed by hexagram address for autonomous retrieval
 */

export const knowledgeRouter = router({
  /**
   * Upload and ingest a document (book, code, PDF, etc.)
   * Stores file in S3 and indexes content by hexagram tags
   */
  ingestDocument: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        contentType: z.enum(["book", "code", "document", "solution"]),
        fileBuffer: z.instanceof(Buffer),
        hexagramTags: z.array(z.number().min(1).max(64)).optional(),
        extractedText: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Upload file to S3
        const fileKey = `knowledge/${ctx.user.id}/${nanoid()}`;
        const { url } = await storagePut(fileKey, input.fileBuffer, "application/octet-stream");

        // Create knowledge base entry
        const hexagramTagsArray = input.hexagramTags || [];

        await db.insert(knowledgeBase).values({
          title: input.title,
          contentType: input.contentType,
          s3Key: fileKey,
          s3Url: url,
          fileSize: input.fileBuffer.length,
          extractedText: input.extractedText || null,
          hexagramTags: hexagramTagsArray,
          uploadedBy: ctx.user.id,
          isPublic: false,
        });

        return {
          success: true,
          fileUrl: url,
          message: `Document "${input.title}" ingested successfully`,
        };
      } catch (error) {
        console.error("[Knowledge] Failed to ingest document:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to ingest document",
        });
      }
    }),

  /**
   * Search knowledge base by hexagram tags
   * Autonomous agents use this to find relevant solutions
   */
  searchByHexagrams: protectedProcedure
    .input(
      z.object({
        hexagramNumbers: z.array(z.number().min(1).max(64)),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Get all knowledge base entries for the user
        const results = await db
          .select()
          .from(knowledgeBase)
          .where(eq(knowledgeBase.uploadedBy, ctx.user.id))
          .limit(input.limit);

        // Filter by hexagram tags
        const filtered = results.filter((doc) => {
          const tags = Array.isArray(doc.hexagramTags) ? doc.hexagramTags : [];
          return tags.some((tag) => input.hexagramNumbers.includes(tag));
        });

        return {
          results: filtered,
          count: filtered.length,
        };
      } catch (error) {
        console.error("[Knowledge] Search failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Search failed",
        });
      }
    }),

  /**
   * Get all knowledge base entries for the user
   */
  listDocuments: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    try {
      const results = await db
        .select()
        .from(knowledgeBase)
        .where(eq(knowledgeBase.uploadedBy, ctx.user.id));

      return results;
    } catch (error) {
      console.error("[Knowledge] List failed:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to list documents",
      });
    }
  }),

  /**
   * Delete a knowledge base entry
   */
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Verify ownership
        const doc = await db
          .select()
          .from(knowledgeBase)
          .where(eq(knowledgeBase.id, input.documentId));

        if (!doc || doc.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        if (doc[0].uploadedBy !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to delete this document",
          });
        }

        // Delete from database
        await db
          .delete(knowledgeBase)
          .where(eq(knowledgeBase.id, input.documentId));

        return {
          success: true,
          message: "Document deleted successfully",
        };
      } catch (error) {
        console.error("[Knowledge] Delete failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete document",
        });
      }
    }),

  /**
   * Tag a document with hexagram addresses for autonomous retrieval
   */
  tagDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        hexagramTags: z.array(z.number().min(1).max(64)),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      try {
        // Verify ownership
        const doc = await db
          .select()
          .from(knowledgeBase)
          .where(eq(knowledgeBase.id, input.documentId));

        if (!doc || doc.length === 0) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Document not found",
          });
        }

        if (doc[0].uploadedBy !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "You do not have permission to tag this document",
          });
        }

        // Update tags
        await db
          .update(knowledgeBase)
          .set({
            hexagramTags: input.hexagramTags,
            updatedAt: new Date(),
          })
          .where(eq(knowledgeBase.id, input.documentId));

        return {
          success: true,
          message: "Document tagged successfully",
        };
      } catch (error) {
        console.error("[Knowledge] Tag failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to tag document",
        });
      }
    }),
});
