import React, { useState, useEffect } from "react";
import { Plus, Search, Trash2, Calendar, Activity, HelpCircle, AlertCircle } from "lucide-react";
import { Document, User } from "../../types";
import api from "../../lib/api";
import toast from "react-hot-toast";

interface DashboardPageProps {
  onSelectNote: (id: string) => void;
  user: User;
}

export default function DashboardPage({ onSelectNote, user }: DashboardPageProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents');
      if (response.data.success) {
        setDocuments(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Session expired');
      } else {
        toast.error('Failed to load documents');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    return doc.title?.toLowerCase().includes(search.toLowerCase());
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/documents', { title: newTitle.trim() || 'Untitled' });
      if (response.data.success) {
        toast.success('Document created');
        setShowCreateModal(false);
        setNewTitle('');
        onSelectNote(response.data.data._id);
      }
    } catch (error: any) {
      toast.error('Failed to create document');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Delete this document?')) return;
    try {
      const response = await api.delete(`/documents/${id}`);
      if (response.data.success) {
        toast.success('Document deleted');
        setDocuments(prev => prev.filter(d => d._id !== id));
      }
    } catch (error: any) {
      toast.error('Failed to delete document');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="relative pt-24 pb-20 min-h-screen flex flex-col items-center overflow-hidden">
      <div className="absolute top-20 left-40 w-64 h-64 bg-blue-100/30 rounded-full blur-[100px] opacity-65 pointer-events-none" />
      <div className="absolute bottom-20 right-40 w-80 h-80 bg-orange-100/20 rounded-full blur-[100px] opacity-65 pointer-events-none" />

      <div className="w-[92%] max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10 pt-10 text-left">
        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-6 shadow-sm bg-white">
            <h2 className="font-display font-black text-xl text-[#37352F] tracking-tight">
              Welcome, <span className="text-brand-primary">{user.username}</span>
            </h2>
            <p className="text-xs text-[#7A7A78] font-sans mt-2">
              Your collaborative workspace for real-time document editing.
            </p>
            <div className="mt-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase tracking-wider">Connected</span>
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="w-full py-3.5 rounded-2xl bg-brand-primary text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 hover:bg-brand-hover shadow-md active:scale-95 transition-all cursor-pointer font-sans"
          >
            <Plus className="w-4 h-4" />
            <span>New Document</span>
          </button>

          <div className="glass-card rounded-[24px] border-[#E9E9E8] p-5 space-y-3 bg-white shadow-sm">
            <span className="text-[10px] font-mono font-bold text-[#7A7A78] tracking-wider uppercase">Workspace</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="text-[10px] font-mono text-[#7A7A78] block pb-1">Documents</span>
                <span className="font-bold text-xl text-[#37352F]">{documents.length}</span>
              </div>
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-[#E9E9E8]">
                <span className="text-[10px] font-mono text-[#7A7A78] block pb-1">Status</span>
                <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 mt-1">
                  <Activity className="w-3.5 h-3.5 animate-pulse" />
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Document Grid */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#7A7A78]" />
            <input
              type="text"
              placeholder="Search documents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white border border-[#E9E9E8] rounded-2xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary placeholder-[#7A7A78]/60 shadow-sm"
            />
          </div>

          {loading ? (
            <div className="glass-card rounded-[24px] border-[#E9E9E8] p-12 text-center bg-white">
              <span className="text-sm text-[#7A7A78]">Loading documents...</span>
            </div>
          ) : filteredDocuments.length === 0 ? (
            <div className="glass-card rounded-[24px] border-[#E9E9E8] p-12 text-center flex flex-col items-center gap-4 bg-white">
              <AlertCircle className="w-8 h-8 text-[#7A7A78]" />
              <div>
                <h3 className="font-bold text-lg text-[#37352F]">No documents found</h3>
                <p className="text-xs text-[#7A7A78] mt-1">Create a new document to get started.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc._id}
                  onClick={() => onSelectNote(doc._id)}
                  className="glass-card rounded-[24px] border-[#E9E9E8] p-5 flex flex-col justify-between h-[180px] hover:bg-[#F7F6F3]/50 hover:border-brand-primary/45 hover:scale-[1.01] transition-all cursor-pointer group bg-white shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-md bg-brand-accent-bg border border-brand-accent-border text-[9px] font-mono text-brand-primary font-semibold">
                        {doc.accessType === 'owner' ? 'Owner' : 'Editor'}
                      </span>
                      <span className="text-[10px] font-mono text-[#7A7A78] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(doc.updatedAt)}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-[#37352F] group-hover:text-brand-primary transition-colors line-clamp-1">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-[#7A7A78] line-clamp-3 leading-relaxed">
                      {doc.collaborators?.length > 0
                        ? `${doc.collaborators.length} collaborator${doc.collaborators.length > 1 ? 's' : ''}`
                        : 'Not shared'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                      Updated {formatDate(doc.updatedAt)}
                    </span>

                    {doc.accessType === 'owner' && (
                      <button
                        onClick={(e) => handleDelete(e, doc._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card rounded-[28px] border-[#E9E9E8] p-6 max-w-md w-full text-left space-y-4 bg-white shadow-xl">
            <h2 className="font-bold text-xl text-[#37352F] tracking-tight">New Document</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-brand-primary block uppercase">Title</label>
                <input
                  type="text"
                  placeholder="Untitled"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E9E9E8] rounded-xl text-sm font-sans text-[#37352F] focus:outline-none focus:border-brand-primary"
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
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

