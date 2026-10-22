import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle,
  AlertTriangle,
  Flag,
  ArrowLeft,
  ArrowRight,
  Send,
  HelpCircle,
  Sparkles,
  User,
  ShieldCheck,
  BookOpen,
  Lightbulb,
  Quote,
  HeartHandshake,
  Image as ImageIcon,
  Type,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Exam, StudentAnswer, ExamSubmission, GradedQuestion } from '../types/exam';

interface ExamTakerProps {
  exam: Exam;
  onExit: () => void;
  onSubmitExam: (submission: ExamSubmission) => void;
}

export const ExamTaker: React.FC<ExamTakerProps> = ({ exam, onExit, onSubmitExam }) => {
  // Student identification state
  const [hasStarted, setHasStarted] = useState(false);
  const [studentName, setStudentName] = useState('Mariana Costa Ribeiro');
  const [studentEmail, setStudentEmail] = useState('mariana.costa@escola.edu.br');
  const [studentRegistration, setStudentRegistration] = useState('2024-EM-1104');

  // Exam navigation state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, StudentAnswer>>({});
  const [startTime] = useState<string>(new Date().toISOString());

  // Timer state (seconds)
  const initialSeconds = exam.durationMinutes > 0 ? exam.durationMinutes * 60 : 0;
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Submission modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isLargeFont, setIsLargeFont] = useState(exam.isAdaptedForInclusion || false);

  // Restore draft answers from localStorage if any
  useEffect(() => {
    const draftKey = `gabaritopro_draft_${exam.id}`;
    const draft = localStorage.getItem(draftKey);
    if (draft) {
      try {
        setAnswers(JSON.parse(draft));
      } catch (e) {
        console.error(e);
      }
    }
  }, [exam.id]);

  // Autosave to draft
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      localStorage.setItem(`gabaritopro_draft_${exam.id}`, JSON.stringify(answers));
    }
  }, [answers, exam.id]);

  // Timer countdown
  useEffect(() => {
    if (!hasStarted || exam.durationMinutes <= 0 || isTimerPaused) return;

    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmitOnTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, exam.durationMinutes, isTimerPaused]);

  const handleAutoSubmitOnTimeOut = () => {
    alert('O tempo limite para esta avaliação encerrou. Sua prova será submetida automaticamente.');
    finalizeSubmission();
  };

  const currentQuestion = exam.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Answer handlers
  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        type: 'objective',
        selectedOptionId: optionId,
        flaggedForReview: prev[currentQuestion.id]?.flaggedForReview || false,
      },
    }));
  };

  const handleTextChange = (text: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        type: 'dissertative',
        writtenText: text,
        flaggedForReview: prev[currentQuestion.id]?.flaggedForReview || false,
      },
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    const current = answers[currentQuestion.id];
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        questionId: currentQuestion.id,
        type: currentQuestion.type,
        selectedOptionId: current?.selectedOptionId,
        writtenText: current?.writtenText,
        flaggedForReview: !current?.flaggedForReview,
      },
    }));
  };

  // Demo autofill helper to test grading flow in 1 second
  const handleFillDemoAnswers = () => {
    const demoAnswers: Record<string, StudentAnswer> = {};

    exam.questions.forEach((q) => {
      if (q.type === 'objective' && q.options) {
        // Pick the correct option or a plausible one
        const correctOpt = q.options.find((o) => o.isCorrect);
        demoAnswers[q.id] = {
          questionId: q.id,
          type: 'objective',
          selectedOptionId: correctOpt ? correctOpt.id : q.options[0].id,
        };
      } else if (q.type === 'dissertative') {
        demoAnswers[q.id] = {
          questionId: q.id,
          type: 'dissertative',
          writtenText:
            q.expectedAnswer
              ? `${q.expectedAnswer.slice(0, 180)} e demonstrando a interdependência dos fatores envolvidos no processo com fundamentação consistente.`
              : 'O tema abordado demonstra como as diretrizes teóricas influenciam na prática os resultados obtidos, apresentando coerência conceitual e raciocínio fundamentado.',
        };
      }
    });

    setAnswers(demoAnswers);
  };

  // Submission calculation
  const finalizeSubmission = () => {
    // 1. Grade objective questions automatically
    let objectiveEarned = 0;
    let dissertativeEarned = 0;
    const grades: Record<string, GradedQuestion> = {};

    exam.questions.forEach((q) => {
      const studentAns = answers[q.id];
      const maxPts = Number(q.points) || 1;

      if (q.type === 'objective') {
        const correctOpt = q.options?.find((o) => o.isCorrect);
        const isCorrect = Boolean(studentAns?.selectedOptionId && correctOpt && studentAns.selectedOptionId === correctOpt.id);
        const awarded = isCorrect ? maxPts : 0;
        objectiveEarned += awarded;

        grades[q.id] = {
          questionId: q.id,
          type: 'objective',
          maxPoints: maxPts,
          awardedPoints: awarded,
          isCorrect,
          feedback: isCorrect
            ? `Resposta correta! (+${awarded.toFixed(1)} pts)`
            : `Resposta incorreta. A alternativa correta era a ${correctOpt?.id || '-'}.`,
        };
      } else {
        // Dissertative questions remain to be graded by AI or Teacher
        grades[q.id] = {
          questionId: q.id,
          type: 'dissertative',
          maxPoints: maxPts,
          awardedPoints: 0,
          aiEvaluated: false,
          summaryJustification: 'Aguardando avaliação docente ou correção assistida por IA.',
          detailedFeedback: 'Esta questão dissertativa passará por análise de critérios pedagógicos.',
        };
      }
    });

    const hasDissertative = exam.questions.some((q) => q.type === 'dissertative');
    const totalScore = Math.round((objectiveEarned + dissertativeEarned) * 10) / 10;
    const percentage = Math.round((totalScore / exam.totalScore) * 100);

    const submission: ExamSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      examId: exam.id,
      studentName: studentName.trim() || 'Estudante Anônimo',
      studentEmail: studentEmail.trim() || undefined,
      studentRegistration: studentRegistration.trim() || undefined,
      startedAt: startTime,
      submittedAt: new Date().toISOString(),
      durationSpentSeconds: initialSeconds > 0 ? initialSeconds - remainingSeconds : 60,
      answers,
      grades,
      objectiveScore: Math.round(objectiveEarned * 10) / 10,
      dissertativeScore: Math.round(dissertativeEarned * 10) / 10,
      totalScore,
      maxPossibleScore: exam.totalScore,
      percentage,
      status: hasDissertative ? 'pending_grading' : 'graded',
    };

    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    // Clear draft
    localStorage.removeItem(`gabaritopro_draft_${exam.id}`);

    onSubmitExam(submission);
  };

  // Timer format (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Count answered
  const answeredCount = exam.questions.filter((q) => {
    const ans = answers[q.id];
    if (!ans) return false;
    if (q.type === 'objective') return Boolean(ans.selectedOptionId);
    if (q.type === 'dissertative') return Boolean(ans.writtenText && ans.writtenText.trim().length > 0);
    return false;
  }).length;

  const flaggedCount = Object.values(answers).filter((a) => a.flaggedForReview).length;

  // 1. Initial Student Check-in Screen
  if (!hasStarted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="p-8 bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block mb-1">
              Ambiente de Avaliação Online
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{exam.title}</h1>
            <p className="text-xs sm:text-sm text-indigo-200 mt-2">
              {exam.subject} &bull; {exam.gradeLevel} &bull; {exam.institution || 'Instituição de Ensino'}
            </p>
          </div>

          <div className="p-8 space-y-6">
            {/* Exam Rules Summary */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Duração</span>
                <span className="text-sm font-bold text-slate-800">
                  {exam.durationMinutes > 0 ? `${exam.durationMinutes} min` : 'Livre'}
                </span>
              </div>
              <div className="border-x border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Questões</span>
                <span className="text-sm font-bold text-slate-800">{exam.questions.length}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Nota Total</span>
                <span className="text-sm font-bold text-indigo-600">{exam.totalScore.toFixed(1)} pts</span>
              </div>
            </div>

            {/* Identification Form */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-600" />
                Identificação do Estudante
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="Ex: Mariana Costa Ribeiro"
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Institucional
                  </label>
                  <input
                    type="email"
                    value={studentEmail}
                    onChange={(e) => setStudentEmail(e.target.value)}
                    placeholder="aluno@escola.edu.br"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matrícula / RA
                  </label>
                  <input
                    type="text"
                    value={studentRegistration}
                    onChange={(e) => setStudentRegistration(e.target.value)}
                    placeholder="Ex: 2024-EM-1104"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            {exam.instructions && exam.instructions.length > 0 && (
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-xs text-indigo-900 space-y-1.5">
                <span className="font-bold block uppercase tracking-wide text-indigo-800 text-[10px]">
                  Orientações para Realização:
                </span>
                <ul className="list-disc list-inside space-y-1">
                  {exam.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-4 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={onExit}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Voltar
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!studentName.trim()) {
                    alert('Por favor informe seu nome antes de iniciar a prova.');
                    return;
                  }
                  setHasStarted(true);
                }}
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all"
              >
                <ShieldCheck className="w-4 h-4" />
                Iniciar Avaliação Agora
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Active Exam Taking Room
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Sticky Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
              {currentQuestionIndex + 1}/{exam.questions.length}
            </span>
            <div className="hidden sm:block">
              <h2 className="text-xs font-bold text-slate-800 truncate max-w-xs md:max-w-md">
                {exam.title}
              </h2>
              <span className="text-[10px] text-slate-500">
                Aluno(a): <strong>{studentName}</strong>
              </span>
            </div>
          </div>

          {/* Center Timer */}
          {exam.durationMinutes > 0 && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-xs transition-colors ${
                remainingSeconds <= 300
                  ? 'bg-rose-100 text-rose-700 border border-rose-300 animate-pulse'
                  : 'bg-slate-100 text-slate-800 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-current" />
              <span>{formatTime(remainingSeconds)}</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {/* Demo autofill */}
            <button
              onClick={handleFillDemoAnswers}
              title="Preenche respostas de demonstração para testar a correção instantaneamente"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Preencher Demo
            </button>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xs transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              Entregar Prova ({answeredCount}/{exam.questions.length})
            </button>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col md:flex-row gap-6">
        {/* Left Column: Navigator Palette */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 block">
              Mapa de Questões
            </span>

            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => {
                const ans = answers[q.id];
                const isAnswered =
                  q.type === 'objective'
                    ? Boolean(ans?.selectedOptionId)
                    : Boolean(ans?.writtenText && ans.writtenText.trim().length > 0);
                const isFlagged = ans?.flaggedForReview;
                const isCurrent = idx === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`h-9 rounded-xl font-bold text-xs relative flex items-center justify-center transition-all ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 ring-offset-2'
                        : ''
                    } ${
                      isAnswered
                        ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                    {isFlagged && (
                      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-white" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-[10px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-emerald-600 inline-block" />
                <span>Respondida</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-slate-100 border border-slate-300 inline-block" />
                <span>Em branco</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
                <span>Marcada para revisar</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs text-indigo-900">
            <p className="font-semibold mb-1">Salvamento Automático</p>
            <p className="text-[11px] text-indigo-700">
              Suas respostas são salvas continuamente neste navegador.
            </p>
          </div>
        </div>

        {/* Right Column: Question View */}
        <div className="flex-1 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          {currentQuestion && (
            <div className="space-y-6">
              {/* Question Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    Questão {currentQuestionIndex + 1} de {exam.questions.length}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      currentQuestion.type === 'objective'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {currentQuestion.type === 'objective' ? 'Múltipla Escolha' : 'Dissertativa'}
                  </span>
                  {currentQuestion.subjectTag && (
                    <span className="text-xs text-slate-500 italic">
                      &bull; {currentQuestion.subjectTag}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLargeFont((prev) => !prev)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
                    title="Alternar tamanho da fonte para acessibilidade"
                  >
                    <Type className="w-3.5 h-3.5" />
                    {isLargeFont ? 'Fonte Padrão' : 'Fonte Ampliada'}
                  </button>

                  <span className="text-xs font-semibold text-slate-600">
                    Valor: <strong>{currentQuestion.points.toFixed(1)} pts</strong>
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleFlag}
                    className={`flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                      currentAnswer?.flaggedForReview
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'text-slate-500 hover:bg-slate-100'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    {currentAnswer?.flaggedForReview ? 'Marcada para Revisão' : 'Marcar para Revisar'}
                  </button>
                </div>
              </div>

              {/* Inclusive Banner if exam is adapted */}
              {exam.isAdaptedForInclusion && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    <strong>Prova Adaptada (Educação Inclusiva / AEE):</strong> Enunciados claros e objetivos. Em caso de dúvidas, solicite mediação ao professor de apoio.
                  </span>
                </div>
              )}

              {/* Supporting Text (PNLD / MEC / IBGE) */}
              {currentQuestion.supportingText && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border-l-4 border-blue-600 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                    <Quote className="w-4 h-4 text-blue-700 shrink-0" />
                    <span>{currentQuestion.supportingTextTitle || 'Texto de Apoio'}</span>
                  </div>
                  <div className={`italic leading-relaxed text-slate-800 whitespace-pre-line ${isLargeFont ? 'text-base' : 'text-sm'}`}>
                    "{currentQuestion.supportingText}"
                  </div>
                  {currentQuestion.supportingTextSource && (
                    <div className="text-[11px] text-slate-500 font-serif text-right">
                      — {currentQuestion.supportingTextSource}
                    </div>
                  )}
                </div>
              )}

              {/* Image / Charge / Infographic */}
              {currentQuestion.imageUrl && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-2">
                  <img
                    src={currentQuestion.imageUrl}
                    alt={currentQuestion.imageCaption || 'Imagem da questão'}
                    className="max-h-72 max-w-full mx-auto rounded-xl object-contain shadow-xs border border-slate-200 bg-white"
                  />
                  {(currentQuestion.imageCaption || currentQuestion.imageSource) && (
                    <p className="text-xs text-slate-600 italic">
                      {currentQuestion.imageCaption && <strong>{currentQuestion.imageCaption}</strong>}
                      {currentQuestion.imageSource && ` (${currentQuestion.imageSource})`}
                    </p>
                  )}
                </div>
              )}

              {/* Cognitive Visual Cue (TEA / Deficiência Intelectual) */}
              {currentQuestion.visualCue && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
                  <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Pista de Leitura / Apoio:</strong> {currentQuestion.visualCue}
                  </span>
                </div>
              )}

              {/* Statement */}
              <div className={`text-slate-900 leading-relaxed font-sans whitespace-pre-line ${isLargeFont ? 'text-lg font-medium' : 'text-base'}`}>
                {currentQuestion.statement}
              </div>

              {/* OBJECTIVE QUESTION CHOICES */}
              {currentQuestion.type === 'objective' && currentQuestion.options && (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((opt) => {
                    const isSelected = currentAnswer?.selectedOptionId === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectOption(opt.id)}
                        className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-4 group ${
                          isSelected
                            ? 'bg-indigo-50/70 border-indigo-600 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                        }`}
                      >
                        <span
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 transition-all ${
                            isSelected
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className={`text-sm leading-relaxed ${isSelected ? 'font-semibold text-indigo-950' : 'text-slate-700'}`}>
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* DISSERTATIVE QUESTION TEXTAREA */}
              {currentQuestion.type === 'dissertative' && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Redija sua resposta detalhada e argumentada abaixo:</span>
                    <span className="font-mono">
                      {(currentAnswer?.writtenText || '').trim().split(/\s+/).filter(Boolean).length} palavras &bull; {(currentAnswer?.writtenText || '').length} caracteres
                    </span>
                  </div>

                  <textarea
                    rows={8}
                    value={currentAnswer?.writtenText || ''}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Desenvolva sua resposta fundamentada, citando os conceitos solicitados e demonstrando sua linha de raciocínio..."
                    className="w-full p-4 text-sm leading-relaxed rounded-2xl border border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all font-sans"
                  />
                  <p className="text-[11px] text-slate-400">
                    Dica: Estruture sua resposta com introdução ao conceito, desenvolvimento dos argumentos e conclusão.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Bottom Navigation */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              disabled={currentQuestionIndex === 0}
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-30 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4" /> Questão Anterior
            </button>

            {currentQuestionIndex < exam.questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 rounded-xl shadow-xs"
              >
                Próxima Questão <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowSubmitModal(true)}
                className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200"
              >
                Revisar e Entregar <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Submission Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800">Finalizar e Entregar Avaliação?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Confira o status das suas respostas antes de enviar definitivamente.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Total de questões:</span>
                <span className="font-bold text-slate-800">{exam.questions.length}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span className="text-slate-600">Respondidas:</span>
                <span className="font-bold text-emerald-600">{answeredCount}</span>
              </div>
              {exam.questions.length - answeredCount > 0 && (
                <div className="flex justify-between font-medium text-rose-600">
                  <span>Deixadas em branco:</span>
                  <span className="font-bold">{exam.questions.length - answeredCount}</span>
                </div>
              )}
              {flaggedCount > 0 && (
                <div className="flex justify-between font-medium text-amber-600">
                  <span>Marcadas para revisão:</span>
                  <span className="font-bold">{flaggedCount}</span>
                </div>
              )}
            </div>

            {exam.questions.length - answeredCount > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <span>
                  Atenção: você ainda possui questões não respondidas. Tem certeza de que deseja enviar agora?
                </span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Continuar Respondendo
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowSubmitModal(false);
                  finalizeSubmission();
                }}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all"
              >
                Confirmar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
