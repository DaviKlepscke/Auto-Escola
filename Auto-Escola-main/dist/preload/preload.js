"use strict";
// =====================================================================
// PRELOAD SCRIPT SEGURO - SPRINT 2
// Especialista em Electron: electron_core
// =====================================================================
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const api = {
    getAppVersion: () => electron_1.ipcRenderer.invoke('app:version'),
    getDashboardStats: () => electron_1.ipcRenderer.invoke('dashboard:stats'),
    testarConexaoBD: () => electron_1.ipcRenderer.invoke('database:test'),
    // Autenticação & Segurança (Restrito ao Dono e Atendimento)
    login: (login, senha) => electron_1.ipcRenderer.invoke('auth:login', { login, senha }),
    obterUsuarioAtual: () => electron_1.ipcRenderer.invoke('auth:current-user'),
    logout: () => electron_1.ipcRenderer.invoke('auth:logout'),
    // Alunos
    listarAlunos: (filtro) => electron_1.ipcRenderer.invoke('alunos:listar', filtro),
    salvarAluno: (aluno) => electron_1.ipcRenderer.invoke('alunos:salvar', aluno),
    atualizarAluno: (aluno) => electron_1.ipcRenderer.invoke('alunos:atualizar', aluno),
    deletarAluno: (id) => electron_1.ipcRenderer.invoke('alunos:deletar', id),
    importarAlunosCSV: (alunos) => electron_1.ipcRenderer.invoke('alunos:importar-csv', alunos),
    obterCargaHoraria: (alunoId) => electron_1.ipcRenderer.invoke('alunos:obter-carga-horaria', alunoId),
    // Instrutores
    listarInstrutores: () => electron_1.ipcRenderer.invoke('instrutores:listar'),
    salvarInstrutor: (instrutor) => electron_1.ipcRenderer.invoke('instrutores:salvar', instrutor),
    atualizarInstrutor: (instrutor) => electron_1.ipcRenderer.invoke('instrutores:atualizar', instrutor),
    deletarInstrutor: (id) => electron_1.ipcRenderer.invoke('instrutores:deletar', id),
    importarInstrutoresCSV: (instrutores) => electron_1.ipcRenderer.invoke('instrutores:importar-csv', instrutores),
    // Frota / Veículos
    listarVeiculos: () => electron_1.ipcRenderer.invoke('veiculos:listar'),
    salvarVeiculo: (veiculo) => electron_1.ipcRenderer.invoke('veiculos:salvar', veiculo),
    atualizarKmVeiculo: (id, novoKm, registrarRevisao) => electron_1.ipcRenderer.invoke('veiculos:atualizar-km', id, novoKm, registrarRevisao),
    deletarVeiculo: (id) => electron_1.ipcRenderer.invoke('veiculos:deletar', id),
    importarVeiculosCSV: (veiculos) => electron_1.ipcRenderer.invoke('veiculos:importar-csv', veiculos),
    // Turmas e Salas (Limite de 20 alunos)
    listarSalas: () => electron_1.ipcRenderer.invoke('salas:listar'),
    listarTurmas: () => electron_1.ipcRenderer.invoke('turmas:listar'),
    salvarTurma: (turma) => electron_1.ipcRenderer.invoke('turmas:salvar', turma),
    listarAlunosTurma: (turmaId) => electron_1.ipcRenderer.invoke('turmas:listar-alunos', turmaId),
    matricularAlunoTurma: (turmaId, alunoId) => electron_1.ipcRenderer.invoke('turmas:matricular', turmaId, alunoId),
    desmatricularAlunoTurma: (turmaId, alunoId) => electron_1.ipcRenderer.invoke('turmas:desmatricular', turmaId, alunoId),
    // Aulas Práticas (Prevenção de Conflitos e Aulas Noturnas)
    listarAulasPraticas: (data) => electron_1.ipcRenderer.invoke('aulas:listar-praticas', data),
    salvarAulaPratica: (aula) => electron_1.ipcRenderer.invoke('aulas:salvar-pratica', aula),
    atualizarStatusAulaPratica: (aulaId, status) => electron_1.ipcRenderer.invoke('aulas:atualizar-status-pratica', aulaId, status),
    // Exames (Sprint 3: Gestão de Exames, Resultados e Retestes)
    listarExames: (filtro) => electron_1.ipcRenderer.invoke('exames:listar', filtro),
    agendarExame: (exame) => electron_1.ipcRenderer.invoke('exames:agendar', exame),
    lancarResultadoExame: (exameId, dados) => electron_1.ipcRenderer.invoke('exames:lancar-resultado', exameId, dados),
    quitarTaxaReteste: (exameId) => electron_1.ipcRenderer.invoke('exames:quitar-taxa-reteste', exameId),
    obterAlunosAptosExame: (tipo) => electron_1.ipcRenderer.invoke('exames:obter-aptos', tipo),
    // Integrações: Notificações 24h & Previsão do Tempo
    dispararNotificacoes24h: () => electron_1.ipcRenderer.invoke('notificacoes:disparar-24h'),
    consultarClima: (cidade, data, categoria) => electron_1.ipcRenderer.invoke('clima:consultar', cidade, data, categoria)
};
electron_1.contextBridge.exposeInMainWorld('electronAPI', api);
