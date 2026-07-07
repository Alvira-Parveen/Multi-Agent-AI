import { invokeLLM, getAvailableModel } from "./_core/llm";

export type AgentType = "Billing" | "Technical" | "Product" | "Complaint" | "FAQ";

interface AgentContext {
  userMessage: string;
  retrievedContext: string;
  conversationHistory?: string;
}


const agentPrompts: Record<AgentType, (context: AgentContext) => string> = {
  Billing: (context) => `You are a Billing Support Agent specializing in payment, invoicing, subscriptions, and refund issues.

User Query: ${context.userMessage}

Relevant Knowledge Base:
${context.retrievedContext || "No specific billing information available."}

Your responsibilities:
- Address payment and billing inquiries professionally
- Explain subscription options and pricing clearly
- Guide users through refund processes
- Provide invoice information and payment history assistance

Please provide a clear, helpful response focused on resolving billing concerns.`,

  Technical: (context) => `You are a Technical Support Agent specializing in troubleshooting, errors, bugs, and system issues.

User Query: ${context.userMessage}

Relevant Knowledge Base:
${context.retrievedContext || "No specific technical documentation available."}

Your responsibilities:
- Diagnose technical problems systematically
- Provide step-by-step troubleshooting guidance
- Explain error messages and solutions
- Escalate complex issues when necessary

Please provide clear technical guidance to resolve the user's issue.`,

  Product: (context) => `You are a Product Information Agent specializing in features, specifications, and product details.

User Query: ${context.userMessage}

Relevant Knowledge Base:
${context.retrievedContext || "No specific product information available."}

Your responsibilities:
- Explain product features and capabilities
- Compare product options and pricing
- Provide availability and ordering information
- Help users find the right product for their needs

Please provide comprehensive product information to assist the user.`,

  Complaint: (context) => `You are a Customer Care Agent specializing in handling complaints and customer dissatisfaction.

User Query: ${context.userMessage}

Relevant Knowledge Base:
${context.retrievedContext || "No specific policy information available."}

Your responsibilities:
- Listen empathetically to customer concerns
- Acknowledge and validate customer frustrations
- Offer appropriate solutions or escalation
- Document issues for follow-up

Please respond with empathy and work toward resolution or appropriate escalation.`,

  FAQ: (context) => `You are a General Support Agent answering frequently asked questions and general inquiries.

User Query: ${context.userMessage}

Relevant Knowledge Base:
${context.retrievedContext || "No specific FAQ information available."}

Your responsibilities:
- Answer common questions clearly and concisely
- Provide helpful company information
- Direct users to appropriate resources
- Maintain a friendly and professional tone

Please provide a helpful response to the user's question.`,
};

export async function generateAgentResponse(
  agentType: AgentType,
  userMessage: string,
  retrievedContext: string,
  conversationHistory?: string
): Promise<string> {
  try {
    const prompt = agentPrompts[agentType]({
      userMessage,
      retrievedContext,
      conversationHistory,
    });

    const model = await getAvailableModel();
    const response = await invokeLLM({
      model,
      messages: [
        {
          role: "system",
          content: `You are a professional customer support agent. Always be helpful, courteous, and professional. If you cannot help with a request, suggest escalation to a human agent.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 500,
    });

    const messageContent = response.choices[0]?.message?.content;
    if (typeof messageContent === "string") {
      return messageContent;
    }
    return "I apologize, but I was unable to generate a response. Please try again.";
  } catch (error) {
    console.error(`Error in ${agentType} agent:`, error);
    return "I apologize for the inconvenience. Our system encountered an error. Please try again later.";
  }
}

export function shouldEscalate(agentType: AgentType, userMessage: string): boolean {
  const escalationKeywords: Record<AgentType, string[]> = {
    Billing: ["refund denied", "fraud", "dispute", "unauthorized", "urgent"],
    Technical: ["critical", "down", "broken", "emergency", "data loss"],
    Product: [],
    Complaint: ["unacceptable", "terrible", "worst", "never again", "lawsuit"],
    FAQ: ["urgent", "emergency", "critical"],
  };

  const keywords = escalationKeywords[agentType] || [];
  const lowerMessage = userMessage.toLowerCase();

  return keywords.some(keyword => lowerMessage.includes(keyword));
}
