import { eq } from "drizzle-orm";
import { and, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, conversations, messages, knowledgeBase, knowledgeChunks, analyticsMetrics, escalations, Conversation, Message, KnowledgeBase, KnowledgeChunk, AnalyticsMetric, Escalation, InsertConversation, InsertMessage, InsertKnowledgeBase, InsertKnowledgeChunk, InsertAnalyticsMetric, InsertEscalation } from "../drizzle/schema";
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

// ============ CONVERSATION QUERIES ============

export async function createConversation(userId: number, sessionId: string, title?: string): Promise<Conversation | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(conversations).values({
    userId,
    sessionId,
    title,
  });
  
  return {
    id: result[0].insertId as number,
    userId,
    sessionId,
    title: title || null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getConversationsByUserId(userId: number): Promise<Conversation[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(conversations).where(eq(conversations.userId, userId)).orderBy(desc(conversations.createdAt));
}

export async function getConversationById(conversationId: number): Promise<Conversation | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

// ============ MESSAGE QUERIES ============

export async function addMessage(conversationId: number, role: "user" | "assistant", content: string, agentType?: string): Promise<Message | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(messages).values({
    conversationId,
    role,
    content,
    agentType: (agentType as any) || "router",
  });
  
  return {
    id: result[0].insertId as number,
    conversationId,
    role,
    content,
    agentType: (agentType as any) || "router",
    timestamp: new Date(),
  };
}

export async function getMessagesByConversationId(conversationId: number): Promise<Message[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(messages).where(eq(messages.conversationId, conversationId)).orderBy(messages.timestamp);
}

// ============ KNOWLEDGE BASE QUERIES ============

export async function addKnowledgeDocument(documentType: string, fileName: string, fileKey: string, fileSize?: number): Promise<KnowledgeBase | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(knowledgeBase).values({
    documentType: documentType as any,
    fileName,
    fileKey,
    fileSize,
  });
  
  return {
    id: result[0].insertId as number,
    documentType: documentType as any,
    fileName,
    fileKey,
    fileSize: fileSize || null,
    uploadedAt: new Date(),
    updatedAt: new Date(),
  };
}

export async function getKnowledgeDocuments(): Promise<KnowledgeBase[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(knowledgeBase).orderBy(desc(knowledgeBase.uploadedAt));
}

export async function deleteKnowledgeDocument(documentId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  await db.delete(knowledgeChunks).where(eq(knowledgeChunks.documentId, documentId));
  await db.delete(knowledgeBase).where(eq(knowledgeBase.id, documentId));
  
  return true;
}

// ============ KNOWLEDGE CHUNKS QUERIES ============

export async function addKnowledgeChunk(documentId: number, chunkText: string, chunkIndex: number, embedding?: string, metadata?: any): Promise<KnowledgeChunk | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(knowledgeChunks).values({
    documentId,
    chunkText,
    chunkIndex,
    embedding,
    metadata,
  });
  
  return {
    id: result[0].insertId as number,
    documentId,
    chunkText,
    chunkIndex,
    embedding: embedding || null,
    metadata: metadata || null,
    createdAt: new Date(),
  };
}

export async function getChunksByDocumentId(documentId: number): Promise<KnowledgeChunk[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(knowledgeChunks).where(eq(knowledgeChunks.documentId, documentId)).orderBy(knowledgeChunks.chunkIndex);
}

// ============ ANALYTICS QUERIES ============

export async function recordAnalyticsMetric(conversationId: number, intentDetected: string, agentsUsed: string[], responseTime: number, messageCount: number): Promise<AnalyticsMetric | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(analyticsMetrics).values({
    conversationId,
    intentDetected: intentDetected as any,
    agentsUsed: JSON.stringify(agentsUsed),
    responseTime,
    messageCount,
  });
  
  return {
    id: result[0].insertId as number,
    conversationId,
    intentDetected: intentDetected as any,
    agentsUsed: JSON.stringify(agentsUsed) as any,
    responseTime,
    satisfactionScore: null,
    messageCount,
    createdAt: new Date(),
  };
}

export async function getAnalyticsOverview(): Promise<{ totalConversations: number; totalMessages: number; avgResponseTime: number }> {
  const db = await getDb();
  if (!db) return { totalConversations: 0, totalMessages: 0, avgResponseTime: 0 };
  
  const result = await db.select({
    totalConversations: sql<number>`COUNT(DISTINCT ${conversations.id})`,
    totalMessages: sql<number>`COUNT(${messages.id})`,
    avgResponseTime: sql<number>`AVG(${analyticsMetrics.responseTime})`,
  }).from(conversations).leftJoin(messages, eq(conversations.id, messages.conversationId)).leftJoin(analyticsMetrics, eq(conversations.id, analyticsMetrics.conversationId));
  
  return result[0] || { totalConversations: 0, totalMessages: 0, avgResponseTime: 0 };
}

export async function getAgentUsageStats(): Promise<any[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    agent: sql<string>`JSON_UNQUOTE(JSON_EXTRACT(${analyticsMetrics.agentsUsed}, '$[0]'))`,
    count: sql<number>`COUNT(*)`,
  }).from(analyticsMetrics).groupBy(sql`JSON_UNQUOTE(JSON_EXTRACT(${analyticsMetrics.agentsUsed}, '$[0]'))`);
}

// ============ ESCALATION QUERIES ============

export async function createEscalation(conversationId: number, reason: string, notes?: string): Promise<Escalation | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(escalations).values({
    conversationId,
    reason,
    notes,
    status: "open",
  });
  
  return {
    id: result[0].insertId as number,
    conversationId,
    reason,
    status: "open",
    notes: notes || null,
    createdAt: new Date(),
    resolvedAt: null,
  };
}

export async function getEscalations(status?: string): Promise<Escalation[]> {
  const db = await getDb();
  if (!db) return [];
  
  if (status) {
    return db.select().from(escalations).where(eq(escalations.status, status as any)).orderBy(desc(escalations.createdAt));
  }
  
  return db.select().from(escalations).orderBy(desc(escalations.createdAt));
}

export async function updateEscalationStatus(escalationId: number, status: string, notes?: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const updateData: any = { status: status as any };
  if (notes) updateData.notes = notes;
  if (status === "resolved") updateData.resolvedAt = new Date();
  
  await db.update(escalations).set(updateData).where(eq(escalations.id, escalationId));
  
  return true;
}
