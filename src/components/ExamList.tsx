import React, { useState } from 'react';
import {
  BookOpen,
  Play,
  ClipboardCheck,
  Printer,
  Edit,
  Trash2,
  Clock,
  Award,
  Layers,
  Sparkles,
  Plus,
  Search,
  Filter,
  FileDown,
} from 'lucide-react';
import { Exam, ExamSubmission } from '../types/exam';
import { exportExamToWord } from '../utils/exportUtils';

interface ExamListProps {
  exams: Exam[];
  submissions: ExamSubmission[];
  onTakeExam: (exam: Exam) => void;
  onEditExam: (exam: Exam) => void;
  onDeleteExam: (id: string) => void;
  onOpenPrintModal: (exam: Exam) => void;
  onOpenTeacherDashboard: (examId?: string) => void;
  onNewExam: () => void;
  onOpenAiGenerator: () => void;
}

export const ExamList: React.FC<ExamListProps> = ({
  exams,
  submissions,
  onTakeExam,
  onEditExam,
  onDeleteExam,
  onOpenPrintModal,
  onOpenTeacherDashboard,
  onNewExam,
  onOpenAiGenerator,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Subjects for filter
  const subjects = Array.from(new Set(exams.map((e) => e.subject))).filter(Boolean);

  const filteredExams = exams.filter((exam) => {
    const matchSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSubject = selectedSubject === 'all' || exam.subject === selectedSubject;
    return matchSearch && matchSubject;
  });

  const totalQuestions = exams.reduce((acc, e) => acc + (e.questions?.length || 0), 0);
  const totalSubmissions = submissions.length;
  const pendingCorrections = submissions.filter((s) => s.status === 'pending_grading').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-64 h-64 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Avaliações Online com Correção Inteligente</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Banco de Provas & Sistema Avaliativo
          </h1>

          <p className="text-sm sm:text-base text-indigo-100/90 leading-relaxed max-w-2xl">
            Crie avaliações objetivas com gabarito automático e dissertativas com correção
            assistida por inteligência artificial, relatórios individuais e impressão padrão.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenAiGenerator}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all shadow-md shadow-amber-400/20"
            >
              <Sparkles className="w-4 h-4 text-slate-900" />
              Gerar Prova com IA
            </button>

            <button
              onClick={onNewExam}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              Criar Prova do Zero
            </button>

            {pendingCorrections > 0 && (
              <button
                onClick={() => onOpenTeacherDashboard()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-200 bg-amber-500/20 border border-amber-400/30 hover:bg-amber-500/30 transition-all"
              >
                <ClipboardCheck className="w-4 h-4 text-amber-300" />
                {pendingCorrections} {pendingCorrections === 1 ? 'prova pendente de correção' : 'provas pendentes de correção'}
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/10">
          <div>
            <span className="text-xs text-indigo-200/80 block">Provas Cadastradas</span>
            <span className="text-2xl font-black text-white">{exams.length}</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200/80 block">Total de Questões</span>
            <span className="text-2xl font-black text-white">{totalQuestions}</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200/80 block">Submissões Recebidas</span>
            <span className="text-2xl font-black text-white">{totalSubmissions}</span>
          </div>
          <div>
            <span className="text-xs text-indigo-200/80 block">Aguardando Avaliação</span>
            <span className={`text-2xl font-black ${pendingCorrections > 0 ? 'text-amber-300' : 'text-emerald-300'}`}>
              {pendingCorrections}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por título, conteúdo ou disciplina..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden sm:block" />
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSubject === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas as Disciplinas
          </button>
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedSubject === sub
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Cards Grid */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">Nenhuma avaliação encontrada</h3>
            <p className="text-xs text-slate-500 mt-1">
              Ajuste seus termos de busca ou crie uma nova prova agora mesmo.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={onNewExam}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
            >
              <Plus className="w-4 h-4" /> Criar Prova do Zero
            </button>
            <button
              onClick={onOpenAiGenerator}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-900 bg-amber-400 rounded-xl hover:bg-amber-300 shadow-md shadow-amber-400/20 transition-all"
            >
              <Sparkles className="w-4 h-4 text-slate-900" /> Gerar com IA
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => {
            const examSubmissions = submissions.filter((s) => s.examId === exam.id);
            const pendingForThisExam = examSubmissions.filter((s) => s.status === 'pending_grading').length;
            const countObj = exam.questions.filter((q) => q.type === 'objective').length;
            const countDiss = exam.questions.filter((q) => q.type === 'dissertative').length;

            return (
              <div
                key={exam.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                {/* Card Top */}
                <div className="p-6 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {exam.subject}
                      </span>
                      {exam.isAdaptedForInclusion && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                          ★ AEE / TEA Adaptada
                        </span>
                      )}
                    </div>

                    {pendingForThisExam > 0 ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200 animate-pulse">
                        {pendingForThisExam} pendente(s)
                      </span>
                    ) : examSubmissions.length > 0 ? (
                      <span className="text-[11px] font-medium text-slate-500">
                        {examSubmissions.length} entregue(s)
                      </span>
                    ) : null}
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {exam.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {exam.description}
                    </p>
                  </div>

                  {/* Pills Info */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{exam.durationMinutes > 0 ? `${exam.durationMinutes} min` : 'Sem limite'}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-slate-400" />
                      <span>Valor: {exam.totalScore.toFixed(1)} pts</span>
                    </div>

                    <div className="flex items-center gap-1.5 col-span-2">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {countObj} objetiva(s) &bull; {countDiss} dissertativa(s)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportExamToWord(exam, false)}
                      title="Baixar Prova em Word (.doc)"
                      className="p-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FileDown className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => onOpenPrintModal(exam)}
                      title="Imprimir ou exportar PDF"
                      className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition-colors"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEditExam(exam)}
                      title="Editar prova"
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200/60 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Deseja realmente excluir a avaliação "${exam.title}"?`)) {
                          onDeleteExam(exam.id);
                        }
                      }}
                      title="Excluir prova"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {examSubmissions.length > 0 && (
                      <button
                        onClick={() => onOpenTeacherDashboard(exam.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        Correções
                      </button>
                    )}

                    <button
                      onClick={() => onTakeExam(exam)}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Fazer Prova
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
