import { Exam, ExamSubmission, EnemEssaySubmission } from '../types/exam';
import { SAMPLE_EXAMS, SAMPLE_SUBMISSIONS } from '../data/sampleExams';
import { SAMPLE_ENEM_ESSAYS } from '../data/sampleEssays';

const EXAMS_STORAGE_KEY = 'gabaritopro_exams_v2';
const SUBMISSIONS_STORAGE_KEY = 'gabaritopro_submissions_v2';
const ESSAYS_STORAGE_KEY = 'gabaritopro_essays_v2';

// Clean legacy test keys if present
function cleanLegacyKeys() {
  try {
    localStorage.removeItem('gabaritopro_exams_v1');
    localStorage.removeItem('gabaritopro_submissions_v1');
    localStorage.removeItem('gabaritopro_essays_v1');
  } catch (e) {
    // Ignore in non-browser envs
  }
}
cleanLegacyKeys();

export function getStoredExams(): Exam[] {
  try {
    const raw = localStorage.getItem(EXAMS_STORAGE_KEY);
    if (!raw) {
      return SAMPLE_EXAMS; // []
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler provas do localStorage:', e);
    return [];
  }
}

export function saveExam(exam: Exam): void {
  const current = getStoredExams();
  const index = current.findIndex((e) => e.id === exam.id);
  let updated: Exam[];

  const examToSave = {
    ...exam,
    updatedAt: new Date().toISOString(),
    totalScore: exam.questions.reduce((sum, q) => sum + (Number(q.points) || 0), 0),
  };

  if (index >= 0) {
    updated = [...current];
    updated[index] = examToSave;
  } else {
    updated = [examToSave, ...current];
  }

  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(updated));
}

export function deleteExam(id: string): void {
  const current = getStoredExams();
  const filtered = current.filter((e) => e.id !== id);
  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify(filtered));
}

export function getExamById(id: string): Exam | undefined {
  const exams = getStoredExams();
  return exams.find((e) => e.id === id);
}

export function getSubmissions(): ExamSubmission[] {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (!raw) {
      return SAMPLE_SUBMISSIONS; // []
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler submissões do localStorage:', e);
    return [];
  }
}

export function saveSubmission(submission: ExamSubmission): void {
  const current = getSubmissions();
  const index = current.findIndex((s) => s.id === submission.id);
  let updated: ExamSubmission[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = submission;
  } else {
    updated = [submission, ...current];
  }

  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(updated));
}

export function deleteSubmission(id: string): void {
  const current = getSubmissions();
  const filtered = current.filter((s) => s.id !== id);
  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(filtered));
}

export function getSubmissionById(id: string): ExamSubmission | undefined {
  const subs = getSubmissions();
  return subs.find((s) => s.id === id);
}

export function getStoredEssays(): EnemEssaySubmission[] {
  try {
    const raw = localStorage.getItem(ESSAYS_STORAGE_KEY);
    if (!raw) {
      return SAMPLE_ENEM_ESSAYS; // []
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (e) {
    console.error('Erro ao ler redações do localStorage:', e);
    return [];
  }
}

export function saveEssay(essay: EnemEssaySubmission): void {
  const current = getStoredEssays();
  const index = current.findIndex((e) => e.id === essay.id);
  let updated: EnemEssaySubmission[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = essay;
  } else {
    updated = [essay, ...current];
  }

  localStorage.setItem(ESSAYS_STORAGE_KEY, JSON.stringify(updated));
}

export function deleteEssay(id: string): void {
  const current = getStoredEssays();
  const filtered = current.filter((e) => e.id !== id);
  localStorage.setItem(ESSAYS_STORAGE_KEY, JSON.stringify(filtered));
}

export function resetToDefaults(): void {
  // Clear all data to 0
  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(ESSAYS_STORAGE_KEY, JSON.stringify([]));
}

export function clearAllData(): void {
  localStorage.setItem(EXAMS_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify([]));
  localStorage.setItem(ESSAYS_STORAGE_KEY, JSON.stringify([]));
}
