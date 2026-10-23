import {
  BnccSkillItem,
  BnccSubjectOption,
  BnccGradeOption,
  BNCC_COMPETENCIAS_GERAIS,
  BNCC_DATA_CURRICULUM,
} from './bnccSkillsData';

export type { BnccSkillItem, BnccSubjectOption, BnccGradeOption };
export { BNCC_COMPETENCIAS_GERAIS };
export const BNCC_CURRICULUM: BnccGradeOption[] = BNCC_DATA_CURRICULUM;

const MANUAL_BNCC_STORAGE_KEY = 'gabaritopro_manual_bncc_skills_v2';

export function getCustomBnccSkills(): BnccSkillItem[] {
  try {
    const raw = localStorage.getItem(MANUAL_BNCC_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Erro ao ler habilidades manuais da BNCC:', e);
    return [];
  }
}

export function saveCustomBnccSkill(skill: {
  code: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  area?: string;
  teacherAuthor?: string;
}): BnccSkillItem {
  const current = getCustomBnccSkills();
  const cleanCode = skill.code.trim().toUpperCase();

  const newSkill: BnccSkillItem = {
    code: cleanCode,
    title: skill.title.trim(),
    description: skill.description.trim(),
    area: skill.area || 'Currículo da Rede / Docente',
    objectOfKnowledge: 'Inserção manual personalizada pelo professor',
    origin: 'manual_docente',
  };

  const existingIdx = current.findIndex((s) => s.code === cleanCode);
  let updated: BnccSkillItem[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = newSkill;
  } else {
    updated = [newSkill, ...current];
  }

  localStorage.setItem(MANUAL_BNCC_STORAGE_KEY, JSON.stringify(updated));
  return newSkill;
}

export function normalizeStr(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function getAllBnccSkills(): {
  skill: BnccSkillItem;
  stage: string;
  grade: string;
  subject: string;
}[] {
  const list: {
    skill: BnccSkillItem;
    stage: string;
    grade: string;
    subject: string;
  }[] = [];

  for (const gradeItem of BNCC_CURRICULUM) {
    for (const subjectItem of gradeItem.subjects) {
      for (const skill of subjectItem.skills) {
        list.push({
          skill,
          stage: gradeItem.stageLabel,
          grade: gradeItem.grade,
          subject: subjectItem.name,
        });
      }
    }
  }

  const customSkills = getCustomBnccSkills();
  for (const c of customSkills) {
    list.push({
      skill: c,
      stage: 'Inserção Manual Docente',
      grade: 'Personalizado',
      subject: 'Complementar',
    });
  }

  return list;
}

export function searchBnccSkills(params: {
  query?: string;
  stage?: string;
  grade?: string;
  subject?: string;
}): {
  skill: BnccSkillItem;
  stage: string;
  grade: string;
  subject: string;
}[] {
  const all = getAllBnccSkills();
  const qNorm = params.query ? normalizeStr(params.query) : '';
  const stageNorm = params.stage ? normalizeStr(params.stage) : '';
  const gradeNorm = params.grade ? normalizeStr(params.grade) : '';
  const subjectNorm = params.subject ? normalizeStr(params.subject) : '';

  return all.filter((item) => {
    if (stageNorm && !normalizeStr(item.stage).includes(stageNorm)) return false;
    if (gradeNorm && !normalizeStr(item.grade).includes(gradeNorm)) return false;
    if (subjectNorm && !normalizeStr(item.subject).includes(subjectNorm)) return false;

    if (qNorm) {
      const codeMatch = normalizeStr(item.skill.code).includes(qNorm);
      const titleMatch = normalizeStr(item.skill.title).includes(qNorm);
      const descMatch = normalizeStr(item.skill.description).includes(qNorm);
      const objMatch = item.skill.objectOfKnowledge ? normalizeStr(item.skill.objectOfKnowledge).includes(qNorm) : false;
      return codeMatch || titleMatch || descMatch || objMatch;
    }

    return true;
  });
}

export function getBnccSkillsForGradeAndSubject(
  grade: string,
  subject: string
): BnccSkillItem[] {
  if (!grade && !subject) return [];

  const normGrade = normalizeStr(grade);
  const normSubject = normalizeStr(subject);

  // Match grade and subject
  for (const gradeItem of BNCC_CURRICULUM) {
    const curGradeNorm = normalizeStr(gradeItem.grade);
    if (curGradeNorm.includes(normGrade) || normGrade.includes(curGradeNorm)) {
      for (const s of gradeItem.subjects) {
        const curSubjNorm = normalizeStr(s.name);
        if (curSubjNorm.includes(normSubject) || normSubject.includes(curSubjNorm)) {
          return s.skills;
        }
      }
    }
  }

  // Fallback by subject
  const fallbackList: BnccSkillItem[] = [];
  for (const gradeItem of BNCC_CURRICULUM) {
    for (const s of gradeItem.subjects) {
      if (normalizeStr(s.name).includes(normSubject) || normSubject.includes(normalizeStr(s.name))) {
        fallbackList.push(...s.skills);
      }
    }
  }

  const customSkills = getCustomBnccSkills();
  return [...fallbackList, ...customSkills];
}

export function findSkillByBnccCode(code: string): {
  code: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
  origin?: 'oficial_mec' | 'manual_docente';
} | null {
  if (!code) return null;
  const cleanCode = code.trim().toUpperCase();

  for (const gradeItem of BNCC_CURRICULUM) {
    for (const subjectItem of gradeItem.subjects) {
      for (const skill of subjectItem.skills) {
        if (skill.code.toUpperCase() === cleanCode) {
          return {
            ...skill,
            grade: gradeItem.grade,
            subject: subjectItem.name,
            origin: 'oficial_mec',
          };
        }
      }
    }
  }

  const custom = getCustomBnccSkills();
  const matchedCustom = custom.find((c) => c.code.toUpperCase() === cleanCode);
  if (matchedCustom) {
    return {
      ...matchedCustom,
      grade: 'Inserção Manual Docente',
      subject: matchedCustom.area || 'Currículo Local',
      origin: 'manual_docente',
    };
  }

  return null;
}

export function getBnccCoverageAuditReport(): {
  totalSkillsCount: number;
  officialMecCount: number;
  manualDocenteCount: number;
  competenciasGeraisCount: number;
  fundamental1Count: number;
  fundamental2Count: number;
  ensinoMedioCount: number;
  duplicateCodesDetected: string[];
  officialSources: { title: string; url: string; organ: string }[];
} {
  const all = getAllBnccSkills();
  const codeFrequency: Record<string, number> = {};
  const duplicates: string[] = [];

  let officialCount = 0;
  let manualCount = 0;
  let cgCount = 0;
  let f1Count = 0;
  let f2Count = 0;
  let emCount = 0;

  for (const item of all) {
    const code = item.skill.code;
    codeFrequency[code] = (codeFrequency[code] || 0) + 1;
    if (codeFrequency[code] === 2) {
      duplicates.push(code);
    }

    if (item.skill.origin === 'manual_docente') {
      manualCount++;
    } else {
      officialCount++;
    }

    if (item.skill.code.startsWith('CG')) cgCount++;
    else if (
      item.skill.code.startsWith('EF01') ||
      item.skill.code.startsWith('EF02') ||
      item.skill.code.startsWith('EF03') ||
      item.skill.code.startsWith('EF04') ||
      item.skill.code.startsWith('EF05') ||
      item.skill.code.startsWith('EF12') ||
      item.skill.code.startsWith('EF35')
    ) {
      f1Count++;
    } else if (
      item.skill.code.startsWith('EF06') ||
      item.skill.code.startsWith('EF07') ||
      item.skill.code.startsWith('EF08') ||
      item.skill.code.startsWith('EF09') ||
      item.skill.code.startsWith('EF67') ||
      item.skill.code.startsWith('EF89')
    ) {
      f2Count++;
    } else if (item.skill.code.startsWith('EM')) {
      emCount++;
    }
  }

  return {
    totalSkillsCount: all.length,
    officialMecCount: officialCount,
    manualDocenteCount: manualCount,
    competenciasGeraisCount: cgCount,
    fundamental1Count: f1Count,
    fundamental2Count: f2Count,
    ensinoMedioCount: emCount,
    duplicateCodesDetected: duplicates,
    officialSources: [
      {
        title: 'Portal Oficial da Base Nacional Comum Curricular (MEC)',
        url: 'https://basenacionalcomum.mec.gov.br/',
        organ: 'Ministério da Educação / Secretaria de Educação Básica',
      },
      {
        title: 'Documento Curricular Oficial do Ensino Médio (PDF CNE/MEC)',
        url: 'https://www.gov.br/mec/pt-br/cne/bncc_ensino_medio.pdf',
        organ: 'Conselho Nacional de Educação',
      },
      {
        title: 'Matriz de Referência e Competências do ENEM / INEP',
        url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem',
        organ: 'Instituto Nacional de Estudos e Pesquisas Educacionais Anísio Teixeira',
      },
    ],
  };
}
