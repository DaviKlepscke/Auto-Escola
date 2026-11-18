# 📘 Especificação de Regras de Negócio e Diretrizes DETRAN/CONTRAN
### Sistema de Gestão para Centro de Formação de Condutores (CFC)
**Autor:** Agente Especialista em Autoescola (`autoescola_expert`)  
**Versão:** 1.0  
**Status:** Aprovado para Implementação (Sprint 0)

---

## 1. Processos de Habilitação (Resoluções CONTRAN nº 789/2020 e vigentes)

### 1.1 Categorias Atendidas
* **Categoria A:** Veículos motorizados de duas ou três rodas (motocicletas, motonetas, ciclomotores).
* **Categoria B:** Veículos motorizados de até 8 lugares (excluído o motorista) e peso bruto total (PBT) até 3.500 kg (automóveis de passeio).
* **Categoria AB:** Combinação simultânea das categorias A e B.
* **Categorias C, D e E (Veículos Pesados):**
  * **Cat C:** Carga > 3.500 kg (caminhões). Exige 1 ano de Cat B.
  * **Cat D:** Transporte de passageiros > 8 lugares (ônibus/vans). Exige 21 anos e 2 anos de Cat B ou 1 ano de Cat C.
  * **Cat E:** Combinações de veículos com unidade acoplada > 6.000 kg (carretas, articulados). Exige 21 anos e 1 ano de Cat C ou D.

### 1.2 Fluxo Sequencial Obrigatório do Aluno (Esteira DETRAN)
1. **Cadastro e Abertura do RENACH (Registro Nacional de Carteira de Habilitação):**
   - CPF único, dados biométricos, número RENACH gerado pelo DETRAN.
2. **Exames Preliminares:**
   - Exame de Aptidão Física e Mental (Médico).
   - Avaliação Psicológica (Psicotécnico) - obrigatório para 1ª habilitação e exercício de atividade remunerada (EAR).
   - *Regra do Sistema:* O aluno **NÃO** pode iniciar aulas teóricas sem o status "Apto" nos exames médico e psicotécnico.
3. **Curso Teórico-Técnico (45 horas/aula):**
   - Carga horária total de 45 horas/aula (50 minutos por aula).
   - Composição curricular:
     - **Legislação de Trânsito:** 18 h/a
     - **Direção Defensiva:** 16 h/a
     - **Primeiros Socorros:** 4 h/a
     - **Meio Ambiente e Cidadania:** 4 h/a
     - **Mecânica Básica de Veículos:** 3 h/a
   - *Frequência Obrigatória:* Frequência mínima exigida de 100% ou reposição integral das aulas com falta justificada.
4. **Exame Teórico-Técnico (DETRAN):**
   - Prova teórica (mínimo de 30 questões, exigência de 70% de acertos para aprovação = 21 pontos).
   - O agendamento ocorre em turmas no DETRAN ou posto credenciado.
5. **Licença de Aprendizagem de Direção Veicular (LADV):**
   - Emitida somente após aprovação no exame teórico.
   - O aluno **NÃO** pode realizar nenhuma aula prática sem LADV ativa vinculada à autoescola.
6. **Curso de Prática de Direção Veicular:**
   - Carga horária prática mínima conforme categoria.
   - **Exigência de Aulas Noturnas:** É obrigatório o cumprimento da cota legal de aulas no período noturno (após as 18h) antes da liberação para exame prático.
7. **Exame Prático de Direção Veicular:**
   - Realizado individualmente por examinadores do DETRAN em veículo da categoria com duplo comando de freios e embreagem.

---

## 2. Regras de Turmas Teóricas e Capacidade Física
* **Salas Físicas Disponíveis:** O sistema gerencia exatamente **2 salas teóricas** (Sala 1 e Sala 2).
* **Capacidade Máxima por Turma:** Rígido em **20 alunos por turma/sala** (bloqueio automático de novas matrículas no sistema).
* **Instrutor Teórico:** Um instrutor teórico só pode estar alocado em 1 sala por horário.
* **Conflito de Grade:** O sistema não permite sobreposição de horários entre salas e turmas distintas ministradas pelo mesmo instrutor.

---

## 3. Regras da Frota e Alocação de Instrutores

### 3.1 Quadro de Instrutores
* **Capacidade Inicial:**
  * 5 Instrutores Teóricos (credenciados pelo DETRAN com curso de formação de instrutor).
  * 10 Instrutores Práticos para veículos leves (Cat A e B).
  * 2 Instrutores Práticos habilitados especificamente para veículos grandes/pesados (Cat C, D e E).
* **Expansão:** O sistema deve suportar expansão ilimitada de instrutores, mantendo a parametrização de suas especialidades.

### 3.2 Manutenção Preventiva da Frota
* Todo veículo cadastrado possui: Placa, Modelo, Ano, Categoria correspondente, KM Atual, KM da Última Revisão e Intervalo de Revisão (padrão a cada 10.000 km).
* **Alerta Visual:** Quando `KM_Atual >= (KM_Ultima_Revisao + Intervalo_Revisao - 1.000)`, o sistema emite alerta preventivo de "Revisão Próxima".
* Se o KM ultrapassar a meta, o veículo entra em status "Manutenção Pendente", bloqueando novos agendamentos práticos.

---

## 4. Gestão de Exames, Resultados e Reteste

### 4.1 Tipos de Exame
1. **Teórico:** Agendamento coletivo em turmas.
2. **Prático:** Agendamento individualizado por aluno, data, horário, instrutor acompanhante e veículo oficial da categoria.

### 4.2 Reprovação e Reteste
* Caso o aluno seja **Reprovado**:
  - O sistema registra o status "REPROVADO" com data e motivo.
  - É gerada uma **Taxa de Reteste** pendente no cadastro do aluno.
  - O agendamento de novo exame respeita o prazo regulamentar do DETRAN e exige confirmação do pagamento da taxa de reteste.
  - Recomendação automática de pacote de aulas práticas complementares de reforço.

---

## 5. Regras de Segurança, Notificação e Clima

### 5.1 Alerta Meteorológico (Previsão do Tempo)
* **Categoria A (Motocicleta):** Aulas práticas sob chuva intensa ou tempestade representam risco grave de acidentes e infração de segurança operacional.
* **Ação do Sistema:** O sistema consulta a previsão do tempo para a data e horário das aulas práticas de Cat A. Havendo alerta de chuva superior a 60% ou chuva moderada/forte, emite alerta de sugestão de reagendamento prioritário sem custos para o aluno.

### 5.2 Notificações Automáticas com 1 Dia de Antecedência
* O sistema dispara lembretes via **WhatsApp** e **E-mail** 24 horas antes:
  * De cada aula teórica ou prática agendada (informando sala/veículo e instrutor).
  * De exames teóricos e práticos (informando local, documentos obrigatórios e RG/LADV original).

---

## 6. Controle de Acesso e Perfis (Segurança Desktop)
* **Acesso Restrito:** O software desktop é de uso exclusivo do **Dono (Administrador Geral)** e da **Equipe de Atendimento/Secretaria**.
* Instrutores não possuem credenciais de acesso ao software desktop. Todas as marcações de presença, faltas e relatórios de veículos são alimentadas pelos atendentes com base nas fichas diárias e relatórios do CFC.
* O sistema opera em modo **offline-first**: todos os cadastros, agendamentos e regras funcionam diretamente no banco de dados MySQL local.
