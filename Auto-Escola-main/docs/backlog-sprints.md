# 📅 Backlog e Planejamento de Sprints - Sistema de Gestão de Autoescola

Este documento consolida a quebra ágil dos requisitos do projeto (`Requisitos.txt`) em Sprints menores, planejadas pelo **Agente Orquestrador (Scrum Master)** em conjunto com os especialistas.

---

## 🗺️ Visão Geral das Sprints

```
[Sprint 0: Fundação Arquitetural & Regras] 
       │
       ▼
[Sprint 1: Cadastros Essenciais & Frota]
       │
       ▼
[Sprint 2: Agendamento Inteligente & Controle de Turmas/Aulas]
       │
       ▼
[Sprint 3: Gestão de Exames & Reteste]
       │
       ▼
[Sprint 4: Integrações Externas (Spring Boot, WhatsApp, Clima)]
       │
       ▼
[Sprint 5: Empacotamento Desktop, Offline-First & Homologação]
```

---

## 📌 Detalhamento das Sprints

### 🔹 Sprint 0: Fundação Arquitetural, Banco de Dados e Regras DETRAN
* **Objetivo:** Estabelecer a base técnica segura do Electron com TypeScript, o esquema relacional em MySQL e o levantamento formal das regras de negócio do DETRAN.
* **Tarefas:**
  1. `autoescola_expert`: Especificar detalhadamente o fluxo do aluno (1ª Habilitação, Mudança/Adição de Categoria, 45h teóricas, aulas noturnas, critérios de exames e reteste).
  2. `database_mysql`: Modelar o DER inicial e gerar scripts DDL com chaves estrangeiras, índices de concorrência e constraints no MySQL.
  3. `electron_core`: Inicializar o projeto Electron com TypeScript estrito, arquitetura modular, `contextIsolation: true`, Preload com `contextBridge` e CSP rigoroso.
  4. `frontend_electron`: Integrar Bootstrap 5, criar o layout base do sistema desktop (restrito ao Dono/Atendimento) e utilitários de validação/máscaras (CPF, RENACH, Placas).
  5. `springboot_api`: Estruturar o projeto Spring Boot 3 base para o microsserviço de integrações externas.

---

### 🔹 Sprint 1: Cadastros Essenciais, Gestão da Frota, Validações & Importação CSV
* **Objetivo:** Permitir o cadastro individual e em lote (via importação de arquivos CSV) de Alunos, Instrutores e Veículos da frota, com validações algorítmicas rigorosas e alertas preventivos de manutenção.
* **Tarefas:**
  1. `frontend_electron`: Telas de cadastro, edição e listagem com filtros dinâmicos por status e categoria.
  2. `autoescola_expert`: Validação das regras de instrutores (credenciamento DETRAN, pesados) e categorias de habilitação.
  3. `database_mysql`: CRUD seguro e operações em lote (Batch Insert) para importações em massa com rollback em caso de falha.
  4. `electron_core`: Módulo de cálculo de quilometragem e alertas automáticos de revisão preventiva veicular.
  5. `frontend_electron` & `electron_core`: **Módulo Universal de Importação CSV** (com parser, modal de upload, validação linha a linha, preview de erros e modelos de exemplo para Alunos, Instrutores e Veículos).

---

### 🔹 Sprint 2: Agendamento Inteligente, Turmas Teóricas e Aulas Práticas
* **Objetivo:** Implementar o motor de agendamento com bloqueio rigoroso de conflitos de horários e gestão das 2 salas físicas e veículos.
* **Tarefas:**
  1. `autoescola_expert`: Definição das regras de agendamento (limite máximo de 20 alunos por turma teórica, 2 salas físicas, exigência de aulas noturnas).
  2. `database_mysql`: Queries transacionais com bloqueio pessimista/otimista e índices para verificação de sobreposição de horários (aluno, instrutor, sala, veículo).
  3. `frontend_electron`: Calendário e grade de agendamento ergonômica com bloqueio visual ao atingir capacidade máxima da sala ou choque de horário.
  4. `electron_core`: Lógica de controle de presença/faltas e contabilização da carga horária obrigatória para o DETRAN.

---

### 🔹 Sprint 3: Gestão de Exames, Resultados e Retestes
* **Objetivo:** Gerenciar o ciclo de exames teóricos e práticos, acompanhamento de resultados e repetições em caso de reprovação.
* **Tarefas:**
  1. `autoescola_expert`: Regras para agendamento de exame teórico (em turma) e prático (individual), prazos legais para novo exame após reprovação e taxas de reteste.
  2. `database_mysql`: Modelagem e persistência de histórico de exames, status (Aprovado / Reprovado / Ausente) e pendências financeiras de reteste.
  3. `frontend_electron`: Painel de exames com filtros por data, turma e status, além de modal para lançamento de resultado e reagendamento assistido.
  4. `electron_core`: Validação que impede agendamento de exame prático sem a conclusão e aprovação teórica e cumprimento das aulas práticas/noturnas.

---

### 🔹 Sprint 4: Microsserviço Spring Boot, Mensageria e Previsão do Tempo
* **Objetivo:** Conectar a aplicação desktop ao serviço Spring Boot para automatizar avisos e monitorar condições meteorológicas.
* **Tarefas:**
  1. `springboot_api`: Criar endpoint de integração com API de Clima (ex: OpenWeather) para alertas de chuva em tempo real.
  2. `springboot_api`: Criar agendador de tarefas (Cron) para envio de notificações automáticas via WhatsApp e E-mail com 1 dia de antecedência.
  3. `autoescola_expert`: Parametrização da regra de alerta/sugestão de reagendamento para aulas práticas de motocicleta (Categoria A) sob risco de chuva forte.
  4. `electron_core`: Comunicação assíncrona entre o app desktop e a API Spring Boot.
  5. `frontend_electron`: Visualização de avisos meteorológicos na agenda e histórico de disparos de lembretes.

---

### 🔹 Sprint 5: Empacotamento Desktop, Concorrência e Homologação
* **Objetivo:** Gerar instaladores executáveis para Windows e macOS, garantir estabilidade local (*offline-first*) e alta performance em acessos concorrentes.
* **Tarefas:**
  1. `electron_core`: Configuração do Electron Builder para Windows (`.exe`) e macOS (`.dmg`), com configuração do instalador local.
  2. `database_mysql`: Testes de estresse com agendamentos simultâneos, rotina de backup/exportação de dados com 1 clique.
  3. `scrum_orchestrator`: Revisão final de todos os critérios de aceitação com base em `Requisitos.txt` e entrega para homologação.
