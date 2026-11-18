// =====================================================================
// GERENCIADOR DE IMPORTAÇÃO CSV UNIVERSAL COM PRÉ-VALIDAÇÃO
// Especialistas: frontend_electron & electron_core
// =====================================================================

import { Validators } from './validators.js';

export const CSVManager = {
  // Modelos de Template de CSV para download do usuário
  templates: {
    alunos: {
      nomeArquivo: 'modelo_alunos.csv',
      cabecalho: 'nome,cpf,rg,renach,data_nascimento,telefone,email,categoria_pretendida',
      exemplo: [
        'Guilherme Alves Ribeiro,123.456.789-01,12.345.678-0,SP123456789,2003-04-12,(11) 98765-4321,guilherme@email.com,B',
        'Bruna Ferreira Costa,234.567.890-12,23.456.789-1,,2002-11-25,(11) 97654-3210,bruna@email.com,A',
        'Ricardo Dias Moreira,345.678.901-23,34.567.890-2,SP987654321,1998-07-08,(11) 96543-2109,ricardo@email.com,C'
      ]
    },
    instrutores: {
      nomeArquivo: 'modelo_instrutores.csv',
      cabecalho: 'nome,cpf,credencial_detran,telefone,email,tipo,habilita_veiculos_pesados',
      exemplo: [
        'Marcos Paulo Lima,456.789.012-34,DETRAN-PRA-020,(11) 95432-1098,marcos@cfc.com,PRATICO,false',
        'Ana Carolina Prado,567.890.123-45,DETRAN-TEO-021,(11) 94321-0987,ana@cfc.com,TEORICO,false',
        'Geraldo Alencar,678.901.234-56,DETRAN-PES-022,(11) 93210-9876,geraldo@cfc.com,PRATICO,true'
      ]
    },
    veiculos: {
      nomeArquivo: 'modelo_veiculos.csv',
      cabecalho: 'placa,modelo,ano,categoria,km_atual,km_ultima_revisao,intervalo_revisao_km',
      exemplo: [
        'BRA9J12,Renault Kwid 1.0,2024,B,3200,0,10000',
        'BRA1K23,Yamaha Factor 125,2023,A,6500,5000,5000',
        'BRA2L34,Caminhão Ford Cargo 816,2021,C,58000,50000,10000'
      ]
    }
  },

  baixarTemplate(tipo) {
    const t = this.templates[tipo];
    if (!t) return;
    const conteudo = [t.cabecalho, ...t.exemplo].join('\n');
    const blob = new Blob([conteudo], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', t.nomeArquivo);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  /**
   * Parser robusto de CSV suportando separadores por vírgula ou ponto-e-vírgula
   */
  parseCSVText(texto) {
    const linhas = texto.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
    if (linhas.length < 2) return [];

    // Detectar delimitador (vírgula ou ponto e vírgula)
    const primeiraLinha = linhas[0];
    const delimitador = primeiraLinha.includes(';') ? ';' : ',';

    const colunas = primeiraLinha.split(delimitador).map(c => c.trim().toLowerCase());
    const registros = [];

    for (let i = 1; i < linhas.length; i++) {
      const valores = linhas[i].split(delimitador).map(v => v.trim());
      const obj = {};
      colunas.forEach((col, idx) => {
        obj[col] = valores[idx] || '';
      });
      registros.push({ linhaNum: i + 1, dados: obj });
    }
    return registros;
  },

  /**
   * Validação de registros parseados por tipo de entidade
   */
  validarRegistros(tipo, registros) {
    const analisados = [];

    for (const item of registros) {
      const d = item.dados;
      const erros = [];

      if (tipo === 'alunos') {
        if (!d.nome || d.nome.length < 3) erros.push('Nome muito curto ou vazio');
        if (!Validators.validarCPF(d.cpf)) erros.push('CPF inválido');
        if (!d.rg) erros.push('RG não informado');
        if (d.renach && !Validators.validarRenach(d.renach)) erros.push('RENACH inválido');
        if (!Validators.validarIdadeMinima(d.data_nascimento, d.categoria_pretendida || 'B')) erros.push('Idade mínima não atingida');
        if (!Validators.validarTelefone(d.telefone)) erros.push('Telefone inválido');
        if (!Validators.validarEmail(d.email)) erros.push('E-mail inválido');
        if (!['A', 'B', 'AB', 'C', 'D', 'E'].includes(d.categoria_pretendida?.toUpperCase())) erros.push('Categoria CNH inválida (use A, B, AB, C, D ou E)');

        analisados.push({
          linha: item.linhaNum,
          valido: erros.length === 0,
          erros,
          dadosNormalizados: {
            nome: d.nome,
            cpf: Validators.mascaraCPF(d.cpf),
            rg: d.rg,
            renach: d.renach || undefined,
            data_nascimento: d.data_nascimento,
            telefone: Validators.mascaraTelefone(d.telefone),
            email: d.email,
            categoria_pretendida: d.categoria_pretendida?.toUpperCase() || 'B',
            status_processo: 'PRE_CADASTRO'
          }
        });
      } else if (tipo === 'instrutores') {
        if (!d.nome || d.nome.length < 3) erros.push('Nome muito curto');
        if (!Validators.validarCPF(d.cpf)) erros.push('CPF inválido');
        if (!d.credencial_detran) erros.push('Credencial DETRAN obrigatória');
        if (!Validators.validarTelefone(d.telefone)) erros.push('Telefone inválido');
        const tipoInst = d.tipo?.toUpperCase();
        if (!['TEORICO', 'PRATICO', 'AMBOS'].includes(tipoInst)) erros.push('Tipo inválido (TEORICO, PRATICO ou AMBOS)');

        const habilitaPesados = String(d.habilita_veiculos_pesados).toLowerCase() === 'true' || d.habilita_veiculos_pesados === '1';

        analisados.push({
          linha: item.linhaNum,
          valido: erros.length === 0,
          erros,
          dadosNormalizados: {
            nome: d.nome,
            cpf: Validators.mascaraCPF(d.cpf),
            credencial_detran: d.credencial_detran,
            telefone: Validators.mascaraTelefone(d.telefone),
            email: d.email || undefined,
            tipo: tipoInst || 'PRATICO',
            habilita_veiculos_pesados: habilitaPesados,
            ativo: true
          }
        });
      } else if (tipo === 'veiculos') {
        if (!Validators.validarPlaca(d.placa)) erros.push('Placa veicular inválida');
        if (!d.modelo) erros.push('Modelo obrigatório');
        const ano = parseInt(d.ano, 10);
        if (isNaN(ano) || ano < 1990) erros.push('Ano inválido');
        if (!['A', 'B', 'C', 'D', 'E'].includes(d.categoria?.toUpperCase())) erros.push('Categoria do veículo inválida');

        analisados.push({
          linha: item.linhaNum,
          valido: erros.length === 0,
          erros,
          dadosNormalizados: {
            placa: d.placa.toUpperCase().trim(),
            modelo: d.modelo,
            ano: ano || new Date().getFullYear(),
            categoria: d.categoria?.toUpperCase() || 'B',
            km_atual: parseInt(d.km_atual, 10) || 0,
            km_ultima_revisao: parseInt(d.km_ultima_revisao, 10) || 0,
            intervalo_revisao_km: parseInt(d.intervalo_revisao_km, 10) || 10000,
            status: 'DISPONIVEL'
          }
        });
      }
    }

    return analisados;
  }
};
