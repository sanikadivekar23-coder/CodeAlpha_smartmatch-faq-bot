import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Bot, 
  User, 
  MessageCircle, 
  RefreshCcw, 
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import { chatService, ChatResult } from './services/chatService.ts';
import { cn } from './lib/utils.ts';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  result?: ChatResult;
}

export default function App() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      type: 'bot',
      content: 'Hello! I am your SmartMatch Assistant. How can I help you today?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: query,
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Fetch the AI matching result
    try {
      const result = await chatService.findBestMatch(query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: result.answer,
        result
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'bot',
        content: "I'm having trouble connecting to my brain! Please try again in a moment."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleSend(suggestion);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        content: 'Hello! I am your SmartMatch Assistant. How can I help you today?',
      }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-slate-900 font-sans selection:bg-slate-200">
      <div className="max-w-2xl mx-auto h-screen flex flex-col pt-6 pb-6 px-4">
        {/* Header */}
        <header className="bg-white rounded-t-2xl border-b border-slate-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center text-white shadow-lg">
              <Bot size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-base font-semibold leading-none">SmartMatch FAQ</h1>
              <p className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-medium">AI-Powered Support</p>
            </div>
          </div>
          <button 
            onClick={handleReset}
            className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            title="Reset Conversation"
          >
            <RefreshCcw size={18} />
          </button>
        </header>

        {/* Chat Area */}
        <main 
          ref={scrollRef}
          className="flex-1 bg-white overflow-y-auto p-4 space-y-6 scroll-smooth border-x border-slate-50"
        >
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={cn(
                  "flex w-full",
                  msg.type === 'user' ? "justify-end" : "justify-start"
                )}
              >
                <div className={cn(
                  "max-w-[85%] space-y-2",
                  msg.type === 'user' ? "items-end" : "items-start"
                )}>
                  {/* Message Bubble */}
                  <div className={cn(
                    "p-4 rounded-2xl text-[14.5px] leading-relaxed shadow-sm",
                    msg.type === 'user' 
                      ? "bg-slate-950 text-white rounded-tr-none" 
                      : "bg-[#f8f8f8] text-slate-800 rounded-tl-none border border-slate-100"
                  )}>
                    {msg.content}
                    
                    {/* Confidence Indicator */}
                    {msg.result && msg.result.confidence_score > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold opacity-60">
                          {msg.result.confidence_score >= 0.75 ? (
                            <CheckCircle2 size={12} className="text-green-500" />
                          ) : msg.result.confidence_score >= 0.5 ? (
                            <HelpCircle size={12} className="text-amber-500" />
                          ) : (
                            <AlertCircle size={12} className="text-slate-400" />
                          )}
                          Match Confidence: {(msg.result.confidence_score * 100).toFixed(0)}%
                        </div>
                        {msg.result.matched_question && (
                          <div className="text-[10px] italic opacity-40 truncate flex-1 text-right">
                            "{msg.result.matched_question}"
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {msg.type === 'bot' && msg.result?.suggestions && msg.result.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {msg.result.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestionClick(s)}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-slate-400 hover:bg-slate-50 transition-all flex items-center gap-1.5"
                        >
                          <Search size={12} />
                          {s}
                          <ChevronRight size={12} className="opacity-40" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-[#f8f8f8] p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </main>

        {/* Input Area */}
        <footer className="bg-white rounded-b-2xl p-4 shadow-xl border-t border-slate-100">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your smart home..."
              className="w-full pl-4 pr-12 py-3.5 bg-[#f8f8f8] border-none rounded-xl text-sm focus:ring-2 focus:ring-slate-900 transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-slate-950 text-white rounded-lg disabled:opacity-30 transition-all hover:bg-slate-800 flex items-center justify-center shadow-md"
            >
              <Send size={18} />
            </button>
          </form>
          <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1"><MessageCircle size={10} /> Fast Response</span>
            <span className="flex items-center gap-1"><Search size={10} /> NLP Search</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
