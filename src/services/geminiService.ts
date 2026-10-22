import { Exam, Question, RubricCriterion, GradedQuestion } from '../types/exam';

export interface GenerateExamParams {
  topic: string;
  subject: string;
  gradeLevel: string;
  numObjective: number;
  numDissertative: number;
  difficulty: 'fácil' | 'médio' | 'difícil';
  extraInstructions?: string;
}

export interface GradeDissertativeParams {
  questionStatement: string;
  expectedAnswer?: string;
  rubric?: RubricCriterion[];
  maxPoints: number;
  studentAnswer: string;
}

export interface DissertativeGradeResult {
  awardedPoints: number;
  summaryJustification: string;
  detailedFeedback: string;
  strengths: string[];
  improvements: string[];
  criteriaGrades: {
    criterionTitle: string;
    maxScore: number;
    score: number;
    comment: string;
  }[];
}

export async function gradeDissertativeAnswer(
  params: GradeDissertativeParams
): Promise<DissertativeGradeResult> {
  const response = await fetch('/api/ai/grade-dissertative', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP ${response.status} ao corrigir questão`);
  }

  return response.json();
}

export async function generateExamWithAI(params: GenerateExamParams): Promise<Partial<Exam>> {
  const response = await fetch('/api/ai/generate-exam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP ${response.status} ao gerar prova`);
  }

  const raw = await response.json();

  // Map into Question[]
  let orderCounter = 1;
  const questions: Question[] = [];

  if (Array.isArray(raw.objectiveQuestions)) {
    for (const q of raw.objectiveQuestions) {
      questions.push({
        id: `q_obj_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        order: orderCounter++,
        type: 'objective',
        statement: q.statement,
        points: Number(q.points) || 1,
        subjectTag: q.subjectTag || params.topic,
        bnccCode: q.bnccCode || '',
        bnccSkillDescription: q.bnccSkillDescription || '',
        options: (q.options || []).map((opt: any) => ({
          id: opt.id || 'A',
          text: opt.text || '',
          isCorrect: Boolean(opt.isCorrect),
          explanation: opt.explanation || '',
        })),
      });
    }
  }

  if (Array.isArray(raw.dissertativeQuestions)) {
    for (const q of raw.dissertativeQuestions) {
      questions.push({
        id: `q_diss_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        order: orderCounter++,
        type: 'dissertative',
        statement: q.statement,
        points: Number(q.points) || 2,
        subjectTag: q.subjectTag || params.topic,
        bnccCode: q.bnccCode || '',
        bnccSkillDescription: q.bnccSkillDescription || '',
        expectedAnswer: q.expectedAnswer,
        rubric: (q.rubric || []).map((r: any, idx: number) => ({
          id: `rubric_${idx}_${Date.now()}`,
          title: r.title || `Critério ${idx + 1}`,
          description: r.description || '',
          maxScore: Number(r.maxScore) || 1,
        })),
      });
    }
  }

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return {
    title: raw.title || `Avaliação de ${params.subject} - ${params.topic}`,
    description: raw.description || `Exame gerado com inteligência artificial sobre ${params.topic}.`,
    subject: params.subject,
    gradeLevel: params.gradeLevel,
    durationMinutes: Number(raw.durationMinutes) || 60,
    passingScore: Math.round(totalPoints * 0.6 * 10) / 10,
    totalScore: Math.round(totalPoints * 10) / 10,
    instructions: raw.instructions || [
      'Leia atentamente cada enunciado antes de responder.',
      'Nas questões objetivas, apenas uma alternativa é correta.',
      'Nas questões dissertativas, desenvolva sua linha de raciocínio de forma clara e fundamentada.',
      'Revise suas respostas antes da entrega final.',
    ],
    questions,
  };
}

export async function generateRubricForStatement(
  statement: string,
  points: number = 2.0
): Promise<{ expectedAnswer: string; rubric: RubricCriterion[] }> {
  const response = await fetch('/api/ai/generate-rubric', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ statement, points }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao gerar rubrica');
  }

  const data = await response.json();
  return {
    expectedAnswer: data.expectedAnswer || '',
    rubric: (data.rubric || []).map((r: any, idx: number) => ({
      id: `rubric_${idx}_${Date.now()}`,
      title: r.title,
      description: r.description,
      maxScore: Number(r.maxScore) || 1,
    })),
  };
}

export async function gradeEnemEssay(params: {
  essayText?: string;
  theme: string;
  imageBase64?: string;
  studentName?: string;
}) {
  const response = await fetch('/api/ai/grade-essay-enem', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao processar correção da redação ENEM.');
  }

  return response.json();
}

export async function gradePhotoExam(params: {
  imageBase64: string;
  questions: any[];
}) {
  const response = await fetch('/api/ai/grade-photo-exam', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro na leitura óptica da foto da prova.');
  }

  return response.json();
}

export async function generateExamBNCC(params: {
  stage: string;
  grade: string;
  subject: string;
  bnccSkills?: any[];
  topic?: string;
  difficulty?: string;
  numObjective?: number;
  numDissertative?: number;
}): Promise<Partial<Exam>> {
  const response = await fetch('/api/ai/generate-exam-bncc', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Erro ao gerar prova BNCC.');
  }

  const raw = await response.json();

  let orderCounter = 1;
  const questions: Question[] = (raw.questions || []).map((q: any) => ({
    id: `q_bncc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    order: orderCounter++,
    type: q.type === 'dissertative' ? 'dissertative' : 'objective',
    statement: q.statement,
    points: Number(q.points) || 1.5,
    subjectTag: q.subjectTag || params.topic,
    bnccCode: q.bnccCode || 'BNCC',
    bnccSkillDescription: q.bnccSkillDescription || '',
    options: q.type === 'objective' && q.options ? q.options.map((opt: any) => ({
      id: opt.id || 'A',
      text: opt.text || '',
      isCorrect: Boolean(opt.isCorrect),
      explanation: opt.explanation || '',
    })) : undefined,
    expectedAnswer: q.expectedAnswer,
    rubric: q.rubric ? q.rubric.map((r: any, idx: number) => ({
      id: `rub_${idx}_${Date.now()}`,
      title: r.title,
      description: r.description,
      maxScore: Number(r.maxScore) || 1,
    })) : undefined,
  }));

  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 0), 0);

  return {
    title: raw.title || `Avaliação BNCC de ${params.subject} - ${params.grade}`,
    description: raw.description || `Exame formativo alinhado às diretrizes curriculares nacionais da BNCC.`,
    subject: params.subject,
    gradeLevel: params.grade,
    durationMinutes: Number(raw.durationMinutes) || 60,
    passingScore: Math.round(totalPoints * 0.6 * 10) / 10,
    totalScore: Math.round(totalPoints * 10) / 10,
    instructions: raw.instructions || [
      'Leia atentamente cada enunciado antes de responder.',
      'Nas questões objetivas, apenas uma alternativa é correta.',
      'Nas questões dissertativas, desenvolva sua linha de raciocínio de forma clara e fundamentada.',
      'Revise suas respostas antes da entrega final.',
    ],
    questions,
  };
}

export interface GenerateSupportingTextParams {
  subject: string;
  topic: string;
  gradeLevel?: string;
  preferredSource?: 'pnld' | 'mec' | 'ibge' | 'scielo' | 'fiocruz' | 'constituicao' | 'livros_digitais';
}

export interface SupportingTextResult {
  title: string;
  text: string;
  sourceCitation: string;
  sourceOrg: string;
  pedagogicalTip?: string;
}

export async function generateSupportingText(
  params: GenerateSupportingTextParams
): Promise<SupportingTextResult> {
  const response = await fetch('/api/ai/generate-supporting-text', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP ${response.status} ao gerar texto de apoio`);
  }

  return response.json();
}

export async function adaptExamForInclusion(
  exam: Exam,
  targetAudience: 'tea' | 'deficiencia_intelectual' | 'geral_aee' = 'tea'
): Promise<Exam> {
  const response = await fetch('/api/ai/adapt-exam-inclusive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exam, targetAudience }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP ${response.status} ao adaptar prova inclusiva`);
  }

  return response.json();
}
