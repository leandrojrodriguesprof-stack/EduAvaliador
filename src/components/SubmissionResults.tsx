import React from 'react';
import {
  Award,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ArrowLeft,
  Sparkles,
  FileText,
  User,
  AlertCircle,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import { Exam, ExamSubmission } from '../types/exam';

interface SubmissionResultsProps {
  exam: Exam;
  submission: ExamSubmission;
  onBackToExams: () => void;
  onOpenTeacherGrading?: () => void;
}

export const SubmissionResults: React.FC<SubmissionResultsProps> = ({
  exam,
  submission,
  onBackToExams,
  onOpenTeacherGrading,
}) => {
  const isApproved = submission.totalScore >= exam.passingScore;
  const isPendingGrading = submission.status === 'pending_grading';

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs} segundos`;
    return `${mins} min ${secs} seg`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Action Header */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBackToExams}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar ao Banco de Provas
        </button>

        <div className="flex items-center gap-2">
          {onOpenTeacherGrading && (
            <button
              onClick={onOpenTeacherGrading}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors border border-indigo-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              {isPendingGrading ? 'Abrir Correção IA no Painel' : 'Revisar Nota no Painel'}
            </button>
          )}

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Imprimir Relatório
          </button>
        </div>
      </div>

      {/* Hero Performance Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block mb-1">
              Boletim Avaliativo Individual
            </span>
            <h1 className="text-2xl font-black text-slate-900">{exam.title}</h1>
            <p className="text-xs text-slate-500 mt-1">
              {exam.subject} &bull; {exam.gradeLevel} &bull; {exam.institution || 'Instituição de Ensino'}
            </p>
          </div>

          {/* Status Badge */}
          <div className="shrink-0">
            {isPendingGrading ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                Aguardando Correção Dissertativa
              </span>
            ) : isApproved ? (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Aprovado &bull; Desempenho Satisfatório
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                Em Recuperação
              </span>
            )}
          </div>
        </div>

        {/* Score & Student Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
              Nota Final Obtida
            </span>
            <div className="mt-2">
              <span className="text-3xl font-black text-indigo-900">
                {submission.totalScore.toFixed(1)}
              </span>
              <span className="text-xs text-indigo-600 font-semibold ml-1">
                / {exam.totalScore.toFixed(1)}
              </span>
            </div>
            <span className="text-[10px] text-indigo-600 mt-1">
              {submission.percentage}% de aproveitamento
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Parte Objetiva
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold text-slate-800">
                {submission.objectiveScore.toFixed(1)} pts
              </span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              Correção automática via gabarito
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
              Parte Dissertativa
            </span>
            <div className="mt-2">
              <span className="text-2xl font-bold text-purple-900">
                {submission.dissertativeScore.toFixed(1)} pts
              </span>
            </div>
            <span className="text-[10px] text-purple-600 mt-1">
              {isPendingGrading ? 'Pendente de nota' : 'Avaliado por rubrica'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Tempo Gasto
            </span>
            <div className="mt-2 flex items-center gap-1.5 text-slate-800 font-bold text-lg">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{formatDuration(submission.durationSpentSeconds)}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-1">
              Entregue em {new Date(submission.submittedAt).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>

        {/* Student metadata */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-400" />
            <span>
              Estudante: <strong>{submission.studentName}</strong>
            </span>
          </div>
          {submission.studentRegistration && (
            <div>
              Matrícula: <strong>{submission.studentRegistration}</strong>
            </div>
          )}
          {submission.studentEmail && (
            <div>
              E-mail: <strong>{submission.studentEmail}</strong>
            </div>
          )}
          <div>
            Média de Corte: <strong>{exam.passingScore.toFixed(1)} pts</strong>
          </div>
        </div>

        {submission.teacherNotes && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <strong className="block uppercase tracking-wider text-[10px] text-amber-800 font-bold">
              Observações Pedagógicas do Docente:
            </strong>
            <p className="leading-relaxed">{submission.teacherNotes}</p>
          </div>
        )}
      </div>

      {/* Questions Breakdown */}
      <div className="space-y-6">
        <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" />
          Detalhamento de Cada Questão
        </h2>

        {exam.questions.map((q, idx) => {
          const studentAns = submission.answers[q.id];
          const gradeInfo = submission.grades[q.id];
          const isObjective = q.type === 'objective';
          const isCorrect = gradeInfo?.isCorrect;

          return (
            <div
              key={q.id}
              className={`bg-white rounded-3xl border p-6 sm:p-8 space-y-4 shadow-xs transition-all ${
                isObjective
                  ? isCorrect
                    ? 'border-emerald-200'
                    : 'border-rose-200'
                  : 'border-slate-200'
              }`}
            >
              {/* Question header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {isObjective ? 'Questão Objetiva' : 'Questão Dissertativa'}
                  </span>
                  {q.subjectTag && (
                    <span className="text-[11px] text-slate-400 italic">({q.subjectTag})</span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-500">
                    Valor: {q.points.toFixed(1)} pts
                  </span>

                  {isObjective ? (
                    isCorrect ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> +{gradeInfo?.awardedPoints.toFixed(1)} pts
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> 0,0 pts
                      </span>
                    )
                  ) : (
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
                      Nota: {(gradeInfo?.awardedPoints || 0).toFixed(1)} / {q.points.toFixed(1)} pts
                    </span>
                  )}
                </div>
              </div>

              {/* Statement */}
              <div className="text-sm text-slate-800 leading-relaxed font-sans">
                {q.statement}
              </div>

              {/* Objective Question Review */}
              {isObjective && q.options && (
                <div className="space-y-2 pt-2">
                  {q.options.map((opt) => {
                    const isSelectedByStudent = studentAns?.selectedOptionId === opt.id;
                    const isTheCorrectOption = opt.isCorrect;

                    let cardClass = 'bg-slate-50 border-slate-200 text-slate-600';
                    if (isTheCorrectOption) {
                      cardClass = 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-medium';
                    } else if (isSelectedByStudent && !isTheCorrectOption) {
                      cardClass = 'bg-rose-50/80 border-rose-300 text-rose-950 font-medium';
                    }

                    return (
                      <div
                        key={opt.id}
                        className={`p-3.5 rounded-2xl border text-xs flex items-start gap-3 ${cardClass}`}
                      >
                        <span
                          className={`w-6 h-6 rounded-lg font-bold flex items-center justify-center shrink-0 text-xs ${
                            isTheCorrectOption
                              ? 'bg-emerald-600 text-white'
                              : isSelectedByStudent
                              ? 'bg-rose-600 text-white'
                              : 'bg-white border border-slate-300 text-slate-700'
                          }`}
                        >
                          {opt.id}
                        </span>

                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>{opt.text}</span>
                            {isSelectedByStudent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-white/80 border border-current ml-2 shrink-0">
                                Sua Resposta
                              </span>
                            )}
                          </div>

                          {isTheCorrectOption && opt.explanation && (
                            <p className="text-[11px] text-emerald-800 font-sans mt-1 pt-1 border-t border-emerald-200/60 leading-relaxed">
                              <strong>Resolução Comentada:</strong> {opt.explanation}
                            </p>
                          )}
                          {!isTheCorrectOption && isSelectedByStudent && opt.explanation && (
                            <p className="text-[11px] text-rose-800 font-sans mt-1 pt-1 border-t border-rose-200/60 leading-relaxed">
                              <strong>Por que está incorreta:</strong> {opt.explanation}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Dissertative Question Review */}
              {!isObjective && (
                <div className="space-y-4 pt-2">
                  {/* Student Answer */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-slate-500 block">
                      Resposta Elaborada pelo Estudante:
                    </span>
                    <p className="text-slate-800 text-sm leading-relaxed whitespace-pre-line font-sans">
                      {studentAns?.writtenText || (
                        <span className="italic text-slate-400">Questão deixada em branco.</span>
                      )}
                    </p>
                  </div>

                  {/* Expected Model Answer */}
                  {q.expectedAnswer && (
                    <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-xs space-y-1">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-indigo-700 block">
                        Gabarito Modelo / Resposta Esperada pelo Professor:
                      </span>
                      <p className="text-indigo-950 text-xs leading-relaxed font-sans">
                        {q.expectedAnswer}
                      </p>
                    </div>
                  )}

                  {/* AI Evaluation / Teacher Grading Feedback */}
                  {gradeInfo?.summaryJustification || gradeInfo?.detailedFeedback ? (
                    <div className="p-5 rounded-2xl bg-purple-50/60 border border-purple-200 text-xs space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-purple-900 flex items-center gap-1.5 uppercase tracking-wide">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          Parecer e Avaliação da Dissertação
                        </span>
                        <span className="text-xs font-black text-purple-900 bg-white px-2.5 py-1 rounded-lg border border-purple-200">
                          Nota Atribuída: {(gradeInfo.awardedPoints || 0).toFixed(1)} / {q.points.toFixed(1)} pts
                        </span>
                      </div>

                      {gradeInfo.summaryJustification && (
                        <p className="font-semibold text-purple-900 text-xs">
                          {gradeInfo.summaryJustification}
                        </p>
                      )}

                      {gradeInfo.detailedFeedback && (
                        <p className="text-slate-700 leading-relaxed text-xs">
                          {gradeInfo.detailedFeedback}
                        </p>
                      )}

                      {/* Criteria breakdown table */}
                      {gradeInfo.criteriaGrades && gradeInfo.criteriaGrades.length > 0 && (
                        <div className="pt-2 border-t border-purple-100 space-y-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block">
                            Notas por Critério da Rubrica:
                          </span>
                          <div className="space-y-1.5">
                            {gradeInfo.criteriaGrades.map((crit, cIdx) => (
                              <div
                                key={cIdx}
                                className="bg-white p-2.5 rounded-xl border border-purple-100 flex items-start justify-between text-xs"
                              >
                                <div>
                                  <span className="font-semibold text-slate-800">{crit.criterionTitle}</span>
                                  {crit.comment && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">{crit.comment}</p>
                                  )}
                                </div>
                                <span className="font-bold text-purple-800 text-xs ml-3 shrink-0">
                                  {crit.score.toFixed(1)} / {crit.maxScore.toFixed(1)} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Strengths & Improvements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {gradeInfo.strengths && gradeInfo.strengths.length > 0 && (
                          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-1">
                            <span className="font-bold text-emerald-800 text-[10px] uppercase block">
                              Pontos Fortes:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-emerald-900 text-[11px]">
                              {gradeInfo.strengths.map((str, sIdx) => (
                                <li key={sIdx}>{str}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {gradeInfo.improvements && gradeInfo.improvements.length > 0 && (
                          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1">
                            <span className="font-bold text-amber-800 text-[10px] uppercase block">
                              Sugestões de Melhoria:
                            </span>
                            <ul className="list-disc list-inside space-y-0.5 text-amber-900 text-[11px]">
                              {gradeInfo.improvements.map((imp, iIdx) => (
                                <li key={iIdx}>{imp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Esta questão dissertativa aguarda correção do professor ou análise por IA.</span>
                      </div>
                      {onOpenTeacherGrading && (
                        <button
                          onClick={onOpenTeacherGrading}
                          className="px-3 py-1 bg-amber-600 text-white font-semibold rounded-lg text-xs hover:bg-amber-700"
                        >
                          Corrigir Agora
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
