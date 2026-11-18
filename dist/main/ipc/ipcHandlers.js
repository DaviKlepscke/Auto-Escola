"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIpcHandlers = registerIpcHandlers;
const electron_1 = require("electron");
const db_1 = require("../database/db");

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
        status_processo: 'CURSO_PRATICO'
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
        status_processo: 'CURSO_TEORICO'
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
            } catch (err) {
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
                if (filtro && filtro.categoria) {
                    sql += ' AND categoria_pretendida = ?';
                    params.push(filtro.categoria);
                }
                if (filtro && filtro.status) {
                    sql += ' AND status_processo = ?';
                    params.push(filtro.status);
                }
                sql += ' ORDER BY id DESC';
                const [rows] = await db_1.db.getPool().query(sql, params);
                return rows;
            } catch (e) {
                console.error('Erro ao listar ae_alunos:', e.message);
            }
        }
        let resultado = [...mockAlunos];
        if (filtro && filtro.categoria) resultado = resultado.filter(a => a.categoria_pretendida === filtro.categoria);
        if (filtro && filtro.status) resultado = resultado.filter(a => a.status_processo === filtro.status);
        return resultado;
    });

    electron_1.ipcMain.handle('alunos:salvar', async (_, aluno) => {
        if (db_1.db.hasConnection()) {
            try {
                const [result] = await db_1.db.getPool().execute(
                    `INSERT INTO ae_alunos (nome, cpf, rg, renach, data_nascimento, telefone, email, categoria_pretendida, status_processo)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE nome = VALUES(nome), telefone = VALUES(telefone), email = VALUES(email), status_processo = VALUES(status_processo)`,
                    [aluno.nome, aluno.cpf, aluno.rg, aluno.renach || null, aluno.data_nascimento, aluno.telefone, aluno.email, aluno.categoria_pretendida, aluno.status_processo || 'PRE_CADASTRO']
                );
                return { success: true, id: result.insertId };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }
        const newId = mockAlunos.length + 1;
        mockAlunos.unshift({ ...aluno, id: newId });
        return { success: true, id: newId };
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
                        await conn.execute(
                            `INSERT INTO ae_alunos (nome, cpf, rg, renach, data_nascimento, telefone, email, categoria_pretendida, status_processo)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                             ON DUPLICATE KEY UPDATE nome = VALUES(nome), telefone = VALUES(telefone), email = VALUES(email)`,
                            [a.nome, a.cpf, a.rg, a.renach || null, a.data_nascimento, a.telefone, a.email, a.categoria_pretendida, a.status_processo || 'PRE_CADASTRO']
                        );
                        inseridos++;
                    } catch (itemErr) {
                        erros.push(`Linha ${i + 1} (${a.nome}): ${itemErr.message}`);
                    }
                }
                await conn.commit();
            } catch (trxErr) {
                await conn.rollback();
                return { success: false, inseridos: 0, erros: [trxErr.message] };
            } finally {
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
        const aluno = mockAlunos.find(a => a.id === alunoId) || { nome: 'Aluno CFC', categoria_pretendida: 'B' };
        const aulasPratAluno = mockAulasPraticas.filter(a => a.aluno_id === alunoId && a.status === 'REALIZADA');
        const horasPrat = aulasPratAluno.length;
        const horasNoturnas = aulasPratAluno.filter(a => a.eh_noturna).length;

        const horasTeoricas = (alunoId === 1) ? 45 : 32;
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
    });

    // ================= INSTRUTORES =================
    electron_1.ipcMain.handle('instrutores:listar', async () => {
        if (db_1.db.hasConnection()) {
            try {
                const [rows] = await db_1.db.getPool().query('SELECT * FROM ae_instrutores ORDER BY nome ASC');
                return rows;
            } catch (e) {
                console.error('Erro ao listar ae_instrutores:', e.message);
            }
        }
        return mockInstrutores;
    });

    electron_1.ipcMain.handle('instrutores:salvar', async (_, inst) => {
        if (db_1.db.hasConnection()) {
            try {
                const [result] = await db_1.db.getPool().execute(
                    `INSERT INTO ae_instrutores (nome, cpf, credencial_detran, telefone, email, tipo, habilita_veiculos_pesados, ativo)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE nome = VALUES(nome), telefone = VALUES(telefone), email = VALUES(email), tipo = VALUES(tipo), habilita_veiculos_pesados = VALUES(habilita_veiculos_pesados)`,
                    [inst.nome, inst.cpf, inst.credencial_detran, inst.telefone, inst.email || null, inst.tipo, inst.habilita_veiculos_pesados ? 1 : 0, inst.ativo !== false ? 1 : 0]
                );
                return { success: true, id: result.insertId };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }
        const newId = mockInstrutores.length + 1;
        mockInstrutores.push({ ...inst, id: newId });
        return { success: true, id: newId };
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
                        await conn.execute(
                            `INSERT INTO ae_instrutores (nome, cpf, credencial_detran, telefone, email, tipo, habilita_veiculos_pesados, ativo)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                             ON DUPLICATE KEY UPDATE nome = VALUES(nome), tipo = VALUES(tipo), habilita_veiculos_pesados = VALUES(habilita_veiculos_pesados)`,
                            [inst.nome, inst.cpf, inst.credencial_detran, inst.telefone, inst.email || null, inst.tipo, inst.habilita_veiculos_pesados ? 1 : 0, 1]
                        );
                        inseridos++;
                    } catch (e) {
                        erros.push(`Linha ${i + 1} (${inst.nome}): ${e.message}`);
                    }
                }
                await conn.commit();
            } catch (trxErr) {
                await conn.rollback();
                return { success: false, inseridos: 0, erros: [trxErr.message] };
            } finally {
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
            } catch (e) {
                console.error('Erro ao listar ae_veiculos:', e.message);
            }
        }
        return mockVeiculos;
    });

    electron_1.ipcMain.handle('veiculos:salvar', async (_, v) => {
        const statusCalculado = (v.km_atual >= (v.km_ultima_revisao + (v.intervalo_revisao_km || 10000) - 1000)) ? 'ALERTA_REVISAO' : 'DISPONIVEL';
        if (db_1.db.hasConnection()) {
            try {
                const [result] = await db_1.db.getPool().execute(
                    `INSERT INTO ae_veiculos (placa, modelo, ano, categoria, km_atual, km_ultima_revisao, intervalo_revisao_km, status)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                     ON DUPLICATE KEY UPDATE modelo = VALUES(modelo), ano = VALUES(ano), km_atual = VALUES(km_atual), status = VALUES(status)`,
                    [v.placa, v.modelo, v.ano, v.categoria, v.km_atual, v.km_ultima_revisao || 0, v.intervalo_revisao_km || 10000, statusCalculado]
                );
                return { success: true, id: result.insertId };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }
        const newId = mockVeiculos.length + 1;
        mockVeiculos.push({ ...v, id: newId, status: statusCalculado });
        return { success: true, id: newId };
    });

    electron_1.ipcMain.handle('veiculos:atualizar-km', async (_, id, novoKm, registrarRevisao) => {
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [[veic]] = await pool.query('SELECT * FROM ae_veiculos WHERE id = ?', [id]);
                if (!veic) return { success: false, error: 'Veículo não encontrado.' };

                let ultimaRev = veic.km_ultima_revisao;
                let novoStatus = veic.status;

                if (registrarRevisao) {
                    ultimaRev = novoKm;
                    novoStatus = 'DISPONIVEL';
                    await pool.execute(
                        `INSERT INTO ae_manutencoes_veiculo (veiculo_id, km_registro, tipo, descricao, data_manutencao, proxima_revisao_km)
                         VALUES (?, ?, 'PREVENTIVA', 'Revisão preventiva executada', CURDATE(), ?)`,
                        [id, novoKm, novoKm + veic.intervalo_revisao_km]
                    );
                } else {
                    if (novoKm >= (ultimaRev + veic.intervalo_revisao_km - 1000)) {
                        novoStatus = 'ALERTA_REVISAO';
                    }
                }

                await pool.execute(
                    'UPDATE ae_veiculos SET km_atual = ?, km_ultima_revisao = ?, status = ? WHERE id = ?',
                    [novoKm, ultimaRev, novoStatus, id]
                );
                return { success: true };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }

        const v = mockVeiculos.find(item => item.id === id);
        if (v) {
            v.km_atual = novoKm;
            if (registrarRevisao) {
                v.km_ultima_revisao = novoKm;
                v.status = 'DISPONIVEL';
            } else if (novoKm >= (v.km_ultima_revisao + v.intervalo_revisao_km - 1000)) {
                v.status = 'ALERTA_REVISAO';
            }
            return { success: true };
        }
        return { success: false, error: 'Veículo não encontrado.' };
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
                        await conn.execute(
                            `INSERT INTO ae_veiculos (placa, modelo, ano, categoria, km_atual, km_ultima_revisao, intervalo_revisao_km, status)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                             ON DUPLICATE KEY UPDATE km_atual = VALUES(km_atual), status = VALUES(status)`,
                            [v.placa, v.modelo, v.ano, v.categoria, v.km_atual, v.km_ultima_revisao || 0, v.intervalo_revisao_km || 10000, statusCalc]
                        );
                        inseridos++;
                    } catch (e) {
                        erros.push(`Linha ${i + 1} (${v.placa}): ${e.message}`);
                    }
                }
                await conn.commit();
            } catch (trxErr) {
                await conn.rollback();
                return { success: false, inseridos: 0, erros: [trxErr.message] };
            } finally {
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
            } catch (e) {
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
            } catch (e) {
                console.error('Erro ao listar ae_turmas_teoricas:', e.message);
            }
        }
        return mockTurmas;
    });

    electron_1.ipcMain.handle('turmas:salvar', async (_, turma) => {
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

                const [conflitosInst] = await pool.query(`
                    SELECT * FROM ae_turmas_teoricas
                    WHERE instrutor_id = ? AND status != 'CANCELADA'
                      AND (NOT (data_fim < ? OR data_inicio > ?))
                      AND (horario_inicio < ? AND horario_fim > ?)
                `, [turma.instrutor_id, turma.data_inicio, turma.data_fim, turma.horario_fim, turma.horario_inicio]);

                if (conflitosInst.length > 0) {
                    return { success: false, error: `Conflito de Instrutor: O instrutor selecionado já está ministrando a turma ${conflitosInst[0].codigo} neste horário.` };
                }

                const [result] = await pool.execute(`
                    INSERT INTO ae_turmas_teoricas (codigo, sala_id, instrutor_id, data_inicio, data_fim, horario_inicio, horario_fim, status)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `, [turma.codigo, turma.sala_id, turma.instrutor_id, turma.data_inicio, turma.data_fim, turma.horario_inicio, turma.horario_fim, turma.status || 'PLANEJADA']);

                return { success: true, id: result.insertId };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }

        const conflito = mockTurmas.find(t =>
            t.sala_id === turma.sala_id &&
            t.status !== 'CANCELADA' &&
            !(t.data_fim < turma.data_inicio || t.data_inicio > turma.data_fim) &&
            (t.horario_inicio < turma.horario_fim && t.horario_fim > turma.horario_inicio)
        );
        if (conflito) {
            return { success: false, error: `Conflito: Sala já ocupada pela turma ${conflito.codigo} neste horário.` };
        }

        const salaObj = mockSalas.find(s => s.id === turma.sala_id);
        const instObj = mockInstrutores.find(i => i.id === turma.instrutor_id);
        const newId = mockTurmas.length + 1;
        mockTurmas.unshift({
            ...turma,
            id: newId,
            sala_nome: salaObj ? salaObj.nome : 'Sala 1',
            instrutor_nome: instObj ? instObj.nome : 'Instrutor',
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
            } catch (e) {
                console.error('Erro ao listar alunos da turma:', e.message);
            }
        }
        return mockMatriculas.filter(m => m.turma_id === turmaId && m.status === 'MATRICULADO');
    });

    electron_1.ipcMain.handle('turmas:matricular', async (_, turmaId, alunoId) => {
        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();
                const [[{ total }]] = await pool.query(
                    'SELECT COUNT(*) as total FROM ae_matriculas_turma WHERE turma_id = ? AND status = "MATRICULADO"',
                    [turmaId]
                );
                if (Number(total) >= 20) {
                    return { success: false, error: 'Capacidade máxima atingida: esta turma já possui 20 alunos matriculados.' };
                }

                await pool.execute(
                    'INSERT INTO ae_matriculas_turma (turma_id, aluno_id, status) VALUES (?, ?, "MATRICULADO") ON DUPLICATE KEY UPDATE status = "MATRICULADO"',
                    [turmaId, alunoId]
                );
                return { success: true };
            } catch (err) {
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
            aluno_nome: aluno ? aluno.nome : 'Aluno',
            aluno_cpf: aluno ? aluno.cpf : '',
            status: 'MATRICULADO'
        });
        const t = mockTurmas.find(item => item.id === turmaId);
        if (t) t.total_alunos = (t.total_alunos || 0) + 1;
        return { success: true };
    });

    electron_1.ipcMain.handle('turmas:desmatricular', async (_, turmaId, alunoId) => {
        if (db_1.db.hasConnection()) {
            try {
                await db_1.db.getPool().execute(
                    'UPDATE ae_matriculas_turma SET status = "CANCELADO" WHERE turma_id = ? AND aluno_id = ?',
                    [turmaId, alunoId]
                );
                return { success: true };
            } catch (err) {
                return { success: false, error: err.message };
            }
        }
        const idx = mockMatriculas.findIndex(m => m.turma_id === turmaId && m.aluno_id === alunoId);
        if (idx !== -1) mockMatriculas.splice(idx, 1);
        const t = mockTurmas.find(item => item.id === turmaId);
        if (t && (t.total_alunos || 0) > 0) t.total_alunos--;
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
            } catch (e) {
                console.error('Erro ao listar ae_aulas_praticas:', e.message);
            }
        }
        return mockAulasPraticas;
    });

    electron_1.ipcMain.handle('aulas:salvar-pratica', async (_, aula) => {
        if (['C', 'D', 'E'].includes(aula.categoria)) {
            if (db_1.db.hasConnection()) {
                const pool = db_1.db.getPool();
                const [[inst]] = await pool.query('SELECT habilita_veiculos_pesados FROM ae_instrutores WHERE id = ?', [aula.instrutor_id]);
                if (!inst || !inst.habilita_veiculos_pesados) {
                    return { success: false, error: 'Regra DETRAN: O instrutor não possui credenciamento para veículos pesados (Cat C, D e E).' };
                }
            } else {
                const inst = mockInstrutores.find(i => i.id === aula.instrutor_id);
                if (!inst || !inst.habilita_veiculos_pesados) {
                    return { success: false, error: 'Regra DETRAN: O instrutor não possui credenciamento para veículos pesados (Cat C, D e E).' };
                }
            }
        }

        const inicio = aula.horario_inicio;
        const fim = aula.horario_fim;
        const data = aula.data_aula;
        const ehNoturnaCalculada = aula.eh_noturna || (inicio >= '18:00');
        const alertaChuvaCalculado = (aula.categoria === 'A') && (aula.alerta_chuva || false);

        if (db_1.db.hasConnection()) {
            try {
                const pool = db_1.db.getPool();

                const [conflitoInst] = await pool.query(`
                    SELECT * FROM ae_aulas_praticas
                    WHERE instrutor_id = ? AND data_aula = ? AND status != 'CANCELADA'
                      AND (horario_inicio < ? AND horario_fim > ?)
                `, [aula.instrutor_id, data, fim, inicio]);
                if (conflitoInst.length > 0) {
                    return { success: false, error: 'Conflito de Instrutor: O instrutor selecionado já possui outra aula prática agendada neste horário.' };
                }

                const [conflitoVeic] = await pool.query(`
                    SELECT * FROM ae_aulas_praticas
                    WHERE veiculo_id = ? AND data_aula = ? AND status != 'CANCELADA'
                      AND (horario_inicio < ? AND horario_fim > ?)
                `, [aula.veiculo_id, data, fim, inicio]);
                if (conflitoVeic.length > 0) {
                    return { success: false, error: 'Conflito de Veículo: O veículo selecionado já está reservado para outra aula neste horário.' };
                }

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
            } catch (err) {
                return { success: false, error: err.message };
            }
        }

        const choqueInst = mockAulasPraticas.find(a => a.instrutor_id === aula.instrutor_id && a.data_aula === data && a.status !== 'CANCELADA' && (a.horario_inicio < fim && a.horario_fim > inicio));
        if (choqueInst) return { success: false, error: 'Conflito: Instrutor ocupado neste horário.' };

        const choqueVeic = mockAulasPraticas.find(a => a.veiculo_id === aula.veiculo_id && a.data_aula === data && a.status !== 'CANCELADA' && (a.horario_inicio < fim && a.horario_fim > inicio));
        if (choqueVeic) return { success: false, error: 'Conflito: Veículo ocupado neste horário.' };

        const choqueAluno = mockAulasPraticas.find(a => a.aluno_id === aula.aluno_id && a.data_aula === data && a.status !== 'CANCELADA' && (a.horario_inicio < fim && a.horario_fim > inicio));
        if (choqueAluno) return { success: false, error: 'Conflito: Aluno já possui aula neste horário.' };

        const alunoObj = mockAlunos.find(a => a.id === aula.aluno_id);
        const instObj = mockInstrutores.find(i => i.id === aula.instrutor_id);
        const veicObj = mockVeiculos.find(v => v.id === aula.veiculo_id);

        const novaAula = {
            ...aula,
            id: mockAulasPraticas.length + 1,
            aluno_nome: alunoObj ? alunoObj.nome : 'Aluno',
            instrutor_nome: instObj ? instObj.nome : 'Instrutor',
            veiculo_modelo: veicObj ? veicObj.modelo : 'Veículo',
            veiculo_placa: veicObj ? veicObj.placa : '',
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

                if (status === 'REALIZADA') {
                    const [[aula]] = await pool.query('SELECT veiculo_id FROM ae_aulas_praticas WHERE id = ?', [aulaId]);
                    if (aula && aula.veiculo_id) {
                        await pool.execute(`
                            UPDATE ae_veiculos
                            SET km_atual = km_atual + 15,
                                status = IF((km_atual + 15) >= (km_ultima_revisao + intervalo_revisao_km - 1000), 'ALERTA_REVISAO', status)
                            WHERE id = ?
                        `, [aula.veiculo_id]);
                    }
                }
                return { success: true };
            } catch (err) {
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
            }
            return { success: true };
        }
        return { success: false, error: 'Aula não encontrada.' };
    });

    // ================= EXAMES =================
    electron_1.ipcMain.handle('exames:listar', async () => {
        return mockExames;
    });
}
