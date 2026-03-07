import React, { useState, useMemo } from 'react';
import { SavedNote, Subject, getSubjectIcon } from '../types';

interface SavedNotesProps {
    notes: SavedNote[];
    subjects: Subject[];
    onDeleteNote: (id: string) => void;
}

interface FolderGroup {
    subjectId: string | null;
    subjectName: string;
    subjectColor: string;
    icon: string;
    notes: SavedNote[];
}

export const SavedNotes: React.FC<SavedNotesProps> = ({ notes, subjects, onDeleteNote }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['__all__']));
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Agrupar notas por disciplina (pasta automática)
    const folders = useMemo<FolderGroup[]>(() => {
        const subjectMap = new Map<string, Subject>();
        subjects.forEach(s => subjectMap.set(s.id, s));

        const grouped = new Map<string, SavedNote[]>();

        notes.forEach(note => {
            const key = note.subjectId || '__sem_disciplina__';
            if (!grouped.has(key)) grouped.set(key, []);
            grouped.get(key)!.push(note);
        });

        const result: FolderGroup[] = [];

        grouped.forEach((groupNotes, key) => {
            const subject = key !== '__sem_disciplina__' ? subjectMap.get(key) : null;
            result.push({
                subjectId: key === '__sem_disciplina__' ? null : key,
                subjectName: subject?.name || 'Sem Disciplina',
                subjectColor: subject?.color || 'slate',
                icon: subject ? getSubjectIcon(subject.name) : 'folder_open',
                notes: groupNotes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            });
        });

        // Ordena pastas pelo nome da disciplina, com "Sem Disciplina" por último
        result.sort((a, b) => {
            if (!a.subjectId) return 1;
            if (!b.subjectId) return -1;
            return a.subjectName.localeCompare(b.subjectName);
        });

        return result;
    }, [notes, subjects]);

    // Filtro de busca
    const filteredFolders = useMemo(() => {
        if (!searchTerm.trim()) return folders;

        const term = searchTerm.toLowerCase();
        return folders
            .map(folder => ({
                ...folder,
                notes: folder.notes.filter(note =>
                    note.content.toLowerCase().includes(term) ||
                    folder.subjectName.toLowerCase().includes(term) ||
                    (note.topicName || '').toLowerCase().includes(term)
                )
            }))
            .filter(folder => folder.notes.length > 0);
    }, [folders, searchTerm]);

    const totalNotes = notes.length;
    const totalFolders = folders.length;

    const toggleFolder = (folderId: string) => {
        setExpandedFolders(prev => {
            const next = new Set(prev);
            if (next.has(folderId)) next.delete(folderId);
            else next.add(folderId);
            return next;
        });
    };

    const expandAll = () => {
        setExpandedFolders(new Set(folders.map(f => f.subjectId || '__sem_disciplina__')));
    };

    const collapseAll = () => {
        setExpandedFolders(new Set());
    };

    const handleCopy = (text: string, noteId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(noteId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateStr: string) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 shrink-0">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <span className="material-symbols-outlined text-4xl text-amber-500">lightbulb</span>
                        Insights do Tutor
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                        {totalNotes} {totalNotes === 1 ? 'nota salva' : 'notas salvas'} em {totalFolders} {totalFolders === 1 ? 'disciplina' : 'disciplinas'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Buscar nas notas..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-card-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500/50 outline-none w-full md:w-64 text-sm"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    </div>
                    <button
                        onClick={expandAll}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Expandir tudo"
                    >
                        <span className="material-symbols-outlined text-[20px]">unfold_more</span>
                    </button>
                    <button
                        onClick={collapseAll}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Recolher tudo"
                    >
                        <span className="material-symbols-outlined text-[20px]">unfold_less</span>
                    </button>
                </div>
            </div>

            {/* Conteúdo principal — Pastas */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-10">
                {filteredFolders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl min-h-[400px]">
                        <span className="material-symbols-outlined text-6xl mb-4">bookmarks</span>
                        <p className="text-lg font-medium">
                            {searchTerm ? 'Nenhum resultado encontrado.' : 'Nenhum insight salvo ainda.'}
                        </p>
                        <p className="text-sm">
                            {searchTerm ? 'Tente outra busca.' : 'Use o botão de "Salvar" no chat do Tutor IA durante seus estudos.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredFolders.map(folder => {
                            const folderId = folder.subjectId || '__sem_disciplina__';
                            const isExpanded = expandedFolders.has(folderId);
                            const color = folder.subjectColor;

                            return (
                                <div key={folderId} className="bg-card-light dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark overflow-hidden transition-shadow hover:shadow-sm">
                                    {/* Cabeçalho da Pasta */}
                                    <button
                                        onClick={() => toggleFolder(folderId)}
                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 bg-${color}-100 dark:bg-${color}-900/30 text-${color}-600 dark:text-${color}-400`}>
                                            <span className="material-symbols-outlined fill text-lg">{folder.icon}</span>
                                        </div>
                                        <div className="flex-1 text-left min-w-0">
                                            <h3 className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark truncate">
                                                {folder.subjectName}
                                            </h3>
                                            <p className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                                                {folder.notes.length} {folder.notes.length === 1 ? 'nota' : 'notas'}
                                            </p>
                                        </div>
                                        <span
                                            className="material-symbols-outlined text-slate-400 text-[20px] transition-transform duration-200"
                                            style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                        >
                                            expand_more
                                        </span>
                                    </button>

                                    {/* Conteúdo da Pasta (notas) */}
                                    {isExpanded && (
                                        <div className="border-t border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-black/10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 p-3">
                                                {folder.notes.map(note => {
                                                    const isSelected = selectedNoteId === note.id;
                                                    const isCopied = copiedId === note.id;

                                                    return (
                                                        <div
                                                            key={note.id}
                                                            onClick={() => setSelectedNoteId(isSelected ? null : note.id)}
                                                            className={`group flex flex-col rounded-xl border p-4 cursor-pointer transition-all ${
                                                                isSelected
                                                                    ? `border-${color}-300 dark:border-${color}-700 bg-${color}-50/50 dark:bg-${color}-900/10 shadow-md ring-1 ring-${color}-200 dark:ring-${color}-800`
                                                                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-card-dark hover:shadow-sm hover:border-slate-300 dark:hover:border-slate-700'
                                                            }`}
                                                        >
                                                            {/* Tópico + ações */}
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                                                    <span className={`material-symbols-outlined text-[14px] text-${color}-500 shrink-0`}>subdirectory_arrow_right</span>
                                                                    <span className={`text-xs font-medium text-${color}-600 dark:text-${color}-400 truncate`}>
                                                                        {note.topicName || 'Nota geral'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); handleCopy(note.content, note.id); }}
                                                                        className={`p-1 rounded-md transition-colors ${isCopied ? 'text-green-500' : 'text-slate-400 hover:text-primary'}`}
                                                                        title={isCopied ? 'Copiado!' : 'Copiar'}
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">{isCopied ? 'check' : 'content_copy'}</span>
                                                                    </button>
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }}
                                                                        className="p-1 text-slate-400 hover:text-red-500 rounded-md transition-colors"
                                                                        title="Excluir"
                                                                    >
                                                                        <span className="material-symbols-outlined text-[16px]">delete</span>
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {/* Conteúdo */}
                                                            <div className={`flex-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap rounded-lg ${
                                                                isSelected ? '' : 'line-clamp-4'
                                                            }`}>
                                                                {note.content}
                                                            </div>

                                                            {/* Rodapé */}
                                                            <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                                                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-[12px]">schedule</span>
                                                                    {formatDate(note.createdAt)}
                                                                </span>
                                                                {!isSelected && note.content.length > 200 && (
                                                                    <span className="text-[10px] text-primary font-bold">ver mais</span>
                                                                )}
                                                                <span className="material-symbols-outlined text-[14px] text-amber-400">bookmark_added</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};