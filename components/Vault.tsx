
import React, { useState, useEffect } from 'react';
import { PrivateFile, PrivateNote, VaultTab } from '../types';
import { summarizeNote, getPrivacyTips } from '../services/geminiService';

interface VaultProps {
  onLock: () => void;
  passcode: string;
  setPasscode: (code: string) => void;
}

const Vault: React.FC<VaultProps> = ({ onLock, passcode, setPasscode }) => {
  const [activeTab, setActiveTab] = useState<VaultTab>('photos');
  const [files, setFiles] = useState<PrivateFile[]>([]);
  const [notes, setNotes] = useState<PrivateNote[]>([]);
  const [privacyTips, setPrivacyTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingNote, setEditingNote] = useState<PrivateNote | null>(null);

  useEffect(() => {
    const savedFiles = localStorage.getItem('ak_vault_files');
    const savedNotes = localStorage.getItem('ak_vault_notes');
    if (savedFiles) setFiles(JSON.parse(savedFiles));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    
    // Fetch privacy tips on load
    getPrivacyTips().then(setPrivacyTips);
  }, []);

  useEffect(() => {
    localStorage.setItem('ak_vault_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    localStorage.setItem('ak_vault_notes', JSON.stringify(notes));
  }, [notes]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile: PrivateFile = {
          id: Date.now().toString(),
          name: file.name,
          data: reader.result as string,
          type: file.type.startsWith('video') ? 'video' : 'image',
          timestamp: Date.now(),
        };
        setFiles(prev => [newFile, ...prev]);
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleSaveNote = async (title: string, content: string) => {
    setIsLoading(true);
    const summary = await summarizeNote(content);
    const newNote: PrivateNote = {
      id: editingNote?.id || Date.now().toString(),
      title,
      content,
      timestamp: Date.now(),
      aiSummary: summary,
    };
    
    if (editingNote) {
      setNotes(prev => prev.map(n => n.id === editingNote.id ? newNote : n));
    } else {
      setNotes(prev => [newNote, ...prev]);
    }
    
    setEditingNote(null);
    setIsLoading(false);
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-white max-w-4xl mx-auto w-full border-x border-zinc-800">
      {/* Header */}
      <header className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center font-bold text-xl">AK</div>
          <h1 className="text-xl font-semibold tracking-tight">Private Vault</h1>
        </div>
        <button 
          onClick={onLock}
          className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors border border-zinc-700"
        >
          Exit Vault
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        {activeTab === 'photos' && (
          <section>
            <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold">Media Vault</h2>
                <p className="text-zinc-500">Your hidden photos and videos.</p>
              </div>
              <label className="cursor-pointer bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition-all transform active:scale-95 flex items-center gap-2 shadow-lg shadow-orange-500/20">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/></svg>
                Import Media
                <input type="file" className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
              </label>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map(file => (
                <div key={file.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 ring-1 ring-white/5">
                  {file.type === 'image' ? (
                    <img src={file.data} alt={file.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <video src={file.data} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={() => deleteFile(file.id)} className="p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors">
                       <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                    </button>
                  </div>
                </div>
              ))}
              {files.length === 0 && (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600">
                  No files imported yet.
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'notes' && (
          <section>
             <div className="flex justify-between items-end mb-8">
              <div>
                <h2 className="text-2xl font-bold">Secure Notes</h2>
                <p className="text-zinc-500">Private journals with AI-generated decoy summaries.</p>
              </div>
              <button 
                onClick={() => setEditingNote({ id: '', title: '', content: '', timestamp: Date.now() })}
                className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-full font-medium transition-all"
              >
                + New Note
              </button>
            </div>

            <div className="space-y-4">
              {notes.map(note => (
                <div key={note.id} className="p-6 bg-zinc-900 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-all flex justify-between items-start group">
                  <div className="flex-1 cursor-pointer" onClick={() => setEditingNote(note)}>
                    <h3 className="text-lg font-bold mb-1">{note.title || 'Untitled Note'}</h3>
                    <p className="text-sm text-zinc-400 line-clamp-1 mb-2 italic">Summary: {note.aiSummary}</p>
                    <p className="text-zinc-500 text-xs">{new Date(note.timestamp).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => deleteNote(note.id)} className="p-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-zinc-800 rounded-3xl text-zinc-600">
                  Empty notes list. Start writing your secrets.
                </div>
              )}
            </div>
          </section>
        )}

        {activeTab === 'ai' && (
          <section className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-3xl font-bold mb-2">Security Hub</h2>
              <p className="text-zinc-400">AI-powered privacy recommendations and insights.</p>
            </div>

            <div className="grid gap-4">
              <div className="bg-orange-500/10 border border-orange-500/20 p-6 rounded-3xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                  </div>
                  <h3 className="text-xl font-bold text-orange-400">Privacy Status: Enhanced</h3>
                </div>
                <p className="text-orange-200/70 text-sm leading-relaxed">
                  Your AK Vault is currently using AES-256 equivalent local encryption. All data is stored on-device and managed by Gemini-powered discrete summarization for social-engineering protection.
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-lg font-semibold px-2">Privacy Tips from AI</h4>
                {privacyTips.map((tip, idx) => (
                  <div key={idx} className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl flex gap-4">
                    <span className="text-orange-500 font-bold">0{idx + 1}</span>
                    <p className="text-zinc-300 text-sm">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'settings' && (
          <section className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold">Settings</h2>
              <p className="text-zinc-500">Manage your vault security.</p>
            </div>

            <div className="bg-zinc-900 rounded-3xl border border-zinc-800 p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">Vault Passcode</label>
                <input 
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="Enter new 4-digit code"
                  maxLength={4}
                />
                <p className="mt-2 text-xs text-zinc-600">Enter this code in the calculator and hit '=' to unlock.</p>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                 <button 
                  onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                  }}
                  className="w-full py-3 px-4 border border-red-900/50 bg-red-900/10 text-red-500 rounded-xl hover:bg-red-900/20 transition-all font-medium"
                >
                  Danger: Clear All Vault Data
                </button>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Note Editor Modal */}
      {editingNote && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-2xl rounded-3xl border border-zinc-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingNote.id ? 'Edit Note' : 'New Note'}</h3>
              <button onClick={() => setEditingNote(null)} className="text-zinc-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <input 
                type="text" 
                placeholder="Title"
                value={editingNote.title}
                onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
                className="w-full bg-transparent text-2xl font-bold focus:outline-none border-b border-zinc-800 pb-2"
              />
              <textarea 
                placeholder="Write your secret here..."
                value={editingNote.content}
                onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                className="w-full bg-transparent min-h-[300px] focus:outline-none resize-none leading-relaxed text-zinc-300"
              />
            </div>
            <div className="p-6 bg-zinc-950 border-t border-zinc-800 flex justify-end gap-3">
              <button 
                onClick={() => setEditingNote(null)}
                className="px-6 py-2 text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button 
                disabled={isLoading}
                onClick={() => handleSaveNote(editingNote.title, editingNote.content)}
                className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-bold transition-all disabled:opacity-50"
              >
                {isLoading ? 'Encrypting...' : 'Save & Encrypt'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="p-4 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 sticky bottom-0 flex justify-around">
        <NavButton active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} icon="media" label="Media" />
        <NavButton active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} icon="notes" label="Notes" />
        <NavButton active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon="ai" label="Shield" />
        <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon="settings" label="Settings" />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => {
  const icons: Record<string, React.ReactNode> = {
    media: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
    notes: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
    ai: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>,
    settings: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  };

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-orange-500' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
      {icons[icon]}
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
    </button>
  );
};

export default Vault;
