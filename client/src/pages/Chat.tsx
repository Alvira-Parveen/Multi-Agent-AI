import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Send, Plus, Loader2, AlertCircle, Flag, MessageCircle, Cpu } from "lucide-react";
import { toast } from "sonner";

function MarkdownMessage({ content }: { content: string }) {
  // Simple markdown rendering
  const renderMarkdown = (text: string) => {
    return text
      .split('\n')
      .map((line, idx) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Code
        line = line.replace(/`(.*?)`/g, '<code>$1</code>');
        return <div key={idx} dangerouslySetInnerHTML={{ __html: line }} />;
      });
  };

  return <div className="space-y-1">{renderMarkdown(content)}</div>;
}

export default function Chat() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEscalation, setShowEscalation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations } = trpc.chat.listConversations.useQuery();
  const createConvMutation = trpc.chat.createConversation.useMutation();
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const getConvMutation = trpc.chat.getConversation.useQuery(
    conversationId ? { conversationId } : { conversationId: 0 },
    { enabled: !!conversationId }
  );
  const createEscalationMutation = trpc.escalations.create.useMutation();

  if (!isAuthenticated) {
    setLocation("/");
    return null;
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (getConvMutation.data) {
      setMessages(getConvMutation.data.messages);
    }
  }, [getConvMutation.data]);

  const handleNewConversation = async () => {
    try {
      const conv = await createConvMutation.mutateAsync({
        title: `Conversation ${new Date().toLocaleString()}`,
      });
      setConversationId(conv.id);
      setMessages([]);
    } catch (error) {
      toast.error("Failed to create conversation");
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !conversationId || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        conversationId,
        message: userMessage,
      });

      setMessages(prev => [...prev, {
        role: "assistant",
        content: response.message,
        agentType: response.intent,
        agents: response.agents,
        timestamp: new Date(),
      }]);
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEscalate = async () => {
    if (!conversationId) return;
    try {
      await createEscalationMutation.mutateAsync({
        conversationId,
        reason: "User requested escalation",
      });
      toast.success("Issue escalated for human review");
      setShowEscalation(false);
    } catch (error) {
      toast.error("Failed to escalate");
    }
  };

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#222222] font-sans antialiased flex flex-col h-screen">
      {/* Auth Top Header */}
      <header className="h-20 border-b border-[#ebebeb] bg-white sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 cursor-pointer animate-fade-in" onClick={() => setLocation("/")}>
          <Cpu className="w-8 h-8 text-[#ff385c]" />
          <span className="font-bold text-xl text-[#ff385c] tracking-tight">SupportFlow</span>
        </div>

        {/* Dashboard Products (Experiences tab active since they are using Chat) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <span className="text-[#6a6a6a] hover:text-[#222222] pb-2 cursor-pointer transition-colors" onClick={() => setLocation("/")}>Homes</span>
          <span className="text-[#222222] border-b-2 border-[#ff385c] pb-2 cursor-pointer">Experiences <span className="text-[8px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-bold ml-1">NEW</span></span>
          <span className="text-[#6a6a6a] hover:text-[#222222] pb-2 cursor-pointer transition-colors" onClick={() => setLocation("/")}>Services <span className="text-[8px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-bold ml-1">NEW</span></span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-[#6a6a6a]">Logged in as: <strong className="text-[#222222]">{user?.name}</strong></span>
          <button
            onClick={() => setLocation("/")}
            className="text-xs font-semibold text-[#6a6a6a] border border-[#dddddd] px-3.5 py-2 rounded-lg hover:bg-[#f7f7f7] transition-all"
          >
            Dashboard
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden px-6 md:px-12 py-8">
        
        {/* Page Title & Back link */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocation("/")}
              className="p-2 hover:bg-[#f7f7f7] border border-[#dddddd] rounded-full transition-colors flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 text-[#222222]" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-[#222222]">Chat Support</h1>
              <p className="text-xs text-[#6a6a6a]">
                {conversationId ? "Active conversation session" : "No conversation selected"}
              </p>
            </div>
          </div>
          <button
            onClick={handleNewConversation}
            className="bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat
          </button>
        </div>

        {/* Workspace Body */}
        <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* Conversations Sidebar (White outline style) */}
          <div className="w-64 border border-[#dddddd] rounded-xl p-4 overflow-y-auto bg-white flex-shrink-0">
            <h2 className="text-xs font-bold text-[#6a6a6a] mb-4 uppercase tracking-wider">Conversations</h2>
            <div className="space-y-2">
              {conversations?.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setConversationId(conv.id);
                    setMessages([]);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    conversationId === conv.id
                      ? "bg-[#ff385c]/5 border-[#ff385c] text-[#ff385c] font-semibold"
                      : "border-transparent hover:bg-[#f7f7f7] text-[#222222]"
                  }`}
                >
                  <p className="text-sm truncate">{conv.title || "Untitled"}</p>
                  <p className="text-[10px] text-[#6a6a6a] mt-1 font-medium">
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
              {(!conversations || conversations.length === 0) && (
                <p className="text-xs text-[#6a6a6a] text-center py-6">No support sessions found</p>
              )}
            </div>
          </div>

          {/* Main Chat Area (White outline card) */}
          <div className="flex-1 flex flex-col border border-[#dddddd] rounded-xl overflow-hidden bg-white">
            {conversationId ? (
              <>
                {/* Messages Panel */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-white">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-[#f7f7f7] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#dddddd]">
                          <MessageCircle className="w-8 h-8 text-[#6a6a6a]" />
                        </div>
                         <p className="text-sm text-[#6a6a6a] font-medium">Start a conversation with our support agents</p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-md px-4 py-3 rounded-2xl ${
                            msg.role === "user"
                              ? "bg-[#ff385c] text-[#ffffff]"
                              : "bg-[#f7f7f7] text-[#222222] border border-[#ebebeb]"
                          }`}
                        >
                          <div className="text-sm leading-relaxed">
                            {msg.role === "assistant" ? (
                              <MarkdownMessage content={msg.content} />
                            ) : (
                              <p>{msg.content}</p>
                            )}
                          </div>
                          {msg.agentType && msg.role === "assistant" && (
                            <div className="text-[10px] uppercase font-extrabold tracking-wider mt-2 opacity-75 border-t border-[#ebebeb] pt-1 flex justify-between gap-4">
                              <span>Routed to: {msg.agentType} Agent</span>
                              {msg.agents && Array.isArray(msg.agents) && msg.agents.length > 1 && (
                                <span>Collaborated: {msg.agents.join(" + ")}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#f7f7f7] border border-[#ebebeb] px-4 py-3 rounded-2xl">
                        <Loader2 className="w-5 h-5 text-[#ff385c] animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="border-t border-[#ebebeb] p-4 bg-white space-y-3 flex-shrink-0">
                  {showEscalation && (
                    <Card className="bg-[#ffd1da]/10 border-[#ffd1da] p-3 flex items-start gap-3 rounded-lg shadow-sm">
                      <AlertCircle className="w-5 h-5 text-[#c13515] flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-[#222222] font-semibold">Escalate this conversation?</p>
                        <p className="text-xs text-[#6a6a6a] mt-1">Our support team will review this issue</p>
                        <div className="flex gap-2 mt-2.5">
                          <button
                            onClick={handleEscalate}
                            className="bg-[#c13515] hover:bg-[#b32505] text-white text-xs font-bold px-3 py-1.5 rounded"
                          >
                            Confirm Escalation
                          </button>
                          <button
                            onClick={() => setShowEscalation(false)}
                            className="border border-[#dddddd] text-[#222222] hover:bg-[#f7f7f7] text-xs font-bold px-3 py-1.5 rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </Card>
                  )}
                  <form onSubmit={handleSendMessage} className="flex gap-3">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Ask billing, technical, product details..."
                      disabled={isLoading}
                      className="flex-1 bg-transparent border border-[#dddddd] focus:border-[#222222] rounded-xl px-4 text-sm text-[#222222] placeholder-[#c1c1c1] focus:outline-none transition-colors h-11"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !input.trim()}
                      className="bg-[#ff385c] hover:bg-[#e00b41] active:bg-[#e00b41] disabled:bg-[#ffd1da] disabled:cursor-not-allowed text-white px-4 rounded-xl flex items-center justify-center transition-all h-11 shadow-sm"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEscalation(!showEscalation)}
                      className="border border-[#dddddd] hover:bg-[#f7f7f7] text-[#6a6a6a] px-4 rounded-xl flex items-center justify-center transition-all h-11"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="w-16 h-16 bg-[#f7f7f7] rounded-full flex items-center justify-center mx-auto mb-4 border border-[#dddddd]">
                    <MessageCircle className="w-8 h-8 text-[#6a6a6a]" />
                  </div>
                  <p className="text-sm text-[#6a6a6a] mb-4 font-medium">Select a conversation listing or create a new one</p>
                  <button 
                    onClick={handleNewConversation} 
                    className="bg-[#ff385c] hover:bg-[#e00b41] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-all shadow-sm"
                  >
                    Start New Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
