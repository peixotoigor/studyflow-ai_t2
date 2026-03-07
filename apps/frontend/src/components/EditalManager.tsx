import React, { useRef, useState } from 'react';
import { EditalFile } from '../types';
import { supabase } from '../lib/supabase';

interface EditalManagerProps {
  userId: string;
  files: EditalFile[];
  onUpload: (file: Omit<EditalFile, 'id' | 'uploadedAt'> & { id?: string; uploadedAt?: Date }) => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  onUndoDelete: () => void;
  lastRemoved?: EditalFile | null;
}

interface UploadingFile {
  id: string;
  fileName: string;
  sizeBytes: number;
  dataUrl: string;
}

export const EditalManager: React.FC<EditalManagerProps> = ({ userId, files, onUpload, onRename, onDelete, onUndoDelete, lastRemoved }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

  // Clear selection if the file disappears (plan switch or delete)
  React.useEffect(() => {
    if (!selectedId) return;
    if (!files.some(f => f.id === selectedId)) {
      setSelectedId(null);
    }
  }, [files, selectedId]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.type !== 'application/pdf') { alert('Envie apenas PDFs.'); return; }
      if (file.size > MAX_SIZE) { alert('Arquivo muito grande. O limite agora é de 5MB.'); return; }
      
      const tempId = `temp-${Date.now()}`;
      const localUrl = URL.createObjectURL(file);
      
      // Optimistic Update: Add to local list immediately
      const newUploading: UploadingFile = {
        id: tempId,
        fileName: file.name,
        sizeBytes: file.size,
        dataUrl: localUrl
      };
      setUploadingFiles(prev => [...prev, newUploading]);
      setIsUploading(true);

      if (!supabase) {
        setUploadingFiles(prev => prev.filter(f => f.id !== tempId));
        onUpload({ id: `edital-${Date.now()}`, planId: '', fileName: file.name, dataUrl: localUrl, sizeBytes: file.size, mimeType: file.type, uploadedAt: new Date() });
        setIsUploading(false);
        e.target.value = '';
        return;
      }

      try {
        const fileExt = file.name.split('.').pop();
        const safeName = file.name.replace(/[^\x00-\x7F]/g, "").replace(/\s+/g, "_");
        const uniqueFileName = `${Date.now()}-${safeName}`;
        // Path segmented by userId for isolation
        const filePath = `editais/${userId}/${uniqueFileName}`;

        const { error: uploadError } = await supabase.storage
          .from('editais')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('editais')
          .getPublicUrl(filePath);

        // Remove from uploading and add to actual list
        setUploadingFiles(prev => prev.filter(f => f.id !== tempId));
        URL.revokeObjectURL(localUrl);
        
        onUpload({ 
          id: `edital-${Date.now()}`, 
          planId: '', 
          fileName: file.name, 
          dataUrl: publicUrl, 
          sizeBytes: file.size, 
          mimeType: file.type, 
          uploadedAt: new Date() 
        });
        
      } catch (err: any) {
        console.error('Erro no upload para Supabase:', err);
        setUploadingFiles(prev => prev.filter(f => f.id !== tempId));
        URL.revokeObjectURL(localUrl);
        alert('Falha ao salvar no Supabase. O arquivo foi removido da lista.');
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
  };

  const startRename = (f: EditalFile) => {
    setEditingId(f.id);
    setEditingName(f.fileName);
  };

  const saveRename = () => {
    if (editingId && editingName.trim()) {
      onRename(editingId, editingName.trim());
      setEditingId(null);
    }
  };

  const selectedFile = selectedId ? files.find(f => f.id === selectedId) : null;

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Edital</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Envie, gerencie e visualize os PDFs do edital.</p>
        </div>
        <div className="flex items-center gap-2">
          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} disabled={isUploading} />
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isUploading}
            className={`px-3 py-2 rounded-lg ${isUploading ? 'bg-slate-300 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'} text-white text-sm font-bold transition-colors flex items-center gap-2`}
          >
            {isUploading ? (
              <>
                <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Enviando...
              </>
            ) : (
              'Enviar PDF (Max 5MB)'
            )}
          </button>
        </div>
      </div>

      {lastRemoved && (
        <div className="flex items-center justify-between text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-100 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-800 mb-3">
          <span>Arquivo removido: {lastRemoved.fileName}</span>
          <button onClick={onUndoDelete} className="font-bold hover:underline">Desfazer</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-1 space-y-2">
          {files.length === 0 && uploadingFiles.length === 0 ? (
            <div className="text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg p-3">Nenhum edital enviado ainda.</div>
          ) : (
            <div className="space-y-2">
              {/* Actual Files */}
              {files.map(f => {
                const isEditing = editingId === f.id;
                const isSelected = selectedId === f.id;
                const sizeMb = (f.sizeBytes / 1024 / 1024).toFixed(1);
                return (
                  <div 
                    key={f.id} 
                    className={`p-2 rounded-lg border ${isSelected ? 'border-primary bg-primary/5' : 'border-slate-200 dark:border-slate-800'} hover:border-primary/60 transition-colors cursor-pointer`} 
                    onClick={() => setSelectedId(f.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedId(f.id); } }}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input value={editingName} onChange={(e) => setEditingName(e.target.value)} className="flex-1 text-xs p-2 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-black/20 text-slate-900 dark:text-white focus:ring-1 focus:ring-primary outline-none" />
                        <button onClick={saveRename} className="p-1.5 bg-green-500 text-white rounded hover:bg-green-600" title="Salvar"><span className="material-symbols-outlined text-[16px]">check</span></button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded hover:bg-slate-300" title="Cancelar"><span className="material-symbols-outlined text-[16px]">close</span></button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <button onClick={(e) => { e.stopPropagation(); setSelectedId(f.id); }} className={`size-8 rounded ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'} flex items-center justify-center shadow-sm`} title="Visualizar">
                            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                          </button>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-slate-800 dark:text-white truncate" title={f.fileName}>{f.fileName}</span>
                            <span className="text-[10px] text-slate-500">{sizeMb} MB · {new Date(f.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-90">
                          <button onClick={() => startRename(f)} className="p-1 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded" title="Renomear">
                            <span className="material-symbols-outlined text-[16px]">edit</span>
                          </button>
                          <button onClick={() => onDelete(f.id)} className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded" title="Remover">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Uploading Files (Optimistic) */}
              {uploadingFiles.map(f => (
                <div 
                  key={f.id} 
                  className="p-2 rounded-lg border border-primary/30 bg-primary/5 animate-pulse cursor-wait"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="size-8 rounded bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <span className="size-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-400 truncate">{f.fileName}</span>
                        <span className="text-[10px] text-primary font-medium">Enviando para nuvem...</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lg:col-span-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40 min-h-[320px]" role="region" aria-label="Visualizador de PDF do edital">
          {selectedFile ? (
            <div className="h-[520px] bg-white dark:bg-black/40">
              <object data={selectedFile.dataUrl} type="application/pdf" className="w-full h-full">
                <div className="p-4 text-xs text-slate-500">Seu navegador não exibiu o PDF. Baixe para ler.</div>
              </object>
            </div>
          ) : (
            <div className="h-full min-h-[260px] flex items-center justify-center text-sm text-slate-500">
              Selecione um PDF para visualizar.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
