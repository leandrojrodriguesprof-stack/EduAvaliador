import React, { useState } from 'react';
import { Printer, X, CheckCircle, FileText, CheckSquare } from 'lucide-react';
import { Exam } from '../types/exam';

interface PrintExamModalProps {
  exam: Exam | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintExamModal: React.FC<PrintExamModalProps> = ({ exam, isOpen, onClose }) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  if (!isOpen || !exam) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden print:max-h-none print:shadow-none print:border-none print:w-full print:rounded-none">
        {/* Modal Controls (Hidden in Print) */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50 print:hidden shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Impressão & Exportação PDF</h3>
              <p className="text-xs text-slate-500">
                Visualize e imprima a prova em folha padrão escolar/acadêmica
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Gabarito */}
            <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-medium">
              <button
                type="button"
                onClick={() => setShowAnswerKey(false)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  !showAnswerKey ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Versão do Aluno (Sem Gabarito)
              </button>
              <button
                type="button"
                onClick={() => setShowAnswerKey(true)}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  showAnswerKey ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Versão do Professor (Gabarito + BNCC)
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              Imprimir / Salvar PDF
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Paper Content */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 print:p-0 print:overflow-visible font-serif text-slate-900">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* School / Exam Header */}
            <div className="border-2 border-slate-800 p-4 rounded-lg">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
                <div>
                  <h1 className="text-lg font-bold tracking-tight uppercase text-slate-900">
                    {exam.institution || 'Instituição de Ensino'}
                  </h1>
                  <h2 className="text-base font-semibold text-slate-800">{exam.title}</h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    <strong>Disciplina:</strong> {exam.subject} &nbsp;|&nbsp;{' '}
                    <strong>Turma:</strong> {exam.gradeLevel} &nbsp;|&nbsp;{' '}
                    <strong>Professor(a):</strong> {exam.teacherName || 'Docente Responsável'}
                  </p>
                </div>
                <div className="border border-slate-800 rounded p-2 text-center min-w-[90px] shrink-0 bg-slate-50">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Nota Final
                  </span>
                  <div className="h-9 flex items-center justify-center font-mono font-bold text-lg text-slate-800">
                    {showAnswerKey ? `${exam.totalScore.toFixed(1)} / ${exam.totalScore.toFixed(1)}` : `___ / ${exam.totalScore.toFixed(1)}`}
                  </div>
                </div>
              </div>

              {/* Student identification line */}
              <div className="grid grid-cols-12 gap-3 text-xs pt-1">
                <div className="col-span-7 flex items-center gap-1">
                  <span className="font-bold">Aluno(a):</span>
                  <span className="border-b border-dotted border-slate-500 flex-1 h-4"></span>
                </div>
                <div className="col-span-3 flex items-center gap-1">
                  <span className="font-bold">Matrícula:</span>
                  <span className="border-b border-dotted border-slate-500 flex-1 h-4"></span>
                </div>
                <div className="col-span-2 flex items-center gap-1">
                  <span className="font-bold">Data:</span>
                  <span className="border-b border-dotted border-slate-500 flex-1 h-4">___/___/_____</span>
                </div>
              </div>
            </div>

            {/* Banner if Answer Key */}
            {showAnswerKey && (
              <div className="bg-amber-50 border border-amber-300 p-3 rounded-lg text-xs text-amber-900 flex items-center gap-2 font-sans font-medium print:bg-slate-100 print:border-slate-400">
                <CheckCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>GABARITO OFICIAL E CRITÉRIOS DE CORREÇÃO:</strong> Este documento contém as
                  respostas modelo e justificativas para uso exclusivo do corpo docente.
                </span>
              </div>
            )}

            {/* Instructions */}
            {exam.instructions && exam.instructions.length > 0 && (
              <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-700 space-y-1">
                <strong className="block uppercase tracking-wider text-slate-800 font-sans text-[11px]">
                  Instruções Gerais:
                </strong>
                <ul className="list-disc list-inside space-y-0.5 font-sans">
                  {exam.instructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                  {exam.durationMinutes > 0 && (
                    <li>Duração limite prevista: {exam.durationMinutes} minutos.</li>
                  )}
                </ul>
              </div>
            )}

            {/* Questions list */}
            <div className="space-y-6 pt-2">
              {exam.questions.map((q, qIndex) => {
                const questionNumber = q.order || qIndex + 1;
                return (
                  <div key={q.id} className="break-inside-avoid border-b border-slate-200 pb-5">
                    {/* Question Header */}
                    <div className="flex items-baseline justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 font-sans">
                          QUESTÃO {questionNumber}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-sans border border-slate-200">
                          {q.type === 'objective' ? 'Objetiva' : 'Dissertativa'}
                        </span>
                        {q.subjectTag && (
                          <span className="text-[11px] text-slate-500 font-sans italic">
                            ({q.subjectTag})
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 font-sans">
                        Valor: {q.points.toFixed(1)} {q.points === 1 ? 'ponto' : 'pontos'}
                      </span>
                    </div>

                    {/* Supporting Text */}
                    {q.supportingText && (
                      <div className="bg-slate-50 border-l-2 border-slate-700 p-2.5 my-2 text-xs font-serif italic text-slate-800">
                        <strong className="not-italic text-slate-900 block font-sans text-[11px] mb-1">
                          {q.supportingTextTitle || 'TEXTO DE APOIO'}:
                        </strong>
                        "{q.supportingText}"
                        {q.supportingTextSource && (
                          <div className="text-[10px] text-slate-500 text-right mt-1 font-sans">
                            — Fonte: {q.supportingTextSource}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Image / Charge */}
                    {q.imageUrl && (
                      <div className="my-3 text-center">
                        <img
                          src={q.imageUrl}
                          alt={q.imageCaption || 'Imagem da questão'}
                          className="max-h-52 max-w-full mx-auto border border-slate-300 rounded p-1"
                        />
                        {(q.imageCaption || q.imageSource) && (
                          <p className="text-[10px] text-slate-600 italic mt-1 font-sans">
                            {q.imageCaption && <strong>{q.imageCaption}</strong>}
                            {q.imageSource && ` (${q.imageSource})`}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Inclusive Visual Cue */}
                    {q.visualCue && (
                      <div className="bg-amber-50 border border-amber-300 p-2 my-2 text-xs text-amber-900 font-sans">
                        <strong>💡 Pista de Apoio:</strong> {q.visualCue}
                      </div>
                    )}

                    {/* Question Statement */}
                    <div className="text-sm leading-relaxed text-slate-900 mb-3 whitespace-pre-line font-serif">
                      {q.statement}
                    </div>

                    {/* Objective Question Options */}
                    {q.type === 'objective' && q.options && (
                      <div className="space-y-2 pl-2">
                        {q.options.map((opt) => (
                          <div
                            key={opt.id}
                            className={`flex items-start gap-2.5 text-xs font-sans leading-relaxed p-1.5 rounded ${
                              showAnswerKey && opt.isCorrect
                                ? 'bg-emerald-50 border border-emerald-300 font-medium'
                                : ''
                            }`}
                          >
                            <span
                              className={`w-6 h-6 rounded-full border border-slate-500 flex items-center justify-center shrink-0 font-bold text-xs ${
                                showAnswerKey && opt.isCorrect
                                  ? 'bg-emerald-600 border-emerald-600 text-white'
                                  : 'bg-white text-slate-800'
                              }`}
                            >
                              {opt.id}
                            </span>
                            <div className="flex-1 pt-0.5">
                              <span>{opt.text}</span>
                              {showAnswerKey && opt.explanation && (
                                <p className="text-[11px] text-emerald-800 italic mt-1 font-serif">
                                  <strong>Comentário:</strong> {opt.explanation}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Dissertative Question Lined Space or Answer Key */}
                    {q.type === 'dissertative' && (
                      <div className="mt-3">
                        {showAnswerKey ? (
                          <div className="bg-slate-50 border border-slate-300 rounded p-3 text-xs font-sans space-y-2">
                            <div>
                              <strong className="text-slate-800 block text-[11px] uppercase tracking-wide">
                                Resposta Padrão Esperada:
                              </strong>
                              <p className="text-slate-700 italic font-serif leading-relaxed mt-0.5">
                                {q.expectedAnswer || 'Resposta conceitual fundamentada com termos técnicos adequados.'}
                              </p>
                            </div>

                            {q.rubric && q.rubric.length > 0 && (
                              <div className="pt-2 border-t border-slate-200">
                                <strong className="text-slate-800 block text-[10px] uppercase tracking-wider mb-1">
                                  Critérios da Rubrica de Correção:
                                </strong>
                                <ul className="space-y-1">
                                  {q.rubric.map((r, rIdx) => (
                                    <li
                                      key={r.id || rIdx}
                                      className="flex items-start justify-between text-[11px] text-slate-600"
                                    >
                                      <span>
                                        • <strong>{r.title}:</strong> {r.description}
                                      </span>
                                      <span className="font-semibold text-slate-800 shrink-0 ml-2">
                                        máx. {r.maxScore} pt(s)
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-4 pt-1">
                            <span className="text-[11px] text-slate-500 italic font-sans block">
                              Espaço para resposta do aluno:
                            </span>
                            <div className="space-y-4">
                              <div className="border-b border-slate-300 h-5"></div>
                              <div className="border-b border-slate-300 h-5"></div>
                              <div className="border-b border-slate-300 h-5"></div>
                              <div className="border-b border-slate-300 h-5"></div>
                              <div className="border-b border-slate-300 h-5"></div>
                              <div className="border-b border-slate-300 h-5"></div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Teacher Version: Matriz de Alinhamento e Habilidades BNCC */}
            {showAnswerKey && (
              <div className="mt-8 pt-6 border-t-2 border-slate-800 break-inside-avoid">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 font-sans mb-3 flex items-center justify-between">
                  <span>Matriz de Alinhamento Pedagógico &bull; BNCC / MEC</span>
                  <span className="text-xs font-normal normal-case text-slate-600">
                    Documento de prestação de contas pedagógicas
                  </span>
                </h3>
                <div className="overflow-x-auto border border-slate-300 rounded">
                  <table className="w-full text-left text-xs font-sans">
                    <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-800">
                      <tr>
                        <th className="p-2 border-r border-slate-300 w-16">Questão</th>
                        <th className="p-2 border-r border-slate-300 w-24">Código BNCC</th>
                        <th className="p-2 border-r border-slate-300">Descrição da Habilidade Avaliada</th>
                        <th className="p-2 border-r border-slate-300 w-20 text-center">Tipo</th>
                        <th className="p-2 text-right w-16">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {exam.questions.map((q, idx) => (
                        <tr key={q.id}>
                          <td className="p-2 border-r border-slate-200 font-bold text-center">
                            Q{q.order || idx + 1}
                          </td>
                          <td className="p-2 border-r border-slate-200 font-mono font-bold text-indigo-900">
                            {q.bnccCode || 'BNCC Geral'}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-slate-700 leading-snug">
                            {q.bnccSkillDescription || 'Habilidade oficial curricular correspondente.'}
                            {q.bnccPedagogicalRationale && (
                              <span className="block text-[10px] text-slate-500 italic mt-0.5">
                                Justificativa: {q.bnccPedagogicalRationale}
                              </span>
                            )}
                          </td>
                          <td className="p-2 border-r border-slate-200 text-center font-medium capitalize">
                            {q.type === 'objective' ? 'Objetiva' : 'Dissertativa'}
                          </td>
                          <td className="p-2 text-right font-bold text-slate-800">
                            {q.points.toFixed(1)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Footer with page notation */}
            <div className="text-center pt-4 text-[10px] text-slate-500 font-sans border-t border-slate-200">
              GabaritoPro Avaliações &copy; 2026 - Documento emitido para fins pedagógicos e avaliativos.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
