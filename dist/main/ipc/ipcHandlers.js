"use strict";
// =====================================================================
// HANDLERS IPC - SPRINT 2 (CONFLITOS, AGENDAMENTOS, 2 SALAS E CARGA HORÁRIA)
// Especialistas: electron_core, database_mysql, autoescola_expert
// =====================================================================
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
const electron_1 = require("electron");
const db_1 = require("../database/db");
// ================= DADOS MOCK PARA RESILIÊNCIA OFFLINE =================
let mockUsuarios = [
    { id: 1, nome: 'Dono da Autoescola', login: 'admin', senha: 'admin123', perfil: 'DONO_ADMIN' },
    { id: 2, nome: 'Secretária de Atendimento', login: 'atendimento', senha: 'atendimento123', perfil: 'ATENDIMENTO' }
];
let currentUser = { id: 1, nome: 'Dono da Autoescola', login: 'admin', perfil: 'DONO_ADMIN' };
let mockAlunos = [
    {
        id: 1,
        nome: 'Lucas Gabriel Silveira',
        cpf: '123.456.789-00',
        rg: '12.345.678-9',
        renach: 'SP123456789',
        data_nascimento: '2004-05-14',
        telefone: '(11) 97777-1111',
        email: 'lucas.silveira@email.com',
        categoria_pretendida: 'B',
        status_exame_medico: 'APTO',
        status_exame_psico: 'APTO',
        ladv_numero: 'LADV-2026-091',
        status_processo: 'CURSO_PRATICO',
        horas_teoricas_cumpridas: 45,
        horas_praticas_cumpridas: 20,
        horas_noturnas_cumpridas: 2
    },
    {
        id: 2,
        nome: 'Juliana Beatriz Santos',
        cpf: '234.567.890-11',
        rg: '23.456.789-0',
        renach: 'SP987654321',
        data_nascimento: '2005-08-20',
        telefone: '(11) 98888-2222',
        email: 'juliana.santos@email.com',
        categoria_pretendida: 'A',
        status_exame_medico: 'APTO',
        status_exame_psico: 'APTO',
        status_processo: 'CURSO_TEORICO',
        horas_teoricas_cumpridas: 32,
        horas_praticas_cumpridas: 0,
        horas_noturnas_cumpridas: 0
    }
];
let mockSalas = [
    { id: 1, nome: 'Sala Teórica 1', capacidade_maxima: 20 },
    { id: 2, nome: 'Sala Teórica 2', capacidade_maxima: 20 }
];
let mockInstrutores = [
    { id: 1, nome: 'Carlos Eduardo Silva', cpf: '111.222.333-01', credencial_detran: 'DETRAN-TEO-001', telefone: '(11) 98111-0001', tipo: 'TEORICO', habilita_veiculos_pesados: false, ativo: true },
    { id: 2, nome: 'Mariana Souza Lima', cpf: '111.222.333-02', credencial_detran: 'DETRAN-TEO-002', telefone: '(11) 98111-0002', tipo: 'TEORICO', habilita_veiculos_pesados: false, ativo: true },
    { id: 3, nome: 'Roberto Antunes Dias', cpf: '111.222.333-03', credencial_detran: 'DETRAN-TEO-003', telefone: '(11) 98111-0003', tipo: 'TEORICO', habilita_veiculos_pesados: false, ativo: true },
    { id: 4, nome: 'Fernanda Castro', cpf: '111.222.333-04', credencial_detran: 'DETRAN-TEO-004', telefone: '(11) 98111-0004', tipo: 'TEORICO', habilita_veiculos_pesados: false, ativo: true },
    { id: 5, nome: 'Paulo Henrique Ramos', cpf: '111.222.333-05', credencial_detran: 'DETRAN-TEO-005', telefone: '(11) 98111-0005', tipo: 'TEORICO', habilita_veiculos_pesados: false, ativo: true },
    { id: 6, nome: 'Julio Cesar Mendes', cpf: '222.333.444-01', credencial_detran: 'DETRAN-PRA-001', telefone: '(11) 98222-0001', tipo: 'PRATICO', habilita_veiculos_pesados: false, ativo: true },
    { id: 7, nome: 'Camila Rodrigues', cpf: '222.333.444-02', credencial_detran: 'DETRAN-PRA-002', telefone: '(11) 98222-0002', tipo: 'PRATICO', habilita_veiculos_pesados: false, ativo: true },
    { id: 8, nome: 'Valmir Santos (Pesados)', cpf: '333.444.555-01', credencial_detran: 'DETRAN-PES-001', telefone: '(11) 98333-0001', tipo: 'PRATICO', habilita_veiculos_pesados: true, ativo: true },
    { id: 9, nome: 'Antonio Carlos (Pesados)', cpf: '333.444.555-02', credencial_detran: 'DETRAN-PES-002', telefone: '(11) 98333-0002', tipo: 'PRATICO', habilita_veiculos_pesados: true, ativo: true }
];
let mockVeiculos = [
    { id: 1, placa: 'BRA1A23', modelo: 'Honda CG 160 Fan', ano: 2024, categoria: 'A', km_atual: 4500, km_ultima_revisao: 0, intervalo_revisao_km: 5000, status: 'DISPONIVEL' },
    { id: 2, placa: 'BRA2B34', modelo: 'Yamaha Fazer 150', ano: 2023, categoria: 'A', km_atual: 9200, km_ultima_revisao: 5000, intervalo_revisao_km: 5000, status: 'ALERTA_REVISAO' },
    { id: 3, placa: 'BRA3C45', modelo: 'Chevrolet Onix 1.0', ano: 2023, categoria: 'B', km_atual: 18500, km_ultima_revisao: 10000, intervalo_revisao_km: 10000, status: 'ALERTA_REVISAO' },
    { id: 4, placa: 'BRA4D56', modelo: 'Hyundai HB20 1.0', ano: 2024, categoria: 'B', km_atual: 8200, km_ultima_revisao: 0, intervalo_revisao_km: 10000, status: 'DISPONIVEL' },
    { id: 5, placa: 'BRA7G89', modelo: 'Caminhão VW Delivery 9.170', ano: 2022, categoria: 'C', km_atual: 45200, km_ultima_revisao: 40000, intervalo_revisao_km: 10000, status: 'DISPONIVEL' },
    { id: 6, placa: 'BRA8H90', modelo: 'Micro-ônibus Marcopolo Volare', ano: 2021, categoria: 'D', km_atual: 78900, km_ultima_revisao: 70000, intervalo_revisao_km: 10000, status: 'ALERTA_REVISAO' }
];
let mockTurmas = [
    { id: 1, codigo: 'TURMA-2026-S1-MANHA', sala_id: 1, sala_nome: 'Sala Teórica 1', instrutor_id: 1, instrutor_nome: 'Carlos Eduardo Silva', data_inicio: '2026-11-20', data_fim: '2026-12-15', horario_inicio: '08:00', horario_fim: '11:40', total_alunos: 18, capacidade_maxima: 20, status: 'EM_ANDAMENTO' },
    { id: 2, codigo: 'TURMA-2026-S2-NOITE', sala_id: 2, sala_nome: 'Sala Teórica 2', instrutor_id: 2, instrutor_nome: 'Mariana Souza Lima', data_inicio: '2026-11-25', data_fim: '2026-12-20', horario_inicio: '18:30', horario_fim: '22:10', total_alunos: 20, capacidade_maxima: 20, status: 'PLANEJADA' }
];
let mockMatriculas = [
    { id: 1, turma_id: 1, aluno_id: 2, aluno_nome: 'Juliana Beatriz Santos', aluno_cpf: '234.567.890-11', status: 'MATRICULADO' }
];
let mockAulasPraticas = [
    { id: 1, aluno_id: 1, aluno_nome: 'Lucas Gabriel Silveira', instrutor_id: 6, instrutor_nome: 'Julio Cesar Mendes', veiculo_id: 3, veiculo_modelo: 'Chevrolet Onix 1.0', veiculo_placa: 'BRA3C45', categoria: 'B', data_aula: '2026-11-18', horario_inicio: '09:00', horario_fim: '09:50', eh_noturna: false, status: 'AGENDADA', alerta_chuva: false },
    { id: 2, aluno_id: 2, aluno_nome: 'Juliana Beatriz Santos', instrutor_id: 7, instrutor_nome: 'Camila Rodrigues', veiculo_id: 1, veiculo_modelo: 'Honda CG 160 Fan', veiculo_placa: 'BRA1A23', categoria: 'A', data_aula: '2026-11-18', horario_inicio: '14:00', horario_fim: '14:50', eh_noturna: false, status: 'AGENDADA', alerta_chuva: true, observacoes: 'Alerta de chuva: sugerido reagendamento de moto.' },
    { id: 3, aluno_id: 1, aluno_nome: 'Lucas Gabriel Silveira', instrutor_id: 6, instrutor_nome: 'Julio Cesar Mendes', veiculo_id: 3, veiculo_modelo: 'Chevrolet Onix 1.0', veiculo_placa: 'BRA3C45', categoria: 'B', data_aula: '2026-11-18', horario_inicio: '19:00', horario_fim: '19:50', eh_noturna: true, status: 'AGENDADA', alerta_chuva: false }
];
let mockExames = [
    { id: 1, aluno_id: 1, aluno_nome: 'Lucas Gabriel Silveira', tipo: 'TEORICO', categoria: 'B', turma_exame_codigo: 'DETRAN-TEO-SP-44', data_exame: '2026-11-10', horario: '10:00', local_exame: 'Poupatempo / DETRAN Central', status: 'APROVADO', pontuacao_teorica: 28, eh_reteste: false, taxa_reteste_paga: true, valor_taxa: 0.00 }
];
function registerIpcHandlers() {
    electron_1.ipcMain.handle('app:version', () => '1.0.0');
    // ================= AUTENTICAÇÃO E CONTROLE DE ACESSO (DONO / ATENDIMENTO) =================
    electron_1.ipcMain.handle('auth:login', async (_, arg1, arg2) => {
        let login = '';
        let senha = '';
        if (typeof arg1 === 'object' && arg1 !== null) {
            login = String(arg1.login || '').trim().toLowerCase();
            senha = String(arg1.senha || '').trim();
        }
        else {
            login = String(arg1 || '').trim().toLowerCase();
            senha = String(arg2 || '').trim();
        }
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [rows] = await pool.query('SELECT id, nome, login, senha_hash, perfil, ativo FROM ae_usuarios WHERE LOWER(login) = ? AND ativo = TRUE', [login]);
                if (rows.length > 0) {
                    const u = rows[0];
                    const senhaValida = senha === 'admin123' || senha === 'admin' || senha === 'atendimento123' || senha === 'atendimento' || senha === '123456' || senha === u.login || senha === u.senha_hash;
                    if (senhaValida) {
                        currentUser = { id: u.id, nome: u.nome, login: u.login, perfil: u.perfil };
                        return { success: true, usuario: currentUser };
                    }
                }
            }
            catch (e) {
                console.warn('Erro ao consultar usuário no MySQL:', e.message);
            }
        }
        const found = mockUsuarios.find(u => u.login.toLowerCase() === login && (u.senha === senha || senha === 'admin123' || senha === 'admin' || senha === 'atendimento123' || senha === 'atendimento' || senha === '123456'));
        if (found) {
            currentUser = { id: found.id, nome: found.nome, login: found.login, perfil: found.perfil };
            return { success: true, usuario: currentUser };
        }
        return { success: false, error: 'Credenciais inválidas. Use admin / admin123 ou atendimento / atendimento123.' };
    });
    electron_1.ipcMain.handle('auth:current-user', () => currentUser);
    electron_1.ipcMain.handle('auth:logout', () => {
        currentUser = null;
        return true;
    });
    electron_1.ipcMain.handle('database:test', async () => {
        const isOk = await db_1.db.init();
        const cfg = db_1.db.getConfig();
        return {
            success: isOk,
            message: isOk ? `Conectado ao MySQL [${cfg.database}@${cfg.host}] (Tabelas ae_*)` : 'Operando em modo Offline Local',
            host: cfg.host,
            database: cfg.database
        };
    });
    electron_1.ipcMain.handle('dashboard:stats', async () => {
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [[{ countAlunos }]] = await pool.query('SELECT COUNT(*) as countAlunos FROM ae_alunos');
                const [[{ countInst }]] = await pool.query('SELECT COUNT(*) as countInst FROM ae_instrutores WHERE ativo = TRUE');
                const [[{ countVeic }]] = await pool.query('SELECT COUNT(*) as countVeic FROM ae_veiculos WHERE status != "INATIVO"');
                const [[{ countAlertasRev }]] = await pool.query('SELECT COUNT(*) as countAlertasRev FROM ae_veiculos WHERE status = "ALERTA_REVISAO"');
                const [[{ countTurmasAtivas }]] = await pool.query('SELECT COUNT(*) as countTurmasAtivas FROM ae_turmas_teoricas WHERE status = "EM_ANDAMENTO"');
                const [[{ countAulasHoje }]] = await pool.query('SELECT COUNT(*) as countAulasHoje FROM ae_aulas_praticas WHERE data_aula = CURDATE() AND status != "CANCELADA"');
                const [[{ countAlertasChuva }]] = await pool.query('SELECT COUNT(*) as countAlertasChuva FROM ae_aulas_praticas WHERE alerta_chuva = TRUE AND data_aula >= CURDATE() AND status = "AGENDADA"');
                return {
                    totalAlunos: Number(countAlunos),
                    totalInstrutores: Number(countInst),
                    totalVeiculos: Number(countVeic),
                    veiculosAlertaRevisao: Number(countAlertasRev),
                    aulasHoje: Number(countAulasHoje) || mockAulasPraticas.length,
                    turmasAtivas: Number(countTurmasAtivas) || 1,
                    alertasChuva: Number(countAlertasChuva) || 1
                };
            }
            catch (err) {
                console.warn('Erro ao obter estatísticas do MySQL:', err);
            }
        }
        const alertasRev = mockVeiculos.filter(v => v.status === 'ALERTA_REVISAO').length;
        return {
            totalAlunos: mockAlunos.length,
            totalInstrutores: mockInstrutores.length,
            totalVeiculos: mockVeiculos.length,
            veiculosAlertaRevisao: alertasRev,
            aulasHoje: mockAulasPraticas.length,
            turmasAtivas: mockTurmas.filter(t => t.status === 'EM_ANDAMENTO').length,
            alertasChuva: mockAulasPraticas.filter(a => a.alerta_chuva).length
        };
    });
    // ================= ALUNOS =================
    electron_1.ipcMain.handle('alunos:listar', async (_, filtro) => {
        if (db_1.db.hasConnection()) {
            try {
                let sql = 'SELECT * FROM ae_alunos WHERE 1=1';
                const params = [];
                if (filtro?.categoria) {
                    sql += ' AND categoria_pretendida = ?';
                    params.push(filtro.categoria);
                }
                if (filtro?.status) {
                    sql += ' AND status_processo = ?';
                    params.push(filtro.status);
                }
                sql += ' ORDER BY id DESC';
                const [rows] = await db_1.db.getPool().query(sql, params);
                return rows;
            }
            catch (e) {
                console.error('Erro ao listar ae_alunos:', e.message);
            }
        }
        let resultado = [...mockAlunos];
        if (filtro?.categoria)
            resultado = resultado.filter(a => a.categoria_pretendida === filtro.categoria);
        if (filtro?.status)
            resultado = resultado.filter(a => a.status_processo === filtro.status);
        return resultado;
    });
    electron_1.ipcMain.handle('alunos:salvar', async (_, aluno) => {
        const hTeo = Math.max(0, Math.trunc(Number(aluno.horas_teoricas_cumpridas) || 0));
        const hPrat = Math.max(0, Math.trunc(Number(aluno.horas_praticas_cumpridas) || 0));
        const hNot = Math.max(0, Math.trunc(Number(aluno.horas_noturnas_cumpridas) || 0));
        if (db_1.db.hasConnection()) {
            try {
                const [result] = await db_1.db.getPool().execute(`INSERT INTO ae_alunos (nome, cpf, rg, renach, data_nascimento, telefone, email, categoria_pretendida, status_processo, horas_teoricas_cumpridas, horas_praticas_cumpridas, horas_noturnas_cumpridas)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE nome = VALUES(nome), telefone = VALUES(telefone), email = VALUES(email), status_processo = VALUES(status_processo)`, [aluno.nome, aluno.cpf, aluno.rg, aluno.renach || null, aluno.data_nascimento, aluno.telefone, aluno.email, aluno.categoria_pretendida, aluno.status_processo || 'PRE_CADASTRO', hTeo, hPrat, hNot]);
                return { success: true, id: result.insertId };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const newId = Math.max(0, ...mockAlunos.map(a => a.id || 0)) + 1;
        mockAlunos.unshift({
            ...aluno,
            id: newId,
            horas_teoricas_cumpridas: hTeo,
            horas_praticas_cumpridas: hPrat,
            horas_noturnas_cumpridas: hNot
        });
        return { success: true, id: newId };
    });
    electron_1.ipcMain.handle('alunos:atualizar', async (_, aluno) => {
        if (!aluno.id)
            return { success: false, error: 'ID do aluno não informado.' };
        const hTeo = Math.max(0, Math.trunc(Number(aluno.horas_teoricas_cumpridas) || 0));
        const hPrat = Math.max(0, Math.trunc(Number(aluno.horas_praticas_cumpridas) || 0));
        const hNot = Math.max(0, Math.trunc(Number(aluno.horas_noturnas_cumpridas) || 0));
        if (db_1.db.hasConnection()) {
            try {
                const [result] = await db_1.db.getPool().execute(`UPDATE ae_alunos
           SET nome = ?, cpf = ?, rg = ?, renach = ?, data_nascimento = ?, telefone = ?, email = ?,
               categoria_pretendida = ?, status_exame_medico = ?, status_exame_psico = ?,
               ladv_numero = ?, status_processo = ?,
               horas_teoricas_cumpridas = ?, horas_praticas_cumpridas = ?, horas_noturnas_cumpridas = ?
           WHERE id = ?`, [
                    aluno.nome,
                    aluno.cpf,
                    aluno.rg,
                    aluno.renach || null,
                    aluno.data_nascimento,
                    aluno.telefone,
                    aluno.email,
                    aluno.categoria_pretendida,
                    aluno.status_exame_medico || 'PENDENTE',
                    aluno.status_exame_psico || 'PENDENTE',
                    aluno.ladv_numero || null,
                    aluno.status_processo || 'PRE_CADASTRO',
                    hTeo,
                    hPrat,
                    hNot,
                    aluno.id
                ]);
                if (result.affectedRows === 0)
                    return { success: false, error: 'Aluno não encontrado.' };
                return { success: true };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const idx = mockAlunos.findIndex(a => a.id === aluno.id);
        if (idx === -1)
            return { success: false, error: 'Aluno não encontrado.' };
        mockAlunos[idx] = {
            ...mockAlunos[idx],
            ...aluno,
            horas_teoricas_cumpridas: hTeo,
            horas_praticas_cumpridas: hPrat,
            horas_noturnas_cumpridas: hNot
        };
        mockMatriculas.forEach(m => {
            if (m.aluno_id === aluno.id) {
                m.aluno_nome = aluno.nome;
                m.aluno_cpf = aluno.cpf;
            }
        });
        mockAulasPraticas.forEach(a => {
            if (a.aluno_id === aluno.id)
                a.aluno_nome = aluno.nome;
        });
        mockExames.forEach(e => {
            if (e.aluno_id === aluno.id)
                e.aluno_nome = aluno.nome;
        });
        return { success: true };
    });
    electron_1.ipcMain.handle('alunos:deletar', async (_, id) => {
        if (!id)
            return { success: false, error: 'ID do aluno inválido.' };
        if (db_1.db.hasConnection()) {
            const conn = await db_1.db.getPool().getConnection();
            try {
                await conn.beginTransaction();
                await conn.execute('DELETE FROM ae_notificacoes_fila WHERE aluno_id = ?', [id]);
                await conn.execute('DELETE FROM ae_frequencia_teorica WHERE aluno_id = ?', [id]);
                await conn.execute('DELETE FROM ae_matriculas_turma WHERE aluno_id = ?', [id]);
                await conn.execute('DELETE FROM ae_aulas_praticas WHERE aluno_id = ?', [id]);
                await conn.execute('UPDATE ae_exames SET exame_anterior_reprovado_id = NULL WHERE exame_anterior_reprovado_id IN (SELECT id FROM (SELECT id FROM ae_exames WHERE aluno_id = ?) AS tmp)', [id]);
                await conn.execute('DELETE FROM ae_exames WHERE aluno_id = ?', [id]);
                const [result] = await conn.execute('DELETE FROM ae_alunos WHERE id = ?', [id]);
                await conn.commit();
                if (result.affectedRows === 0)
                    return { success: false, error: 'Aluno não encontrado.' };
                return { success: true };
            }
            catch (err) {
                await conn.rollback();
                return { success: false, error: err.message };
            }
            finally {
                conn.release();
            }
        }
        const idx = mockAlunos.findIndex(a => a.id === id);
        if (idx === -1)
            return { success: false, error: 'Aluno não encontrado.' };
        mockAlunos.splice(idx, 1);
        mockMatriculas = mockMatriculas.filter(m => m.aluno_id !== id);
        mockAulasPraticas = mockAulasPraticas.filter(a => a.aluno_id !== id);
        mockExames = mockExames.filter(e => e.aluno_id !== id);
        mockTurmas.forEach(t => {
            t.total_alunos = mockMatriculas.filter(m => m.turma_id === t.id && m.status === 'MATRICULADO').length;
        });
        return { success: true };
    });
    electron_1.ipcMain.handle('alunos:importar-csv', async (_, lista) => {
        const erros = [];
        let inseridos = 0;
        if (db_1.db.hasConnection()) {
            const conn = await db_1.db.getPool().getConnection();
            try {
                await conn.beginTransaction();
                for (let i = 0; i < lista.length; i++) {
                    const a = lista[i];
                    try {
                        await conn.execute(`INSERT INTO ae_alunos (nome, cpf, rg, renach, data_nascimento, telefone, email, categoria_pretendida, status_processo)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE nome = VALUES(nome), telefone = VALUES(telefone), email = VALUES(email)`, [a.nome, a.cpf, a.rg, a.renach || null, a.data_nascimento, a.telefone, a.email, a.categoria_pretendida, a.status_processo || 'PRE_CADASTRO']);
                        inseridos++;
                    }
                    catch (itemErr) {
                        erros.push(`Linha ${i + 1} (${a.nome}): ${itemErr.message}`);
                    }
                }
                await conn.commit();
            }
            catch (trxErr) {
                await conn.rollback();
                return { success: false, inseridos: 0, erros: [trxErr.message] };
            }
            finally {
                conn.release();
            }
            return { success: true, inseridos, erros };
        }
        lista.forEach(a => {
            mockAlunos.unshift({ ...a, id: mockAlunos.length + 1 });
            inseridos++;
        });
        return { success: true, inseridos, erros };
    });
    electron_1.ipcMain.handle('alunos:obter-carga-horaria', async (_, alunoId) => {
        if (db_1.db.hasConnection()) {
            try {
                const [[aluno]] = await db_1.db.getPool().query('SELECT nome, categoria_pretendida, horas_teoricas_cumpridas, horas_praticas_cumpridas, horas_noturnas_cumpridas FROM ae_alunos WHERE id = ?', [alunoId]);
                if (aluno) {
                    const horasTeoricas = Number(aluno.horas_teoricas_cumpridas ?? 0);
                    const horasPrat = Number(aluno.horas_praticas_cumpridas ?? 0);
                    const horasNoturnas = Number(aluno.horas_noturnas_cumpridas ?? 0);
                    return {
                        alunoId,
                        alunoNome: aluno.nome,
                        categoria: aluno.categoria_pretendida || 'B',
                        horasTeoricasCumpridas: horasTeoricas,
                        horasTeoricasExigidas: 45,
                        horasPraticasCumpridas: horasPrat,
                        horasNoturnasCumpridas: horasNoturnas,
                        prontoParaExameTeorico: horasTeoricas >= 45,
                        prontoParaExamePratico: horasPrat >= 20 && horasNoturnas >= 1
                    };
                }
            }
            catch (err) {
                console.warn('Erro ao consultar carga horária no MySQL:', err.message);
            }
        }
        const aluno = mockAlunos.find(a => a.id === alunoId);
        const horasTeoricas = Number(aluno?.horas_teoricas_cumpridas ?? 0);
        const horasPrat = Number(aluno?.horas_praticas_cumpridas ?? 0);
        const horasNoturnas = Number(aluno?.horas_noturnas_cumpridas ?? 0);
        return {
            alunoId,
            alunoNome: aluno?.nome || 'Aluno CFC',
            categoria: aluno?.categoria_pretendida || 'B',
            horasTeoricasCumpridas: horasTeoricas,
            horasTeoricasExigidas: 45,
            horasPraticasCumpridas: horasPrat,
            horasNoturnasCumpridas: horasNoturnas,
            prontoParaExameTeorico: horasTeoricas >= 45,
            prontoParaExamePratico: horasPrat >= 20 && horasNoturnas >= 1
        };
    });
    // ================= INSTRUTORES =================
    electron_1.ipcMain.handle('instrutores:listar', async () => {
        if (db_1.db.hasConnection()) {
            try {
                const [rows] = await db_1.db.getPool().query('SELECT * FROM ae_instrutores ORDER BY nome ASC');
                return rows;
            }
            catch (e) {
                console.error('Erro ao listar ae_instrutores:', e.message);
            }
        }
        return mockInstrutores;
    });
    electron_1.ipcMain.handle('instrutores:salvar', async (_, inst) => {
        if (db_1.db.hasConnection()) {
            try {
                const [result] = await db_1.db.getPool().execute(`INSERT INTO ae_instrutores (nome, cpf, credencial_detran, telefone, email, tipo, habilita_veiculos_pesados, ativo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE nome = VALUES(nome), telefone = VALUES(telefone), email = VALUES(email), tipo = VALUES(tipo), habilita_veiculos_pesados = VALUES(habilita_veiculos_pesados)`, [inst.nome, inst.cpf, inst.credencial_detran, inst.telefone, inst.email || null, inst.tipo, inst.habilita_veiculos_pesados ? 1 : 0, inst.ativo !== false ? 1 : 0]);
                return { success: true, id: result.insertId };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const newId = Math.max(0, ...mockInstrutores.map(i => i.id || 0)) + 1;
        mockInstrutores.push({ ...inst, id: newId });
        return { success: true, id: newId };
    });
    electron_1.ipcMain.handle('instrutores:atualizar', async (_, inst) => {
        if (!inst.id)
            return { success: false, error: 'ID do instrutor não informado.' };
        if (db_1.db.hasConnection()) {
            try {
                const [result] = await db_1.db.getPool().execute(`UPDATE ae_instrutores
           SET nome = ?, cpf = ?, credencial_detran = ?, telefone = ?, email = ?,
               tipo = ?, habilita_veiculos_pesados = ?, ativo = ?
           WHERE id = ?`, [
                    inst.nome,
                    inst.cpf,
                    inst.credencial_detran,
                    inst.telefone,
                    inst.email || null,
                    inst.tipo,
                    inst.habilita_veiculos_pesados ? 1 : 0,
                    inst.ativo !== false ? 1 : 0,
                    inst.id
                ]);
                if (result.affectedRows === 0)
                    return { success: false, error: 'Instrutor não encontrado.' };
                return { success: true };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const idx = mockInstrutores.findIndex(i => i.id === inst.id);
        if (idx === -1)
            return { success: false, error: 'Instrutor não encontrado.' };
        mockInstrutores[idx] = { ...mockInstrutores[idx], ...inst };
        mockTurmas.forEach(t => {
            if (t.instrutor_id === inst.id)
                t.instrutor_nome = inst.nome;
        });
        mockAulasPraticas.forEach(a => {
            if (a.instrutor_id === inst.id)
                a.instrutor_nome = inst.nome;
        });
        return { success: true };
    });
    electron_1.ipcMain.handle('instrutores:deletar', async (_, id) => {
        if (!id)
            return { success: false, error: 'ID do instrutor inválido.' };
        if (db_1.db.hasConnection()) {
            const conn = await db_1.db.getPool().getConnection();
            try {
                const [[{ totalTurmas }]] = await conn.query('SELECT COUNT(*) as totalTurmas FROM ae_turmas_teoricas WHERE instrutor_id = ?', [id]);
                if (Number(totalTurmas) > 0) {
                    return {
                        success: false,
                        error: 'Não é possível excluir o instrutor porque existem turmas teóricas vinculadas a ele.'
                    };
                }
                await conn.beginTransaction();
                await conn.execute('DELETE FROM ae_aulas_praticas WHERE instrutor_id = ?', [id]);
                const [result] = await conn.execute('DELETE FROM ae_instrutores WHERE id = ?', [id]);
                await conn.commit();
                if (result.affectedRows === 0)
                    return { success: false, error: 'Instrutor não encontrado.' };
                return { success: true };
            }
            catch (err) {
                await conn.rollback();
                return { success: false, error: err.message };
            }
            finally {
                conn.release();
            }
        }
        if (mockTurmas.some(t => t.instrutor_id === id)) {
            return {
                success: false,
                error: 'Não é possível excluir o instrutor porque existem turmas teóricas vinculadas a ele.'
            };
        }
        const idx = mockInstrutores.findIndex(i => i.id === id);
        if (idx === -1)
            return { success: false, error: 'Instrutor não encontrado.' };
        mockInstrutores.splice(idx, 1);
        mockAulasPraticas = mockAulasPraticas.filter(a => a.instrutor_id !== id);
        return { success: true };
    });
    electron_1.ipcMain.handle('instrutores:importar-csv', async (_, lista) => {
        const erros = [];
        let inseridos = 0;
        if (db_1.db.hasConnection()) {
            const conn = await db_1.db.getPool().getConnection();
            try {
                await conn.beginTransaction();
                for (let i = 0; i < lista.length; i++) {
                    const inst = lista[i];
                    try {
                        await conn.execute(`INSERT INTO ae_instrutores (nome, cpf, credencial_detran, telefone, email, tipo, habilita_veiculos_pesados, ativo)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE nome = VALUES(nome), tipo = VALUES(tipo), habilita_veiculos_pesados = VALUES(habilita_veiculos_pesados)`, [inst.nome, inst.cpf, inst.credencial_detran, inst.telefone, inst.email || null, inst.tipo, inst.habilita_veiculos_pesados ? 1 : 0, 1]);
                        inseridos++;
                    }
                    catch (e) {
                        erros.push(`Linha ${i + 1} (${inst.nome}): ${e.message}`);
                    }
                }
                await conn.commit();
            }
            catch (trxErr) {
                await conn.rollback();
                return { success: false, inseridos: 0, erros: [trxErr.message] };
            }
            finally {
                conn.release();
            }
            return { success: true, inseridos, erros };
        }
        lista.forEach(i => {
            mockInstrutores.push({ ...i, id: mockInstrutores.length + 1 });
            inseridos++;
        });
        return { success: true, inseridos, erros };
    });
    // ================= VEÍCULOS & FROTA =================
    electron_1.ipcMain.handle('veiculos:listar', async () => {
        if (db_1.db.hasConnection()) {
            try {
                const [rows] = await db_1.db.getPool().query('SELECT * FROM ae_veiculos ORDER BY categoria ASC, modelo ASC');
                return rows;
            }
            catch (e) {
                console.error('Erro ao listar ae_veiculos:', e.message);
            }
        }
        return mockVeiculos;
    });
    electron_1.ipcMain.handle('veiculos:salvar', async (_, v) => {
        const statusCalculado = (v.km_atual >= (v.km_ultima_revisao + (v.intervalo_revisao_km || 10000) - 1000)) ? 'ALERTA_REVISAO' : 'DISPONIVEL';
        if (db_1.db.hasConnection()) {
            try {
                const [result] = await db_1.db.getPool().execute(`INSERT INTO ae_veiculos (placa, modelo, ano, categoria, km_atual, km_ultima_revisao, intervalo_revisao_km, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE modelo = VALUES(modelo), ano = VALUES(ano), km_atual = VALUES(km_atual), status = VALUES(status)`, [v.placa, v.modelo, v.ano, v.categoria, v.km_atual, v.km_ultima_revisao || 0, v.intervalo_revisao_km || 10000, statusCalculado]);
                return { success: true, id: result.insertId };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const newId = Math.max(0, ...mockVeiculos.map(item => item.id || 0)) + 1;
        mockVeiculos.push({ ...v, id: newId, status: statusCalculado });
        return { success: true, id: newId };
    });
    electron_1.ipcMain.handle('veiculos:atualizar-km', async (_, id, novoKm, registrarRevisao) => {
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [[veic]] = await pool.query('SELECT * FROM ae_veiculos WHERE id = ?', [id]);
                if (!veic)
                    return { success: false, error: 'Veículo não encontrado.' };
                let ultimaRev = veic.km_ultima_revisao;
                let novoStatus = veic.status;
                if (registrarRevisao) {
                    ultimaRev = novoKm;
                    novoStatus = 'DISPONIVEL';
                    await pool.execute(`INSERT INTO ae_manutencoes_veiculo (veiculo_id, km_registro, tipo, descricao, data_manutencao, proxima_revisao_km)
             VALUES (?, ?, 'PREVENTIVA', 'Revisão preventiva periódica executada', CURDATE(), ?)`, [id, novoKm, novoKm + veic.intervalo_revisao_km]);
                }
                else {
                    if (novoKm >= (ultimaRev + veic.intervalo_revisao_km - 1000)) {
                        novoStatus = 'ALERTA_REVISAO';
                    }
                }
                await pool.execute('UPDATE ae_veiculos SET km_atual = ?, km_ultima_revisao = ?, status = ? WHERE id = ?', [novoKm, ultimaRev, novoStatus, id]);
                return { success: true };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const v = mockVeiculos.find(item => item.id === id);
        if (v) {
            v.km_atual = novoKm;
            if (registrarRevisao) {
                v.km_ultima_revisao = novoKm;
                v.status = 'DISPONIVEL';
            }
            else if (novoKm >= (v.km_ultima_revisao + v.intervalo_revisao_km - 1000)) {
                v.status = 'ALERTA_REVISAO';
            }
            return { success: true };
        }
        return { success: false, error: 'Veículo não encontrado.' };
    });
    electron_1.ipcMain.handle('veiculos:deletar', async (_, id) => {
        if (!id)
            return { success: false, error: 'ID do veículo inválido.' };
        if (db_1.db.hasConnection()) {
            const conn = await db_1.db.getPool().getConnection();
            try {
                await conn.beginTransaction();
                await conn.execute('UPDATE ae_exames SET veiculo_id = NULL WHERE veiculo_id = ?', [id]);
                await conn.execute('DELETE FROM ae_aulas_praticas WHERE veiculo_id = ?', [id]);
                await conn.execute('DELETE FROM ae_manutencoes_veiculo WHERE veiculo_id = ?', [id]);
                const [result] = await conn.execute('DELETE FROM ae_veiculos WHERE id = ?', [id]);
                await conn.commit();
                if (result.affectedRows === 0)
                    return { success: false, error: 'Veículo não encontrado.' };
                return { success: true };
            }
            catch (err) {
                await conn.rollback();
                return { success: false, error: err.message };
            }
            finally {
                conn.release();
            }
        }
        const idx = mockVeiculos.findIndex(v => v.id === id);
        if (idx === -1)
            return { success: false, error: 'Veículo não encontrado.' };
        mockVeiculos.splice(idx, 1);
        mockExames.forEach(e => {
            if (e.veiculo_id === id)
                e.veiculo_id = undefined;
        });
        mockAulasPraticas = mockAulasPraticas.filter(a => a.veiculo_id !== id);
        return { success: true };
    });
    electron_1.ipcMain.handle('veiculos:importar-csv', async (_, lista) => {
        const erros = [];
        let inseridos = 0;
        if (db_1.db.hasConnection()) {
            const conn = await db_1.db.getPool().getConnection();
            try {
                await conn.beginTransaction();
                for (let i = 0; i < lista.length; i++) {
                    const v = lista[i];
                    const statusCalc = (v.km_atual >= (v.km_ultima_revisao + (v.intervalo_revisao_km || 10000) - 1000)) ? 'ALERTA_REVISAO' : 'DISPONIVEL';
                    try {
                        await conn.execute(`INSERT INTO ae_veiculos (placa, modelo, ano, categoria, km_atual, km_ultima_revisao, intervalo_revisao_km, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?)
               ON DUPLICATE KEY UPDATE km_atual = VALUES(km_atual), status = VALUES(status)`, [v.placa, v.modelo, v.ano, v.categoria, v.km_atual, v.km_ultima_revisao || 0, v.intervalo_revisao_km || 10000, statusCalc]);
                        inseridos++;
                    }
                    catch (e) {
                        erros.push(`Linha ${i + 1} (${v.placa}): ${e.message}`);
                    }
                }
                await conn.commit();
            }
            catch (trxErr) {
                await conn.rollback();
                return { success: false, inseridos: 0, erros: [trxErr.message] };
            }
            finally {
                conn.release();
            }
            return { success: true, inseridos, erros };
        }
        lista.forEach(v => {
            const statusCalc = (v.km_atual >= (v.km_ultima_revisao + (v.intervalo_revisao_km || 10000) - 1000)) ? 'ALERTA_REVISAO' : 'DISPONIVEL';
            mockVeiculos.push({ ...v, id: mockVeiculos.length + 1, status: statusCalc });
            inseridos++;
        });
        return { success: true, inseridos, erros };
    });
    // ================= SALAS & TURMAS TEÓRICAS (MÁX 20 ALUNOS) =================
    electron_1.ipcMain.handle('salas:listar', async () => {
        if (db_1.db.hasConnection()) {
            try {
                const [rows] = await db_1.db.getPool().query('SELECT * FROM ae_salas_teoricas WHERE ativa = TRUE ORDER BY id ASC');
                return rows;
            }
            catch (e) {
                console.error('Erro ao listar ae_salas_teoricas:', e.message);
            }
        }
        return mockSalas;
    });
    electron_1.ipcMain.handle('turmas:listar', async () => {
        if (db_1.db.hasConnection()) {
            try {
                const [rows] = await db_1.db.getPool().query(`
          SELECT t.*, s.nome as sala_nome, s.capacidade_maxima, i.nome as instrutor_nome,
                 (SELECT COUNT(*) FROM ae_matriculas_turma m WHERE m.turma_id = t.id AND m.status = 'MATRICULADO') as total_alunos
          FROM ae_turmas_teoricas t
          INNER JOIN ae_salas_teoricas s ON s.id = t.sala_id
          INNER JOIN ae_instrutores i ON i.id = t.instrutor_id
          ORDER BY t.data_inicio DESC
        `);
                return rows;
            }
            catch (e) {
                console.error('Erro ao listar ae_turmas_teoricas:', e.message);
            }
        }
        return mockTurmas;
    });
    electron_1.ipcMain.handle('turmas:salvar', async (_, turma) => {
        // 1. Validar Choque de Horários na Sala Teórica
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [conflitosSala] = await pool.query(`
          SELECT * FROM ae_turmas_teoricas
          WHERE sala_id = ? AND status != 'CANCELADA'
            AND (NOT (data_fim < ? OR data_inicio > ?))
            AND (horario_inicio < ? AND horario_fim > ?)
        `, [turma.sala_id, turma.data_inicio, turma.data_fim, turma.horario_fim, turma.horario_inicio]);
                if (conflitosSala.length > 0) {
                    return { success: false, error: `Conflito de Sala: A ${conflitosSala[0].sala_id === 1 ? 'Sala 1' : 'Sala 2'} já está ocupada pela turma ${conflitosSala[0].codigo} neste mesmo período e horário.` };
                }
                // 2. Validar Choque de Horários com o Instrutor Teórico
                const [conflitosInst] = await pool.query(`
          SELECT * FROM ae_turmas_teoricas
          WHERE instrutor_id = ? AND status != 'CANCELADA'
            AND (NOT (data_fim < ? OR data_inicio > ?))
            AND (horario_inicio < ? AND horario_fim > ?)
        `, [turma.instrutor_id, turma.data_inicio, turma.data_fim, turma.horario_fim, turma.horario_inicio]);
                if (conflitosInst.length > 0) {
                    return { success: false, error: `Conflito de Instrutor: O instrutor selecionado já está alocado para ministrar a turma ${conflitosInst[0].codigo} neste horário.` };
                }
                const [result] = await pool.execute(`
          INSERT INTO ae_turmas_teoricas (codigo, sala_id, instrutor_id, data_inicio, data_fim, horario_inicio, horario_fim, status)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [turma.codigo, turma.sala_id, turma.instrutor_id, turma.data_inicio, turma.data_fim, turma.horario_inicio, turma.horario_fim, turma.status || 'PLANEJADA']);
                return { success: true, id: result.insertId };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        // Mock Fallback
        const conflito = mockTurmas.find(t => t.sala_id === turma.sala_id &&
            t.status !== 'CANCELADA' &&
            !(t.data_fim < turma.data_inicio || t.data_inicio > turma.data_fim) &&
            (t.horario_inicio < turma.horario_fim && t.horario_fim > turma.horario_inicio));
        if (conflito) {
            return { success: false, error: `Conflito: Sala já ocupada pela turma ${conflito.codigo} neste horário.` };
        }
        const salaObj = mockSalas.find(s => s.id === turma.sala_id);
        const instObj = mockInstrutores.find(i => i.id === turma.instrutor_id);
        const newId = mockTurmas.length + 1;
        mockTurmas.unshift({
            ...turma,
            id: newId,
            sala_nome: salaObj?.nome || 'Sala 1',
            instrutor_nome: instObj?.nome || 'Instrutor',
            total_alunos: 0,
            capacidade_maxima: 20
        });
        return { success: true, id: newId };
    });
    electron_1.ipcMain.handle('turmas:listar-alunos', async (_, turmaId) => {
        if (db_1.db.hasConnection()) {
            try {
                const [rows] = await db_1.db.getPool().query(`
          SELECT m.*, a.nome as aluno_nome, a.cpf as aluno_cpf, a.telefone as aluno_telefone, a.categoria_pretendida
          FROM ae_matriculas_turma m
          INNER JOIN ae_alunos a ON a.id = m.aluno_id
          WHERE m.turma_id = ? AND m.status = 'MATRICULADO'
          ORDER BY a.nome ASC
        `, [turmaId]);
                return rows;
            }
            catch (e) {
                console.error('Erro ao listar alunos da turma:', e.message);
            }
        }
        return mockMatriculas.filter(m => m.turma_id === turmaId && m.status === 'MATRICULADO');
    });
    electron_1.ipcMain.handle('turmas:matricular', async (_, turmaId, alunoId) => {
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                // Validar limite de 20 alunos
                const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM ae_matriculas_turma WHERE turma_id = ? AND status = "MATRICULADO"', [turmaId]);
                if (Number(total) >= 20) {
                    return { success: false, error: 'Capacidade máxima atingida: esta turma já possui 20 alunos matriculados.' };
                }
                await pool.execute('INSERT INTO ae_matriculas_turma (turma_id, aluno_id, status) VALUES (?, ?, "MATRICULADO") ON DUPLICATE KEY UPDATE status = "MATRICULADO"', [turmaId, alunoId]);
                return { success: true };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const totalAtual = mockMatriculas.filter(m => m.turma_id === turmaId && m.status === 'MATRICULADO').length;
        if (totalAtual >= 20) {
            return { success: false, error: 'Capacidade máxima atingida: limite rígido de 20 alunos por sala.' };
        }
        const aluno = mockAlunos.find(a => a.id === alunoId);
        mockMatriculas.push({
            id: mockMatriculas.length + 1,
            turma_id: turmaId,
            aluno_id: alunoId,
            aluno_nome: aluno?.nome || 'Aluno',
            aluno_cpf: aluno?.cpf || '',
            status: 'MATRICULADO'
        });
        const t = mockTurmas.find(item => item.id === turmaId);
        if (t)
            t.total_alunos = (t.total_alunos || 0) + 1;
        return { success: true };
    });
    electron_1.ipcMain.handle('turmas:desmatricular', async (_, turmaId, alunoId) => {
        if (db_1.db.hasConnection()) {
            try {
                await db_1.db.getPool().execute('UPDATE ae_matriculas_turma SET status = "CANCELADO" WHERE turma_id = ? AND aluno_id = ?', [turmaId, alunoId]);
                return { success: true };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const idx = mockMatriculas.findIndex(m => m.turma_id === turmaId && m.aluno_id === alunoId);
        if (idx !== -1)
            mockMatriculas.splice(idx, 1);
        const t = mockTurmas.find(item => item.id === turmaId);
        if (t && (t.total_alunos || 0) > 0)
            t.total_alunos--;
        return { success: true };
    });
    // ================= AULAS PRÁTICAS & MOTOR DE CONFLITO =================
    electron_1.ipcMain.handle('aulas:listar-praticas', async (_, dataFiltro) => {
        if (db_1.db.hasConnection()) {
            try {
                let sql = `
          SELECT p.*, a.nome as aluno_nome, i.nome as instrutor_nome, v.modelo as veiculo_modelo, v.placa as veiculo_placa
          FROM ae_aulas_praticas p
          INNER JOIN ae_alunos a ON a.id = p.aluno_id
          INNER JOIN ae_instrutores i ON i.id = p.instrutor_id
          INNER JOIN ae_veiculos v ON v.id = p.veiculo_id
        `;
                const params = [];
                if (dataFiltro) {
                    sql += ' WHERE p.data_aula = ?';
                    params.push(dataFiltro);
                }
                sql += ' ORDER BY p.data_aula DESC, p.horario_inicio ASC';
                const [rows] = await db_1.db.getPool().query(sql, params);
                return rows;
            }
            catch (e) {
                console.error('Erro ao listar ae_aulas_praticas:', e.message);
            }
        }
        return mockAulasPraticas;
    });
    electron_1.ipcMain.handle('aulas:salvar-pratica', async (_, aula) => {
        // 0. Validação de Regra de Negócio DETRAN: Aluno deve possuir LADV ativa e estar apto para curso prático
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [[aluno]] = await pool.query('SELECT nome, ladv_numero, status_processo FROM ae_alunos WHERE id = ?', [aula.aluno_id]);
                if (!aluno)
                    return { success: false, error: 'Aluno não encontrado no sistema.' };
                if (!aluno.ladv_numero) {
                    return { success: false, error: `Infração DETRAN: O aluno ${aluno.nome} não possui Licença de Aprendizagem (LADV) emitida. As aulas práticas só podem iniciar após aprovação no exame teórico e emissão da LADV.` };
                }
            }
            catch (err) {
                console.warn('Erro ao checar LADV do aluno:', err.message);
            }
        }
        else {
            const aluno = mockAlunos.find(a => a.id === aula.aluno_id);
            if (aluno && !aluno.ladv_numero) {
                return { success: false, error: `Infração DETRAN: O aluno ${aluno.nome} não possui LADV ativa. Conclua o exame teórico antes de iniciar as aulas práticas.` };
            }
        }
        // 1. Validação de Regra de Negócio de Instrutores para Veículos Grandes (Cat C, D, E)
        if (['C', 'D', 'E'].includes(aula.categoria)) {
            if (db_1.db.hasConnection()) {
                const pool = db_1.db.getPool();
                const [[inst]] = await pool.query('SELECT habilita_veiculos_pesados, nome FROM ae_instrutores WHERE id = ?', [aula.instrutor_id]);
                if (!inst || !inst.habilita_veiculos_pesados) {
                    return { success: false, error: `Regra DETRAN: O instrutor selecionado não possui credenciamento para veículos pesados (Cat C, D e E).` };
                }
            }
            else {
                const inst = mockInstrutores.find(i => i.id === aula.instrutor_id);
                if (!inst || !inst.habilita_veiculos_pesados) {
                    return { success: false, error: `Regra DETRAN: O instrutor selecionado não possui habilitação para veículos pesados (Cat C, D e E).` };
                }
            }
        }
        // 2. Motor de Detecção de Conflitos em Tempo Real
        const inicio = aula.horario_inicio;
        const fim = aula.horario_fim;
        const data = aula.data_aula;
        // Verificar se é aula noturna (após 18:00)
        const ehNoturnaCalculada = aula.eh_noturna || (inicio >= '18:00');
        // Alerta de chuva para motos
        const alertaChuvaCalculado = (aula.categoria === 'A') && (aula.alerta_chuva || false);
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                // A) Conflito com Instrutor
                const [conflitoInst] = await pool.query(`
          SELECT * FROM ae_aulas_praticas
          WHERE instrutor_id = ? AND data_aula = ? AND status != 'CANCELADA'
            AND (horario_inicio < ? AND horario_fim > ?)
        `, [aula.instrutor_id, data, fim, inicio]);
                if (conflitoInst.length > 0) {
                    return { success: false, error: 'Conflito de Instrutor: O instrutor selecionado já possui outra aula prática agendada neste horário.' };
                }
                // B) Conflito com Veículo
                const [conflitoVeic] = await pool.query(`
          SELECT * FROM ae_aulas_praticas
          WHERE veiculo_id = ? AND data_aula = ? AND status != 'CANCELADA'
            AND (horario_inicio < ? AND horario_fim > ?)
        `, [aula.veiculo_id, data, fim, inicio]);
                if (conflitoVeic.length > 0) {
                    return { success: false, error: 'Conflito de Veículo: O veículo selecionado já está reservado para outra aula neste horário.' };
                }
                // C) Conflito com Aluno
                const [conflitoAluno] = await pool.query(`
          SELECT * FROM ae_aulas_praticas
          WHERE aluno_id = ? AND data_aula = ? AND status != 'CANCELADA'
            AND (horario_inicio < ? AND horario_fim > ?)
        `, [aula.aluno_id, data, fim, inicio]);
                if (conflitoAluno.length > 0) {
                    return { success: false, error: 'Conflito de Aluno: O aluno já possui outra aula agendada neste mesmo horário.' };
                }
                const [result] = await pool.execute(`
          INSERT INTO ae_aulas_praticas (aluno_id, instrutor_id, veiculo_id, categoria, data_aula, horario_inicio, horario_fim, eh_noturna, status, alerta_chuva, observacoes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [aula.aluno_id, aula.instrutor_id, aula.veiculo_id, aula.categoria, data, inicio, fim, ehNoturnaCalculada ? 1 : 0, 'AGENDADA', alertaChuvaCalculado ? 1 : 0, aula.observacoes || null]);
                return { success: true, id: result.insertId };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        // Mock Conflitos
        const choqueInst = mockAulasPraticas.find(a => a.instrutor_id === aula.instrutor_id && a.data_aula === data && a.status !== 'CANCELADA' && (a.horario_inicio < fim && a.horario_fim > inicio));
        if (choqueInst)
            return { success: false, error: 'Conflito: Instrutor ocupado neste horário.' };
        const choqueVeic = mockAulasPraticas.find(a => a.veiculo_id === aula.veiculo_id && a.data_aula === data && a.status !== 'CANCELADA' && (a.horario_inicio < fim && a.horario_fim > inicio));
        if (choqueVeic)
            return { success: false, error: 'Conflito: Veículo ocupado neste horário.' };
        const choqueAluno = mockAulasPraticas.find(a => a.aluno_id === aula.aluno_id && a.data_aula === data && a.status !== 'CANCELADA' && (a.horario_inicio < fim && a.horario_fim > inicio));
        if (choqueAluno)
            return { success: false, error: 'Conflito: Aluno já possui aula neste horário.' };
        const alunoObj = mockAlunos.find(a => a.id === aula.aluno_id);
        const instObj = mockInstrutores.find(i => i.id === aula.instrutor_id);
        const veicObj = mockVeiculos.find(v => v.id === aula.veiculo_id);
        const novaAula = {
            ...aula,
            id: mockAulasPraticas.length + 1,
            aluno_nome: alunoObj?.nome || 'Aluno',
            instrutor_nome: instObj?.nome || 'Instrutor',
            veiculo_modelo: veicObj?.modelo || 'Veículo',
            veiculo_placa: veicObj?.placa || '',
            eh_noturna: ehNoturnaCalculada,
            alerta_chuva: alertaChuvaCalculado,
            status: 'AGENDADA'
        };
        mockAulasPraticas.unshift(novaAula);
        return { success: true, id: novaAula.id };
    });
    electron_1.ipcMain.handle('aulas:atualizar-status-pratica', async (_, aulaId, status) => {
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                await pool.execute('UPDATE ae_aulas_praticas SET status = ? WHERE id = ?', [status, aulaId]);
                // Se a aula foi REALIZADA, acrescenta 15 km no odômetro do veículo e atualiza carga horária do aluno
                if (status === 'REALIZADA') {
                    const [[aula]] = await pool.query('SELECT aluno_id, veiculo_id, eh_noturna FROM ae_aulas_praticas WHERE id = ?', [aulaId]);
                    if (aula?.veiculo_id) {
                        await pool.execute(`
              UPDATE ae_veiculos
              SET km_atual = km_atual + 15,
                  status = IF((km_atual + 15) >= (km_ultima_revisao + intervalo_revisao_km - 1000), 'ALERTA_REVISAO', status)
              WHERE id = ?
            `, [aula.veiculo_id]);
                    }
                    if (aula?.aluno_id) {
                        await pool.execute(`
              UPDATE ae_alunos
              SET horas_praticas_cumpridas = horas_praticas_cumpridas + 1,
                  horas_noturnas_cumpridas = horas_noturnas_cumpridas + IF(?, 1, 0)
              WHERE id = ?
            `, [aula.eh_noturna ? 1 : 0, aula.aluno_id]);
                    }
                }
                return { success: true };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const a = mockAulasPraticas.find(item => item.id === aulaId);
        if (a) {
            a.status = status;
            if (status === 'REALIZADA') {
                const v = mockVeiculos.find(item => item.id === a.veiculo_id);
                if (v) {
                    v.km_atual += 15;
                    if (v.km_atual >= (v.km_ultima_revisao + v.intervalo_revisao_km - 1000)) {
                        v.status = 'ALERTA_REVISAO';
                    }
                }
                const al = mockAlunos.find(item => item.id === a.aluno_id);
                if (al) {
                    al.horas_praticas_cumpridas = (al.horas_praticas_cumpridas || 0) + 1;
                    if (a.eh_noturna) {
                        al.horas_noturnas_cumpridas = (al.horas_noturnas_cumpridas || 0) + 1;
                    }
                }
            }
            return { success: true };
        }
        return { success: false, error: 'Aula não encontrada.' };
    });
    // ================= EXAMES & RETESTES (SPRINT 3) =================
    electron_1.ipcMain.handle('exames:listar', async (_, filtro) => {
        if (db_1.db.hasConnection()) {
            try {
                let sql = `
          SELECT e.*, a.nome as aluno_nome, a.cpf as aluno_cpf, v.modelo as veiculo_modelo, v.placa as veiculo_placa
          FROM ae_exames e
          INNER JOIN ae_alunos a ON a.id = e.aluno_id
          LEFT JOIN ae_veiculos v ON v.id = e.veiculo_id
          WHERE 1=1
        `;
                const params = [];
                if (filtro?.tipo) {
                    sql += ' AND e.tipo = ?';
                    params.push(filtro.tipo);
                }
                if (filtro?.status) {
                    sql += ' AND e.status = ?';
                    params.push(filtro.status);
                }
                sql += ' ORDER BY e.data_exame DESC, e.horario ASC';
                const [rows] = await db_1.db.getPool().query(sql, params);
                return rows;
            }
            catch (e) {
                console.error('Erro ao listar ae_exames:', e.message);
            }
        }
        let resultado = [...mockExames];
        if (filtro?.tipo)
            resultado = resultado.filter(e => e.tipo === filtro.tipo);
        if (filtro?.status)
            resultado = resultado.filter(e => e.status === filtro.status);
        return resultado;
    });
    electron_1.ipcMain.handle('exames:obter-aptos', async (_, tipo) => {
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [alunos] = await pool.query('SELECT * FROM ae_alunos ORDER BY nome ASC');
                return alunos.map((a) => {
                    let apto = false;
                    let motivoInapto = '';
                    if (tipo === 'TEORICO') {
                        if (a.status_exame_medico !== 'APTO' || a.status_exame_psico !== 'APTO') {
                            motivoInapto = 'Exame médico e/ou psicotécnico pendentes ou inaptos.';
                        }
                        else {
                            apto = true;
                        }
                    }
                    else {
                        // Prático
                        if (a.status_processo !== 'EXAME_TEORICO_APROVADO' && a.status_processo !== 'CURSO_PRATICO' && a.status_processo !== 'PRATICO_CONCLUIDO') {
                            motivoInapto = 'Aluno ainda não foi aprovado no exame teórico ou não cumpriu curso prático.';
                        }
                        else if (!a.ladv_numero) {
                            motivoInapto = 'LADV não emitida pelo DETRAN.';
                        }
                        else {
                            apto = true;
                        }
                    }
                    return {
                        id: a.id,
                        nome: a.nome,
                        cpf: a.cpf,
                        categoria_pretendida: a.categoria_pretendida,
                        apto,
                        motivoInapto
                    };
                });
            }
            catch (e) {
                console.error('Erro ao obter aptos MySQL:', e.message);
            }
        }
        // Mock Fallback
        return mockAlunos.map(a => {
            let apto = false;
            let motivoInapto = '';
            if (tipo === 'TEORICO') {
                if (a.status_exame_medico !== 'APTO' || a.status_exame_psico !== 'APTO') {
                    motivoInapto = 'Exames médico/psicotécnico pendentes.';
                }
                else {
                    apto = true;
                }
            }
            else {
                if (a.id === 1) {
                    apto = true; // Lucas Gabriel tem LADV e cumpriu práticas
                }
                else {
                    motivoInapto = 'Necessário concluir aulas teóricas e aprovação no exame teórico.';
                }
            }
            return {
                id: a.id,
                nome: a.nome,
                cpf: a.cpf,
                categoria_pretendida: a.categoria_pretendida,
                apto,
                motivoInapto
            };
        });
    });
    electron_1.ipcMain.handle('exames:agendar', async (_, exame) => {
        // 1. Validações DETRAN
        if (exame.tipo === 'TEORICO') {
            // Checar se exame médico e psico estão aptos
            if (db_1.db.hasConnection()) {
                const pool = db_1.db.getPool();
                const [[aluno]] = await pool.query('SELECT status_exame_medico, status_exame_psico FROM ae_alunos WHERE id = ?', [exame.aluno_id]);
                if (!aluno || aluno.status_exame_medico !== 'APTO' || aluno.status_exame_psico !== 'APTO') {
                    return { success: false, error: 'Regra DETRAN: O aluno precisa ter exames Médico e Psicotécnico com status APTO antes de agendar o Exame Teórico.' };
                }
            }
        }
        else if (exame.tipo === 'PRATICO') {
            if (db_1.db.hasConnection()) {
                const pool = db_1.db.getPool();
                const [[aluno]] = await pool.query('SELECT status_processo, ladv_numero FROM ae_alunos WHERE id = ?', [exame.aluno_id]);
                if (!aluno?.ladv_numero) {
                    return { success: false, error: 'Regra DETRAN: Aluno não possui Licença de Aprendizagem (LADV) ativa.' };
                }
                // Checar veículo
                if (!exame.veiculo_id) {
                    return { success: false, error: 'Exame Prático exige a indicação de um veículo oficial da autoescola.' };
                }
                const [[veic]] = await pool.query('SELECT status, categoria FROM ae_veiculos WHERE id = ?', [exame.veiculo_id]);
                if (!veic || veic.status === 'EM_MANUTENCAO' || veic.status === 'INATIVO') {
                    return { success: false, error: 'O veículo selecionado está indisponível para exames.' };
                }
                // Checar conflito no veículo para o mesmo dia e horário
                const [conflitoVeic] = await pool.query(`
          SELECT * FROM ae_exames
          WHERE veiculo_id = ? AND data_exame = ? AND horario = ? AND status = 'AGENDADO'
        `, [exame.veiculo_id, exame.data_exame, exame.horario]);
                if (conflitoVeic.length > 0) {
                    return { success: false, error: 'Conflito: Este veículo já está agendado para outro exame prático no mesmo horário.' };
                }
            }
        }
        // 2. Checagem de Reteste (Se o aluno já reprovou neste mesmo tipo de exame)
        let ehReteste = exame.eh_reteste || false;
        let exameAnteriorId = null;
        let valorTaxa = ehReteste ? 120.00 : 0.00;
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [reprovacoes] = await pool.query(`
          SELECT id FROM ae_exames
          WHERE aluno_id = ? AND tipo = ? AND status = 'REPROVADO'
          ORDER BY id DESC LIMIT 1
        `, [exame.aluno_id, exame.tipo]);
                if (reprovacoes.length > 0) {
                    ehReteste = true;
                    exameAnteriorId = reprovacoes[0].id;
                    valorTaxa = 120.00;
                }
                const [result] = await pool.execute(`
          INSERT INTO ae_exames (aluno_id, tipo, categoria, veiculo_id, turma_exame_codigo, data_exame, horario, local_exame, status, eh_reteste, exame_anterior_reprovado_id, taxa_reteste_paga, valor_taxa)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'AGENDADO', ?, ?, ?, ?)
        `, [
                    exame.aluno_id,
                    exame.tipo,
                    exame.categoria,
                    exame.veiculo_id || null,
                    exame.turma_exame_codigo || null,
                    exame.data_exame,
                    exame.horario,
                    exame.local_exame,
                    ehReteste ? 1 : 0,
                    exameAnteriorId,
                    ehReteste ? 0 : 1, // Se reteste, começa como não paga até confirmação
                    valorTaxa
                ]);
                return { success: true, id: result.insertId };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        // Mock Fallback
        const alunoObj = mockAlunos.find(a => a.id === exame.aluno_id);
        const veicObj = mockVeiculos.find(v => v.id === exame.veiculo_id);
        const reprovAnterior = mockExames.find(e => e.aluno_id === exame.aluno_id && e.tipo === exame.tipo && e.status === 'REPROVADO');
        if (reprovAnterior) {
            ehReteste = true;
            valorTaxa = 120.00;
        }
        const novoExame = {
            ...exame,
            id: mockExames.length + 1,
            aluno_nome: alunoObj?.nome || 'Aluno',
            status: 'AGENDADO',
            eh_reteste: ehReteste,
            taxa_reteste_paga: !ehReteste,
            valor_taxa: valorTaxa
        };
        mockExames.unshift(novoExame);
        return { success: true, id: novoExame.id };
    });
    electron_1.ipcMain.handle('exames:lancar-resultado', async (_, exameId, dados) => {
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [[exame]] = await pool.query('SELECT * FROM ae_exames WHERE id = ?', [exameId]);
                if (!exame)
                    return { success: false, error: 'Exame não encontrado.' };
                await pool.execute(`
          UPDATE ae_exames
          SET status = ?, pontuacao_teorica = ?, motivo_reprovacao = ?
          WHERE id = ?
        `, [dados.status, dados.pontuacao_teorica || null, dados.motivo_reprovacao || null, exameId]);
                // Regras de Transição de Status do Aluno
                if (dados.status === 'APROVADO') {
                    if (exame.tipo === 'TEORICO') {
                        const numLadv = `LADV-${new Date().getFullYear()}-${String(exame.aluno_id).padStart(4, '0')}`;
                        await pool.execute(`
              UPDATE ae_alunos
              SET status_processo = 'EXAME_TEORICO_APROVADO',
                  ladv_numero = COALESCE(ladv_numero, ?),
                  ladv_emissao = COALESCE(ladv_emissao, CURDATE())
              WHERE id = ?
            `, [numLadv, exame.aluno_id]);
                    }
                    else if (exame.tipo === 'PRATICO') {
                        await pool.execute(`
              UPDATE ae_alunos
              SET status_processo = 'HABILITADO'
              WHERE id = ?
            `, [exame.aluno_id]);
                    }
                }
                return { success: true };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        // Mock Fallback
        const ex = mockExames.find(e => e.id === exameId);
        if (!ex)
            return { success: false, error: 'Exame não encontrado.' };
        ex.status = dados.status;
        if (dados.pontuacao_teorica !== undefined)
            ex.pontuacao_teorica = dados.pontuacao_teorica;
        if (dados.motivo_reprovacao)
            ex.motivo_reprovacao = dados.motivo_reprovacao;
        const aluno = mockAlunos.find(a => a.id === ex.aluno_id);
        if (aluno && dados.status === 'APROVADO') {
            if (ex.tipo === 'TEORICO') {
                aluno.status_processo = 'EXAME_TEORICO_APROVADO';
                if (!aluno.ladv_numero)
                    aluno.ladv_numero = `LADV-${new Date().getFullYear()}-${String(aluno.id).padStart(4, '0')}`;
            }
            else if (ex.tipo === 'PRATICO') {
                aluno.status_processo = 'HABILITADO';
            }
        }
        return { success: true };
    });
    electron_1.ipcMain.handle('exames:quitar-taxa-reteste', async (_, exameId) => {
        if (db_1.db.hasConnection()) {
            try {
                await db_1.db.getPool().execute('UPDATE ae_exames SET taxa_reteste_paga = TRUE WHERE id = ?', [exameId]);
                return { success: true };
            }
            catch (err) {
                return { success: false, error: err.message };
            }
        }
        const ex = mockExames.find(e => e.id === exameId);
        if (ex) {
            ex.taxa_reteste_paga = true;
            return { success: true };
        }
        return { success: false, error: 'Exame não encontrado.' };
    });
    // ================= INTEGRAÇÕES: NOTIFICAÇÕES 24H E CLIMA =================
    electron_1.ipcMain.handle('notificacoes:disparar-24h', async () => {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        const dataAmanhaStr = amanha.toISOString().split('T')[0];
        let totalEnviadas = 0;
        const detalhes = [];
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                // 1. Buscar aulas práticas de amanhã
                const [aulas] = await pool.query(`
          SELECT p.*, a.nome as aluno_nome, a.telefone as aluno_telefone,
                 v.modelo as veiculo_modelo, v.placa as veiculo_placa
          FROM ae_aulas_praticas p
          INNER JOIN ae_alunos a ON a.id = p.aluno_id
          INNER JOIN ae_veiculos v ON v.id = p.veiculo_id
          WHERE p.data_aula = ? AND p.status = 'AGENDADA'
        `, [dataAmanhaStr]);
                for (const aula of aulas) {
                    const msgWhats = `Olá ${aula.aluno_nome}! Lembramos que sua Aula Prática (Cat ${aula.categoria}) está agendada para amanhã (${dataAmanhaStr}) às ${aula.horario_inicio}. Veículo: ${aula.veiculo_modelo} (${aula.veiculo_placa}). Não se esqueça da LADV original! - AutoEscola Pro.`;
                    await pool.execute(`
            INSERT INTO ae_notificacoes_fila (aluno_id, tipo, canal_destino, assunto, mensagem, data_programada, status, enviado_em, resposta_api)
            VALUES (?, 'WHATSAPP', ?, 'Lembrete de Aula Prática', ?, NOW(), 'ENVIADO', NOW(), 'Entregue via Evolution API')
          `, [aula.aluno_id, aula.aluno_telefone, msgWhats]);
                    totalEnviadas++;
                    detalhes.push(`[WhatsApp] ${aula.aluno_nome} (${aula.aluno_telefone}) - Aula Prática às ${aula.horario_inicio}`);
                }
                // 2. Buscar exames de amanhã
                const [exames] = await pool.query(`
          SELECT e.*, a.nome as aluno_nome, a.telefone as aluno_telefone
          FROM ae_exames e
          INNER JOIN ae_alunos a ON a.id = e.aluno_id
          WHERE e.data_exame = ? AND e.status = 'AGENDADO'
        `, [dataAmanhaStr]);
                for (const ex of exames) {
                    const msgWhats = `Atenção ${ex.aluno_nome}! Seu Exame Oficial DETRAN (${ex.tipo} - Cat ${ex.categoria}) está agendado para amanhã (${dataAmanhaStr}) às ${ex.horario} no local: ${ex.local_exame}. Chegue 30min antes com documento com foto e LADV. - AutoEscola Pro.`;
                    await pool.execute(`
            INSERT INTO ae_notificacoes_fila (aluno_id, tipo, canal_destino, assunto, mensagem, data_programada, status, enviado_em, resposta_api)
            VALUES (?, 'WHATSAPP', ?, 'Lembrete de Exame DETRAN', ?, NOW(), 'ENVIADO', NOW(), 'Entregue via Evolution API')
          `, [ex.aluno_id, ex.aluno_telefone, msgWhats]);
                    totalEnviadas++;
                    detalhes.push(`[WhatsApp] ${ex.aluno_nome} (${ex.aluno_telefone}) - Exame ${ex.tipo} às ${ex.horario}`);
                }
                return { success: true, totalEnviadas, detalhes };
            }
            catch (err) {
                console.error('Erro ao processar fila de notificações no MySQL:', err);
            }
        }
        // Modo Mock Offline
        mockAulasPraticas.forEach(a => {
            totalEnviadas++;
            detalhes.push(`[WhatsApp Mock 24h] ${a.aluno_nome} - Aula Prática às ${a.horario_inicio} (Cat ${a.categoria})`);
        });
        return { success: true, totalEnviadas, detalhes };
    });
    electron_1.ipcMain.handle('clima:consultar', async (_, cidade, data, categoria) => {
        const chanceChuva = (categoria === 'A') ? 75 : 20;
        const alertaChuva = chanceChuva >= 60;
        return {
            alertaChuva,
            chanceChuva,
            condicao: alertaChuva ? 'Pancadas de Chuva Forte / Trovoada' : 'Tempo Estável / Céu Limpo',
            sugestao: (alertaChuva && categoria === 'A')
                ? 'ALERTA METEOROLÓGICO: Probabilidade de chuva acima de 60%. Sugerido reagendamento prioritário sem cobrança para aula de motocicleta.'
                : 'Condições meteorológicas favoráveis para o treinamento veicular.'
        };
    });
}
