import React, { useState } from 'react';
import {
  FileCheck,
  Sparkles,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Award,
  BookOpen,
  Printer,
  FileDown,
  Trash2,
  Sliders,
  Plus,
  ArrowLeft,
  Loader2,
  Copy,
  ChevronRight,
  HelpCircle,
  ExternalLink,
  PenTool,
} from 'lucide-react';
import { EnemEssaySubmission, EnemCompetency } from '../types/exam';
import { gradeEnemEssay } from '../services/geminiService';
import { exportEnemEssayToWord, openGoogleWorkspaceDriveExport } from '../utils/exportUtils';

interface EnemEssayCorrectorProps {
  essays: EnemEssaySubmission[];
  onSaveEssay: (essay: EnemEssaySubmission) => void;
  onDeleteEssay: (id: string) => void;
  onBackToMenu: () => void;
}

export const EnemEssayCorrector: React.FC<EnemEssayCorrectorProps> = ({
  essays,
  onSaveEssay,
  onDeleteEssay,
  onBackToMenu,
}) => {
  const [activeEssay, setActiveEssay] = useState<EnemEssaySubmission | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Form state for new essay
  const [studentName, setStudentName] = useState('');
  const [studentRegistration, setStudentRegistration] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [theme, setTheme] = useState('');
  const [submissionType, setSubmissionType] = useState<'text' | 'photo'>('text');
  const [essayText, setEssayText] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [loadingStepText, setLoadingStepText] = useState('');

  // Teacher manual override state for active essay
  const [isEditingScores, setIsEditingScores] = useState(false);
  const [editingDraft, setEditingDraft] = useState<EnemEssaySubmission | null>(null);

  const officialThemes = [
    'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
    'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
    'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil',
    'O estigma associado às doenças mentais na sociedade brasileira',
    'Democratização do acesso ao cinema no Brasil',
  ];

  // Handle Image Upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Demo auto-fill
  const handleFillDemo = () => {
    setStudentName('Larissa Duarte Brandão');
    setStudentRegistration('2024-EM-0518');
    setSchoolName('Escola Estadual Cecília Meireles');
    setTheme('Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil');
    setSubmissionType('text');
    setEssayText(`O sociólogo Zygmunt Bauman, em sua teoria da "Modernidade Líquida", elucida que as relações sociais contemporâneas são marcadas pela fragilidade e pela volatilidade institucional. Nesse contexto, a ausência de registro civil de milhares de brasileiros espelha com nitidez esse quadro, gerando a invisibilidade social e a exclusão da cidadania plena. Dessa forma, é fundamental analisar as raízes socioeconômicas dessa problemática e a consequente negação dos direitos constitucionais mais elementares.

Em primeira análise, cabe destacar que a barreira geográfica e burocrática impede que populações vulneráveis acessem os cartórios de registro civil. Conforme a Constituição Federal de 1988, todo cidadão tem direito à dignidade da pessoa humana e ao reconhecimento perante a lei. Contudo, em regiões periféricas e no interior do país, a carência de cartórios itinerantes e a falta de informação condenam crianças e adultos ao ostracismo legal, privando-os de vacinação, matrículas escolares e programas de transferência de renda.

Ademais, a ausência da certidão de nascimento perpetua o ciclo de pobreza e a exploração do trabalho informal. Sem documentos oficiais, o indivíduo não existe juridicamente, ficando à margem do mercado formal de trabalho e da previdência social. Trata-se, portanto, de uma cidadania mutilada, que retira a voz de sujeitos históricos e perpetua a desigualdade estrutural do país.

Depreende-se, pois, a urgência de medidas interventivas para garantir a inclusão de todos os brasileiros no tecido social. Para tanto, cabe ao Ministério dos Direitos Humanos e da Cidadania, em parceria com os Cartórios de Registro Civil e prefeituras, implementar o projeto "Certidão em Todo Canto", mediante a expansão de unidades móveis e mutirões em áreas rurais e comunidades carentes. Essa medida terá como objetivo emitir gratuitamente a primeira e segunda via da certidão de nascimento, assegurando o passaporte primordial para o pleno exercício da cidadania democrática.`);
  };

  // Trigger AI correction
  const handleProcessCorrection = async () => {
    if (!theme.trim()) {
      alert('Informe o tema da redação.');
      return;
    }
    if (submissionType === 'text' && !essayText.trim()) {
      alert('Por favor digite ou cole o texto da redação.');
      return;
    }
    if (submissionType === 'photo' && !imagePreview) {
      alert('Por favor carregue a foto da folha de redação.');
      return;
    }

    setIsLoadingAi(true);
    setLoadingStepText('Analisando texto e critérios oficiais do MEC/INEP...');

    try {
      const result = await gradeEnemEssay({
        theme,
        essayText: submissionType === 'text' ? essayText : undefined,
        imageBase64: submissionType === 'photo' ? imagePreview! : undefined,
        studentName: studentName || 'Estudante',
      });

      const newEssay: EnemEssaySubmission = {
        id: `essay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        studentName: studentName.trim() || 'Estudante Sem Nome',
        studentRegistration: studentRegistration.trim() || undefined,
        schoolName: schoolName.trim() || undefined,
        theme,
        submissionType,
        imagePreview: imagePreview || undefined,
        essayText: result.transcription || essayText,
        competencies: result.competencies || [],
        totalScore: result.totalScore || 0,
        interventionDetails: result.interventionDetails || {
          agent: { present: false },
          action: { present: false },
          means: { present: false },
          effect: { present: false },
          detailing: { present: false },
        },
        summaryPedagogical: result.summaryPedagogical || 'Redação corrigida pelo modelo pedagógico.',
        strengths: result.strengths || [],
        improvements: result.improvements || [],
        status: 'graded',
        createdAt: new Date().toISOString(),
        gradedAt: new Date().toISOString(),
      };

      onSaveEssay(newEssay);
      setActiveEssay(newEssay);
      setIsNewModalOpen(false);

      // Reset form
      setStudentName('');
      setStudentRegistration('');
      setSchoolName('');
      setEssayText('');
      setImagePreview(null);
    } catch (err: any) {
      console.error(err);
      alert('Erro ao corrigir redação: ' + err.message);
    } finally {
      setIsLoadingAi(false);
      setLoadingStepText('');
    }
  };

  // Manual score adjustments by teacher
  const handleUpdateCompetencyScore = (compNumber: number, newScore: number) => {
    if (!editingDraft) return;
    const comps = editingDraft.competencies.map((c) =>
      c.competencyNumber === compNumber ? { ...c, score: newScore } : c
    );
    const newTotal = comps.reduce((acc, c) => acc + c.score, 0);
    setEditingDraft({
      ...editingDraft,
      competencies: comps,
      totalScore: newTotal,
    });
  };

  const handleSaveManualEdits = () => {
    if (!editingDraft) return;
    onSaveEssay(editingDraft);
    setActiveEssay(editingDraft);
    setIsEditingScores(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Matriz Oficial do INEP / MEC &bull; 5 Competências de 0 a 1000 Pontos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Módulo de Correção de Redações (ENEM)
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
            Correção criteriosa por texto ou foto manuscrita com avaliação detalhada das 5
            competências, diagnóstico dos 5 elementos da proposta de intervenção e exportação para Word.
          </p>
        </div>

        <div className="flex items-center gap-2 z-10 shrink-0">
          <button
            onClick={() => {
              setIsNewModalOpen(true);
              setActiveEssay(null);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 active:scale-95 shadow-md shadow-emerald-400/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nova Redação
          </button>
        </div>
      </div>

      {/* Main Layout: List vs Active Essay View */}
      {activeEssay ? (
        /* ACTIVE ESSAY VIEW & GRADE SHEET */
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <button
              onClick={() => setActiveEssay(null)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" /> Voltar à Lista de Redações
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportEnemEssayToWord(activeEssay)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-xs"
              >
                <FileDown className="w-3.5 h-3.5 text-indigo-600" />
                Exportar Word (.doc)
              </button>

              <button
                onClick={() =>
                  openGoogleWorkspaceDriveExport(
                    `Redação ENEM - ${activeEssay.studentName}`,
                    activeEssay.essayText
                  )
                }
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar p/ Google Drive
              </button>

              <button
                onClick={() => {
                  setEditingDraft(JSON.parse(JSON.stringify(activeEssay)));
                  setIsEditingScores(!isEditingScores);
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
              >
                <Sliders className="w-3.5 h-3.5" />
                {isEditingScores ? 'Cancelar Ajustes' : 'Ajustar Notas'}
              </button>
            </div>
          </div>

          {/* Teacher Adjustment Banner */}
          {isEditingScores && editingDraft && (
            <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Modo de Revisão do Docente (Ajuste das Competências)
                </span>
                <span className="text-sm font-black text-amber-950">
                  Nova Nota Calculada: {editingDraft.totalScore} / 1000
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {editingDraft.competencies.map((comp) => (
                  <div key={comp.competencyNumber} className="bg-white p-3 rounded-xl border border-amber-200">
                    <span className="text-[10px] font-bold text-slate-500 block">
                      Comp. {comp.competencyNumber} ({comp.shortName})
                    </span>
                    <select
                      value={comp.score}
                      onChange={(e) =>
                        handleUpdateCompetencyScore(comp.competencyNumber, Number(e.target.value))
                      }
                      className="w-full mt-1.5 p-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-slate-50 text-slate-800"
                    >
                      <option value={0}>0 pts</option>
                      <option value={40}>40 pts</option>
                      <option value={80}>80 pts</option>
                      <option value={120}>120 pts</option>
                      <option value={160}>160 pts</option>
                      <option value={200}>200 pts</option>
                    </select>
                  </div>
                ))}
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveManualEdits}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 rounded-xl shadow-xs"
                >
                  Salvar Alterações do Docente
                </button>
              </div>
            </div>
          )}

          {/* Hero Score Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Espelho Oficial de Correção ENEM
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">{activeEssay.theme}</h2>
                <p className="text-xs text-slate-500">
                  Estudante: <strong>{activeEssay.studentName}</strong> &bull; Escola:{' '}
                  <strong>{activeEssay.schoolName || 'Escola Pública'}</strong> &bull; Matrícula:{' '}
                  {activeEssay.studentRegistration || 'N/A'}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center shrink-0 min-w-[160px]">
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Nota Total ENEM
                </span>
                <span className="text-4xl font-black text-emerald-900 mt-1 block">
                  {activeEssay.totalScore}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold">de 1000 pontos</span>
              </div>
            </div>

            {/* 5 Competencies Table / Grid */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Pontuação nas 5 Competências da Matriz ENEM / MEC
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {activeEssay.competencies.map((comp) => {
                  const percent = (comp.score / 200) * 100;
                  return (
                    <div
                      key={comp.competencyNumber}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between space-y-3"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="w-6 h-6 rounded-lg bg-emerald-800 text-white text-xs font-black flex items-center justify-center">
                            {comp.competencyNumber}
                          </span>
                          <span className="text-base font-black text-emerald-950">
                            {comp.score} <span className="text-[10px] text-slate-400">/200</span>
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 mt-2 line-clamp-1" title={comp.shortName}>
                          {comp.shortName}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2" title={comp.description}>
                          {comp.description}
                        </p>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-slate-200/60">
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-500 block truncate" title={comp.levelText}>
                          {comp.levelText}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Feedback & Deviations */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
              {/* Essay Text Display */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                  Texto da Redação do Estudante:
                </span>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-800 font-serif leading-relaxed whitespace-pre-line max-h-96 overflow-y-auto">
                  {activeEssay.essayText}
                </div>
              </div>

              {/* Competency 5: 5 Intervention Elements */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-teal-700" />
                      Proposta de Intervenção (Competência 5)
                    </span>
                    <span className="text-[11px] font-bold text-teal-950 bg-white px-2 py-0.5 rounded-lg border border-teal-200">
                      5 Elementos Obrigatórios
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-white border border-teal-100 flex items-start gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${activeEssay.interventionDetails.agent.present ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        1
                      </span>
                      <div>
                        <strong>Agente:</strong> {activeEssay.interventionDetails.agent.text || 'Não identificado com clareza.'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-teal-100 flex items-start gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${activeEssay.interventionDetails.action.present ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        2
                      </span>
                      <div>
                        <strong>Ação:</strong> {activeEssay.interventionDetails.action.text || 'Ação interventiva genérica.'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-teal-100 flex items-start gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${activeEssay.interventionDetails.means.present ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        3
                      </span>
                      <div>
                        <strong>Meio / Modo:</strong> {activeEssay.interventionDetails.means.text || 'Não especificado.'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-teal-100 flex items-start gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${activeEssay.interventionDetails.effect.present ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        4
                      </span>
                      <div>
                        <strong>Efeito / Finalidade:</strong> {activeEssay.interventionDetails.effect.text || 'Não especificado.'}
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white border border-teal-100 flex items-start gap-2">
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-[10px] font-bold ${activeEssay.interventionDetails.detailing.present ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        5
                      </span>
                      <div>
                        <strong>Detalhamento:</strong> {activeEssay.interventionDetails.detailing.text || 'Elemento de detalhamento ausente.'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Strengths & Improvements */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs space-y-1">
                    <strong className="text-[10px] uppercase text-emerald-800 block">Pontos Fortes:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-emerald-950 text-[11px]">
                      {activeEssay.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs space-y-1">
                    <strong className="text-[10px] uppercase text-amber-800 block">Orientações de Reescrita:</strong>
                    <ul className="list-disc list-inside space-y-0.5 text-amber-950 text-[11px]">
                      {activeEssay.improvements.map((imp, idx) => (
                        <li key={idx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* LIST OF ALL SUBMITTED ESSAYS */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-slate-900">
              Redações Cadastradas ({essays.length})
            </h2>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs"
            >
              <Plus className="w-4 h-4" /> Enviar Redação para Correção
            </button>
          </div>

          {essays.length === 0 ? (
            <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <PenTool className="w-8 h-8" />
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">
                  Nenhuma redação cadastrada ainda
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Submeta redações em formato de texto digitado ou envie fotos de folhas manuscritas para correção analítica detalhada com base nas 5 competências do MEC/ENEM.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
                >
                  <Plus className="w-4 h-4" /> Enviar Primeira Redação
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {essays.map((essay) => (
                <div
                  key={essay.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Padrão ENEM
                      </span>
                      <span className="text-lg font-black text-emerald-900">
                        {essay.totalScore} <span className="text-xs text-slate-400">/ 1000</span>
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-2">
                        {essay.theme}
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">
                        Aluno: <strong>{essay.studentName}</strong>
                      </p>
                      {essay.schoolName && (
                        <p className="text-[11px] text-slate-400 truncate">{essay.schoolName}</p>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-3 italic">
                      "{essay.essayText.slice(0, 150)}..."
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <button
                      onClick={() => onDeleteEssay(essay.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Excluir redação"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setActiveEssay(essay)}
                      className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                    >
                      Ver Espelho & Notas <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW ESSAY SUBMISSION MODAL */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-100">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-t-3xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 block mb-0.5">
                  Correção Analítica com IA
                </span>
                <h3 className="text-lg font-black">Submeter Redação para Avaliação ENEM</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {isLoadingAi ? (
                <div className="py-16 text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">
                    Avaliando Redação segundo os Critérios do MEC/INEP
                  </h4>
                  <p className="text-xs text-emerald-700 font-medium">{loadingStepText}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500">
                      Preencha os dados da escola e do aluno (ou use o botão de exemplo para testar):
                    </span>
                    <button
                      type="button"
                      onClick={handleFillDemo}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Preencher Exemplo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nome do(a) Aluno(a)
                      </label>
                      <input
                        type="text"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        placeholder="Ex: Larissa Duarte"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
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
                        placeholder="Ex: 2024-EM-01"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Escola Pública / Colégio
                      </label>
                      <input
                        type="text"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="Ex: E.E. Cecília Meireles"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Theme Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tema da Proposta de Redação <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={theme}
                      onChange={(e) => setTheme(e.target.value)}
                      placeholder="Ex: Desafios para a valorização de povos tradicionais..."
                      className="w-full px-3.5 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                    />
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {officialThemes.map((t, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setTheme(t)}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 truncate max-w-xs"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Format Selector: Text or Photo */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Formato da Submissão:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setSubmissionType('text')}
                        className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          submissionType === 'text'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-100'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-emerald-700" />
                        Digitar Texto da Redação
                      </button>

                      <button
                        type="button"
                        onClick={() => setSubmissionType('photo')}
                        className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                          submissionType === 'photo'
                            ? 'bg-emerald-50 border-emerald-600 text-emerald-950 ring-2 ring-emerald-100'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Camera className="w-4 h-4 text-emerald-700" />
                        Foto da Folha Manuscrita
                      </button>
                    </div>
                  </div>

                  {/* Submission Body */}
                  {submissionType === 'text' ? (
                    <div>
                      <div className="flex justify-between items-center mb-1 text-xs text-slate-500">
                        <span>Texto em prosa dissertativo-argumentativo:</span>
                        <span>
                          {essayText.trim().split(/\s+/).filter(Boolean).length} palavras &bull;{' '}
                          {essayText.split('\n').filter(Boolean).length} parágrafos
                        </span>
                      </div>
                      <textarea
                        rows={10}
                        value={essayText}
                        onChange={(e) => setEssayText(e.target.value)}
                        placeholder="Insira o texto da redação..."
                        className="w-full p-3.5 text-xs font-serif leading-relaxed rounded-2xl border border-slate-300 focus:border-emerald-500 outline-none"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center space-y-3 bg-emerald-50/30">
                      {imagePreview ? (
                        <div className="space-y-2">
                          <img
                            src={imagePreview}
                            alt="Pré-visualização da folha"
                            className="max-h-64 mx-auto rounded-xl shadow-xs"
                          />
                          <button
                            type="button"
                            onClick={() => setImagePreview(null)}
                            className="text-xs text-rose-600 hover:underline"
                          >
                            Trocar foto
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-emerald-600 mx-auto" />
                          <div className="text-xs text-slate-600">
                            <strong>Tire uma foto ou carregue a imagem</strong> da folha de redação manuscrita.
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              O Gemini transcreverá a caligrafia e corrigirá os critérios do ENEM.
                            </p>
                          </div>
                          <label className="inline-block px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl cursor-pointer shadow-xs">
                            Selecionar Imagem
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageFileChange}
                              className="hidden"
                            />
                          </label>
                        </>
                      )}
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsNewModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessCorrection}
                      className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-md shadow-emerald-200"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-300" />
                      Corrigir com IA (ENEM)
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
