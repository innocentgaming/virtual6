import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  AlertCircle, 
  MessageSquare, 
  RefreshCcw, 
  ShieldCheck 
} from 'lucide-react';
import { sendChatMessage, AQIData } from '../services/api';

interface ChatAssistantProps {
  aqiData: AQIData | null;
  selectedCity: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const PRESET_PROMPTS = [
  "How do I protect my asthmatic 6-year-old child during this smog spike?",
  "How do I build a cheap DIY Corsi-Rosenthal air purifier for under $40?",
  "Why does winter temperature inversion make smog so dangerous?",
  "What are the best low-emission changes I can make to my daily commute?"
];

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ aqiData, selectedCity }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello! I am **AeroShield AI**, your winter smog and clean air companion for **${selectedCity}**.\n\nCurrent ambient AQI is **${aqiData?.aqi || 285} (${aqiData?.level || 'Hazardous'})** with PM2.5 levels at **${aqiData?.pollutants.pm25 || 175} µg/m³**.\n\nAsk me about low-emission daily routines, DIY air purifiers, protecting vulnerable children or asthmatics, or optimal micro-ventilation windows!`
    }
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const messageContent = (textToSend || input).trim();
    if (!messageContent || isLoading) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: messageContent }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(
        newMessages,
        {},
        aqiData
      );
      setMessages([...newMessages, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error connecting to the service. Please try again or check your connection.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700/80 rounded-2xl shadow-xl flex flex-col h-[650px] overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-700/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">AeroShield GenAI Copilot</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                Dual-Engine AI Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Contextualized for {selectedCity} (AQI {aqiData?.aqi || '---'})</p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                role: 'assistant',
                content: `Chat history reset. How can I assist your household with smog safety or emission reduction today in ${selectedCity}?`
              }
            ]);
          }}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
          title="Reset conversation"
        >
          <RefreshCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 text-xs md:text-sm leading-relaxed shadow-md ${
                msg.role === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                  : 'bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-line'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
            <span>AeroShield is synthesizing particulate recommendations...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Preset Prompts Pill Bar */}
      <div className="px-4 py-2 bg-slate-900/40 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span className="text-[11px] font-semibold text-slate-400 shrink-0">Try asking:</span>
        {PRESET_PROMPTS.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-900/80 border-t border-slate-700 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask AeroShield about indoor IAQ hacks, routines, or smog impact..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs md:text-sm text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition active:scale-95"
          aria-label="Send message"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

