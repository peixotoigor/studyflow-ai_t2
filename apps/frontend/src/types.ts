import type {
  PriorityLevel as DomainPriorityLevel,
  ProficiencyLevel as DomainProficiencyLevel,
  StudyModality as DomainStudyModality,
  ErrorReason as DomainErrorReason,
  StudyPlan as DomainStudyPlan,
  Subject as DomainSubject,
  Topic as DomainTopic,
  StudyLog as DomainStudyLog,
  ErrorLog as DomainErrorLog,
  SimulatedExam as DomainSimulatedExam,
  SavedNote as DomainSavedNote
} from '@shared/types/domain';

export type PriorityLevel = DomainPriorityLevel;
export type ProficiencyLevel = DomainProficiencyLevel;
export type StudyModality = DomainStudyModality;
export type ErrorReason = DomainErrorReason;

export enum Screen {
  DASHBOARD = 'DASHBOARD',
  STUDY_PLAYER = 'STUDY_PLAYER',
  SUBJECTS = 'SUBJECTS',
  IMPORTER = 'IMPORTER',
  DYNAMIC_SCHEDULE = 'DYNAMIC_SCHEDULE',
  ERROR_NOTEBOOK = 'ERROR_NOTEBOOK',
  SIMULATED_EXAMS = 'SIMULATED_EXAMS',
  SAVED_NOTES = 'SAVED_NOTES',
  HISTORY = 'HISTORY',
  EDITAL_MANAGER = 'EDITAL_MANAGER'
}

export interface NavItem {
  id: Screen;
  label: string;
  icon: string;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  openAiApiKey?: string;
  openAiModel?: string;
  dailyAvailableTimeMinutes?: number;
  githubToken?: string;
  backupGistId?: string;
  scheduleSettings?: any;
  scheduleSelection?: string[] | null;
}

export type Topic = Omit<DomainTopic, 'createdAt' | 'updatedAt'> & {
  createdAt?: string;
  updatedAt?: string;
};

export type StudyLog = DomainStudyLog;
export type ErrorLog = DomainErrorLog;
export type SimulatedExam = DomainSimulatedExam;
export type SavedNote = DomainSavedNote;

export type Subject = Omit<DomainSubject, 'topics' | 'logs' | 'color' | 'weight' | 'priority' | 'proficiency'> & {
  color?: string | null;
  weight?: number | null;
  priority?: PriorityLevel | null;
  proficiency?: ProficiencyLevel | null;
  topics?: Topic[];
  logs?: StudyLog[];
};

export type StudyPlan = Omit<DomainStudyPlan, 'subjects' | 'editalFiles'> & {
  subjects?: Subject[];
  editalFiles?: EditalFile[];
};

export type SessionType = 'THEORY' | 'REVIEW';

export interface ScheduleItem {
  subject: Subject;
  topic?: Topic;
  type: SessionType;
  durationMinutes?: number;
}

// Importer types
export interface SyllabusTopic {
  nome: string;
}

export interface SyllabusSubject {
  nome: string;
  topicos: string[];
}

export interface SyllabusCategory {
  nome: string;
  disciplinas: SyllabusSubject[];
}

export interface SyllabusData {
  cargo: string;
  categorias: SyllabusCategory[];
}

export type ImportStep = 'UPLOAD' | 'PROCESSING' | 'REVIEW' | 'SUCCESS';

export interface ImporterState {
  step: ImportStep;
  fileName: string;
  processingStatus: string;
  progress: number;
  syllabus: SyllabusData | null;
  selectedSubjects: Set<string>;
}

export interface EditalFile {
  id: string;
  planId: string;
  fileName: string;
  dataUrl: string;
  sizeBytes: number;
  mimeType: string;
  uploadedAt: Date | string;
}

export const getSubjectIcon = (subjectName: string): string => {
  const name = subjectName.toLowerCase();
  if (name.includes('matem') || name.includes('calc') || name.includes('cálc') || name.includes('racioc') || name.includes('logi') || name.includes('exata') || name.includes('estat')) return 'calculate';
  if (name.includes('fisic') || name.includes('quim') || name.includes('biolo') || name.includes('cienc')) return 'science';
  if (name.includes('inform') || name.includes('comput') || name.includes('ti') || name.includes('tec') || name.includes('dad') || name.includes('prog') || name.includes('sistem')) return 'terminal';
  if (name.includes('direit') || name.includes('legis') || name.includes('lei') || name.includes('const') || name.includes('penal') || name.includes('civil') || name.includes('process') || name.includes('trab') || name.includes('eleit')) return 'balance';
  if (name.includes('portug') || name.includes('ingl') || name.includes('espa') || name.includes('ling') || name.includes('text') || name.includes('redac') || name.includes('leitura')) return 'auto_stories';
  if (name.includes('hist') || name.includes('geo') || name.includes('filo') || name.includes('socio') || name.includes('atual') || name.includes('human')) return 'public';
  if (name.includes('bio') || name.includes('saud') || name.includes('med') || name.includes('enf') || name.includes('sus')) return 'medical_services';
  if (name.includes('admin') || name.includes('gest') || name.includes('econ') || name.includes('contab') || name.includes('finan') || name.includes('arq')) return 'account_balance';
  if (name.includes('art') || name.includes('desen') || name.includes('mus')) return 'palette';
  return 'menu_book';
};
