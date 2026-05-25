import React, { useState } from "react";
import { Plus, Search, Trash2, FileText, Calendar, Tag, ChevronRight, Activity, Users, HelpCircle, AlertCircle } from "lucide-react";
import { Note, UserSession } from "../../types";

interface DashboardPageProps {
  notes: Note[];
  onCreateNote: (title: string, category: string, content: string) => void;
  onDeleteNote: (id: string) => void;
  onSelectNote: (id: string) => void;
  user: UserSession;
}

export default function DashboardPage({ notes, onCreateNote, onDeleteNote, onSelectNote, user }: DashboardPageProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Engineering");
  const [newContent, setNewContent] = useState("");

  const categories = ["All", "Engineering", "Marketing", "General"];

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(search.toLowerCase()) || 
                          note.content.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === "All" || note.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const titleVal = newTitle.trim() || "untitled_note.md";
    onCreateNote(titleVal, newCategory, newContent);
    setNewTitle("");
    setNewContent("");
    setShowCreateModal(false);
  };

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
      
      {/* Background radial highlights */}
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[92%] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 pt-10 text-left">
        
        {/* Sidebar categories and status (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Welcome Card */}
          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-6 shadow-sm relative overflow-hidden bg-white">
            <span className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-brand-primary/5 blur" />
            <h2 className="font-display font-black text-xl text-[#37352F] tracking-tight">
              Welcome, <span className="text-brand-primary">{user.userName}</span>
            </h2>
            <p className="text-xs text-[#7A7A78] font-sans mt-2">
              Syncing thoughts, outlines, and system specifications instantly with our hyper-broadcast WebSocket engine.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">Active Workspace Member</span>
            </div>
          </div>

          {/* Quick Create Button Trigger */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-brand-hover shadow-md active:scale-95 transition-all outline-none cursor-pointer font-sans"
            id="btn-trigger-new-note"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Create New Document</span>
          </button>

          {/* Category Filter list */}
          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-5 space-y-3 bg-white shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider">DOCUMENT CATEGORIES</span>
            <div className="flex flex-col gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full px-4 py-2.5 rounded-xl text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                    selectedCategory === cat 
                      ? 'bg-brand-accent-bg text-brand-primary border border-brand-accent-border font-bold' 
                      : 'text-[#7A7A78] hover:text-[#37352F] hover:bg-[#F7F6F3] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      selectedCategory === cat ? 'bg-brand-primary' : 'bg-transparent border border-gray-400'
                    }`} />
                    <span>{cat}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          </div>

          {/* Live Workspace Analytics */}
          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-5 space-y-4 bg-white shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider">WORKSPACE METRICS</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="text-[10px] font-mono text-[#7A7A78] block pb-1">Total Notes</span>
                <span className="font-bold text-xl text-[#37352F]">{notes.length}</span>
              </div>
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="text-[10px] font-mono text-[#7A7A78] block pb-1">Activity Loop</span>
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 mt-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  15ms latency
                </span>
              </div>
            </div>

            <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700 flex gap-2">
              <HelpCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
              <p className="leading-relaxed font-sans">
                Want to test out real-time edits? Select any file below, click <strong>"Split Screen"</strong> to open a synchronous writer panel as a different guest username!
              </p>
            </div>
          </div>

        </div>

        {/* Note Grid & Search display (8 cols) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Search bar row */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
            <input
              type="text"
              placeholder="Search documents by title, tags, or contents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-2xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary transition-all placeholder-[#7A7A78]/60 shadow-sm"
            />
          </div>

          {/* List display */}
          {filteredNotes.length === 0 ? (
            <div className="glass-card rounded-[24px] border-[#E9E9E8] p-12 text-center flex flex-col items-center justify-center space-y-4 bg-white">
              <span className="p-4 rounded-full bg-gray-50 text-[#7A7A78] border border-gray-100">
                <AlertCircle className="w-8 h-8 text-[#7A7A78]" />
              </span>
              <div>
                <h3 className="font-bold text-lg text-[#37352F]">No documents match</h3>
                <p className="text-xs text-[#7A7A78] mt-1 max-w-sm mx-auto leading-relaxed">
                  Try shortening the search path, changing the selected folder category, or click "Create New Document" to write a fresh file.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => onSelectNote(note.id)}
                  className="glass-card rounded-[24px] border-[#E9E9E8] p-5 flex flex-col justify-between h-[180px] hover:bg-[#F7F6F3]/50 hover:border-brand-primary/45 hover:scale-[1.01] transition-all cursor-pointer group bg-white shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between animate-fade-in">
                      <span className="px-2.5 py-1 rounded-md bg-brand-accent-bg border border-brand-accent-border text-[9px] font-mono text-brand-primary font-semibold">
                        {note.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#7A7A78] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-base text-[#37352F] group-hover:text-brand-primary transition-colors line-clamp-1 block text-left">
                      {note.title}
                    </h3>
                    
                    <p className="text-xs text-[#7A7A78] line-clamp-3 leading-relaxed text-left font-normal select-none">
                      {note.content ? note.content.replace(/[#*`\-[\]]/g, '') : "Empty document content..."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      {note.versions.length} {note.versions.length === 1 ? 'version' : 'versions'}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Are you sure you want to delete ${note.title}?`)) {
                          onDeleteNote(note.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      title="Delete Note"
                      id={`btn-delete-note-${note.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* Inline Creation Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 max-w-md w-full text-left space-y-4 animate-scaleUp bg-white shadow-xl">
            <h2 className="font-bold text-xl text-[#37352F] tracking-tight">
              Create Document
            </h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Title (include extension if desired)</label>
                <input
                  type="text"
                  required
                  placeholder="shared_launch_specs.md"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Category folder</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm text-[#37352F] focus:outline-none focus:border-brand-primary"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Marketing">Marketing</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Initial Markdown content</label>
                <textarea
                  rows={4}
                  placeholder="# Welcome to my note..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm font-mono text-[#37352F] focus:outline-none focus:border-brand-primary"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-gray-100 text-[#7A7A78] border border-gray-200 text-xs font-bold hover:bg-gray-200 transition-all cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-hover transition-all cursor-pointer font-sans"
                >
                  Create Document
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
