import React, { useState } from 'react';
import {
  Sparkles,
  Loader2,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  X,
  Award,
  Layers,
  Search,
  Plus,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { generateExamWithAI, GenerateExamParams } from '../services/geminiService';
import { Exam } from '../types/exam';
import {
  BNCC_CURRICULUM,
  getBnccSkillsForGradeAndSubject,
  BnccSkillItem,
} from '../data/bnccCurriculum';
import { BnccCoverageModal } from './BnccCoverageModal';

interface AiExamGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExamGenerated: (exam: Partial<Exam>) => void;
}

export const AiExamGeneratorModal: React.FC<AiExamGeneratorModalProps> = ({
  isOpen,
  onClose,
  onExamGenerated,
}) => {
  // A. Identificação
  const [title, setTitle] = useState('');
  const [institution, setInstitution] = useState('Escola Estadual');
  const [subject, setSubject] = useState('História');
  const [teacherName, setTeacherName] = useState('Prof. Titular');
  const [gradeLevel, setGradeLevel] = useState('9º Ano');
  const [className, setClassName] = useState('Turma A');
  const [bimester, setBimester] = useState('1º Bimestre');

  // B. Conteúdo e Alinhamento BNCC
  const [topic, setTopic] = useState('A Era Vargas e Direitos dos Trabalhadores');
  const [selectedBnccSkills, setSelectedBnccSkills] = useState<BnccSkillItem[]>([]);
  const [isBnccModalOpen, setIsBnccModalOpen] = useState(false);

  // C. Estrutura da Avaliação
  const [formatMode, setFormatMode] = useState<'mixed' | 'objective_only' | 'dissertative_only'>('mixed');
  const [numObjective, setNumObjective] = useState(4);
  const [numDissertative, setNumDissertative] = useState(2);
  const [alternativesCount, setAlternativesCount] = useState<4 | 5>(4);
  const [targetTotalScore, setTargetTotalScore] = useState(10.0);

  // D. Complexidade Cognitiva
  const [cognitiveLevel, setCognitiveLevel] = useState<'mista' | 'basica' | 'intermediaria' | 'avancada'>('mista');
  const [difficulty, setDifficulty] = useState<'fácil' | 'médio' | 'difícil'>('médio');
  const [extraInstructions, setExtraInstructions] = useState('');

  // Inclusão AEE / TEA
  const [adaptForInclusion, setAdaptForInclusion] = useState(false);
  const [targetAudience, setTargetAudience] = useState<'tea' | 'deficiencia_intelectual'>('tea');

  // Loading & State
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickTopics = [
    { sub: 'História', top: 'Revolução Francesa e Iluminismo', level: 'Ensino Médio - 2º Ano' },
    { sub: 'Biologia', top: 'Genética Mendeliana e Biotecnologia', level: 'Ensino Médio - 3º Ano' },
    { sub: 'Física', top: 'Leis de Newton e Dinâmica de Forças', level: 'Ensino Médio - 1º Ano' },
    { sub: 'Língua Portuguesa', top: 'Modernismo Brasileiro e Análise Literária', level: 'Ensino Médio - 3º Ano' },
    { sub: 'Matemática', top: 'Funções Exponenciais e Matemática Financeira', level: 'Ensino Médio - 1º Ano' },
    { sub: 'Química', top: 'Ligações Químicas e Propriedades da Matéria', level: 'Ensino Médio - 1º Ano' },
  ];

  // Dynamic suggested skills based on subject & grade
  const suggestedSkills = getBnccSkillsForGradeAndSubject(gradeLevel, subject);

  const handleToggleSkill = (skill: BnccSkillItem) => {
    const exists = selectedBnccSkills.some((s) => s.code === skill.code);
    if (exists) {
      setSelectedBnccSkills(selectedBnccSkills.filter((s) => s.code !== skill.code));
    } else {
      setSelectedBnccSkills([...selectedBnccSkills, skill]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) {
      setError('Por favor preencha a disciplina e o tema da avaliação.');
      return;
    }

    const objCount = formatMode === 'dissertative_only' ? 0 : Number(numObjective);
    const dissCount = formatMode === 'objective_only' ? 0 : Number(numDissertative);

    if (objCount === 0 && dissCount === 0) {
      setError('A prova deve conter pelo menos uma questão (objetiva ou dissertativa).');
      return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingStep(1);

    const stepInterval = setInterval(() => {
      setLoadingStep((prev) => (prev < 4 ? prev + 1 : prev));
    }, 2400);

    try {
      let combinedInstructions = extraInstructions.trim();
      combinedInstructions += `\nESTRUTURA CONFIGURADA PELO PROFESSOR:`;
      combinedInstructions += `\n- Turma: ${className} | Bimestre: ${bimester} | Instituição: ${institution}`;
      combinedInstructions += `\n- Alternativas por questão objetiva: ${alternativesCount} (A a ${alternativesCount === 4 ? 'D' : 'E'})`;
      combinedInstructions += `\n- Perfil Cognitivo: ${cognitiveLevel.toUpperCase()} (Básica: memorização/identificação; Intermediária: aplicação/compreensão; Avançada: análise/síntese).`;
      combinedInstructions += `\n- Pontuação Alvo Total: ${targetTotalScore} pontos.`;

      if (selectedBnccSkills.length > 0) {
        combinedInstructions += `\nHABILIDADES DA BNCC OBRIGATÓRIAS:\n${selectedBnccSkills
          .map((s) => `- ${s.code}: ${s.description}`)
          .join('\n')}`;
      }

      if (adaptForInclusion) {
        combinedInstructions += `\nADAPTAÇÃO INCLUSIVA AEE OBRIGATÓRIA: Esta prova deve ser adaptada para estudantes com ${
          targetAudience === 'tea'
            ? 'Transtorno do Espectro Autista (TEA): enunciados estritamente literais, sem metáforas, pistas visuais claras em cada questão'
            : 'Deficiência Intelectual (DI): linguagem acessível, exatamente 3 alternativas claras (A, B, C), pistas cognitivas estruturadas'
        }.`;
      }

      const params: GenerateExamParams = {
        subject: subject.trim(),
        topic: topic.trim(),
        gradeLevel,
        difficulty,
        numObjective: objCount,
        numDissertative: dissCount,
        extraInstructions: combinedInstructions || undefined,
      };

      const generated = await generateExamWithAI(params);

      // Add identification parameters
      generated.institution = institution;
      generated.teacherName = teacherName;
      generated.className = className;
      generated.bimester = bimester;
      if (title.trim()) generated.title = title.trim();

      if (adaptForInclusion) {
        generated.isAdaptedForInclusion = true;
        generated.adaptationType = targetAudience;
        generated.title = `${generated.title || 'Avaliação'} (Adaptada - AEE)`;
      }

      if (selectedBnccSkills.length > 0) {
        generated.bnccSkillsList = selectedBnccSkills.map((s) => ({
          code: s.code,
          description: s.description,
          origin: s.origin || 'oficial_mec',
        }));
      }

      clearInterval(stepInterval);
      onExamGenerated(generated);
      onClose();
    } catch (err: any) {
      clearInterval(stepInterval);
      console.error(err);
      setError(err.message || 'Ocorreu um erro ao gerar a avaliação. Tente novamente.');
    } finally {
      setIsLoading(false);
      setLoadingStep(0);
    }
  };

  const loadingMessages = [
    'Conectando ao modelo pedagógico Gemini...',
    'Estruturando matriz de habilidades BNCC e enunciados contextualizados...',
    'Elaborando alternativas com distratores plausíveis e justificativas...',
    'Definindo respostas modelo e rubricas analíticas...',
    'Realizando validação prévia de pontuação e estrutura...',
  ];

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[92vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300 shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Módulo 3 &bull; Criação Configurável de Provas</h3>
                <p className="text-xs text-indigo-200">
                  Formulário estruturado completo com alinhamento oficial à BNCC
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-6">
            {error && (
              <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                <div>
                  <p className="font-semibold">Inconsistência identificada</p>
                  <p className="text-xs mt-0.5">{error}</p>
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="py-12 px-4 flex flex-col items-center justify-center text-center">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-50 border-2 border-indigo-200 flex items-center justify-center text-indigo-600 shadow-inner">
                    <Sparkles className="w-10 h-10 animate-pulse text-indigo-600" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-full shadow-lg">
                    <Loader2 className="w-4 h-4 animate-spin" />
                  </div>
                </div>
                <h4 className="text-base font-semibold text-slate-800 mb-1">
                  Gerando Avaliação Estruturada BNCC
                </h4>
                <p className="text-sm text-indigo-600 font-medium h-6 transition-all duration-300">
                  {loadingMessages[loadingStep] || loadingMessages[0]}
                </p>
                <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(95, (loadingStep + 1) * 22)}%` }}
                  />
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-6">
                {/* SEÇÃO A: IDENTIFICAÇÃO DO INSTRUMENTO */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5" />
                    Seção A &bull; Identificação do Instrumento Avaliativo
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Título da Prova
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Ex: Avaliação Diagnóstica do 1º Bimestre"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Instituição de Ensino
                      </label>
                      <input
                        type="text"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        placeholder="Ex: Colégio Estadual Tiradentes"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Disciplina
                      </label>
                      <input
                        type="text"
                        required
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Série / Ano
                      </label>
                      <input
                        type="text"
                        required
                        value={gradeLevel}
                        onChange={(e) => setGradeLevel(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Turma
                      </label>
                      <input
                        type="text"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Bimestre
                      </label>
                      <select
                        value={bimester}
                        onChange={(e) => setBimester(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
                      >
                        <option value="1º Bimestre">1º Bimestre</option>
                        <option value="2º Bimestre">2º Bimestre</option>
                        <option value="3º Bimestre">3º Bimestre</option>
                        <option value="4º Bimestre">4º Bimestre</option>
                        <option value="Exame Final">Exame Final</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO B: CONTEÚDO E ALINHAMENTO BNCC */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      Seção B &bull; Conteúdo & Alinhamento às Habilidades da BNCC
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsBnccModalOpen(true)}
                      className="text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" />
                      Abrir Catálogo / Inserir Manual
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Conteúdo / Tema Principal da Avaliação <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Ex: A Era Vargas e a Legislação Trabalhista no Brasil"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>

                  {/* Selected BNCC Skills Chips */}
                  {selectedBnccSkills.length > 0 && (
                    <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-1.5">
                      <span className="text-[11px] font-bold text-indigo-950 block">
                        Habilidades BNCC Selecionadas ({selectedBnccSkills.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBnccSkills.map((s) => (
                          <span
                            key={s.code}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-white border border-indigo-300 text-indigo-900 font-semibold"
                          >
                            <span className="font-mono text-indigo-700">{s.code}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleSkill(s)}
                              className="text-slate-400 hover:text-rose-500 ml-1"
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggested skills from curriculum */}
                  {suggestedSkills.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 block">
                        Habilidades sugeridas para {gradeLevel} &bull; {subject} (clique para incluir):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {suggestedSkills.slice(0, 4).map((sk) => {
                          const isSelected = selectedBnccSkills.some((s) => s.code === sk.code);
                          return (
                            <button
                              key={sk.code}
                              type="button"
                              onClick={() => handleToggleSkill(sk)}
                              className={`text-[11px] px-2.5 py-1 rounded-lg border text-left transition-colors flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 font-semibold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-indigo-300'
                              }`}
                            >
                              <span className="font-mono font-bold">{sk.code}</span>
                              <span className="truncate max-w-[180px]">{sk.title}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* SEÇÃO C: ESTRUTURA E FORMATO */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    Seção C &bull; Estrutura da Avaliação e Pontuação
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Modo da Prova
                      </label>
                      <select
                        value={formatMode}
                        onChange={(e) => setFormatMode(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white font-medium"
                      >
                        <option value="mixed">Mista (Objetivas + Dissertativas)</option>
                        <option value="objective_only">Apenas Objetivas</option>
                        <option value="dissertative_only">Apenas Dissertativas</option>
                      </select>
                    </div>

                    {formatMode !== 'dissertative_only' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Questões Objetivas
                        </label>
                        <select
                          value={numObjective}
                          onChange={(e) => setNumObjective(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
                        >
                          <option value={2}>2 questões</option>
                          <option value={3}>3 questões</option>
                          <option value={4}>4 questões</option>
                          <option value={5}>5 questões</option>
                          <option value={6}>6 questões</option>
                          <option value={8}>8 questões</option>
                          <option value={10}>10 questões</option>
                        </select>
                      </div>
                    )}

                    {formatMode !== 'objective_only' && (
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Questões Dissertativas
                        </label>
                        <select
                          value={numDissertative}
                          onChange={(e) => setNumDissertative(Number(e.target.value))}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
                        >
                          <option value={1}>1 questão</option>
                          <option value={2}>2 questões</option>
                          <option value={3}>3 questões</option>
                          <option value={4}>4 questões</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Alternativas
                      </label>
                      <select
                        value={alternativesCount}
                        onChange={(e) => setAlternativesCount(Number(e.target.value) as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
                      >
                        <option value={4}>4 alternativas (A, B, C, D)</option>
                        <option value={5}>5 alternativas (A, B, C, D, E)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SEÇÃO D: COMPLEXIDADE COGNITIVA */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    Seção D &bull; Complexidade Cognitiva e Dificuldade
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Perfil Cognitivo (Taxonomia)
                      </label>
                      <select
                        value={cognitiveLevel}
                        onChange={(e) => setCognitiveLevel(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white font-medium"
                      >
                        <option value="mista">Mista Balanceada (Recomendado)</option>
                        <option value="basica">Básica (Identificação e Memorização)</option>
                        <option value="intermediaria">Intermediária (Compreensão e Aplicação)</option>
                        <option value="avancada">Avançada (Análise Crítica e Síntese)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Nível de Rigor
                      </label>
                      <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 outline-none bg-white"
                      >
                        <option value="fácil">Formativo / Fácil</option>
                        <option value="médio">Padrão Regular / Médio</option>
                        <option value="difícil">Aprofundado / Vestibulares</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* INCLUSÃO AEE / TEA */}
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={adaptForInclusion}
                      onChange={(e) => setAdaptForInclusion(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-emerald-600" />
                        Gerar como Prova Adaptada (Educação Especial Inclusiva / AEE)
                      </span>
                      <span className="text-[11px] text-emerald-800 block">
                        Enunciados literais e diretos, sem ambiguidades, redução de distratores e inclusão de pistas cognitivas
                      </span>
                    </div>
                  </label>

                  {adaptForInclusion && (
                    <div className="pl-6 pt-1 flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="aiTargetAudience"
                          checked={targetAudience === 'tea'}
                          onChange={() => setTargetAudience('tea')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-slate-800">Foco TEA (Autismo)</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="radio"
                          name="aiTargetAudience"
                          checked={targetAudience === 'deficiencia_intelectual'}
                          onChange={() => setTargetAudience('deficiencia_intelectual')}
                          className="text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="font-semibold text-slate-800">Foco Deficiência Intelectual</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Gerar Avaliação Completa
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* BNCC Exploration & Manual Insertion Modal */}
      <BnccCoverageModal
        isOpen={isBnccModalOpen}
        onClose={() => setIsBnccModalOpen(false)}
        onSelectSkill={(skill) => handleToggleSkill(skill)}
      />
    </>
  );
};
