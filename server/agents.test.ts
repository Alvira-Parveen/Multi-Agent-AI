import { describe, it, expect } from "vitest";
import { shouldEscalate } from "./agents";

describe("agent escalation detection", () => {
  it("should detect billing escalation keywords", () => {
    const messages = [
      "refund denied",
      "this is fraud!",
      "i have a dispute with this charge",
      "this is unauthorized",
    ];

    messages.forEach(msg => {
      const result = shouldEscalate("Billing", msg);
      expect(result).toBe(true);
    });
  });

  it("should detect technical escalation keywords", () => {
    const messages = [
      "The system is completely down",
      "We have a critical error",
      "Emergency - data loss situation",
    ];

    messages.forEach(msg => {
      const result = shouldEscalate("Technical", msg);
      expect(result).toBe(true);
    });
  });

  it("should detect complaint escalation keywords", () => {
    const messages = [
      "this is absolutely unacceptable",
      "this is the worst experience",
      "never again",
    ];

    messages.forEach(msg => {
      const result = shouldEscalate("Complaint", msg);
      expect(result).toBe(true);
    });
  });

  it("should not escalate normal messages", () => {
    const messages = [
      "What is your pricing?",
      "How do I use this feature?",
      "Can you help me with my order?",
    ];

    messages.forEach(msg => {
      const result = shouldEscalate("FAQ", msg);
      expect(result).toBe(false);
    });
  });
});
