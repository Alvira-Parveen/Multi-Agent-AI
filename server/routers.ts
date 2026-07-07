import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { nanoid } from "nanoid";
import { invokeLLM, getAvailableModel, generateEmbedding } from "./_core/llm";
import { storagePut } from "./storage";
import { generateAgentResponse, shouldEscalate, AgentType } from "./agents";
import * as pdfParse from "pdf-parse";

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

  chat: router({
    listConversations: protectedProcedure.query(async ({ ctx }) => {
      return db.getConversationsByUserId(ctx.user.id);
    }),

    getConversation: protectedProcedure
      .input(z.object({ conversationId: z.number() }))
      .query(async ({ input, ctx }) => {
        const conversation = await db.getConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Conversation not found" });
        }
        const messages = await db.getMessagesByConversationId(input.conversationId);
        return { conversation, messages };
      }),

    createConversation: protectedProcedure
      .input(z.object({ title: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const sessionId = nanoid();
        const conversation = await db.createConversation(ctx.user.id, sessionId, input.title);
        if (!conversation) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to create conversation" });
        }
        return conversation;
      }),

    sendMessage: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        message: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const conversation = await db.getConversationById(input.conversationId);
        if (!conversation || conversation.userId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
        }

        await db.addMessage(input.conversationId, "user", input.message);
        const intents = await improveIntentDetection(input.message);
        const primaryIntent = intents[0] || "FAQ";
        const context = await retrieveRelevantContext(input.message);
        const agents = routeToAgents(intents);

        const startTime = Date.now();
        const previousMessages = await db.getMessagesByConversationId(input.conversationId);
        const conversationHistory = previousMessages
          .slice(-10)
          .map(m => `${m.role === "user" ? "User" : "Agent (" + m.agentType + ")"}: ${m.content}`)
          .join("\n");

        const isEscalation = shouldEscalate(primaryIntent as AgentType, input.message);
        let aiResponse = "";
        let finalIntent = primaryIntent;

        if (isEscalation) {
          aiResponse = "I understand you are frustrated. I have escalated this ticket immediately to a human manager who will assist you shortly.";
          finalIntent = "Complaint";
          await db.createEscalation(
            input.conversationId,
            `Auto-escalated due to critical keywords`,
            `User message: ${input.message.substring(0, 200)}`
          );
        } else {
          aiResponse = await generateMultiAgentResponse(input.message, intents, context, conversationHistory);
        }
        
        const responseTime = Date.now() - startTime;

        await db.addMessage(input.conversationId, "assistant", aiResponse, finalIntent);
        const messages = await db.getMessagesByConversationId(input.conversationId);
        await db.recordAnalyticsMetric(input.conversationId, finalIntent, agents, responseTime, messages.length);

        return {
          message: aiResponse,
          intent: finalIntent,
          agents,
          responseTime,
        };
      }),
  }),

  kb: router({
    listDocuments: protectedProcedure.query(async () => {
      return db.getKnowledgeDocuments();
    }),

    uploadDocument: protectedProcedure
      .input(z.object({
        documentType: z.enum(["FAQ", "RefundPolicy", "Shipping", "Warranty", "Pricing", "Products", "Installation", "UserManual"]),
        fileName: z.string(),
        fileContent: z.string(),
      }))
      .mutation(async ({ input }) => {
        try {
          const buffer = Buffer.from(input.fileContent, "base64");
          const fileKey = `kb/${Date.now()}_${input.fileName}`;
          const { url } = await storagePut(fileKey, buffer, "application/pdf");

          const doc = await db.addKnowledgeDocument(input.documentType, input.fileName, fileKey, buffer.length);
          if (!doc) {
            throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to store document" });
          }

          const rawText = await extractTextFromBuffer(buffer, input.fileName);
          await processAndEmbedDocument(doc.id, rawText);

          return { success: true, documentId: doc.id, url };
        } catch (error) {
          console.error("Document upload error:", error);
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Failed to upload document" });
        }
      }),

    deleteDocument: protectedProcedure
      .input(z.object({ documentId: z.number() }))
      .mutation(async ({ input }) => {
        const success = await db.deleteKnowledgeDocument(input.documentId);
        if (!success) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Document not found" });
        }
        return { success: true };
      }),
  }),

  analytics: router({
    getOverview: protectedProcedure.query(async () => {
      return db.getAnalyticsOverview();
    }),

    getAgentUsage: protectedProcedure.query(async () => {
      return db.getAgentUsageStats();
    }),
  }),

  escalations: router({
    list: protectedProcedure.query(async () => {
      return db.getEscalations();
    }),

    create: protectedProcedure
      .input(z.object({
        conversationId: z.number(),
        reason: z.string(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        return db.createEscalation(input.conversationId, input.reason, input.notes);
      }),

    updateStatus: protectedProcedure
      .input(z.object({
        escalationId: z.number(),
        status: z.enum(["open", "in_progress", "resolved"]),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const success = await db.updateEscalationStatus(input.escalationId, input.status, input.notes);
        return { success };
      }),
  }),
});

export type AppRouter = typeof appRouter;

async function detectIntent(message: string): Promise<string> {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.match(/\b(payment|invoice|refund|subscription|billing|charge|price)\b/)) {
    return "Billing";
  }
  if (lowerMessage.match(/\b(error|bug|crash|issue|problem|fix|support|help|technical)\b/)) {
    return "Technical";
  }
  if (lowerMessage.match(/\b(complaint|unhappy|disappointed|bad|poor|terrible|angry|garbage|manager|sue)\b/)) {
    return "Complaint";
  }
  if (lowerMessage.match(/\b(feature|product|spec|capability|what|how|information)\b/)) {
    return "Product";
  }
  
  return "FAQ";
}

function routeToAgents(intents: string[]): string[] {
  return intents;
}

async function retrieveRelevantContext(query: string): Promise<string> {
  try {
    const queryEmbedding = await generateEmbedding(query);
    const dbInstance = await db.getDb();
    if (!dbInstance) return "";

    const { knowledgeChunks } = await import("../drizzle/schema");
    const allChunks = await dbInstance.select().from(knowledgeChunks);
    if (allChunks.length === 0) return "";

    const chunksWithSimilarity = allChunks
      .map(chunk => {
        let similarity = 0;
        if (chunk.embedding) {
          try {
            const chunkVec = JSON.parse(chunk.embedding) as number[];
            similarity = cosineSimilarity(queryEmbedding, chunkVec);
          } catch (e) {
            console.error("Error parsing embedding:", e);
          }
        }
        return { chunk, similarity };
      })
      .filter(item => item.similarity > 0)
      .sort((a, b) => b.similarity - a.similarity);

    const topChunks = chunksWithSimilarity.slice(0, 3).map(item => item.chunk.chunkText);
    return topChunks.join("\n\n");
  } catch (error) {
    console.error("Error retrieving context:", error);
    return "";
  }
}

async function checkAndCreateEscalation(conversationId: number, intent: string, userMessage: string): Promise<void> {
  try {
    if (shouldEscalate(intent as AgentType, userMessage)) {
      await db.createEscalation(
        conversationId,
        `Auto-escalated from ${intent} agent due to critical keywords`,
        `User message: ${userMessage.substring(0, 200)}`
      );
    }
  } catch (error) {
    console.error("Error checking escalation:", error);
  }
}

async function improveIntentDetection(message: string): Promise<string[]> {
  try {
    const model = await getAvailableModel();
    const response = await invokeLLM({
      model,
      messages: [
        {
          role: "system",
          content: "You are an intent classifier. Classify the user message into one or more of these categories: Billing, Technical, Product, Complaint, FAQ. Respond with a JSON array of matching categories, e.g. [\"Billing\", \"Technical\"]. Do not include markdown backticks or any explanation, just the raw JSON array.",
        },
        {
          role: "user",
          content: message,
        },
      ],
      maxTokens: 50,
    });

    const messageContent = response.choices[0]?.message?.content;
    if (typeof messageContent === "string") {
      const cleanContent = messageContent.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanContent);
      if (Array.isArray(parsed)) {
        const valid = parsed.filter(item => ["Billing", "Technical", "Product", "Complaint", "FAQ"].includes(item));
        if (valid.length > 0) return valid;
      }
    }
  } catch (error) {
    console.error("Error in LLM intent detection:", error);
  }

  // Fallback to keyword-based detection
  const single = await detectIntent(message);
  return [single];
}

async function generateMultiAgentResponse(
  userMessage: string,
  intents: string[],
  context: string,
  conversationHistory: string
): Promise<string> {
  if (intents.length === 0) intents = ["FAQ"];

  // Run each agent's response generation in parallel
  const agentResponses = await Promise.all(
    intents.map(async (intent) => {
      const response = await generateAgentResponse(
        intent as AgentType,
        userMessage,
        context,
        conversationHistory
      );
      return { intent, response };
    })
  );

  if (agentResponses.length === 1) {
    return agentResponses[0].response;
  }

  try {
    const model = await getAvailableModel();
    const systemPrompt = `You are a central orchestrator and response consolidator for a multi-agent customer support platform.
Your task is to synthesize the inputs from specialized agents into a single, seamless, friendly, and professional response to the customer.
Do NOT repeat introductions or sound disjointed. Make it read like one coherent message from the company.

Conversation History:
${conversationHistory || "No previous history."}

Customer Query: ${userMessage}

Agent Drafts:
${agentResponses.map(r => `[${r.intent} Agent]:\n${r.response}`).join("\n\n")}

Please write the final unified response now.`;

    const response = await invokeLLM({
      model,
      messages: [
        {
          role: "system",
          content: "You are a professional customer support consolidator. Synthesize agent drafts into a single, coherent response.",
        },
        {
          role: "user",
          content: systemPrompt,
        },
      ],
      maxTokens: 600,
    });

    const consolidatedContent = response.choices[0]?.message?.content;
    if (typeof consolidatedContent === "string") {
      return consolidatedContent;
    }
  } catch (error) {
    console.error("Error in response consolidation:", error);
  }

  // Fallback to concatenation
  return agentResponses.map(r => `[${r.intent} Support] ${r.response}`).join("\n\n");
}

async function processAndEmbedDocument(documentId: number, rawText: string): Promise<void> {
  try {
    const chunks = splitText(rawText, 800, 200);

    for (let i = 0; i < chunks.length; i++) {
      const chunkText = chunks[i];
      const embeddingArray = await generateEmbedding(chunkText);
      const embeddingStr = JSON.stringify(embeddingArray);

      await db.addKnowledgeChunk(
        documentId,
        chunkText,
        i,
        embeddingStr,
        { source: "document", chunkIndex: i }
      );
    }
  } catch (error) {
    console.error("Error processing document:", error);
  }
}

async function extractTextFromBuffer(buffer: Buffer, fileName: string): Promise<string> {
  const isPdf = fileName.toLowerCase().endsWith(".pdf");
  if (isPdf) {
    let PDFParseClass: any = (pdfParse as any).PDFParse || (pdfParse as any).default?.PDFParse;
    if (!PDFParseClass) {
      const { createRequire } = await import("module");
      const requireFn = createRequire(import.meta.url);
      const mod = requireFn("pdf-parse");
      PDFParseClass = mod.PDFParse;
    }
    const parser = new PDFParseClass({ data: buffer });
    const result = await parser.getText();
    return result.text;
  }
  return buffer.toString("utf-8");
}

function splitText(text: string, chunkSize = 800, overlap = 200): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    let end = start + chunkSize;
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(" ", end);
      if (lastSpace > start + chunkSize - overlap) {
        end = lastSpace;
      }
    }
    chunks.push(text.slice(start, end).trim());
    start = end - overlap;
    if (start < 0 || end >= text.length) break;
  }
  return chunks.filter(c => c.length > 0);
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

