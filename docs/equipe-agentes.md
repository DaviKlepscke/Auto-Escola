# 🚗 Equipe de Agentes Especialistas - Sistema de Gestão de Autoescola

Este documento descreve os 6 agentes especialistas criados e configurados para o desenvolvimento do Sistema de Gestão da Autoescola (CFC), baseado nos requisitos do projeto (`Requisitos.txt`).

---

## 👥 Roster da Equipe

### 1. 🛡️ Especialista em Electron & TypeScript (`electron_core`)
* **Papel:** Arquiteto e Desenvolvedor Electron Core.
* **Foco Principal:**
  - Configuração do ambiente com TypeScript estrito (`strict: true`).
  - Segurança máxima desktop: `contextIsolation: true`, `nodeIntegration: false`, isolamento de sandbox e Content Security Policy (CSP).
  - Preload scripts seguros com `contextBridge` expondo apenas contratos de IPC estritamente tipados.
  - Arquitetura modular e em camadas (Main Process, Preload, Renderer, Repositories e Services).
  - Suporte à arquitetura *offline-first* para garantir estabilidade e disponibilidade contínua sem depender da internet.
  - Empacotamento e distribuição via instaladores para Windows (`.exe` / `.msi`) e macOS (`.dmg`).

---

### 2. 🎨 Especialista em Electron / Front-End (`frontend_electron`)
* **Papel:** Desenvolvedor Front-End Desktop & UI/UX.
* **Foco Principal:**
  - Estilização moderna e ergonômica utilizando **Bootstrap 5**.
  - Validação estrita de dados no Front-End antes de qualquer submissão:
    - Validação algorítmica e máscaras para CPF, CNPJ, Telefone, Placas (Mercosul e padrão antigo) e RENACH.
    - Feedback visual instantâneo aos operadores (classes `is-valid`, `is-invalid`, toasts, modais de confirmação).
    - Bloqueio de cliques duplos e estados de carregamento em submissões.
  - Visualização de Agendamentos e Calendários:
    - Controle visual da ocupação das 2 salas teóricas (bloqueio visual e alerta ao atingir 20 alunos por turma).
    - Visão clara por instrutor, veículo e sala, facilitando a rotina do dono e da equipe de atendimento.

---

### 3. 🗄️ Especialista em Banco de Dados MySQL (`database_mysql`)
* **Papel:** DBA e Modelador de Dados Relacional.
* **Foco Principal:**
  - Modelagem do esquema relacional normalizado para MySQL local (*offline-first*).
  - Modelagem das entidades:
    - **Alunos** (dados cadastrais, RENACH, categoria pretendida A/B/C/D/E, histórico médico/psicotécnico).
    - **Instrutores** (credenciamento DETRAN, especialidades: teóricos, práticos, pesados C/D/E, limite de horas).
    - **Veículos da Frota** (placa, modelo, categoria, KM atual, alertas de revisão preventiva periódica).
    - **Salas & Turmas** (2 salas teóricas físicas, capacidade máxima rígida de 20 alunos).
    - **Aulas & Presença** (aulas teóricas por disciplina, aulas práticas, presença/faltas, aulas noturnas obrigatórias).
    - **Exames** (teóricos em turma, práticos individuais, histórico de resultados e taxas de reteste).
  - Performance e Concorrência:
    - Índices compostos e transações ACID para prevenir concorrência e choque de horários em agendamentos simultâneos.
    - Scripts de migração, seeds e rotinas de backup e restauração local.

---

### 4. 🚦 Especialista em Sistemas de Autoescola & DETRAN (`autoescola_expert`)
* **Papel:** Especialista em Negócios de CFC e Legislação de Trânsito (CONTRAN/DETRAN).
* **Foco Principal:**
  - Garantia de conformidade com as resoluções vigentes do CONTRAN e portarias do DETRAN.
  - Fluxo das etapas de habilitação:
    - 1ª Habilitação (A, B ou AB), Mudança de Categoria (C, D, E) e Adição de Categoria.
    - Pré-requisitos sequenciais: Exame Médico/Psicotécnico -> Curso Teórico (45 h/a) -> Exame Teórico -> Curso Prático -> Exame Prático.
    - Divisão de matérias teóricas: Legislação (18h), Direção Defensiva (16h), Primeiros Socorros (4h), Meio Ambiente/Cidadania (4h) e Mecânica (3h).
    - Cumprimento rigoroso da cota de aulas noturnas antes da liberação para exame prático.
  - Regras de Exames e Reprovações:
    - Acompanhamento de datas e prazos mínimos legais para reteste (reprovação).
    - Cobrança de novas taxas de reteste e controle de aulas complementares recomendadas.
  - Validação de regras de negócios na contratação e alocação de instrutores (credencial ativa no Detran, instrutores práticos habilitados para veículos pesados).

---

### 5. ☕ Especialista em API Spring Boot Java (`springboot_api`)
* **Papel:** Arquiteto e Desenvolvedor Backend / Microsserviços de Integração.
* **Foco Principal:**
  - Desenvolvimento de API REST auxiliar em Java (Spring Boot 3 / Java 17 ou 21).
  - Módulos de Integração Externa:
    - **Previsão do Tempo (Weather API):** Monitoramento meteorológico em tempo real para disparar alertas e sugerir reagendamento automático de aulas práticas de motocicleta (Categoria A) em dias de chuva.
    - **Notificações Automáticas:** Envio programado com 1 dia de antecedência para os alunos (lembretes de aulas teóricas, práticas e exames) via WhatsApp e E-mail.
  - Arquitetura limpa com DTOs imutáveis, validações Jakarta, tratamento global de exceções e tolerância a falhas.

---

### 6. 📋 Agente Orquestrador & Scrum Master (`scrum_orchestrator`)
* **Papel:** Líder Ágil, Planejador de Sprints e Coordenador da Equipe.
* **Foco Principal:**
  - Decomposição dos requisitos do projeto em Sprints curtas, incrementais e focadas em valor.
  - Atribuição clara de tarefas para os especialistas adequados.
  - **REGRA DE OURO INVIOLÁVEL:** Sempre submeter ao usuário uma tabela resumida das ações propostas e **solicitar aprovação explícita** antes de qualquer execução técnica.
