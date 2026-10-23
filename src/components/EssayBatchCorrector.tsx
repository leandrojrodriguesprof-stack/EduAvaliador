import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  Play,
  RotateCcw,
  Trash2,
  Eye,
  Edit3,
  FileDown,
  X,
  FileText,
  Layers,
  ArrowRight,
  ShieldCheck,
  Award,
  ChevronDown,
  ChevronUp,
  Plus,
  HelpCircle,
} from 'lucide-react';
import {
  EnemEssaySubmission,
  EnemCompetency,
  StudentRecord,
  ClassGroup,
  RubricCriterion,
} from '../types/exam';
import { transcribeEssayPhoto, gradeEnemEssay } from '../services/geminiService';
import * as XLSX from 'xlsx';

export interface BatchItem {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  previewUrl: string;
  // Student association
  studentName: string;
  studentRegistration?: string;
  isManualIdRequired: boolean;
  confidenceScore: number;
  // Page grouping
  pageNumber: number;
  totalPages: number;
  isMirrorSheet: boolean;
  // Status and data
  transcription: string;
  status: 'idle' | 'transcribing' | 'transcribed' | 'grading' | 'graded' | 'error';
  errorMessage?: string;
  readability: string;
  // Result
  essayResult?: EnemEssaySubmission;
}

interface EssayBatchCorrectorProps {
  onBatchGraded: (essays: EnemEssaySubmission[]) => void;
  onBackToMenu: () => void;
}

export const EssayBatchCorrector: React.FC<EssayBatchCorrectorProps> = ({
  onBatchGraded,
  onBackToMenu,
}) => {
  // 1. Batch Configuration State
  const [className, setClassName] = useState('3ª Série A - Ensino Médio');
  const [subject, setSubject] = useState('Língua Portuguesa / Redação');
  const [teacherName, setTeacherName] = useState('Prof. Coordenador');
  const [theme, setTheme] = useState(
    'Desafios para a valorização de comunidades e povos tradicionais no Brasil'
  );
  const [correctionType, setCorrectionType] = useState<'enem' | 'rubric'>('enem');
  const [activityDate, setActivityDate] = useState(new Date().toISOString().split('T')[0]);
  const [concurrencyLimit, setConcurrencyLimit] = useState(2);

  // Student roster for selected turma
  const [turmaStudents, setTurmaStudents] = useState<StudentRecord[]>([
    { id: '1', name: 'Ana Clara Souza', registration: '2024-001' },
    { id: '2', name: 'Beatriz Lima Mendes', registration: '2024-002' },
    { id: '3', name: 'Carlos Eduardo Santos', registration: '2024-003' },
    { id: '4', name: 'Daniel Ferreira Rocha', registration: '2024-004' },
    { id: '5', name: 'Eduarda Vasconcelos', registration: '2024-005' },
    { id: '6', name: 'Felipe Augusto Ribeiro', registration: '2024-006' },
    { id: '7', name: 'Gabriela Morales', registration: '2024-007' },
    { id: '8', name: 'Henrique Alves Costa', registration: '2024-008' },
  ]);
  const [isAddingStudentOpen, setIsAddingStudentOpen] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentReg, setNewStudentReg] = useState('');

  // 2. Batch Images State
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentlyProcessingId, setCurrentlyProcessingId] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<'config' | 'upload' | 'review' | 'results'>('upload');

  // Inspection modal
  const [inspectingItem, setInspectingItem] = useState<BatchItem | null>(null);
  const [editingTranscription, setEditingTranscription] = useState('');
  const [editingStudentName, setEditingStudentName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Quick preset themes
  const officialThemes = [
    'Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil',
    'Desafios para a valorização de comunidades e povos tradicionais no Brasil',
    'Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil',
    'O estigma associado às doenças mentais na sociedade brasileira',
    'Democratização do acesso ao cinema no Brasil',
    'Manipulação do comportamento do usuário pelo controle de dados na internet',
  ];

  // Add new student to roster
  const handleAddStudent = () => {
    if (!newStudentName.trim()) return;
    const newStud: StudentRecord = {
      id: `stud_${Date.now()}`,
      name: newStudentName.trim(),
      registration: newStudentReg.trim() || undefined,
    };
    setTurmaStudents([...turmaStudents, newStud]);
    setNewStudentName('');
    setNewStudentReg('');
    setIsAddingStudentOpen(false);
  };

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle Multiple File Upload (File Picker or Drag & Drop)
  const handleFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;

    const newItems: BatchItem[] = [];
    const validExtensions = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!validExtensions.includes(file.type)) {
        continue;
      }

      // Check duplicates by filename and size
      const isDuplicate = items.some(
        (it) => it.fileName === file.name && it.fileSize === file.size
      );
      if (isDuplicate) continue;

      const previewUrl = await fileToBase64(file);

      newItems.push({
        id: `batch_item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}_${i}`,
        file,
        fileName: file.name,
        fileSize: file.size,
        previewUrl,
        studentName: '',
        isManualIdRequired: true, // Requires verification or auto-detection
        confidenceScore: 0,
        pageNumber: 1,
        totalPages: 1,
        isMirrorSheet: false,
        transcription: '',
        status: 'idle',
        readability: 'moderada',
      });
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems]);
      setActiveStep('review');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFilesSelected(e.dataTransfer.files);
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[targetIdx];
    reordered[targetIdx] = temp;
    setItems(reordered);
  };

  // 3. Step 1: Transcribe & Identify Student with Concurrency
  const handleRunTranscriptionBatch = async () => {
    setIsProcessing(true);

    const pending = items.filter((it) => it.status === 'idle' || it.status === 'error');
    const updated = [...items];

    // Process with controlled concurrency
    for (let i = 0; i < pending.length; i += concurrencyLimit) {
      const chunk = pending.slice(i, i + concurrencyLimit);

      await Promise.all(
        chunk.map(async (item) => {
          setCurrentlyProcessingId(item.id);
          const idx = updated.findIndex((it) => it.id === item.id);
          if (idx === -1) return;

          updated[idx].status = 'transcribing';
          setItems([...updated]);

          try {
            const ocrRes = await transcribeEssayPhoto({
              imageBase64: item.previewUrl,
              knownStudents: turmaStudents,
              theme,
            });

            // Match student name against known roster
            let matchedName = ocrRes.detectedStudentName || '';
            let matchedReg = ocrRes.detectedRegistration || '';
            let requiresManual = !ocrRes.isConfident || !matchedName;

            if (matchedName) {
              const exact = turmaStudents.find(
                (s) => s.name.toLowerCase() === matchedName.toLowerCase()
              );
              if (exact) {
                matchedName = exact.name;
                matchedReg = exact.registration || matchedReg;
                requiresManual = false;
              }
            }

            updated[idx] = {
              ...updated[idx],
              studentName: matchedName || 'Aguardando identificação manual',
              studentRegistration: matchedReg,
              isManualIdRequired: requiresManual,
              confidenceScore: ocrRes.confidenceScore || (requiresManual ? 0.3 : 0.85),
              transcription: ocrRes.transcription || 'Texto manuscrito identificado.',
              readability: ocrRes.readability || 'boa',
              isMirrorSheet: Boolean(ocrRes.isMirrorSheetDetected),
              status: 'transcribed',
            };
          } catch (err: any) {
            console.error('Falha no OCR do item:', err);
            updated[idx].status = 'error';
            updated[idx].errorMessage = err.message || 'Erro no reconhecimento da foto';
          }

          setItems([...updated]);
        })
      );
    }

    setIsProcessing(false);
    setCurrentlyProcessingId(null);
  };

  // 4. Step 2: Grade All Transcribed Essays
  const handleRunGradingBatch = async () => {
    setIsProcessing(true);

    const readyItems = items.filter(
      (it) => it.status === 'transcribed' && it.transcription && !it.isManualIdRequired
    );
    const updated = [...items];
    const newlyGradedEssays: EnemEssaySubmission[] = [];

    for (let i = 0; i < readyItems.length; i += concurrencyLimit) {
      const chunk = readyItems.slice(i, i + concurrencyLimit);

      await Promise.all(
        chunk.map(async (item) => {
          setCurrentlyProcessingId(item.id);
          const idx = updated.findIndex((it) => it.id === item.id);
          if (idx === -1) return;

          updated[idx].status = 'grading';
          setItems([...updated]);

          try {
            const gradingRes = await gradeEnemEssay({
              theme,
              essayText: item.transcription,
              studentName: item.studentName,
            });

            const essaySub: EnemEssaySubmission = {
              id: `essay_batch_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              studentName: item.studentName,
              studentRegistration: item.studentRegistration,
              className,
              theme,
              submissionType: 'batch_photo',
              imagePreview: item.previewUrl,
              essayText: gradingRes.transcription || item.transcription,
              competencies: gradingRes.competencies || [],
              totalScore: gradingRes.totalScore || 0,
              interventionDetails: gradingRes.interventionDetails || {
                agent: { present: false },
                action: { present: false },
                means: { present: false },
                effect: { present: false },
                detailing: { present: false },
              },
              summaryPedagogical:
                gradingRes.summaryPedagogical || 'Correção analítica realizada com sucesso.',
              strengths: gradingRes.strengths || [],
              improvements: gradingRes.improvements || [],
              status: 'graded',
              createdAt: new Date().toISOString(),
              gradedAt: new Date().toISOString(),
            };

            updated[idx].status = 'graded';
            updated[idx].essayResult = essaySub;
            newlyGradedEssays.push(essaySub);
          } catch (err: any) {
            console.error('Falha na correção do item:', err);
            updated[idx].status = 'error';
            updated[idx].errorMessage = err.message || 'Erro ao calcular notas';
          }

          setItems([...updated]);
        })
      );
    }

    setIsProcessing(false);
    setCurrentlyProcessingId(null);

    if (newlyGradedEssays.length > 0) {
      onBatchGraded(newlyGradedEssays);
    }

    setActiveStep('results');
  };

  // Inspect and edit item
  const openInspectModal = (item: BatchItem) => {
    setInspectingItem(item);
    setEditingTranscription(item.transcription);
    setEditingStudentName(item.studentName);
  };

  const handleSaveInspectChanges = () => {
    if (!inspectingItem) return;
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === inspectingItem.id) {
          const isManualFixed =
            editingStudentName.trim() &&
            editingStudentName !== 'Aguardando identificação manual';
          return {
            ...it,
            studentName: editingStudentName.trim(),
            isManualIdRequired: !isManualFixed,
            transcription: editingTranscription.trim(),
            status: it.status === 'idle' ? 'transcribed' : it.status,
          };
        }
        return it;
      })
    );
    setInspectingItem(null);
  };

  // Export batch results to Excel
  const handleExportExcel = () => {
    const data = items.map((it) => ({
      Estudante: it.studentName,
      Matrícula: it.studentRegistration || 'S/N',
      Turma: className,
      Tema: theme,
      Nota_Final: it.essayResult?.totalScore ?? 'Pendente',
      Comp1_Norma_Culta: it.essayResult?.competencies?.[0]?.score ?? '',
      Comp2_Tema_Repertorio: it.essayResult?.competencies?.[1]?.score ?? '',
      Comp3_Projeto_Texto: it.essayResult?.competencies?.[2]?.score ?? '',
      Comp4_Coesao: it.essayResult?.competencies?.[3]?.score ?? '',
      Comp5_Intervencao: it.essayResult?.competencies?.[4]?.score ?? '',
      Status: it.status,
      Arquivo: it.fileName,
      Data: activityDate,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Redações em Lote');
    XLSX.writeFile(wb, `Lote_Redacoes_${className.replace(/\s+/g, '_')}_${activityDate}.xlsx`);
  };

  // Metrics summary
  const totalCount = items.length;
  const gradedCount = items.filter((it) => it.status === 'graded').length;
  const awaitingIdCount = items.filter((it) => it.isManualIdRequired).length;
  const errorCount = items.filter((it) => it.status === 'error').length;
  const transcribedCount = items.filter(
    (it) => it.status === 'transcribed' && !it.isManualIdRequired
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/5 transform skew-x-12 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 backdrop-blur-sm border border-white/10">
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Módulo 1 &bull; Correção em Lote por Fotografias</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Lote de Redações Manuscritas
            </h1>
            <p className="text-sm text-indigo-200 max-w-2xl">
              Digitalize, transcreva e avalie produções textuais de turmas inteiras com
              conferência docente e conformidade às diretrizes do MEC e INEP.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMenu}
              className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            >
              Voltar ao Início
            </button>
            <button
              onClick={() => setActiveStep('config')}
              className="px-4 py-2 text-sm font-semibold text-indigo-900 bg-white hover:bg-slate-100 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Configurar Turma ({turmaStudents.length} alunos)
            </button>
          </div>
        </div>

        {/* Steps Navigation Bar */}
        <div className="grid grid-cols-4 gap-2 mt-8 pt-6 border-t border-white/10 text-xs font-semibold">
          <button
            onClick={() => setActiveStep('config')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeStep === 'config'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>1. Turma e Tema</span>
          </button>
          <button
            onClick={() => setActiveStep('upload')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeStep === 'upload'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>2. Envio de Imagens ({items.length})</span>
          </button>
          <button
            onClick={() => setActiveStep('review')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeStep === 'review'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>3. Conferência Docente</span>
          </button>
          <button
            onClick={() => setActiveStep('results')}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
              activeStep === 'results'
                ? 'bg-white text-indigo-900 shadow-sm'
                : 'text-indigo-200 hover:text-white hover:bg-white/5'
            }`}
          >
            <span>4. Resultados do Lote ({gradedCount})</span>
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            {totalCount}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Fotos no Lote</span>
            <p className="text-sm font-bold text-slate-800">{totalCount} folhas</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            {awaitingIdCount}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Requer Conferência</span>
            <p className="text-sm font-bold text-slate-800">{awaitingIdCount} estudantes</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            {transcribedCount}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Prontas p/ Correção</span>
            <p className="text-sm font-bold text-slate-800">{transcribedCount} textos</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            {gradedCount}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Corrigidas c/ Nota</span>
            <p className="text-sm font-bold text-slate-800">{gradedCount} avaliações</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            {errorCount}
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Falhas / Ilegíveis</span>
            <p className="text-sm font-bold text-slate-800">{errorCount} itens</p>
          </div>
        </div>
      </div>

      {/* STEP 1: CONFIGURATION */}
      {activeStep === 'config' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              1.2 Configuração do Lote de Redações
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Defina a turma, disciplina, critérios oficiais e cadastre ou selecione a lista de estudantes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Turma Selecionada
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Componente Curricular / Disciplina
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Professor Responsável
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Tema da Redação
              </label>
              <span className="text-[11px] text-slate-500">Temas Oficiais INEP/ENEM</span>
            </div>
            <textarea
              rows={2}
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
            />
            <div className="flex flex-wrap gap-1.5 mt-2">
              {officialThemes.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setTheme(t)}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 text-slate-600 transition-colors"
                >
                  {t.substring(0, 48)}...
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Avaliação
              </label>
              <select
                value={correctionType}
                onChange={(e) => setCorrectionType(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white font-medium"
              >
                <option value="enem">ENEM Oficial (5 Competências - 0 a 1000)</option>
                <option value="rubric">Rubrica Analítica Personalizada (0 a 10)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data da Atividade
              </label>
              <input
                type="date"
                value={activityDate}
                onChange={(e) => setActivityDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Limite de Concorrência da Fila
              </label>
              <select
                value={concurrencyLimit}
                onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none bg-white"
              >
                <option value={1}>1 requisição por vez (Mais seguro / Taxa leve)</option>
                <option value={2}>2 requisições paralelas (Recomendado)</option>
                <option value={3}>3 requisições paralelas</option>
              </select>
            </div>
          </div>

          {/* Turma Students Management */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800">
                  Estudantes Matriculados na Turma ({turmaStudents.length})
                </h4>
                <p className="text-xs text-slate-500">
                  A IA usará esta lista para associar nomes manuscritos sem inventar alunos.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingStudentOpen(!isAddingStudentOpen)}
                className="px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar Estudante
              </button>
            </div>

            {isAddingStudentOpen && (
              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row gap-3 items-end">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome Completo do Aluno
                  </label>
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Ex: João da Silva Santos"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Matrícula / RA
                  </label>
                  <input
                    type="text"
                    value={newStudentReg}
                    onChange={(e) => setNewStudentReg(e.target.value)}
                    placeholder="2024-009"
                    className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddStudent}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  Confirmar
                </button>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              {turmaStudents.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs bg-slate-100 text-slate-700 border border-slate-200"
                >
                  <span className="font-semibold">{s.name}</span>
                  {s.registration && (
                    <span className="text-[10px] text-slate-400">({s.registration})</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setTurmaStudents(turmaStudents.filter((st) => st.id !== s.id))}
                    className="text-slate-400 hover:text-rose-500 ml-1"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setActiveStep('upload')}
              className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              Avançar para Envio de Imagens
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: UPLOAD */}
      {activeStep === 'upload' && (
        <div className="space-y-6">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 rounded-3xl p-8 sm:p-12 text-center bg-white hover:bg-indigo-50/20 transition-all cursor-pointer relative"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-4 shadow-inner">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Arraste e solte as fotografias das redações aqui
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              Ou clique para selecionar múltiplos arquivos da turma (JPEG, PNG, WEBP).
              Suporta folhas simples, múltiplas páginas e folhas-espelho.
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 text-xs text-slate-400">
              <span>&bull; Validação de duplicidade ativa</span>
              <span>&bull; Processamento local seguro</span>
              <span>&bull; Sem envio para URLs públicas</span>
            </div>
          </div>

          {items.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-800">
                    Fotografias Selecionadas ({items.length})
                  </h4>
                  <p className="text-xs text-slate-500">
                    Revise as imagens antes de iniciar a transcrição com a IA.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Mais
                  </button>
                  <button
                    onClick={() => setItems([])}
                    className="px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  >
                    Limpar Todas
                  </button>
                </div>
              </div>

              {/* Grid of Image Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="relative group bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:border-indigo-300 transition-all"
                  >
                    <div className="h-32 bg-slate-200 overflow-hidden relative">
                      <img
                        src={item.previewUrl}
                        alt={item.fileName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/70 text-white backdrop-blur-xs">
                        #{idx + 1}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveItem(item.id);
                        }}
                        className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remover fotografia"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="p-2.5 text-xs space-y-1">
                      <p className="font-semibold text-slate-700 truncate" title={item.fileName}>
                        {item.fileName}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <span>{(item.fileSize / 1024).toFixed(0)} KB</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => handleReorder(idx, 'up')}
                            className="hover:text-indigo-600 disabled:opacity-30"
                          >
                            &uarr;
                          </button>
                          <button
                            type="button"
                            disabled={idx === items.length - 1}
                            onClick={() => handleReorder(idx, 'down')}
                            className="hover:text-indigo-600 disabled:opacity-30"
                          >
                            &darr;
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs text-slate-500">
                  Pronto para ler cabeçalhos e transcrever o texto manuscrito das {items.length} imagens.
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveStep('review');
                    handleRunTranscriptionBatch();
                  }}
                  className="px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Iniciar Leitura e Transcrição em Lote
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: CONFERÊNCIA DOCENTE */}
      {activeStep === 'review' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                1.4 &bull; Conferência Docente e Associação de Alunos
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Revise os alunos identificados na folha, ajuste eventuais incertezas e confira a transcrição.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleRunTranscriptionBatch}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                Reprocessar Pendentes / Falhas
              </button>
              <button
                type="button"
                disabled={isProcessing || items.every((it) => it.isManualIdRequired)}
                onClick={handleRunGradingBatch}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                Corrigir Redações Confirmadas ({transcribedCount})
              </button>
            </div>
          </div>

          {/* Table / List of Review Items */}
          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className={`p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                  item.isManualIdRequired
                    ? 'bg-amber-50/50'
                    : item.status === 'graded'
                    ? 'bg-emerald-50/30'
                    : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  {/* Thumbnail */}
                  <div
                    onClick={() => openInspectModal(item)}
                    className="w-16 h-20 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all relative group"
                  >
                    <img
                      src={item.previewUrl}
                      alt={item.fileName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Eye className="w-4 h-4" />
                    </div>
                  </div>

                  {/* Student & Recognition Status */}
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>

                      {/* Student Selector */}
                      <select
                        value={item.studentName}
                        onChange={(e) => {
                          const val = e.target.value;
                          const found = turmaStudents.find((s) => s.name === val);
                          setItems((prev) =>
                            prev.map((it) =>
                              it.id === item.id
                                ? {
                                    ...it,
                                    studentName: val,
                                    studentRegistration: found?.registration || it.studentRegistration,
                                    isManualIdRequired: !val || val === 'Aguardando identificação manual',
                                  }
                                : it
                            )
                          );
                        }}
                        className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none ${
                          item.isManualIdRequired
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : 'bg-white text-slate-800 border-slate-300'
                        }`}
                      >
                        <option value="Aguardando identificação manual">
                          ⚠️ Aguardando identificação manual
                        </option>
                        {turmaStudents.map((st) => (
                          <option key={st.id} value={st.name}>
                            {st.name} {st.registration ? `(${st.registration})` : ''}
                          </option>
                        ))}
                      </select>

                      {/* Identification Confidence Badge */}
                      {item.status !== 'idle' && (
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            item.isManualIdRequired
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.isManualIdRequired
                            ? 'Incerteza na leitura'
                            : `Confiança: ${(item.confidenceScore * 100).toFixed(0)}%`}
                        </span>
                      )}

                      {/* Multi-page / Mirror sheet flag */}
                      {item.isMirrorSheet && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                          Folha-Espelho Detectada
                        </span>
                      )}
                    </div>

                    {/* Transcription Snippet */}
                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                      {item.transcription || 'Aguardando leitura óptica...'}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-400">
                      <span>Arquivo: {item.fileName}</span>
                      <span>&bull;</span>
                      <span>Página {item.pageNumber}</span>
                      {item.studentRegistration && (
                        <>
                          <span>&bull;</span>
                          <span>RA: {item.studentRegistration}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Actions */}
                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  {item.status === 'idle' && (
                    <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Na fila
                    </span>
                  )}
                  {item.status === 'transcribing' && (
                    <span className="text-xs font-semibold text-indigo-600 flex items-center gap-1.5 animate-pulse">
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Lendo texto...
                    </span>
                  )}
                  {item.status === 'transcribed' && (
                    <span className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Transcrito
                    </span>
                  )}
                  {item.status === 'grading' && (
                    <span className="text-xs font-semibold text-purple-600 flex items-center gap-1.5 animate-pulse">
                      <Award className="w-3.5 h-3.5 animate-spin" /> Corrigindo ENEM...
                    </span>
                  )}
                  {item.status === 'graded' && (
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-xl">
                        {item.essayResult?.totalScore ?? 0} pts
                      </span>
                    </div>
                  )}
                  {item.status === 'error' && (
                    <span className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Falha
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => openInspectModal(item)}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                    title="Revisar transcrição e imagem"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Excluir item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: RESULTADOS DO LOTE */}
      {activeStep === 'results' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                1.8 &bull; Resultados Consolidados do Lote de Redações
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Turma: <span className="font-semibold text-slate-700">{className}</span> &bull; {activityDate}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportExcel}
                className="px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors flex items-center gap-2"
              >
                <FileDown className="w-4 h-4 text-emerald-600" />
                Exportar Planilha (XLSX)
              </button>
              <button
                type="button"
                onClick={onBackToMenu}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all"
              >
                Concluir e Ver Banco de Redações
              </button>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Estudante</th>
                  <th className="py-3 px-3">C1 (Norma)</th>
                  <th className="py-3 px-3">C2 (Tema)</th>
                  <th className="py-3 px-3">C3 (Projeto)</th>
                  <th className="py-3 px-3">C4 (Coesão)</th>
                  <th className="py-3 px-3">C5 (Intervenção)</th>
                  <th className="py-3 px-4 text-right">Nota Final</th>
                  <th className="py-3 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((it) => {
                  const res = it.essayResult;
                  return (
                    <tr key={it.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {it.studentName}
                        {it.studentRegistration && (
                          <span className="block text-[10px] text-slate-400 font-normal">
                            RA: {it.studentRegistration}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-600">
                        {res?.competencies?.[0]?.score ?? '-'}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-600">
                        {res?.competencies?.[1]?.score ?? '-'}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-600">
                        {res?.competencies?.[2]?.score ?? '-'}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-600">
                        {res?.competencies?.[3]?.score ?? '-'}
                      </td>
                      <td className="py-3.5 px-3 font-medium text-slate-600">
                        {res?.competencies?.[4]?.score ?? '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-sm text-indigo-700">
                        {res?.totalScore ? `${res.totalScore} / 1000` : 'Pendente'}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openInspectModal(it)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                          Ver Parecer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INSPECT & EDIT MODAL */}
      {inspectingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-4xl max-h-[92vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-3xl">
              <div>
                <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Conferência da Produção Textual
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Arquivo: {inspectingItem.fileName} &bull; Legibilidade: {inspectingItem.readability}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Photo Preview */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Fotografia da Folha Manuscrita
                </label>
                <div className="h-96 bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center">
                  <img
                    src={inspectingItem.previewUrl}
                    alt="Manuscrito"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>

              {/* Transcription & Student Editor */}
              <div className="space-y-4 flex flex-col">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Vínculo do Estudante
                  </label>
                  <input
                    type="text"
                    value={editingStudentName}
                    onChange={(e) => setEditingStudentName(e.target.value)}
                    placeholder="Nome do Aluno"
                    className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Transcrição do Texto Manuscrito (Editável)
                  </label>
                  <textarea
                    rows={12}
                    value={editingTranscription}
                    onChange={(e) => setEditingTranscription(e.target.value)}
                    className="w-full flex-1 p-3.5 text-xs font-mono leading-relaxed rounded-xl border border-slate-200 outline-none focus:border-indigo-500 resize-none bg-slate-50"
                  />
                </div>

                {inspectingItem.essayResult && (
                  <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs space-y-1">
                    <span className="font-bold text-indigo-900 block">
                      Parecer Pedagógico Registrado:
                    </span>
                    <p className="text-indigo-800 line-clamp-3">
                      {inspectingItem.essayResult.summaryPedagogical}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setInspectingItem(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/50 rounded-xl"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleSaveInspectChanges}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
