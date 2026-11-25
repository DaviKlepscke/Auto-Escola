# 🗄️ Modelo Entidade-Relacionamento (DER) - MySQL
### Sistema de Gestão de Autoescola
**Autor:** Agente Especialista em Banco de Dados (`database_mysql`)  
**Scripts:** [database/schema.sql](file:///C:/Users/bsant/Downloads/Auto-Escola-main/database/schema.sql) | [database/seeds.sql](file:///C:/Users/bsant/Downloads/Auto-Escola-main/database/seeds.sql) | [database/banco-completo.sql](file:///C:/Users/bsant/Downloads/Auto-Escola-main/database/banco-completo.sql) | [scripts/setup-db.js](file:///C:/Users/bsant/Downloads/Auto-Escola-main/scripts/setup-db.js)

> [!IMPORTANT]
> **Isolamento de Banco Compartilhado:** Todas as tabelas deste projeto utilizam estritamente o prefixo **`ae_`** para garantir que outras tabelas de outros projetos escolares coexistindo na mesma base de dados não sofram interferência ou perda acidental.

---

## 📊 Diagrama ER (Mermaid) - Tabelas com Prefixo `ae_`

```mermaid
erDiagram
    ae_usuarios {
        int id PK
        string nome
        string login UK
        string senha_hash
        enum perfil
        boolean ativo
    }

    ae_alunos {
        int id PK
        string nome
        string cpf UK
        string rg
        string renach UK
        date data_nascimento
        string telefone
        string email
        enum categoria_pretendida
        enum status_processo
    }

    ae_instrutores {
        int id PK
        string nome
        string cpf UK
        string credencial_detran UK
        enum tipo
        boolean habilita_veiculos_pesados
        boolean ativo
    }

    ae_veiculos {
        int id PK
        string placa UK
        string modelo
        int ano
        enum categoria
        int km_atual
        int km_ultima_revisao
        int intervalo_revisao_km
        enum status
    }

    ae_salas_teoricas {
        int id PK
        string nome UK
        int capacidade_maxima
        boolean ativa
    }

    ae_turmas_teoricas {
        int id PK
        string codigo UK
        int sala_id FK
        int instrutor_id FK
        date data_inicio
        date data_fim
        time horario_inicio
        time horario_fim
        enum status
    }

    ae_matriculas_turma {
        int id PK
        int turma_id FK
        int aluno_id FK
        timestamp data_matricula
        enum status
    }

    ae_aulas_praticas {
        int id PK
        int aluno_id FK
        int instrutor_id FK
        int veiculo_id FK
        enum categoria
        date data_aula
        time horario_inicio
        time horario_fim
        boolean eh_noturna
        enum status
        boolean alerta_chuva
    }

    ae_exames {
        int id PK
        int aluno_id FK
        enum tipo
        enum categoria
        int veiculo_id FK
        date data_exame
        time horario
        enum status
        boolean eh_reteste
        boolean taxa_reteste_paga
    }

    ae_salas_teoricas ||--o{ ae_turmas_teoricas : "abriga (máx 20)"
    ae_instrutores ||--o{ ae_turmas_teoricas : "ministra"
    ae_turmas_teoricas ||--o{ ae_matriculas_turma : "contém"
    ae_alunos ||--o{ ae_matriculas_turma : "matricula-se"
    ae_alunos ||--o{ ae_aulas_praticas : "realiza"
    ae_instrutores ||--o{ ae_aulas_praticas : "conduz"
    ae_veiculos ||--o{ ae_aulas_praticas : "utiliza"
    ae_alunos ||--o{ ae_exames : "presta"
    ae_veiculos ||--o{ ae_exames : "veículo de prova"
```

---

## 🔒 Mecanismos de Prevenção de Conflitos e Integridade
1. **Trigger `trg_ae_valida_capacidade_turma`:** Bloqueia automaticamente a inserção de mais de 20 alunos por turma na sala teórica.
2. **Índices Compostos de Concorrência:**
   - Prevenção de sobreposição de instrutor em horários idênticos (`idx_ae_pratica_instrutor_horario`).
   - Prevenção de alocação dupla de veículos no mesmo horário (`idx_ae_pratica_veiculo_horario`).
   - Prevenção de marcação simultânea para o mesmo aluno (`idx_ae_pratica_aluno_horario`).
3. **Auditoria e Histórico:**
   - Tabelas `ae_manutencoes_veiculo` para histórico de revisões e `ae_notificacoes_fila` para mensageria com 1 dia de antecedência.
