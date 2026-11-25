// =====================================================================
// CONTRATOS E TIPOS COMPARTILHADOS (TYPESCRIPT STRICT) - SPRINT 2
// Especialistas: electron_core, autoescola_expert, database_mysql
// =====================================================================

export type PerfilUsuario = 'DONO_ADMIN' | 'ATENDIMENTO';

export interface Usuario {
  id: number;
  nome: string;
  login: string;
  perfil: PerfilUsuario;
}

export type CategoriaCNH = 'A' | 'B' | 'AB' | 'C' | 'D' | 'E';

export type StatusProcessoAluno =
  | 'PRE_CADASTRO'
  | 'EXAMES_APTOS'
  | 'CURSO_TEORICO'
  | 'TEORICO_CONCLUIDO'
  | 'EXAME_TEORICO_APROVADO'
  | 'CURSO_PRATICO'
  | 'PRATICO_CONCLUIDO'
  | 'HABILITADO'
  | 'BLOQUEADO';

export interface Aluno {
  id?: number;
  nome: string;
  cpf: string;
  rg: string;
  renach?: string;
  data_nascimento: string;
  telefone: string;
  email: string;
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  categoria_pretendida: CategoriaCNH;
  status_exame_medico: 'PENDENTE' | 'APTO' | 'INAPTO';
  status_exame_psico: 'PENDENTE' | 'APTO' | 'INAPTO';
  ladv_numero?: string;
  status_processo: StatusProcessoAluno;
  horas_teoricas_cumpridas?: number;
  horas_praticas_cumpridas?: number;
  horas_noturnas_cumpridas?: number;
  criado_em?: string;
}

export interface Instrutor {
  id?: number;
  nome: string;
  cpf: string;
  credencial_detran: string;
  telefone: string;
  email?: string;
  tipo: 'TEORICO' | 'PRATICO' | 'AMBOS';
  habilita_veiculos_pesados: boolean;
  ativo: boolean;
}

export interface Veiculo {
  id?: number;
  placa: string;
  modelo: string;
  ano: number;
  categoria: CategoriaCNH;
  km_atual: number;
  km_ultima_revisao: number;
  intervalo_revisao_km: number;
  status: 'DISPONIVEL' | 'ALERTA_REVISAO' | 'EM_MANUTENCAO' | 'INATIVO';
}

export interface TurmaTeorica {
  id?: number;
  codigo: string;
  sala_id: number;
  sala_nome?: string;
  instrutor_id: number;
  instrutor_nome?: string;
  data_inicio: string;
  data_fim: string;
  horario_inicio: string;
  horario_fim: string;
  total_alunos?: number;
  capacidade_maxima?: number;
  status: 'PLANEJADA' | 'EM_ANDAMENTO' | 'CONCLUIDA' | 'CANCELADA';
}

export interface MatriculaTurma {
  id?: number;
  turma_id: number;
  aluno_id: number;
  aluno_nome?: string;
  aluno_cpf?: string;
  data_matricula?: string;
  status: 'MATRICULADO' | 'CONCLUIDO' | 'DESISTENTE' | 'TRANSFERIDO';
}

export interface AulaPratica {
  id?: number;
  aluno_id: number;
  aluno_nome?: string;
  instrutor_id: number;
  instrutor_nome?: string;
  veiculo_id: number;
  veiculo_modelo?: string;
  veiculo_placa?: string;
  categoria: CategoriaCNH;
  data_aula: string;
  horario_inicio: string;
  horario_fim: string;
  eh_noturna: boolean;
  status: 'AGENDADA' | 'REALIZADA' | 'FALTOU' | 'CANCELADA' | 'REAGENDADA_CLIMA';
  alerta_chuva: boolean;
  observacoes?: string;
}

export interface Exame {
  id?: number;
  aluno_id: number;
  aluno_nome?: string;
  tipo: 'TEORICO' | 'PRATICO';
  categoria: CategoriaCNH;
  veiculo_id?: number;
  turma_exame_codigo?: string;
  data_exame: string;
  horario: string;
  local_exame: string;
  status: 'AGENDADO' | 'APROVADO' | 'REPROVADO' | 'AUSENTE';
  pontuacao_teorica?: number;
  eh_reteste: boolean;
  taxa_reteste_paga: boolean;
  valor_taxa: number;
  motivo_reprovacao?: string;
}

export interface DashboardStats {
  totalAlunos: number;
  totalInstrutores: number;
  totalVeiculos: number;
  veiculosAlertaRevisao: number;
  aulasHoje: number;
  turmasAtivas: number;
  alertasChuva: number;
}

export interface BatchImportResult {
  success: boolean;
  inseridos: number;
  erros: string[];
}

export interface CargaHorariaAluno {
  alunoId: number;
  alunoNome: string;
  categoria: CategoriaCNH;
  horasTeoricasCumpridas: number;
  horasTeoricasExigidas: number; // 45h
  horasPraticasCumpridas: number;
  horasNoturnasCumpridas: number;
  prontoParaExameTeorico: boolean;
  prontoParaExamePratico: boolean;
}

// Contrato seguro exposto via IPC
export interface IElectronAPI {
  getAppVersion: () => Promise<string>;
  getDashboardStats: () => Promise<DashboardStats>;
  testarConexaoBD: () => Promise<{ success: boolean; message: string; host?: string; database?: string }>;

  // Autenticação & Segurança (Restrito ao Dono e Atendimento)
  login: (login: string, senha: string) => Promise<{ success: boolean; usuario?: Usuario; error?: string }>;
  obterUsuarioAtual: () => Promise<Usuario | null>;
  logout: () => Promise<boolean>;

  // Alunos
  listarAlunos: (filtro?: { categoria?: string; status?: string }) => Promise<Aluno[]>;
  salvarAluno: (aluno: Aluno) => Promise<{ success: boolean; id?: number; error?: string }>;
  atualizarAluno: (aluno: Aluno) => Promise<{ success: boolean; error?: string }>;
  deletarAluno: (id: number) => Promise<{ success: boolean; error?: string }>;
  importarAlunosCSV: (alunos: Aluno[]) => Promise<BatchImportResult>;
  obterCargaHoraria: (alunoId: number) => Promise<CargaHorariaAluno>;

  // Instrutores
  listarInstrutores: () => Promise<Instrutor[]>;
  salvarInstrutor: (instrutor: Instrutor) => Promise<{ success: boolean; id?: number; error?: string }>;
  atualizarInstrutor: (instrutor: Instrutor) => Promise<{ success: boolean; error?: string }>;
  deletarInstrutor: (id: number) => Promise<{ success: boolean; error?: string }>;
  importarInstrutoresCSV: (instrutores: Instrutor[]) => Promise<BatchImportResult>;

  // Frota / Veículos
  listarVeiculos: () => Promise<Veiculo[]>;
  salvarVeiculo: (veiculo: Veiculo) => Promise<{ success: boolean; id?: number; error?: string }>;
  atualizarKmVeiculo: (id: number, novoKm: number, registrarRevisao?: boolean) => Promise<{ success: boolean; error?: string }>;
  deletarVeiculo: (id: number) => Promise<{ success: boolean; error?: string }>;
  importarVeiculosCSV: (veiculos: Veiculo[]) => Promise<BatchImportResult>;

  // Turmas e Salas (Limite de 20 alunos)
  listarSalas: () => Promise<Array<{ id: number; nome: string; capacidade_maxima: number }>>;
  listarTurmas: () => Promise<TurmaTeorica[]>;
  salvarTurma: (turma: TurmaTeorica) => Promise<{ success: boolean; id?: number; error?: string }>;
  listarAlunosTurma: (turmaId: number) => Promise<MatriculaTurma[]>;
  matricularAlunoTurma: (turmaId: number, alunoId: number) => Promise<{ success: boolean; error?: string }>;
  desmatricularAlunoTurma: (turmaId: number, alunoId: number) => Promise<{ success: boolean; error?: string }>;

  // Aulas Práticas (Prevenção de Conflitos e Aulas Noturnas)
  listarAulasPraticas: (data?: string) => Promise<AulaPratica[]>;
  salvarAulaPratica: (aula: AulaPratica) => Promise<{ success: boolean; id?: number; error?: string }>;
  atualizarStatusAulaPratica: (aulaId: number, status: 'REALIZADA' | 'FALTOU' | 'CANCELADA') => Promise<{ success: boolean; error?: string }>;

  // Exames (Sprint 3: Gestão de Exames, Resultados e Retestes)
  listarExames: (filtro?: { tipo?: string; status?: string }) => Promise<Exame[]>;
  agendarExame: (exame: Exame) => Promise<{ success: boolean; id?: number; error?: string }>;
  lancarResultadoExame: (exameId: number, dados: {
    status: 'APROVADO' | 'REPROVADO' | 'AUSENTE';
    pontuacao_teorica?: number;
    motivo_reprovacao?: string;
    valor_taxa_reteste?: number;
  }) => Promise<{ success: boolean; error?: string }>;
  quitarTaxaReteste: (exameId: number) => Promise<{ success: boolean; error?: string }>;
  obterAlunosAptosExame: (tipo: 'TEORICO' | 'PRATICO') => Promise<Array<{ id: number; nome: string; cpf: string; categoria_pretendida: string; apto: boolean; motivoInapto?: string }>>;

  // Integrações: Notificações 24h & Previsão do Tempo
  dispararNotificacoes24h: () => Promise<{ success: boolean; totalEnviadas: number; detalhes: string[] }>;
  consultarClima: (cidade?: string, data?: string, categoria?: string) => Promise<{ alertaChuva: boolean; chanceChuva: number; condicao: string; sugestao: string }>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}
