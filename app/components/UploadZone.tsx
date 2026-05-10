"use client";

import React, { useState, useRef } from "react";

interface UploadZoneProps {
  onUploadComplete: (filename: string, chunkCount: number) => void;
}

export default function UploadZone({ onUploadComplete }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [indexedMsg, setIndexedMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.type !== "application/pdf") {
      setStatus("error");
      setErrorMsg("Please upload a PDF file.");
      return;
    }
    
    setStatus("uploading");
    setProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        setProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      if (xhr.status === 200) {
        const res = JSON.parse(xhr.responseText);
        setStatus("success");
        setIndexedMsg(`✓ Indexed ${res.chunkCount} chunks from ${res.filename}`);
        onUploadComplete(res.filename, res.chunkCount);
      } else {
        setStatus("error");
        try {
          const res = JSON.parse(xhr.responseText);
          setErrorMsg(res.error || "Upload failed.");
        } catch {
          setErrorMsg("An unexpected error occurred.");
        }
      }
    };

    xhr.onerror = () => {
      setStatus("error");
      setErrorMsg("Network error occurred.");
    };

    const formData = new FormData();
    formData.append("pdf", file);
    xhr.send(formData);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const clearDoc = async () => {
    setStatus("idle");
    setIndexedMsg("");
    setErrorMsg("");
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
    
    await fetch("/api/clear", { method: "DELETE" });
    onUploadComplete("", 0); // Clear in parent
  };

  if (status === "success") {
    return (
      <div className="flex flex-col gap-4 animate-in fade-in zoom-in duration-500">
        <div className="glass-card p-5 border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center gap-3 mb-3">
             <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
             </div>
             <p className="text-sm font-bold text-emerald-400">Index Finalized</p>
          </div>
          <p className="text-[11px] text-emerald-300/70 leading-relaxed font-medium">
            Document successfully fragmented and projected into the vector space. Ready for queries.
          </p>
        </div>
        <button 
          onClick={clearDoc}
          className="group relative px-4 py-3 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 hover:border-white/20 transition-all font-bold text-xs uppercase tracking-widest shadow-xl active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Reset Session
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className={`relative overflow-hidden glass-card p-8 text-center transition-all duration-500 ease-out cursor-pointer group ${
          isDragging ? "border-emerald-500/50 bg-emerald-500/10 scale-[1.02] ring-4 ring-emerald-500/5" : "border-white/5 hover:border-emerald-500/30 hover:bg-white/10"
        } ${status === "uploading" ? "pointer-events-none opacity-80" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          accept="application/pdf" 
          className="hidden" 
          ref={fileInputRef}
          onChange={(e) => e.target.files && e.target.files[0] && handleFile(e.target.files[0])}
        />
        
        {/* Decorative corner accents */}
        <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-white/20 rounded-tl-sm group-hover:border-emerald-500/50 transition-colors"></div>
        <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-white/20 rounded-tr-sm group-hover:border-emerald-500/50 transition-colors"></div>
        <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-white/20 rounded-bl-sm group-hover:border-emerald-500/50 transition-colors"></div>
        <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-white/20 rounded-br-sm group-hover:border-emerald-500/50 transition-colors"></div>

        <div className="flex flex-col items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${isDragging ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]" : "bg-white/5 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10"}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">
              {isDragging ? "Release to process" : "Upload Knowledge Base"}
            </p>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1.5 group-hover:text-slate-400 transition-colors">PDF Format • 20MB Max</p>
          </div>
        </div>

        {status === "uploading" && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-violet-600 shadow-[0_0_10px_rgba(16,185,129,0.5)] transition-all duration-300" 
              style={{ width: `${progress}%` }} 
            />
          </div>
        )}
      </div>

      {status === "error" && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-start gap-3 shadow-2xl">
           <svg className="shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span className="leading-tight">{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
