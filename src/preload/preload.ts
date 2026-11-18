// =====================================================================
// PRELOAD SCRIPT SEGURO - SPRINT 2
// Especialista em Electron: electron_core
// =====================================================================

import { contextBridge, ipcRenderer } from 'electron';
import { Aluno, Instrutor, Veiculo, TurmaTeorica, AulaPratica, IElectronAPI } from '../common/types';

const api: IElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke('app:version'),
  getDashboardStats: () => ipcRenderer.invoke('dashboard:stats'),
  testarConexaoBD: () => ipcRenderer.invoke('database:test'),

  // Alunos
  listarAlunos: (filtro) => ipcRenderer.invoke('alunos:listar', filtro),
  salvarAluno: (aluno: Aluno) => ipcRenderer.invoke('alunos:salvar', aluno),
  importarAlunosCSV: (alunos: Aluno[]) => ipcRenderer.invoke('alunos:importar-csv', alunos),
  obterCargaHoraria: (alunoId: number) => ipcRenderer.invoke('alunos:obter-carga-horaria', alunoId),

  // Instrutores
  listarInstrutores: () => ipcRenderer.invoke('instrutores:listar'),
  salvarInstrutor: (instrutor: Instrutor) => ipcRenderer.invoke('instrutores:salvar', instrutor),
  importarInstrutoresCSV: (instrutores: Instrutor[]) => ipcRenderer.invoke('instrutores:importar-csv', instrutores),

  // Frota / Veículos
  listarVeiculos: () => ipcRenderer.invoke('veiculos:listar'),
  salvarVeiculo: (veiculo: Veiculo) => ipcRenderer.invoke('veiculos:salvar', veiculo),
  atualizarKmVeiculo: (id: number, novoKm: number, registrarRevisao?: boolean) =>
    ipcRenderer.invoke('veiculos:atualizar-km', id, novoKm, registrarRevisao),
  importarVeiculosCSV: (veiculos: Veiculo[]) => ipcRenderer.invoke('veiculos:importar-csv', veiculos),

  // Turmas e Salas (Limite de 20 alunos)
  listarSalas: () => ipcRenderer.invoke('salas:listar'),
  listarTurmas: () => ipcRenderer.invoke('turmas:listar'),
  salvarTurma: (turma: TurmaTeorica) => ipcRenderer.invoke('turmas:salvar', turma),
  listarAlunosTurma: (turmaId: number) => ipcRenderer.invoke('turmas:listar-alunos', turmaId),
  matricularAlunoTurma: (turmaId: number, alunoId: number) =>
    ipcRenderer.invoke('turmas:matricular', turmaId, alunoId),
  desmatricularAlunoTurma: (turmaId: number, alunoId: number) =>
    ipcRenderer.invoke('turmas:desmatricular', turmaId, alunoId),

  // Aulas Práticas (Prevenção de Conflitos e Aulas Noturnas)
  listarAulasPraticas: (data?: string) => ipcRenderer.invoke('aulas:listar-praticas', data),
  salvarAulaPratica: (aula: AulaPratica) => ipcRenderer.invoke('aulas:salvar-pratica', aula),
  atualizarStatusAulaPratica: (aulaId: number, status: 'REALIZADA' | 'FALTOU' | 'CANCELADA') =>
    ipcRenderer.invoke('aulas:atualizar-status-pratica', aulaId, status),

  // Exames
  listarExames: () => ipcRenderer.invoke('exames:listar')
};

contextBridge.exposeInMainWorld('electronAPI', api);
