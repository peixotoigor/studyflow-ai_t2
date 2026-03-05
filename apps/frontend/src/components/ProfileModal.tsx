import React, { useState, useRef, useEffect } from 'react';
import { UserProfile } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useUpdateUserSettings, useUpdateProfile } from '../hooks/useUser';
import { supabase } from '../lib/supabase';

interface DriveBackupProps {
    onConnect: () => void;
    onBackup: () => void;
    onList: (loadMore?: boolean) => void;
    onRestore: () => void;
    onApply: (fileId: string) => void;
    status: string;
    error: string;
    loading: boolean;
    backupLoading: boolean;
    backups: Array<{ id: string; name?: string; createdTime?: string }>;
    hasMore: boolean;
}

interface ProfileModalProps {
    user: UserProfile;
    isOpen: boolean;
    onClose: () => void;
    onSave: (updatedUser: UserProfile) => void;
    driveBackup?: DriveBackupProps;
}

const AI_MODELS = [
    { id: 'gpt-4o-mini', label: 'GPT-4o Mini (Rápido/Econômico)' },
    { id: 'gpt-4o', label: 'GPT-4o (Inteligência Máxima)' },
    { id: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Legado)' },
    { id: 'o1-preview', label: 'o1 Preview (Raciocínio Avançado)' },
    { id: 'o1-mini', label: 'o1 Mini (Raciocínio Rápido)' }
];

// Utilitários de encoding para evitar erros com caracteres especiais
const toBase64 = (str: string) => btoa(unescape(encodeURIComponent(str)));

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, isOpen, onClose, onSave, driveBackup }) => {
    const [activeTab, setActiveTab] = useState<'PROFILE' | 'KEYS' | 'VAULT' | 'BACKUP'>('PROFILE');
    const [name, setName] = useState(user.name);
    const [email, setEmail] = useState(user.email);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(user.avatarUrl);
    
    // AI Config State
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [hasSavedApiKey, setHasSavedApiKey] = useState(false);
    const [model, setModel] = useState(user.openAiModel || 'gpt-4o-mini');
    const [showApiKey, setShowApiKey] = useState(false);

    // GitHub Sync State
    const [githubTokenInput, setGithubTokenInput] = useState('');
    const [hasSavedGithubToken, setHasSavedGithubToken] = useState(false);
    const [backupGistId, setBackupGistId] = useState(user.backupGistId || '');
    const [showGithubToken, setShowGithubToken] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string>('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

    // Magic Link State
    const [magicLink, setMagicLink] = useState<string>('');

    // Drive Backup state mirrors props for UI feedback
    const driveStatus = driveBackup?.status || '';
    const driveError = driveBackup?.error || '';
    const driveLoading = driveBackup?.loading || false;
    const driveBackupLoading = driveBackup?.backupLoading || false;

    // Crop State
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [cropScale, setCropScale] = useState(1);
    const [cropPos, setCropPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    // Email change state
    const [emailPassword, setEmailPassword] = useState('');
    const [emailStatus, setEmailStatus] = useState('');

    // Password change state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordStatus, setPasswordStatus] = useState('');
    const { user: authUser } = useAuth();
    const updateSettings = useUpdateUserSettings();
    const updateProfile = useUpdateProfile();
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setName(user.name);
            setEmail(user.email);
            setAvatarUrl(user.avatarUrl);
            
            setHasSavedApiKey(!!user.openAiApiKey && user.openAiApiKey.length > 5);
            setApiKeyInput(''); 
            
            setHasSavedGithubToken(!!user.githubToken && user.githubToken.length > 5);
            setGithubTokenInput('');

            setModel(user.openAiModel || 'gpt-4o-mini');
            setBackupGistId(user.backupGistId || '');
            setShowApiKey(false);
            setShowGithubToken(false);
            setSyncStatus('');
            setTempImage(null); 
            setMagicLink('');
            setEmailPassword('');
            setEmailStatus('');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setPasswordStatus('');
            
            try {
                const savedDate = localStorage.getItem('studyflow_last_backup_date');
                if (savedDate) setLastBackupDate(new Date(savedDate).toLocaleString());
            } catch(e) {}
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    // --- Image Handling ---
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setTempImage(reader.result as string);
                setCropScale(1);
                setCropPos({ x: 0, y: 0 });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setAvatarUrl(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({ x: e.clientX - cropPos.x, y: e.clientY - cropPos.y });
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            setCropPos({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        }
    };

    const handleMouseUp = () => setIsDragging(false);

    const performCrop = () => {
        if (imgRef.current) {
            const canvas = document.createElement('canvas');
            const size = 300; 
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size, size);
                const centerX = size / 2;
                const centerY = size / 2;
                ctx.translate(centerX, centerY);
                ctx.scale(cropScale, cropScale);
                ctx.translate(cropPos.x, cropPos.y);
                ctx.drawImage(imgRef.current, -imgRef.current.naturalWidth / 2, -imgRef.current.naturalHeight / 2);
                setAvatarUrl(canvas.toDataURL('image/jpeg', 0.7));
                setTempImage(null);
            }
        }
    };

    const cancelCrop = () => {
        setTempImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // --- SAVE LOGIC ---
    const handleSave = async () => {
        const finalApiKey = apiKeyInput.trim() ? apiKeyInput.trim().replace(/[^\x00-\x7F]/g, "") : user.openAiApiKey;
        const finalGithubToken = githubTokenInput.trim() ? githubTokenInput.trim().replace(/[^\x00-\x7F]/g, "") : user.githubToken;
        const trimmedName = name.trim();

        const updatedUser = { 
            ...user, 
            name: trimmedName || user.name,
            email: user.email, // email é alterado apenas pelo fluxo dedicado
            avatarUrl,
            openAiApiKey: finalApiKey,
            openAiModel: model,
            githubToken: finalGithubToken,
            backupGistId
        };

        // Agora a criptografia é delegada exclusivamente ao Backend (UserSettings API).
        onSave(updatedUser);
        onClose();
    };

    const handleChangeEmail = async () => {
        setEmailStatus('');
        const trimmedEmail = email.trim();
        if (!trimmedEmail || !trimmedEmail.includes('@')) {
            setEmailStatus('Informe um email válido.');
            return;
        }
        if (!emailPassword) {
            setEmailStatus('Digite sua senha atual para alterar o email.');
            return;
        }
        try {
            // Re-autenticar o usuário para confirmar a senha
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: emailPassword
            });
            if (authError) throw new Error('Senha atual incorreta.');

            // Solicitar alteração de e-mail ao Supabase
            const { error: updateError } = await supabase.auth.updateUser({ email: trimmedEmail });
            if (updateError) throw updateError;

            // Optional: Atualiza o nome localmente via api.put('/auth/me') caso precise manter atualizado, mas email tá desabilitado na rota.
            setEmailStatus('Email atualizado no provedor. Confirme-o no link enviado para o novo email.');
            setEmailPassword('');
        } catch (error: any) {
            const message = error?.message || 'Erro ao atualizar email.';
            setEmailStatus(message);
        }
    };

    const handleChangePassword = async () => {
        setPasswordStatus('');
        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordStatus('Preencha todos os campos de senha.');
            return;
        }
        if (newPassword.length < 6) {
            setPasswordStatus('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordStatus('Nova senha e confirmação não conferem.');
            return;
        }
        try {
            // Checar se senha atual está ok
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            });
            if (authError) throw new Error('Senha atual incorreta.');

            const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
            if (updateError) throw updateError;

            setPasswordStatus('Senha atualizada com sucesso.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            const message = error?.message || 'Erro ao atualizar senha.';
            setPasswordStatus(message);
        }
    };

    // --- GitHub Sync Logic ---
    const handleBackupToGithub = async () => {
        const tokenToUse = githubTokenInput.trim() || user.githubToken;
        if (!tokenToUse) {
            setSyncStatus("Erro: Token do GitHub não configurado.");
            return;
        }
        setIsSyncing(true);
        setSyncStatus("Preparando dados...");

        try {
            const getSafe = (k: string) => { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch { return []; } };
            const getSafeObj = (k: string) => { try { return JSON.parse(localStorage.getItem(k) || '{}'); } catch { return {}; } };
            const getSafeStr = (k: string) => { try { return localStorage.getItem(k) || ''; } catch { return ''; } };

            const backupData = {
                version: 2,
                timestamp: new Date().toISOString(),
                subjects: getSafe('studyflow_subjects'),
                plans: getSafe('studyflow_plans'),
                currentPlanId: getSafeStr('studyflow_current_plan'),
                errors: getSafe('studyflow_errors'),
                user: { 
                    ...user, 
                    githubToken: undefined, 
                    openAiApiKey: undefined 
                }, 
                simulatedExams: getSafe('studyflow_simulated_exams'),
                savedNotes: getSafe('studyflow_saved_notes'),
                scheduleSettings: getSafeObj('studyflow_schedule_settings'),
                scheduleSelection: getSafe('studyflow_schedule_selection'),
                importerState: getSafeObj('studyflow_importer'),
                playerState: getSafeObj('studyflow_player_state'),
                expandedSubjectId: getSafeStr('studyflow_expanded_subject_id') || null
            };

            const fileName = "studyflow_backup.json";
            const content = JSON.stringify(backupData, null, 2);
            const url = backupGistId ? `https://api.github.com/gists/${backupGistId}` : `https://api.github.com/gists`;
            const method = backupGistId ? 'PATCH' : 'POST';

            setSyncStatus("Enviando para o GitHub...");

            const response = await fetch(url, {
                method: method,
                headers: { 'Authorization': `token ${tokenToUse}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ description: `StudyFlow AI Backup (v2)`, public: false, files: { [fileName]: { content: content } } })
            });

            if (!response.ok) throw new Error("Falha na conexão com GitHub.");

            const data = await response.json();
            setBackupGistId(data.id);
            setSyncStatus("Backup realizado com sucesso! ✅");
            
            const now = new Date();
            try { localStorage.setItem('studyflow_last_backup_date', now.toISOString()); } catch(e){}
            setLastBackupDate(now.toLocaleString());

        } catch (error: any) {
            console.error(error);
            setSyncStatus(`Erro: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleRestoreFromGithub = async () => {
        const tokenToUse = githubTokenInput.trim() || user.githubToken;
        if (!tokenToUse || !backupGistId) return;
        if (!window.confirm("Isso substituirá seus dados atuais. Continuar?")) return;

        setIsSyncing(true);
        setSyncStatus("Baixando dados...");

        try {
            const response = await fetch(`https://api.github.com/gists/${backupGistId}`, { headers: { 'Authorization': `token ${tokenToUse}` } });
            if (!response.ok) throw new Error("Erro ao acessar backup.");
            const data = await response.json();
            const fileKey = Object.keys(data.files).find(key => key.includes('studyflow'));
            if (!fileKey) throw new Error("Arquivo de backup não encontrado.");
            const content = JSON.parse(data.files[fileKey].content);

            const safeSave = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch(e) {} };

            if (content.subjects) safeSave('studyflow_subjects', JSON.stringify(content.subjects));
            if (content.user) {
                let currentUser = {};
                try { currentUser = JSON.parse(localStorage.getItem('studyflow_user') || '{}'); } catch(e){}
                const mergedUser = { ...content.user, githubToken: tokenToUse, backupGistId: backupGistId };
                safeSave('studyflow_user', JSON.stringify(mergedUser));
            }
            
            setSyncStatus("Restauração completa! Recarregando...");
            setTimeout(() => window.location.reload(), 1000);
        } catch (error: any) {
            setSyncStatus(`Erro: ${error.message}`);
        } finally {
            setIsSyncing(false);
        }
    };

    const getInitials = (fullName: string) => {
        const names = fullName.split(' ');
        if (names.length >= 2) return `${names[0][0]}${names[1][0]}`.toUpperCase();
        return fullName.slice(0, 2).toUpperCase();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white dark:bg-[#1a1a2e] w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 transform transition-all scale-100 flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 sticky top-0 z-10 backdrop-blur-md">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">Editar Perfil</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div className="flex flex-col">
                    {!tempImage && (
                        <div className="flex border-b border-gray-100 dark:border-gray-800 px-6">
                            <button onClick={() => setActiveTab('PROFILE')} className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'PROFILE' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Perfil</button>
                            <button onClick={() => setActiveTab('KEYS')} className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'KEYS' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Chaves & API</button>
                            {driveBackup && (
                                <button onClick={() => setActiveTab('BACKUP')} className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors ${activeTab === 'BACKUP' ? 'border-emerald-500 text-emerald-600' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Backups</button>
                            )}
                        </div>
                    )}

                    <div className="p-6 flex flex-col gap-6">
                        {tempImage ? (
                            <div className="flex flex-col items-center gap-6 animate-in fade-in">
                                 <div className="relative size-64 bg-gray-900 rounded-lg overflow-hidden cursor-move border-2 border-primary/50" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                        <img ref={imgRef} src={tempImage} alt="Crop preview" style={{ transform: `translate(${cropPos.x}px, ${cropPos.y}px) scale(${cropScale})`, maxWidth: 'none', maxHeight: 'none' }} draggable={false}/>
                                    </div>
                                </div>
                                <div className="w-full max-w-xs flex items-center gap-4">
                                    <span className="material-symbols-outlined text-gray-400">zoom_out</span>
                                    <input type="range" min="0.5" max="3" step="0.1" value={cropScale} onChange={(e) => setCropScale(parseFloat(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                                    <span className="material-symbols-outlined text-gray-400">zoom_in</span>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={cancelCrop} className="px-4 py-2 rounded-lg text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">Cancelar</button>
                                    <button onClick={performCrop} className="px-6 py-2 rounded-lg text-sm font-bold text-white bg-primary hover:bg-blue-600">Confirmar</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'PROFILE' && (
                                    <div className="flex flex-col gap-6 animate-in fade-in">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="relative group">
                                                <div className={`size-24 rounded-full overflow-hidden border-4 border-white dark:border-[#2d2d42] shadow-lg flex items-center justify-center ${!avatarUrl ? 'bg-primary/10 text-primary' : 'bg-gray-100'}`}>
                                                    {avatarUrl ? <img src={avatarUrl} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold">{getInitials(name)}</span>}
                                                </div>
                                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-primary hover:bg-blue-600 text-white p-2 rounded-full shadow-md transition-transform transform hover:scale-105" title="Alterar foto">
                                                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                                                </button>
                                            </div>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                            {avatarUrl && (
                                                <button onClick={handleRemovePhoto} className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">delete</span> Remover foto
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Nome Completo</label>
                                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all" />
                                            </div>
                                            <div className="flex flex-col gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark/60">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Alterar email</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Será solicitado sua senha atual.</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-primary">mark_email_unread</span>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Novo email</label>
                                                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all" />
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Senha atual</label>
                                                    <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all" />
                                                </div>
                                                <div className="flex flex-col gap-2">
                                                    <button onClick={handleChangeEmail} className="w-full md:w-auto px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gray-800 dark:bg-white dark:text-gray-900 hover:opacity-90 transition-all active:scale-95">Atualizar email</button>
                                                    {emailStatus && <span className={`text-xs font-bold ${emailStatus.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>{emailStatus}</span>}
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-card-dark/60">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Alterar senha</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Informe a senha atual e confirme a nova.</p>
                                                    </div>
                                                    <span className="material-symbols-outlined text-primary">lock_reset</span>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Senha atual</label>
                                                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all" />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5">
                                                        <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Nova senha</label>
                                                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all" />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 md:col-span-2">
                                                        <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Confirmar nova senha</label>
                                                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all" />
                                                    </div>
                                                    <div className="md:col-span-2 flex flex-col gap-2">
                                                        <button onClick={handleChangePassword} className="w-full md:w-auto px-4 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-600 transition-all active:scale-95">Alterar senha</button>
                                                        {passwordStatus && <span className={`text-xs font-bold ${passwordStatus.includes('sucesso') ? 'text-green-600' : 'text-red-500'}`}>{passwordStatus}</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'KEYS' && (
                                    <div className="flex flex-col gap-6 animate-in fade-in">
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-primary text-xl">smart_toy</span>
                                                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Configurações de IA</h3>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">OpenAI API Key</label>
                                                    {hasSavedApiKey && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">check_circle</span> Salvo</span>}
                                                </div>
                                                <div className="relative">
                                                    <input type={showApiKey ? "text" : "password"} value={apiKeyInput} onChange={(e) => setApiKeyInput(e.target.value)} className={`w-full pl-4 pr-10 py-2.5 rounded-lg border text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all font-mono text-sm ${hasSavedApiKey && !apiKeyInput ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 placeholder-green-700 dark:placeholder-green-400' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'}`} placeholder={hasSavedApiKey ? "••••••••••••••••••••" : "sk-..."} autoComplete="off" />
                                                    <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"><span className="material-symbols-outlined text-[20px]">{showApiKey ? 'visibility_off' : 'visibility'}</span></button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Modelo GPT</label>
                                                <div className="relative">
                                                    <select value={model} onChange={(e) => setModel(e.target.value)} className="w-full appearance-none pl-4 pr-10 py-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all cursor-pointer">
                                                        {AI_MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                                                    </select>
                                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"><span className="material-symbols-outlined">expand_more</span></span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="h-px bg-gray-100 dark:bg-gray-800 w-full"></div>
                                        <div className="flex flex-col gap-4">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="material-symbols-outlined text-gray-800 dark:text-white text-xl">cloud_sync</span>
                                                <div className="flex flex-col">
                                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Nuvem Pessoal (GitHub)</h3>
                                                    {lastBackupDate && <span className="text-[10px] text-green-600 dark:text-green-400 font-medium">Backup: {lastBackupDate}</span>}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex justify-between items-center">
                                                    <label className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">GitHub Token (Gist)</label>
                                                    {hasSavedGithubToken && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[12px]">check_circle</span> Salvo</span>}
                                                </div>
                                                <div className="relative">
                                                    <input type={showGithubToken ? "text" : "password"} value={githubTokenInput} onChange={(e) => setGithubTokenInput(e.target.value)} className={`w-full pl-4 pr-10 py-2.5 rounded-lg border text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary/50 outline-none transition-all font-mono text-sm ${hasSavedGithubToken && !githubTokenInput ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 placeholder-green-700 dark:placeholder-green-400' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'}`} placeholder={hasSavedGithubToken ? "••••••••••••••••••••" : "ghp_..."} autoComplete="off" />
                                                    <button type="button" onClick={() => setShowGithubToken(!showGithubToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"><span className="material-symbols-outlined text-[20px]">{showGithubToken ? 'visibility_off' : 'visibility'}</span></button>
                                                </div>
                                            </div>
                                            {(hasSavedGithubToken || githubTokenInput) && (
                                                <div className="flex flex-col gap-3 mt-2 animate-in fade-in">
                                                    <div className="flex gap-3">
                                                        <button onClick={handleBackupToGithub} disabled={isSyncing} className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-800 dark:bg-white text-white dark:text-gray-900 rounded-lg font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50"><span className="material-symbols-outlined text-sm">cloud_upload</span> Salvar Dados</button>
                                                        <button onClick={handleRestoreFromGithub} disabled={isSyncing || !backupGistId} className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white rounded-lg font-bold text-xs hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"><span className="material-symbols-outlined text-sm">cloud_download</span> Restaurar</button>
                                                    </div>
                                                    {syncStatus && <p className={`text-xs text-center font-bold animate-pulse ${syncStatus.includes('Erro') ? 'text-red-500' : 'text-green-500'}`}>{syncStatus}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'BACKUP' && driveBackup && (
                                    <div className="flex flex-col gap-5 animate-in fade-in">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/40 text-emerald-900 dark:text-emerald-100 rounded-lg p-4 text-sm">
                                            <div className="flex items-center gap-2 mb-2 font-bold uppercase text-xs">
                                                <span className="material-symbols-outlined text-emerald-500">cloud_done</span>
                                                Backup em Nuvem (Drive)
                                            </div>
                                            <p>Conecte seu Google Drive para enviar e restaurar backups completos do StudyFlow.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <button
                                                onClick={driveBackup.onConnect}
                                                disabled={driveBackup.loading}
                                                className="w-full py-3 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">link</span>
                                                {driveBackup.loading ? 'Conectando...' : 'Conectar Drive'}
                                            </button>
                                            <button
                                                onClick={driveBackup.onBackup}
                                                disabled={driveBackup.backupLoading}
                                                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">backup</span>
                                                {driveBackup.backupLoading ? 'Enviando...' : 'Salvar Backup'}
                                            </button>
                                            <button
                                                onClick={() => driveBackup.onList(false)}
                                                disabled={driveBackup.loading}
                                                className="w-full py-3 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">list_alt</span>
                                                {driveBackup.loading ? 'Listando...' : 'Listar Backups'}
                                            </button>
                                            <button
                                                onClick={driveBackup.onRestore}
                                                disabled={driveBackup.loading}
                                                className="w-full py-3 bg-white dark:bg-card-dark border border-gray-200 dark:border-gray-700 rounded-lg font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-[18px]">history</span>
                                                Restaurar por ID
                                            </button>
                                        </div>

                                        {(driveStatus || driveError) && (
                                            <div className={`text-xs font-bold text-center px-3 py-2 rounded-lg ${driveError ? 'bg-red-50 text-red-600 border border-red-100 dark:bg-red-900/20 dark:text-red-200 dark:border-red-800/40' : 'bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-200 dark:border-emerald-800/40'}`}>
                                                {driveError || driveStatus}
                                            </div>
                                        )}

                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between text-xs font-bold text-gray-500 dark:text-gray-300 uppercase">
                                                <span>Arquivos salvos</span>
                                                {driveBackup.hasMore && (
                                                    <button onClick={() => driveBackup.onList(true)} disabled={driveBackup.loading} className="text-emerald-600 dark:text-emerald-300 hover:underline disabled:opacity-50">Carregar mais</button>
                                                )}
                                            </div>
                                            <div className="rounded-lg border border-gray-200 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
                                                {driveBackup.backups.length === 0 ? (
                                                    <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">Nenhum backup listado ainda.</div>
                                                ) : (
                                                    driveBackup.backups.map((file) => (
                                                        <div key={file.id} className="p-4 flex flex-col gap-1">
                                                            <div className="flex items-center justify-between text-sm font-bold text-gray-900 dark:text-white">
                                                                <span className="truncate">{file.name || 'Backup sem nome'}</span>
                                                                <span className="text-[11px] text-gray-400">{file.createdTime ? new Date(file.createdTime).toLocaleString() : ''}</span>
                                                            </div>
                                                            <span className="text-[11px] text-gray-500 dark:text-gray-400">ID: {file.id}</span>
                                                            <div className="flex gap-2 mt-2">
                                                                <button
                                                                    onClick={() => driveBackup.onApply(file.id)}
                                                                    disabled={driveBackup.loading}
                                                                    className="flex-1 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition disabled:opacity-50"
                                                                >
                                                                    Restaurar este backup
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {!tempImage && (
                    <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3 sticky bottom-0 z-10 backdrop-blur-md">
                        <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">Fechar</button>
                        <button onClick={handleSave} className="px-6 py-2 rounded-lg text-sm font-semibold text-white bg-primary hover:bg-blue-600 shadow-lg shadow-primary/25 transition-all transform active:scale-95">Salvar Alterações</button>
                    </div>
                )}
            </div>
        </div>
    );
};