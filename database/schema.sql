-- =====================================================================
-- ESQUEMA DO BANCO DE DADOS MYSQL - SISTEMA DE GESTÃO DE AUTOESCOLA (CFC)
-- Especialista em Banco de Dados: database_mysql
-- DIRETRIZ CRÍTICA: Todas as tabelas utilizam o prefixo ae_ para conviver
-- de forma segura com outros projetos no mesmo banco de dados.
-- Compatível com MySQL 8.0+ / MariaDB 10.5+
-- =====================================================================

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
    horas_teoricas_cumpridas INT NOT NULL DEFAULT 0,
    horas_praticas_cumpridas INT NOT NULL DEFAULT 0,
    horas_noturnas_cumpridas INT NOT NULL DEFAULT 0,
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
        'LEGISLACAO_TRANSITO',       -- 18h
        'DIRECAO_DEFENSIVA',         -- 16h
        'PRIMEIROS_SOCORROS',        -- 4h
        'MEIO_AMBIENTE_CIDADANIA',   -- 4h
        'MECANICA_BASICA'            -- 3h
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
    data_programada DATETIME NOT NULL COMMENT 'Programado para 24h antes do evento',
    status ENUM('PENDENTE', 'ENVIADO', 'FALHA', 'CANCELADO') NOT NULL DEFAULT 'PENDENTE',
    tentativas INT NOT NULL DEFAULT 0,
    enviado_em DATETIME NULL,
    resposta_api TEXT NULL,
    FOREIGN KEY (aluno_id) REFERENCES ae_alunos(id) ON DELETE CASCADE,
    INDEX idx_ae_notif_status_programada (status, data_programada)
) ENGINE=InnoDB;

-- 14. Trigger para Validação Rígida de Limite de 20 Alunos por Turma Teórica
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
