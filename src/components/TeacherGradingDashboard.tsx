import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Sparkles,
  AlertCircle,
  Award,
  User,
  Sliders,
  Save,
  ArrowLeft,
  Trash2,
  Search,
  Filter,
  Eye,
  Loader2,
  Check,
  RotateCcw,
} from 'lucide-react';
import { Exam, ExamSubmission, GradedQuestion } from '../types/exam';
import { gradeDissertativeAnswer } from '../services/geminiService';

interface TeacherGradingDashboardProps {
  exams: Exam[];
  submissions: ExamSubmission[];
  selectedExamId?: string;
  onUpdateSubmission: (submission: ExamSubmission) => void;
  onDeleteSubmission: (id: string) => void;
  onBackToExams: () => void;
  onViewStudentReport: (submission: ExamSubmission) => void;
}

export const TeacherGradingDashboard: React.FC<TeacherGradingDashboardProps> = ({
  exams,
  submissions,
  selectedExamId,
  onUpdateSubmission,
  onDeleteSubmission,
  onBackToExams,
  onViewStudentReport,
}) => {
  const [filterExamId, setFilterExamId] = useState<string>(selectedExamId || 'all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'graded'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Active submission being graded
  const [activeSubmissionId, setActiveSubmissionId] = useState<string | null>(null);
  const [gradingDraft, setGradingDraft] = useState<ExamSubmission | null>(null);
  const [isGradingAi, setIsGradingAi] = useState<Record<string, boolean>>({});
  const [isGradingAllAi, setIsGradingAllAi] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Filtered submissions
  const filteredSubmissions = submissions.filter((sub) => {
    const matchExam = filterExamId === 'all' || sub.examId === filterExamId;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && sub.status === 'pending_grading') ||
      (filterStatus === 'graded' && sub.status === 'graded');
    const matchSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (sub.studentRegistration && sub.studentRegistration.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchExam && matchStatus && matchSearch;
  });

  // Analytics
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending_grading').length;
  const gradedSubmissions = submissions.filter((s) => s.status === 'graded').length;

  const averageScore =
    gradedSubmissions > 0
      ? submissions
          .filter((s) => s.status === 'graded')
          .reduce((acc, s) => acc + s.totalScore, 0) / gradedSubmissions
      : 0;

  const passRate =
    gradedSubmissions > 0
      ? Math.round(
          (submissions.filter((s) => {
            if (s.status !== 'graded') return false;
            const exam = exams.find((e) => e.id === s.examId);
            return s.totalScore >= (exam?.passingScore || 6.0);
          }).length /
            gradedSubmissions) *
            100
        )
      : 0;

  // Open grading view for a submission
  const handleOpenGrading = (sub: ExamSubmission) => {
    setActiveSubmissionId(sub.id);
    setGradingDraft(JSON.parse(JSON.stringify(sub))); // deep clone
    setSaveSuccess(false);
  };

  const handleCloseGrading = () => {
    setActiveSubmissionId(null);
    setGradingDraft(null);
  };

  // Grade single dissertative question using Gemini
  const handleGradeSingleWithAI = async (questionId: string) => {
    if (!gradingDraft) return;
    const exam = exams.find((e) => e.id === gradingDraft.examId);
    if (!exam) return;
    const question = exam.questions.find((q) => q.id === questionId);
    if (!question || question.type !== 'dissertative') return;

    const studentAns = gradingDraft.answers[questionId]?.writtenText || '';

    setIsGradingAi((prev) => ({ ...prev, [questionId]: true }));

    try {
      const result = await gradeDissertativeAnswer({
        questionStatement: question.statement,
        expectedAnswer: question.expectedAnswer,
        rubric: question.rubric,
        maxPoints: question.points,
        studentAnswer: studentAns,
      });

      const updatedGrades: Record<string, GradedQuestion> = {
        ...gradingDraft.grades,
        [questionId]: {
          questionId,
          type: 'dissertative',
          maxPoints: question.points,
          awardedPoints: result.awardedPoints,
          aiEvaluated: true,
          teacherOverridden: false,
          summaryJustification: result.summaryJustification,
          detailedFeedback: result.detailedFeedback,
          strengths: result.strengths,
          improvements: result.improvements,
          criteriaGrades: result.criteriaGrades,
        },
      };

      // Recalculate totals
      const newDissertative = Object.values(updatedGrades)
        .filter((g) => g.type === 'dissertative')
        .reduce((sum, g) => sum + (g.awardedPoints || 0), 0);
      const newTotal = Math.round((gradingDraft.objectiveScore + newDissertative) * 10) / 10;
      const newPercentage = Math.round((newTotal / exam.totalScore) * 100);

      setGradingDraft({
        ...gradingDraft,
        grades: updatedGrades,
        dissertativeScore: Math.round(newDissertative * 10) / 10,
        totalScore: newTotal,
        percentage: newPercentage,
      });
    } catch (err: any) {
      console.error(err);
      alert('Erro ao corrigir questão com IA: ' + err.message);
    } finally {
      setIsGradingAi((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  // Grade ALL dissertative questions of this submission in batch with Gemini
  const handleGradeAllWithAI = async () => {
    if (!gradingDraft) return;
    const exam = exams.find((e) => e.id === gradingDraft.examId);
    if (!exam) return;

    const dissQuestions = exam.questions.filter((q) => q.type === 'dissertative');
    if (dissQuestions.length === 0) return;

    setIsGradingAllAi(true);

    try {
      let draftClone = { ...gradingDraft, grades: { ...gradingDraft.grades } };

      for (const q of dissQuestions) {
        const studentAns = draftClone.answers[q.id]?.writtenText || '';
        const result = await gradeDissertativeAnswer({
          questionStatement: q.statement,
          expectedAnswer: q.expectedAnswer,
          rubric: q.rubric,
          maxPoints: q.points,
          studentAnswer: studentAns,
        });

        draftClone.grades[q.id] = {
          questionId: q.id,
          type: 'dissertative',
          maxPoints: q.points,
          awardedPoints: result.awardedPoints,
          aiEvaluated: true,
          teacherOverridden: false,
          summaryJustification: result.summaryJustification,
          detailedFeedback: result.detailedFeedback,
          strengths: result.strengths,
          improvements: result.improvements,
          criteriaGrades: result.criteriaGrades,
        };
      }

      // Recalculate totals
      const newDissertative = Object.values(draftClone.grades)
        .filter((g) => g.type === 'dissertative')
        .reduce((sum, g) => sum + (g.awardedPoints || 0), 0);
      const newTotal = Math.round((draftClone.objectiveScore + newDissertative) * 10) / 10;
      const newPercentage = Math.round((newTotal / exam.totalScore) * 100);

      draftClone.dissertativeScore = Math.round(newDissertative * 10) / 10;
      draftClone.totalScore = newTotal;
      draftClone.percentage = newPercentage;

      setGradingDraft(draftClone);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao corrigir com IA: ' + err.message);
    } finally {
      setIsGradingAllAi(false);
    }
  };

  // Manual score adjustment by teacher
  const handleManualScoreChange = (questionId: string, newScore: number) => {
    if (!gradingDraft) return;
    const exam = exams.find((e) => e.id === gradingDraft.examId);
    if (!exam) return;
    const question = exam.questions.find((q) => q.id === questionId);
    if (!question) return;

    const clampedScore = Math.max(0, Math.min(question.points, Math.round(newScore * 10) / 10));

    const currentGrade = gradingDraft.grades[questionId] || {
      questionId,
      type: 'dissertative',
      maxPoints: question.points,
      awardedPoints: 0,
    };

    const updatedGrades: Record<string, GradedQuestion> = {
      ...gradingDraft.grades,
      [questionId]: {
        ...currentGrade,
        awardedPoints: clampedScore,
        teacherOverridden: true,
      },
    };

    const newDissertative = Object.values(updatedGrades)
      .filter((g) => g.type === 'dissertative')
      .reduce((sum, g) => sum + (g.awardedPoints || 0), 0);
    const newTotal = Math.round((gradingDraft.objectiveScore + newDissertative) * 10) / 10;
    const newPercentage = Math.round((newTotal / exam.totalScore) * 100);

    setGradingDraft({
      ...gradingDraft,
      grades: updatedGrades,
      dissertativeScore: Math.round(newDissertative * 10) / 10,
      totalScore: newTotal,
      percentage: newPercentage,
    });
  };

  // Teacher feedback text change
  const handleFeedbackChange = (questionId: string, text: string) => {
    if (!gradingDraft) return;
    setGradingDraft({
      ...gradingDraft,
      grades: {
        ...gradingDraft.grades,
        [questionId]: {
          ...gradingDraft.grades[questionId],
          detailedFeedback: text,
          teacherOverridden: true,
        },
      },
    });
  };

  // Save changes and publish grade
  const handleSaveAndPublish = () => {
    if (!gradingDraft) return;
    const finalized: ExamSubmission = {
      ...gradingDraft,
      status: 'graded',
    };
    onUpdateSubmission(finalized);
    setGradingDraft(finalized);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 2500);
  };

  // =========================================================================
  // VIEW: INDIVIDUAL SUBMISSION GRADING DRAWER / SCREEN
  // =========================================================================
  if (gradingDraft) {
    const exam = exams.find((e) => e.id === gradingDraft.examId);
    const isApproved = exam && gradingDraft.totalScore >= exam.passingScore;

    return (
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <button
              onClick={handleCloseGrading}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar ao Painel da Turma
            </button>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Correção de Prova: {gradingDraft.studentName}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {exam?.title} &bull; Matrícula: {gradingDraft.studentRegistration || 'N/I'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isGradingAllAi}
              onClick={handleGradeAllWithAI}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all shadow-xs"
            >
              {isGradingAllAi ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  Corrigindo com IA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Corrigir Todas com IA
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleSaveAndPublish}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Nota Publicada!
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" /> Salvar & Publicar Nota
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Score Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Nota Total
            </span>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-black text-indigo-600">
                {gradingDraft.totalScore.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">
                / {exam?.totalScore.toFixed(1)}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-2 inline-block ${
                isApproved
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isApproved ? 'Aprovado' : 'Em Recuperação'} ({gradingDraft.percentage}%)
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Parte Objetiva (Automática)
            </span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">
              {gradingDraft.objectiveScore.toFixed(1)} pts
            </span>
            <span className="text-[10px] text-emerald-600 font-medium mt-1 block">
              Gabarito verificado
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-[10px] uppercase font-bold text-purple-600 block">
              Parte Dissertativa
            </span>
            <span className="text-2xl font-bold text-purple-900 mt-1 block">
              {gradingDraft.dissertativeScore.toFixed(1)} pts
            </span>
            <span className="text-[10px] text-purple-700 font-medium mt-1 block">
              {gradingDraft.status === 'graded' ? 'Corrigida' : 'Aguardando revisão'}
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">
              Status da Submissão
            </span>
            <span
              className={`text-xs font-bold px-3 py-1.5 rounded-xl text-center block ${
                gradingDraft.status === 'graded'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 animate-pulse'
              }`}
            >
              {gradingDraft.status === 'graded' ? 'Nota Finalizada' : 'Pendente de Correção'}
            </span>
            <button
              onClick={() => onViewStudentReport(gradingDraft)}
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 text-center block mt-1"
            >
              Ver Boletim do Aluno &rarr;
            </button>
          </div>
        </div>

        {/* Teacher Notes general textarea */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
            Comentário Geral do Professor para o Aluno (Opcional)
          </label>
          <textarea
            rows={2}
            value={gradingDraft.teacherNotes || ''}
            onChange={(e) =>
              setGradingDraft({ ...gradingDraft, teacherNotes: e.target.value })
            }
            placeholder="Ex: Excelente argumentação e fundamentação histórica! Atenção apenas à concisão na questão 5."
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        {/* Questions list for grading */}
        <div className="space-y-6">
          <h2 className="text-base font-extrabold text-slate-900">
            Revisão das Questões
          </h2>

          {exam?.questions.map((q, idx) => {
            const studentAns = gradingDraft.answers[q.id];
            const gradeInfo = gradingDraft.grades[q.id];
            const isObjective = q.type === 'objective';
            const isAiLoading = isGradingAi[q.id];

            if (isObjective) {
              // Objective summary
              return (
                <div
                  key={q.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700">
                      Questão {idx + 1} (Objetiva): {q.statement.slice(0, 90)}...
                    </span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-full ${
                        gradeInfo?.isCorrect
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {gradeInfo?.isCorrect ? `Acertou (+${q.points} pts)` : 'Errou (0,0 pts)'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Alternativa assinalada pelo aluno: <strong>{studentAns?.selectedOptionId || 'Nenhuma'}</strong> &bull; Gabarito Oficial: <strong>{q.options?.find((o) => o.isCorrect)?.id}</strong>
                  </p>
                </div>
              );
            }

            // Dissertative Question Grading Panel
            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-purple-200 shadow-sm p-6 sm:p-8 space-y-6"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-purple-700 text-white font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      Questão Dissertativa
                    </span>
                    {q.subjectTag && (
                      <span className="text-xs text-slate-400 italic">({q.subjectTag})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-500">
                      Valor máximo: <strong>{q.points.toFixed(1)} pts</strong>
                    </span>

                    <button
                      type="button"
                      disabled={isAiLoading || isGradingAllAi}
                      onClick={() => handleGradeSingleWithAI(q.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl transition-all shadow-xs"
                    >
                      {isAiLoading ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                          Avaliando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          Corrigir com IA
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Statement */}
                <div className="text-sm text-slate-800 leading-relaxed font-sans">
                  <strong>Enunciado:</strong> {q.statement}
                </div>

                {/* Comparison Grid: Student Answer vs Model Answer */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Answer */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                      Resposta do Estudante ({gradingDraft.studentName})
                    </span>
                    <p className="text-slate-800 leading-relaxed whitespace-pre-line font-sans text-xs">
                      {studentAns?.writtenText || (
                        <span className="italic text-slate-400">Questão deixada em branco pelo aluno.</span>
                      )}
                    </p>
                  </div>

                  {/* Expected Model Answer & Rubric */}
                  <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                      Gabarito Modelo do Professor
                    </span>
                    <p className="text-indigo-950 leading-relaxed text-xs">
                      {q.expectedAnswer || 'Gabarito não cadastrado.'}
                    </p>

                    {q.rubric && q.rubric.length > 0 && (
                      <div className="pt-2 border-t border-indigo-100/80">
                        <span className="text-[10px] font-bold uppercase text-indigo-800 block mb-1">
                          Critérios da Rubrica:
                        </span>
                        <ul className="space-y-1 text-[11px] text-indigo-900">
                          {q.rubric.map((r) => (
                            <li key={r.id} className="flex justify-between">
                              <span>• {r.title}</span>
                              <span className="font-semibold">{r.maxScore} pts</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* AI / Teacher Grading Controls */}
                <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-900 block">
                        Nota Atribuída à Questão
                      </span>
                      <p className="text-[11px] text-purple-700">
                        {gradeInfo?.aiEvaluated
                          ? 'Calculada com assistência de IA. Você pode ajustar manualmente abaixo.'
                          : 'Ajuste a nota ou utilize a correção por IA.'}
                      </p>
                    </div>

                    {/* Score Slider & Numeric Input */}
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min={0}
                        max={q.points}
                        step={0.1}
                        value={gradeInfo?.awardedPoints || 0}
                        onChange={(e) =>
                          handleManualScoreChange(q.id, parseFloat(e.target.value))
                        }
                        className="w-32 accent-purple-600"
                      />
                      <div className="flex items-center gap-1 bg-white px-3 py-1 rounded-xl border border-purple-200 shadow-xs">
                        <input
                          type="number"
                          min={0}
                          max={q.points}
                          step={0.1}
                          value={gradeInfo?.awardedPoints || 0}
                          onChange={(e) =>
                            handleManualScoreChange(q.id, parseFloat(e.target.value) || 0)
                          }
                          className="w-12 text-sm font-black text-purple-900 text-center outline-none"
                        />
                        <span className="text-xs text-slate-500 font-semibold">
                          / {q.points.toFixed(1)} pts
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* AI Strengths & Improvements */}
                  {gradeInfo?.criteriaGrades && gradeInfo.criteriaGrades.length > 0 && (
                    <div className="pt-2 border-t border-purple-100 space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                        Pontuação Analítica por Critério:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {gradeInfo.criteriaGrades.map((crit, cIdx) => (
                          <div
                            key={cIdx}
                            className="bg-white p-2.5 rounded-xl border border-purple-100 text-xs flex justify-between items-start"
                          >
                            <div>
                              <span className="font-semibold text-slate-800">{crit.criterionTitle}</span>
                              <p className="text-[11px] text-slate-500">{crit.comment}</p>
                            </div>
                            <span className="font-bold text-purple-800 ml-2 shrink-0">
                              {crit.score.toFixed(1)} / {crit.maxScore.toFixed(1)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Detailed Feedback Editor */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Parecer e Feedback do Docente:
                    </label>
                    <textarea
                      rows={3}
                      value={gradeInfo?.detailedFeedback || ''}
                      onChange={(e) => handleFeedbackChange(q.id, e.target.value)}
                      placeholder="Feedback pedagógico explicando acertos, falhas e orientações de estudo..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Save Bar */}
        <div className="pt-4 flex items-center justify-between border-t border-slate-200">
          <button
            onClick={handleCloseGrading}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Voltar ao Painel
          </button>

          <button
            type="button"
            onClick={handleSaveAndPublish}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all"
          >
            {saveSuccess ? (
              <>
                <Check className="w-4 h-4" /> Nota Salva com Sucesso!
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Salvar & Finalizar Correção
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: DASHBOARD OVERVIEW TABLE & ANALYTICS
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
            Gestão Pedagógica & Avaliações
          </span>
          <h1 className="text-2xl font-black text-slate-900">
            Painel de Correção & Rendimento Escolar
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe as submissões dos estudantes, aproveite a correção por IA e exporte notas
          </p>
        </div>

        <button
          onClick={onBackToExams}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
        >
          &larr; Ver Banco de Provas
        </button>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
            Total de Entregas
          </span>
          <span className="text-3xl font-black text-slate-900 mt-1 block">
            {totalSubmissions}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Submissões registradas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 block">
            Aguardando Correção
          </span>
          <span className="text-3xl font-black text-amber-600 mt-1 block">
            {pendingSubmissions}
          </span>
          <span className="text-[10px] text-amber-700 mt-1 block font-medium">
            Dissertativas pendentes de nota
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 block">
            Média Geral das Notas
          </span>
          <span className="text-3xl font-black text-indigo-600 mt-1 block">
            {averageScore.toFixed(1)}
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Calculada sobre provas corrigidas
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 block">
            Taxa de Aprovação
          </span>
          <span className="text-3xl font-black text-emerald-600 mt-1 block">
            {passRate}%
          </span>
          <span className="text-[10px] text-slate-500 mt-1 block">
            Alunos acima da nota de corte
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por aluno ou matrícula..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Filter by Exam */}
          <select
            value={filterExamId}
            onChange={(e) => setFilterExamId(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 outline-none bg-white font-medium text-slate-700"
          >
            <option value="all">Todas as Provas</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>

          {/* Filter by Status */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({submissions.length})
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes ({pendingSubmissions})
            </button>
            <button
              onClick={() => setFilterStatus('graded')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'graded'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Corrigidas ({gradedSubmissions})
            </button>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">Nenhuma submissão encontrada</p>
            <p className="text-xs text-slate-400">
              Ajuste os filtros de busca ou realize uma prova no Modo Aluno.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-6">Estudante</th>
                  <th className="py-3.5 px-6">Avaliação</th>
                  <th className="py-3.5 px-6 text-center">Objetiva</th>
                  <th className="py-3.5 px-6 text-center">Dissertativa</th>
                  <th className="py-3.5 px-6 text-center">Nota Final</th>
                  <th className="py-3.5 px-6 text-center">Status</th>
                  <th className="py-3.5 px-6 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSubmissions.map((sub) => {
                  const exam = exams.find((e) => e.id === sub.examId);
                  const isPending = sub.status === 'pending_grading';

                  return (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      {/* Student */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm">
                          {sub.studentName}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {sub.studentRegistration ? `Matrícula: ${sub.studentRegistration}` : sub.studentEmail || 'Sem identificador'}
                        </div>
                      </td>

                      {/* Exam Title */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="font-medium text-slate-800 truncate" title={exam?.title}>
                          {exam?.title || 'Avaliação'}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {exam?.subject} &bull; {new Date(sub.submittedAt).toLocaleDateString('pt-BR')}
                        </div>
                      </td>

                      {/* Objective Score */}
                      <td className="py-4 px-6 text-center font-bold text-slate-800">
                        {sub.objectiveScore.toFixed(1)} pts
                      </td>

                      {/* Dissertative Score */}
                      <td className="py-4 px-6 text-center">
                        {isPending ? (
                          <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                            Pendente
                          </span>
                        ) : (
                          <span className="font-bold text-purple-900">
                            {sub.dissertativeScore.toFixed(1)} pts
                          </span>
                        )}
                      </td>

                      {/* Total Score */}
                      <td className="py-4 px-6 text-center">
                        <span className="font-black text-sm text-indigo-700">
                          {sub.totalScore.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-400 ml-0.5">
                          / {exam?.totalScore.toFixed(1)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6 text-center">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                            Aguardando Correção
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" /> Corrigida
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewStudentReport(sub)}
                            title="Ver Boletim Completo"
                            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleOpenGrading(sub)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all"
                          >
                            <Sliders className="w-3.5 h-3.5" />
                            {isPending ? 'Corrigir com IA' : 'Revisar Nota'}
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Deseja excluir a entrega de ${sub.studentName}?`)) {
                                onDeleteSubmission(sub.id);
                              }
                            }}
                            title="Excluir entrega"
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
