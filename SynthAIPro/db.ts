import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, conversations, messages, projects, 
  scaffoldingConfigs, integrations, files, agents, 
  knowledgeBase, ruleUpdates, activities 
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// Conversations
export async function createConversation(userId: number, title?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(conversations).values({
    userId,
    title: title || `Conversation ${new Date().toLocaleDateString()}`
  });
}

export async function getConversationsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(conversations).where(eq(conversations.userId, userId));
}

// Messages
export async function addMessage(conversationId: number, userId: number, role: 'user' | 'assistant', content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(messages).values({
    conversationId,
    userId,
    role,
    content
  });
}

export async function getMessagesByConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(messages).where(eq(messages.conversationId, conversationId));
}

// Projects
export async function createProject(userId: number, title: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(projects).values({
    userId,
    title,
    description
  });
}

export async function getProjectsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(projects).where(eq(projects.userId, userId));
}

// Scaffolding Configs
export async function createScaffoldingConfig(name: string, description: string, configData: any, createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(scaffoldingConfigs).values({
    name,
    description,
    configData,
    createdBy
  });
}

export async function getScaffoldingConfigs() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(scaffoldingConfigs);
}

// Integrations
export async function createIntegration(name: string, type: string, configData: any, createdBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(integrations).values({
    name,
    type,
    configData,
    createdBy
  });
}

export async function getIntegrations() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(integrations);
}

// Files
export async function createFile(fileName: string, fileKey: string, url: string, mimeType: string, fileSize: number, uploadedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(files).values({
    fileName,
    fileKey,
    url,
    mimeType,
    fileSize,
    uploadedBy
  });
}

export async function getFiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(files);
}

// Agents (Mesh Network)
export async function createAgent(agentId: string, userId: number, name: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(agents).values({
    agentId,
    userId,
    name,
    description
  });
}

export async function getAgentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents).where(eq(agents.userId, userId));
}

export async function updateAgentStatus(agentId: string, status: 'online' | 'offline' | 'idle') {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(agents).set({ status, lastHeartbeat: new Date() }).where(eq(agents.agentId, agentId));
}

// Knowledge Base
export async function createKnowledgeRule(ruleId: string, category: string, ruleName: string, ruleContent: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(knowledgeBase).values({
    ruleId,
    category,
    ruleName,
    ruleContent
  });
}

export async function getKnowledgeRules() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(knowledgeBase).where(eq(knowledgeBase.active, true));
}

// Rule Updates (Self-Editing)
export async function createRuleUpdate(ruleId: number, suggestedBy: string, newContent: string, reason?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(ruleUpdates).values({
    ruleId,
    suggestedBy,
    newContent,
    reason
  });
}

export async function getPendingRuleUpdates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(ruleUpdates).where(eq(ruleUpdates.status, 'pending'));
}

export async function approveRuleUpdate(updateId: number, approvedBy: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(ruleUpdates).set({ status: 'approved', approvedBy }).where(eq(ruleUpdates.id, updateId));
}

// Activities
export async function createActivity(userId: number, type: string, title: string, description?: string, relatedId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(activities).values({
    userId,
    type,
    title,
    description,
    relatedId
  });
}

export async function getActivitiesByUser(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(activities).where(eq(activities.userId, userId)).limit(limit);
}
