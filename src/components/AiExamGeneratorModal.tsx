import React, { useState } from 'react';
import { Sparkles, Loader2, BookOpen, AlertCircle, CheckCircle2, X, Award } from 'lucide-react';
import { generateExamWithAI, GenerateExamParams } from '../services/geminiService';
import { Exam } from '../types/exam';
import { BNCC_CURRICULUM } from '../data/bnccCurriculum';

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
  const [subject, setSubject] = useState('História');
  const [topic, setTopic] = useState('A Era Vargas e Direitos dos Trabalhadores');
  const [gradeLevel, setGradeLevel] = useState('9º Ano');
  const [difficulty, setDifficulty] = useState<'fácil' | 'médio' | 'difícil'>('médio');
  const [numObjective, setNumObjective] = useState(3);
  const [numDissertative, setNumDissertative] = useState(2);
  const [extraInstructions, setExtraInstructions] = useState('');
  const [adaptForInclusion, setAdaptForInclusion] = useState(false);
  const [targetAudience, setTargetAudience] = useState<'tea' | 'deficiencia_intelectual'>('tea');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickTopics = [
    { sub: 'História', top: 'Revolução Francesa e Iluminismo', level: 'Ensino Médio - 2º Ano' },
    { sub: 'Biologia', top: 'Genética Mendeliana e Biotecnologia', level: 'Ensino Médio - 3º Ano' },
    { sub: 'Física', top: 'Leis de Newton e Dinâmica de Forças', level: 'Ensino Médio - 1º Ano' },
    { sub: 'Língua Portuguesa', top: 'Modernismo Brasileiro e Análise Literária', level: 'Ensino Médio - 3º Ano' },
    { sub: 'Ciência da Computação', top: 'Algoritmos de Ordenação e Complexidade Big-O', level: 'Ensino Superior' },
    { sub: 'Direito Constitucional', top: 'Direitos e Garantias Fundamentais (Art. 5º)', level: 'Graduação / Concursos' },
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) {
      setError('Por favor preencha a disciplina e o tema da avaliação.');
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
      if (adaptForInclusion) {
        combinedInstructions += `\nADAPTAÇÃO INCLUSIVA AEE OBRIGATÓRIA: Esta prova deve ser adaptada para estudantes com ${
          targetAudience === 'tea'
            ? 'Transtorno do Espectro Autista (TEA): enunciados estritamente literais, sem metáforas ou duplos sentidos, pistas visuais claras em cada questão'
            : 'Deficiência Intelectual (DI): linguagem acessível, exatamente 3 alternativas claras (A, B, C), pistas cognitivas estruturadas'
        }. Inclua pistas visuais facilitadoras.`;
      }

      const params: GenerateExamParams = {
        subject: subject.trim(),
        topic: topic.trim(),
        gradeLevel,
        difficulty,
        numObjective: Number(numObjective),
        numDissertative: Number(numDissertative),
        extraInstructions: combinedInstructions || undefined,
      };

      const generated = await generateExamWithAI(params);
      if (adaptForInclusion) {
        generated.isAdaptedForInclusion = true;
        generated.adaptationType = targetAudience;
        generated.title = `${generated.title || 'Avaliação'} (Adaptada - AEE)`;
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
    'Estruturando matriz de habilidades e enunciados contextualizados...',
    'Elaborando alternativas objetivas e distratores plausíveis...',
    'Definindo respostas modelo e rubricas analíticas para as dissertativas...',
    'Finalizando montagem da prova...',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 via-purple-50 to-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Gerador Inteligente de Provas</h3>
              <p className="text-xs text-slate-500">
                Gere questões objetivas e dissertativas com rubricas e gabaritos em segundos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
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
                <p className="font-semibold">Não foi possível gerar a avaliação</p>
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
                Criando sua prova com Inteligência Artificial
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
              <p className="text-xs text-slate-400 mt-4">
                Elaborando questões com alternativas contextualizadas e rubricas pedagógicas completas...
              </p>
            </div>
          ) : (
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Sugestões Rápidas */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 block">
                  Temas e Disciplinas Recomendados
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {quickTopics.map((item, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSubject(item.sub);
                        setTopic(item.top);
                        setGradeLevel(item.level);
                      }}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 transition-colors text-left font-medium"
                    >
                      {item.sub}: <span className="font-normal">{item.top}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Ano / Série BNCC <span className="text-rose-500">*</span>
                    </label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) setGradeLevel(e.target.value);
                      }}
                      className="text-[10px] text-indigo-700 font-bold bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5"
                    >
                      <option value="">Atalho BNCC...</option>
                      {BNCC_CURRICULUM.map((b, i) => (
                        <option key={i} value={b.grade}>
                          {b.grade}
                        </option>
                      ))}
                    </select>
                  </div>
                  <input
                    type="text"
                    required
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    placeholder="Ex: 9º Ano, 3ª Série..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Disciplina / Componente <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Língua Portuguesa, Matemática, História..."
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Conteúdo / Tema Principal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Ex: Termodinâmica e Ciclo de Carnot, Revolução Industrial..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dificuldade
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                  >
                    <option value="fácil">Fácil (Conceitual)</option>
                    <option value="médio">Médio (Padrão ENEM)</option>
                    <option value="difícil">Difícil (Aprofundado)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Questões Objetivas
                  </label>
                  <select
                    value={numObjective}
                    onChange={(e) => setNumObjective(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                  >
                    <option value={2}>2 questões</option>
                    <option value={3}>3 questões</option>
                    <option value={4}>4 questões</option>
                    <option value={5}>5 questões</option>
                    <option value={6}>6 questões</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Questões Dissertativas
                  </label>
                  <select
                    value={numDissertative}
                    onChange={(e) => setNumDissertative(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
                  >
                    <option value={1}>1 questão</option>
                    <option value={2}>2 questões</option>
                    <option value={3}>3 questões</option>
                    <option value={4}>4 questões</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Instruções ou Foco Específico (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  placeholder="Ex: Focar em estudos de caso reais e análise de gráficos; priorizar aplicações práticas no Brasil..."
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                />
              </div>

              {/* Inclusive Education Toggle */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-2">
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
                      Gerar como Prova Adaptada (Educação Inclusiva / AEE)
                    </span>
                    <span className="text-[11px] text-emerald-800 block">
                      Enunciados literais e objetivos, eliminação de metáforas, pistas visuais e redução de distratores
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

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Gerar Prova com IA
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
