import React, { useState } from 'react';
import {
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowLeft,
  FileCheck2,
  Loader2,
  Trash2,
  Eye,
  Check,
} from 'lucide-react';
import { Exam, ExamSubmission, StudentAnswer, GradedQuestion } from '../types/exam';
import { gradePhotoExam } from '../services/geminiService';

interface PhotoBatchCorrectorProps {
  exams: Exam[];
  onSubmissionsImported: (submissions: ExamSubmission[]) => void;
  onBackToMenu: () => void;
}

interface PhotoBatchItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  detectedName?: string;
  detectedRegistration?: string;
  detectedAnswers?: Record<string, string>;
  calculatedScore?: number;
  errorMessage?: string;
  submissionDraft?: ExamSubmission;
}

export const PhotoBatchCorrector: React.FC<PhotoBatchCorrectorProps> = ({
  exams,
  onSubmissionsImported,
  onBackToMenu,
}) => {
  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [batchItems, setBatchItems] = useState<PhotoBatchItem[]>([]);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const selectedExam = exams.find((e) => e.id === selectedExamId) || exams[0];

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems: PhotoBatchItem[] = files.map((file, idx) => ({
      id: `batch_${Date.now()}_${idx}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending',
    }));

    setBatchItems((prev) => [...prev, ...newItems]);
  };

  const handleRemoveItem = (id: string) => {
    setBatchItems((prev) => prev.filter((item) => item.id !== id));
  };

  const processSingleItem = async (item: PhotoBatchItem): Promise<PhotoBatchItem> => {
    if (!selectedExam) return item;

    // Convert to base64
    const base64: string = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(item.file);
    });

    try {
      const result = await gradePhotoExam({
        imageBase64: base64,
        questions: selectedExam.questions,
      });

      // Map detected answers to question IDs
      const answersMap: Record<string, StudentAnswer> = {};
      const gradesMap: Record<string, GradedQuestion> = {};
      let objectiveScore = 0;

      selectedExam.questions.forEach((q, idx) => {
        const orderStr = String(q.order || idx + 1);
        const match = (result.detectedAnswers || []).find(
          (da: any) => String(da.questionIdOrOrder) === orderStr || String(da.questionIdOrOrder) === q.id
        );

        if (q.type === 'objective') {
          const selectedLetter = match?.selectedOption || 'A';
          const correctOpt = q.options?.find((o) => o.isCorrect);
          const isCorrect = correctOpt?.id === selectedLetter;
          const awarded = isCorrect ? q.points : 0;
          objectiveScore += awarded;

          answersMap[q.id] = {
            questionId: q.id,
            type: 'objective',
            selectedOptionId: selectedLetter,
          };

          gradesMap[q.id] = {
            questionId: q.id,
            type: 'objective',
            maxPoints: q.points,
            awardedPoints: awarded,
            isCorrect,
            feedback: isCorrect ? 'Acertou via leitura óptica da foto' : `Errou (marcou ${selectedLetter}, correto ${correctOpt?.id})`,
          };
        } else {
          answersMap[q.id] = {
            questionId: q.id,
            type: 'dissertative',
            writtenText: match?.writtenText || 'Resposta manuscrita identificada na folha.',
          };

          gradesMap[q.id] = {
            questionId: q.id,
            type: 'dissertative',
            maxPoints: q.points,
            awardedPoints: 0,
            summaryJustification: 'Aguardando avaliação docente ou correção por IA.',
          };
        }
      });

      const submission: ExamSubmission = {
        id: `sub_photo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        examId: selectedExam.id,
        studentName: result.detectedStudentName || 'Aluno Digitalizado',
        studentRegistration: result.detectedRegistration || undefined,
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        durationSpentSeconds: 1800,
        answers: answersMap,
        grades: gradesMap,
        objectiveScore: Math.round(objectiveScore * 10) / 10,
        dissertativeScore: 0,
        totalScore: Math.round(objectiveScore * 10) / 10,
        maxPossibleScore: selectedExam.totalScore,
        percentage: Math.round((objectiveScore / selectedExam.totalScore) * 100),
        status: selectedExam.questions.some((q) => q.type === 'dissertative') ? 'pending_grading' : 'graded',
        sourceType: 'photo_batch',
        photoUrl: item.previewUrl,
      };

      return {
        ...item,
        status: 'done',
        detectedName: submission.studentName,
        detectedRegistration: submission.studentRegistration,
        calculatedScore: submission.totalScore,
        submissionDraft: submission,
      };
    } catch (err: any) {
      console.error(err);
      return {
        ...item,
        status: 'error',
        errorMessage: err.message || 'Falha na leitura da imagem.',
      };
    }
  };

  const handleProcessBatch = async () => {
    if (batchItems.length === 0) return;
    setIsProcessingAll(true);

    const updated = [...batchItems];
    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status !== 'done') {
        updated[i] = { ...updated[i], status: 'processing' };
        setBatchItems([...updated]);
        const processed = await processSingleItem(updated[i]);
        updated[i] = processed;
        setBatchItems([...updated]);
      }
    }

    setIsProcessingAll(false);
  };

  const handleImportAllToGradebook = () => {
    const readySubmissions = batchItems
      .filter((item) => item.status === 'done' && item.submissionDraft)
      .map((item) => item.submissionDraft!);

    if (readySubmissions.length === 0) {
      alert('Nenhuma prova processada com sucesso para importar.');
      return;
    }

    onSubmissionsImported(readySubmissions);
    setImportSuccess(true);
    setTimeout(() => {
      onBackToMenu();
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div>
          <button
            onClick={onBackToMenu}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Voltar ao Painel
          </button>
          <h1 className="text-2xl font-black text-slate-900">
            Correção por Lote através de Fotos / OCR
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Carregue fotos de gabaritos e folhas de respostas dos alunos para correção automática em massa com IA
          </p>
        </div>

        <div className="flex items-center gap-2">
          {batchItems.some((i) => i.status === 'done') && (
            <button
              onClick={handleImportAllToGradebook}
              disabled={importSuccess}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all"
            >
              {importSuccess ? (
                <>
                  <Check className="w-4 h-4" /> Importado com Sucesso!
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Importar {batchItems.filter((i) => i.status === 'done').length} Provas para Turma
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Select Target Exam */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
          1. Selecione a Avaliação de Referência:
        </label>
        {exams.length === 0 ? (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <strong>Nenhuma avaliação cadastrada ainda.</strong>
            <p className="text-amber-800">
              Crie uma avaliação na aba <em>"Criar Prova (BNCC)"</em> antes de iniciar a correção por lote de fotos, pois o sistema precisa do gabarito oficial para conferir as marcações.
            </p>
          </div>
        ) : (
          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="w-full sm:w-auto min-w-[320px] px-3.5 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 focus:border-indigo-500 outline-none"
          >
            {exams.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.title} ({ex.subject} - {ex.gradeLevel})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-8 rounded-3xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 text-center space-y-4 transition-colors">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
          <Camera className="w-8 h-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-800">
            Arraste ou Selecione as Fotos dos Gabaritos
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Você pode enviar várias imagens simultaneamente (JPG, PNG ou fotos tiradas pelo celular). O sistema identifica o nome e marcações de cada folha.
          </p>
        </div>

        <label className={`inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white rounded-xl shadow-md transition-all ${
          exams.length === 0
            ? 'bg-slate-300 cursor-not-allowed shadow-none'
            : 'bg-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-indigo-200'
        }`}>
          <Upload className="w-4 h-4" /> Selecionar Fotos da Turma
          <input
            type="file"
            multiple
            accept="image/*"
            disabled={exams.length === 0}
            onChange={handleFilesSelected}
            className="hidden"
          />
        </label>
      </div>

      {/* Batch Processing Table */}
      {batchItems.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Fila de Processamento ({batchItems.length} foto(s))
              </h3>
              <p className="text-xs text-slate-500">
                {batchItems.filter((i) => i.status === 'done').length} concluídas &bull;{' '}
                {batchItems.filter((i) => i.status === 'pending').length} pendentes
              </p>
            </div>

            <button
              onClick={handleProcessBatch}
              disabled={isProcessingAll || batchItems.every((i) => i.status === 'done')}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 rounded-xl shadow-xs transition-all"
            >
              {isProcessingAll ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Processando Lote...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-200" /> Corrigir Lote com IA
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {batchItems.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex items-start gap-3 relative group"
              >
                <img
                  src={item.previewUrl}
                  alt="Foto"
                  className="w-16 h-20 object-cover rounded-xl border border-slate-200 shrink-0"
                />

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.status === 'done'
                          ? 'bg-emerald-100 text-emerald-800'
                          : item.status === 'processing'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : item.status === 'error'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.status === 'done'
                        ? 'Corrigida'
                        : item.status === 'processing'
                        ? 'Processando'
                        : item.status === 'error'
                        ? 'Erro'
                        : 'Aguardando'}
                    </span>

                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <p className="text-xs font-bold text-slate-800 truncate">
                    {item.detectedName || item.file.name}
                  </p>

                  {item.calculatedScore !== undefined && (
                    <p className="text-xs font-extrabold text-indigo-700">
                      Nota: {item.calculatedScore.toFixed(1)} / {selectedExam?.totalScore.toFixed(1)} pts
                    </p>
                  )}

                  {item.status === 'processing' && (
                    <p className="text-[10px] text-amber-700 flex items-center gap-1">
                      <Loader2 className="w-3 h-3 animate-spin" /> Extraindo respostas...
                    </p>
                  )}

                  {item.errorMessage && (
                    <p className="text-[10px] text-rose-600">{item.errorMessage}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
