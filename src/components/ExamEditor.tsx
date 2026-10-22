import React, { useState, useMemo } from 'react';
import {
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Award,
  BookOpen,
  Search,
  Check,
  Tag,
  Info,
  ChevronRight,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Quote,
  Lightbulb,
  HeartHandshake,
  X,
  FileCheck,
  Eye,
  HelpCircle,
} from 'lucide-react';
import { Exam, Question, ObjectiveOption, RubricCriterion } from '../types/exam';
import {
  generateRubricForStatement,
  generateSupportingText,
  adaptExamForInclusion,
} from '../services/geminiService';
import {
  BNCC_CURRICULUM,
  getBnccSkillsForGradeAndSubject,
  findSkillByBnccCode,
  BnccSkillItem,
} from '../data/bnccCurriculum';
import { exportExamToWord } from '../utils/exportUtils';

interface ExamEditorProps {
  initialExam?: Exam | null;
  onSave: (exam: Exam) => void;
  onCancel: () => void;
  onOpenAiGenerator: () => void;
}

export const ExamEditor: React.FC<ExamEditorProps> = ({
  initialExam,
  onSave,
  onCancel,
  onOpenAiGenerator,
}) => {
  // Fields start blank for the teacher to write, as requested by the user
  const [title, setTitle] = useState(initialExam?.title || '');
  const [description, setDescription] = useState(initialExam?.description || '');
  const [institution, setInstitution] = useState(initialExam?.institution || '');
  const [subject, setSubject] = useState(initialExam?.subject || '');
  const [gradeLevel, setGradeLevel] = useState(initialExam?.gradeLevel || '');
  const [teacherName, setTeacherName] = useState(initialExam?.teacherName || '');
  const [durationMinutes, setDurationMinutes] = useState(initialExam?.durationMinutes ?? 60);
  const [passingScore, setPassingScore] = useState(initialExam?.passingScore ?? 6.0);
  const [bnccSkillFilter, setBnccSkillFilter] = useState('');

  // Inclusive education / AEE state
  const [isAdaptedForInclusion, setIsAdaptedForInclusion] = useState(
    initialExam?.isAdaptedForInclusion || false
  );
  const [adaptationType, setAdaptationType] = useState<'tea' | 'deficiencia_intelectual' | 'geral_aee'>(
    initialExam?.adaptationType || 'tea'
  );
  const [adaptationGuidelines, setAdaptationGuidelines] = useState<string[]>(
    initialExam?.adaptationGuidelines || []
  );

  // Modals state
  const [isAdaptModalOpen, setIsAdaptModalOpen] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [generatingSupportingTextQId, setGeneratingSupportingTextQId] = useState<string | null>(null);
  const [activeImageUploadQId, setActiveImageUploadQId] = useState<string | null>(null);
  const [activeSupportingTextQId, setActiveSupportingTextQId] = useState<string | null>(null);

  const [instructions, setInstructions] = useState<string[]>(
    initialExam?.instructions || [
      'Leia com atenção cada questão antes de assinalar ou redigir sua resposta.',
      'Apenas uma alternativa é correta em cada questão objetiva.',
      'Nas questões dissertativas, fundamente sua resposta com clareza e termos técnicos adequados.',
      'Revise todas as questões antes de confirmar a entrega final.',
    ]
  );

  const [questions, setQuestions] = useState<Question[]>(
    initialExam?.questions || []
  );

  const [generatingRubricId, setGeneratingRubricId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Stats calculation
  const totalPoints = questions.reduce((acc, q) => acc + (Number(q.points) || 0), 0);
  const countObj = questions.filter((q) => q.type === 'objective').length;
  const countDiss = questions.filter((q) => q.type === 'dissertative').length;

  // Selected grade object from BNCC curriculum
  const selectedGradeObj = useMemo(() => {
    return BNCC_CURRICULUM.find(
      (b) => b.grade.toLowerCase() === gradeLevel.toLowerCase()
    );
  }, [gradeLevel]);

  // Available subjects for the chosen grade
  const availableSubjectsForGrade = useMemo(() => {
    if (!selectedGradeObj) return [];
    return selectedGradeObj.subjects.map((s) => s.name);
  }, [selectedGradeObj]);

  // Available BNCC skills dynamically evaluated when grade and subject are chosen
  const availableBnccSkills = useMemo(() => {
    return getBnccSkillsForGradeAndSubject(gradeLevel, subject);
  }, [gradeLevel, subject]);

  // Filtered skills based on user search
  const filteredBnccSkills = useMemo(() => {
    if (!bnccSkillFilter.trim()) return availableBnccSkills;
    const q = bnccSkillFilter.toLowerCase();
    return availableBnccSkills.filter(
      (s) =>
        s.code.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }, [availableBnccSkills, bnccSkillFilter]);

  // Count how many questions are linked to a specific BNCC code
  const getQuestionsCountForSkill = (code: string) => {
    return questions.filter((q) => q.bnccCode?.toUpperCase() === code.toUpperCase()).length;
  };

  const handleAddInstruction = () => {
    setInstructions([...instructions, 'Nova instrução para a realização do exame']);
  };

  const handleRemoveInstruction = (idx: number) => {
    setInstructions(instructions.filter((_, i) => i !== idx));
  };

  const handleInstructionChange = (idx: number, val: string) => {
    const updated = [...instructions];
    updated[idx] = val;
    setInstructions(updated);
  };

  const handleAddQuestion = (type: 'objective' | 'dissertative') => {
    const newOrder = questions.length + 1;
    const newId = `q_${type === 'objective' ? 'obj' : 'diss'}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const defaultSkill = availableBnccSkills[0];

    if (type === 'objective') {
      const newQ: Question = {
        id: newId,
        order: newOrder,
        type: 'objective',
        statement: 'Digite aqui o enunciado contextualizado da questão objetiva...',
        points: 1.5,
        subjectTag: defaultSkill?.title || subject || 'Tópico Geral',
        bnccCode: defaultSkill?.code || '',
        bnccSkillDescription: defaultSkill?.description || '',
        options: isAdaptedForInclusion
          ? [
              { id: 'A', text: 'Alternativa correta (linguagem direta)', isCorrect: true, explanation: 'Gabarito' },
              { id: 'B', text: 'Segunda alternativa com contraste evidente', isCorrect: false, explanation: 'Incorreto' },
              { id: 'C', text: 'Terceira alternativa simplificada', isCorrect: false, explanation: 'Incorreto' },
            ]
          : [
              { id: 'A', text: 'Alternativa correta', isCorrect: true, explanation: 'Comentário explicativo' },
              { id: 'B', text: 'Segunda alternativa (distrator)', isCorrect: false, explanation: 'Incorreto' },
              { id: 'C', text: 'Terceira alternativa (distrator)', isCorrect: false, explanation: 'Incorreto' },
              { id: 'D', text: 'Quarta alternativa (distrator)', isCorrect: false, explanation: 'Incorreto' },
            ],
      };
      setQuestions([...questions, newQ]);
    } else {
      const newQ: Question = {
        id: newId,
        order: newOrder,
        type: 'dissertative',
        statement: 'Digite aqui a pergunta dissertativa que estimule a análise e raciocínio crítico...',
        points: 2.5,
        subjectTag: defaultSkill?.title || subject || 'Tópico Geral',
        bnccCode: defaultSkill?.code || '',
        bnccSkillDescription: defaultSkill?.description || '',
        expectedAnswer: 'Digite o gabarito modelo ou diretrizes pedagógicas esperadas para a resposta...',
        rubric: [
          { id: `rub_${Date.now()}_1`, title: 'Conhecimento Conceitual', description: 'Precisão e domínio do conteúdo teórico.', maxScore: 1.5 },
          { id: `rub_${Date.now()}_2`, title: 'Argumentação e Clareza', description: 'Uso de linguagem técnica adequada e lógica.', maxScore: 1.0 },
        ],
      };
      setQuestions([...questions, newQ]);
    }
  };

  // Add question pre-filled from a specific BNCC skill card
  const handleAddQuestionWithSkill = (type: 'objective' | 'dissertative', skill: BnccSkillItem) => {
    const newOrder = questions.length + 1;
    const newId = `q_${type === 'objective' ? 'obj' : 'diss'}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    if (type === 'objective') {
      const newQ: Question = {
        id: newId,
        order: newOrder,
        type: 'objective',
        statement: `[Habilidade ${skill.code}] Elabore o enunciado avaliando: ${skill.description.slice(0, 120)}...`,
        points: 2.0,
        subjectTag: skill.title,
        bnccCode: skill.code,
        bnccSkillDescription: skill.description,
        options: [
          { id: 'A', text: 'Alternativa correta correspondente à habilidade', isCorrect: true, explanation: 'Justificativa pedagógica' },
          { id: 'B', text: 'Distrator conceitual 1', isCorrect: false, explanation: 'Equívoco comum de aprendizagem' },
          { id: 'C', text: 'Distrator conceitual 2', isCorrect: false, explanation: 'Incorreto' },
          { id: 'D', text: 'Distrator conceitual 3', isCorrect: false, explanation: 'Incorreto' },
        ],
      };
      setQuestions([...questions, newQ]);
    } else {
      const newQ: Question = {
        id: newId,
        order: newOrder,
        type: 'dissertative',
        statement: `[Habilidade ${skill.code} - ${skill.title}] Discorra com fundamentação sobre: ${skill.description}`,
        points: 2.5,
        subjectTag: skill.title,
        bnccCode: skill.code,
        bnccSkillDescription: skill.description,
        expectedAnswer: `Critério modelo: O aluno deve demonstrar proficiência na habilidade ${skill.code}, contemplando ${skill.description}`,
        rubric: [
          { id: `rub_${Date.now()}_1`, title: `Domínio da Habilidade ${skill.code}`, description: skill.description, maxScore: 1.5 },
          { id: `rub_${Date.now()}_2`, title: 'Clareza e Justificativa', description: 'Coesão textual e argumentos consistentes.', maxScore: 1.0 },
        ],
      };
      setQuestions([...questions, newQ]);
    }
  };

  const handleRemoveQuestion = (id: string) => {
    const remaining = questions.filter((q) => q.id !== id);
    const reordered = remaining.map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestions(reordered);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const list = [...questions];
    const [moved] = list.splice(index, 1);
    list.splice(targetIndex, 0, moved);

    const reordered = list.map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestions(reordered);
  };

  const handleUpdateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updates } : q))
    );
  };

  // Image Upload handler (converts file to base64 Data URL)
  const handleFileUploadForQuestion = (qId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target?.result as string;
      handleUpdateQuestion(qId, {
        imageUrl: dataUrl,
        imageCaption: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
        imageSource: 'Arquivo do Professor / Material Pedagógico',
      });
      setActiveImageUploadQId(null);
    };
    reader.readAsDataURL(file);
  };

  // Generate Supporting Text from Public Sources with AI
  const handleGenerateSupportingTextAction = async (
    qId: string,
    preferredSource: 'pnld' | 'mec' | 'ibge' | 'scielo' | 'fiocruz' | 'constituicao'
  ) => {
    const q = questions.find((item) => item.id === qId);
    if (!q) return;

    setGeneratingSupportingTextQId(qId);
    try {
      const res = await generateSupportingText({
        subject: subject || 'Conhecimentos Gerais',
        topic: q.subjectTag || q.statement.slice(0, 80) || subject,
        gradeLevel: gradeLevel || 'Ensino Fundamental II / Médio',
        preferredSource,
      });

      handleUpdateQuestion(qId, {
        supportingText: res.text,
        supportingTextTitle: res.title,
        supportingTextSource: res.sourceCitation,
      });
      setActiveSupportingTextQId(null);
    } catch (err: any) {
      alert('Não foi possível gerar texto de apoio: ' + err.message);
    } finally {
      setGeneratingSupportingTextQId(null);
    }
  };

  // Inclusive Adaptation Generator (TEA / Deficiência Intelectual)
  const handleAdaptExamAction = async (target: 'tea' | 'deficiencia_intelectual' | 'geral_aee') => {
    if (questions.length === 0) {
      alert('Adicione pelo menos uma questão antes de adaptar a avaliação.');
      return;
    }

    setIsAdapting(true);
    try {
      const currentDraft: Exam = {
        id: initialExam?.id || 'draft',
        title: title || 'Avaliação Escolar',
        description,
        institution,
        subject: subject || 'Geral',
        gradeLevel: gradeLevel || 'Geral',
        teacherName,
        durationMinutes,
        passingScore,
        totalScore: totalPoints,
        instructions,
        questions,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const adapted = await adaptExamForInclusion(currentDraft, target);
      setQuestions(adapted.questions);
      setIsAdaptedForInclusion(true);
      setAdaptationType(target);
      setAdaptationGuidelines(adapted.adaptationGuidelines || []);
      if (!title.includes('(Adaptada)')) {
        setTitle(`${title || 'Avaliação'} (Versão Adaptada - AEE)`);
      }
      setIsAdaptModalOpen(false);
    } catch (err: any) {
      alert('Erro ao adaptar prova inclusiva: ' + err.message);
    } finally {
      setIsAdapting(false);
    }
  };

  // Option updates for objective questions
  const handleUpdateOption = (
    qId: string,
    optIndex: number,
    updates: Partial<ObjectiveOption>
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId || !q.options) return q;
        const opts = [...q.options];
        opts[optIndex] = { ...opts[optIndex], ...updates };

        // If setting this option to correct, uncheck others
        if (updates.isCorrect === true) {
          opts.forEach((o, idx) => {
            if (idx !== optIndex) o.isCorrect = false;
          });
        }
        return { ...q, options: opts };
      })
    );
  };

  const handleAddOption = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId || !q.options) return q;
        const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
        const nextLetter = letters[q.options.length] || `Opção ${q.options.length + 1}`;
        const newOpt: ObjectiveOption = {
          id: nextLetter,
          text: `Nova alternativa ${nextLetter}`,
          isCorrect: false,
          explanation: '',
        };
        return { ...q, options: [...q.options, newOpt] };
      })
    );
  };

  const handleRemoveOption = (qId: string, optIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId || !q.options || q.options.length <= 2) return q;
        const opts = q.options.filter((_, idx) => idx !== optIndex);
        return { ...q, options: opts };
      })
    );
  };

  // Rubric updates for dissertative
  const handleAddRubricCriterion = (qId: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const list = q.rubric || [];
        const newCrit: RubricCriterion = {
          id: `rub_${Date.now()}_${list.length + 1}`,
          title: `Critério ${list.length + 1}`,
          description: 'Descreva o que o aluno deve contemplar para atingir essa nota.',
          maxScore: 1.0,
        };
        return { ...q, rubric: [...list, newCrit] };
      })
    );
  };

  const handleUpdateRubricCriterion = (
    qId: string,
    critIndex: number,
    updates: Partial<RubricCriterion>
  ) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId || !q.rubric) return q;
        const rub = [...q.rubric];
        rub[critIndex] = { ...rub[critIndex], ...updates };
        return { ...q, rubric: rub };
      })
    );
  };

  const handleRemoveRubricCriterion = (qId: string, critIndex: number) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId || !q.rubric) return q;
        return { ...q, rubric: q.rubric.filter((_, idx) => idx !== critIndex) };
      })
    );
  };

  // AI Rubric generation for single question
  const handleGenerateRubricWithAI = async (q: Question) => {
    if (!q.statement || q.statement.trim().length < 10) {
      alert('Por favor, escreva o enunciado da questão dissertativa antes de pedir ajuda à IA.');
      return;
    }

    setGeneratingRubricId(q.id);
    try {
      const res = await generateRubricForStatement(q.statement, q.points);
      handleUpdateQuestion(q.id, {
        expectedAnswer: res.expectedAnswer,
        rubric: res.rubric,
      });
    } catch (err: any) {
      console.error(err);
      alert('Não foi possível gerar a rubrica com IA: ' + err.message);
    } finally {
      setGeneratingRubricId(null);
    }
  };

  // Final Validation and Save
  const handleSaveExam = () => {
    setSaveError(null);

    if (!title.trim()) {
      setSaveError('Por favor informe o título da avaliação.');
      return;
    }
    if (questions.length === 0) {
      setSaveError('A avaliação precisa conter pelo menos uma questão.');
      return;
    }

    // Check each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.statement.trim()) {
        setSaveError(`A questão ${q.order || i + 1} está com enunciado em branco.`);
        return;
      }
      if (q.type === 'objective') {
        if (!q.options || q.options.length < 2) {
          setSaveError(`A questão objetiva ${q.order || i + 1} precisa ter pelo menos 2 alternativas.`);
          return;
        }
        const hasCorrect = q.options.some((o) => o.isCorrect);
        if (!hasCorrect) {
          setSaveError(`A questão objetiva ${q.order || i + 1} não possui nenhuma alternativa marcada como correta.`);
          return;
        }
      }
    }

    // Extract unique BNCC skills evaluated in this exam to feed dashboard
    const uniqueSkillsMap = new Map<string, string>();
    questions.forEach((q) => {
      if (q.bnccCode) {
        uniqueSkillsMap.set(
          q.bnccCode.toUpperCase(),
          q.bnccSkillDescription || q.subjectTag || `Habilidade ${q.bnccCode}`
        );
      }
    });

    const bnccSkillsList = Array.from(uniqueSkillsMap.entries()).map(([code, description]) => ({
      code,
      description,
    }));

    const examToSave: Exam = {
      id: initialExam?.id || `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      description: description.trim(),
      institution: institution.trim(),
      subject: subject.trim(),
      gradeLevel: gradeLevel.trim(),
      teacherName: teacherName.trim(),
      durationMinutes: Number(durationMinutes) || 0,
      passingScore: Number(passingScore) || 6.0,
      totalScore: Math.round(totalPoints * 10) / 10,
      instructions: instructions.filter((i) => i.trim().length > 0),
      questions,
      bnccSkillsList,
      isAdaptedForInclusion,
      adaptationType,
      adaptationGuidelines,
      createdAt: initialExam?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(examToSave);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-200">
      {/* Inclusive Education (AEE) Banner if adapted */}
      {isAdaptedForInclusion && (
        <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-200/70 px-2.5 py-0.5 rounded-full">
                  ★ Avaliação Adaptada - Educação Inclusiva (AEE / {adaptationType.toUpperCase()})
                </span>
              </div>
              <p className="text-xs text-emerald-800 mt-1">
                Enunciados diretos, eliminação de metáforas, pistas visuais e redução de sobrecarga cognitiva conforme diretrizes do MEC.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAdaptModalOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-xl transition-colors"
            >
              Alterar Adaptação
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja desativar o modo de prova adaptada para esta avaliação?')) {
                  setIsAdaptedForInclusion(false);
                }
              }}
              className="p-1.5 text-emerald-700 hover:text-rose-600 rounded-lg"
              title="Desativar modo adaptado"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Editor de Avaliações
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800">
            {initialExam ? 'Editar Avaliação' : 'Criar Nova Avaliação'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Suporte a imagens, charges, textos de apoio de fontes confiáveis (PNLD/MEC/IBGE) e adaptação inclusiva (TEA / DI).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Inclusive Adaptation Trigger Button */}
          <button
            type="button"
            onClick={() => setIsAdaptModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors shadow-xs"
            title="Adaptar avaliação para alunos com Transtorno do Espectro Autista (TEA) ou Deficiência Intelectual"
          >
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            {isAdaptedForInclusion ? 'Ajustar AEE / TEA' : 'Adaptar p/ TEA & Def. Intelectual'}
          </button>

          <button
            type="button"
            onClick={() => {
              const currentExamDraft: Exam = {
                id: initialExam?.id || 'draft',
                title: title || 'Avaliação Escolar',
                description,
                institution,
                subject,
                gradeLevel,
                teacherName,
                durationMinutes,
                passingScore,
                totalScore: totalPoints,
                instructions,
                questions,
                isAdaptedForInclusion,
                adaptationType,
                adaptationGuidelines,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              exportExamToWord(currentExamDraft, false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            title="Baixar prova em formato Word (.doc)"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Word (.doc)
          </button>

          <button
            type="button"
            onClick={onOpenAiGenerator}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Gerar com IA
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleSaveExam}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all"
          >
            <Save className="w-4 h-4" />
            Salvar Avaliação
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div>
            <p className="font-semibold">Erro ao salvar prova</p>
            <p className="text-xs">{saveError}</p>
          </div>
        </div>
      )}

      {/* BNCC CURRICULUM SELECTION & DYNAMIC SKILLS VIEW */}
      <div className="bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white p-6 rounded-2xl border border-indigo-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              BNCC
            </span>
            <div>
              <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
                Seleção de Matéria e Série Vigentes (Base BNCC)
              </h3>
              <p className="text-xs text-indigo-700">
                Ao escolher a série e a matéria, as habilidades oficiais aparecem imediatamente abaixo para vincular às questões e alimentar o Dashboard.
              </p>
            </div>
          </div>

          {(gradeLevel || subject) && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-indigo-900 bg-indigo-100/80 px-2.5 py-1 rounded-lg">
                {gradeLevel || 'Série não selecionada'}
              </span>
              <span className="text-[11px] font-bold text-blue-900 bg-blue-100/80 px-2.5 py-1 rounded-lg">
                {subject || 'Matéria não selecionada'}
              </span>
            </div>
          )}
        </div>

        {/* Grade and Subject Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Selecione o Ano / Série da BNCC: <span className="text-rose-500">*</span>
            </label>
            <select
              value={gradeLevel}
              onChange={(e) => {
                const newGrade = e.target.value;
                setGradeLevel(newGrade);
                const matched = BNCC_CURRICULUM.find((b) => b.grade === newGrade);
                if (matched && matched.subjects.length > 0) {
                  const subjectStillExists = matched.subjects.some((s) => s.name === subject);
                  if (!subjectStillExists) {
                    setSubject(matched.subjects[0].name);
                  }
                }
              }}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-indigo-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            >
              <option value="">-- Escolha o Ano / Série --</option>
              {BNCC_CURRICULUM.map((b, idx) => (
                <option key={idx} value={b.grade}>
                  {b.stageLabel}: {b.grade}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Selecione a Matéria / Componente Curricular: <span className="text-rose-500">*</span>
            </label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-medium rounded-xl border border-indigo-200 bg-white text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500"
            >
              <option value="">-- Escolha a Matéria --</option>
              {availableSubjectsForGrade.length > 0 ? (
                availableSubjectsForGrade.map((subjName, idx) => (
                  <option key={idx} value={subjName}>
                    {subjName}
                  </option>
                ))
              ) : (
                <>
                  <option value="Língua Portuguesa">Língua Portuguesa</option>
                  <option value="Redação">Redação</option>
                  <option value="Matemática">Matemática</option>
                  <option value="Ciências da Natureza">Ciências da Natureza</option>
                  <option value="História">História</option>
                  <option value="Geografia">Geografia</option>
                  <option value="Biologia">Biologia</option>
                  <option value="Física">Física</option>
                  <option value="Química">Química</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* DYNAMIC BNCC SKILLS PANEL */}
        {gradeLevel && subject ? (
          availableBnccSkills.length > 0 ? (
            <div className="mt-4 pt-4 border-t border-indigo-100 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-3.5 rounded-xl border border-indigo-100">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">
                      Habilidades da BNCC Disponíveis ({availableBnccSkills.length})
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Clique em uma habilidade para criar questões objetivas/dissertativas diretamente vinculadas ao Dashboard de Proficiência.
                    </p>
                  </div>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bnccSkillFilter}
                    onChange={(e) => setBnccSkillFilter(e.target.value)}
                    placeholder="Filtrar por código ou termo..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:border-indigo-400"
                  />
                </div>
              </div>

              {/* Grid of Skill Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
                {filteredBnccSkills.map((skill) => {
                  const linkedCount = getQuestionsCountForSkill(skill.code);
                  return (
                    <div
                      key={skill.code}
                      className={`p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between ${
                        linkedCount > 0
                          ? 'bg-emerald-50/60 border-emerald-300 shadow-xs'
                          : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-mono text-xs font-black bg-indigo-100 text-indigo-800">
                            {skill.code}
                          </span>

                          {linkedCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              {linkedCount} questão(ões) vinculada(s)
                            </span>
                          ) : (
                            <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                              Pendente (0 na prova)
                            </span>
                          )}
                        </div>

                        <h5 className="text-xs font-bold text-slate-800 line-clamp-1">
                          {skill.title}
                        </h5>
                        <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                          {skill.description}
                        </p>
                      </div>

                      <div className="pt-3 mt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-indigo-600 font-medium">
                          Alimenta o Dashboard
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAddQuestionWithSkill('objective', skill)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1"
                            title="Criar questão objetiva vinculada a esta habilidade"
                          >
                            <Plus className="w-3 h-3" /> + Objetiva
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAddQuestionWithSkill('dissertative', skill)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg transition-colors flex items-center gap-1"
                            title="Criar questão dissertativa vinculada a esta habilidade"
                          >
                            <Plus className="w-3 h-3" /> + Dissertativa
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  Nenhuma habilidade pré-carregada para essa combinação exata. Você pode digitar o código BNCC manualmente em cada questão (ex: <code>EF09MA06</code> ou <code>EM13CNT201</code>).
                </span>
              </div>
            </div>
          )
        ) : (
          <div className="mt-2 p-3 bg-white/70 rounded-xl border border-dashed border-indigo-200 text-center">
            <p className="text-xs text-indigo-700 font-medium">
              💡 Selecione o <strong>Ano/Série</strong> e a <strong>Matéria</strong> acima para exibir as habilidades catalogadas da BNCC correspondentes.
            </p>
          </div>
        )}
      </div>

      {/* Basic Settings (Blank fields for teacher to fill as requested) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          Informações da Avaliação (Campos para Preenchimento do Professor)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título da Avaliação <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm font-medium rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="Digite o título da avaliação (Ex: 1ª Avaliação Bimestral de Matemática)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome da Escola Pública / Instituição
            </label>
            <input
              type="text"
              value={institution}
              onChange={(e) => setInstitution(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="Ex: Escola Estadual Professor José Silveira"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do(a) Professor(a)
            </label>
            <input
              type="text"
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="Ex: Prof. Marcos de Souza"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ano / Série / Turma Informada <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="Ex: 9º Ano A, 3ª Série do Ensino Médio..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Disciplina / Componente Curricular <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
              placeholder="Ex: Língua Portuguesa, Biologia, Matemática..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Tempo Limite (minutos, 0 = sem tempo)
            </label>
            <input
              type="number"
              min={0}
              max={300}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-slate-400" />
              Nota de Corte / Média de Aprovação
            </label>
            <input
              type="number"
              step="0.5"
              min={0}
              value={passingScore}
              onChange={(e) => setPassingScore(Number(e.target.value))}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Descrição Geral / Objetivos de Aprendizagem
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
              placeholder="Descreva o escopo da avaliação e orientações pedagógicas..."
            />
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700">
              Instruções aos Alunos
            </label>
            <button
              type="button"
              onClick={handleAddInstruction}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Instrução
            </button>
          </div>
          <div className="space-y-2">
            {instructions.map((inst, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 w-4 text-right">
                  {idx + 1}.
                </span>
                <input
                  type="text"
                  value={inst}
                  onChange={(e) => handleInstructionChange(idx, e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveInstruction(idx)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating or Top Summary Bar */}
      <div className="bg-indigo-900 text-white p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">
              Total de Questões
            </span>
            <span className="text-xl font-extrabold">{questions.length}</span>
          </div>
          <div className="border-l border-indigo-700 pl-4">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">
              Objetivas
            </span>
            <span className="text-xl font-bold text-indigo-200">{countObj}</span>
          </div>
          <div className="border-l border-indigo-700 pl-4">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">
              Dissertativas
            </span>
            <span className="text-xl font-bold text-purple-200">{countDiss}</span>
          </div>
          <div className="border-l border-indigo-700 pl-4">
            <span className="text-[10px] uppercase font-bold text-indigo-300 block">
              Pontuação Total
            </span>
            <span className="text-xl font-black text-amber-300">
              {totalPoints.toFixed(1)} pts
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddQuestion('objective')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> + Questão Objetiva
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestion('dissertative')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-700 hover:bg-purple-600 text-white rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> + Questão Dissertativa
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-slate-300 p-12 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <Plus className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-extrabold text-slate-800">
                Nenhuma questão adicionada ainda
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Adicione questões objetivas ou dissertativas para compor esta avaliação. Você também pode associar habilidades da BNCC ou gerar questões automaticamente com IA.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleAddQuestion('objective')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" /> + Nova Questão Objetiva
              </button>
              <button
                type="button"
                onClick={() => handleAddQuestion('dissertative')}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" /> + Nova Questão Dissertativa
              </button>
              <button
                type="button"
                onClick={onOpenAiGenerator}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <Sparkles className="w-4 h-4 text-slate-900" /> Gerar Prova com IA
              </button>
            </div>
          </div>
        ) : (
          questions.map((q, qIndex) => {
          return (
            <div
              key={q.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
            >
              {/* Question Card Top Bar */}
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="w-7 h-7 rounded-lg bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                    {qIndex + 1}
                  </span>

                  <span
                    className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      q.type === 'objective'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {q.type === 'objective' ? 'Objetiva' : 'Dissertativa'}
                  </span>

                  {/* Dropdown to select from available BNCC skills */}
                  {availableBnccSkills.length > 0 && (
                    <select
                      value={q.bnccCode || ''}
                      onChange={(e) => {
                        const chosenCode = e.target.value;
                        const found = availableBnccSkills.find((s) => s.code === chosenCode);
                        if (found) {
                          handleUpdateQuestion(q.id, {
                            bnccCode: found.code,
                            bnccSkillDescription: found.description,
                            subjectTag: found.title,
                          });
                        } else {
                          handleUpdateQuestion(q.id, { bnccCode: chosenCode });
                        }
                      }}
                      className="px-2.5 py-1 text-xs rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-900 font-semibold focus:outline-none focus:border-indigo-500 max-w-[190px]"
                      title="Selecione uma habilidade da BNCC para alimentar o dashboard"
                    >
                      <option value="">-- Vincular Habilidade BNCC --</option>
                      {availableBnccSkills.map((s) => (
                        <option key={s.code} value={s.code}>
                          {s.code} - {s.title}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Manual Code Input */}
                  <input
                    type="text"
                    value={q.bnccCode || ''}
                    onChange={(e) => {
                      const codeVal = e.target.value.toUpperCase();
                      const found = findSkillByBnccCode(codeVal);
                      handleUpdateQuestion(q.id, {
                        bnccCode: codeVal,
                        bnccSkillDescription: found?.description || q.bnccSkillDescription,
                        subjectTag: found?.title || q.subjectTag,
                      });
                    }}
                    placeholder="Cód. BNCC (ex: EF09CI01)"
                    className="px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-indigo-200 bg-indigo-50/50 text-indigo-900 focus:outline-none focus:border-indigo-500 w-32 uppercase"
                  />

                  <input
                    type="text"
                    value={q.subjectTag || ''}
                    onChange={(e) => handleUpdateQuestion(q.id, { subjectTag: e.target.value })}
                    placeholder="Conteúdo / Tema"
                    className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-indigo-500 w-32"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-slate-600">Pontos:</span>
                    <input
                      type="number"
                      step="0.5"
                      min={0.1}
                      value={q.points}
                      onChange={(e) =>
                        handleUpdateQuestion(q.id, { points: Number(e.target.value) || 1 })
                      }
                      className="w-16 px-2 py-1 text-xs font-bold text-center rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-center border-l border-slate-200 pl-3 gap-1">
                    <button
                      type="button"
                      disabled={qIndex === 0}
                      onClick={() => handleMoveQuestion(qIndex, 'up')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                      title="Mover para cima"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={qIndex === questions.length - 1}
                      onClick={() => handleMoveQuestion(qIndex, 'down')}
                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 rounded"
                      title="Mover para baixo"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveQuestion(q.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded ml-1"
                      title="Excluir questão"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* BNCC Skill Description Badge if linked */}
              {q.bnccCode && (
                <div className="px-5 py-2 bg-indigo-50/50 border-b border-indigo-100 flex items-center justify-between text-xs text-indigo-900 gap-2">
                  <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                    <span className="font-bold text-indigo-800 shrink-0 font-mono">
                      {q.bnccCode}
                    </span>
                    <span className="text-slate-600 truncate">
                      {q.bnccSkillDescription || q.subjectTag || 'Habilidade curricular vinculada'}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0">
                    Alimenta Dashboard
                  </span>
                </div>
              )}

              {/* Question Body */}
              <div className="p-6 space-y-5">
                {/* 1. SUPPORTING TEXT SECTION (PNLD, MEC, IBGE, Scielo) */}
                {q.supportingText ? (
                  <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 relative space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Quote className="w-4 h-4 text-blue-700" />
                        <input
                          type="text"
                          value={q.supportingTextTitle || 'Texto I: Texto de Apoio'}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, { supportingTextTitle: e.target.value })
                          }
                          placeholder="Título do Texto de Apoio..."
                          className="font-bold text-xs text-blue-950 bg-white/80 px-2 py-0.5 rounded border border-blue-200 outline-none w-72"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuestion(q.id, {
                            supportingText: undefined,
                            supportingTextTitle: undefined,
                            supportingTextSource: undefined,
                          })
                        }
                        className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remover Texto de Apoio
                      </button>
                    </div>

                    <textarea
                      rows={3}
                      value={q.supportingText}
                      onChange={(e) =>
                        handleUpdateQuestion(q.id, { supportingText: e.target.value })
                      }
                      placeholder="Conteúdo do texto de apoio..."
                      className="w-full text-xs leading-relaxed p-2.5 rounded-lg border border-blue-200 bg-white text-slate-800 outline-none focus:border-blue-500 font-serif"
                    />

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-bold text-blue-800 uppercase">
                        Fonte da Citação:
                      </span>
                      <input
                        type="text"
                        value={q.supportingTextSource || ''}
                        onChange={(e) =>
                          handleUpdateQuestion(q.id, { supportingTextSource: e.target.value })
                        }
                        placeholder="Ex: BRASIL. Ministério da Educação (MEC). Guia PNLD / IBGE Censo 2022..."
                        className="flex-1 text-xs text-slate-700 bg-white px-2.5 py-1 rounded border border-blue-200 outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {activeSupportingTextQId === q.id ? (
                      <div className="w-full p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                            <BookOpen className="w-4 h-4 text-blue-700" />
                            Gerar Texto de Apoio com Base em Dados Públicos e Fontes Confiáveis
                          </h4>
                          <button
                            type="button"
                            onClick={() => setActiveSupportingTextQId(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[11px] text-blue-700">
                          Selecione o órgão de referência oficial para a IA pesquisar e estruturar o texto motivador com citação ABNT:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {[
                            { id: 'pnld', label: 'PNLD (Livros MEC)', desc: 'Material didático oficial' },
                            { id: 'mec', label: 'MEC / INEP', desc: 'Diretrizes curriculares' },
                            { id: 'ibge', label: 'IBGE Estatísticas', desc: 'Censo e demografia' },
                            { id: 'scielo', label: 'Scielo Artigos', desc: 'Pesquisa acadêmica' },
                            { id: 'fiocruz', label: 'Fiocruz', desc: 'Saúde e ciência' },
                            { id: 'constituicao', label: 'Constituição Federal', desc: 'Legislação e cidadania' },
                          ].map((src) => (
                            <button
                              key={src.id}
                              type="button"
                              disabled={generatingSupportingTextQId === q.id}
                              onClick={() => handleGenerateSupportingTextAction(q.id, src.id as any)}
                              className="p-2 bg-white hover:bg-blue-100/70 border border-blue-200 rounded-lg text-left transition-colors"
                            >
                              <span className="text-xs font-bold text-blue-900 block">
                                {src.label}
                              </span>
                              <span className="text-[10px] text-slate-500">{src.desc}</span>
                            </button>
                          ))}
                        </div>
                        {generatingSupportingTextQId === q.id && (
                          <div className="text-xs text-blue-800 font-semibold flex items-center gap-2">
                            <Sparkles className="w-4 h-4 animate-spin text-blue-600" />
                            Pesquisando dados públicos e formulando texto de apoio...
                          </div>
                        )}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveSupportingTextQId(q.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-colors"
                      >
                        <Quote className="w-3.5 h-3.5" /> + Texto de Apoio (Fontes Públicas: PNLD / MEC / IBGE)
                      </button>
                    )}
                  </div>
                )}

                {/* 2. IMAGE / CHARGE / INFOGRAPHIC SECTION */}
                {q.imageUrl ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5">
                        <ImageIcon className="w-4 h-4 text-indigo-600" />
                        Imagem / Charge / Gráfico Anexado
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleUpdateQuestion(q.id, {
                            imageUrl: undefined,
                            imageCaption: undefined,
                            imageSource: undefined,
                          })
                        }
                        className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 font-medium"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remover Imagem
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                      <img
                        src={q.imageUrl}
                        alt={q.imageCaption || 'Imagem da questão'}
                        className="max-h-48 max-w-full rounded-lg object-contain border border-slate-200 shadow-xs"
                      />
                      <div className="flex-1 w-full space-y-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Legenda / Título da Imagem:
                          </label>
                          <input
                            type="text"
                            value={q.imageCaption || ''}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, { imageCaption: e.target.value })
                            }
                            placeholder="Ex: Figura 1: Charge sobre a Revolução Industrial"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Créditos / Fonte da Imagem:
                          </label>
                          <input
                            type="text"
                            value={q.imageSource || ''}
                            onChange={(e) =>
                              handleUpdateQuestion(q.id, { imageSource: e.target.value })
                            }
                            placeholder="Ex: Fonte: Acervo Histórico Nacional / Domínio Público"
                            className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {activeImageUploadQId === q.id ? (
                      <div className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-indigo-600" />
                            Adicionar Imagem, Charge ou Gráfico à Questão
                          </h4>
                          <button
                            type="button"
                            onClick={() => setActiveImageUploadQId(null)}
                            className="text-slate-400 hover:text-slate-600"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {/* Option A: Upload File */}
                          <label className="p-4 bg-white rounded-xl border border-dashed border-indigo-300 hover:bg-indigo-50/50 cursor-pointer flex flex-col items-center justify-center text-center transition-colors">
                            <Upload className="w-6 h-6 text-indigo-600 mb-1" />
                            <span className="text-xs font-bold text-slate-800">
                              Enviar Imagem do Computador
                            </span>
                            <span className="text-[10px] text-slate-500">
                              PNG, JPG, SVG, WebP (incorporada automaticamente)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUploadForQuestion(q.id, e)}
                              className="hidden"
                            />
                          </label>

                          {/* Option B: Direct URL */}
                          <div className="p-3 bg-white rounded-xl border border-slate-200 flex flex-col justify-between space-y-2">
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">
                                Inserir Link da Imagem / Web
                              </span>
                              <input
                                type="url"
                                placeholder="https://exemplo.com/imagem.jpg"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    const val = (e.target as HTMLInputElement).value;
                                    if (val) {
                                      handleUpdateQuestion(q.id, {
                                        imageUrl: val,
                                        imageCaption: 'Ilustração da Questão',
                                        imageSource: 'Fonte: Domínio Público / Acervo Didático',
                                      });
                                      setActiveImageUploadQId(null);
                                    }
                                  }
                                }}
                                className="w-full mt-1.5 px-2.5 py-1 text-xs rounded-lg border border-slate-200 outline-none"
                              />
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Pressione Enter para carregar a URL
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setActiveImageUploadQId(q.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-600" /> + Imagem / Charge / Gráfico
                      </button>
                    )}
                  </div>
                )}

                {/* 3. INCLUSIVE VISUAL CUES & MEDIATION NOTES (TEA / Deficiência Intelectual) */}
                {(isAdaptedForInclusion || q.isAdaptedForInclusion) && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Adaptações AEE (Educação Inclusiva / TEA & Deficiência Intelectual)</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          💡 Pista Visual / Apoio Cognitivo para o Estudante:
                        </label>
                        <input
                          type="text"
                          value={q.visualCue || ''}
                          onChange={(e) => handleUpdateQuestion(q.id, { visualCue: e.target.value })}
                          placeholder="Ex: Pista: Lembre-se que o triângulo possui 3 lados e a soma dos ângulos é 180°"
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-amber-200 bg-white focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-900 mb-1">
                          📌 Orientações de Mediação Pedagógica (Professor / Mediador):
                        </label>
                        <input
                          type="text"
                          value={q.adaptationNotes || ''}
                          onChange={(e) =>
                            handleUpdateQuestion(q.id, { adaptationNotes: e.target.value })
                          }
                          placeholder="Ex: Permita que o aluno aponte a resposta ou dite oralmente..."
                          className="w-full text-xs px-3 py-1.5 rounded-lg border border-amber-200 bg-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* 4. STATEMENT */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Enunciado da Questão
                  </label>
                  <textarea
                    rows={3}
                    value={q.statement}
                    onChange={(e) => handleUpdateQuestion(q.id, { statement: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                    placeholder="Digite o enunciado completo..."
                  />
                </div>

                {/* OBJECTIVE: Alternatives */}
                {q.type === 'objective' && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Alternativas (Selecione a correta no botão redondo):
                      </span>
                      <button
                        type="button"
                        onClick={() => handleAddOption(q.id)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" /> Adicionar Alternativa
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {q.options?.map((opt, optIndex) => (
                        <div
                          key={opt.id}
                          className={`p-3 rounded-xl border transition-all ${
                            opt.isCorrect
                              ? 'bg-emerald-50/70 border-emerald-300'
                              : 'bg-slate-50 border-slate-200'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Radio for isCorrect */}
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateOption(q.id, optIndex, { isCorrect: true })
                              }
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-1 transition-all ${
                                opt.isCorrect
                                  ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-200'
                                  : 'bg-white text-slate-600 border border-slate-300 hover:border-slate-500'
                              }`}
                              title={opt.isCorrect ? 'Gabarito Correto' : 'Clique para marcar como correta'}
                            >
                              {opt.id}
                            </button>

                            <div className="flex-1 space-y-1.5">
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) =>
                                  handleUpdateOption(q.id, optIndex, { text: e.target.value })
                                }
                                placeholder={`Texto da alternativa ${opt.id}...`}
                                className="w-full px-3 py-1.5 text-xs bg-white rounded-lg border border-slate-200 focus:border-indigo-500 outline-none"
                              />
                              <input
                                type="text"
                                value={opt.explanation || ''}
                                onChange={(e) =>
                                  handleUpdateOption(q.id, optIndex, { explanation: e.target.value })
                                }
                                placeholder="Justificativa / Comentário didático (por que está certa ou errada?)"
                                className="w-full px-3 py-1 text-[11px] bg-white/70 rounded-md border border-slate-200/70 text-slate-600 focus:outline-none"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveOption(q.id, optIndex)}
                              disabled={q.options && q.options.length <= 2}
                              className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-20 rounded"
                              title="Remover alternativa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* DISSERTATIVE: Model Answer & Rubric */}
                {q.type === 'dissertative' && (
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                        Gabarito Modelo e Critérios de Correção
                      </span>
                      <button
                        type="button"
                        disabled={generatingRubricId === q.id}
                        onClick={() => handleGenerateRubricWithAI(q)}
                        className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors border border-purple-200"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        {generatingRubricId === q.id
                          ? 'Gerando Rubrica...'
                          : 'Sugerir Rubrica com IA'}
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Resposta Padrão Esperada (Gabarito do Professor)
                      </label>
                      <textarea
                        rows={3}
                        value={q.expectedAnswer || ''}
                        onChange={(e) =>
                          handleUpdateQuestion(q.id, { expectedAnswer: e.target.value })
                        }
                        placeholder="Descreva detalhadamente o que o aluno deve responder para pontuação total..."
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none"
                      />
                    </div>

                    {/* Rubric Criteria */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-slate-700">
                          Critérios da Rubrica de Correção
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddRubricCriterion(q.id)}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" /> Adicionar Critério
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(q.rubric || []).map((crit, cIdx) => (
                          <div
                            key={crit.id || cIdx}
                            className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-start gap-3"
                          >
                            <div className="flex-1 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={crit.title}
                                  onChange={(e) =>
                                    handleUpdateRubricCriterion(q.id, cIdx, {
                                      title: e.target.value,
                                    })
                                  }
                                  placeholder="Nome do critério (Ex: Domínio Conceitual)"
                                  className="flex-1 px-3 py-1 text-xs font-semibold bg-white rounded-lg border border-slate-200 focus:outline-none"
                                />
                                <div className="flex items-center gap-1">
                                  <span className="text-[11px] text-slate-500">Máx:</span>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min={0.1}
                                    value={crit.maxScore}
                                    onChange={(e) =>
                                      handleUpdateRubricCriterion(q.id, cIdx, {
                                        maxScore: Number(e.target.value) || 0.5,
                                      })
                                    }
                                    className="w-16 px-2 py-1 text-xs font-bold text-center bg-white rounded-lg border border-slate-200 focus:outline-none"
                                  />
                                  <span className="text-[11px] text-slate-500">pts</span>
                                </div>
                              </div>
                              <input
                                type="text"
                                value={crit.description}
                                onChange={(e) =>
                                  handleUpdateRubricCriterion(q.id, cIdx, {
                                    description: e.target.value,
                                  })
                                }
                                placeholder="O que o aluno deve cumprir para obter esta pontuação?"
                                className="w-full px-3 py-1 text-xs bg-white rounded-lg border border-slate-200 text-slate-600 focus:outline-none"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveRubricCriterion(q.id, cIdx)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Remover critério"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
      </div>

      {/* Bottom Save Bar */}
      <div className="pt-4 flex items-center justify-between border-t border-slate-200">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleAddQuestion('objective')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Questão Objetiva
          </button>
          <button
            type="button"
            onClick={() => handleAddQuestion('dissertative')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-xl text-xs font-semibold transition-all"
          >
            <Plus className="w-4 h-4" /> Nova Questão Dissertativa
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSaveExam}
            className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-200 transition-all"
          >
            <Save className="w-4 h-4" /> Salvar Avaliação Completa
          </button>
        </div>
      </div>

      {/* INCLUSIVE ADAPTATION MODAL (TEA / DEFICIÊNCIA INTELECTUAL) */}
      {isAdaptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-200">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    Adaptação Curricular Inclusiva (AEE)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Conforme diretrizes do Ministério da Educação para estudantes com necessidades especiais
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdaptModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
              <strong>Como funciona a adaptação pedagógica:</strong> Mantém as mesmas habilidades da BNCC desta prova, ajustando a acessibilidade cognitiva (linguagem literal, eliminação de metáforas/duplo sentido, pistas visuais e redução de distratores de 4 para 3).
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">
                Selecione o Perfil de Adaptação:
              </label>

              <div className="space-y-2">
                {[
                  {
                    id: 'tea',
                    title: 'Transtorno do Espectro Autista (TEA)',
                    desc: 'Linguagem estritamente literal, eliminação de ambiguidades e metáforas, pistas visuais concretas, organização de rotina clara e previsível.',
                  },
                  {
                    id: 'deficiencia_intelectual',
                    title: 'Deficiência Intelectual (DI)',
                    desc: 'Redução de sobrecarga cognitiva, 3 alternativas simples de alto contraste, enunciados fragmentados em passos lógicos e andaimes reflexivos.',
                  },
                  {
                    id: 'geral_aee',
                    title: 'Atendimento Educacional Especializado (AEE Geral)',
                    desc: 'Adequação combinada de acessibilidade cognitiva, facilitação de leitura e orientações didáticas para o mediador.',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer flex items-start gap-3 transition-all ${
                      adaptationType === item.id
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adaptationProfile"
                      checked={adaptationType === item.id}
                      onChange={() => setAdaptationType(item.id as any)}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">{item.title}</span>
                      <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isAdapting}
                onClick={() => setIsAdaptModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isAdapting}
                onClick={() => handleAdaptExamAction(adaptationType)}
                className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-200 transition-all disabled:opacity-50"
              >
                {isAdapting ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Adaptando Questões com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    Gerar Avaliação Adaptada com IA
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
