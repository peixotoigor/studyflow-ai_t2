export type PriorityLevel = 'HIGH' | 'MEDIUM' | 'LOW';
export type ProficiencyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type StudyModality = 'PDF' | 'VIDEO' | 'QUESTIONS' | 'LEGISLATION' | 'REVIEW';
export type ErrorReason = 'KNOWLEDGE_GAP' | 'ATTENTION' | 'INTERPRETATION' | 'TRICK' | 'TIME';

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface StudyPlan {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  subjects?: Subject[];
  editalFiles?: any[];
}

export interface Subject {
  id: string;
  planId: string;
  name: string;
  active: boolean;
  color: string | null;
  weight: number | null;
  priority: PriorityLevel | null;
  proficiency: ProficiencyLevel | null;
  createdAt: string;
  updatedAt: string;
  topics?: Topic[];
  logs?: StudyLog[];
}

export interface Topic {
  id: string;
  subjectId: string;
  name: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StudyLog {
  id: string;
  subjectId: string;
  topicId: string | null;
  topicName: string;
  date: string;
  durationMinutes: number;
  questionsCount: number;
  correctCount: number;
  modalities: StudyModality[] | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ErrorLog {
  id: string;
  subjectId: string;
  topicName: string;
  questionSource: string;
  reason: ErrorReason;
  description: string;
  correction: string;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SimulatedExam {
  id: string;
  planId: string;
  title: string;
  institution: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedNote {
  id: string;
  planId: string;
  subjectId: string | null;
  content: string;
  topicName: string | null;
  tags: string[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface SummaryResponse {
  plans: StudyPlan[];
  errorLogs: ErrorLog[];
  studyLogs: StudyLog[];
  simulatedExams: SimulatedExam[];
  savedNotes: SavedNote[];
}
