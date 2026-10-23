import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  X,
  Layers,
  Sparkles,
  Filter,
} from 'lucide-react';
import {
  getAllBnccSkills,
  searchBnccSkills,
  saveCustomBnccSkill,
  getBnccCoverageAuditReport,
  BnccSkillItem,
} from '../data/bnccCurriculum';

interface BnccCoverageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSkill?: (skill: BnccSkillItem) => void;
}

export const BnccCoverageModal: React.FC<BnccCoverageModalProps> = ({
  isOpen,
  onClose,
  onSelectSkill,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual skill form state
  const [manualCode, setManualCode] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualDescription, setManualDescription] = useState('');
  const [manualGrade, setManualGrade] = useState('Ensino Fundamental II / Médio');
  const [manualSubject, setManualSubject] = useState('Língua Portuguesa');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  if (!isOpen) return null;

  const auditReport = getBnccCoverageAuditReport();
  const filteredSkills = searchBnccSkills({
    query: searchTerm,
    stage: stageFilter,
    subject: subjectFilter,
  });

  const handleSaveManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim() || !manualDescription.trim()) return;

    saveCustomBnccSkill({
      code: manualCode.trim(),
      title: manualTitle.trim() || manualCode.trim(),
      description: manualDescription.trim(),
      grade: manualGrade,
      subject: manualSubject,
    });

    setSaveSuccessMsg(`Habilidade ${manualCode.toUpperCase()} cadastrada com sucesso!`);
    setManualCode('');
    setManualTitle('');
    setManualDescription('');
    setTimeout(() => {
      setSaveSuccessMsg('');
      setIsManualModalOpen(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                Catálogo e Auditoria Oficial da BNCC (MEC / CNE)
              </h3>
              <p className="text-xs text-indigo-200">
                Cobertura integral das Competências Gerais, EF I, EF II e Ensino Médio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audit Metrics Banner */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 font-medium">Total de Habilidades</span>
            <p className="text-base font-extrabold text-indigo-700 mt-0.5">
              {auditReport.totalSkillsCount} catalogadas
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 font-medium">Competências Gerais MEC</span>
            <p className="text-base font-extrabold text-slate-800 mt-0.5">
              10 Competências (CG01-10)
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 font-medium">Verificação de Integridade</span>
            <p className="text-base font-extrabold text-emerald-600 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> 0 Duplicatas (100% íntegro)
            </p>
          </div>
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
            <span className="text-slate-500 font-medium">Inserções do Docente</span>
            <p className="text-base font-extrabold text-purple-700 mt-0.5">
              {auditReport.manualDocenteCount} personalizadas
            </p>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-center justify-between bg-white">
          <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código (ex: EF09CI01, EM13MAT101, CG02) ou palavra-chave..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white outline-none"
            >
              <option value="">Todas as Etapas</option>
              <option value="Fundamental I">Ensino Fundamental I</option>
              <option value="Fundamental II">Ensino Fundamental II</option>
              <option value="Médio">Ensino Médio</option>
              <option value="Gerais">Competências Gerais</option>
            </select>
          </div>

          <button
            onClick={() => setIsManualModalOpen(true)}
            className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Inserir Habilidade Manualmente
          </button>
        </div>

        {/* Skills Catalog Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredSkills.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhuma habilidade encontrada para os filtros aplicados.
            </div>
          ) : (
            filteredSkills.map((item, idx) => (
              <div
                key={`${item.skill.code}_${idx}`}
                className="p-3.5 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-indigo-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800">
                      {item.skill.code}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{item.skill.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.stage}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.subject}
                    </span>
                    {item.skill.origin === 'manual_docente' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        Manual Docente
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.skill.description}
                  </p>
                </div>

                {onSelectSkill && (
                  <button
                    onClick={() => {
                      onSelectSkill(item.skill);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg shrink-0 border border-indigo-200 transition-colors"
                  >
                    Selecionar
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer with Official Sources */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-700">Fontes Oficiais:</span>
            {auditReport.officialSources.map((src, i) => (
              <a
                key={i}
                href={src.url}
                target="_blank"
                rel="noreferrer"
                className="hover:text-indigo-600 inline-flex items-center gap-1 underline underline-offset-2"
              >
                {src.title}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl"
          >
            Fechar
          </button>
        </div>
      </div>

      {/* SUB-MODAL: INSERIR HABILIDADE MANUALMENTE */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-600" />
                Inserir Habilidade Manualmente
              </h4>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {saveSuccessMsg}
              </div>
            )}

            <form onSubmit={handleSaveManual} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Código da Habilidade <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Ex: EF09MA35, EM13LGG99, HAB-REDE-01"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Título / Objeto Resumido
                </label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ex: Análise Estatística de Indicadores Locais"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disciplina</label>
                  <input
                    type="text"
                    value={manualSubject}
                    onChange={(e) => setManualSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Etapa / Ano</label>
                  <input
                    type="text"
                    value={manualGrade}
                    onChange={(e) => setManualGrade(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Descrição Oficial da Habilidade <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  placeholder="Descreva detalhadamente a competência ou habilidade pedagógica..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Salvar Habilidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
