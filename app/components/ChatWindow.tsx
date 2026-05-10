"use client";

import React, { useState, useRef, useEffect } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { page: number }[];
  streaming?: boolean;
}

interface ChatWindowProps {
  filename: string | null;
}

export default function ChatWindow({ filename }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isStreaming]);

  // Reset messages when a new file is uploaded
  useEffect(() => {
    setMessages([]);
  }, [filename]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: input.trim() };
    const botMsgId = (Date.now() + 1).toString();
    const initialBotMsg: Message = { id: botMsgId, role: "assistant", content: "", streaming: true };
    
    setMessages(prev => [...prev, userMsg, initialBotMsg]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userMsg.content }),
      });

      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let buffer = "";

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";
          
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const dataStr = line.replace("data: ", "");
              if (!dataStr.trim()) continue;
              
              try {
                const data = JSON.parse(dataStr);
                if (data.token) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId ? { ...msg, content: msg.content + data.token } : msg
                  ));
                }
                if (data.done) {
                  setMessages(prev => prev.map(msg => 
                    msg.id === botMsgId ? { ...msg, streaming: false, sources: data.sources } : msg
                  ));
                  setIsStreaming(false);
                }
              } catch (e) {
                console.error("Error parsing SSE data", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error", error);
      setIsStreaming(false);
      setMessages(prev => prev.map(msg => 
        msg.id === botMsgId ? { ...msg, content: "Error: Could not fetch response.", streaming: false } : msg
      ));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!filename) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 animate-in fade-in zoom-in duration-1000">
          <div className="w-24 h-24 glass-card border-emerald-500/30 text-emerald-400 rounded-3xl flex items-center justify-center mb-8 mx-auto shadow-2xl shadow-emerald-500/10 -rotate-6 hover:rotate-0 transition-transform duration-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
          </div>
          <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Initialize <span className="text-emerald-400">Insight</span></h2>
          <p className="text-slate-400 max-w-md mx-auto text-lg font-medium leading-relaxed">
            The neural engine is awaiting data. Upload a PDF from the source panel to begin the deep analysis.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-transparent relative z-20 overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="flex-1 overflow-y-auto px-6 md:px-12 py-10 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
             <div className="relative mb-8">
                <div className="absolute inset-0 bg-emerald-500/20 blur-2xl rounded-full"></div>
                <div className="relative w-20 h-20 glass rounded-2xl flex items-center justify-center text-emerald-400 border-emerald-500/20">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>
                </div>
             </div>
            <h3 className="text-3xl font-black text-white mb-3 tracking-tight">System Online</h3>
            <p className="text-slate-400 max-w-sm font-medium leading-relaxed">
              Knowledge base ingested. Ask me anything about <span className="text-emerald-400 font-bold">{filename}</span> and I will synthesize an answer.
            </p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto w-full pb-32">
            {messages.map(msg => (
              <MessageBubble key={msg.id} {...msg} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Floating Input Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-[#020617] via-[#020617]/80 to-transparent pt-20 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-violet-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000"></div>
            <div className="relative flex items-end gap-3 p-2 rounded-2xl glass border-white/10 shadow-2xl transition-all duration-300">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Query the document..."
                className="flex-1 max-h-40 min-h-[50px] bg-transparent resize-none outline-none py-3.5 px-5 text-[15px] text-white placeholder:text-slate-500 font-medium"
                rows={1}
                disabled={isStreaming}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="mb-1 mr-1 p-3.5 bg-emerald-500 text-[#020617] rounded-xl hover:bg-emerald-400 disabled:bg-white/5 disabled:text-slate-600 transition-all shadow-lg active:scale-95 group/btn overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Context-Aware Response Engine</p>
            <div className="flex items-center gap-1.5 text-[9px] text-emerald-500/70 font-bold uppercase tracking-[0.2em]">
               <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
               Neural Stream Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
