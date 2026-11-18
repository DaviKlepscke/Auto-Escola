// =====================================================================
// CONTROLADOR DE TELA E RENDERIZAÇÃO (FRONT-END BOOTSTRAP) - SPRINT 2
// Especialistas: frontend_electron, electron_core, autoescola_expert
// =====================================================================

import { Validators } from './validators.js';
import { CSVManager } from './csvManager.js';

let csvTipoAtual = 'alunos';
let dadosCSVValidados = [];
let turmaSelecionadaId = null;

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[Front-End] Inicializando interface de atendimento do CFC (Sprint 2)...');

  // Testar Conexão com o Banco Local / Remoto
  try {
    const dbStatus = await window.electronAPI.testarConexaoBD();
    const badge = document.getElementById('badge-db-status');
    const labelHost = document.getElementById('label-db-host');
    if (badge) {
      badge.textContent = dbStatus.success ? '● MySQL Conectado (ae_*)' : '● Offline Local';
      badge.className = dbStatus.success ? 'badge bg-success me-2' : 'badge bg-warning text-dark me-2';
    }
    if (labelHost && dbStatus.host) {
      labelHost.textContent = `DB: ${dbStatus.database}@${dbStatus.host}`;
    }
  } catch (e) {
    console.warn('ElectronAPI indisponível em ambiente puro:', e);
  }

  // Carregar dados das abas
  await carregarDashboard();
  await carregarAlunos();
  await carregarInstrutores();
  await carregarVeiculos();
  await carregarTurmas();
  await carregarAulasPraticas();
  await carregarExames();

  // Configurar Formulários e Ações
  configurarFormularioAluno();
  configurarFormularioInstrutor();
  configurarFormularioVeiculo();
  configurarFormularioAtualizarKm();
  configurarImportacaoCSV();
  configurarFiltrosAlunos();

  // Sprint 2: Configurar Agendamento Inteligente & Turmas
  configurarFormularioNovaTurma();
  configurarGerenciadorMatriculas();
  configurarFormularioAgendarPratica();
});

// ================= DASHBOARD =================
async function carregarDashboard() {
  if (!window.electronAPI) return;
  try {
    const stats = await window.electronAPI.getDashboardStats();
    document.getElementById('stat-alunos').textContent = stats.totalAlunos;
    document.getElementById('stat-instrutores').textContent = stats.totalInstrutores;
    document.getElementById('stat-revisoes').textContent = stats.veiculosAlertaRevisao;
    document.getElementById('stat-chuva').textContent = stats.alertasChuva;

    // Turmas no dashboard
    const turmas = await window.electronAPI.listarTurmas();
    const tbodyTurmas = document.querySelector('#tabela-turmas-dash tbody');
    if (tbodyTurmas) {
      tbodyTurmas.innerHTML = turmas.map(t => `
        <tr>
          <td><strong class="text-primary">${t.codigo}</strong></td>
          <td>${t.sala_nome}</td>
          <td>${t.instrutor_nome}</td>
          <td>${t.horario_inicio} - ${t.horario_fim}</td>
          <td>
            <div class="d-flex align-items-center gap-2">
              <div class="progress flex-grow-1" style="height: 6px;">
                <div class="progress-bar ${t.total_alunos >= 20 ? 'bg-danger' : 'bg-success'}" style="width: ${(t.total_alunos / 20) * 100}%"></div>
              </div>
              <small class="fw-bold">${t.total_alunos}/20</small>
            </div>
          </td>
          <td><span class="badge ${t.status === 'EM_ANDAMENTO' ? 'bg-primary' : 'bg-secondary'}">${t.status}</span></td>
        </tr>
      `).join('');
    }

    // Aulas no dashboard
    const aulas = await window.electronAPI.listarAulasPraticas();
    const tbodyAulas = document.querySelector('#tabela-aulas-dash tbody');
    if (tbodyAulas) {
      tbodyAulas.innerHTML = aulas.map(a => `
        <tr>
          <td>${a.aluno_nome}</td>
          <td><span class="badge bg-dark">${a.categoria}</span></td>
          <td>${a.horario_inicio}</td>
          <td>
            ${a.alerta_chuva ? '<span class="badge bg-warning text-dark"><i class="bi bi-cloud-rain me-1"></i>Chuva (Moto)</span>' : '<span class="badge bg-success">Normal</span>'}
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    console.error('Erro ao carregar dados do dashboard:', err);
  }
}

// ================= ALUNOS =================
async function carregarAlunos() {
  if (!window.electronAPI) return;
  const filtroCat = document.getElementById('filtro-categoria-aluno')?.value;
  const filtroStatus = document.getElementById('filtro-status-aluno')?.value;

  const alunos = await window.electronAPI.listarAlunos({ categoria: filtroCat, status: filtroStatus });
  const tbody = document.querySelector('#tabela-alunos tbody');
  if (!tbody) return;

  if (alunos.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted py-3">Nenhum aluno encontrado para os filtros selecionados.</td></tr>';
    return;
  }

  tbody.innerHTML = alunos.map(a => `
    <tr>
      <td class="fw-bold">${a.nome}</td>
      <td><code>${a.cpf}</code></td>
      <td>${a.renach || '<span class="text-muted">Pendente</span>'}</td>
      <td><span class="badge bg-primary">Cat ${a.categoria_pretendida}</span></td>
      <td>${a.telefone}</td>
      <td><span class="badge bg-info text-dark">${a.status_processo}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-ver-carga-horaria" data-id="${a.id}" data-nome="${a.nome}" title="Ficha de Carga Horária DETRAN">
          <i class="bi bi-person-lines-fill me-1"></i> Carga Horária
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-ver-carga-horaria').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const alunoId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
      const modal = new bootstrap.Modal(document.getElementById('modalCargaHoraria'));
      modal.show();

      const container = document.getElementById('conteudoCargaHoraria');
      container.innerHTML = '<div class="text-center py-4"><span class="spinner-border"></span></div>';

      const ch = await window.electronAPI.obterCargaHoraria(alunoId);
      container.innerHTML = `
        <div class="mb-3">
          <h6 class="fw-bold mb-1">${ch.alunoNome}</h6>
          <span class="badge bg-primary">Categoria ${ch.categoria}</span>
        </div>

        <div class="card p-3 mb-3 bg-light border-0">
          <h6 class="fw-bold small text-secondary mb-2">CURSO TEÓRICO-TÉCNICO (DETRAN: 45h/aula)</h6>
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small">Progresso das 45h</span>
            <span class="fw-bold">${ch.horasTeoricasCumpridas} / 45 h</span>
          </div>
          <div class="progress mb-2" style="height: 8px;">
            <div class="progress-bar ${ch.prontoParaExameTeorico ? 'bg-success' : 'bg-primary'}" style="width: ${(ch.horasTeoricasCumpridas / 45) * 100}%"></div>
          </div>
          <small class="text-muted">Disciplinas: Legislação (18h), Defensiva (16h), Primeiros Socorros (4h), Meio Ambiente (4h), Mecânica (3h).</small>
          <div class="mt-2">
            Status: ${ch.prontoParaExameTeorico
              ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Apto para Exame Teórico DETRAN</span>'
              : '<span class="badge bg-warning text-dark">Cursando Módulos Teóricos</span>'}
          </div>
        </div>

        <div class="card p-3 bg-light border-0">
          <h6 class="fw-bold small text-secondary mb-2">AULAS PRÁTICAS DE DIREÇÃO</h6>
          <div class="d-flex justify-content-between align-items-center mb-1">
            <span class="small">Aulas Práticas Realizadas</span>
            <span class="fw-bold">${ch.horasPraticasCumpridas} h</span>
          </div>
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="small"><i class="bi bi-moon-stars me-1 text-primary"></i>Aulas Noturnas (Obrigatórias)</span>
            <span class="badge ${ch.horasNoturnasCumpridas >= 1 ? 'bg-success' : 'bg-danger'}">${ch.horasNoturnasCumpridas} Noturnas</span>
          </div>
          <div>
            Status: ${ch.prontoParaExamePratico
              ? '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Apto para Exame Prático DETRAN</span>'
              : '<span class="badge bg-secondary">Aulas Práticas Pendentes</span>'}
          </div>
        </div>
      `;
    });
  });
}

// ================= INSTRUTORES =================
async function carregarInstrutores() {
  if (!window.electronAPI) return;
  const inst = await window.electronAPI.listarInstrutores();
  const tbody = document.querySelector('#tabela-instrutores tbody');
  if (!tbody) return;

  tbody.innerHTML = inst.map(i => `
    <tr>
      <td class="fw-bold">${i.nome}</td>
      <td><code>${i.credencial_detran}</code></td>
      <td><span class="badge ${i.tipo === 'TEORICO' ? 'bg-info text-dark' : 'bg-primary'}">${i.tipo}</span></td>
      <td>
        ${i.habilita_veiculos_pesados ? '<span class="badge bg-warning text-dark"><i class="bi bi-truck me-1"></i>Sim (Cat C, D, E)</span>' : '<span class="badge bg-light text-muted">Apenas Leves</span>'}
      </td>
      <td>${i.telefone}</td>
      <td><span class="badge bg-success">Ativo</span></td>
    </tr>
  `).join('');
}

// ================= VEÍCULOS & FROTA =================
async function carregarVeiculos() {
  if (!window.electronAPI) return;
  const veics = await window.electronAPI.listarVeiculos();
  const tbody = document.querySelector('#tabela-veiculos tbody');
  if (!tbody) return;

  tbody.innerHTML = veics.map(v => `
    <tr>
      <td><strong><code>${v.placa}</code></strong></td>
      <td>${v.modelo} (${v.ano})</td>
      <td><span class="badge bg-dark">Cat ${v.categoria}</span></td>
      <td>${Number(v.km_atual).toLocaleString()} km</td>
      <td>${Number(v.km_ultima_revisao).toLocaleString()} km</td>
      <td>
        ${v.status === 'ALERTA_REVISAO'
          ? '<span class="badge bg-danger"><i class="bi bi-exclamation-triangle-fill me-1"></i>Revisão Próxima</span>'
          : '<span class="badge bg-success">Operacional</span>'}
      </td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-abrir-atualizar-km" data-id="${v.id}" data-placa="${v.placa}" data-modelo="${v.modelo}" data-km="${v.km_atual}">
          <i class="bi bi-speedometer2 me-1"></i> KM / Revisão
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-abrir-atualizar-km').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const b = e.currentTarget;
      document.getElementById('veiculoIdKm').value = b.getAttribute('data-id');
      document.getElementById('veiculoLabelKm').textContent = `${b.getAttribute('data-placa')} - ${b.getAttribute('data-modelo')}`;
      document.getElementById('inputNovoKm').value = b.getAttribute('data-km');
      document.getElementById('checkRegistrarRevisao').checked = false;
      const modal = new bootstrap.Modal(document.getElementById('modalAtualizarKm'));
      modal.show();
    });
  });
}

// ================= TURMAS TEÓRICAS (2 SALAS, MÁX 20 ALUNOS) =================
async function carregarTurmas() {
  if (!window.electronAPI) return;
  const turmas = await window.electronAPI.listarTurmas();
  const tbody = document.querySelector('#tabela-turmas tbody');
  if (!tbody) return;

  tbody.innerHTML = turmas.map(t => `
    <tr>
      <td><strong class="text-primary">${t.codigo}</strong></td>
      <td><span class="badge bg-secondary">${t.sala_nome}</span></td>
      <td>${t.instrutor_nome}</td>
      <td>${t.data_inicio} até ${t.data_fim}</td>
      <td>${t.horario_inicio} às ${t.horario_fim}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="progress flex-grow-1" style="height: 6px;">
            <div class="progress-bar ${t.total_alunos >= 20 ? 'bg-danger' : 'bg-success'}" style="width: ${(t.total_alunos / 20) * 100}%"></div>
          </div>
          <span class="badge ${t.total_alunos >= 20 ? 'bg-danger' : 'bg-success'}">
            ${t.total_alunos} / 20
          </span>
        </div>
      </td>
      <td><span class="badge bg-primary">${t.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary btn-gerenciar-matriculas" data-id="${t.id}" data-codigo="${t.codigo}" data-sala="${t.sala_nome}" data-total="${t.total_alunos}">
          <i class="bi bi-people-fill me-1"></i> Matrículas
        </button>
      </td>
    </tr>
  `).join('');

  document.querySelectorAll('.btn-gerenciar-matriculas').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const b = e.currentTarget;
      turmaSelecionadaId = parseInt(b.getAttribute('data-id'), 10);
      document.getElementById('modalGerenciarMatriculasLabel').textContent = `Matrículas: ${b.getAttribute('data-codigo')}`;
      document.getElementById('labelTurmaMatriculaInfo').textContent = `${b.getAttribute('data-sala')} | Limite Máximo de 20 Alunos`;

      await atualizarModalMatriculas();
      const modal = new bootstrap.Modal(document.getElementById('modalGerenciarMatriculas'));
      modal.show();
    });
  });
}

async function atualizarModalMatriculas() {
  if (!turmaSelecionadaId) return;

  const alunosTurma = await window.electronAPI.listarAlunosTurma(turmaSelecionadaId);
  const total = alunosTurma.length;

  const badge = document.getElementById('badgeOcupacaoTurma');
  const bar = document.getElementById('progressBarOcupacao');
  const btnMatricular = document.getElementById('btnConfirmarMatricula');

  badge.textContent = `${total} / 20 Alunos`;
  badge.className = total >= 20 ? 'badge bg-danger' : 'badge bg-success';
  bar.style.width = `${(total / 20) * 100}%`;
  bar.className = total >= 20 ? 'progress-bar bg-danger' : 'progress-bar bg-success';

  btnMatricular.disabled = total >= 20;
  if (total >= 20) {
    btnMatricular.textContent = 'Turma Lotada (Máx 20)';
  } else {
    btnMatricular.textContent = 'Matricular Aluno';
  }

  // Tabela de matriculados
  const tbody = document.querySelector('#tabelaMatriculados tbody');
  if (alunosTurma.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-3">Nenhum aluno matriculado nesta turma ainda.</td></tr>';
  } else {
    tbody.innerHTML = alunosTurma.map(m => `
      <tr>
        <td class="fw-bold">${m.aluno_nome}</td>
        <td><code>${m.aluno_cpf}</code></td>
        <td>Cat ${m.categoria_pretendida || 'B'}</td>
        <td>${m.aluno_telefone || '-'}</td>
        <td>
          <button class="btn btn-sm btn-outline-danger btn-desmatricular" data-alunoid="${m.aluno_id}">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-desmatricular').forEach(btn => {
      btn.addEventListener('click', async (evt) => {
        const alunoId = parseInt(evt.currentTarget.getAttribute('data-alunoid'), 10);
        await window.electronAPI.desmatricularAlunoTurma(turmaSelecionadaId, alunoId);
        await atualizarModalMatriculas();
        await carregarTurmas();
        await carregarDashboard();
      });
    });
  }

  // Preencher Select de Alunos Não Matriculados
  const todosAlunos = await window.electronAPI.listarAlunos();
  const matriculadosIds = alunosTurma.map(m => m.aluno_id);
  const disponiveis = todosAlunos.filter(a => !matriculadosIds.includes(a.id));

  const select = document.getElementById('selectAlunoMatricular');
  select.innerHTML = disponiveis.map(a => `
    <option value="${a.id}">${a.nome} (CPF: ${a.cpf}) - Cat ${a.categoria_pretendida}</option>
  `).join('');
}

function configurarGerenciadorMatriculas() {
  document.getElementById('btnConfirmarMatricula')?.addEventListener('click', async () => {
    const alunoId = parseInt(document.getElementById('selectAlunoMatricular').value, 10);
    if (!alunoId || !turmaSelecionadaId) return;

    const res = await window.electronAPI.matricularAlunoTurma(turmaSelecionadaId, alunoId);
    if (res.success) {
      await atualizarModalMatriculas();
      await carregarTurmas();
      await carregarDashboard();
    } else {
      alert('Bloqueio de Matrícula: ' + res.error);
    }
  });
}

function configurarFormularioNovaTurma() {
  const form = document.getElementById('formNovaTurma');
  if (!form) return;

  // Carregar instrutores teóricos no select
  const selectInst = document.getElementById('selectTurmaInstrutor');
  document.querySelector('[data-bs-target="#modalNovaTurma"]')?.addEventListener('click', async () => {
    const instrutores = await window.electronAPI.listarInstrutores();
    const teoricos = instrutores.filter(i => i.tipo === 'TEORICO' || i.tipo === 'AMBOS');
    selectInst.innerHTML = teoricos.map(i => `
      <option value="${i.id}">${i.nome} (Credencial: ${i.credencial_detran})</option>
    `).join('');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const turma = {
      codigo: document.getElementById('inputTurmaCodigo').value.trim(),
      sala_id: parseInt(document.getElementById('selectTurmaSala').value, 10),
      instrutor_id: parseInt(document.getElementById('selectTurmaInstrutor').value, 10),
      data_inicio: document.getElementById('inputTurmaDataInicio').value,
      data_fim: document.getElementById('inputTurmaDataFim').value,
      horario_inicio: document.getElementById('inputTurmaHoraInicio').value,
      horario_fim: document.getElementById('inputTurmaHoraFim').value,
      status: 'PLANEJADA'
    };

    const res = await window.electronAPI.salvarTurma(turma);
    if (res.success) {
      alert('Turma teórica cadastrada com sucesso nas 2 salas físicas!');
      bootstrap.Modal.getInstance(document.getElementById('modalNovaTurma'))?.hide();
      form.reset();
      await carregarTurmas();
      await carregarDashboard();
    } else {
      alert('Impedimento de Conflito de Horário:\n' + res.error);
    }
  });
}

// ================= AULAS PRÁTICAS & MOTOR DE CONFLITOS =================
async function carregarAulasPraticas() {
  if (!window.electronAPI) return;
  const aulas = await window.electronAPI.listarAulasPraticas();
  const tbody = document.querySelector('#tabela-praticas tbody');
  if (!tbody) return;

  tbody.innerHTML = aulas.map(a => `
    <tr>
      <td>${a.data_aula}</td>
      <td><strong>${a.horario_inicio} - ${a.horario_fim}</strong></td>
      <td class="fw-bold">${a.aluno_nome}</td>
      <td>${a.instrutor_nome}</td>
      <td>${a.veiculo_modelo} (<code>${a.veiculo_placa}</code>)</td>
      <td>${a.eh_noturna ? '<span class="badge bg-dark"><i class="bi bi-moon-stars me-1"></i>Noturna</span>' : '<span class="badge bg-light text-muted">Diurna</span>'}</td>
      <td>
        ${a.alerta_chuva ? '<span class="badge bg-warning text-dark"><i class="bi bi-cloud-rain me-1"></i>Chuva (Reagendar)</span>' : '<span class="badge bg-success">Clima Bom</span>'}
      </td>
      <td>
        <span class="badge ${a.status === 'REALIZADA' ? 'bg-success' : (a.status === 'FALTOU' ? 'bg-danger' : 'bg-primary')}">${a.status}</span>
      </td>
      <td>
        ${a.status === 'AGENDADA' ? `
          <div class="btn-group btn-group-sm">
            <button class="btn btn-outline-success btn-status-aula" data-id="${a.id}" data-status="REALIZADA" title="Confirmar Presença e Rodagem"><i class="bi bi-check-lg"></i></button>
            <button class="btn btn-outline-danger btn-status-aula" data-id="${a.id}" data-status="FALTOU" title="Lançar Falta"><i class="bi bi-x-lg"></i></button>
            <button class="btn btn-outline-secondary btn-status-aula" data-id="${a.id}" data-status="CANCELADA" title="Cancelar"><i class="bi bi-slash-circle"></i></button>
          </div>
        ` : '-'}
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.btn-status-aula').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const aulaId = parseInt(e.currentTarget.getAttribute('data-id'), 10);
      const status = e.currentTarget.getAttribute('data-status');
      const res = await window.electronAPI.atualizarStatusAulaPratica(aulaId, status);
      if (res.success) {
        await carregarAulasPraticas();
        await carregarVeiculos();
        await carregarDashboard();
      } else {
        alert('Erro ao atualizar aula: ' + res.error);
      }
    });
  });
}

function configurarFormularioAgendarPratica() {
  const form = document.getElementById('formAgendarPratica');
  if (!form) return;

  const selectAluno = document.getElementById('selectPraticaAluno');
  const selectCat = document.getElementById('selectPraticaCategoria');
  const selectInst = document.getElementById('selectPraticaInstrutor');
  const selectVeic = document.getElementById('selectPraticaVeiculo');
  const inputHoraInicio = document.getElementById('inputPraticaHoraInicio');
  const checkNoturna = document.getElementById('checkAulaNoturna');
  const checkChuva = document.getElementById('checkAlertaChuva');

  // Monitorar início de horário para marcar aula noturna
  inputHoraInicio.addEventListener('change', () => {
    if (inputHoraInicio.value >= '18:00') {
      checkNoturna.checked = true;
    }
  });

  // Carregar opções ao abrir modal
  document.querySelector('[data-bs-target="#modalAgendarPratica"]')?.addEventListener('click', async () => {
    const alunos = await window.electronAPI.listarAlunos();
    selectAluno.innerHTML = alunos.map(a => `<option value="${a.id}" data-cat="${a.categoria_pretendida}">${a.nome} (Cat ${a.categoria_pretendida})</option>`).join('');

    const instrutores = await window.electronAPI.listarInstrutores();
    const veiculos = await window.electronAPI.listarVeiculos();

    function atualizarListasPorCategoria(cat) {
      // Filtrar instrutores (se Cat C, D, E exige pesados)
      const isPesado = ['C', 'D', 'E'].includes(cat);
      const instFiltrados = instrutores.filter(i => (i.tipo === 'PRATICO' || i.tipo === 'AMBOS') && (!isPesado || i.habilita_veiculos_pesados));
      selectInst.innerHTML = instFiltrados.map(i => `
        <option value="${i.id}">${i.nome} ${i.habilita_veiculos_pesados ? '[Cat C/D/E Pesados]' : ''}</option>
      `).join('');

      // Filtrar veículos por categoria
      const veicFiltrados = veiculos.filter(v => v.categoria === cat);
      selectVeic.innerHTML = veicFiltrados.map(v => `
        <option value="${v.id}">${v.modelo} (${v.placa}) - KM: ${v.km_atual} [${v.status}]</option>
      `).join('');

      // Se categoria A, sugere alerta meteorológico se marcado
      if (cat === 'A') {
        checkChuva.parentElement.parentElement.classList.remove('d-none');
      } else {
        checkChuva.parentElement.parentElement.classList.add('d-none');
        checkChuva.checked = false;
      }
    }

    selectCat.addEventListener('change', () => atualizarListasPorCategoria(selectCat.value));
    atualizarListasPorCategoria(selectCat.value);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const aula = {
      aluno_id: parseInt(selectAluno.value, 10),
      categoria: selectCat.value,
      instrutor_id: parseInt(selectInst.value, 10),
      veiculo_id: parseInt(selectVeic.value, 10),
      data_aula: document.getElementById('inputPraticaData').value,
      horario_inicio: inputHoraInicio.value,
      horario_fim: document.getElementById('inputPraticaHoraFim').value,
      eh_noturna: checkNoturna.checked,
      alerta_chuva: checkChuva.checked,
      observacoes: document.getElementById('inputPraticaObservacoes').value.trim()
    };

    const res = await window.electronAPI.salvarAulaPratica(aula);
    if (res.success) {
      alert('Aula prática agendada com validação total contra conflito de horários!');
      bootstrap.Modal.getInstance(document.getElementById('modalAgendarPratica'))?.hide();
      form.reset();
      await carregarAulasPraticas();
      await carregarDashboard();
    } else {
      alert('BLOQUEIO DE CONFLITO OU REGRA DETRAN:\n' + res.error);
    }
  });
}

// ================= EXAMES =================
async function carregarExames() {
  if (!window.electronAPI) return;
  const exames = await window.electronAPI.listarExames();
  const tbody = document.querySelector('#tabela-exames tbody');
  if (!tbody) return;

  tbody.innerHTML = exames.map(e => `
    <tr>
      <td class="fw-bold">${e.aluno_nome}</td>
      <td><span class="badge bg-dark">${e.tipo}</span></td>
      <td>Cat ${e.categoria}</td>
      <td>${e.data_exame}</td>
      <td>${e.horario} - ${e.local_exame}</td>
      <td><span class="badge ${e.status === 'APROVADO' ? 'bg-success' : (e.status === 'REPROVADO' ? 'bg-danger' : 'bg-primary')}">${e.status}</span></td>
      <td>
        ${e.eh_reteste ? `<span class="badge bg-warning text-dark">Reteste (R$ ${e.valor_taxa})</span>` : '<span class="badge bg-light text-muted">1º Exame</span>'}
      </td>
    </tr>
  `).join('');
}

function configurarFiltrosAlunos() {
  document.getElementById('filtro-categoria-aluno')?.addEventListener('change', carregarAlunos);
  document.getElementById('filtro-status-aluno')?.addEventListener('change', carregarAlunos);
}

// ================= FORMULÁRIOS BÁSICOS =================
function configurarFormularioAluno() {
  const form = document.getElementById('formNovoAluno');
  if (!form) return;

  const inputCPF = document.getElementById('inputCPF');
  const inputTelefone = document.getElementById('inputTelefone');
  const inputRenach = document.getElementById('inputRenach');
  const inputNascimento = document.getElementById('inputNascimento');
  const inputCategoria = document.getElementById('inputCategoria');
  const inputEmail = document.getElementById('inputEmail');

  inputCPF.addEventListener('input', (e) => {
    e.target.value = Validators.mascaraCPF(e.target.value);
    const valido = Validators.validarCPF(e.target.value);
    Validators.setFieldStatus(e.target, valido, document.getElementById('feedbackCPF'), 'CPF inválido.');
  });

  inputTelefone.addEventListener('input', (e) => {
    e.target.value = Validators.mascaraTelefone(e.target.value);
    const valido = Validators.validarTelefone(e.target.value);
    Validators.setFieldStatus(e.target, valido, document.getElementById('feedbackTelefone'), 'Telefone celular inválido.');
  });

  inputRenach.addEventListener('input', (e) => {
    const valido = Validators.validarRenach(e.target.value);
    Validators.setFieldStatus(e.target, valido, document.getElementById('feedbackRenach'), 'RENACH inválido.');
  });

  inputNascimento.addEventListener('change', (e) => {
    const valido = Validators.validarIdadeMinima(e.target.value, inputCategoria.value);
    Validators.setFieldStatus(e.target, valido, document.getElementById('feedbackNascimento'), 'Idade mínima não atingida.');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!Validators.validarCPF(inputCPF.value) || !Validators.validarTelefone(inputTelefone.value)) {
      alert('Corrija os campos com erro antes de salvar.');
      return;
    }

    const aluno = {
      nome: document.getElementById('inputNome').value.trim(),
      cpf: inputCPF.value,
      rg: document.getElementById('inputRG').value.trim(),
      renach: inputRenach.value.trim() || undefined,
      data_nascimento: inputNascimento.value,
      telefone: inputTelefone.value,
      email: inputEmail.value.trim(),
      categoria_pretendida: inputCategoria.value,
      status_exame_medico: 'PENDENTE',
      status_exame_psico: 'PENDENTE',
      status_processo: 'PRE_CADASTRO'
    };

    const res = await window.electronAPI.salvarAluno(aluno);
    if (res.success) {
      alert('Aluno cadastrado com sucesso!');
      bootstrap.Modal.getInstance(document.getElementById('modalNovoAluno'))?.hide();
      form.reset();
      await carregarDashboard();
      await carregarAlunos();
    } else {
      alert('Erro ao salvar aluno: ' + res.error);
    }
  });
}

function configurarFormularioInstrutor() {
  const form = document.getElementById('formNovoInstrutor');
  if (!form) return;

  const inputCPF = document.getElementById('inputInstCPF');
  const inputTel = document.getElementById('inputInstTelefone');

  inputCPF.addEventListener('input', (e) => {
    e.target.value = Validators.mascaraCPF(e.target.value);
  });
  inputTel.addEventListener('input', (e) => {
    e.target.value = Validators.mascaraTelefone(e.target.value);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!Validators.validarCPF(inputCPF.value)) {
      alert('CPF do instrutor inválido.');
      return;
    }

    const inst = {
      nome: document.getElementById('inputInstNome').value.trim(),
      cpf: inputCPF.value,
      credencial_detran: document.getElementById('inputInstCredencial').value.trim(),
      telefone: inputTel.value,
      email: document.getElementById('inputInstEmail').value.trim() || undefined,
      tipo: document.getElementById('inputInstTipo').value,
      habilita_veiculos_pesados: document.getElementById('checkHabilitaPesados').checked,
      ativo: true
    };

    const res = await window.electronAPI.salvarInstrutor(inst);
    if (res.success) {
      alert('Instrutor credenciado com sucesso!');
      bootstrap.Modal.getInstance(document.getElementById('modalNovoInstrutor'))?.hide();
      form.reset();
      await carregarDashboard();
      await carregarInstrutores();
    } else {
      alert('Erro ao salvar instrutor: ' + res.error);
    }
  });
}

function configurarFormularioVeiculo() {
  const form = document.getElementById('formNovoVeiculo');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const placa = document.getElementById('inputVeicPlaca').value.trim().toUpperCase();
    if (!Validators.validarPlaca(placa)) {
      alert('Placa veicular inválida.');
      return;
    }

    const veic = {
      placa: placa,
      modelo: document.getElementById('inputVeicModelo').value.trim(),
      ano: parseInt(document.getElementById('inputVeicAno').value, 10),
      categoria: document.getElementById('inputVeicCategoria').value,
      km_atual: parseInt(document.getElementById('inputVeicKmAtual').value, 10) || 0,
      km_ultima_revisao: 0,
      intervalo_revisao_km: parseInt(document.getElementById('inputVeicIntervalo').value, 10) || 10000,
      status: 'DISPONIVEL'
    };

    const res = await window.electronAPI.salvarVeiculo(veic);
    if (res.success) {
      alert('Veículo cadastrado na frota com sucesso!');
      bootstrap.Modal.getInstance(document.getElementById('modalNovoVeiculo'))?.hide();
      form.reset();
      await carregarDashboard();
      await carregarVeiculos();
    } else {
      alert('Erro ao cadastrar veículo: ' + res.error);
    }
  });
}

function configurarFormularioAtualizarKm() {
  const form = document.getElementById('formAtualizarKm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = parseInt(document.getElementById('veiculoIdKm').value, 10);
    const novoKm = parseInt(document.getElementById('inputNovoKm').value, 10);
    const registrarRevisao = document.getElementById('checkRegistrarRevisao').checked;

    const res = await window.electronAPI.atualizarKmVeiculo(id, novoKm, registrarRevisao);
    if (res.success) {
      alert('Quilometragem e status de revisão atualizados!');
      bootstrap.Modal.getInstance(document.getElementById('modalAtualizarKm'))?.hide();
      await carregarDashboard();
      await carregarVeiculos();
    } else {
      alert('Erro ao atualizar: ' + res.error);
    }
  });
}

function configurarImportacaoCSV() {
  const modalEl = document.getElementById('modalImportarCSV');
  const modal = new bootstrap.Modal(modalEl);
  const inputArquivo = document.getElementById('inputArquivoCSV');
  const btnConfirmar = document.getElementById('btn-confirmar-import-csv');
  const btnTemplate = document.getElementById('btn-baixar-template-csv');

  document.querySelectorAll('.btn-abrir-import-csv').forEach(btn => {
    btn.addEventListener('click', (e) => {
      csvTipoAtual = e.currentTarget.getAttribute('data-tipo') || 'alunos';
      document.getElementById('modalImportarCSVLabel').innerHTML = `<i class="bi bi-filetype-csv me-2 text-success"></i>Importação de CSV - ${csvTipoAtual.toUpperCase()}`;
      inputArquivo.value = '';
      document.getElementById('csv-resumo-container').classList.add('d-none');
      document.getElementById('preview-csv-body').innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">Selecione um arquivo CSV para validação preliminar.</td></tr>';
      btnConfirmar.disabled = true;
      dadosCSVValidados = [];
      modal.show();
    });
  });

  btnTemplate.addEventListener('click', () => {
    CSVManager.baixarTemplate(csvTipoAtual);
  });

  inputArquivo.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const texto = evt.target.result;
      const registros = CSVManager.parseCSVText(texto);
      const resultado = CSVManager.validarRegistros(csvTipoAtual, registros);

      dadosCSVValidados = resultado;
      renderizarPreviewCSV(resultado);
    };
    reader.readAsText(file, 'UTF-8');
  });

  btnConfirmar.addEventListener('click', async () => {
    const validos = dadosCSVValidados.filter(r => r.valido).map(r => r.dadosNormalizados);
    if (validos.length === 0) {
      alert('Não há registros válidos para importar.');
      return;
    }

    btnConfirmar.disabled = true;
    btnConfirmar.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Importando...';

    let res;
    if (csvTipoAtual === 'alunos') {
      res = await window.electronAPI.importarAlunosCSV(validos);
      await carregarAlunos();
    } else if (csvTipoAtual === 'instrutores') {
      res = await window.electronAPI.importarInstrutoresCSV(validos);
      await carregarInstrutores();
    } else if (csvTipoAtual === 'veiculos') {
      res = await window.electronAPI.importarVeiculosCSV(validos);
      await carregarVeiculos();
    }

    await carregarDashboard();
    modal.hide();
    btnConfirmar.disabled = false;
    btnConfirmar.innerHTML = '<i class="bi bi-cloud-arrow-up-fill me-1"></i> Confirmar Importação';

    if (res && res.success) {
      alert(`Importação concluída com sucesso! ${res.inseridos} registros inseridos/atualizados.`);
    } else {
      alert('Erro na importação: ' + (res?.erros?.join('\n') || 'Falha ao salvar registros.'));
    }
  });
}

function renderizarPreviewCSV(resultado) {
  const tbody = document.getElementById('preview-csv-body');
  const resumoContainer = document.getElementById('csv-resumo-container');
  const badgeTotal = document.getElementById('csv-badge-total');
  const badgeValidas = document.getElementById('csv-badge-validas');
  const badgeErros = document.getElementById('csv-badge-erros');
  const btnConfirmar = document.getElementById('btn-confirmar-import-csv');

  const total = resultado.length;
  const validas = resultado.filter(r => r.valido).length;
  const erros = total - validas;

  resumoContainer.classList.remove('d-none');
  badgeTotal.textContent = `Total de Linhas: ${total}`;
  badgeValidas.textContent = `Linhas Válidas: ${validas}`;
  badgeErros.textContent = `Linhas com Erros: ${erros}`;

  btnConfirmar.disabled = validas === 0;
  btnConfirmar.textContent = `Confirmar Importação de ${validas} Registros Válidos`;

  if (resultado.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger py-3">O arquivo CSV está vazio ou em formato incorreto.</td></tr>';
    return;
  }

  tbody.innerHTML = resultado.map(item => `
    <tr class="${item.valido ? '' : 'table-danger'}">
      <td><strong>#${item.linha}</strong></td>
      <td>
        ${item.valido ? '<span class="badge bg-success">Válido</span>' : '<span class="badge bg-danger">Incorreto</span>'}
      </td>
      <td>
        <div class="small">
          <strong>${item.dadosNormalizados.nome || item.dadosNormalizados.placa}</strong>
          ${item.dadosNormalizados.cpf ? ` | CPF: <code>${item.dadosNormalizados.cpf}</code>` : ''}
          ${item.dadosNormalizados.categoria ? ` | Cat: ${item.dadosNormalizados.categoria}` : ''}
        </div>
      </td>
      <td class="small ${item.valido ? 'text-muted' : 'text-danger fw-bold'}">
        ${item.valido ? 'Pronto para inserção' : item.erros.join('; ')}
      </td>
    </tr>
  `).join('');
}
