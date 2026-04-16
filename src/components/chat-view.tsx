'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAppStore, type ChatMessage } from '@/store/app-store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DiffViewer } from '@/components/diff-viewer';
import {
  Send,
  Bot,
  User,
  Loader2,
  MessageSquare,
  Trash2,
  Sparkles,
  Code,
  Wrench,
  Globe,
  AlertCircle,
  Copy,
  Check,
  Paperclip,
  Bug,
  GitBranch,
  Server,
  Shield,
  Zap,
  Clock,
  MessageCircle,
  BookOpen,
  Cpu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QUICK_ACTIONS = [
  { icon: AlertCircle, label: 'Why did my deployment fail?', color: '#f85149', desc: 'Debug deployment errors' },
  { icon: Code, label: 'Add a test step to my workflow', color: '#58a6ff', desc: 'Modify CI/CD pipeline' },
  { icon: Wrench, label: 'Build me a user profile page', color: '#3fb950', desc: 'Generate new feature code' },
  { icon: Globe, label: 'Which free platform is best?', color: '#e3b341', desc: 'Compare hosting options' },
];

/* ─── Right Sidebar Data ─── */
const SUGGESTED_TOPICS = [
  { icon: Bug, label: 'Fix build errors', color: '#f85149' },
  { icon: Code, label: 'Add CI/CD pipeline', color: '#58a6ff' },
  { icon: GitBranch, label: 'Branch strategy', color: '#a371f7' },
  { icon: Server, label: 'Environment config', color: '#3fb950' },
  { icon: Shield, label: 'Security best practices', color: '#e3b341' },
  { icon: Globe, label: 'Custom domain setup', color: '#79c0ff' },
];

const RECENT_CONVERSATIONS = [
  { title: 'Vercel deployment 502 error', time: '2 hours ago' },
  { title: 'GitHub Actions workflow optimization', time: '5 hours ago' },
  { title: 'Railway vs Render comparison', time: 'Yesterday' },
];

const AI_CAPABILITIES = [
  { icon: Code, title: 'Code Review', desc: 'Analyze code for bugs & improvements', color: '#58a6ff' },
  { icon: Bug, title: 'Bug Analysis', desc: 'Diagnose errors & suggest fixes', color: '#f85149' },
  { icon: GitBranch, title: 'Workflow Help', desc: 'Build & optimize CI/CD pipelines', color: '#3fb950' },
  { icon: Globe, title: 'Hosting Advice', desc: 'Compare platforms & setup guides', color: '#e3b341' },
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-2">
      <span className="typing-dot-1 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#58a6ff' }} />
      <span className="typing-dot-2 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#58a6ff' }} />
      <span className="typing-dot-3 w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#58a6ff' }} />
    </div>
  );
}

/* ─── Copy Button for Messages ─── */
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-[#30363d]"
      style={{ color: '#8b949e' }}
      title="Copy message"
    >
      {copied ? <Check className="w-3 h-3" style={{ color: '#3fb950' }} /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

/* ─── Code Block Renderer ─── */
function MessageContent({ content }: { content: string }) {
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2">
      {parts.map((part, i) => {
        if (part.startsWith('```') && part.endsWith('```')) {
          const lines = part.slice(3, -3);
          const firstNewline = lines.indexOf('\n');
          const language = firstNewline > 0 ? lines.slice(0, firstNewline).trim() : '';
          const code = firstNewline > 0 ? lines.slice(firstNewline + 1) : lines;

          return (
            <div
              key={i}
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: '#0d1117', border: '1px solid #21262d' }}
            >
              {language && (
                <div
                  className="px-3 py-1.5 text-[10px] font-mono flex items-center justify-between"
                  style={{ backgroundColor: '#161b22', color: '#8b949e', borderBottom: '1px solid #21262d' }}
                >
                  <span>{language}</span>
                  <CopyButton text={code} />
                </div>
              )}
              <pre className="p-3 overflow-x-auto custom-scroll">
                <code className="text-xs font-mono leading-relaxed" style={{ color: '#c9d1d9' }}>
                  {code}
                </code>
              </pre>
            </div>
          );
        }

        const textParts = part.split(/(`[^`]+`)/g);
        return (
          <span key={i} className="whitespace-pre-wrap font-mono text-xs leading-relaxed" style={{ color: '#c9d1d9' }}>
            {textParts.map((tp, j) => {
              if (tp.startsWith('`') && tp.endsWith('`')) {
                return (
                  <code
                    key={j}
                    className="px-1.5 py-0.5 rounded text-[11px]"
                    style={{ backgroundColor: '#161b22', color: '#58a6ff', border: '1px solid #21262d' }}
                  >
                    {tp.slice(1, -1)}
                  </code>
                );
              }
              return <span key={j}>{tp}</span>;
            })}
          </span>
        );
      })}
    </div>
  );
}

export function ChatView() {
  const { chatMessages, addChatMessage, clearChatMessages } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [diffContent, setDiffContent] = useState('');
  const [charCount, setCharCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendMessage = async (message?: string) => {
    const content = message || input;
    if (!content.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };
    addChatMessage(userMsg);
    setInput('');
    setCharCount(0);
    setIsLoading(true);

    try {
      const messages = [...chatMessages, userMsg].map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, mode: 'chat-assistant' }),
      });

      const data = await res.json();
      const aiContent = data.response || 'Sorry, I could not generate a response.';

      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiContent,
        timestamp: new Date().toISOString(),
      });

      // Check if AI response contains a diff
      if (aiContent.includes('---') && aiContent.includes('+++') && aiContent.includes('@@')) {
        setDiffContent(aiContent);
        setShowDiff(true);
      }
    } catch (error) {
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Error: Could not reach AI service. Please try again.',
        timestamp: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (ts: string) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex h-[calc(100vh-140px)]">
      {/* Chat Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#30363d' }}>
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg" style={{ backgroundColor: '#58a6ff15' }}>
              <Sparkles className="w-4 h-4" style={{ color: '#58a6ff' }} />
            </div>
            <div>
              <h2 className="text-sm font-medium" style={{ color: '#c9d1d9' }}>AI Deployment Assistant</h2>
              <p className="text-[10px]" style={{ color: '#8b949e' }}>Ask about deployments, workflows, or hosting</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            style={{ color: '#8b949e' }}
            onClick={() => {
              clearChatMessages();
              setShowDiff(false);
            }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Clear
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4 max-w-3xl mx-auto">
            {chatMessages.length === 0 && !showDiff && (
              /* ─── Better Empty State ─── */
              <div className="text-center py-10 flex flex-col items-center">
                {/* Larger Sparkles icon with pulsing ring */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="relative w-20 h-20 rounded-2xl mx-auto flex items-center justify-center mb-5"
                  style={{ backgroundColor: '#58a6ff10' }}
                >
                  <Sparkles className="w-10 h-10" style={{ color: '#58a6ff' }} />
                  {/* Pulsing ring */}
                  <div className="absolute inset-[-4px] rounded-2xl animate-pulse-ring"
                    style={{
                      border: '2px solid transparent',
                      backgroundImage: 'linear-gradient(#161b22, #161b22), linear-gradient(135deg, #58a6ff, #3fb950, #e3b341)',
                      backgroundOrigin: 'border-box',
                      backgroundClip: 'padding-box, border-box',
                    }}
                  />
                </motion.div>

                {/* Gradient text title */}
                <h3
                  className="text-xl font-bold mb-2"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #58a6ff, #3fb950)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  AI Deployment Assistant
                </h3>
                <p className="text-sm max-w-md mx-auto" style={{ color: '#8b949e' }}>
                  Ask about deployment failures, workflow changes, or hosting recommendations
                </p>

                {/* Quick action cards in 2x2 grid with better hierarchy */}
                <div className="grid grid-cols-2 gap-2.5 max-w-lg mx-auto mt-6 w-full">
                  {QUICK_ACTIONS.map((action, i) => {
                    const Icon = action.icon;
                    return (
                      <motion.button
                        key={action.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                        className="flex items-start gap-3 text-left px-4 py-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 group"
                        style={{ borderColor: '#30363d', backgroundColor: '#0d1117' }}
                        onClick={() => sendMessage(action.label)}
                        onMouseEnter={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = action.color;
                          (e.currentTarget as HTMLElement).style.background = `linear-gradient(135deg, ${action.color}08, #0d1117)`;
                        }}
                        onMouseLeave={(e) => {
                          (e.currentTarget as HTMLElement).style.borderColor = '#30363d';
                          (e.currentTarget as HTMLElement).style.background = '#0d1117';
                        }}
                      >
                        <div
                          className="p-2 rounded-lg shrink-0 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${action.color}15` }}
                        >
                          <Icon className="w-4 h-4" style={{ color: action.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate" style={{ color: '#c9d1d9' }}>{action.label}</p>
                          <p className="text-[10px] mt-0.5" style={{ color: '#8b949e' }}>{action.desc}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Diff Viewer */}
            {showDiff && diffContent && (
              <div className="mb-4">
                <DiffViewer
                  title="Suggested Workflow Change"
                  diff={diffContent}
                  language="yaml"
                  onApprove={() => {
                    addChatMessage({
                      id: Date.now().toString(),
                      role: 'user',
                      content: 'APPROVE CHANGE',
                      timestamp: new Date().toISOString(),
                    });
                    setShowDiff(false);
                  }}
                  onReject={() => {
                    addChatMessage({
                      id: Date.now().toString(),
                      role: 'user',
                      content: 'Change rejected. Can you suggest an alternative?',
                      timestamp: new Date().toISOString(),
                    });
                    setShowDiff(false);
                  }}
                />
              </div>
            )}

            <AnimatePresence mode="popLayout">
              {chatMessages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, x: msg.role === 'user' ? 10 : -10 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className="relative shrink-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center"
                      style={{
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, #30363d, #21262d)'
                          : 'linear-gradient(135deg, #58a6ff30, #3fb95020)',
                      }}
                    >
                      {msg.role === 'user' ? (
                        <User className="w-4 h-4" style={{ color: '#c9d1d9' }} />
                      ) : (
                        <Bot className="w-4 h-4" style={{ color: '#58a6ff' }} />
                      )}
                    </div>
                    {/* AI avatar pulsing ring */}
                    {msg.role === 'assistant' && (
                      <div className="absolute inset-0 rounded-xl animate-pulse-ring" style={{ border: '1.5px solid rgba(88,166,255,0.3)' }} />
                    )}
                  </div>
                  <div className={`max-w-[80%] group relative ${msg.role === 'user' ? 'text-right' : ''}`}>
                    <div
                      className="rounded-2xl px-4 py-3 text-sm"
                      style={{
                        backgroundColor: msg.role === 'user' ? '#2d333b' : '#0d1117',
                        border: msg.role === 'user'
                          ? '1px solid #444c56'
                          : '1px solid #21262d',
                        borderLeft: msg.role === 'assistant'
                          ? '2px solid transparent'
                          : undefined,
                        borderImage: msg.role === 'assistant'
                          ? 'linear-gradient(to bottom, #58a6ff, #3fb950) 1'
                          : undefined,
                        borderImageSlice: msg.role === 'assistant' ? 1 : undefined,
                        color: '#c9d1d9',
                      }}
                    >
                      <MessageContent content={msg.content} />
                    </div>
                    {/* Timestamp + Copy */}
                    <div className={`flex items-center gap-2 mt-1 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <span className="text-[10px]" style={{ color: '#484f58' }}>
                        {formatTimestamp(msg.timestamp)}
                      </span>
                      <CopyButton text={msg.content} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="relative shrink-0">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #58a6ff30, #3fb95020)' }}>
                    <Bot className="w-4 h-4" style={{ color: '#58a6ff' }} />
                  </div>
                  <div className="absolute inset-0 rounded-xl animate-pulse-ring" style={{ border: '1.5px solid rgba(88,166,255,0.3)' }} />
                </div>
                <div className="rounded-2xl px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#0d1117', border: '1px solid #21262d', borderLeft: '2px solid #58a6ff' }}>
                  <TypingIndicator />
                  <span className="text-xs ml-1" style={{ color: '#8b949e' }}>Thinking</span>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* ─── Enhanced Input Area ─── */}
        <div className="px-4 py-3 border-t" style={{ borderColor: '#30363d' }}>
          <div className="flex gap-2 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              {/* Attach file button (mock) */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                <button
                  className="p-1 rounded-md transition-colors hover:bg-[#30363d]"
                  style={{ color: '#484f58' }}
                  title="Attach file (coming soon)"
                  onClick={() => {}}
                >
                  <Paperclip className="w-3.5 h-3.5" />
                </button>
              </div>
              <Textarea
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setCharCount(e.target.value.length);
                }}
                placeholder="Ask about deployment, workflows, or hosting..."
                className="min-h-[44px] max-h-32 bg-[#0d1117] border-[#30363d] text-[#c9d1d9] text-sm resize-none rounded-xl focus:border-[#58a6ff] pl-10 pr-14"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
                rows={1}
                maxLength={2000}
              />
              {/* Character count */}
              {charCount > 0 && (
                <span
                  className="absolute right-3 bottom-2 text-[10px] font-mono"
                  style={{ color: charCount > 1800 ? '#f85149' : '#484f58' }}
                >
                  {charCount}/2000
                </span>
              )}
            </div>
            <Button
              size="icon"
              disabled={!input.trim() || isLoading}
              className="rounded-xl shrink-0 transition-all duration-300 h-[44px] w-[44px]"
              style={{
                background: input.trim()
                  ? 'linear-gradient(135deg, #58a6ff, #238636)'
                  : '#21262d',
                color: input.trim() ? 'white' : '#484f58',
                boxShadow: input.trim()
                  ? '0 0 20px rgba(88,166,255,0.3), 0 0 40px rgba(35,134,54,0.15)'
                  : 'none',
              }}
              onClick={() => sendMessage()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* ─── Right Sidebar Panel ─── */}
      <div className="w-72 border-l hidden lg:block overflow-y-auto custom-scroll" style={{ borderColor: '#30363d', backgroundColor: '#161b22' }}>
        <div className="p-4 space-y-5">
          {/* Conversation Topics */}
          <div>
            <h3 className="text-xs font-semibold mb-2.5 flex items-center gap-1.5" style={{ color: '#c9d1d9' }}>
              <MessageCircle className="w-3.5 h-3.5" style={{ color: '#58a6ff' }} /> Conversation Topics
            </h3>
            <div className="space-y-1">
              {SUGGESTED_TOPICS.map((topic) => {
                const Icon = topic.icon;
                return (
                  <motion.button
                    key={topic.label}
                    whileHover={{ x: 4 }}
                    className="w-full flex items-center gap-2.5 text-xs px-3 py-2 rounded-lg transition-all duration-200 hover:bg-[#21262d] text-left group"
                    style={{ color: '#8b949e' }}
                    onClick={() => sendMessage(topic.label)}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 group-hover:scale-110 transition-transform" style={{ color: topic.color }} />
                    <span className="truncate">{topic.label}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Recent Conversations */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2 flex items-center gap-1.5" style={{ color: '#484f58' }}>
              <Clock className="w-3 h-3" /> Recent Conversations
            </h3>
            <div className="space-y-1">
              {RECENT_CONVERSATIONS.map((conv) => (
                <button
                  key={conv.title}
                  className="w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-[#21262d]"
                  onClick={() => sendMessage(`Continue: ${conv.title}`)}
                >
                  <p className="text-xs truncate" style={{ color: '#c9d1d9' }}>{conv.title}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#484f58' }}>{conv.time}</p>
                </button>
              ))}
            </div>
          </div>

          {/* AI Capabilities */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-wider mb-2.5 flex items-center gap-1.5" style={{ color: '#484f58' }}>
              <Cpu className="w-3 h-3" /> AI Capabilities
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {AI_CAPABILITIES.map((cap, i) => {
                const Icon = cap.icon;
                return (
                  <motion.div
                    key={cap.title}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + i * 0.05, duration: 0.3 }}
                    className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl border transition-all duration-200 hover:border-[#58a6ff] cursor-pointer group"
                    style={{ borderColor: '#21262d', backgroundColor: '#0d1117' }}
                    onClick={() => sendMessage(`Help me with ${cap.title.toLowerCase()}`)}
                  >
                    <div
                      className="p-1.5 rounded-md shrink-0 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${cap.color}15` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: cap.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-medium" style={{ color: '#c9d1d9' }}>{cap.title}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#8b949e' }}>{cap.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Quick help text */}
          <div
            className="text-[10px] text-center px-3 py-2 rounded-lg"
            style={{ backgroundColor: '#0d1117', color: '#484f58', border: '1px solid #21262d' }}
          >
            <BookOpen className="w-3 h-3 inline-block mr-1" style={{ color: '#58a6ff' }} />
            Type a question or click any topic to start
          </div>
        </div>
      </div>
    </div>
  );
}
