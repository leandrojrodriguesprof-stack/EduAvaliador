export interface BnccSkillItem {
  code: string;
  title: string;
  description: string;
  area?: string;
  objectOfKnowledge?: string;
  origin?: 'oficial_mec' | 'manual_docente';
}

export interface BnccSubjectOption {
  name: string;
  area?: string;
  skills: BnccSkillItem[];
}

export interface BnccGradeOption {
  stage: 'fundamental_1' | 'fundamental_2' | 'medio' | 'competencia_geral';
  stageLabel: string;
  grade: string;
  subjects: BnccSubjectOption[];
}

export const BNCC_COMPETENCIAS_GERAIS: BnccSkillItem[] = [
  {
    code: 'CG01',
    title: 'Conhecimento',
    description: 'Valorizar e utilizar os conhecimentos historicamente construídos sobre o mundo físico, social, cultural e digital para entender e explicar a realidade, continuar aprendendo e colaborar para a construção de uma sociedade justa, democrática e inclusiva.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
  {
    code: 'CG02',
    title: 'Pensamento Científico, Crítico e Criativo',
    description: 'Exercitar a curiosidade intelectual e recorrer à abordagem própria das ciências para investigar causas, elaborar hipóteses e formular e resolver problemas.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
  {
    code: 'CG03',
    title: 'Repertório Cultural e Senso Estético',
    description: 'Valorizar e fruir as diversas manifestações artísticas e culturais, das locais às mundiais, e também participar de práticas diversificadas da produção artístico-cultural.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
  {
    code: 'CG04',
    title: 'Comunicação',
    description: 'Utilizar diferentes linguagens — verbal (oral, visual-motora como Libras, e escrita), corporal, visual, sonora e digital —, bem como conhecimentos das linguagens artística, matemática e científica.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
  {
    code: 'CG05',
    title: 'Cultura Digital',
    description: 'Compreender, utilizar e criar tecnologias digitais de informação e comunicação de forma crítica, significativa, reflexiva e ética nas diversas práticas sociais.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
  {
    code: 'CG06',
    title: 'Trabalho e Projeto de Vida',
    description: 'Valorizar a diversidade de saberes e vivências culturais e apropriar-se de conhecimentos e experiências que possibilitem fazer escolhas alinhadas ao seu projeto de vida e cidadania.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
  {
    code: 'CG07',
    title: 'Argumentação Ética e Fundamentada',
    description: 'Argumentar com base em fatos, dados e informações confiáveis, para defender pontos de vista que respeitem e promovam os direitos humanos e a consciência socioambiental.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
  {
    code: 'CG08',
    title: 'Autoconhecimento e Autocuidado',
    description: 'Conhecer-se, apreciar-se e cuidar de sua saúde física e emocional, compreendendo-se na diversidade humana e reconhecendo suas emoções e as dos outros.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
  {
    code: 'CG09',
    title: 'Empatia e Cooperação',
    description: 'Exercitar a empatia, o diálogo, a resolução de conflitos e a cooperação, fazendo-se respeitar e promovendo o respeito ao outro e aos direitos humanos.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
  {
    code: 'CG10',
    title: 'Responsabilidade e Cidadania',
    description: 'Agir pessoal e coletivamente com autonomia, responsabilidade, flexibilidade, resiliência e determinação, tomando decisões com base em princípios éticos e democráticos.',
    area: 'Competências Gerais',
    origin: 'oficial_mec',
  },
];

export const BNCC_DATA_CURRICULUM: BnccGradeOption[] = [
  {
    stage: 'competencia_geral',
    stageLabel: 'Educação Básica (Transversal)',
    grade: 'Competências Gerais (MEC)',
    subjects: [
      {
        name: 'Competências Gerais da BNCC',
        area: 'Formação Geral Básica',
        skills: BNCC_COMPETENCIAS_GERAIS,
      },
    ],
  },
  {
    stage: 'fundamental_1',
    stageLabel: 'Ensino Fundamental I (Anos Iniciais)',
    grade: '1º ao 5º Ano',
    subjects: [
      {
        name: 'Língua Portuguesa',
        area: 'Linguagens',
        skills: [
          {
            code: 'EF12LP01',
            title: 'Decodificação e Leitura de Palavras',
            description: 'Ler palavras novas com precisão na decodificação e palavras de uso frequente globalmente por memorização.',
            objectOfKnowledge: 'Decodificação / Leitura de palavras e textos breves',
            origin: 'oficial_mec',
          },
          {
            code: 'EF01LP02',
            title: 'Correspondência Fonema-Grafema',
            description: 'Escrever, espontaneamente ou por ditado, palavras e frases de forma alfabética usando letras que representem fonemas.',
            objectOfKnowledge: 'Construção do sistema alfabético e ortografia',
            origin: 'oficial_mec',
          },
          {
            code: 'EF03LP01',
            title: 'Ortografia e Regularidades Gramaticais',
            description: 'Ler e escrever palavras com correspondências regulares contextuais entre grafemas e fonemas (c/qu, g/gu, r/rr, s/ss, m antes de p e b).',
            objectOfKnowledge: 'Construção do sistema alfabético e convenções',
            origin: 'oficial_mec',
          },
          {
            code: 'EF35LP03',
            title: 'Ideia Central e Sentido Global do Texto',
            description: 'Identificar a ideia central do texto lido, demonstrando compreensão global e identificando informações explícitas.',
            objectOfKnowledge: 'Compreensão em leitura e inferência textual',
            origin: 'oficial_mec',
          },
          {
            code: 'EF05LP04',
            title: 'Coesão Referencial e Pronomes Anafóricos',
            description: 'Diferenciar palavras primitivas, derivadas e compostas, e utilizar recursos de coesão referencial para evitar repetições no texto.',
            objectOfKnowledge: 'Coesão textual e processos de derivação',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Matemática',
        area: 'Matemática',
        skills: [
          {
            code: 'EF01MA01',
            title: 'Contagem e Relação Número-Quantidade',
            description: 'Utilizar números naturais como indicador de quantidade ou de ordem em diferentes situações cotidianas.',
            objectOfKnowledge: 'Contagem de rotina e ordenação numérica',
            origin: 'oficial_mec',
          },
          {
            code: 'EF02MA06',
            title: 'Problemas de Adição e Subtração',
            description: 'Resolver e elaborar problemas de adição e subtração com significados de juntar, acrescentar, separar e retirar.',
            objectOfKnowledge: 'Operações fundamentais no campo aditivo',
            origin: 'oficial_mec',
          },
          {
            code: 'EF03MA03',
            title: 'Multiplicação, Dobro e Triplo',
            description: 'Construir e utilizar fatos básicos da adição e multiplicação para o cálculo mental ou escrito (dobro, triplo, metade).',
            objectOfKnowledge: 'Fatos fundamentais da multiplicação',
            origin: 'oficial_mec',
          },
          {
            code: 'EF05MA02',
            title: 'Frações Unitárias e Números Decimais',
            description: 'Ler, escrever e ordenar números racionais na forma decimal com compreensão das ordens decimais (décimos e centésimos).',
            objectOfKnowledge: 'Números racionais: decimais e frações',
            origin: 'oficial_mec',
          },
          {
            code: 'EF05MA07',
            title: 'Porcentagens Simples (10%, 25%, 50%, 75%, 100%)',
            description: 'Resolver e elaborar problemas de cálculo de porcentagens simples em contextos de compras, descontos e estatística.',
            objectOfKnowledge: 'Porcentagem em situações cotidianas',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Ciências da Natureza',
        area: 'Ciências da Natureza',
        skills: [
          {
            code: 'EF02CI04',
            title: 'Partes das Plantas e Necessidades Vitais',
            description: 'Descrever características de plantas e animais no ambiente e relacioná-las a água, luz e solo.',
            objectOfKnowledge: 'Seres vivos no ambiente e plantas',
            origin: 'oficial_mec',
          },
          {
            code: 'EF04CI04',
            title: 'Cadeias Alimentares e Decomposição',
            description: 'Analisar e construir cadeias alimentares simples reconhecendo produtores, consumidores e decompositores.',
            objectOfKnowledge: 'Fluxo de matéria e energia na natureza',
            origin: 'oficial_mec',
          },
          {
            code: 'EF05CI02',
            title: 'Ciclo Hidrológico e Sustentabilidade da Água',
            description: 'Aplicar conhecimentos sobre mudanças de estado físico da água para explicar o ciclo hidrológico e saneamento.',
            objectOfKnowledge: 'Ciclo da água e uso sustentável',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'História',
        area: 'Ciências Humanas',
        skills: [
          {
            code: 'EF01HI01',
            title: 'Identidade Pessoal e Grupos de Convívio',
            description: 'Identificar aspectos do seu crescimento e história familiar nas memórias e fontes materiais.',
            objectOfKnowledge: 'A vida em família e na escola',
            origin: 'oficial_mec',
          },
          {
            code: 'EF05HI02',
            title: 'Cidadania e Direitos Sociais no Brasil',
            description: 'Identificar os mecanismos de organização do poder político e a evolução dos direitos de cidadania no Brasil.',
            objectOfKnowledge: 'Cidadania, constituição e direitos humanos',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Geografia',
        area: 'Ciências Humanas',
        skills: [
          {
            code: 'EF03GE01',
            title: 'Campo e Cidade: Relações e Paisagens',
            description: 'Identificar e comparar aspectos culturais e produtivos dos grupos sociais no campo e na cidade.',
            objectOfKnowledge: 'Espaço urbano e espaço rural',
            origin: 'oficial_mec',
          },
          {
            code: 'EF05GE02',
            title: 'Dinâmica Populacional e Desigualdades Regionais',
            description: 'Identificar diferenças étnico-culturais e desigualdades socioeconômicas no território brasileiro.',
            objectOfKnowledge: 'População brasileira e urbanização',
            origin: 'oficial_mec',
          },
        ],
      },
    ],
  },
  {
    stage: 'fundamental_2',
    stageLabel: 'Ensino Fundamental II (Anos Finais)',
    grade: '6º ao 9º Ano',
    subjects: [
      {
        name: 'Língua Portuguesa',
        area: 'Linguagens',
        skills: [
          {
            code: 'EF67LP01',
            title: 'Textos de Divulgação Científica e Jornalismo',
            description: 'Identificar proposta comunicativa, tema central, fatos e teses em notícias e artigos de divulgação científica.',
            objectOfKnowledge: 'Estratégia de leitura e intencionalidade discursiva',
            origin: 'oficial_mec',
          },
          {
            code: 'EF67LP04',
            title: 'Distinção entre Fato e Opinião',
            description: 'Distinguir um fato da opinião relativa a esse mesmo fato em textos argumentativos e da mídia.',
            objectOfKnowledge: 'Análise de discursos jornalísticos e opinativos',
            origin: 'oficial_mec',
          },
          {
            code: 'EF08LP04',
            title: 'Sintaxe: Regência e Concordância Padrão',
            description: 'Utilizar conhecimentos linguísticos sobre sintaxe, regência e concordância verbal/nominal na produção textual.',
            objectOfKnowledge: 'Morfossintaxe e norma culta',
            origin: 'oficial_mec',
          },
          {
            code: 'EF89LP04',
            title: 'Teses, Argumentos e Contra-argumentos',
            description: 'Identificar e avaliar teses, argumentos e contra-argumentos em textos opinativos (artigos de opinião, cartas abertas).',
            objectOfKnowledge: 'Argumentação e operadores argumentativos',
            origin: 'oficial_mec',
          },
          {
            code: 'EF09LP08',
            title: 'Coesão Sequencial e Conectivos Lógicos',
            description: 'Identificar em textos e aplicar recursos de coesão sequencial (conjunções coordenativas e subordinativas).',
            objectOfKnowledge: 'Conectivos interoracionais e progressão temática',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Matemática',
        area: 'Matemática',
        skills: [
          {
            code: 'EF06MA01',
            title: 'Sistema de Numeração Decimal e Racionais',
            description: 'Comparar, ordenar, ler e escrever números naturais e números racionais na representação decimal.',
            objectOfKnowledge: 'Sistema decimal e grandes números',
            origin: 'oficial_mec',
          },
          {
            code: 'EF07MA04',
            title: 'Números Inteiros na Reta Numérica',
            description: 'Resolver e elaborar problemas com números inteiros (positivos e negativos) na reta numérica.',
            objectOfKnowledge: 'Operações com inteiros e números com sinal',
            origin: 'oficial_mec',
          },
          {
            code: 'EF07MA17',
            title: 'Equações Lineares do 1º Grau',
            description: 'Resolver problemas modelados por equações do 1º grau aplicadas a situações cotidianas.',
            objectOfKnowledge: 'Álgebra e métodos de resolução de equações',
            origin: 'oficial_mec',
          },
          {
            code: 'EF08MA06',
            title: 'Sistemas de Equações do 1º Grau',
            description: 'Resolver sistemas de equações lineares de 1º grau por métodos algébricos e gráficos.',
            objectOfKnowledge: 'Sistemas lineares com duas incógnitas',
            origin: 'oficial_mec',
          },
          {
            code: 'EF09MA06',
            title: 'Funções e Equações do 2º Grau (Bhaskara)',
            description: 'Compreender funções a partir da relação entre variáveis e resolver equações polinomiais de 2º grau.',
            objectOfKnowledge: 'Equações do 2º grau e introdução às funções',
            origin: 'oficial_mec',
          },
          {
            code: 'EF09MA13',
            title: 'Teorema de Pitágoras e Relações Métricas',
            description: 'Demonstrar e aplicar o teorema de Pitágoras e relações métricas no triângulo retângulo.',
            objectOfKnowledge: 'Geometria euclidiana e trigonometria básica',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Ciências da Natureza',
        area: 'Ciências da Natureza',
        skills: [
          {
            code: 'EF06CI01',
            title: 'Misturas e Métodos de Separação de Materiais',
            description: 'Classificar como homogênea ou heterogênea a mistura de materiais e selecionar métodos de separação.',
            objectOfKnowledge: 'Matéria e métodos físicos de separação',
            origin: 'oficial_mec',
          },
          {
            code: 'EF07CI07',
            title: 'Biomas Brasileiros e Biodiversidade',
            description: 'Caracterizar os ecossistemas e biomas do Brasil e analisar os impactos das atividades humanas.',
            objectOfKnowledge: 'Ecologia dos biomas brasileiros',
            origin: 'oficial_mec',
          },
          {
            code: 'EF08CI01',
            title: 'Sistemas Integrados do Corpo Humano',
            description: 'Identificar a integração funcional dos sistemas circulatório, respiratório, digestório e nervoso.',
            objectOfKnowledge: 'Fisiologia humana integrada',
            origin: 'oficial_mec',
          },
          {
            code: 'EF09CI01',
            title: 'Estrutura da Matéria e Tabela Periódica',
            description: 'Investigar a evolução dos modelos atômicos e a organização dos elementos na Tabela Periódica.',
            objectOfKnowledge: 'Química atômica e propriedades periódicas',
            origin: 'oficial_mec',
          },
          {
            code: 'EF09CI08',
            title: 'Genética Mendeliana, DNA e Hereditariedade',
            description: 'Associar os gametas à transmissão dos caracteres hereditários e às bases moleculares do DNA.',
            objectOfKnowledge: 'Genética e biologia celular',
            origin: 'oficial_mec',
          },
          {
            code: 'EF09CI11',
            title: 'Evolução Biológica e Seleção Natural',
            description: 'Discutir a evolução das espécies com base na seleção natural darwiniana e evidências fósseis.',
            objectOfKnowledge: 'Teorias da evolução e biodiversidade',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'História',
        area: 'Ciências Humanas',
        skills: [
          {
            code: 'EF06HI07',
            title: 'Grécia, Roma Antiga e Origens da Democracia',
            description: 'Identificar aspectos e legados das sociedades clássicas da Grécia e Roma na cidadania ocidental.',
            objectOfKnowledge: 'Antiguidade clássica e noções de cidadania',
            origin: 'oficial_mec',
          },
          {
            code: 'EF07HI12',
            title: 'Colonização no Brasil e Resistência Quilombola',
            description: 'Analisar a exploração colonial no Brasil e as formas de resistência das populações indígenas e negras.',
            objectOfKnowledge: 'Escravidão e formação sociocultural brasileira',
            origin: 'oficial_mec',
          },
          {
            code: 'EF08HI04',
            title: 'Iluminismo, Revolução Francesa e Direitos Humanos',
            description: 'Relacionar o pensamento das Luzes às rupturas da Revolução Francesa e à Declaração dos Direitos.',
            objectOfKnowledge: 'Revoluções burguesas e ideias liberais',
            origin: 'oficial_mec',
          },
          {
            code: 'EF09HI01',
            title: 'Proclamação da República e Cidadania no Brasil',
            description: 'Contextualizar a crise da Monarquia e a emergência da República no Brasil.',
            objectOfKnowledge: 'República Velha e conflitos sociais',
            origin: 'oficial_mec',
          },
          {
            code: 'EF09HI05',
            title: 'Era Vargas, CLT e Industrialização',
            description: 'Identificar as transformações econômicas e a criação da legislação trabalhista na Era Vargas.',
            objectOfKnowledge: 'Brasil moderno e direitos trabalhistas',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Geografia',
        area: 'Ciências Humanas',
        skills: [
          {
            code: 'EF06GE01',
            title: 'Conceitos Espaciais: Espaço, Paisagem e Lugar',
            description: 'Comparar modificações das paisagens nos lugares de vivência e a apropriação humana do espaço.',
            objectOfKnowledge: 'Conceitos fundamentais da geografia',
            origin: 'oficial_mec',
          },
          {
            code: 'EF07GE02',
            title: 'Regionalização e Território Brasileiro',
            description: 'Analisar as divisões regionais oficiais do Brasil (IBGE) e as regiões geoeconômicas.',
            objectOfKnowledge: 'Territorialidade e desigualdades espaciais',
            origin: 'oficial_mec',
          },
          {
            code: 'EF08GE01',
            title: 'População Mundial, Transição Demográfica e Migrações',
            description: 'Interpretar pirâmides etárias, fluxos migratórios e indicadores sociodemográficos no mundo.',
            objectOfKnowledge: 'Demografia global e mobilidade humana',
            origin: 'oficial_mec',
          },
          {
            code: 'EF09GE01',
            title: 'Globalização, Corporações Globais e Redes Técnicas',
            description: 'Analisar a atuação das empresas multinacionais e a formação de blocos econômicos supranacionais.',
            objectOfKnowledge: 'Globalização e divisão internacional do trabalho',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Língua Inglesa',
        area: 'Linguagens',
        skills: [
          {
            code: 'EF06LI01',
            title: 'Interação Oral e Comunicação Básica em Inglês',
            description: 'Utilizar a língua inglesa em situações de interação em sala de aula e na web.',
            objectOfKnowledge: 'Práticas orais e convívio social em inglês',
            origin: 'oficial_mec',
          },
          {
            code: 'EF08LI05',
            title: 'Inferência de Significado e Leitura Instrumental',
            description: 'Inferir o sentido de palavras cognatas e expressões em textos digitais e acadêmicos.',
            objectOfKnowledge: 'Estratégias de leitura e compreensão em língua inglesa',
            origin: 'oficial_mec',
          },
        ],
      },
    ],
  },
  {
    stage: 'medio',
    stageLabel: 'Ensino Médio (Todas as Áreas)',
    grade: 'Ensino Médio (1ª a 3ª Séries)',
    subjects: [
      {
        name: 'Língua Portuguesa e Literatura',
        area: 'Linguagens e suas Tecnologias',
        skills: [
          {
            code: 'EM13LGG101',
            title: 'Análise Crítica de Discursos Midiáticos e Multimodais',
            description: 'Compreender e analisar processos de produção e circulação de discursos nas diferentes mídias.',
            objectOfKnowledge: 'Semiótica, mídia e posicionamento crítico',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13LP01',
            title: 'Estratégias Argumentativas e Operadores Discursivos',
            description: 'Reconhecer e empregar estratégias argumentativas e operadores discursivos na defesa de teses.',
            objectOfKnowledge: 'Texto dissertativo-argumentativo',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13LP02',
            title: 'Literatura Brasileira e Construção da Identidade',
            description: 'Analisar obras clássicas e contemporâneas da literatura brasileira em diálogo com seu tempo.',
            objectOfKnowledge: 'Tradição e modernidade na literatura',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Redação ENEM / MEC',
        area: 'Linguagens e suas Tecnologias',
        skills: [
          {
            code: 'EM13LGG301',
            title: 'Estruturação da Dissertação-Argumentativa',
            description: 'Planejar e produzir textos dissertativo-argumentativos com tese explícita e projeto de texto coerente.',
            objectOfKnowledge: 'Estrutura canônica dissertativa ENEM',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13LGG302',
            title: 'Proposta de Intervenção e Direitos Humanos (Comp. 5)',
            description: 'Formular intervenções com 5 elementos: Agente, Ação, Meio/Modo, Efeito e Detalhamento, com respeito aos Direitos Humanos.',
            objectOfKnowledge: 'Proposta de intervenção e cidadania',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Matemática e suas Tecnologias',
        area: 'Matemática e suas Tecnologias',
        skills: [
          {
            code: 'EM13MAT101',
            title: 'Funções Afim e Quadrática na Modelagem Real',
            description: 'Interpretar situações econômicas, financeiras ou científicas modeladas por funções de 1º e 2º graus.',
            objectOfKnowledge: 'Modelagem algébrica e funções polinomiais',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13MAT103',
            title: 'Funções Exponenciais e Logaritmos (Juros e Decaimento)',
            description: 'Resolver problemas reais de crescimento e decrescimento com funções exponenciais e logaritmos.',
            objectOfKnowledge: 'Exponenciais, logaritmos e matemática financeira',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13MAT201',
            title: 'Trigonometria e Fenômenos Ondulatórios Periódicos',
            description: 'Aplicar seno, cosseno, tangente e leis trigonométricas no ciclo e em fenômenos periódicos.',
            objectOfKnowledge: 'Trigonometria e funções periódicas',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13MAT301',
            title: 'Geometria Espacial: Volume e Área de Sólidos',
            description: 'Calcular área da superfície e volume de prismas, cilindros, cones e esferas em problemas reais.',
            objectOfKnowledge: 'Geometria métrica espacial',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13MAT310',
            title: 'Análise Combinatória e Probabilidades Compostas',
            description: 'Calcular probabilidades em eventos sucessivos e aplicar princípios combinatórios multiplicativos.',
            objectOfKnowledge: 'Contagem, permutações, combinações e probabilidades',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Física',
        area: 'Ciências da Natureza e suas Tecnologias',
        skills: [
          {
            code: 'EM13CNT101',
            title: 'Leis de Newton, Gravitação e Cinemática',
            description: 'Explicar movimentos retilíneos e curvilíneos com base nas 3 Leis de Newton e na Gravitação.',
            objectOfKnowledge: 'Dinâmica clássica e leis do movimento',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13CNT103',
            title: 'Trabalho, Potência e Conservação da Energia Mecânica',
            description: 'Avaliar situações cotidianas aplicando a conservação de energia cinética e potencial mecânica.',
            objectOfKnowledge: 'Energia mecânica e termodinâmica',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13CNT105',
            title: 'Eletromagnetismo e Circuitos Elétricos',
            description: 'Analisar circuitos resistivos (Leis de Ohm, efeito Joule) e a indução eletromagnética geradora de corrente.',
            objectOfKnowledge: 'Eletrodinâmica e geração de energia elétrica',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Química',
        area: 'Ciências da Natureza e suas Tecnologias',
        skills: [
          {
            code: 'EM13CNT104',
            title: 'Ligações Químicas e Propriedades da Matéria',
            description: 'Relacionar propriedades das substâncias (ponto de fusão, solubilidade, condutividade) aos tipos de ligação química.',
            objectOfKnowledge: 'Ligações iônica, covalente, metálica e forças intermoleculares',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13CNT205',
            title: 'Soluções Químicas e Cinética das Reações',
            description: 'Calcular concentrações de soluções e analisar fatores que afetam a velocidade das reações químicas.',
            objectOfKnowledge: 'Físico-química das soluções e cinética',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13CNT303',
            title: 'Eletroquímica: Pilhas, Baterias e Eletrólise',
            description: 'Interpretar processos redox, o funcionamento de pilhas galvânicas e a eletrólise industrial.',
            objectOfKnowledge: 'Eletroquímica e transição energética',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Biologia',
        area: 'Ciências da Natureza e suas Tecnologias',
        skills: [
          {
            code: 'EM13CNT201',
            title: 'Biotecnologia, Manipulação Gênica e Bioética',
            description: 'Analisar o impacto das tecnologias de manipulação gênica (CRISPR, clonagem, transgênicos) na sociedade.',
            objectOfKnowledge: 'Biotecnologia e ética científica',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13CNT202',
            title: 'Citologia, Fotossíntese e Respiração Celular',
            description: 'Compreender a estrutura celular e os processos de transformação de energia biológica.',
            objectOfKnowledge: 'Bioenergética celular',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13CNT204',
            title: 'Fisiologia Humana Integrada e Imunologia',
            description: 'Compreender o funcionamento integrado dos sistemas cardiovascular, endócrino e imunológico.',
            objectOfKnowledge: 'Fisiologia humana e saúde preventiva',
            origin: 'oficial_mec',
          },
        ],
      },
      {
        name: 'Ciências Humanas e Sociais Aplicadas',
        area: 'Ciências Humanas e Sociais Aplicadas',
        skills: [
          {
            code: 'EM13CHS101',
            title: 'Cidadania, Direitos Humanos e Combate a Discriminações',
            description: 'Identificar, analisar e combater diversas formas de discriminação e violação dos direitos humanos.',
            objectOfKnowledge: 'Direitos humanos, diversidade e cidadania',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13CHS204',
            title: 'Geopolítica Global, Recursos Naturais e Clima',
            description: 'Analisar as disputas por recursos estratégicos e os impasses das conferências de mudança climática.',
            objectOfKnowledge: 'Relações internacionais e sustentabilidade global',
            origin: 'oficial_mec',
          },
          {
            code: 'EM13CHS502',
            title: 'Mundo do Trabalho e Novas Tecnologias Digitais',
            description: 'Analisar as transformações nas relações de trabalho geradas pela automação e inteligência artificial.',
            objectOfKnowledge: 'Sociologia do trabalho contemporâneo',
            origin: 'oficial_mec',
          },
        ],
      },
    ],
  },
];
