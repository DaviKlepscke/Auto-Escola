-- =====================================================================
-- BANCO DE DADOS COMPLETO (DDL + TRIGGERS + DML SEEDS)
-- SISTEMA DE GESTÃO DE AUTOESCOLA (CFC) - AUTOESCOLA PRO
-- Especialista em Banco de Dados: database_mysql
-- Compatível com MySQL 8.0+ / MariaDB 10.5+
-- =====================================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Usuários do Sistema (Apenas Dono e Atendimento)
CREATE TABLE IF NOT EXISTS ae_usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    perfil ENUM('DONO_ADMIN', 'ATENDIMENTO') NOT NULL DEFAULT 'ATENDIMENTO',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Alunos
CREATE TABLE IF NOT EXISTS ae_alunos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    rg VARCHAR(20) NOT NULL,
    renach VARCHAR(15) NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    telefone VARCHAR(16) NOT NULL,
    email VARCHAR(120) NOT NULL,
    cep VARCHAR(9) NULL,
    logradouro VARCHAR(150) NULL,
    numero VARCHAR(20) NULL,
    bairro VARCHAR(80) NULL,
    cidade VARCHAR(80) NULL,
    categoria_pretendida ENUM('A', 'B', 'AB', 'C', 'D', 'E') NOT NULL,
    status_exame_medico ENUM('PENDENTE', 'APTO', 'INAPTO') DEFAULT 'PENDENTE',
    status_exame_psico ENUM('PENDENTE', 'APTO', 'INAPTO') DEFAULT 'PENDENTE',
    ladv_numero VARCHAR(20) NULL,
    ladv_emissao DATE NULL,
    status_processo ENUM(
        'PRE_CADASTRO',
        'EXAMES_APTOS',
        'CURSO_TEORICO',
        'TEORICO_CONCLUIDO',
        'EXAME_TEORICO_APROVADO',
        'CURSO_PRATICO',
        'PRATICO_CONCLUIDO',
        'HABILITADO',
        'BLOQUEADO'
    ) NOT NULL DEFAULT 'PRE_CADASTRO',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ae_aluno_cpf (cpf),
    INDEX idx_ae_aluno_renach (renach),
    INDEX idx_ae_aluno_status (status_processo)
) ENGINE=InnoDB;

-- 3. Instrutores (Credenciamento DETRAN)
CREATE TABLE IF NOT EXISTS ae_instrutores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(120) NOT NULL,
    cpf VARCHAR(14) NOT NULL UNIQUE,
    credencial_detran VARCHAR(30) NOT NULL UNIQUE,
    telefone VARCHAR(16) NOT NULL,
    email VARCHAR(120) NULL,
    tipo ENUM('TEORICO', 'PRATICO', 'AMBOS') NOT NULL,
    habilita_veiculos_pesados BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Permissão para Cat C, D e E',
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ae_instrutor_tipo (tipo),
    INDEX idx_ae_instrutor_pesados (habilita_veiculos_pesados)
) ENGINE=InnoDB;

-- 4. Veículos da Frota e Alertas de Revisão
CREATE TABLE IF NOT EXISTS ae_veiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    modelo VARCHAR(80) NOT NULL,
    ano INT NOT NULL,
    categoria ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
    km_atual INT NOT NULL DEFAULT 0,
    km_ultima_revisao INT NOT NULL DEFAULT 0,
    intervalo_revisao_km INT NOT NULL DEFAULT 10000,
    status ENUM('DISPONIVEL', 'ALERTA_REVISAO', 'EM_MANUTENCAO', 'INATIVO') NOT NULL DEFAULT 'DISPONIVEL',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ae_veiculo_categoria (categoria),
    INDEX idx_ae_veiculo_status (status)
) ENGINE=InnoDB;

-- 5. Salas Físicas Teóricas (Exatamente 2 salas, limite de 20 alunos)
CREATE TABLE IF NOT EXISTS ae_salas_teoricas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE,
    capacidade_maxima INT NOT NULL DEFAULT 20,
    ativa BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

-- 6. Turmas Teóricas
CREATE TABLE IF NOT EXISTS ae_turmas_teoricas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(30) NOT NULL UNIQUE,
    sala_id INT NOT NULL,
    instrutor_id INT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    status ENUM('PLANEJADA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA') NOT NULL DEFAULT 'PLANEJADA',
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sala_id) REFERENCES ae_salas_teoricas(id) ON DELETE RESTRICT,
    FOREIGN KEY (instrutor_id) REFERENCES ae_instrutores(id) ON DELETE RESTRICT,
    INDEX idx_ae_turma_sala_periodo (sala_id, data_inicio, data_fim, horario_inicio, horario_fim),
    INDEX idx_ae_turma_instrutor_periodo (instrutor_id, data_inicio, data_fim, horario_inicio, horario_fim)
) ENGINE=InnoDB;

-- 7. Matrículas na Turma Teórica (Bloqueio de Máximo 20 alunos)
CREATE TABLE IF NOT EXISTS ae_matriculas_turma (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turma_id INT NOT NULL,
    aluno_id INT NOT NULL,
    data_matricula TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('MATRICULADO', 'CONCLUIDO', 'DESISTENTE', 'TRANSFERIDO') NOT NULL DEFAULT 'MATRICULADO',
    FOREIGN KEY (turma_id) REFERENCES ae_turmas_teoricas(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES ae_alunos(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_ae_turma_aluno (turma_id, aluno_id),
    INDEX idx_ae_matricula_aluno (aluno_id)
) ENGINE=InnoDB;

-- 8. Aulas Teóricas por Módulo Curricular (45h totais)
CREATE TABLE IF NOT EXISTS ae_aulas_teoricas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    turma_id INT NOT NULL,
    disciplina ENUM(
        'LEGISLACAO_TRANSITO',
        'DIRECAO_DEFENSIVA',
        'PRIMEIROS_SOCORROS',
        'MEIO_AMBIENTE_CIDADANIA',
        'MECANICA_BASICA'
    ) NOT NULL,
    data_aula DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    quantidade_horas INT NOT NULL DEFAULT 1,
    realizada BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (turma_id) REFERENCES ae_turmas_teoricas(id) ON DELETE CASCADE,
    INDEX idx_ae_aula_turma_data (turma_id, data_aula)
) ENGINE=InnoDB;

-- 9. Frequência / Presença das Aulas Teóricas
CREATE TABLE IF NOT EXISTS ae_frequencia_teorica (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aula_teorica_id INT NOT NULL,
    aluno_id INT NOT NULL,
    presente BOOLEAN NOT NULL DEFAULT FALSE,
    falta_justificada BOOLEAN NOT NULL DEFAULT FALSE,
    observacao VARCHAR(255) NULL,
    FOREIGN KEY (aula_teorica_id) REFERENCES ae_aulas_teoricas(id) ON DELETE CASCADE,
    FOREIGN KEY (aluno_id) REFERENCES ae_alunos(id) ON DELETE RESTRICT,
    UNIQUE KEY uk_ae_aula_aluno_presenca (aula_teorica_id, aluno_id)
) ENGINE=InnoDB;

-- 10. Aulas Práticas (Controle de Aluno, Instrutor, Veículo e Aulas Noturnas)
CREATE TABLE IF NOT EXISTS ae_aulas_praticas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    instrutor_id INT NOT NULL,
    veiculo_id INT NOT NULL,
    categoria ENUM('A', 'B', 'C', 'D', 'E') NOT NULL,
    data_aula DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fim TIME NOT NULL,
    eh_noturna BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Aulas após as 18h obrigatórias pelo DETRAN',
    status ENUM('AGENDADA', 'REALIZADA', 'FALTOU', 'CANCELADA', 'REAGENDADA_CLIMA') NOT NULL DEFAULT 'AGENDADA',
    alerta_chuva BOOLEAN NOT NULL DEFAULT FALSE COMMENT 'Previsão de chuva identificada para aula Cat A',
    observacoes TEXT NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES ae_alunos(id) ON DELETE RESTRICT,
    FOREIGN KEY (instrutor_id) REFERENCES ae_instrutores(id) ON DELETE RESTRICT,
    FOREIGN KEY (veiculo_id) REFERENCES ae_veiculos(id) ON DELETE RESTRICT,
    INDEX idx_ae_pratica_instrutor_horario (instrutor_id, data_aula, horario_inicio, horario_fim),
    INDEX idx_ae_pratica_veiculo_horario (veiculo_id, data_aula, horario_inicio, horario_fim),
    INDEX idx_ae_pratica_aluno_horario (aluno_id, data_aula, horario_inicio, horario_fim),
    INDEX idx_ae_pratica_data_categoria (data_aula, categoria)
) ENGINE=InnoDB;

-- 11. Gestão de Exames (Teóricos em turma, Práticos individuais, Retestes e Taxas)
CREATE TABLE IF NOT EXISTS ae_exames (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    tipo ENUM('TEORICO', 'PRATICO') NOT NULL,
    categoria ENUM('A', 'B', 'C', 'D', 'E', 'AB') NOT NULL,
    veiculo_id INT NULL COMMENT 'Apenas para exame prático',
    turma_exame_codigo VARCHAR(30) NULL COMMENT 'Para exame teórico em turma',
    data_exame DATE NOT NULL,
    horario TIME NOT NULL,
    local_exame VARCHAR(150) NOT NULL,
    status ENUM('AGENDADO', 'APROVADO', 'REPROVADO', 'AUSENTE') NOT NULL DEFAULT 'AGENDADO',
    pontuacao_teorica INT NULL COMMENT 'Pontos obtidos no exame teórico (máx 30)',
    eh_reteste BOOLEAN NOT NULL DEFAULT FALSE,
    exame_anterior_reprovado_id INT NULL,
    taxa_reteste_paga BOOLEAN NOT NULL DEFAULT TRUE,
    valor_taxa DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    motivo_reprovacao VARCHAR(255) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (aluno_id) REFERENCES ae_alunos(id) ON DELETE RESTRICT,
    FOREIGN KEY (veiculo_id) REFERENCES ae_veiculos(id) ON DELETE RESTRICT,
    FOREIGN KEY (exame_anterior_reprovado_id) REFERENCES ae_exames(id) ON DELETE SET NULL,
    INDEX idx_ae_exame_aluno (aluno_id, tipo),
    INDEX idx_ae_exame_data (data_exame, status)
) ENGINE=InnoDB;

-- 12. Histórico de Manutenções da Frota
CREATE TABLE IF NOT EXISTS ae_manutencoes_veiculo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    veiculo_id INT NOT NULL,
    km_registro INT NOT NULL,
    tipo ENUM('PREVENTIVA', 'CORRETIVA', 'REVISAO_PERIODICA') NOT NULL,
    descricao TEXT NOT NULL,
    custo DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    data_manutencao DATE NOT NULL,
    proxima_revisao_km INT NOT NULL,
    oficina VARCHAR(100) NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (veiculo_id) REFERENCES ae_veiculos(id) ON DELETE CASCADE,
    INDEX idx_ae_manutencao_veiculo (veiculo_id, data_manutencao)
) ENGINE=InnoDB;

-- 13. Fila de Notificações Automáticas (Lembretes 1 dia antes)
CREATE TABLE IF NOT EXISTS ae_notificacoes_fila (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id INT NOT NULL,
    tipo ENUM('WHATSAPP', 'EMAIL') NOT NULL,
    canal_destino VARCHAR(150) NOT NULL COMMENT 'Número com DDI/DDD ou e-mail',
    assunto VARCHAR(150) NULL,
    mensagem TEXT NOT NULL,
    data_programada DATETIME NOT NULL,
    status ENUM('PENDENTE', 'ENVIADO', 'FALHA', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    tentativas INT NOT NULL DEFAULT 0,
    enviado_em DATETIME NULL,
    resposta_api TEXT NULL,
    FOREIGN KEY (aluno_id) REFERENCES ae_alunos(id) ON DELETE CASCADE,
    INDEX idx_ae_notif_status_programada (status, data_programada)
) ENGINE=InnoDB;

-- 14. Trigger de Validação de Limite de 20 Alunos por Sala
DROP TRIGGER IF EXISTS trg_ae_valida_capacidade_turma;
DELIMITER //
CREATE TRIGGER trg_ae_valida_capacidade_turma
BEFORE INSERT ON ae_matriculas_turma
FOR EACH ROW
BEGIN
    DECLARE total_matriculados INT;
    DECLARE max_capacidade INT;

    SELECT COUNT(*) INTO total_matriculados
    FROM ae_matriculas_turma
    WHERE turma_id = NEW.turma_id AND status = 'MATRICULADO';

    SELECT capacidade_maxima INTO max_capacidade
    FROM ae_salas_teoricas s
    INNER JOIN ae_turmas_teoricas t ON t.sala_id = s.id
    WHERE t.id = NEW.turma_id;

    IF total_matriculados >= max_capacidade THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Capacidade máxima da turma atingida (limite rigoroso de 20 alunos por sala).';
    END IF;
END//
DELIMITER ;

-- =====================================================================
-- CARGA DE DADOS INICIAL (SEEDS)
-- =====================================================================

-- Usuários
INSERT INTO ae_usuarios (id, nome, login, senha_hash, perfil, ativo) VALUES
(1, 'Dono da Autoescola', 'admin', '$2a$12$e68N30M0B7qI1Y4GfM6uG.Z3mJv6eFzLgU7QY7zCskwUuRHzqN1Vq', 'DONO_ADMIN', TRUE),
(2, 'Secretária de Atendimento', 'atendimento', '$2a$12$KjY53o2hE1x0gK0sA8W3K.dGZ1sL5sX0Q6vR8sC7o9tY4zP3uK1L2', 'ATENDIMENTO', TRUE)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- Salas
INSERT INTO ae_salas_teoricas (id, nome, capacidade_maxima, ativa) VALUES
(1, 'Sala Teórica 1', 20, TRUE),
(2, 'Sala Teórica 2', 20, TRUE)
ON DUPLICATE KEY UPDATE capacidade_maxima = 20;

-- 17 Instrutores (5 Teóricos, 10 Práticos, 2 Pesados)
INSERT INTO ae_instrutores (id, nome, cpf, credencial_detran, telefone, email, tipo, habilita_veiculos_pesados, ativo) VALUES
(1, 'Carlos Eduardo Silva', '111.222.333-01', 'DETRAN-TEO-001', '(11) 98111-0001', 'carlos.teo@cfc.com', 'TEORICO', FALSE, TRUE),
(2, 'Mariana Souza Lima', '111.222.333-02', 'DETRAN-TEO-002', '(11) 98111-0002', 'mariana.teo@cfc.com', 'TEORICO', FALSE, TRUE),
(3, 'Roberto Antunes Dias', '111.222.333-03', 'DETRAN-TEO-003', '(11) 98111-0003', 'roberto.teo@cfc.com', 'TEORICO', FALSE, TRUE),
(4, 'Fernanda Castro', '111.222.333-04', 'DETRAN-TEO-004', '(11) 98111-0004', 'fernanda.teo@cfc.com', 'TEORICO', FALSE, TRUE),
(5, 'Paulo Henrique Ramos', '111.222.333-05', 'DETRAN-TEO-005', '(11) 98111-0005', 'paulo.teo@cfc.com', 'TEORICO', FALSE, TRUE),
(6, 'Julio Cesar Mendes', '222.333.444-01', 'DETRAN-PRA-001', '(11) 98222-0001', 'julio.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(7, 'Camila Rodrigues', '222.333.444-02', 'DETRAN-PRA-002', '(11) 98222-0002', 'camila.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(8, 'Marcos Vinicius', '222.333.444-03', 'DETRAN-PRA-003', '(11) 98222-0003', 'marcos.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(9, 'Patricia Alcantara', '222.333.444-04', 'DETRAN-PRA-004', '(11) 98222-0004', 'patricia.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(10, 'Rodrigo Bueno', '222.333.444-05', 'DETRAN-PRA-005', '(11) 98222-0005', 'rodrigo.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(11, 'Beatriz Nogueira', '222.333.444-06', 'DETRAN-PRA-006', '(11) 98222-0006', 'beatriz.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(12, 'Fabio Guimarães', '222.333.444-07', 'DETRAN-PRA-007', '(11) 98222-0007', 'fabio.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(13, 'Aline Duarte', '222.333.444-08', 'DETRAN-PRA-008', '(11) 98222-0008', 'aline.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(14, 'Renato Ribeiro', '222.333.444-09', 'DETRAN-PRA-009', '(11) 98222-0009', 'renato.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(15, 'Tatiane Farias', '222.333.444-10', 'DETRAN-PRA-010', '(11) 98222-0010', 'tatiane.pra@cfc.com', 'PRATICO', FALSE, TRUE),
(16, 'Valmir Santos (Pesados)', '333.444.555-01', 'DETRAN-PES-001', '(11) 98333-0001', 'valmir.pesados@cfc.com', 'PRATICO', TRUE, TRUE),
(17, 'Antonio Carlos (Pesados)', '333.444.555-02', 'DETRAN-PES-002', '(11) 98333-0002', 'antonio.pesados@cfc.com', 'PRATICO', TRUE, TRUE)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- 8 Veículos
INSERT INTO ae_veiculos (id, placa, modelo, ano, categoria, km_atual, km_ultima_revisao, intervalo_revisao_km, status) VALUES
(1, 'BRA1A23', 'Honda CG 160 Fan', 2024, 'A', 4500, 0, 5000, 'DISPONIVEL'),
(2, 'BRA2B34', 'Yamaha Fazer 150', 2023, 'A', 9200, 5000, 5000, 'ALERTA_REVISAO'),
(3, 'BRA3C45', 'Chevrolet Onix 1.0', 2023, 'B', 18500, 10000, 10000, 'ALERTA_REVISAO'),
(4, 'BRA4D56', 'Hyundai HB20 1.0', 2024, 'B', 8200, 0, 10000, 'DISPONIVEL'),
(5, 'BRA5E67', 'Volkswagen Polo 1.0', 2024, 'B', 3100, 0, 10000, 'DISPONIVEL'),
(6, 'BRA6F78', 'Fiat Argo 1.0', 2023, 'B', 20500, 20000, 10000, 'DISPONIVEL'),
(7, 'BRA7G89', 'Caminhão VW Delivery 9.170 (Cat C)', 2022, 'C', 45200, 40000, 10000, 'DISPONIVEL'),
(8, 'BRA8H90', 'Micro-ônibus Marcopolo Volare (Cat D)', 2021, 'D', 78900, 70000, 10000, 'ALERTA_REVISAO')
ON DUPLICATE KEY UPDATE modelo = VALUES(modelo);

-- 8 Alunos em Todas as Fases do DETRAN
INSERT INTO ae_alunos (id, nome, cpf, rg, renach, data_nascimento, telefone, email, categoria_pretendida, status_exame_medico, status_exame_psico, ladv_numero, ladv_emissao, status_processo) VALUES
(1, 'Lucas Gabriel Silveira', '123.456.789-00', '12.345.678-9', 'SP123456789', '2004-05-14', '(11) 97777-1111', 'lucas.silveira@email.com', 'B', 'APTO', 'APTO', 'LADV-2026-0001', '2026-11-10', 'CURSO_PRATICO'),
(2, 'Juliana Beatriz Santos', '234.567.890-11', '23.456.789-0', 'SP987654321', '2005-08-20', '(11) 98888-2222', 'juliana.santos@email.com', 'A', 'APTO', 'APTO', NULL, NULL, 'CURSO_TEORICO'),
(3, 'Marcos Vinicius Souza', '345.678.901-22', '34.567.890-1', 'SP456789123', '2003-02-18', '(11) 97777-3333', 'marcos.souza@email.com', 'B', 'APTO', 'APTO', 'LADV-2026-0003', '2026-10-25', 'PRATICO_CONCLUIDO'),
(4, 'Camila Fernanda Lima', '456.789.012-33', '45.678.901-2', 'SP789123456', '2002-11-30', '(11) 96666-4444', 'camila.lima@email.com', 'AB', 'APTO', 'APTO', NULL, NULL, 'EXAMES_APTOS'),
(5, 'Rodrigo Alves Pereira', '567.890.123-44', '56.789.012-3', 'SP321654987', '1998-04-12', '(11) 95555-5555', 'rodrigo.pesados@email.com', 'C', 'APTO', 'APTO', 'LADV-2026-0005', '2026-10-15', 'CURSO_PRATICO'),
(6, 'Beatriz Nogueira Silva', '678.901.234-55', '67.890.123-4', 'SP654987321', '2001-09-05', '(11) 94444-6666', 'beatriz.silva@email.com', 'B', 'APTO', 'APTO', 'LADV-2026-0006', '2026-09-20', 'CURSO_PRATICO'),
(7, 'Tatiane Farias Ramos', '789.012.345-66', '78.901.234-5', 'SP147258369', '2000-01-22', '(11) 93333-7777', 'tatiane.farias@email.com', 'B', 'APTO', 'APTO', 'LADV-2026-0007', '2026-08-10', 'HABILITADO'),
(8, 'Anderson Silva Costa', '890.123.456-77', '89.012.345-6', 'SP369258147', '1995-12-14', '(11) 92222-8888', 'anderson.costa@email.com', 'D', 'APTO', 'APTO', NULL, NULL, 'CURSO_TEORICO')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- Turmas Teóricas
INSERT INTO ae_turmas_teoricas (id, codigo, sala_id, instrutor_id, data_inicio, data_fim, horario_inicio, horario_fim, status) VALUES
(1, 'TURMA-2026-S1-MANHA', 1, 1, '2026-11-20', '2026-12-15', '08:00:00', '11:40:00', 'EM_ANDAMENTO'),
(2, 'TURMA-2026-S2-NOITE', 2, 2, '2026-11-25', '2026-12-20', '18:30:00', '22:10:00', 'PLANEJADA')
ON DUPLICATE KEY UPDATE codigo = VALUES(codigo);

-- Matrículas
INSERT INTO ae_matriculas_turma (id, turma_id, aluno_id, status) VALUES
(1, 1, 2, 'MATRICULADO'),
(2, 1, 8, 'MATRICULADO')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Aulas Teóricas
INSERT INTO ae_aulas_teoricas (id, turma_id, disciplina, data_aula, horario_inicio, horario_fim, quantidade_horas, realizada) VALUES
(1, 1, 'LEGISLACAO_TRANSITO', '2026-11-20', '08:00:00', '11:40:00', 4, TRUE),
(2, 1, 'LEGISLACAO_TRANSITO', '2026-11-21', '08:00:00', '11:40:00', 4, TRUE),
(3, 1, 'DIRECAO_DEFENSIVA', '2026-11-22', '08:00:00', '11:40:00', 4, TRUE),
(4, 1, 'PRIMEIROS_SOCORROS', '2026-11-23', '08:00:00', '11:40:00', 4, FALSE),
(5, 1, 'MEIO_AMBIENTE_CIDADANIA', '2026-11-24', '08:00:00', '11:40:00', 4, FALSE),
(6, 1, 'MECANICA_BASICA', '2026-11-25', '08:00:00', '11:00:00', 3, FALSE)
ON DUPLICATE KEY UPDATE disciplina = VALUES(disciplina);

-- Frequência Teórica
INSERT INTO ae_frequencia_teorica (id, aula_teorica_id, aluno_id, presente, falta_justificada) VALUES
(1, 1, 2, TRUE, FALSE),
(2, 1, 8, TRUE, FALSE),
(3, 2, 2, TRUE, FALSE),
(4, 2, 8, TRUE, FALSE)
ON DUPLICATE KEY UPDATE presente = VALUES(presente);

-- Aulas Práticas
INSERT INTO ae_aulas_praticas (id, aluno_id, instrutor_id, veiculo_id, categoria, data_aula, horario_inicio, horario_fim, eh_noturna, status, alerta_chuva, observacoes) VALUES
(1, 1, 6, 3, 'B', CURDATE(), '09:00:00', '09:50:00', FALSE, 'REALIZADA', FALSE, 'Aula prática em trânsito urbano'),
(2, 1, 6, 3, 'B', CURDATE(), '19:00:00', '19:50:00', TRUE, 'AGENDADA', FALSE, 'Cota de Aula Noturna Obrigatória pelo DETRAN'),
(3, 2, 7, 1, 'A', CURDATE(), '14:00:00', '14:50:00', FALSE, 'AGENDADA', TRUE, 'Alerta meteorológico de chuva forte - sugerido reagendamento sem custos'),
(4, 5, 16, 7, 'C', CURDATE(), '10:00:00', '10:50:00', FALSE, 'REALIZADA', FALSE, 'Treinamento de manobras com caminhão pesado'),
(5, 6, 6, 3, 'B', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '08:00:00', '08:50:00', FALSE, 'REALIZADA', FALSE, 'Aula preparatória para reteste')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Exames
INSERT INTO ae_exames (id, aluno_id, tipo, categoria, veiculo_id, turma_exame_codigo, data_exame, horario, local_exame, status, pontuacao_teorica, eh_reteste, taxa_reteste_paga, valor_taxa, motivo_reprovacao) VALUES
(1, 1, 'TEORICO', 'B', NULL, 'DETRAN-TEO-SP-44', '2026-11-10', '10:00:00', 'Poupatempo / DETRAN Central', 'APROVADO', 28, FALSE, TRUE, 0.00, NULL),
(2, 3, 'PRATICO', 'B', 4, NULL, DATE_ADD(CURDATE(), INTERVAL 1 DAY), '09:30:00', 'Pátio Oficial DETRAN - Pista de Exames', 'AGENDADO', NULL, FALSE, TRUE, 0.00, NULL),
(3, 6, 'PRATICO', 'B', 3, NULL, DATE_SUB(CURDATE(), INTERVAL 5 DAY), '11:00:00', 'Pátio Oficial DETRAN', 'REPROVADO', NULL, TRUE, FALSE, 120.00, 'Falta eliminatória na baliza (toque na baliza delimitadora)'),
(4, 7, 'PRATICO', 'B', 5, NULL, '2026-11-01', '08:30:00', 'Pátio Oficial DETRAN', 'APROVADO', NULL, FALSE, TRUE, 0.00, NULL)
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- Manutenções
INSERT INTO ae_manutencoes_veiculo (id, veiculo_id, km_registro, tipo, descricao, custo, data_manutencao, proxima_revisao_km, oficina) VALUES
(1, 3, 10000, 'REVISAO_PERIODICA', 'Troca de óleo sintético, filtro de óleo, filtro de ar e pastilhas de freio dianteiras.', 480.00, '2026-08-15', 20000, 'Concessionária Autorizada Chevrolet'),
(2, 2, 5000, 'PREVENTIVA', 'Revisão periódica de 5.000 km, regulagem de corrente e lubrificação.', 180.00, '2026-09-10', 10000, 'Oficina Especializada MotoCenter'),
(3, 7, 40000, 'REVISAO_PERIODICA', 'Revisão preventiva periódica de freios a ar e suspensão do caminhão.', 1250.00, '2026-07-20', 50000, 'Truck Diesel Service')
ON DUPLICATE KEY UPDATE descricao = VALUES(descricao);

-- Notificações 24h
INSERT INTO ae_notificacoes_fila (id, aluno_id, tipo, canal_destino, assunto, mensagem, data_programada, status, enviado_em, resposta_api) VALUES
(1, 3, 'WHATSAPP', '(11) 97777-3333', 'Lembrete de Exame Prático DETRAN', 'Olá Marcos! Seu Exame Prático de Direção (Cat B) está agendado para amanhã às 09:30 no Pátio Oficial DETRAN. Leve seu RG e LADV originais.', NOW(), 'ENVIADO', NOW(), 'Entregue com sucesso via Evolution API'),
(2, 1, 'WHATSAPP', '(11) 97777-1111', 'Lembrete de Aula Prática Noturna', 'Olá Lucas! Sua aula prática noturna (Cat B) está confirmada para hoje às 19:00 com o instrutor Julio Cesar no veículo Chevrolet Onix.', NOW(), 'ENVIADO', NOW(), 'Entregue com sucesso via Evolution API')
ON DUPLICATE KEY UPDATE status = VALUES(status);

SET FOREIGN_KEY_CHECKS = 1;
