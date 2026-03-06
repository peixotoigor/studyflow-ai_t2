import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSummary } from '../hooks/useSummary';
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../hooks/usePlans';
import { useCreateSubject, useUpdateSubject, useDeleteSubject, useCreateTopic, useUpdateTopic, useDeleteTopic } from '../hooks/useSubjects';
import { useCreateStudyLog, useUpdateStudyLog, useDeleteStudyLog } from '../hooks/useStudyLogs';
import { useCreateErrorLog, useUpdateErrorLog, useDeleteErrorLog } from '../hooks/useErrorLogs';
import { useCreateSimulatedExam, useUpdateSimulatedExam, useDeleteSimulatedExam } from '../hooks/useSimulatedExams';
import { useCreateSavedNote, useUpdateSavedNote, useDeleteSavedNote } from '../hooks/useSavedNotes';
import { useUser, useUpdateUserSettings, useUpdateProfile } from '../hooks/useUser';
import api from '../api/client';
import { Screen } from '../types';
import { Sidebar } from '../components/Sidebar';
import { Dashboard } from '../components/Dashboard';
import { StudyPlayer } from '../components/StudyPlayer';
import { SubjectManager } from '../components/SubjectManager';
import { StudyHistory } from '../components/StudyHistory';
import { Importer } from '../components/Importer';
import { DynamicSchedule } from '../components/DynamicSchedule';
import { ErrorNotebook } from '../components/ErrorNotebook';
import { SimulatedExams } from '../components/SimulatedExams';
import { SavedNotes } from '../components/SavedNotes';
import { ProfileModal } from '../components/ProfileModal';
import { BottomNavigation } from '../components/BottomNavigation';
import { loadLocalSecret, saveLocalSecret } from '../utils/secrets';
import { useTheme } from '../contexts/ThemeContext';
import type { StudyPlan, Subject, ErrorLog, StudyLog, SimulatedExam, SavedNote, StudyModality, ImporterState, UserProfile } from '../types';

const isValidUUID = (value?: string) => !!value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);


const MigratedAppPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { logout, token } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.DASHBOARD);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [currentPlanId, setCurrentPlanId] = useState<string>('');
  const [driveLoading, setDriveLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  const [driveStatus, setDriveStatus] = useState('');
  const [driveError, setDriveError] = useState('');
  const [backups, setBackups] = useState<Array<{ id: string; name?: string; createdTime?: string }>>([]);
  const [nextBackupPageToken, setNextBackupPageToken] = useState<string | undefined>(undefined);
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'ok' | 'error'>('idle');
  const [syncMessage, setSyncMessage] = useState('');
  const [importerState, setImporterState] = useState<ImporterState>({
    step: 'UPLOAD',
    fileName: '',
    processingStatus: '',
    progress: 0,
    syllabus: null,
    selectedSubjects: new Set()
  });

  // Data hooks - só executam se houver token
  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useSummary();
  const { data: plans = [], isLoading: plansLoading, error: plansError } = usePlans();
  const { data: userData, isLoading: userLoading, error: userError } = useUser();

  // Mutations
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();
  const createSubject = useCreateSubject();
  const updateSubject = useUpdateSubject();
  const deleteSubject = useDeleteSubject();
  const createTopic = useCreateTopic();
  const updateTopic = useUpdateTopic();
  const deleteTopic = useDeleteTopic();
  const createStudyLog = useCreateStudyLog();
  const updateStudyLog = useUpdateStudyLog();
  const deleteStudyLog = useDeleteStudyLog();
  const createErrorLog = useCreateErrorLog();
  const updateErrorLog = useUpdateErrorLog();
  const deleteErrorLog = useDeleteErrorLog();
  const createSimulatedExam = useCreateSimulatedExam();
  const updateSimulatedExam = useUpdateSimulatedExam();
  const deleteSimulatedExam = useDeleteSimulatedExam();
  const createSavedNote = useCreateSavedNote();
  const updateSavedNote = useUpdateSavedNote();
  const deleteSavedNote = useDeleteSavedNote();
  const updateUserSettings = useUpdateUserSettings();
  const updateProfile = useUpdateProfile();
  
  const { theme, toggleTheme } = useTheme();

  const autoRestoreAttempted = useRef(false);

  const runBackgroundBackup = useCallback(async () => {
    try {
      await api.post('/drive/backup/export');
      setSyncMessage('Sincronizado e backup enviado');
    } catch (err: any) {
      console.warn('[backup] falha ao enviar backup automático', err);
      setSyncMessage(err?.response?.data?.message || err?.message || 'Backup não pôde ser enviado');
    }
  }, []);

  const pushSync = useCallback(async () => {
    setSyncMessage('');
    setSyncState('syncing');
    try {
      await api.post('/drive/sync/push');
      setSyncState('ok');
      setSyncMessage('Sincronizado com o Drive');
      // Envia backup automático após qualquer alteração
      runBackgroundBackup();
      setTimeout(() => setSyncState('idle'), 1500);
    } catch (error: any) {
      setSyncState('error');
      setSyncMessage(error?.response?.data?.message || error.message || 'Erro ao sincronizar');
      setTimeout(() => setSyncState('idle'), 4000);
    }
  }, [runBackgroundBackup]);

  // Safe summary data - sempre retorna objeto válido
  const safeSummaryData = useMemo(() => {
    if (!summaryData) {
      return {
        plans: [],
        errorLogs: [],
        studyLogs: [],
        simulatedExams: [],
        savedNotes: []
      };
    }
    return summaryData;
  }, [summaryData]);

  // Settings e chaves locais sempre calculados para manter ordem de hooks estável
  const settings = useMemo(() => {
    const base = {
      dailyAvailableTimeMinutes: 240,
      openAiModel: 'gpt-4o-mini',
      hasOpenAiApiKey: false,
      hasGithubToken: false,
      backupGistId: null as string | null,
      avatarUrl: null as string | null,
      openAiApiKeyDecrypted: null as string | null,
      githubTokenDecrypted: null as string | null,
      scheduleSettings: null as any,
      scheduleSelection: null as string[] | null
    };
    if (!userData?.settings) return base;
    return { ...base, ...userData.settings };
  }, [userData]);

  const localOpenAiKey = useMemo(() => loadLocalSecret('openai') || settings.openAiApiKeyDecrypted || null, [settings.openAiApiKeyDecrypted]);
  const localGithubToken = useMemo(() => loadLocalSecret('github') || settings.githubTokenDecrypted || null, [settings.githubTokenDecrypted]);

  // Ao receber chaves descriptografadas, salva localmente para uso automático
  useEffect(() => {
    if (settings.openAiApiKeyDecrypted) {
      saveLocalSecret('openai', settings.openAiApiKeyDecrypted);
    }
    if (settings.githubTokenDecrypted) {
      saveLocalSecret('github', settings.githubTokenDecrypted);
    }
  }, [settings.openAiApiKeyDecrypted, settings.githubTokenDecrypted]);

  // Initialize current plan quando plans carregarem
  useEffect(() => {
    if (plans.length > 0 && !currentPlanId) {
      setCurrentPlanId(plans[0].id);
    }
  }, [plans, currentPlanId]);

  // Handle URL parameters for Google Drive connection results
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const driveResult = params.get('drive');
    const folderId = params.get('folderId');
    const errorMessage = params.get('message');

    if (driveResult === 'connected') {
      setDriveStatus('Google Drive conectado com sucesso!');
      if (folderId) {
        setDriveStatus(`Google Drive conectado! Pasta: ${folderId}`);
        // Tenta listar backups imediatamente após conectar
        handleListBackups();
      }
      setIsProfileOpen(true);
      // Limpa os parâmetros da URL para evitar mensagens repetidas no refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (driveResult === 'error') {
      setDriveError(errorMessage || 'Erro ao conectar ao Google Drive');
      setIsProfileOpen(true);
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Loading state
  const isLoading = summaryLoading || plansLoading || userLoading;

  // Error state - apenas erros críticos
  const criticalError = userError || (summaryError && !summaryData) || (plansError && plans.length === 0);

  const handleDriveConnect = async () => {
    setDriveError('');
    setDriveStatus('');
    setDriveLoading(true);
    try {
      const { data } = await api.get<{ url: string }>('/drive/connect', {
        params: { returnUrl: window.location.href }
      });
      if (data.url) {
        window.location.href = data.url;
      } else {
        setDriveStatus('URL de conexão não recebida.');
      }
    } catch (error: any) {
      setDriveError(error?.response?.data?.message || error.message || 'Erro ao conectar Google Drive');
    } finally {
      setDriveLoading(false);
    }
  };

  const handleBackupNow = async () => {
    setDriveError('');
    setDriveStatus('');
    setBackupLoading(true);
    try {
      const { data } = await api.post<{ fileId: string; folderId: string; message?: string }>('/drive/backup/export');
      setDriveStatus(data.message || 'Backup enviado.');
    } catch (error: any) {
      setDriveError(error?.response?.data?.message || error.message || 'Erro ao enviar backup');
    } finally {
      setBackupLoading(false);
    }
  };

  const handleListBackups = async (useNextPage = false) => {
    setDriveError('');
    setDriveStatus('');
    setDriveLoading(true);
    try {
      const params = useNextPage && nextBackupPageToken ? { pageToken: nextBackupPageToken } : undefined;
      const { data } = await api.get<{ files: Array<{ id: string; name?: string; createdTime?: string }>; nextPageToken?: string }>('/drive/backups', { params });
      setBackups(useNextPage ? [...backups, ...(data.files || [])] : data.files || []);
      setNextBackupPageToken(data.nextPageToken);
      setDriveStatus(`Encontrados ${data.files?.length || 0} backups${data.nextPageToken ? ' (mais disponíveis)' : ''}.`);
    } catch (error: any) {
      setDriveError(error?.response?.data?.message || error.message || 'Erro ao listar backups');
    } finally {
      setDriveLoading(false);
    }
  };

  const applyBackup = useCallback(async (fileId: string) => {
    setDriveError('');
    setDriveStatus('');
    setDriveLoading(true);
    try {
      const { data } = await api.post<{ message: string }>('/drive/backup/restore', { fileId });
      setDriveStatus(data.message || 'Backup aplicado com sucesso.');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['summary'] }),
        queryClient.invalidateQueries({ queryKey: ['plans'] })
      ]);
    } catch (error: any) {
      setDriveError(error?.response?.data?.message || error.message || 'Erro ao restaurar backup');
    } finally {
      setDriveLoading(false);
    }
  }, [queryClient]);

  const handleRestoreFromPrompt = async () => {
    const fileId = window.prompt('Informe o fileId do backup no Drive para restaurar:');
    if (!fileId) return;
    await applyBackup(fileId.trim());
  };

  // Restaura automaticamente o backup mais recente se os dados estiverem vazios e o Drive estiver acessível
  useEffect(() => {
    const autoRestore = async () => {
      if (autoRestoreAttempted.current) return;
      autoRestoreAttempted.current = true;
      try {
        const { data } = await api.get<{ files: Array<{ id: string }> }>('/drive/backups');
        const latest = data?.files?.[0];
        if (latest) {
          await applyBackup(latest.id);
        }
      } catch (err) {
        console.warn('[auto-restore] falha ao restaurar automaticamente', err);
      }
    };

    if (!isLoading && !criticalError && safeSummaryData.plans.length === 0) {
      autoRestore();
    }
  }, [applyBackup, criticalError, isLoading, safeSummaryData.plans.length]);

  // Loading screen (colocado após todos os hooks para manter a ordem estável)
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#f9fafb'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Carregando dados...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Error screen - apenas para erros críticos
  if (criticalError) {
    const getErrorMessage = (error: any) => {
      if (!error) return null;
      if (error.response?.data?.message) return error.response.data.message;
      if (error.message) return error.message;
      return 'Erro desconhecido';
    };

    const errorMessage = getErrorMessage(userError) || getErrorMessage(summaryError) || getErrorMessage(plansError) || 'Erro ao carregar dados';
    
    console.error('Erro crítico detectado:', { userError, summaryError, plansError });
    
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#f9fafb'
      }}>
        <div style={{ fontSize: '48px', color: '#ef4444', marginBottom: '16px' }}>⚠️</div>
        <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#111827', marginBottom: '8px' }}>
          Erro ao carregar dados
        </h1>
        <p style={{
          fontSize: '14px',
          color: '#6b7280',
          marginBottom: '24px',
          textAlign: 'center',
          maxWidth: '600px'
        }}>{errorMessage}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 24px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '500'
            }}
          >
            Recarregar
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('studyflow_token');
              window.location.href = '/login';
            }}
            style={{
              padding: '12px 24px',
              background: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Fazer Logout
          </button>
        </div>
        <p style={{
          fontSize: '12px',
          color: '#9ca3af',
          marginTop: '24px',
          textAlign: 'center'
        }}>
          Verifique o console (F12) para mais detalhes
        </p>
      </div>
    );
  }

  // Se não tem userData, ainda está carregando
  if (!userData) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: '#f9fafb'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '16px'
        }}></div>
        <p style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>Carregando perfil...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  const userProfile = {
    id: userData.user.id,
    name: userData.user.name,
    email: userData.user.email,
    avatarUrl: settings.avatarUrl || null,
    openAiApiKey: localOpenAiKey || (settings.hasOpenAiApiKey ? '***' : ''),
    openAiModel: settings.openAiModel || 'gpt-4o-mini',
    dailyAvailableTimeMinutes: settings.dailyAvailableTimeMinutes || 240,
    githubToken: localGithubToken || (settings.hasGithubToken ? '***' : ''),
    backupGistId: settings.backupGistId || ''
  };

  const syncIcon = syncState === 'syncing' ? 'sync' : syncState === 'ok' ? 'cloud_done' : syncState === 'error' ? 'error' : 'cloud_queue';
  const syncColor = syncState === 'error' ? '#ef4444' : syncState === 'ok' ? '#16a34a' : syncState === 'syncing' ? '#3b82f6' : '#6b7280';

  // Derived data
  const currentPlan = plans.find(p => p.id === currentPlanId);
  const currentPlanSubjects = safeSummaryData.plans.find(p => p.id === currentPlanId)?.subjects || [];
  const currentPlanErrorLogs = safeSummaryData.errorLogs.filter(log => {
    const subject = currentPlanSubjects.find(s => s.id === log.subjectId);
    return !!subject;
  });
  const currentPlanExams = safeSummaryData.simulatedExams.filter(e => e.planId === currentPlanId);
  const allSavedNotes = safeSummaryData.savedNotes;

  // Handlers
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddPlan = async (name: string) => {
    try {
      const newPlan = await createPlan.mutateAsync({ name, color: 'blue' });
      setCurrentPlanId(newPlan.id);
      setCurrentScreen(Screen.SUBJECTS);
      await pushSync();
    } catch (error) {
      console.error('Erro ao criar plano:', error);
      alert('Erro ao criar plano. Tente novamente.');
    }
  };

  const handleImportSubjects = async (subjectsToImport: Subject[]) => {
    try {
      let targetPlanId = currentPlanId || plans[0]?.id;
      if (!targetPlanId) {
        const newPlan = await createPlan.mutateAsync({ name: 'Plano Principal', color: 'blue' });
        targetPlanId = newPlan.id;
        setCurrentPlanId(newPlan.id);
      }

      for (const subj of subjectsToImport) {
        try {
          const createdSubject = await createSubject.mutateAsync({
            planId: targetPlanId,
            name: subj.name,
            color: subj.color || undefined,
            weight: subj.weight || undefined,
            priority: subj.priority || undefined,
            active: true
          });

          if (subj.topics && subj.topics.length) {
            for (const topic of subj.topics) {
              const topicName = typeof topic === 'string' ? topic : topic.name;
              if (!topicName) continue;
              await createTopic.mutateAsync({ subjectId: createdSubject.id, name: topicName, completed: false });
            }
          }
        } catch (subErr) {
          console.error('Erro ao importar disciplina:', subErr);
        }
      }

      await pushSync();
      setCurrentScreen(Screen.SUBJECTS);
    } catch (error) {
      console.error('Erro geral na importação de disciplinas:', error);
      alert('Erro ao importar disciplinas. Verifique a chave OpenAI e tente novamente.');
    }
  };

  const handleUpdatePlan = async (updatedPlan: StudyPlan) => {
    try {
      await updatePlan.mutateAsync({
        id: updatedPlan.id,
        name: updatedPlan.name,
        description: updatedPlan.description || undefined,
        color: updatedPlan.color || undefined
      });
      await pushSync();
    } catch (error) {
      console.error('Erro ao atualizar plano:', error);
      alert('Erro ao atualizar plano. Tente novamente.');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (plans.length <= 1) {
      alert('Mantenha pelo menos um plano.');
      return;
    }
    if (window.confirm('Apagar plano e dados associados?')) {
      try {
        await deletePlan.mutateAsync(planId);
        if (currentPlanId === planId) {
          const remainingPlans = plans.filter(p => p.id !== planId);
          setCurrentPlanId(remainingPlans[0]?.id || '');
        }
        await pushSync();
      } catch (error) {
        console.error('Erro ao deletar plano:', error);
        alert('Erro ao deletar plano. Tente novamente.');
      }
    }
  };

  const handleAddErrorLog = async (log: Omit<ErrorLog, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createErrorLog.mutateAsync({
        subjectId: log.subjectId,
        topicName: log.topicName,
        questionSource: log.questionSource,
        reason: log.reason,
        description: log.description,
        correction: log.correction,
        reviewCount: log.reviewCount
      });
      await pushSync();
    } catch (error) {
      console.error('Erro ao criar log de erro:', error);
      alert('Erro ao salvar erro. Tente novamente.');
    }
  };

  const handleDeleteErrorLog = async (id: string) => {
    if (window.confirm('Apagar?')) {
      try {
        await deleteErrorLog.mutateAsync(id);
        await pushSync();
      } catch (error) {
        console.error('Erro ao deletar log de erro:', error);
        alert('Erro ao deletar. Tente novamente.');
      }
    }
  };

  const handleAddSimulatedExam = async (exam: Omit<SimulatedExam, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await createSimulatedExam.mutateAsync({
        planId: currentPlanId || plans[0]?.id || '',
        title: exam.title,
        institution: exam.institution,
        date: exam.date,
        totalQuestions: exam.totalQuestions,
        correctAnswers: exam.correctAnswers,
        notes: exam.notes || undefined
      });
      await pushSync();
    } catch (error) {
      console.error('Erro ao criar simulado:', error);
      alert('Erro ao criar simulado. Tente novamente.');
    }
  };

  const handleDeleteSimulatedExam = async (id: string) => {
    if (window.confirm('Apagar?')) {
      try {
        await deleteSimulatedExam.mutateAsync(id);
        await pushSync();
      } catch (error) {
        console.error('Erro ao deletar simulado:', error);
        alert('Erro ao deletar. Tente novamente.');
      }
    }
  };

  const handleAddSavedNote = async (content: string, subjectName: string, topicName: string) => {
    try {
      await createSavedNote.mutateAsync({
        planId: currentPlanId || plans[0]?.id || '',
        content,
        topicName,
        subjectId: currentPlanSubjects.find(s => s.name === subjectName)?.id || null
      });
      await pushSync();
    } catch (error) {
      console.error('Erro ao criar nota:', error);
      alert('Erro ao salvar nota. Tente novamente.');
    }
  };

  const handleDeleteSavedNote = async (id: string) => {
    if (window.confirm('Apagar?')) {
      try {
        await deleteSavedNote.mutateAsync(id);
        await pushSync();
      } catch (error) {
        console.error('Erro ao deletar nota:', error);
        alert('Erro ao deletar. Tente novamente.');
      }
    }
  };

  const handleSessionComplete = async (
    subjectId: string,
    topicId: string,
    durationMinutes: number,
    questionsCount: number,
    correctCount: number,
    finished: boolean,
    modalities: StudyModality[]
  ) => {
    try {
      const subject = currentPlanSubjects.find(s => s.id === subjectId);
      const topic = subject?.topics?.find(t => t.id === topicId);
      
      await createStudyLog.mutateAsync({
        subjectId,
        topicId,
        topicName: topic?.name || 'Geral',
        date: new Date(),
        durationMinutes,
        questionsCount,
        correctCount,
        modalities: modalities as string[]
      });

      if (finished && topicId) {
        await updateTopic.mutateAsync({
          subjectId,
          topicId,
          completed: true
        });
      }
      await pushSync();
    } catch (error) {
      console.error('Erro ao salvar sessão:', error);
      alert('Erro ao salvar sessão. Tente novamente.');
    }
  };

  const handleUpdateUser = async (updatedUser: UserProfile) => {
    try {
      const profilePayload: { name?: string; email?: string } = {};
      const trimmedName = updatedUser.name?.trim();
      const trimmedEmail = updatedUser.email?.trim();

      if (trimmedName && trimmedName !== userProfile.name) {
        profilePayload.name = trimmedName;
      }
      if (trimmedEmail && trimmedEmail !== userProfile.email) {
        profilePayload.email = trimmedEmail;
      }

      if (profilePayload.name || profilePayload.email) {
        await updateProfile.mutateAsync(profilePayload);
      }

      await updateUserSettings.mutateAsync({
        dailyAvailableTimeMinutes: updatedUser.dailyAvailableTimeMinutes,
        openAiModel: updatedUser.openAiModel,
        openAiApiKey: updatedUser.openAiApiKey === '***' ? undefined : updatedUser.openAiApiKey,
        githubToken: updatedUser.githubToken === '***' ? undefined : updatedUser.githubToken,
        backupGistId: updatedUser.backupGistId || undefined,
        avatarUrl: updatedUser.avatarUrl || null
      });
      if (updatedUser.openAiApiKey && updatedUser.openAiApiKey !== '***') {
        saveLocalSecret('openai', updatedUser.openAiApiKey);
      }
      if (updatedUser.githubToken && updatedUser.githubToken !== '***') {
        saveLocalSecret('github', updatedUser.githubToken);
      }
      await pushSync();
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar configurações. Tente novamente.');
    }
  };

  const handleUpdateScheduleSettings = async (newSettings: any) => {
    try {
      await updateUserSettings.mutateAsync({
        ...settings, // Preserva campos existentes prevenidos por zod.
        scheduleSettings: newSettings
      });
      await pushSync();
    } catch (err) {
      console.error('Erro salvar schedule settings na API:', err);
    }
  };

  const handleUpdateScheduleSelection = async (newSelection: string[]) => {
    try {
      await updateUserSettings.mutateAsync({
        ...settings,
        scheduleSelection: newSelection
      });
      await pushSync();
    } catch (err) {
       console.error('Erro salvar schedule selection na API:', err);
    }
  };

  const activePlanColor = currentPlan?.color || 'blue';

  const renderScreen = () => {
    switch (currentScreen) {
      case Screen.DASHBOARD:
        return (
          <Dashboard
            onNavigate={setCurrentScreen}
            user={userProfile}
            subjects={currentPlanSubjects}
            errorLogs={currentPlanErrorLogs}
            onManualRestore={async () => {}}
          />
        );
      case Screen.STUDY_PLAYER:
        return (
          <StudyPlayer
            apiKey={userProfile.openAiApiKey}
            model={userProfile.openAiModel}
            subjects={currentPlanSubjects}
            dailyAvailableTime={userProfile.dailyAvailableTimeMinutes || 240}
            onSessionComplete={handleSessionComplete}
            onNavigate={setCurrentScreen}
            onSaveNote={handleAddSavedNote}
            errorLogs={currentPlanErrorLogs}
            scheduleSettings={settings.scheduleSettings}
            scheduleSelection={settings.scheduleSelection}
          />
        );
      case Screen.SUBJECTS:
        return (
          <SubjectManager
            subjects={currentPlanSubjects}
            allSubjects={currentPlanSubjects}
            plans={plans}
            onImportFromPlan={() => {}}
            onDeleteSubject={async (id) => {
              if (window.confirm('Apagar disciplina?')) {
                try {
                  await deleteSubject.mutateAsync(id);
                  await pushSync();
                } catch (error) {
                  console.error('Erro ao deletar disciplina:', error);
                  alert('Erro ao deletar disciplina. Tente novamente.');
                }
              }
            }}
            onBulkDeleteSubjects={async (ids) => {
              for (const id of ids) {
                try {
                  await deleteSubject.mutateAsync(id);
                } catch (error) {
                  console.error('Erro ao deletar disciplina:', error);
                }
              }
              await pushSync();
            }}
            onAddSubject={async (name, weight, color) => {
              try {
                let targetPlanId = currentPlanId || plans[0]?.id;

                // Se não há plano, cria um automaticamente para permitir adicionar disciplinas
                if (!targetPlanId) {
                  const newPlan = await createPlan.mutateAsync({ name: 'Plano Principal', color: 'blue' });
                  targetPlanId = newPlan.id;
                  setCurrentPlanId(newPlan.id);
                }

                await createSubject.mutateAsync({
                  planId: targetPlanId,
                  name,
                  weight,
                  color,
                  active: true
                });
                await pushSync();
              } catch (error) {
                console.error('Erro ao criar disciplina:', error);
                alert('Erro ao criar disciplina. Tente novamente.');
              }
            }}
            onToggleStatus={async (id) => {
              const subject = currentPlanSubjects.find(s => s.id === id);
              if (subject) {
                try {
                  await updateSubject.mutateAsync({
                    id,
                    active: !subject.active
                  });
                  await pushSync();
                } catch (error) {
                  console.error('Erro ao atualizar disciplina:', error);
                  alert('Erro ao atualizar disciplina. Tente novamente.');
                }
              }
            }}
            onAddTopic={async (subjectId, name) => {
              try {
                await createTopic.mutateAsync({ subjectId, name, completed: false });
                await pushSync();
              } catch (error) {
                console.error('Erro ao criar tópico:', error);
                alert('Erro ao criar tópico. Tente novamente.');
              }
            }}
            onRemoveTopic={async (subjectId, topicId) => {
              try {
                await deleteTopic.mutateAsync({ subjectId, topicId });
                await pushSync();
              } catch (error) {
                console.error('Erro ao deletar tópico:', error);
                alert('Erro ao deletar tópico. Tente novamente.');
              }
            }}
            onMoveTopic={() => {}}
            onUpdateSubject={async (subject) => {
              try {
                await updateSubject.mutateAsync({
                  id: subject.id,
                  name: subject.name,
                  active: subject.active,
                  color: subject.color || undefined,
                  weight: subject.weight || undefined,
                  priority: subject.priority || undefined,
                  proficiency: subject.proficiency || undefined
                });
                await pushSync();
              } catch (error) {
                console.error('Erro ao atualizar disciplina:', error);
                alert('Erro ao atualizar disciplina. Tente novamente.');
              }
            }}
            onEditTopic={async (subjectId, topicId, name) => {
              try {
                await updateTopic.mutateAsync({ subjectId, topicId, name });
                await pushSync();
              } catch (error) {
                console.error('Erro ao editar tópico:', error);
                alert('Erro ao editar tópico. Tente novamente.');
              }
            }}
            onUpdateLog={async (subjectId, logId, updatedLog) => {
              try {
                await updateStudyLog.mutateAsync({
                  id: logId,
                  ...updatedLog,
                  topicId: updatedLog.topicId || undefined,
                  modalities: updatedLog.modalities || undefined,
                  notes: updatedLog.notes || undefined
                });
                await pushSync();
              } catch (error) {
                console.error('Erro ao atualizar log:', error);
                alert('Erro ao atualizar log. Tente novamente.');
              }
            }}
            onDeleteLog={async (subjectId, logId) => {
              if (window.confirm('Deseja apagar este registro de estudo?')) {
                try {
                  await deleteStudyLog.mutateAsync(logId);
                  await pushSync();
                } catch (error) {
                  console.error('Erro ao deletar log:', error);
                  alert('Erro ao deletar log. Tente novamente.');
                }
              }
            }}
            onToggleTopicCompletion={async (subjectId, topicId) => {
              const subject = currentPlanSubjects.find(s => s.id === subjectId);
              const topic = subject?.topics?.find(t => t.id === topicId);
              if (topic) {
                try {
                  await updateTopic.mutateAsync({
                    subjectId,
                    topicId,
                    completed: !topic.completed
                  });
                  await pushSync();
                } catch (error) {
                  console.error('Erro ao atualizar tópico:', error);
                  alert('Erro ao atualizar tópico. Tente novamente.');
                }
              }
            }}
            onRestoreSubjects={() => {}}
            apiKey={userProfile.openAiApiKey}
            model={userProfile.openAiModel}
          />
        );
      case Screen.HISTORY:
        return (
          <StudyHistory
            subjects={currentPlanSubjects}
            onUpdateLog={async (subjectId, logId, updatedLog) => {
              try {
                await updateStudyLog.mutateAsync({
                  id: logId,
                  ...updatedLog,
                  topicId: updatedLog.topicId || undefined,
                  modalities: updatedLog.modalities || undefined,
                  notes: updatedLog.notes || undefined
                });
                await pushSync();
              } catch (error) {
                console.error('Erro ao atualizar log:', error);
                alert('Erro ao atualizar log. Tente novamente.');
              }
            }}
            onDeleteLog={async (subjectId, logId) => {
              if (window.confirm('Deseja apagar este registro de estudo?')) {
                try {
                  await deleteStudyLog.mutateAsync(logId);
                  await pushSync();
                } catch (error) {
                  console.error('Erro ao deletar log:', error);
                  alert('Erro ao deletar log. Tente novamente.');
                }
              }
            }}
            onAddLog={async (subjectId, log, markAsCompleted) => {
              try {
                const safeTopicId = isValidUUID(log.topicId || '') ? log.topicId || undefined : undefined;
                await createStudyLog.mutateAsync({
                  subjectId,
                  topicId: safeTopicId,
                  topicName: log.topicName || 'Geral',
                  date: log.date,
                  durationMinutes: log.durationMinutes,
                  questionsCount: log.questionsCount,
                  correctCount: log.correctCount,
                  modalities: Array.isArray(log.modalities) ? log.modalities as string[] : undefined,
                  notes: log.notes || undefined
                });
                if (markAsCompleted && safeTopicId) {
                  await updateTopic.mutateAsync({
                    subjectId,
                    topicId: safeTopicId,
                    completed: true
                  });
                }
                await pushSync();
              } catch (error) {
                console.error('Erro ao criar log:', error);
                const message = (error as any)?.response?.data?.message || (error as any)?.message || 'Erro ao criar log. Tente novamente.';
                alert(message);
              }
            }}
          />
        );
      case Screen.IMPORTER:
        return (
          <Importer
            apiKey={userProfile.openAiApiKey}
            model={userProfile.openAiModel}
            onImport={handleImportSubjects}
            state={importerState}
            setState={setImporterState}
          />
        );
      case Screen.DYNAMIC_SCHEDULE:
        return (
          <DynamicSchedule
            subjects={currentPlanSubjects}
            onUpdateSubject={async (subject) => {
              try {
                await updateSubject.mutateAsync({
                  id: subject.id,
                  name: subject.name,
                  active: subject.active,
                  color: subject.color || undefined,
                  weight: subject.weight || undefined,
                  priority: subject.priority || undefined,
                  proficiency: subject.proficiency || undefined
                });
              } catch (error) {
                console.error('Erro ao atualizar disciplina:', error);
                alert('Erro ao atualizar disciplina. Tente novamente.');
              }
            }}
            user={userProfile}
            onUpdateUser={handleUpdateUser}
            errorLogs={currentPlanErrorLogs}
            scheduleSettings={settings.scheduleSettings}
            onUpdateScheduleSettings={handleUpdateScheduleSettings}
            scheduleSelection={settings.scheduleSelection}
            onUpdateScheduleSelection={handleUpdateScheduleSelection}
          />
        );
      case Screen.ERROR_NOTEBOOK:
        return (
          <ErrorNotebook
            subjects={currentPlanSubjects}
            logs={currentPlanErrorLogs}
            onAddLog={handleAddErrorLog}
            onDeleteLog={handleDeleteErrorLog}
          />
        );
      case Screen.SIMULATED_EXAMS:
        return (
          <SimulatedExams
            exams={currentPlanExams}
            onAddExam={handleAddSimulatedExam}
            onDeleteExam={handleDeleteSimulatedExam}
          />
        );
      case Screen.SAVED_NOTES:
        return (
          <SavedNotes
            notes={allSavedNotes}
            onDeleteNote={handleDeleteSavedNote}
          />
        );
      default:
        return (
          <Dashboard
            onNavigate={setCurrentScreen}
            user={userProfile}
            subjects={currentPlanSubjects}
            errorLogs={currentPlanErrorLogs}
            onManualRestore={async () => {}}
          />
        );
    }
  };

  return (
    <div className="legacy-shell">
      <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark">
        <Sidebar
          currentScreen={currentScreen}
          onNavigate={setCurrentScreen}
          user={userProfile}
          plans={plans}
          currentPlanId={currentPlanId}
          onSwitchPlan={setCurrentPlanId}
          onAddPlan={handleAddPlan}
          onDeletePlan={handleDeletePlan}
          onUpdateUser={handleUpdateUser}
          onUpdatePlan={handleUpdatePlan}
          onOpenProfile={() => setIsProfileOpen(true)}
          onLock={handleLogout}
        />

        <main className="flex-1 flex flex-col h-full overflow-hidden relative transition-colors duration-200">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark flex-shrink-0 transition-colors duration-200 z-20">
            <div className="flex items-center gap-4">
              <div className="flex md:hidden items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-lg">
                  <span className="material-symbols-outlined text-primary">school</span>
                </div>
                <h1 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">StudyFlow AI</h1>
              </div>
              {currentPlan && (
                <div className={`hidden md:flex items-center gap-2 px-3 py-1 bg-${activePlanColor}-50 dark:bg-${activePlanColor}-900/10 rounded-full border border-${activePlanColor}-100 dark:border-${activePlanColor}-900/30`}>
                  <span className={`material-symbols-outlined text-sm text-${activePlanColor}-500`}>folder_open</span>
                  <span className={`text-xs font-bold text-${activePlanColor}-700 dark:text-${activePlanColor}-300`}>
                    {currentPlan.name}
                  </span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4">
              <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-secondary-light dark:text-text-secondary-dark"
                  title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              >
                  <span className="material-symbols-outlined">
                      {theme === 'dark' ? 'light_mode' : 'dark_mode'}
                  </span>
              </button>
              <div className="flex items-center gap-2 text-sm" title={syncMessage || 'Estado de sincronização com o Drive'}>
                <span className="material-symbols-outlined" style={{ color: syncColor, fontSize: '18px' }}>
                  {syncIcon}
                </span>
                <span style={{ color: syncColor, fontWeight: 600 }}>Drive</span>
                {syncState === 'syncing' && <span className="text-xs" style={{ color: '#6b7280' }}>Sincronizando…</span>}
                {syncState === 'ok' && <span className="text-xs" style={{ color: syncColor }}>OK</span>}
                {syncState === 'error' && <span className="text-xs text-red-500">Erro</span>}
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-hidden relative flex flex-col pb-16 md:pb-0">
            {renderScreen()}
          </div>

          <BottomNavigation currentScreen={currentScreen} onNavigate={setCurrentScreen} />

          <ProfileModal
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            user={userProfile}
            onSave={handleUpdateUser}
            driveBackup={{
              onConnect: handleDriveConnect,
              onBackup: handleBackupNow,
              onList: handleListBackups,
              onRestore: handleRestoreFromPrompt,
              onApply: applyBackup,
              status: driveStatus,
              error: driveError,
              loading: driveLoading,
              backupLoading,
              backups,
              hasMore: !!nextBackupPageToken
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default MigratedAppPage;
