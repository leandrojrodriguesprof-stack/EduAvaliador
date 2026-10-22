export interface BnccSkillItem {
  code: string;
  title: string;
  description: string;
}

export interface BnccSubjectOption {
  name: string;
  skills: BnccSkillItem[];
}

export interface BnccGradeOption {
  stage: 'fundamental_1' | 'fundamental_2' | 'medio';
  stageLabel: string;
  grade: string;
  subjects: BnccSubjectOption[];
}

export const BNCC_CURRICULUM: BnccGradeOption[] = [
  // -------------------------------------------------------------------------
  // ENSINO FUNDAMENTAL II (ANOS FINAIS)
  // -------------------------------------------------------------------------
  {
    stage: 'fundamental_2',
    stageLabel: 'Ensino Fundamental II (Anos Finais)',
    grade: '6º Ano',
    subjects: [
      {
        name: 'Língua Portuguesa',
        skills: [
          {
            code: 'EF67LP01',
            title: 'Leitura de Textos Divulgativos e Jornalísticos',
            description: 'Identificar a proposta comunicativa, tema central e fatos relatados em notícias e artigos de divulgação científica.',
          },
          {
            code: 'EF67LP08',
            title: 'Variedades Linguísticas e Norma Culta',
            description: 'Identificar os efeitos de sentido decorrentes do uso de variedades linguísticas e adequação ao contexto de interlocução.',
          },
          {
            code: 'EF06LP04',
            title: 'Morfossintaxe: Substantivos, Adjetivos e Verbos',
            description: 'Analisar a função e a flexão de classes de palavras na construção da coesão e expressividade textual.',
          },
        ],
      },
      {
        name: 'Matemática',
        skills: [
          {
            code: 'EF06MA01',
            title: 'Sistema de Numeração Decimal e Operações',
            description: 'Comparar, ordenar, ler e escrever números naturais e números racionais decimais, aplicando em situações-problema.',
          },
          {
            code: 'EF06MA07',
            title: 'Frações e Porcentagem Básica',
            description: 'Compreender diferentes significados das frações (parte/todo, quociente) e associá-los a representações decimais e percentuais (10%, 25%, 50%).',
          },
          {
            code: 'EF06MA18',
            title: 'Ângulos e Formas Geométricas',
            description: 'Reconhecer, nomear e comparar figuras geométricas espaciais e planas, identificando ângulos retos, agudos e obtusos.',
          },
        ],
      },
      {
        name: 'Ciências da Natureza',
        skills: [
          {
            code: 'EF06CI01',
            title: 'Misturas Homogêneas, Heterogêneas e Separação',
            description: 'Classificar como homogênea ou heterogênea a mistura de dois ou mais materiais e propor métodos adequados de separação.',
          },
          {
            code: 'EF06CI05',
            title: 'Célula como Unidade da Vida',
            description: 'Explicar a organização básica das células (membrana, citoplasma e núcleo) como unidade estrutural e funcional de todos os seres vivos.',
          },
          {
            code: 'EF06CI11',
            title: 'Camadas da Terra e Tectônica de Placas',
            description: 'Identificar as diferentes camadas que estruturam o planeta Terra e os movimentos das placas tectônicas.',
          },
        ],
      },
      {
        name: 'História',
        skills: [
          {
            code: 'EF06HI01',
            title: 'Fontes Históricas e Noção de Tempo',
            description: 'Identificar diferentes formas de periodização da história e o papel das fontes materiais, escritas e orais na reconstrução do passado.',
          },
          {
            code: 'EF06HI07',
            title: 'Antiguidade Clássica: Grécia e Roma',
            description: 'Identificar aspectos e legados das sociedades da Grécia e de Roma antigas, analisando o conceito de cidadania e democracia.',
          },
        ],
      },
      {
        name: 'Geografia',
        skills: [
          {
            code: 'EF06GE01',
            title: 'Conceito de Paisagem, Lugar e Espaço Geográfico',
            description: 'Comparar modificações das paisagens nos lugares de vivência e os usos desses espaços em diferentes tempos.',
          },
          {
            code: 'EF06GE08',
            title: 'Dinâmica Climática e Relevo',
            description: 'Explicar os fenômenos climáticos e a ação dos agentes internos e externos na formação do relevo terrestre.',
          },
        ],
      },
    ],
  },
  {
    stage: 'fundamental_2',
    stageLabel: 'Ensino Fundamental II (Anos Finais)',
    grade: '7º Ano',
    subjects: [
      {
        name: 'Língua Portuguesa',
        skills: [
          {
            code: 'EF67LP04',
            title: 'Distinção entre Fato e Opinião',
            description: 'Distinguir um fato da opinião relativa a esse mesmo fato em textos argumentativos e jornalísticos.',
          },
          {
            code: 'EF07LP07',
            title: 'Sintaxe do Período Simples',
            description: 'Identificar sujeito, predicado, transitividade verbal e complementos verbais em orações do período simples.',
          },
        ],
      },
      {
        name: 'Matemática',
        skills: [
          {
            code: 'EF07MA04',
            title: 'Números Inteiros (Positivos e Negativos)',
            description: 'Resolver e elaborar problemas com números inteiros envolvendo operações de adição, subtração, multiplicação e divisão na reta numérica.',
          },
          {
            code: 'EF07MA17',
            title: 'Equações Polinomiais de 1º Grau',
            description: 'Resolver e elaborar problemas que envolvam equações lineares de 1º grau aplicadas ao cotidiano.',
          },
          {
            code: 'EF07MA29',
            title: 'Proporcionalidade Direta e Inversa',
            description: 'Resolver e elaborar problemas que envolvam variação de proporcionalidade direta e inversa entre duas grandezas (Regra de Três).',
          },
        ],
      },
      {
        name: 'Ciências da Natureza',
        skills: [
          {
            code: 'EF07CI01',
            title: 'Máquinas Térmicas e Revolução Industrial',
            description: 'Discutir a evolução das máquinas térmicas e o uso de combustíveis fósseis no desenvolvimento tecnológico histórico.',
          },
          {
            code: 'EF07CI07',
            title: 'Biomas Brasileiros e Biodiversidade',
            description: 'Caracterizar os principais ecossistemas e biomas brasileiros em relação a clima, flora, fauna e impactos ambientais antrópicos.',
          },
        ],
      },
      {
        name: 'História',
        skills: [
          {
            code: 'EF07HI02',
            title: 'Feudalismo e Transição para a Idade Moderna',
            description: 'Identificar conexões e rupturas entre a Idade Média e a Idade Moderna, com ênfase nas transformações urbanas e mercantis.',
          },
          {
            code: 'EF07HI12',
            title: 'Colonização da América Portuguesa e Escravidão',
            description: 'Analisar as dinâmicas da ocupação territorial do Brasil colônia e a resistência das populações indígenas e negras escravizadas.',
          },
        ],
      },
      {
        name: 'Geografia',
        skills: [
          {
            code: 'EF07GE02',
            title: 'Regionalização do Território Brasileiro',
            description: 'Analisar a formação do território brasileiro e as diferentes formas de regionalização (Regiões IBGE e Geoeconômicas).',
          },
        ],
      },
    ],
  },
  {
    stage: 'fundamental_2',
    stageLabel: 'Ensino Fundamental II (Anos Finais)',
    grade: '8º Ano',
    subjects: [
      {
        name: 'Língua Portuguesa',
        skills: [
          {
            code: 'EF08LP04',
            title: 'Sintaxe e Concordância Verbal/Nominal',
            description: 'Utilizar conhecimentos linguísticos sobre sintaxe, regência e concordância verbal/nominal na produção textual.',
          },
          {
            code: 'EF89LP03',
            title: 'Leitura Crítica de Textos Jornalísticos e Fake News',
            description: 'Analisar criticamente notícias, reportagens e artigos de opinião identificando fake news e vieses informativos.',
          },
          {
            code: 'EF08LP11',
            title: 'Figuras de Sintaxe e Efeitos de Sentido',
            description: 'Identificar efeitos de sentido decorrentes do uso de figuras de sintaxe (elipse, polissíndeto, hipérbato, anáfora).',
          },
        ],
      },
      {
        name: 'Matemática',
        skills: [
          {
            code: 'EF08MA06',
            title: 'Sistemas de Equações do 1º Grau',
            description: 'Resolver e elaborar problemas que envolvam sistemas de equações lineares de 1º grau por métodos gráficos e algébricos.',
          },
          {
            code: 'EF08MA19',
            title: 'Áreas de Figuras Planas e Círculos',
            description: 'Calcular a área de triângulos, quadriláteros e círculos em situações reais cotidianas.',
          },
          {
            code: 'EF08MA22',
            title: 'Estatística: Gráficos e Medidas de Tendência',
            description: 'Compreender e calcular média, moda e mediana, avaliando adequação de gráficos em pesquisas de opinião.',
          },
        ],
      },
      {
        name: 'Ciências da Natureza',
        skills: [
          {
            code: 'EF08CI01',
            title: 'Sistemas do Corpo Humano e Integração',
            description: 'Identificar e classificar os diferentes sistemas do corpo humano (circulatório, respiratório, digestório) e sua integração.',
          },
          {
            code: 'EF08CI05',
            title: 'Reprodução Humana e ISTs',
            description: 'Reconhecer as transformações anatômicas e fisiológicas na puberdade e discutir métodos contraceptivos e prevenção a ISTs.',
          },
          {
            code: 'EF08CI03',
            title: 'Circuitos Elétricos e Consumo Consciente de Energia',
            description: 'Classificar materiais condutores e isolantes e calcular o consumo elétrico em aparelhos domésticos.',
          },
        ],
      },
      {
        name: 'História',
        skills: [
          {
            code: 'EF08HI04',
            title: 'Iluminismo e Revolução Francesa',
            description: 'Identificar e relacionar os processos da Revolução Francesa e o pensamento iluminista com a Declaração dos Direitos.',
          },
          {
            code: 'EF08HI15',
            title: 'Independência do Brasil e Primeiro Reinado',
            description: 'Caracterizar a independência do Brasil e a consolidação do Império com a Constituição outorgada de 1824.',
          },
        ],
      },
      {
        name: 'Geografia',
        skills: [
          {
            code: 'EF08GE01',
            title: 'População Mundial e Dinâmicas Demográficas',
            description: 'Analisar pirâmides etárias, transição demográfica e os fluxos populacionais nos continentes.',
          },
        ],
      },
    ],
  },
  {
    stage: 'fundamental_2',
    stageLabel: 'Ensino Fundamental II (Anos Finais)',
    grade: '9º Ano',
    subjects: [
      {
        name: 'Língua Portuguesa',
        skills: [
          {
            code: 'EF89LP04',
            title: 'Identificação de Teses e Argumentos',
            description: 'Identificar e avaliar teses, argumentos e contra-argumentos em textos argumentativos e de opinião.',
          },
          {
            code: 'EF09LP08',
            title: 'Coesão Referencial e Sequencial (Conectivos)',
            description: 'Identificar em textos lidos ou de produção própria os mecanismos de coesão e o uso de conectivos coordenativos e subordinativos.',
          },
          {
            code: 'EF09LP11',
            title: 'Figuras de Linguagem e Recursos Estilísticos',
            description: 'Analisar os efeitos de sentido do uso de figuras de linguagem em textos poéticos e publicitários.',
          },
        ],
      },
      {
        name: 'Matemática',
        skills: [
          {
            code: 'EF09MA01',
            title: 'Potenciação, Radiciação e Notação Científica',
            description: 'Reconhecer a necessidade dos números reais para medir segmentos e efetuar cálculos com radicais e notação científica.',
          },
          {
            code: 'EF09MA06',
            title: 'Funções e Equações do 2º Grau',
            description: 'Compreender as funções a partir da relação de dependência entre grandezas e resolver equações polinomiais de 2º grau.',
          },
          {
            code: 'EF09MA13',
            title: 'Teorema de Pitágoras e Semelhança de Triângulos',
            description: 'Demonstrar e aplicar o teorema de Pitágoras e relações métricas no triângulo retângulo.',
          },
          {
            code: 'EF09MA20',
            title: 'Probabilidade de Eventos Compostos',
            description: 'Reconhecer e calcular a probabilidade de eventos aleatórios compostos independentes e dependentes.',
          },
        ],
      },
      {
        name: 'Ciências da Natureza',
        skills: [
          {
            code: 'EF09CI01',
            title: 'Estrutura da Matéria e Tabela Periódica',
            description: 'Investigar as mudanças de estado físico da matéria e a estrutura atômica com base no modelo atômico atual.',
          },
          {
            code: 'EF09CI08',
            title: 'Hereditariedade e Leis de Mendel',
            description: 'Associar os gametas à transmissão das características hereditárias, estabelecendo relações entre DNA, genes e fenótipo.',
          },
          {
            code: 'EF09CI11',
            title: 'Evolução Biológica e Seleção Natural',
            description: 'Discutir a evolução e a diversidade das espécies com base na teoria da seleção natural proposta por Darwin.',
          },
        ],
      },
      {
        name: 'História',
        skills: [
          {
            code: 'EF09HI01',
            title: 'Proclamação da República no Brasil',
            description: 'Descrever e contextualizar os principais aspectos sociais, culturais, econômicos e políticos da emergência da República no Brasil.',
          },
          {
            code: 'EF09HI05',
            title: 'A Era Vargas e Direitos dos Trabalhadores',
            description: 'Identificar os processos de urbanização e industrialização no Brasil na Era Vargas e a emergência da legislação trabalhista.',
          },
          {
            code: 'EF09HI10',
            title: 'Segunda Guerra Mundial e Totalitarismos',
            description: 'Analisar as crises do capitalismo, a ascensão dos regimes totalitários e os desdobramentos da Segunda Guerra Mundial.',
          },
        ],
      },
      {
        name: 'Geografia',
        skills: [
          {
            code: 'EF09GE01',
            title: 'Globalização e Redes Globais',
            description: 'Analisar a atuação das corporações internacionais e dos blocos econômicos na ordem mundial contemporânea.',
          },
          {
            code: 'EF09GE10',
            title: 'Conflitos Geopolíticos e Migrações',
            description: 'Analisar os fluxos migratórios contemporâneos e suas motivações políticas, ambientais e econômicas.',
          },
        ],
      },
    ],
  },

  // -------------------------------------------------------------------------
  // ENSINO MÉDIO (1ª, 2ª e 3ª Séries)
  // -------------------------------------------------------------------------
  {
    stage: 'medio',
    stageLabel: 'Ensino Médio',
    grade: '1ª Série do Ensino Médio',
    subjects: [
      {
        name: 'Língua Portuguesa',
        skills: [
          {
            code: 'EM13LP01',
            title: 'Gêneros Argumentativos e Operadores Discursivos',
            description: 'Reconhecer e empregar estratégias argumentativas e operadores discursivos na defesa de teses e produção textual crítica.',
          },
          {
            code: 'EM13LP06',
            title: 'Análise de Efeitos de Sentido em Poesia e Prosa',
            description: 'Analisar efeitos de sentido decorrentes de recursos expressivos, figuras de linguagem e escolhas lexicais.',
          },
        ],
      },
      {
        name: 'Redação',
        skills: [
          {
            code: 'EM13LGG301',
            title: 'Estruturação Dissertativa-Argumentativa',
            description: 'Planejar e produzir textos dissertativo-argumentativos respeitando a estrutura canônica (introdução, D1, D2 e conclusão).',
          },
        ],
      },
      {
        name: 'Matemática',
        skills: [
          {
            code: 'EM13MAT101',
            title: 'Funções Afim e Quadrática',
            description: 'Interpretar criticamente situações econômicas ou cotidianas modeladas por funções polinomiais de 1º e 2º graus.',
          },
          {
            code: 'EM13MAT103',
            title: 'Funções Exponenciais e Logarítmicas',
            description: 'Resolver problemas reais de crescimento e decrescimento (juros compostos, decaimento radioativo) com exponenciais e logaritmos.',
          },
        ],
      },
      {
        name: 'Física',
        skills: [
          {
            code: 'EM13CNT101',
            title: 'Cinemática e Leis de Newton',
            description: 'Explicar e prever movimentos de corpos em trajetórias retilíneas e curvilíneas com base nas 3 Leis de Newton.',
          },
          {
            code: 'EM13CNT103',
            title: 'Trabalho, Potência e Energia Mecânica',
            description: 'Avaliar situações cotidianas aplicando a conservação da energia mecânica (cinética e potencial).',
          },
        ],
      },
      {
        name: 'Química',
        skills: [
          {
            code: 'EM13CNT104',
            title: 'Ligações Químicas e Forças Intermoleculares',
            description: 'Relacionar propriedades macroscópicas das substâncias (ponto de fusão, condutividade, solubilidade) aos tipos de ligação atômica.',
          },
        ],
      },
      {
        name: 'Biologia',
        skills: [
          {
            code: 'EM13CNT202',
            title: 'Citologia e Metabolismo Energético',
            description: 'Compreender a ultraestrutura celular e os processos de fotossíntese, respiração celular aeróbia e fermentação.',
          },
        ],
      },
    ],
  },
  {
    stage: 'medio',
    stageLabel: 'Ensino Médio',
    grade: '2ª Série do Ensino Médio',
    subjects: [
      {
        name: 'Língua Portuguesa',
        skills: [
          {
            code: 'EM13LP02',
            title: 'Literatura Brasileira do Século XIX (Romantismo e Realismo)',
            description: 'Analisar obras clássicas da literatura brasileira identificando ideologias de época, crítica social machadiana e estéticas literárias.',
          },
        ],
      },
      {
        name: 'Redação',
        skills: [
          {
            code: 'EM13LGG302',
            title: 'Proposta de Intervenção e Cidadania',
            description: 'Formular intervenções sociais detalhadas (Agente, Ação, Meio/Modo, Efeito e Detalhamento) com estrito respeito aos Direitos Humanos.',
          },
        ],
      },
      {
        name: 'Matemática',
        skills: [
          {
            code: 'EM13MAT201',
            title: 'Trigonometria no Triângulo e Ciclo Trigonométrico',
            description: 'Aplicar seno, cosseno, tangente e leis trigonométricas na resolução de triângulos quaisquer e fenômenos periódicos.',
          },
          {
            code: 'EM13MAT203',
            title: 'Matrizes, Determinantes e Sistemas Lineares',
            description: 'Resolver sistemas lineares por escalonamento e regra de Cramer aplicados a problemas de redes e economia.',
          },
        ],
      },
      {
        name: 'Física',
        skills: [
          {
            code: 'EM13CNT102',
            title: 'Termologia, Calorimetria e Óptica Geométrica',
            description: 'Analisar trocas de calor, dilatação térmica, reflexão e refração da luz em lentes e espelhos planos e esféricos.',
          },
        ],
      },
      {
        name: 'Química',
        skills: [
          {
            code: 'EM13CNT205',
            title: 'Soluções, Concentrações e Termoquímica',
            description: 'Calcular concentrações em soluções (molaridade, título) e mensurar variação de entalpia em reações endotérmicas e exotérmicas.',
          },
        ],
      },
      {
        name: 'Biologia',
        skills: [
          {
            code: 'EM13CNT204',
            title: 'Fisiologia Humana e Imunologia',
            description: 'Compreender o funcionamento integrado dos sistemas cardiovascular, renal, endócrino e imunológico (vacinas x soros).',
          },
        ],
      },
    ],
  },
  {
    stage: 'medio',
    stageLabel: 'Ensino Médio',
    grade: '3ª Série do Ensino Médio (Foco ENEM)',
    subjects: [
      {
        name: 'Língua Portuguesa',
        skills: [
          {
            code: 'EM13LGG101',
            title: 'Análise Crítica de Discursos Midiáticos',
            description: 'Compreender e analisar processos de produção e circulação de discursos nas diferentes mídias e artes.',
          },
          {
            code: 'EM13LGG401',
            title: 'Modernismo Brasileiro e Contemporaneidade',
            description: 'Analisar textos das tradições literárias modernas e contemporâneas considerando os contextos históricos de ruptura e identidade nacional.',
          },
        ],
      },
      {
        name: 'Redação',
        skills: [
          {
            code: 'EM13LGG302',
            title: 'Redação Padrão ENEM Nota 1000',
            description: 'Posicionar-se criticamente sobre temas sociais contemporâneos elaborando propostas de intervenção completas com respeito aos direitos humanos.',
          },
        ],
      },
      {
        name: 'Matemática',
        skills: [
          {
            code: 'EM13MAT301',
            title: 'Geometria Espacial (Prismas, Cilindros, Cones e Esferas)',
            description: 'Resolver problemas que envolvam cálculo de área da superfície e volume de sólidos geométricos espaciais em contextos práticos.',
          },
          {
            code: 'EM13MAT310',
            title: 'Análise Combinatória e Teoria das Probabilidades',
            description: 'Calcular probabilidades em eventos sucessivos e aplicar princípios aditivo e multiplicativo de contagem para tomada de decisões.',
          },
          {
            code: 'EM13MAT406',
            title: 'Estatística Descritiva e Medidas de Dispersão',
            description: 'Interpretar dados representados em tabelas e gráficos, calculando média, mediana, moda e desvio padrão.',
          },
        ],
      },
      {
        name: 'Ciências da Natureza',
        skills: [
          {
            code: 'EM13CNT201',
            title: 'Biotecnologia, Genética Molecular e CRISPR',
            description: 'Analisar e discutir o impacto das tecnologias de manipulação gênica (DNA recombinante, clonagem, transgênicos) na sociedade e na bioética.',
          },
          {
            code: 'EM13CNT303',
            title: 'Eletroquímica (Pilhas e Eletrólise) e Cinética',
            description: 'Interpretar fenômenos redox (potencial padrão de eletrodo) e fatores que alteram a velocidade das reações químicas.',
          },
          {
            code: 'EM13CNT105',
            title: 'Eletromagnetismo e Circuitos Elétricos',
            description: 'Analisar circuitos elétricos resistivos (Leis de Ohm, efeito Joule) e indução eletromagnética geradora de energia.',
          },
        ],
      },
      {
        name: 'Ciências Humanas e Sociais',
        skills: [
          {
            code: 'EM13CHS101',
            title: 'Cidadania, Direitos Humanos e Democracia',
            description: 'Identificar e combater diversas formas de violência e discriminação, promovendo os direitos humanos e a dignidade.',
          },
          {
            code: 'EM13CHS204',
            title: 'Geopolítica Contemporânea e Meio Ambiente',
            description: 'Analisar as tensões territoriais mundiais e os impasses das conferências climáticas e do desenvolvimento sustentável.',
          },
          {
            code: 'EM13CHS502',
            title: 'Trabalho e Transformações no Capitalismo Global',
            description: 'Analisar as transformações no mundo do trabalho geradas pelas novas tecnologias digitais e a precarização das relações laborais.',
          },
        ],
      },
    ],
  },
];

/**
 * Normaliza strings para facilitar comparações insensíveis a acentos e maiúsculas
 */
function normalizeStr(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca opções de habilidades da BNCC baseando-se em grade e subject digitados ou selecionados
 */
export function getBnccSkillsForGradeAndSubject(
  grade: string,
  subject: string
): BnccSkillItem[] {
  if (!grade || !subject) return [];

  const normGrade = normalizeStr(grade);
  const normSubject = normalizeStr(subject);

  // Procura o grade mais compatível
  const matchedGrade = BNCC_CURRICULUM.find((b) => {
    const curGradeNorm = normalizeStr(b.grade);
    return curGradeNorm === normGrade || curGradeNorm.includes(normGrade) || normGrade.includes(curGradeNorm);
  });

  if (!matchedGrade) return [];

  // Procura o subject dentro desse grade
  const matchedSubject = matchedGrade.subjects.find((s) => {
    const curSubjNorm = normalizeStr(s.name);
    return (
      curSubjNorm === normSubject ||
      curSubjNorm.includes(normSubject) ||
      normSubject.includes(curSubjNorm)
    );
  });

  return matchedSubject ? matchedSubject.skills : [];
}

/**
 * Procura os dados de uma habilidade pelo código específico (ex: "EF09CI01")
 */
export function findSkillByBnccCode(code: string): {
  code: string;
  title: string;
  description: string;
  grade: string;
  subject: string;
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
          };
        }
      }
    }
  }

  return null;
}
