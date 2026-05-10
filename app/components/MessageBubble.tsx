"use client";

import React from "react";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
  sources?: { page: number }[];
  streaming?: boolean;
}

export default function MessageBubble({ role, content, sources, streaming }: MessageBubbleProps) {
  const isUser = role === "user";

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-8 animate-in slide-in-from-bottom-4 fade-in duration-700`}>
      <div className={`max-w-[90%] md:max-w-[80%] flex flex-col gap-3 ${isUser ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 mb-1 px-1`}>
          {isUser ? (
            <>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Authorized User</span>
              <div className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </div>
            </>
          ) : (
            <>
              <div className="w-6 h-6 rounded-md bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                 <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
              </div>
              <span className="text-[10px] font-bold text-emerald-500/80 uppercase tracking-widest">Insight Synthetic Engine</span>
            </>
          )}
        </div>

        <div 
          className={`relative px-6 py-4 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap transition-all ${
            isUser 
              ? "glass-card border-white/10 text-white rounded-tr-none" 
              : "glass border-emerald-500/20 text-slate-200 rounded-tl-none shadow-[0_0_30px_-10px_rgba(16,185,129,0.1)]"
          }`}
        >
          {content || (streaming ? "" : "...")}
          {streaming && (
            <span className="inline-flex gap-1.5 ml-3">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:200ms]"></span>
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse [animation-delay:400ms]"></span>
            </span>
          )}
        </div>
        
        {sources && sources.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-1">
            {sources.map((s, idx) => (
              <div key={idx} className="text-[10px] text-emerald-400/70 flex items-center gap-1.5 px-2.5 py-1 font-bold uppercase tracking-tighter bg-emerald-500/5 rounded-lg border border-emerald-500/10 hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors cursor-default">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path></svg>
                Segment {s.page}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
