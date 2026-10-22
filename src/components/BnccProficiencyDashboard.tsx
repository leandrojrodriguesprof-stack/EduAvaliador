import React, { useState } from 'react';
import {
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileDown,
  Printer,
  Copy,
  BookOpen,
  Users,
  Search,
  Filter,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Exam, ExamSubmission, BnccSkillPerformance, BnccProficiencyLevel } from '../types/exam';
import { exportClassPerformanceToExcel, openGoogleWorkspaceDriveExport } from '../utils/exportUtils';

interface BnccProficiencyDashboardProps {
  exams: Exam[];
  submissions: ExamSubmission[];
  onBackToMenu: () => void;
}

export const BnccProficiencyDashboard: React.FC<BnccProficiencyDashboardProps> = ({
  exams,
  submissions,
  onBackToMenu,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || 'all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const currentExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const relevantSubmissions = submissions.filter((s) => {
    return selectedExamId === 'all' || s.examId === selectedExamId;
  });

  // Calculate proficiency level for a percentage
  const getProficiencyLevel = (percentage: number): BnccProficiencyLevel => {
    if (percentage >= 85) return 'avancado';
    if (percentage >= 70) return 'adequado';
    if (percentage >= 50) return 'basico';
    return 'abaixo_do_basico';
  };

  // Group submissions by proficiency level
  const studentsWithLevels = relevantSubmissions.map((s) => ({
    ...s,
    level: getProficiencyLevel(s.percentage),
  }));

  const countAbaixoBasico = studentsWithLevels.filter((s) => s.level === 'abaixo_do_basico').length;
  const countBasico = studentsWithLevels.filter((s) => s.level === 'basico').length;
  const countAdequado = studentsWithLevels.filter((s) => s.level === 'adequado').length;
  const countAvancado = studentsWithLevels.filter((s) => s.level === 'avancado').length;

  const total = studentsWithLevels.length || 1;
  const pctAbaixoBasico = Math.round((countAbaixoBasico / total) * 100);
  const pctBasico = Math.round((countBasico / total) * 100);
  const pctAdequado = Math.round((countAdequado / total) * 100);
  const pctAvancado = Math.round((countAvancado / total) * 100);

  // Calculate BNCC Skill Performances
  const bnccSkillMap: Record<
    string,
    {
      code: string;
      description: string;
      subject: string;
      totalQuestions: number;
      totalOpportunities: number;
      totalEarnedPoints: number;
      totalMaxPoints: number;
    }
  > = {};

  // Gather questions for selected exam(s)
  const targetExams = selectedExamId === 'all' ? exams : [currentExam].filter(Boolean);

  targetExams.forEach((exam) => {
    exam.questions.forEach((q) => {
      const code = q.bnccCode || 'HAB-GERAL';
      if (!bnccSkillMap[code]) {
        bnccSkillMap[code] = {
          code,
          description: q.bnccSkillDescription || q.subjectTag || `Habilidade referente a ${q.statement.slice(0, 60)}...`,
          subject: exam.subject,
          totalQuestions: 0,
          totalOpportunities: 0,
          totalEarnedPoints: 0,
          totalMaxPoints: 0,
        };
      }
      bnccSkillMap[code].totalQuestions++;
    });
  });

  // Accumulate student responses
  relevantSubmissions.forEach((sub) => {
    const exam = exams.find((e) => e.id === sub.examId);
    if (!exam) return;

    exam.questions.forEach((q) => {
      const code = q.bnccCode || 'HAB-GERAL';
      const grade = sub.grades[q.id];
      if (bnccSkillMap[code]) {
        bnccSkillMap[code].totalOpportunities++;
        bnccSkillMap[code].totalMaxPoints += q.points;
        bnccSkillMap[code].totalEarnedPoints += grade?.awardedPoints || 0;
      }
    });
  });

  const bnccPerformanceList: BnccSkillPerformance[] = Object.values(bnccSkillMap).map((item) => {
    const percentage =
      item.totalMaxPoints > 0
        ? Math.round((item.totalEarnedPoints / item.totalMaxPoints) * 100)
        : 75;
    const level = getProficiencyLevel(percentage);

    let suggestedAction = 'Manter atividades de aprofundamento e desafios conceituais.';
    if (level === 'abaixo_do_basico') {
      suggestedAction =
        'Urgente: Retomar conceitos prévios essenciais com aulas de nivelamento e metodologias ativas.';
    } else if (level === 'basico') {
      suggestedAction =
        'Reforçar exercícios de fixação, mapas mentais e estudos dirigidos em pequenos grupos.';
    } else if (level === 'adequado') {
      suggestedAction = 'Aplicar problemas contextualizados de maior complexidade para consolidar o avanço.';
    }

    return {
      code: item.code,
      description: item.description,
      subject: item.subject,
      totalQuestions: item.totalQuestions,
      totalResponses: item.totalOpportunities,
      correctResponses: Math.round(item.totalEarnedPoints),
      percentage,
      level,
      suggestedAction,
    };
  });

  const skillsDeveloped = bnccPerformanceList.filter(
    (b) => b.level === 'avancado' || b.level === 'adequado'
  );
  const skillsToDevelop = bnccPerformanceList.filter(
    (b) => b.level === 'basico' || b.level === 'abaixo_do_basico'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel Geral
          </button>
          <h1 className="text-2xl font-black text-slate-900">
            Dashboard Pedagógico & Escalas BNCC
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapeamento analítico de proficiência da turma por níveis: Abaixo do Básico, Básico, Adequado e Avançado
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (currentExam && relevantSubmissions.length > 0) {
                exportClassPerformanceToExcel(currentExam, relevantSubmissions, bnccPerformanceList);
              }
            }}
            disabled={!currentExam || relevantSubmissions.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-200 rounded-xl shadow-xs transition-colors"
          >
            <FileDown className="w-3.5 h-3.5 text-emerald-700" />
            Exportar Excel (.xlsx)
          </button>

          <button
            onClick={() =>
              openGoogleWorkspaceDriveExport(
                `Relatório BNCC - ${currentExam?.title || 'Turma'}`,
                JSON.stringify(bnccPerformanceList, null, 2)
              )
            }
            disabled={relevantSubmissions.length === 0}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 disabled:opacity-40 disabled:cursor-not-allowed border border-indigo-200 rounded-xl transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            Google Drive
          </button>
        </div>
      </div>

      {/* Exam Filter */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
          Filtrar por Avaliação:
        </span>
        <select
          value={selectedExamId}
          onChange={(e) => setSelectedExamId(e.target.value)}
          className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50 text-slate-800 outline-none"
        >
          <option value="all">Todas as Avaliações ({submissions.length} entregas)</option>
          {exams.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.title} ({ex.subject})
            </option>
          ))}
        </select>
      </div>

      {/* 4 Levels Cards (Abaixo do Básico, Básico, Adequado, Avançado) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Abaixo do Básico */}
        <div className="p-5 rounded-3xl bg-rose-50/70 border-2 border-rose-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 bg-rose-100 px-2 py-0.5 rounded-full">
              Abaixo do Básico
            </span>
            <span className="text-xs font-bold text-rose-700">&lt; 50%</span>
          </div>
          <div>
            <span className="text-3xl font-black text-rose-950">{countAbaixoBasico}</span>
            <span className="text-xs text-rose-700 ml-1">aluno(s) ({pctAbaixoBasico}%)</span>
          </div>
          <p className="text-[11px] text-rose-800 leading-tight">
            Estudantes com defasagens significativas. Necessitam de plano de recuperação pedagógica imediata.
          </p>
        </div>

        {/* Básico */}
        <div className="p-5 rounded-3xl bg-amber-50/70 border-2 border-amber-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
              Básico
            </span>
            <span className="text-xs font-bold text-amber-700">50% a 69%</span>
          </div>
          <div>
            <span className="text-3xl font-black text-amber-950">{countBasico}</span>
            <span className="text-xs text-amber-700 ml-1">aluno(s) ({pctBasico}%)</span>
          </div>
          <p className="text-[11px] text-amber-800 leading-tight">
            Compreensão elementar dos objetos de conhecimento. Precisam de atividades de consolidação.
          </p>
        </div>

        {/* Adequado */}
        <div className="p-5 rounded-3xl bg-blue-50/70 border-2 border-blue-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
              Adequado
            </span>
            <span className="text-xs font-bold text-blue-700">70% a 84%</span>
          </div>
          <div>
            <span className="text-3xl font-black text-blue-950">{countAdequado}</span>
            <span className="text-xs text-blue-700 ml-1">aluno(s) ({pctAdequado}%)</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-tight">
            Domínio satisfatório das habilidades esperadas para o ano/série escolar vigente.
          </p>
        </div>

        {/* Avançado */}
        <div className="p-5 rounded-3xl bg-emerald-50/70 border-2 border-emerald-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              Avançado
            </span>
            <span className="text-xs font-bold text-emerald-700">85% a 100%</span>
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-950">{countAvancado}</span>
            <span className="text-xs text-emerald-700 ml-1">aluno(s) ({pctAvancado}%)</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-tight">
            Pleno domínio conceitual, resolução crítica de problemas e alta proficiência na matriz.
          </p>
        </div>
      </div>

      {/* Habilidades Desenvolvidas vs A Desenvolver */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* HABILIDADES DESENVOLVIDAS */}
        <div className="bg-white rounded-3xl border border-emerald-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Habilidades Desenvolvidas ({skillsDeveloped.length})
            </h3>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Desempenho &ge; 70%
            </span>
          </div>

          {skillsDeveloped.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Nenhuma habilidade atingiu 70% de aproveitamento até o momento.
            </p>
          ) : (
            <div className="space-y-3">
              {skillsDeveloped.map((skill) => (
                <div
                  key={skill.code}
                  className="p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-emerald-900 bg-white px-2 py-0.5 rounded-md border border-emerald-200">
                      {skill.code}
                    </span>
                    <span className="text-xs font-black text-emerald-800">
                      {skill.percentage}% de acerto
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{skill.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* HABILIDADES A DESENVOLVER */}
        <div className="bg-white rounded-3xl border border-amber-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-amber-950 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Habilidades a Desenvolver ({skillsToDevelop.length})
            </h3>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Desempenho &lt; 70%
            </span>
          </div>

          {skillsToDevelop.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Parabéns! Todas as habilidades avaliadas foram dominadas pela turma.
            </p>
          ) : (
            <div className="space-y-3">
              {skillsToDevelop.map((skill) => (
                <div
                  key={skill.code}
                  className="p-3.5 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-amber-900 bg-white px-2 py-0.5 rounded-md border border-amber-200">
                      {skill.code}
                    </span>
                    <span className="text-xs font-black text-amber-800">
                      {skill.percentage}% de acerto
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">{skill.description}</p>
                  <div className="p-2.5 rounded-xl bg-white border border-amber-200/80 text-[11px] text-amber-900 space-y-0.5">
                    <strong>Intervenção Recomendada:</strong> {skill.suggestedAction}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Student List by Proficiency */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Classificação Individual dos Estudantes na Matriz
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Estudante</th>
                <th className="py-3 px-4">Matrícula</th>
                <th className="py-3 px-4 text-center">Nota Final</th>
                <th className="py-3 px-4 text-center">Aproveitamento</th>
                <th className="py-3 px-4 text-center">Nível BNCC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {studentsWithLevels.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="max-w-md mx-auto space-y-1">
                      <p className="text-xs font-semibold text-slate-600">
                        Nenhum estudante avaliado ainda
                      </p>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Aplique e corrija avaliações dos alunos para alimentar a classificação individual e os percentuais de proficiência da turma.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                studentsWithLevels.map((student) => {
                  let badgeClass = 'bg-rose-100 text-rose-800';
                  let label = 'Abaixo do Básico';
                  if (student.level === 'avancado') {
                    badgeClass = 'bg-emerald-100 text-emerald-800';
                    label = 'Avançado';
                  } else if (student.level === 'adequado') {
                    badgeClass = 'bg-blue-100 text-blue-800';
                    label = 'Adequado';
                  } else if (student.level === 'basico') {
                    badgeClass = 'bg-amber-100 text-amber-800';
                    label = 'Básico';
                  }

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-bold text-slate-800">{student.studentName}</td>
                      <td className="py-3 px-4 text-slate-500">{student.studentRegistration || 'N/A'}</td>
                      <td className="py-3 px-4 text-center font-extrabold text-slate-900">
                        {student.totalScore.toFixed(1)} pts
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-slate-700">
                        {student.percentage}%
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${badgeClass}`}>
                          {label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
