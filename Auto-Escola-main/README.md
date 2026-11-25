# 🚗 AutoEscola Pro - Sistema de Gestão Centralizada de CFC

Sistema Desktop de Gestão de Autoescola (Centro de Formação de Condutores - CFC), desenvolvido em **Electron**, **TypeScript (Strict)**, **Bootstrap 5** e **MySQL Local/Remoto**, em estrita conformidade com as resoluções vigentes do **CONTRAN (nº 789/2020)** e portarias do **DETRAN**.

O sistema foi concebido para substituir o controle caótico em planilhas por uma plataforma centralizada, segura e offline-first.

---

## 👥 Esquadrão Especialista de Desenvolvimento

O projeto é mantido e orquestrado por 6 agentes especialistas:

1. 📋 **Orquestrador & Scrum Master:** Gestão de Sprints, coordenação técnica e comunicação direta com o usuário (solicitação de autorização prévia para alterações).
2. 💻 **Engenheiro Back-End:** Arquitetura do processo principal do Electron, IPC Handlers tipados, ciclo de vida e concorrência desktop.
3. 🎨 **Especialista Front-End:** Interfaces ricas e responsivas em Bootstrap 5, feedback visual, máscaras de dados e ergonomia operacional.
4. 🔒 **Especialista em Segurança:** Auditoria contra vulnerabilidades, sanitização contra XSS (`escapeHtml`), isolamento de processo (`contextIsolation: true`, `sandbox: true`), proteção de credenciais e controle de acesso estrito.
5. 🗄️ **Especialista em Banco de Dados MySQL:** Modelagem relacional, transações ACID, triggers de capacidade e tabelas isoladas com prefixo seguro `ae_*`.
6. 🚦 **Especialista em Autoescola & DETRAN:** Validação das regras de trânsito (45h teóricas, cota de aulas noturnas, emissão de LADV, exames, taxas de reteste e alertas de chuva para motos).

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
* Node.js (v18+)
* NPM instalado
* Banco MySQL (local ou remoto configurado no `.env`)

### 1. Configurar o Banco de Dados
O arquivo `.env` na raiz do projeto contém as credenciais de acesso ao MySQL:
```env
DB_HOST=
DB_PORT=
DB_USER=
DB_PASSWORD=
DB_NAME=
```

Para aplicar o esquema e a carga inicial das tabelas `ae_*`, execute:
```bash
node scripts/setup-db.js
```

### 2. Compilar e Iniciar o Aplicativo Desktop
```bash
# Compilar TypeScript
npm run build

# Iniciar o aplicativo Electron
npm start

# Ou em modo de desenvolvimento direto:
npm run dev
```

---

## 🔐 Controle de Acesso e Credenciais

Em conformidade com o requisito de acesso restrito ao **Dono** e à **Equipe de Atendimento** (sem acesso para instrutores):

| Perfil | Usuário | Senha Padrão | Permissões |
|---|---|---|---|
| **Dono (Administrador Geral)** | `admin` | `admin123` | Acesso total: relatórios, frota, instrutores, turmas, alunos e exames |
| **Secretária de Atendimento** | `atendimento` | `atendimento123` | Gestão operacional: matrículas, agendamento de aulas e exames |

---

## 📋 Funcionalidades Implementadas (`Requisitos.txt`)

- [x] **Cadastros Completos e Expansíveis:** Alunos, Veículos da Frota e Instrutores (5 teóricos, 10 práticos, 2 para pesados Cat C/D/E).
- [x] **Importador Universal CSV:** Importação individual e em lote para alunos, instrutores e frota com validação algorítmica de CPF, RENACH e Placas.
- [x] **Agendamento Inteligente sem Conflitos:** Gestão das 2 salas teóricas com bloqueio rígido de 20 alunos por turma (via Trigger MySQL e validação em memória).
- [x] **Controle de Aulas e Carga Horária DETRAN:** Contabilização das 45h teóricas obrigatórias e cota de aulas práticas noturnas (após as 18h).
- [x] **Gestão de Frota e Manutenção:** Odômetro dinâmico com acréscimo de 15 km por aula e alerta preventivo de revisão a cada 10.000 km.
- [x] **Gestão de Exames e Retestes:** Agendamento de exames teóricos (turma) e práticos (individual), lançamento de notas e controle de taxa de reteste (R$ 120,00).
- [x] **Notificações Automáticas 24h:** Rotina de envio de lembretes aos alunos com 1 dia de antecedência via WhatsApp e E-mail.
- [x] **Alerta Meteorológico (Previsão do Tempo):** Monitoramento de chuva para aulas de Categoria A (Motocicleta) com recomendação de reagendamento.
- [x] **Arquitetura Offline-First & Resiliente:** Operação conectada ao MySQL e fallback seguro em memória quando offline.
- [x] **Segurança Blindada:** Sanitização contra XSS, tela de login obrigatória e isolamento total via `contextBridge`.
