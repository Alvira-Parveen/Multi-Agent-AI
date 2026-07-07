import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { getLoginUrl } from "@/const";
import { MessageCircle, BarChart3, Settings, LogOut, AlertTriangle, ShieldAlert, HelpCircle, CreditCard, Wrench, BookOpen, Cpu, Layers, User, Terminal, Info, ChevronRight, CheckCircle } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [guideMode, setGuideMode] = useState<"non-tech" | "tech">("non-tech");
  const [activeSection, setActiveSection] = useState<"platform" | "agents" | "guides">("platform");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage("Please enter your username");
      return;
    }
    setSigningIn(true);
    setErrorMessage("");
    try {
      const state = btoa(window.location.origin);
      const sanitized = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
      const finalUsername = sanitized || "user_" + Math.floor(Math.random() * 1000);
      window.location.href = `/api/oauth/callback?code=${finalUsername}&state=${state}`;
    } catch (err) {
      setErrorMessage("Login failed. Please check your credentials.");
      setSigningIn(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage("Please enter a username");
      return;
    }
    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address");
      return;
    }
    setSigningIn(true);
    setErrorMessage("");
    try {
      const state = btoa(window.location.origin);
      const sanitized = username.toLowerCase().replace(/[^a-z0-9_]/g, "");
      const finalUsername = sanitized || "user_" + Math.floor(Math.random() * 1000);
      const encodedName = encodeURIComponent(fullName);
      const encodedEmail = encodeURIComponent(email);
      window.location.href = `/api/oauth/callback?code=${finalUsername}&name=${encodedName}&email=${encodedEmail}&state=${state}`;
    } catch (err) {
      setErrorMessage("Registration failed. Please try again.");
      setSigningIn(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleNavClick = (id: string, section: "platform" | "agents" | "guides") => {
    setActiveSection(section);
    scrollToSection(id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#dddddd] border-t-[#ff385c] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6a6a6a] text-sm">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#ffffff] text-[#222222] font-sans antialiased">
        {/* Top Nav */}
        <header className="h-20 border-b border-[#ebebeb] bg-white sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("platform-section")}>
            <Cpu className="w-8 h-8 text-[#ff385c]" />
            <span className="font-bold text-xl text-[#ff385c] tracking-tight">SupportFlow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
            <span className={`pb-2 cursor-pointer transition-all ${activeSection === "platform" ? "text-[#222222] border-b-2 border-[#ff385c]" : "text-[#6a6a6a] hover:text-[#222222]"}`} onClick={() => handleNavClick("platform-section", "platform")}>Platform</span>
            <span className={`pb-2 cursor-pointer transition-all ${activeSection === "agents" ? "text-[#222222] border-b-2 border-[#ff385c]" : "text-[#6a6a6a] hover:text-[#222222]"}`} onClick={() => handleNavClick("agents-section", "agents")}>Agents</span>
            <span className={`pb-2 cursor-pointer transition-all ${activeSection === "guides" ? "text-[#222222] border-b-2 border-[#ff385c]" : "text-[#6a6a6a] hover:text-[#222222]"}`} onClick={() => handleNavClick("guides-section", "guides")}>Guides</span>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                setAuthMode("register");
                setErrorMessage("");
              }}
              className="text-xs font-bold uppercase tracking-wider text-[#ff385c] border border-[#ff385c] px-3.5 py-2 rounded-full hover:bg-[#ff385c]/5 transition-colors"
            >
              Sign Up
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main id="platform-section" className="max-w-7xl mx-auto px-6 md:px-12 py-12 scroll-mt-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left Column: Platform Overview & Objectives */}
            <div className="lg:col-span-7 space-y-12">
              
              {/* Hero Title */}
              <div>
                <h1 className="text-[32px] font-bold text-[#222222] leading-[1.2] tracking-tight mb-3">
                  Multi-Agent AI Customer Support Platform
                </h1>
                <p className="text-[#6a6a6a] text-sm leading-relaxed max-w-xl">
                  I designed and implemented this platform to route support queries dynamically to specialized domain-specific micro-agents in parallel, Grounding responses using semantic retrieval.
                </p>
              </div>

              {/* Problem / Solution Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border border-[#dddddd] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-[#c13515] font-bold text-[10px] uppercase tracking-wider block mb-2">The Legacy Friction</span>
                  <h3 className="text-base font-bold text-[#222222] mb-2">Rigid Queues & Delay</h3>
                  <p className="text-[#3f3f3f] text-xs leading-relaxed">
                    Keyword bots route users to linear FAQ flows. Multiple requests get split, lost, or trapped under manual triaging loops, driving high friction.
                  </p>
                </div>
                <div className="border border-[#dddddd] rounded-xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow">
                  <span className="text-[#ff385c] font-bold text-[10px] uppercase tracking-wider block mb-2">My Agentic Flow</span>
                  <h3 className="text-base font-bold text-[#222222] mb-2">Parallel Triage & Resolution</h3>
                  <p className="text-[#3f3f3f] text-xs leading-relaxed">
                    My central multi-intent analyzer triggers specialized domain agents simultaneously, retrieving contexts via vector embeddings to generate answers.
                  </p>
                </div>
              </div>

              {/* Meet the Listings (Specialized Agents) */}
              <div id="agents-section" className="space-y-6 scroll-mt-24">
                <div>
                  <h2 className="text-lg font-bold text-[#222222]">Meet my active agent roster</h2>
                  <p className="text-[#6a6a6a] text-xs">Each listing details a domain-specialized AI agent I configured to handle customer inquiries.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Billing Card */}
                  <div className="group border border-[#dddddd] rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 bg-white">
                    <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 relative">
                      <div className="absolute top-3 left-3 bg-white text-[#222222] text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">
                        Billing Agent
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer text-white hover:text-[#ff385c] transition-colors">
                        <CreditCard className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-4 bg-white border-t border-[#ebebeb] space-y-1">
                      <h3 className="text-sm font-bold text-[#222222]">Payment & Subscriptions</h3>
                      <p className="text-[#6a6a6a] text-xs">Handles invoices, subscription locks, refund claims, and receipts.</p>
                    </div>
                  </div>

                  {/* Technical Card */}
                  <div className="group border border-[#dddddd] rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 bg-white">
                    <div className="h-40 bg-gradient-to-br from-emerald-400 to-teal-600 relative">
                      <div className="absolute top-3 left-3 bg-white text-[#222222] text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">
                        Technical Agent
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer text-white hover:text-[#ff385c] transition-colors">
                        <Wrench className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-4 bg-white border-t border-[#ebebeb] space-y-1">
                      <h3 className="text-sm font-bold text-[#222222]">Errors & Troubleshoot</h3>
                      <p className="text-[#6a6a6a] text-xs">Fixes connection bugs, database logs, startup failures, and resets.</p>
                    </div>
                  </div>

                  {/* Product Card */}
                  <div className="group border border-[#dddddd] rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 bg-white">
                    <div className="h-40 bg-gradient-to-br from-purple-500 to-pink-600 relative">
                      <div className="absolute top-3 left-3 bg-white text-[#222222] text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">
                        Product Agent
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer text-white hover:text-[#ff385c] transition-colors">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-4 bg-white border-t border-[#ebebeb] space-y-1">
                      <h3 className="text-sm font-bold text-[#222222]">Details & Pricing Tiers</h3>
                      <p className="text-[#6a6a6a] text-xs">Details active comparison sheets, features list, and availability.</p>
                    </div>
                  </div>

                  {/* Complaint Card */}
                  <div className="group border border-[#dddddd] rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 bg-white">
                    <div className="h-40 bg-gradient-to-br from-red-400 to-orange-500 relative">
                      <div className="absolute top-3 left-3 bg-white text-[#222222] text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">
                        Complaint Agent
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer text-white hover:text-[#ff385c] transition-colors">
                        <ShieldAlert className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-4 bg-white border-t border-[#ebebeb] space-y-1">
                      <h3 className="text-sm font-bold text-[#222222]">Customer Satisfaction</h3>
                      <p className="text-[#6a6a6a] text-xs">Triages critical issues and auto-opens support escalation tickets.</p>
                    </div>
                  </div>

                  {/* FAQ Card */}
                  <div className="group border border-[#dddddd] rounded-xl overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-300 md:col-span-2 bg-white">
                    <div className="h-40 bg-gradient-to-br from-amber-400 to-yellow-600 relative">
                      <div className="absolute top-3 left-3 bg-white text-[#222222] text-[10px] font-bold uppercase px-2 py-1 rounded shadow-sm">
                        FAQ Agent
                      </div>
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur flex items-center justify-center cursor-pointer text-white hover:text-[#ff385c] transition-colors">
                        <HelpCircle className="w-4 h-4" />
                      </div>
                    </div>
                    <div className="p-4 bg-white border-t border-[#ebebeb] space-y-1">
                      <h3 className="text-sm font-bold text-[#222222]">Semantic RAG Knowledge Base</h3>
                      <p className="text-[#6a6a6a] text-xs">Processes returns, warranties, and shipping details uploaded directly by administrators.</p>
                    </div>
                  </div>

                </div>
              </div>

              {/* User Guide Tab Section */}
              <div id="guides-section" className="space-y-4 scroll-mt-24">
                <div className="flex border-b border-[#dddddd] pb-2 items-center justify-between">
                  <h2 className="text-lg font-bold text-[#222222]">Interactive User Guide</h2>
                  <div className="flex gap-4 text-xs font-bold">
                    <button
                      onClick={() => setGuideMode("non-tech")}
                      className={`pb-2 border-b-2 transition-all ${guideMode === "non-tech" ? "border-[#ff385c] text-[#ff385c]" : "border-transparent text-[#6a6a6a] hover:text-[#222222]"}`}
                    >
                      Non-Technical User
                    </button>
                    <button
                      onClick={() => setGuideMode("tech")}
                      className={`pb-2 border-b-2 transition-all ${guideMode === "tech" ? "border-[#ff385c] text-[#ff385c]" : "border-transparent text-[#6a6a6a] hover:text-[#222222]"}`}
                    >
                      Technical / Grader
                    </button>
                  </div>
                </div>

                {guideMode === "non-tech" ? (
                  <div className="space-y-3 text-xs text-[#3f3f3f] leading-relaxed">
                    <p>• <strong>Signing Up</strong>: Create a profile to access my platform and test my agents.</p>
                    <p>• <strong>Knowledge Ingestion</strong>: Head to the Knowledge Base tab, drag and drop policy PDFs or TXT documents, and witness RAG semantic segmentation in action.</p>
                    <p>• <strong>Agent Routing</strong>: Ask about billing, product specifications, or error messages and observe the specific agents response in real time.</p>
                    <p>• <strong>Escalations</strong>: Express frustration or type "speak to a manager". The Complaint agent logs a ticket instantly in the Escalations console.</p>
                  </div>
                ) : (
                  <div className="space-y-3 text-xs text-[#3f3f3f] leading-relaxed">
                    <p>• <strong>Parallel AI Orchestrator</strong>: Queries are triaged by my LLM-based intent analyzer. Parallel tasks run simultaneously and merge via my consolidated summarizer.</p>
                    <p>• <strong>RAG Vector search</strong>: Computes embeddings using Gemini API to index files in my system and computes match relevance using Cosine Similarity.</p>
                    <p>• <strong>Database</strong>: Runs on my MySQL database to store messages, chat history, and human-in-the-loop escalations via Drizzle ORM.</p>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: Clean White Shadow Auth Card & Specifications stacked */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-8">
              
              {/* Auth Card */}
              <div 
                className="bg-white border border-[#dddddd] rounded-2xl p-8 relative animate-fade-in"
                style={{
                  boxShadow: "rgba(0,0,0,0.02) 0 0 0 1px, rgba(0,0,0,0.04) 0 2px 6px, rgba(0,0,0,0.1) 0 4px 8px"
                }}
              >
                
                {/* Form Tabs */}
                <div className="flex border-b border-[#ebebeb] mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setErrorMessage("");
                    }}
                    className={`flex-1 text-center pb-3 text-sm font-semibold transition-all duration-200 ${authMode === "login" ? "border-b-2 border-[#ff385c] text-[#ff385c]" : "text-[#6a6a6a] hover:text-[#222222]"}`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("register");
                      setErrorMessage("");
                    }}
                    className={`flex-1 text-center pb-3 text-sm font-semibold transition-all duration-200 ${authMode === "register" ? "border-b-2 border-[#ff385c] text-[#ff385c]" : "text-[#6a6a6a] hover:text-[#222222]"}`}
                  >
                    Register
                  </button>
                </div>

                {authMode === "login" ? (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-[#222222]">Welcome back</h2>
                      <p className="text-xs text-[#6a6a6a]">Sign in with your handle to continue.</p>
                    </div>

                    <div className="border border-[#dddddd] rounded-lg p-3 focus-within:border-2 focus-within:border-[#222222] transition-all">
                      <label htmlFor="login-username" className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider mb-1">
                        Username / Handle
                      </label>
                      <input
                        id="login-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. johndoe"
                        className="w-full text-sm text-[#222222] placeholder-[#c1c1c1] focus:outline-none bg-transparent"
                        disabled={signingIn}
                        required
                      />
                    </div>

                    {errorMessage && (
                      <p className="text-[#c13515] text-xs font-semibold bg-[#ffd1da]/10 border border-[#ffd1da] p-3 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {errorMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#ff385c] hover:bg-[#e00b41] active:bg-[#e00b41] text-white h-12 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                      disabled={signingIn}
                    >
                      {signingIn ? "Signing In..." : "Continue"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="text-lg font-bold text-[#222222]">Create profile</h2>
                      <p className="text-xs text-[#6a6a6a]">Register your local user workspace details.</p>
                    </div>

                    <div className="border border-[#dddddd] rounded-lg divide-y divide-[#dddddd] overflow-hidden focus-within:border-2 focus-within:border-[#222222] transition-all">
                      <div className="p-3 bg-white">
                        <label htmlFor="reg-username" className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider mb-0.5">
                          Username
                        </label>
                        <input
                          id="reg-username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="e.g. johndoe"
                          className="w-full text-xs text-[#222222] placeholder-[#c1c1c1] focus:outline-none bg-transparent"
                          disabled={signingIn}
                          required
                        />
                      </div>

                      <div className="p-3 bg-white">
                        <label htmlFor="reg-fullname" className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider mb-0.5">
                          Full Name
                        </label>
                        <input
                          id="reg-fullname"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full text-xs text-[#222222] placeholder-[#c1c1c1] focus:outline-none bg-transparent"
                          disabled={signingIn}
                          required
                        />
                      </div>

                      <div className="p-3 bg-white">
                        <label htmlFor="reg-email" className="block text-[10px] font-bold text-[#222222] uppercase tracking-wider mb-0.5">
                          Email Address
                        </label>
                        <input
                          id="reg-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. john@domain.com"
                          className="w-full text-xs text-[#222222] placeholder-[#c1c1c1] focus:outline-none bg-transparent"
                          disabled={signingIn}
                          required
                        />
                      </div>
                    </div>

                    {errorMessage && (
                      <p className="text-[#c13515] text-xs font-semibold bg-[#ffd1da]/10 border border-[#ffd1da] p-3 rounded-lg flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                        {errorMessage}
                      </p>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-[#ff385c] hover:bg-[#e00b41] active:bg-[#e00b41] text-white h-12 text-sm font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                      disabled={signingIn}
                    >
                      {signingIn ? "Registering..." : "Agree & Register"}
                    </button>
                  </form>
                )}

              </div>

              {/* My Project Specs & Objectives */}
              <div 
                className="border border-[#dddddd] bg-white rounded-2xl p-8 space-y-6"
                style={{
                  boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px"
                }}
              >
                <div className="flex items-center gap-3 border-b border-[#ebebeb] pb-4">
                  <Layers className="w-5 h-5 text-[#ff385c]" />
                  <h3 className="text-base font-bold text-[#222222]">My Project Specs & Objectives</h3>
                </div>

                <div className="space-y-5 text-xs text-[#222222] leading-relaxed">
                  
                  {/* Project Objective */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-[#222222]">Project Objective</h4>
                    <p className="text-[#6a6a6a]">
                      I built this platform to route customer support queries to specialized agents concurrently, using RAG-based cosine similarity to retrieve real-time context from policy uploads and maintaining chat histories in my database.
                    </p>
                  </div>

                  {/* Problem Statement */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-[#222222]">Problem Statement</h4>
                    <p className="text-[#6a6a6a]">
                      I identified that standard customer support tools rely on linear decision-tree loops or monolithic LLM frameworks. Linear bots fail to handle multi-intent inputs (e.g. asking to resolve a billing invoice while reporting a software bug), whereas monolithic setups suffer from context pollution, prompt dilution, and elevated response times.
                    </p>
                  </div>

                  {/* Solution */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-[#222222]">My Solution</h4>
                    <p className="text-[#6a6a6a]">
                      My design implements a central intent classifier that orchestrates concurrent domain-specific agent tasks. I built a custom sliding window chunker (800 character window, 200 overlap) and client-side Cosine Similarity search to index documents, with an automated human escalation queue for unresolved sessions.
                    </p>
                  </div>

                  {/* System Architecture */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-[#222222]">System Architecture</h4>
                    <p className="text-[#6a6a6a]">
                      • <strong>My Ingestion Node</strong>: Parsed text files via Node.js <code>pdf-parse</code> engine, chunked into custom margins.<br />
                      • <strong>My Dispatcher</strong>: Runs intent-matched agents concurrently via async promises.<br />
                      • <strong>My Memory Buffer</strong>: Pulls the latest 10 messages from my MySQL database.<br />
                      • <strong>My Similarity Search</strong>: Client-side Cosine Similarity matching local vector index records.<br />
                      • <strong>My Escalations Queue</strong>: Tracks unresolvable sessions and updates statuses.
                    </p>
                  </div>

                  {/* Tech Stack */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-[#222222]">My Tech Stack</h4>
                    <div className="flex gap-2 flex-wrap text-[10px] font-semibold text-[#6a6a6a] pt-1">
                      <span className="bg-[#f7f7f7] border border-[#ebebeb] px-2 py-0.5 rounded">React 18</span>
                      <span className="bg-[#f7f7f7] border border-[#ebebeb] px-2 py-0.5 rounded">Vite</span>
                      <span className="bg-[#f7f7f7] border border-[#ebebeb] px-2 py-0.5 rounded">Express</span>
                      <span className="bg-[#f7f7f7] border border-[#ebebeb] px-2 py-0.5 rounded">tRPC</span>
                      <span className="bg-[#f7f7f7] border border-[#ebebeb] px-2 py-0.5 rounded">MySQL (Port 3307)</span>
                      <span className="bg-[#f7f7f7] border border-[#ebebeb] px-2 py-0.5 rounded">Drizzle ORM</span>
                      <span className="bg-[#f7f7f7] border border-[#ebebeb] px-2 py-0.5 rounded">Gemini LLM</span>
                    </div>
                  </div>

                  {/* Functional Modules */}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-[11px] uppercase tracking-wider text-[#222222]">My Functional Modules</h4>
                    <p className="text-[#6a6a6a]">
                      • <strong>My Chat Portal</strong>: Active sessions, routing indicators, and dynamic history tracking.<br />
                      • <strong>My Ingestion Engine</strong>: Sliding window text chunking and vector storage.<br />
                      • <strong>My Analytics Dashboard</strong>: Telemetry metrics, total message counters, and active agent pie charts.<br />
                      • <strong>My Escalation Tracker</strong>: Human override fields and status flags.
                    </p>
                  </div>

                </div>
              </div>

            </div>

          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#222222] font-sans antialiased flex flex-col">
      {/* Auth Top Header */}
      <header className="h-20 border-b border-[#ebebeb] bg-white sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection("dashboard-top")}>
          <Cpu className="w-8 h-8 text-[#ff385c]" />
          <span className="font-bold text-xl text-[#ff385c] tracking-tight">SupportFlow</span>
        </div>

        {/* Dashboard Products (Clickable anchors scroll to card segments) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold">
          <span className="text-[#222222] border-b-2 border-[#ff385c] pb-2 cursor-pointer" onClick={() => scrollToSection("dashboard-top")}>Homes</span>
          <span className="text-[#6a6a6a] hover:text-[#222222] pb-2 cursor-pointer transition-colors" onClick={() => scrollToSection("chat-card-anchor")}>Experiences <span className="text-[8px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-bold ml-1">NEW</span></span>
          <span className="text-[#6a6a6a] hover:text-[#222222] pb-2 cursor-pointer transition-colors" onClick={() => scrollToSection("services-cards-anchor")}>Services <span className="text-[8px] bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full font-bold ml-1">NEW</span></span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-[#6a6a6a]">Logged in as: <strong className="text-[#222222]">{user?.name}</strong></span>
          <button
            onClick={() => logout()}
            className="text-xs font-semibold text-[#6a6a6a] border border-[#dddddd] px-3.5 py-2 rounded-lg hover:bg-[#f7f7f7] transition-all"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Auth main dashboard view */}
      <main id="dashboard-top" className="max-w-7xl mx-auto px-6 md:px-12 py-12 space-y-12 scroll-mt-24">
        
        {/* Welcome Section */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-[#222222]">Welcome back, {user?.name || "User"}</h1>
          <p className="text-sm text-[#6a6a6a]">Select an interface listing to start managing your AI customer support platform.</p>
        </div>

        {/* Property Grid Listings for Modules (Big 2-column detailed listings) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Chat Listing (Experiences Section) */}
          <div 
            id="chat-card-anchor"
            onClick={() => setLocation("/chat")}
            className="group border border-[#dddddd] rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-black/5 transition-all duration-300 bg-white flex flex-col scroll-mt-24"
            style={{
              boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 8px"
            }}
          >
            <div className="h-60 bg-gradient-to-br from-rose-500 via-rose-500 to-orange-400 relative flex-shrink-0">
              <div className="absolute top-4 left-4 bg-white text-[#222222] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Guest Favorite • Active Experience
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Conversational Hub</p>
                <p className="text-xl font-bold">Parallel Routing Engine</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-[#222222] group-hover:text-[#ff385c] transition-colors">
                    Multi-Agent Chat Interface
                  </h3>
                  <div className="text-right">
                    <span className="text-xs text-[#222222] font-bold flex items-center justify-end gap-0.5">★ 4.98</span>
                    <span className="text-[10px] text-[#6a6a6a] font-medium block">124 active sessions</span>
                  </div>
                </div>
                
                <p className="text-xs text-[#6a6a6a] leading-relaxed">
                  Triggers specialized customer support agents simultaneously. Analyzes multi-intent input text (e.g. requests with both billing questions and tech bugs) and merges drafts into a single cohesive response.
                </p>
              </div>

              <div className="border-t border-[#ebebeb] pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#6a6a6a] font-semibold">
                  <div>• Session Memory (Last 10 msgs)</div>
                  <div>• Auto Response Consolidator</div>
                  <div>• Real-time Agent Logs</div>
                  <div>• Escalation Trigger Handles</div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#ff385c] font-bold uppercase tracking-wider">Database: conversations, messages</span>
                  <span className="font-bold text-[#222222] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Open Interface <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Listing (Services Section Start) */}
          <div 
            id="services-cards-anchor"
            onClick={() => setLocation("/analytics")}
            className="group border border-[#dddddd] rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-black/5 transition-all duration-300 bg-white flex flex-col scroll-mt-24"
            style={{
              boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 8px"
            }}
          >
            <div className="h-60 bg-gradient-to-br from-emerald-500 via-emerald-500 to-teal-400 relative flex-shrink-0">
              <div className="absolute top-4 left-4 bg-white text-[#222222] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Management • Service Console
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Telemetry Dashboard</p>
                <p className="text-xl font-bold">Performance Analytics</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-[#222222] group-hover:text-[#ff385c] transition-colors">
                    Analytics Dashboard
                  </h3>
                  <div className="text-right">
                    <span className="text-xs text-[#222222] font-bold flex items-center justify-end gap-0.5">★ 4.92</span>
                    <span className="text-[10px] text-[#6a6a6a] font-medium block">86 metric traces</span>
                  </div>
                </div>
                
                <p className="text-xs text-[#6a6a6a] leading-relaxed">
                  Monitor core business metrics in real-time. Review total logged conversation volumes, overall message frequency, average agent latency (ms), and traffic density across agents using interactive Pie and Cell charts.
                </p>
              </div>

              <div className="border-t border-[#ebebeb] pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#6a6a6a] font-semibold">
                  <div>• Interactive Load Share Breakdown</div>
                  <div>• Latency Telemetry Tracking</div>
                  <div>• Average Message Density Logs</div>
                  <div>• Uptime Quality Metrics</div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#ff385c] font-bold uppercase tracking-wider">Database: analytics_metrics</span>
                  <span className="font-bold text-[#222222] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Open Interface <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Knowledge Base Listing */}
          <div 
            onClick={() => setLocation("/knowledge-base")}
            className="group border border-[#dddddd] rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-black/5 transition-all duration-300 bg-white flex flex-col"
            style={{
              boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 8px"
            }}
          >
            <div className="h-60 bg-gradient-to-br from-purple-500 via-purple-500 to-indigo-500 relative flex-shrink-0">
              <div className="absolute top-4 left-4 bg-white text-[#222222] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                RAG Segmented • Storage Nodes
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                <Settings className="w-5 h-5" />
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Knowledge Corpus</p>
                <p className="text-xl font-bold">Vector Ingestion RAG</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-[#222222] group-hover:text-[#ff385c] transition-colors">
                    Knowledge Base Manager
                  </h3>
                  <div className="text-right">
                    <span className="text-xs text-[#222222] font-bold flex items-center justify-end gap-0.5">★ 4.88</span>
                    <span className="text-[10px] text-[#6a6a6a] font-medium block">98 documents</span>
                  </div>
                </div>
                
                <p className="text-xs text-[#6a6a6a] leading-relaxed">
                  Enhance the platform's response accuracy by uploading company return policies, warranty guidelines, or FAQs. The pipeline parses files, chunks content with overlapping limits, and indexes them using vector similarity.
                </p>
              </div>

              <div className="border-t border-[#ebebeb] pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#6a6a6a] font-semibold">
                  <div>• Sliding Window Chunking (800 char/200 overlap)</div>
                  <div>• Vector Cosine Similarity Search</div>
                  <div>• Drag & Drop PDF, TXT, DOC File Uploads</div>
                  <div>• Dynamic Metadata Tag Indexes</div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#ff385c] font-bold uppercase tracking-wider">Database: knowledge_base, chunks</span>
                  <span className="font-bold text-[#222222] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Open Interface <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Escalations Listing */}
          <div 
            onClick={() => setLocation("/escalations")}
            className="group border border-[#dddddd] rounded-xl overflow-hidden cursor-pointer hover:shadow-xl hover:shadow-black/5 transition-all duration-300 bg-white flex flex-col"
            style={{
              boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 8px"
            }}
          >
            <div className="h-60 bg-gradient-to-br from-amber-500 via-amber-500 to-orange-500 relative flex-shrink-0">
              <div className="absolute top-4 left-4 bg-white text-[#222222] text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                Human-in-the-Loop • Critical Alerts
              </div>
              <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="absolute bottom-4 left-4 text-white">
                <p className="text-xs font-semibold uppercase tracking-wider opacity-90">Resolution Console</p>
                <p className="text-xl font-bold">Escalations Manager</p>
              </div>
            </div>
            
            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-bold text-[#222222] group-hover:text-[#ff385c] transition-colors">
                    Escalations Control Panel
                  </h3>
                  <div className="text-right">
                    <span className="text-xs text-[#222222] font-bold flex items-center justify-end gap-0.5">★ 4.85</span>
                    <span className="text-[10px] text-[#6a6a6a] font-medium block">42 cases reviewed</span>
                  </div>
                </div>
                
                <p className="text-xs text-[#6a6a6a] leading-relaxed">
                  Manage critical customer issues requiring human oversight. Review escalated conversation threads, track timestamps, update case status values (`open` ➔ `in_progress` ➔ `resolved`), and log custom resolution notes.
                </p>
              </div>

              <div className="border-t border-[#ebebeb] pt-4 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-[10px] text-[#6a6a6a] font-semibold">
                  <div>• Direct Human Representative Handoff</div>
                  <div>• Real-time Status Synchronization</div>
                  <div>• Case Chronology Timestamps</div>
                  <div>• Resolution Notes Logging</div>
                </div>
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[#ff385c] font-bold uppercase tracking-wider">Database: escalations</span>
                  <span className="font-bold text-[#222222] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Open Interface <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Project Architecture & Details Panel */}
        <section className="border border-[#dddddd] bg-white rounded-xl p-8 space-y-8" style={{ boxShadow: "rgba(0, 0, 0, 0.02) 0 0 0 1px, rgba(0, 0, 0, 0.04) 0 2px 6px" }}>
          <div className="flex items-center gap-3 border-b border-[#ebebeb] pb-4">
            <Layers className="w-6 h-6 text-[#ff385c]" />
            <div>
              <h2 className="text-lg font-bold text-[#222222]">Platform Specifications & Architectural Design</h2>
              <p className="text-xs text-[#6a6a6a]">A deep dive into how our platform handles customer requests and stores information.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-[#222222] uppercase tracking-wider">1. The AI Orchestrator</h3>
              <p className="text-xs text-[#6a6a6a] leading-relaxed">
                When a message is received, a central intent classifier parses the request and outputs a JSON list of matches (e.g. `["Billing", "Technical"]`). The orchestrator spawns execution loops for each matching agent concurrently, retrieving memory contexts (the last 10 messages) to provide contextual accuracy.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-[#222222] uppercase tracking-wider">2. Semantic RAG Search</h3>
              <p className="text-xs text-[#6a6a6a] leading-relaxed">
                Administrators upload FAQ documents or return policies in the Knowledge Base. The backend chunks these documents with sliding windows (800 characters width, 200 overlap) and generates numeric embeddings. When searching, a Cosine Similarity algorithm checks the database and injects the top 3 matches into the prompt.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold text-[#222222] uppercase tracking-wider">3. Relational Schema Map</h3>
              <p className="text-xs text-[#6a6a6a] leading-relaxed">
                The platform is backed by a local MySQL database managed by Drizzle ORM. Active tables include:
              </p>
              <ul className="text-[10px] text-[#6a6a6a] space-y-1 font-mono">
                <li>• `users`: local logins and profiles</li>
                <li>• `conversations`: chat sessions and titles</li>
                <li>• `messages`: history log with agent tags</li>
                <li>• `knowledge_base` & `chunks`: parsed RAG text</li>
                <li>• `escalations`: human review queues</li>
              </ul>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
