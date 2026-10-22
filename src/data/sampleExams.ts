import { Exam, ExamSubmission } from '../types/exam';

/**
 * Banco inicial de avaliações zerado para produção (GitHub & Cloudflare Pages).
 * Os professores podem criar novas avaliações do zero ou com IA na aba "Criar Prova".
 */
export const SAMPLE_EXAMS: Exam[] = [];

/**
 * Banco inicial de submissões de alunos zerado para produção.
 */
export const SAMPLE_SUBMISSIONS: ExamSubmission[] = [];
