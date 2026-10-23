export type QuestionType = 'objective' | 'dissertative';

export interface ObjectiveOption {
  id: string; // e.g. "A", "B", "C", "D", "E"
  text: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface RubricCriterion {
  id: string;
  title: string;
  description: string;
  maxScore: number;
}

export interface Question {
  id: string;
  order: number;
  type: QuestionType;
  statement: string;
  points: number;
  subjectTag?: string;
  // BNCC Integration
  bnccCode?: string; // ex: "EF09CI01", "EM13MAT301", "EF08LP04"
  bnccSkillDescription?: string;
  // Imagem, Charge, Infográfico ou Mapa
  imageUrl?: string;
  imageCaption?: string;
  imageSource?: string;
  // Texto de Apoio de Fontes Públicas e Confiáveis (PNLD, MEC, IBGE, Scielo)
  supportingText?: string;
  supportingTextSource?: string;
  supportingTextTitle?: string;
  // Adaptação Inclusiva (TEA / Deficiência Intelectual / AEE)
  isAdaptedForInclusion?: boolean;
  adaptationNotes?: string;
  visualCue?: string;
  // Alinhamento Pedagógico Detalhado BNCC
  bnccAlignmentStatus?: 'sugerida' | 'revisada' | 'confirmada';
  bnccPedagogicalRationale?: string;
  bnccSkillOrigin?: 'oficial_mec' | 'manual_docente';
  // Objective fields
  options?: ObjectiveOption[];
  // Dissertative fields
  expectedAnswer?: string;
  rubric?: RubricCriterion[];
  minWords?: number;
  maxWords?: number;
}

export interface Exam {
  id: string;
  title: string;
  description: string;
  institution?: string; // Nome da Escola Pública / Privada
  subject: string; // Componente Curricular BNCC
  gradeLevel: string; // Etapa / Ano da BNCC
  teacherName?: string;
  className?: string; // Turma (ex: 9º Ano A)
  bimester?: string; // 1º, 2º, 3º ou 4º Bimestre
  durationMinutes: number; // 0 = no time limit
  passingScore: number;
  totalScore: number;
  instructions: string[];
  questions: Question[];
  bnccSkillsList?: { code: string; description: string; origin?: 'oficial_mec' | 'manual_docente' }[];
  // Adaptação Inclusiva Geral
  isAdaptedForInclusion?: boolean;
  adaptationType?: 'tea' | 'deficiencia_intelectual' | 'geral_aee';
  adaptationGuidelines?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface StudentAnswer {
  questionId: string;
  type: QuestionType;
  selectedOptionId?: string; // e.g. "B"
  writtenText?: string;
  flaggedForReview?: boolean;
}

export interface CriteriaGrade {
  criterionTitle: string;
  maxScore: number;
  score: number;
  comment: string;
}

export interface GradedQuestion {
  questionId: string;
  type: QuestionType;
  maxPoints: number;
  awardedPoints: number;
  isCorrect?: boolean;
  aiEvaluated?: boolean;
  teacherOverridden?: boolean;
  feedback?: string;
  detailedFeedback?: string;
  summaryJustification?: string;
  criteriaGrades?: CriteriaGrade[];
  strengths?: string[];
  improvements?: string[];
  bnccCode?: string;
}

export interface ExamSubmission {
  id: string;
  examId: string;
  studentName: string;
  studentEmail?: string;
  studentRegistration?: string;
  startedAt: string;
  submittedAt: string;
  durationSpentSeconds: number;
  answers: Record<string, StudentAnswer>;
  grades: Record<string, GradedQuestion>;
  objectiveScore: number;
  dissertativeScore: number;
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  status: 'pending_grading' | 'graded';
  teacherNotes?: string;
  sourceType?: 'online' | 'photo_batch';
  photoUrl?: string;
}

// ----------------------------------------------------------------------------
// REDAÇÃO ENEM / MEC TYPES (5 Competências de 0 a 200 pts)
// ----------------------------------------------------------------------------
export interface EnemCompetency {
  competencyNumber: 1 | 2 | 3 | 4 | 5;
  title: string;
  shortName: string;
  description: string;
  score: number; // 0, 40, 80, 120, 160, 200
  maxScore: 200;
  levelText: string;
  feedback: string;
  deviations?: string[];
}

export interface EnemInterventionDetails {
  agent: { present: boolean; text?: string; feedback?: string };
  action: { present: boolean; text?: string; feedback?: string };
  means: { present: boolean; text?: string; feedback?: string };
  effect: { present: boolean; text?: string; feedback?: string };
  detailing: { present: boolean; text?: string; feedback?: string };
}

export interface EnemEssaySubmission {
  id: string;
  studentName: string;
  studentRegistration?: string;
  schoolName?: string;
  className?: string; // Turma
  theme: string;
  motivatingTexts?: string;
  submissionType: 'text' | 'photo' | 'batch_photo';
  imagePreview?: string;
  additionalImages?: string[]; // Para folhas complementares ou múltiplas páginas
  essayText: string;
  competencies: EnemCompetency[];
  totalScore: number; // 0 to 1000
  interventionDetails: EnemInterventionDetails;
  summaryPedagogical: string;
  strengths: string[];
  improvements: string[];
  correctionType?: 'enem' | 'rubric';
  rubricGrades?: CriteriaGrade[];
  batchId?: string;
  teacherReview?: {
    teacherName?: string;
    adjustedTotalScore?: number;
    teacherComments?: string;
  };
  status: 'pending' | 'graded' | 'needs_review' | 'manual_id_required';
  createdAt: string;
  gradedAt?: string;
}

// ----------------------------------------------------------------------------
// MÓDULO 1: CORREÇÃO DE REDAÇÕES POR LOTE DE FOTOGRAFIAS
// ----------------------------------------------------------------------------
export interface StudentRecord {
  id: string;
  name: string;
  registration?: string;
}

export interface ClassGroup {
  id: string;
  name: string; // Ex: "3º Ano A - Médio"
  subject: string;
  teacherName?: string;
  students: StudentRecord[];
}

export interface BatchPhotoItem {
  id: string;
  fileName: string;
  fileSize: number;
  previewUrl: string; // base64
  detectedStudentName?: string;
  matchedStudentId?: string;
  pageNumber: number;
  totalPages: number;
  isMirrorSheet?: boolean;
  status: 'uploaded' | 'ready' | 'processing' | 'graded' | 'error' | 'awaiting_manual_id';
  transcription?: string;
  errorMessage?: string;
  essayResult?: EnemEssaySubmission;
}

export interface EssayBatchConfig {
  id: string;
  className: string;
  subject: string;
  teacherName: string;
  theme: string;
  correctionType: 'enem' | 'rubric';
  customCriteria?: RubricCriterion[];
  activityDate: string;
  concurrencyLimit: number; // e.g., 2
}

// ----------------------------------------------------------------------------
// BNCC PROFICIENCY SCALES (SAEB / BNCC) & HABILIDADES
// ----------------------------------------------------------------------------
export type BnccProficiencyLevel = 'abaixo_do_basico' | 'basico' | 'adequado' | 'avancado';

export interface BnccSkillPerformance {
  code: string;
  description: string;
  subject: string;
  totalQuestions: number;
  totalResponses: number;
  correctResponses: number;
  percentage: number;
  level: BnccProficiencyLevel;
  suggestedAction: string;
}

export interface StudentProficiencySummary {
  studentName: string;
  studentRegistration?: string;
  totalScore: number;
  percentage: number;
  level: BnccProficiencyLevel;
  skillsMasteredCount: number;
  skillsDevelopingCount: number;
}

export interface ManualBnccSkill {
  code: string;
  title: string;
  description: string;
  stage: 'fundamental_1' | 'fundamental_2' | 'medio' | 'competencia_geral';
  grade: string;
  subject: string;
  teacherAuthor?: string;
  createdAt: string;
  origem: 'manual_docente';
}
