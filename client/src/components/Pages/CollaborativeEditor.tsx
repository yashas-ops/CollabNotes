import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Split, Share2, History, MessageSquare, Send, CheckSquare, List, Bold, Code, Heading1, Users, Eye, Edit2, Plus, ArrowRight } from "lucide-react";
import { Note, UserSession, Collaborator } from "../../types";

interface CollaborativeEditorProps {
  noteId: string;
  notes: Note[];
  user: UserSession;
  onBackToDashboard: () => void;
  onRefreshNotes: () => void;
}

export default function CollaborativeEditor({ noteId, notes, user, onBackToDashboard, onRefreshNotes }: CollaborativeEditorProps) {
  const currentNote = notes.find(n => n.id === noteId);

  // Connection and editing states
  const [content, setContent] = useState(currentNote?.content || "");
  const [title, setTitle] = useState(currentNote?.title || "");
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  
  // Tab panels & sidebar controllers
  const [showShareModal, setShowShareModal] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'comments'>('editor');
  
  // Custom split self-collaboration mode
  const [isSplit, setIsSplit] = useState(false);
  
  // Guest B states (for side-by-side self-collaboration simulation)
  const [guestBName, setGuestBName] = useState("Charlie Amber");
  const [guestBColor, setGuestBColor] = useState("#F59E0B");
  const [guestBContent, setGuestBContent] = useState(currentNote?.content || "");

  // WebSocket refs
  const wsRefA = useRef<WebSocket | null>(null);
  const wsRefB = useRef<WebSocket | null>(null);
  const textareaRefA = useRef<HTMLTextAreaElement>(null);
  const textareaRefB = useRef<HTMLTextAreaElement>(null);

  // New Comment inline state
  const [newCommentText, setNewCommentText] = useState("");
  const [commentUnderLine, setCommentUnderLine] = useState<number>(0);

  // Share overlay parameters
  const [shareEmail, setShareEmail] = useState("");
  const [shareRole, setShareRole] = useState<'editor' | 'viewer'>('editor');

  // Load correct contents when NoteId changes
  useEffect(() => {
    if (currentNote) {
      setContent(currentNote.content);
      setTitle(currentNote.title);
      setGuestBContent(currentNote.content);
    }
  }, [noteId]);

  // Connect WebSocket for User A (Primary)
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    const wsUrl = `${protocol}${window.location.host}`;
    
    // Create connection A
    const wsA = new WebSocket(wsUrl);
    wsRefA.current = wsA;

    wsA.onopen = () => {
      wsA.send(JSON.stringify({
        type: "join",
        noteId,
        userId: user.userId,
        userName: user.userName,
        userColor: user.userColor
      }));
    };

    wsA.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleIncomingMessage(payload, 'A');
      } catch (err) {
        console.error("User A parsing error", err);
      }
    };

    return () => {
      wsA.close();
    };
  }, [noteId, user.userId]);

  // Connect WebSocket for Guest B (Secondary - only active during split screen)
  useEffect(() => {
    if (!isSplit) {
      if (wsRefB.current) {
        wsRefB.current.close();
        wsRefB.current = null;
      }
      return;
    }

    const protocol = window.location.protocol === "https:" ? "wss://" : "ws://";
    const wsUrl = `${protocol}${window.location.host}`;

    const wsB = new WebSocket(wsUrl);
    wsRefB.current = wsB;

    wsB.onopen = () => {
      wsB.send(JSON.stringify({
        type: "join",
        noteId,
        userId: "usr-simulated-guestb",
        userName: guestBName,
        userColor: guestBColor
      }));
    };

    wsB.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        handleIncomingMessage(payload, 'B');
      } catch (err) {
        console.error("Guest B parsing error", err);
      }
    };

    return () => {
      wsB.close();
    };
  }, [noteId, isSplit, guestBName]);

  const handleIncomingMessage = (payload: any, recipient: 'A' | 'B') => {
    switch (payload.type) {
      case "presence": {
        // Update presence list
        // Exclude own user instances dynamically to keep clear view of outer active cursors
        const activePool = payload.users.filter((u: any) => {
          if (recipient === 'A') return u.userId !== user.userId;
          return u.userId !== "usr-simulated-guestb";
        });
        setCollaborators(activePool);
        break;
      }

      case "cursor_move": {
        // Map pointer position
        setCollaborators(prev => {
          const idx = prev.findIndex(u => u.userId === payload.userId);
          if (idx !== -1) {
            const updated = [...prev];
            updated[idx] = {
              ...updated[idx],
              x: payload.x,
              y: payload.y,
              lineIndex: payload.lineIndex,
              charIndex: payload.charIndex
            };
            return updated;
          } else {
            return [...prev, {
              userId: payload.userId,
              userName: payload.userName,
              userColor: payload.userColor,
              x: payload.x,
              y: payload.y,
              lineIndex: payload.lineIndex,
              charIndex: payload.charIndex
            }];
          }
        });
        break;
      }

      case "sync_edit": {
        if (payload.content !== undefined) {
          if (recipient === 'A') {
            setContent(payload.content);
          } else {
            setGuestBContent(payload.content);
          }
        }
        if (payload.title !== undefined) {
          setTitle(payload.title);
        }
        break;
      }

      case "sync_comments": {
        // If comments synced, trigger notes refresh from db asynchronously
        onRefreshNotes();
        break;
      }
    }
  };

  // Broadcast User A Content Text Change
  const handleContentChangeA = (newVal: string) => {
    setContent(newVal);
    
    // Optimistic replication if in split screen mode
    if (isSplit) {
      setGuestBContent(newVal);
    }

    if (wsRefA.current && wsRefA.current.readyState === WebSocket.OPEN) {
      wsRefA.current.send(JSON.stringify({
        type: "edit",
        noteId,
        content: newVal,
        userId: user.userId,
        userName: user.userName
      }));
    }
  };

  // Broadcast Guest B Content Text Change
  const handleContentChangeB = (newVal: string) => {
    setGuestBContent(newVal);
    setContent(newVal);

    if (wsRefB.current && wsRefB.current.readyState === WebSocket.OPEN) {
      wsRefB.current.send(JSON.stringify({
        type: "edit",
        noteId,
        content: newVal,
        userId: "usr-simulated-guestb",
        userName: guestBName
      }));
    }
  };

  // Broadcast Title change
  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    if (wsRefA.current && wsRefA.current.readyState === WebSocket.OPEN) {
      wsRefA.current.send(JSON.stringify({
        type: "edit",
        noteId,
        title: newTitle,
        userId: user.userId,
        userName: user.userName
      }));
    }
  };

  // Tracking Cursor positioning (Client coordinates mapping)
  const trackCursorA = (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = textareaRefA.current;
    if (!el) return;

    // Approximate selection location metrics
    const textBefore = el.value.slice(0, el.selectionStart);
    const lines = textBefore.split("\n");
    const lineIndex = lines.length - 1;
    const charIndex = lines[lineIndex].length;

    // Send location coordinates to WS
    if (wsRefA.current && wsRefA.current.readyState === WebSocket.OPEN) {
      wsRefA.current.send(JSON.stringify({
        type: "cursor",
        noteId,
        userId: user.userId,
        x: charIndex * 7, // Character approximate step width
        y: lineIndex * 18, // Line height
        lineIndex,
        charIndex
      }));
    }
  };

  const trackCursorB = (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    const el = textareaRefB.current;
    if (!el) return;

    const textBefore = el.value.slice(0, el.selectionStart);
    const lines = textBefore.split("\n");
    const lineIndex = lines.length - 1;
    const charIndex = lines[lineIndex].length;

    if (wsRefB.current && wsRefB.current.readyState === WebSocket.OPEN) {
      wsRefB.current.send(JSON.stringify({
        type: "cursor",
        noteId,
        userId: "usr-simulated-guestb",
        x: charIndex * 7,
        y: lineIndex * 18,
        lineIndex,
        charIndex
      }));
    }
  };

  // Append markdown shortcuts
  const injectMarkdown = (syntax: string, target: 'A' | 'B') => {
    const el = target === 'A' ? textareaRefA.current : textareaRefB.current;
    const activeContent = target === 'A' ? content : guestBContent;
    
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selection = activeContent.slice(start, end);
    
    let replacement = "";
    if (syntax === 'bold') replacement = `**${selection || "bold_text"}**`;
    else if (syntax === 'code') replacement = `\`${selection || "code"}\``;
    else if (syntax === 'heading') replacement = `\n# ${selection || "Heading"}\n`;
    else if (syntax === 'list') replacement = `\n- ${selection || "List item"}`;
    else if (syntax === 'checklist') replacement = `\n- [ ] ${selection || "Checklist item"}`;

    const updated = activeContent.slice(0, start) + replacement + activeContent.slice(end);
    
    if (target === 'A') handleContentChangeA(updated);
    else handleContentChangeB(updated);

    // Focus viewport
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + 2, start + 2);
    }, 50);
  };

  // Submitting clean comments bound to paragraphs
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentObj = {
      id: "comment-" + Math.random().toString(36).substr(2, 6),
      text: newCommentText.trim(),
      author: user.userName,
      timestamp: new Date().toISOString(),
      lineIndex: commentUnderLine
    };

    if (wsRefA.current && wsRefA.current.readyState === WebSocket.OPEN) {
      wsRefA.current.send(JSON.stringify({
        type: "add_comment",
        noteId,
        comment: commentObj
      }));
      setNewCommentText("");
    }
  };

  const handleInviteShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareEmail.trim()) return;

    // Simulate inviting
    alert(`Invite sent successfully to ${shareEmail} with role authorization ${shareRole}`);
    setShareEmail("");
    setShowShareModal(false);
  };

  // Rolling back a version
  const handleRestoreVersion = (verContent: string) => {
    handleContentChangeA(verContent);
    setShowVersionHistory(false);
    alert("Document restored successfully to the selected historical version snapshot.");
  };

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
      
      {/* Dynamic theme style guides */}
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/10 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[94%] max-w-7xl mx-auto flex flex-col space-y-4 relative z-10 pt-4">
        
        {/* Navigation / Control Header Panel */}
        <div className="glass-card rounded-2xl border-[#E9E9E8] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white shadow-sm">
          
          {/* Back button and title */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onBackToDashboard}
              className="p-2 rounded-xl text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] transition-all outline-none cursor-pointer"
              title="Back to Desktop Documents"
              id="editor-back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 flex-1 sm:flex-initial">
              <span className="text-xl select-none">📄</span>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="bg-transparent border-b border-transparent hover:border-black/10 focus:border-brand-primary focus:outline-none font-sans font-bold text-base sm:text-lg text-[#37352F] py-0.5 px-2 rounded w-full sm:w-[240px] transition-all"
                placeholder="shared_specs.md"
              />
            </div>
          </div>

          {/* Action triggers and collaborator bubbles */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            
            {/* Real Presence List Indicators */}
            <div className="flex items-center -space-x-1.5 mr-2">
              <div 
                className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border border-white text-white select-none cursor-help shadow-sm"
                style={{ backgroundColor: user.userColor }}
                title={`${user.userName} (You)`}
              >
                {user.userName.charAt(0).toUpperCase()}
              </div>

              {collaborators.map((collab) => (
                <div
                  key={collab.userId}
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border border-white text-white select-none cursor-help shadow-sm transition-all animate-pulse-subtle"
                  style={{ backgroundColor: collab.userColor }}
                  title={`${collab.userName} (Sync Active)`}
                >
                  {collab.userName.charAt(0).toUpperCase()}
                </div>
              ))}
              
              {collaborators.length > 0 && (
                <span className="pl-2 text-[10px] font-mono text-emerald-600 font-semibold uppercase tracking-wider">
                  + {collaborators.length} active
                </span>
              )}
            </div>

            {/* Split Screen self-collaboration controller */}
            <button
               onClick={() => setIsSplit(!isSplit)}
               className={`px-4.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all outline-none cursor-pointer border ${
                 isSplit 
                   ? 'bg-brand-primary text-white border-brand-primary/15 shadow-sm'
                   : 'bg-[#F7F6F3] hover:bg-black/5 text-[#37352F] border-[#E9E9E8]'
               }`}
              id="btn-split-screen"
              title="Test real WebSocket sync side-by-side with two active names"
            >
              <Split className="w-3.5 h-3.5" />
              <span>{isSplit ? 'Single Layout' : 'Split Screen Test'}</span>
            </button>

            {/* Share action button */}
            <button
              onClick={() => setShowShareModal(true)}
              className="px-4.5 py-2 rounded-xl bg-[#F7F6F3] hover:bg-black/5 text-[#37352F] border border-[#E9E9E8] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              id="btn-share-trigger"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>

            {/* Version roll sidebar button */}
            <button
              onClick={() => setShowVersionHistory(!showVersionHistory)}
              className="px-4.5 py-2 rounded-xl bg-[#F7F6F3] hover:bg-black/5 text-[#37352F] border border-[#E9E9E8] font-semibold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
              id="btn-history-trigger"
            >
              <History className="w-3.5 h-3.5" />
              <span>Versions</span>
            </button>

          </div>

        </div>

        {/* Outer Grid content wrapper */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
          
          {/* Main Workspace Edit Field (Can be split left-right) */}
          <div className={`${isSplit ? 'md:col-span-12' : 'md:col-span-8'} transition-all duration-300 flex flex-col gap-4`}>
            
            <div className={`grid grid-cols-1 ${isSplit ? 'md:grid-cols-2' : 'grid-cols-1'} gap-5 items-stretch h-full`}>
              
              {/* Writer Panel A (You) */}
              <div className="glass-card rounded-2xl border-[#E9E9E8] p-5 flex flex-col h-[520px] bg-white shadow-sm text-left">
                {/* Header label */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3 flex-shrink-0">
                  <span className="text-xs font-mono font-bold text-brand-primary flex items-center gap-1 uppercase">
                    <Edit2 className="w-3.5 h-3.5 text-brand-primary" />
                    Writings: {user.userName} (You)
                  </span>
                  <div className="flex items-center gap-1">
                    {['bold', 'code', 'heading', 'list', 'checklist'].map(fmt => (
                      <button
                        key={fmt}
                        onClick={() => injectMarkdown(fmt, 'A')}
                        className="p-1 px-1.5 rounded hover:bg-gray-100 text-[#7A7A78] hover:text-[#37352F] transition-all text-xs cursor-pointer"
                        title={`Format ${fmt}`}
                      >
                        {fmt === 'bold' && <Bold className="w-3.5 h-3.5" />}
                        {fmt === 'code' && <Code className="w-3.5 h-3.5" />}
                        {fmt === 'heading' && <Heading1 className="w-3.5 h-3.5" />}
                        {fmt === 'list' && <List className="w-3.5 h-3.5" />}
                        {fmt === 'checklist' && <CheckSquare className="w-3.5 h-3.5" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Edit Input Area with live layered floating simulated helper line positions */}
                <div className="relative flex-1 text-left">
                  {/* Floating active cursors overlays for other authors */}
                  {collaborators.map((collab) => {
                    const onThisLine = collab.lineIndex !== undefined ? collab.lineIndex : -1;
                    if (onThisLine === -1) return null;
                    
                    return (
                      <div
                        key={`pointerA-${collab.userId}`}
                        className="absolute pointer-events-none transition-all duration-150 z-20"
                        style={{
                          left: `${Math.min(collab.x || 10, 400)}px`,
                          top: `${Math.min((collab.y || 0) + 24, 450)}px`
                        }}
                      >
                        <div 
                          className="w-1.5 h-4 w-px bg-neutral-400 animate-pulse" 
                          style={{ color: collab.userColor, backgroundColor: collab.userColor }}
                        />
                        <span 
                          className="absolute left-1 top-3 text-[8px] font-mono rounded px-1 text-white shadow font-semibold"
                          style={{ backgroundColor: collab.userColor }}
                        >
                          {collab.userName}
                        </span>
                      </div>
                    );
                  })}

                  <textarea
                    ref={textareaRefA}
                    value={content}
                    onChange={(e) => handleContentChangeA(e.target.value)}
                    onKeyUp={trackCursorA}
                    onMouseUp={trackCursorA}
                    className="w-full h-full bg-transparent resize-none border-none text-[#37352F] font-mono text-sm leading-relaxed p-1 focus:outline-none focus:ring-0 select-text overflow-auto"
                    placeholder="# Welcome to CollabNotes..."
                  />
                </div>
              </div>

              {/* Writer Panel B (Invited Guest Session) */}
              {isSplit && (
                <div className="glass-card rounded-2xl border-purple-200 p-5 flex flex-col h-[520px] bg-white text-left shadow-sm">
                  {/* Header labels */}
                  <div className="flex items-center justify-between pb-3 border-b border-purple-100 mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                      
                      {/* Name Selector */}
                      <select
                        value={guestBName}
                        onChange={(e) => {
                          setGuestBName(e.target.value);
                          if (e.target.value === "Charlie Amber") setGuestBColor("#F59E0B");
                          else if (e.target.value === "Sunny Sarah") setGuestBColor("#10B981");
                          else setGuestBColor("#06B6D4");
                        }}
                        className="bg-white border border-[#E9E9E8] text-xs font-mono font-bold text-[#37352F] rounded px-1.5 py-0.5 outline-none"
                      >
                        <option value="Charlie Amber">Charlie Amber</option>
                        <option value="Sunny Sarah">Sunny Sarah</option>
                        <option value="Aero Guest">Aero Guest</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-1">
                      {['bold', 'code', 'heading', 'list', 'checklist'].map(fmt => (
                        <button
                          key={fmt}
                          onClick={() => injectMarkdown(fmt, 'B')}
                          className="p-1 px-1.5 rounded hover:bg-gray-100 text-[#7A7A78] hover:text-[#37352F] cursor-pointer"
                        >
                          {fmt === 'bold' && <Bold className="w-3.5 h-3.5" />}
                          {fmt === 'code' && <Code className="w-3.5 h-3.5" />}
                          {fmt === 'heading' && <Heading1 className="w-3.5 h-3.5" />}
                          {fmt === 'list' && <List className="w-3.5 h-3.5" />}
                          {fmt === 'checklist' && <CheckSquare className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Edit area B */}
                  <div className="relative flex-1 text-left">
                    {/* Floating cursor overlay showing User A location */}
                    <div
                      className="absolute pointer-events-none transition-all duration-150 z-20"
                      style={{
                        left: `${Math.min(30, 400)}px`,
                        top: `${Math.min(50, 450)}px`
                      }}
                    >
                      <div className="w-px h-4 bg-teal-500 animate-pulse" />
                      <span className="absolute left-1 top-3 text-[8px] font-mono rounded px-1 bg-teal-500 text-white font-semibold">
                        {user.userName}
                      </span>
                    </div>

                    <textarea
                      ref={textareaRefB}
                      value={guestBContent}
                      onChange={(e) => handleContentChangeB(e.target.value)}
                      onKeyUp={trackCursorB}
                      onMouseUp={trackCursorB}
                      className="w-full h-full bg-transparent resize-none border-none text-[#37352F] font-mono text-sm leading-relaxed p-1 focus:outline-none focus:ring-0 overflow-auto"
                      placeholder="# Sync panel..."
                    />
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Collaborative Comments Sidebar Panel (When not in full split) */}
          {!isSplit && (
            <div className="md:col-span-4 glass-card rounded-2xl border-[#E9E9E8] p-5 flex flex-col h-[520px] bg-white shadow-sm">
              
              {/* Toolbar */}
              <div className="flex bg-[#F7F6F3] border border-[#E9E9E8] p-1 rounded-full mb-4">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex-1 text-center py-1.5 rounded-full text-[10px] font-mono font-bold uppercase cursor-pointer ${
                    activeTab === 'editor' ? 'bg-white text-[#37352F] font-bold shadow-xs' : 'text-[#7A7A78]'
                  }`}
                >
                  Document Info
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 text-center py-1.5 rounded-full text-[10px] font-mono font-bold uppercase cursor-pointer ${
                    activeTab === 'comments' ? 'bg-white text-[#37352F] font-bold shadow-xs' : 'text-[#7A7A78]'
                  }`}
                >
                  Comments ({currentNote?.comments.length || 0})
                </button>
              </div>

              {activeTab === 'editor' ? (
                <div className="flex-1 flex flex-col justify-between text-left space-y-4">
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider uppercase">WORKSPACE METRIC INFO</span>
                    
                    <div className="space-y-2">
                       <div className="p-3 bg-[#F7F6F3] border border-[#E9E9E8] rounded-xl">
                        <span className="text-[10px] font-mono text-[#7A7A78] block pb-1 font-semibold uppercase">Category folder</span>
                        <span className="text-xs font-bold text-[#37352F]">{currentNote?.category}</span>
                      </div>
                      <div className="p-3 bg-[#F7F6F3] border border-[#E9E9E8] rounded-xl">
                        <span className="text-[10px] font-mono text-[#7A7A78] block pb-1 font-semibold uppercase">Last Timestamp</span>
                        <span className="text-xs font-bold text-[#37352F]">
                          {currentNote ? new Date(currentNote.updatedAt).toLocaleTimeString() : "none"}
                        </span>
                      </div>
                      <div className="p-3 bg-[#F7F6F3] border border-[#E9E9E8] rounded-xl">
                        <span className="text-[10px] font-mono text-[#7A7A78] block pb-1 font-semibold uppercase">Total words count</span>
                        <span className="text-xs font-bold text-[#37352F]">
                          {content.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex items-start gap-2">
                    <Users className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="leading-relaxed">
                      All connected clients in the same URL room synchronize keystrokes instantly using WebSocket events securely.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col justify-between h-full select-none text-left">
                  
                  {/* List of active comments */}
                  <div className="flex-1 overflow-auto space-y-3 pr-1 max-h-[310px]">
                    {(!currentNote?.comments || currentNote.comments.length === 0) ? (
                      <div className="text-center py-12 flex flex-col items-center justify-center space-y-2 text-[#7A7A78]">
                        <MessageSquare className="w-6 h-6 text-[#7A7A78]" />
                        <span className="text-xs font-medium">No inline comments yet</span>
                      </div>
                    ) : (
                      currentNote.comments.map((comment) => (
                        <div key={comment.id} className="p-3 rounded-xl bg-[#F7F6F3] border border-[#E9E9E8] space-y-1 relative group">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-brand-primary">@{comment.author}</span>
                            <span className="text-[9px] font-mono text-[#7A7A78] font-bold">line {comment.lineIndex + 1}</span>
                          </div>
                          <p className="text-xs text-[#37352F] font-sans leading-relaxed font-medium">{comment.text}</p>
                          <span className="text-[8px] font-mono text-[#7A7A78] block pt-1 font-semibold">
                            {new Date(comment.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Write comment input inline */}
                  <form onSubmit={handleAddComment} className="pt-3 border-t border-gray-100 space-y-2 flex-shrink-0">
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-[#37352F] font-semibold">Bind Comment line:</span>
                      <select
                        value={commentUnderLine}
                        onChange={(e) => setCommentUnderLine(parseInt(e.target.value))}
                        className="bg-white border border-[#E9E9E8] rounded px-1 py-0.5 text-brand-primary cursor-pointer"
                      >
                        {Array.from({ length: content.split("\n").length }).map((_, index) => (
                          <option key={index} value={index}>Line {index + 1}</option>
                        ))}
                      </select>
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Write dynamic feedback..."
                        value={newCommentText}
                        onChange={(e) => setNewCommentText(e.target.value)}
                        className="w-full bg-white border border-[#E9E9E8] rounded-xl py-2 pl-3 pr-10 text-xs font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                      />
                      <button
                        type="submit"
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg text-brand-primary hover:text-brand-hover transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* Share Modals */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4 text-left">
          <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 max-w-md w-full space-y-4 animate-scaleUp bg-white shadow-xl">
            <h2 className="font-bold text-xl text-[#37352F] tracking-tight flex items-center gap-2">
              <Share2 className="w-5 h-5 text-brand-primary" />
              <span>Share and Access Rules</span>
            </h2>
            
            <form onSubmit={handleInviteShare} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Invite user email</label>
                <input
                  type="email"
                  required
                  placeholder="collaborator@collabnotes.io"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Permissions authorization</label>
                <select
                  value={shareRole}
                  onChange={(e: any) => setShareRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm text-[#37352F] focus:outline-none focus:border-brand-primary"
                >
                  <option value="editor">Editor (Can write edits)</option>
                  <option value="viewer">Viewer (Can only view content)</option>
                </select>
              </div>

              {/* Shared lists */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-mono text-[#7A7A78] uppercase font-bold block">Active Invite Pools ({currentNote?.sharedWith.length || 0})</span>
                <div className="space-y-1 max-h-[110px] overflow-auto">
                  {(!currentNote?.sharedWith || currentNote.sharedWith.length === 0) ? (
                    <span className="text-xs font-sans text-[#7A7A78] font-medium italic">No external shared invites yet.</span>
                  ) : (
                    currentNote.sharedWith.map((sw) => (
                      <div key={sw.email} className="flex justify-between items-center text-xs p-2 bg-[#F7F6F3] border border-[#E9E9E8] rounded-lg">
                        <span className="text-[#37352F] font-mono text-xs">{sw.email}</span>
                        <span className="px-2 py-0.5 rounded bg-brand-accent-bg text-brand-primary text-[9px] font-mono capitalize font-bold">{sw.role}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 animate-fade-in">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#7A7A78] border border-gray-200 text-xs font-bold hover:bg-gray-250 transition-all cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-hover transition-all cursor-pointer font-sans"
                >
                  Invite User
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Version side-drawers or sidebars */}
      {showVersionHistory && (
        <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[360px] bg-white border-l border-[#E9E9E8] p-6 flex flex-col justify-between text-left shadow-xl animate-fade-in">
          <div className="space-y-6 flex-1 overflow-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="font-bold text-lg text-[#37352F] tracking-tight flex items-center gap-1.5">
                <History className="w-5 h-5 text-brand-primary" />
                <span>Version History</span>
              </h2>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="text-xs text-[#7A7A78] hover:text-[#37352F] font-mono font-semibold cursor-pointer"
              >
                close
              </button>
            </div>

            <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider block">PREVIOUS SNAPSHOTS</span>

            <div className="space-y-4">
              {(!currentNote?.versions || currentNote.versions.length === 0) ? (
                <span className="text-xs text-[#7A7A78] font-semibold">No version branches found.</span>
              ) : (
                currentNote.versions.map((ver) => (
                  <div
                    key={ver.id}
                    className="p-4 rounded-xl bg-[#F7F6F3] hover:bg-[#F7F6F3]/80 border border-[#E9E9E8] space-y-2 group transition-all"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-mono font-bold text-brand-primary bg-brand-accent-bg border border-brand-accent-border px-2 py-0.5 rounded-md">{ver.id}</span>
                      <span className="text-[10px] font-mono text-[#7A7A78] font-bold">By: @{ver.author}</span>
                    </div>
                    
                    <span className="text-[9px] font-mono text-[#7A7A78] block pb-1 border-b border-gray-150">
                      {new Date(ver.timestamp).toLocaleString()}
                    </span>

                    <button
                      onClick={() => handleRestoreVersion(ver.content)}
                      className="text-[10px] font-mono font-bold text-brand-primary hover:underline mt-2 flex items-center gap-1 cursor-pointer"
                    >
                      <span>Restore to this branch</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>

          </div>

          <div className="pt-4 border-t border-gray-100 text-[10px] font-mono text-[#7A7A78] leading-relaxed font-medium">
            Every time a synchronized document is edited via REST or WS event structures, a version snapshot gets archived automatically.
          </div>
        </div>
      )}

    </div>
  );
}
