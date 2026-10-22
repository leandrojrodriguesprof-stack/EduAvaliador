import * as XLSX from 'xlsx';
import { Exam, ExamSubmission, EnemEssaySubmission, BnccSkillPerformance } from '../types/exam';

// ----------------------------------------------------------------------------
// EXPORT TO WORD (.doc format with full Word styling & XML headers)
// ----------------------------------------------------------------------------
export function exportExamToWord(exam: Exam, includeAnswerKey: boolean = false) {
  const title = exam.title || 'Avaliação Escolar';
  const school = exam.institution || 'Escola Pública / Estadual / Municipal';
  const teacher = exam.teacherName || 'Docente Responsável';

  let htmlContent = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>${title}</title>
    <style>
      body { font-family: 'Calibri', 'Arial', sans-serif; font-size: 11pt; line-height: 1.4; color: #111; }
      .header-box { border: 2pt solid #000; padding: 12px; margin-bottom: 20px; }
      .school-title { font-size: 14pt; font-weight: bold; text-transform: uppercase; margin: 0; }
      .exam-title { font-size: 13pt; font-weight: bold; color: #1e3a8a; margin: 4px 0; }
      .info-row { margin-top: 6px; font-size: 10pt; }
      .student-line { margin-top: 10px; border-bottom: 1pt dotted #444; height: 18px; }
      .instructions { background-color: #f3f4f6; border: 1pt solid #d1d5db; padding: 8px; font-size: 9.5pt; margin-bottom: 20px; }
      .question-box { margin-bottom: 22px; page-break-inside: avoid; }
      .question-header { font-weight: bold; font-size: 11pt; color: #111827; }
      .bncc-tag { font-size: 9pt; color: #4338ca; font-style: italic; font-weight: normal; }
      .statement { margin: 6px 0 10px 0; font-size: 11pt; text-align: justify; }
      .option-item { margin-bottom: 5px; font-size: 10.5pt; }
      .option-letter { font-weight: bold; display: inline-block; width: 25px; }
      .correct-mark { background-color: #d1fae5; color: #065f46; font-weight: bold; padding: 2px 4px; }
      .answer-lines { margin-top: 8px; }
      .line { border-bottom: 1pt solid #cbd5e1; height: 26px; }
      .footer { margin-top: 30px; border-top: 1pt solid #ccc; font-size: 9pt; color: #666; text-align: center; }
    </style>
  </head>
  <body>
    <div class="header-box">
      <div class="school-title">${school}</div>
      <div class="exam-title">${title}</div>
      <div class="info-row">
        <strong>Componente Curricular:</strong> ${exam.subject || 'Geral'} &nbsp;|&nbsp;
        <strong>Etapa / Turma:</strong> ${exam.gradeLevel || 'Ensino Regular'} &nbsp;|&nbsp;
        <strong>Professor(a):</strong> ${teacher}
      </div>
      <div style="margin-top: 12px;">
        <strong>Nome do(a) Aluno(a):</strong> ____________________________________________________ &nbsp;
        <strong>Matrícula:</strong> _______________ &nbsp;
        <strong>Data:</strong> ____/____/2026 &nbsp;
        <strong>Nota:</strong> [ ____ / ${exam.totalScore.toFixed(1)} ]
      </div>
    </div>

    ${
      exam.isAdaptedForInclusion
        ? `
      <div style="background-color: #ecfdf5; border: 2pt solid #059669; padding: 10px; margin-bottom: 15px; border-radius: 4px;">
        <strong style="color: #065f46; font-size: 11pt;">★ AVALIAÇÃO ADAPTADA - EDUCAÇÃO ESPECIAL INCLUSIVA (AEE / ${exam.adaptationType?.toUpperCase() || 'INCLUSÃO'})</strong>
        <p style="margin: 4px 0 0 0; font-size: 9pt; color: #047857;">Esta avaliação possui adequações pedagógicas curriculares (linguagem objetiva, redução de distratores e pistas cognitivas) conforme diretrizes do MEC.</p>
        ${
          exam.adaptationGuidelines && exam.adaptationGuidelines.length > 0
            ? `<ul style="font-size: 8.5pt; color: #065f46; margin: 4px 0 0 16px;">
                ${exam.adaptationGuidelines.map((g) => `<li>${g}</li>`).join('')}
              </ul>`
            : ''
        }
      </div>
      `
        : ''
    }

    ${
      exam.instructions && exam.instructions.length > 0
        ? `
      <div class="instructions">
        <strong>ORIENTAÇÕES GERAIS:</strong>
        <ul>
          ${exam.instructions.map((i) => `<li>${i}</li>`).join('')}
          ${exam.durationMinutes > 0 ? `<li>Tempo limite estimado: ${exam.durationMinutes} minutos.</li>` : ''}
        </ul>
      </div>
      `
        : ''
    }

    ${exam.questions
      .map((q, idx) => {
        const num = q.order || idx + 1;
        return `
        <div class="question-box">
          <div class="question-header">
            QUESTÃO ${num} &bull; Valor: ${q.points.toFixed(1)} pt(s)
            ${q.bnccCode ? `<span class="bncc-tag">[Habilidade BNCC: ${q.bnccCode}]</span>` : ''}
            ${q.isAdaptedForInclusion ? `<span style="background-color: #d1fae5; color: #065f46; font-size: 8.5pt; font-weight: bold; padding: 1px 5px; border-radius: 3px; margin-left: 6px;">[ADAPTADA AEE]</span>` : ''}
          </div>

          ${
            q.supportingText
              ? `
            <div style="background-color: #f8fafc; border-left: 3pt solid #2563eb; padding: 10px 12px; margin: 8px 0; font-size: 10pt; color: #1e293b;">
              <strong style="color: #1e3a8a; font-size: 10pt;">${q.supportingTextTitle || 'TEXTO DE APOIO'}:</strong>
              <div style="margin-top: 4px; font-style: italic; line-height: 1.45;">"${q.supportingText}"</div>
              ${q.supportingTextSource ? `<div style="font-size: 8.5pt; color: #64748b; margin-top: 5px; text-align: right;">— Fonte: ${q.supportingTextSource}</div>` : ''}
            </div>
          `
              : ''
          }

          ${
            q.imageUrl
              ? `
            <div style="margin: 10px 0; text-align: center;">
              <img src="${q.imageUrl}" style="max-width: 480px; width: 100%; max-height: 320px; object-fit: contain; border: 1pt solid #cbd5e1;" alt="${q.imageCaption || 'Imagem da questão'}" />
              ${
                q.imageCaption || q.imageSource
                  ? `<div style="font-size: 8.5pt; color: #475569; font-style: italic; margin-top: 4px;">
                      ${q.imageCaption ? `<strong>${q.imageCaption}</strong>` : ''}
                      ${q.imageSource ? ` (${q.imageSource})` : ''}
                    </div>`
                  : ''
              }
            </div>
          `
              : ''
          }

          ${
            q.visualCue
              ? `
            <div style="background-color: #fef3c7; border: 1pt dashed #d97706; padding: 6px 10px; margin: 6px 0; font-size: 9.5pt; color: #92400e;">
              <strong>💡 Pista de Leitura / Apoio Cognitivo:</strong> ${q.visualCue}
            </div>
          `
              : ''
          }

          <div class="statement">${q.statement}</div>
          
          ${
            q.type === 'objective' && q.options
              ? q.options
                  .map(
                    (opt) => `
                <div class="option-item ${includeAnswerKey && opt.isCorrect ? 'correct-mark' : ''}">
                  <span class="option-letter">(${opt.id})</span> ${opt.text}
                  ${includeAnswerKey && opt.isCorrect ? ' <strong>[GABARITO CORRETO]</strong>' : ''}
                  ${includeAnswerKey && opt.explanation ? `<br><small style="color: #047857; margin-left: 25px;"><em>Comentário: ${opt.explanation}</em></small>` : ''}
                </div>
              `
                  )
                  .join('')
              : `
                ${
                  includeAnswerKey
                    ? `
                  <div style="background-color: #f9fafb; border: 1pt solid #e5e7eb; padding: 8px; margin-top: 6px;">
                    <strong>Resposta Modelo Esperada:</strong><br>
                    <p style="font-style: italic; color: #374151; margin: 4px 0;">${q.expectedAnswer || 'Resposta fundamentada nos conceitos da disciplina.'}</p>
                    ${
                      q.rubric && q.rubric.length > 0
                        ? `
                      <strong style="font-size: 9pt;">Critérios de Correção (Rubrica):</strong>
                      <ul style="font-size: 9pt; margin: 2px 0 0 16px;">
                        ${q.rubric.map((r) => `<li>${r.title} (máx. ${r.maxScore} pts): ${r.description}</li>`).join('')}
                      </ul>
                    `
                        : ''
                    }
                  </div>
                `
                    : `
                  <div class="answer-lines">
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                  </div>
                `
                }
              `
          }

          ${
            includeAnswerKey && q.adaptationNotes
              ? `<div style="margin-top: 6px; font-size: 8.5pt; color: #047857; background-color: #f0fdf4; padding: 4px 8px; border-left: 2pt solid #10b981;">
                  <strong>Orientações para o Mediador / AEE:</strong> ${q.adaptationNotes}
                </div>`
              : ''
          }
        </div>
        `;
      })
      .join('')}

    <div class="footer">
      GabaritoPro Avaliações &copy; 2026 - Documento alinhado às diretrizes da BNCC e Ministério da Educação.
    </div>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/\s+/g, '_')}_${includeAnswerKey ? 'GABARITO' : 'PROVA'}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------------
// EXPORT ESSAY (REDAÇÃO ENEM) TO WORD (.doc)
// ----------------------------------------------------------------------------
export function exportEnemEssayToWord(essay: EnemEssaySubmission) {
  const htmlContent = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>Espelho de Correção Redação ENEM - ${essay.studentName}</title>
    <style>
      body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #111; }
      .header-box { border: 2pt solid #1e3a8a; padding: 12px; margin-bottom: 20px; }
      .title { font-size: 15pt; font-weight: bold; color: #1e3a8a; margin: 0; }
      .score-badge { font-size: 20pt; font-weight: bold; color: #047857; text-align: right; }
      table { width: 100%; border-collapse: collapse; margin-top: 15px; }
      th, td { border: 1pt solid #cbd5e1; padding: 8px; text-align: left; font-size: 10pt; }
      th { background-color: #f1f5f9; color: #1e293b; }
      .essay-box { background-color: #fafafa; border: 1pt solid #ddd; padding: 12px; margin: 15px 0; font-family: 'Georgia', serif; font-size: 11pt; line-height: 1.6; }
    </style>
  </head>
  <body>
    <div class="header-box">
      <div style="display: flex; justify-content: space-between;">
        <div>
          <div class="title">ESPELHO DE CORREÇÃO DE REDAÇÃO - PADRÃO ENEM / MEC</div>
          <div><strong>Tema:</strong> ${essay.theme}</div>
          <div><strong>Estudante:</strong> ${essay.studentName} &nbsp;|&nbsp; <strong>Matrícula:</strong> ${essay.studentRegistration || 'N/A'}</div>
          <div><strong>Escola:</strong> ${essay.schoolName || 'Escola Pública'}</div>
        </div>
        <div class="score-badge">
          NOTA FINAL: ${essay.totalScore} / 1000
        </div>
      </div>
    </div>

    <h3>1. Texto da Redação Produzida:</h3>
    <div class="essay-box">
      ${essay.essayText.replace(/\n/g, '<br>')}
    </div>

    <h3>2. Desempenho nas 5 Competências Oficiais do ENEM:</h3>
    <table>
      <thead>
        <tr>
          <th>Competência</th>
          <th>Foco de Avaliação</th>
          <th style="width: 80px; text-align: center;">Nota</th>
          <th>Parecer Detalhado & Diagnóstico</th>
        </tr>
      </thead>
      <tbody>
        ${essay.competencies
          .map(
            (c) => `
          <tr>
            <td><strong>Competência ${c.competencyNumber}</strong></td>
            <td>${c.shortName}</td>
            <td style="text-align: center; font-weight: bold; color: #1e3a8a;">${c.score} / 200</td>
            <td>${c.feedback}</td>
          </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <h3>3. Análise da Proposta de Intervenção (Competência 5):</h3>
    <ul>
      <li><strong>Agente (Quem fará?):</strong> ${essay.interventionDetails.agent.present ? 'Identificado' : 'Ausente/Incompleto'} - ${essay.interventionDetails.agent.text || ''}</li>
      <li><strong>Ação (O que fará?):</strong> ${essay.interventionDetails.action.present ? 'Identificado' : 'Ausente/Incompleto'} - ${essay.interventionDetails.action.text || ''}</li>
      <li><strong>Meio/Modo (Como fará?):</strong> ${essay.interventionDetails.means.present ? 'Identificado' : 'Ausente/Incompleto'} - ${essay.interventionDetails.means.text || ''}</li>
      <li><strong>Efeito/Finalidade (Para que fará?):</strong> ${essay.interventionDetails.effect.present ? 'Identificado' : 'Ausente/Incompleto'} - ${essay.interventionDetails.effect.text || ''}</li>
      <li><strong>Detalhamento (Informação adicional):</strong> ${essay.interventionDetails.detailing.present ? 'Identificado' : 'Ausente/Incompleto'} - ${essay.interventionDetails.detailing.text || ''}</li>
    </ul>

    <h3>4. Parecer Pedagógico Geral:</h3>
    <p>${essay.summaryPedagogical}</p>

    <div style="margin-top: 25px; border-top: 1pt solid #ccc; font-size: 9pt; color: #666; text-align: center;">
      GabaritoPro Avaliações &copy; 2026 - Sistema alinhado à Matriz de Referência do ENEM e MEC.
    </div>
  </body>
  </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Redacao_ENEM_${essay.studentName.replace(/\s+/g, '_')}_Nota_${essay.totalScore}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ----------------------------------------------------------------------------
// EXPORT EXCEL SPREADSHEET (.xlsx) WITH BNCC METRICS & STUDENTS GRADES
// ----------------------------------------------------------------------------
export function exportClassPerformanceToExcel(
  exam: Exam,
  submissions: ExamSubmission[],
  bnccPerformance: BnccSkillPerformance[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Sheet: Desempenho Geral dos Estudantes
  const studentsData = submissions.map((s, idx) => {
    let levelLabel = 'Abaixo do Básico';
    if (s.percentage >= 85) levelLabel = 'Avançado';
    else if (s.percentage >= 70) levelLabel = 'Adequado';
    else if (s.percentage >= 50) levelLabel = 'Básico';

    return {
      'Nº': idx + 1,
      'Estudante': s.studentName,
      'Matrícula / RA': s.studentRegistration || 'N/I',
      'Parte Objetiva (pts)': s.objectiveScore,
      'Parte Dissertativa (pts)': s.dissertativeScore,
      'Nota Total': s.totalScore,
      'Total Possível': exam.totalScore,
      'Aproveitamento (%)': `${s.percentage}%`,
      'Nível de Proficiência BNCC': levelLabel,
      'Status': s.status === 'graded' ? 'Corrigido' : 'Pendente',
      'Data de Entrega': new Date(s.submittedAt).toLocaleDateString('pt-BR'),
    };
  });

  const wsStudents = XLSX.utils.json_to_sheet(studentsData);
  XLSX.utils.book_append_sheet(wb, wsStudents, 'Desempenho da Turma');

  // 2. Sheet: Habilidades BNCC Analisadas
  const bnccData = bnccPerformance.map((b) => ({
    'Código BNCC': b.code,
    'Habilidade Descrita': b.description,
    'Componente': b.subject,
    'Questões Vinculadas': b.totalQuestions,
    'Respostas Totais': b.totalResponses,
    'Acertos da Turma': b.correctResponses,
    'Índice de Domínio (%)': `${b.percentage}%`,
    'Classificação': b.level.toUpperCase().replace(/_/g, ' '),
    'Intervenção Pedagógica Recomendada': b.suggestedAction,
  }));

  const wsBncc = XLSX.utils.json_to_sheet(bnccData);
  XLSX.utils.book_append_sheet(wb, wsBncc, 'Matriz Habilidades BNCC');

  // 3. Sheet: Questões da Prova
  const questionsData = exam.questions.map((q, idx) => ({
    'Questão': q.order || idx + 1,
    'Tipo': q.type === 'objective' ? 'Objetiva' : 'Dissertativa',
    'Pontos': q.points,
    'Código BNCC': q.bnccCode || 'Geral',
    'Enunciado': q.statement,
    'Gabarito':
      q.type === 'objective'
        ? q.options?.find((o) => o.isCorrect)?.id || '-'
        : q.expectedAnswer || 'Critérios de Rubrica',
  }));

  const wsQuestions = XLSX.utils.json_to_sheet(questionsData);
  XLSX.utils.book_append_sheet(wb, wsQuestions, 'Itens da Prova');

  // Generate binary and download
  XLSX.writeFile(wb, `Relatorio_Turma_${(exam.title || 'Avaliacao').replace(/\s+/g, '_')}.xlsx`);
}

// ----------------------------------------------------------------------------
// GOOGLE WORKSPACE / GOOGLE DRIVE EXPORT HELPER
// ----------------------------------------------------------------------------
export function openGoogleWorkspaceDriveExport(title: string, contentText: string) {
  // Prepares a clean clipboard copy or downloadable package with direct shortcut to Google Drive
  navigator.clipboard.writeText(contentText).then(() => {
    alert(
      'Documento formatado copiado para a área de transferência!\n\nVocê pode abrir o Google Drive / Google Docs e pressionar Ctrl+V para colar o texto completo com formatação direta.'
    );
  });
}
