-- =====================================================================
-- CARGA INICIAL DE DADOS (SEEDS) - TABELAS PREFIXADAS COM ae_
-- =====================================================================

-- 1. Usuários Padrão (Dono e Atendimento)
INSERT INTO ae_usuarios (nome, login, senha_hash, perfil) VALUES
('Dono da Autoescola', 'admin', '$2a$12$e68N30M0B7qI1Y4GfM6uG.Z3mJv6eFzLgU7QY7zCskwUuRHzqN1Vq', 'DONO_ADMIN'),
('Secretária de Atendimento', 'atendimento', '$2a$12$KjY53o2hE1x0gK0sA8W3K.dGZ1sL5sX0Q6vR8sC7o9tY4zP3uK1L2', 'ATENDIMENTO')
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- 2. Salas Teóricas Físicas (Exatamente 2 Salas, limite 20 alunos)
INSERT INTO ae_salas_teoricas (nome, capacidade_maxima, ativa) VALUES
('Sala Teórica 1', 20, TRUE),
('Sala Teórica 2', 20, TRUE)
ON DUPLICATE KEY UPDATE capacidade_maxima = 20;

-- 3. Quadro de Instrutores Inicial (5 Teóricos, 10 Práticos, 2 para Veículos Grandes)
-- 5 Instrutores Teóricos:
INSERT INTO ae_instrutores (nome, cpf, credencial_detran, telefone, email, tipo, habilita_veiculos_pesados) VALUES
('Carlos Eduardo Silva', '111.222.333-01', 'DETRAN-TEO-001', '(11) 98111-0001', 'carlos.teo@cfc.com', 'TEORICO', FALSE),
('Mariana Souza Lima', '111.222.333-02', 'DETRAN-TEO-002', '(11) 98111-0002', 'mariana.teo@cfc.com', 'TEORICO', FALSE),
('Roberto Antunes Dias', '111.222.333-03', 'DETRAN-TEO-003', '(11) 98111-0003', 'roberto.teo@cfc.com', 'TEORICO', FALSE),
('Fernanda Castro', '111.222.333-04', 'DETRAN-TEO-004', '(11) 98111-0004', 'fernanda.teo@cfc.com', 'TEORICO', FALSE),
('Paulo Henrique Ramos', '111.222.333-05', 'DETRAN-TEO-005', '(11) 98111-0005', 'paulo.teo@cfc.com', 'TEORICO', FALSE),

-- 10 Instrutores Práticos:
('Julio Cesar Mendes', '222.333.444-01', 'DETRAN-PRA-001', '(11) 98222-0001', 'julio.pra@cfc.com', 'PRATICO', FALSE),
('Camila Rodrigues', '222.333.444-02', 'DETRAN-PRA-002', '(11) 98222-0002', 'camila.pra@cfc.com', 'PRATICO', FALSE),
('Marcos Vinicius', '222.333.444-03', 'DETRAN-PRA-003', '(11) 98222-0003', 'marcos.pra@cfc.com', 'PRATICO', FALSE),
('Patricia Alcantara', '222.333.444-04', 'DETRAN-PRA-004', '(11) 98222-0004', 'patricia.pra@cfc.com', 'PRATICO', FALSE),
('Rodrigo Bueno', '222.333.444-05', 'DETRAN-PRA-005', '(11) 98222-0005', 'rodrigo.pra@cfc.com', 'PRATICO', FALSE),
('Beatriz Nogueira', '222.333.444-06', 'DETRAN-PRA-006', '(11) 98222-0006', 'beatriz.pra@cfc.com', 'PRATICO', FALSE),
('Fabio Guimarães', '222.333.444-07', 'DETRAN-PRA-007', '(11) 98222-0007', 'fabio.pra@cfc.com', 'PRATICO', FALSE),
('Aline Duarte', '222.333.444-08', 'DETRAN-PRA-008', '(11) 98222-0008', 'aline.pra@cfc.com', 'PRATICO', FALSE),
('Renato Ribeiro', '222.333.444-09', 'DETRAN-PRA-009', '(11) 98222-0009', 'renato.pra@cfc.com', 'PRATICO', FALSE),
('Tatiane Farias', '222.333.444-10', 'DETRAN-PRA-010', '(11) 98222-0010', 'tatiane.pra@cfc.com', 'PRATICO', FALSE),

-- 2 Instrutores para Veículos Grandes (Cat C, D e E):
('Valmir Santos (Pesados)', '333.444.555-01', 'DETRAN-PES-001', '(11) 98333-0001', 'valmir.pesados@cfc.com', 'PRATICO', TRUE),
('Antonio Carlos (Pesados)', '333.444.555-02', 'DETRAN-PES-002', '(11) 98333-0002', 'antonio.pesados@cfc.com', 'PRATICO', TRUE)
ON DUPLICATE KEY UPDATE nome = VALUES(nome);

-- 4. Frota de Veículos Inicial
INSERT INTO ae_veiculos (placa, modelo, ano, categoria, km_atual, km_ultima_revisao, intervalo_revisao_km, status) VALUES
('BRA1A23', 'Honda CG 160 Fan', 2024, 'A', 4500, 0, 5000, 'DISPONIVEL'),
('BRA2B34', 'Yamaha Fazer 150', 2023, 'A', 9200, 5000, 5000, 'ALERTA_REVISAO'),
('BRA3C45', 'Chevrolet Onix 1.0', 2023, 'B', 18500, 10000, 10000, 'ALERTA_REVISAO'),
('BRA4D56', 'Hyundai HB20 1.0', 2024, 'B', 8200, 0, 10000, 'DISPONIVEL'),
('BRA5E67', 'Volkswagen Polo 1.0', 2024, 'B', 3100, 0, 10000, 'DISPONIVEL'),
('BRA6F78', 'Fiat Argo 1.0', 2023, 'B', 20500, 20000, 10000, 'DISPONIVEL'),
('BRA7G89', 'Caminhão VW Delivery 9.170 (Cat C)', 2022, 'C', 45200, 40000, 10000, 'DISPONIVEL'),
('BRA8H90', 'Micro-ônibus Marcopolo Volare (Cat D)', 2021, 'D', 78900, 70000, 10000, 'ALERTA_REVISAO')
ON DUPLICATE KEY UPDATE modelo = VALUES(modelo);
