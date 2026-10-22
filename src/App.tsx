import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ExamList } from './components/ExamList';
import { ExamEditor } from './components/ExamEditor';
import { ExamTaker } from './components/ExamTaker';
import { SubmissionResults } from './components/SubmissionResults';
import { TeacherGradingDashboard } from './components/TeacherGradingDashboard';
import { EnemEssayCorrector } from './components/EnemEssayCorrector';
import { PhotoBatchCorrector } from './components/PhotoBatchCorrector';
import { BnccProficiencyDashboard } from './components/BnccProficiencyDashboard';
import { AiExamGeneratorModal } from './components/AiExamGeneratorModal';
import { PrintExamModal } from './components/PrintExamModal';
import { Exam, ExamSubmission, EnemEssaySubmission } from './types/exam';
import {
  getStoredExams,
  saveExam,
  deleteExam,
  getSubmissions,
  saveSubmission,
  deleteSubmission,
  getStoredEssays,
  saveEssay,
  deleteEssay,
  resetToDefaults,
} from './utils/storage';

export default function App() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [submissions, setSubmissions] = useState<ExamSubmission[]>([]);
  const [essays, setEssays] = useState<EnemEssaySubmission[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('list');

  // Selected items
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [takingExam, setTakingExam] = useState<Exam | null>(null);
  const [viewingSubmission, setViewingSubmission] = useState<ExamSubmission | null>(null);
  const [printExam, setPrintExam] = useState<Exam | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [dashboardExamFilter, setDashboardExamFilter] = useState<string | undefined>(undefined);

  // Load from local storage on mount
  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    const loadedExams = getStoredExams();
    const loadedSubmissions = getSubmissions();
    const loadedEssays = getStoredEssays();
    setExams(loadedExams);
    setSubmissions(loadedSubmissions);
    setEssays(loadedEssays);
  };

  const handleResetData = () => {
    if (confirm('Deseja zerar todos os dados das abas (provas, redações e submissões)?')) {
      resetToDefaults();
      refreshData();
      alert('Todos os dados foram zerados com sucesso!');
    }
  };

  // Exam CRUD
  const handleNewExam = () => {
    setEditingExam(null);
    setActiveTab('editor');
  };

  const handleEditExam = (exam: Exam) => {
    setEditingExam(exam);
    setActiveTab('editor');
  };

  const handleSaveExam = (exam: Exam) => {
    saveExam(exam);
    refreshData();
    setActiveTab('list');
  };

  const handleDeleteExam = (id: string) => {
    deleteExam(id);
    refreshData();
  };

  // Taking Exam
  const handleTakeExam = (exam: Exam) => {
    setTakingExam(exam);
    setActiveTab('taker');
  };

  const handleSubmitExam = (submission: ExamSubmission) => {
    saveSubmission(submission);
    refreshData();
    setViewingSubmission(submission);
    setActiveTab('results');
  };

  // Teacher Grading Actions
  const handleOpenTeacherDashboard = (examId?: string) => {
    setDashboardExamFilter(examId);
    setActiveTab('dashboard');
  };

  const handleUpdateSubmission = (sub: ExamSubmission) => {
    saveSubmission(sub);
    refreshData();
  };

  const handleDeleteSubmission = (id: string) => {
    deleteSubmission(id);
    refreshData();
  };

  // Photo batch import
  const handleBatchSubmissionsImported = (newSubs: ExamSubmission[]) => {
    newSubs.forEach((s) => saveSubmission(s));
    refreshData();
    setActiveTab('dashboard');
  };

  // Essay Actions
  const handleSaveEssay = (essay: EnemEssaySubmission) => {
    saveEssay(essay);
    refreshData();
  };

  const handleDeleteEssay = (id: string) => {
    deleteEssay(id);
    refreshData();
  };

  // AI Exam Generated
  const handleExamGenerated = (partialExam: Partial<Exam>) => {
    const newExam: Exam = {
      id: `exam_ai_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: partialExam.title || 'Avaliação Gerada por IA',
      description: partialExam.description || 'Avaliação criada com assistência inteligente.',
      institution: partialExam.institution || '',
      subject: partialExam.subject || '',
      gradeLevel: partialExam.gradeLevel || '',
      teacherName: partialExam.teacherName || '',
      durationMinutes: partialExam.durationMinutes || 60,
      passingScore: partialExam.passingScore || 6.0,
      totalScore: partialExam.totalScore || 10.0,
      instructions: partialExam.instructions || [
        'Leia com atenção cada questão.',
        'Nas objetivas, apenas uma opção é correta.',
        'Nas dissertativas, desenvolva sua fundamentação crítica.',
      ],
      questions: partialExam.questions || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    saveExam(newExam);
    refreshData();
    setEditingExam(newExam);
    setActiveTab('editor');
  };

  const pendingCount = submissions.filter((s) => s.status === 'pending_grading').length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header is shown on non-taker views */}
      {activeTab !== 'taker' && (
        <Header
          activeTab={activeTab}
          setActiveTab={(tab) => {
            if (tab === 'editor') setEditingExam(null);
            setActiveTab(tab);
          }}
          pendingCount={pendingCount}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onNewExam={handleNewExam}
          onResetData={handleResetData}
        />
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'list' && (
          <ExamList
            exams={exams}
            submissions={submissions}
            onTakeExam={handleTakeExam}
            onEditExam={handleEditExam}
            onDeleteExam={handleDeleteExam}
            onOpenPrintModal={(exam) => {
              setPrintExam(exam);
              setIsPrintModalOpen(true);
            }}
            onOpenTeacherDashboard={handleOpenTeacherDashboard}
            onNewExam={handleNewExam}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'editor' && (
          <ExamEditor
            initialExam={editingExam}
            onSave={handleSaveExam}
            onCancel={() => setActiveTab('list')}
            onOpenAiGenerator={() => setIsAiModalOpen(true)}
          />
        )}

        {activeTab === 'taker' && takingExam && (
          <ExamTaker
            exam={takingExam}
            onExit={() => setActiveTab('list')}
            onSubmitExam={handleSubmitExam}
          />
        )}

        {activeTab === 'results' && viewingSubmission && (
          <SubmissionResults
            exam={exams.find((e) => e.id === viewingSubmission.examId) || takingExam || exams[0]}
            submission={viewingSubmission}
            onBackToExams={() => setActiveTab('list')}
            onOpenTeacherGrading={() => {
              setActiveTab('dashboard');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <TeacherGradingDashboard
            exams={exams}
            submissions={submissions}
            selectedExamId={dashboardExamFilter}
            onUpdateSubmission={handleUpdateSubmission}
            onDeleteSubmission={handleDeleteSubmission}
            onBackToExams={() => setActiveTab('list')}
            onViewStudentReport={(sub) => {
              setViewingSubmission(sub);
              setActiveTab('results');
            }}
          />
        )}

        {activeTab === 'photo_batch' && (
          <PhotoBatchCorrector
            exams={exams}
            onSubmissionsImported={handleBatchSubmissionsImported}
            onBackToMenu={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'enem_essays' && (
          <EnemEssayCorrector
            essays={essays}
            onSaveEssay={handleSaveEssay}
            onDeleteEssay={handleDeleteEssay}
            onBackToMenu={() => setActiveTab('list')}
          />
        )}

        {activeTab === 'bncc_dashboard' && (
          <BnccProficiencyDashboard
            exams={exams}
            submissions={submissions}
            onBackToMenu={() => setActiveTab('list')}
          />
        )}
      </main>

      {/* AI Exam Generator Modal */}
      <AiExamGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onExamGenerated={handleExamGenerated}
      />

      {/* Print / PDF Modal */}
      <PrintExamModal
        exam={printExam}
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false);
          setPrintExam(null);
        }}
      />
    </div>
  );
}
