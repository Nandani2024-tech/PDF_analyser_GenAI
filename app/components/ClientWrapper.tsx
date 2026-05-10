"use client";

import React, { useState } from "react";
import UploadZone from "./UploadZone";
import ChatWindow from "./ChatWindow";

export default function ClientWrapper() {
  const [filename, setFilename] = useState<string | null>(null);
  const [chunkCount, setChunkCount] = useState<number>(0);

  const handleUploadComplete = (name: string, chunks: number) => {
    // If name is empty, it means we are clearing
    setFilename(name || null);
    setChunkCount(chunks);
  };

  return (
    <div className="flex h-screen w-full bg-[#020617] text-slate-100 font-outfit overflow-hidden">
      {/* Modern Sidebar */}
      <aside className="w-72 glass border-r border-white/5 flex flex-col z-20">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-violet-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m16 16 3-8 3 8c-.87.06-1.7.21-2.43.44l-.57 1.56-2.43-.44Z"></path><path d="M7 21h10"></path><path d="M12 21V3"></path><path d="m12 3 4 5H8l4-5Z"></path></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-tight">Insight<span className="text-emerald-400">AI</span></h1>
              <div className="h-1 w-8 bg-emerald-500 rounded-full mt-0.5"></div>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest ml-1 mt-3">Neural Document Engine</p>
        </div>

        <div className="px-6 flex-1 flex flex-col gap-8 overflow-y-auto">
          <section>
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Data Source</h2>
            <UploadZone onUploadComplete={handleUploadComplete} />
          </section>
          
          {filename && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Active Context</h2>
              <div className="glass-card p-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-500/10 transition-colors"></div>
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 shadow-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-white truncate mb-1" title={filename}>{filename}</p>
                    <div className="flex items-center gap-2">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-[11px] text-slate-400 font-medium">
                        {chunkCount.toLocaleString()} vector segments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
        
        <div className="p-6 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
            <span>v2.0.4-Insight</span>
            <span className="flex items-center gap-1">
              <span className="h-1 w-1 rounded-full bg-emerald-500"></span> System Ready
            </span>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 relative flex flex-col bg-transparent">
        <ChatWindow filename={filename} />
      </main>
    </div>
  );
}
