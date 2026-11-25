// =====================================================================
// UTILITÁRIO DE MIGRAÇÃO E CARGA DO MYSQL LOCAL / REMOTO
// Especialista em Banco de Dados: database_mysql
// DIRETRIZ CRÍTICA: Opera exclusivamente sobre as tabelas com prefixo ae_
// utilizando as credenciais do arquivo .env sem afetar outras tabelas.
// =====================================================================

const fs = require('fs');
const path = require('path');

let mysql;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  console.log('[Script] mysql2 não encontrado na pasta raiz, tentando carregar do cache...');
}

function carregarEnv() {
  const envPath = path.join(__dirname, '../.env');
  const config = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'autoescola',
    port: Number(process.env.DB_PORT) || 3306
  };

  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf-8').split(/\r?\n/);
    for (const l of lines) {
      const trimmed = l.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [k, ...v] = trimmed.split('=');
      const val = v.join('=').trim();
      if (k === 'DB_HOST') config.host = val;
      if (k === 'DB_PORT') config.port = Number(val) || 3306;
      if (k === 'DB_USER') config.user = val;
      if (k === 'DB_PASSWORD') config.password = val;
      if (k === 'DB_NAME') config.database = val;
    }
  }
  return config;
}

async function executarMigracao() {
  if (!mysql) {
    console.error('[ERRO] O módulo mysql2 precisa estar instalado para rodar este script.');
    return;
  }

  const cfg = carregarEnv();
  console.log(`[Migração] Conectando ao MySQL ${cfg.user}@${cfg.host}:${cfg.port}/${cfg.database}...`);

  try {
    const conn = await mysql.createConnection({
      host: cfg.host,
      port: cfg.port,
      user: cfg.user,
      password: cfg.password,
      database: cfg.database,
      multipleStatements: true,
      connectTimeout: 8000
    });

    console.log('[Migração] Conexão bem-sucedida! Verificando tabelas existentes com prefixo ae_...');
    const [tabelasAntes] = await conn.query("SHOW TABLES LIKE 'ae_%'");
    console.log(`[Migração] Tabelas ae_* encontradas previamente: ${tabelasAntes.length}`);

    // 1. Executar Schema (DDL e Triggers)
    console.log('[Migração] Executando database/schema.sql...');
    const schemaSql = fs.readFileSync(path.join(__dirname, '../database/schema.sql'), 'utf-8');
    if (schemaSql.includes('DELIMITER')) {
      const dropTriggerIdx = schemaSql.indexOf('DROP TRIGGER IF EXISTS trg_ae_valida_capacidade_turma');
      const ddlPart = schemaSql.substring(0, dropTriggerIdx).trim();
      await conn.query(ddlPart);

      await conn.query('DROP TRIGGER IF EXISTS trg_ae_valida_capacidade_turma');
      const triggerIdx = schemaSql.indexOf('CREATE TRIGGER trg_ae_valida_capacidade_turma');
      const triggerBody = schemaSql.substring(triggerIdx)
        .replace(/END\/\/\s*DELIMITER\s*;/gi, 'END')
        .replace(/DELIMITER\s*;/gi, '')
        .trim();
      await conn.query(triggerBody);
    } else {
      await conn.query(schemaSql);
    }
    console.log('[Migração] Schema (tabelas ae_* e triggers) aplicado com sucesso.');

    // 2. Executar Seeds (DML inicial)
    console.log('[Migração] Executando database/seeds.sql...');
    const seedsSql = fs.readFileSync(path.join(__dirname, '../database/seeds.sql'), 'utf-8');
    await conn.query(seedsSql);
    console.log('[Migração] Carga inicial (seeds) inserida com sucesso.');

    // 3. Confirmar integridade e contagem de registros
    const [tabelasDepois] = await conn.query("SHOW TABLES LIKE 'ae_%'");
    console.log('\n=== STATUS DAS TABELAS DO BANCO MYSQL (AUTOESCOLA PRO) ===');
    for (const row of tabelasDepois) {
      const nomeTabela = Object.values(row)[0];
      try {
        const [[{ total }]] = await conn.query(`SELECT COUNT(*) as total FROM \`${nomeTabela}\``);
        console.log(` - ${nomeTabela.padEnd(25)} : ${total} registro(s)`);
      } catch (e) {
        console.log(` - ${nomeTabela.padEnd(25)} : Ativa`);
      }
    }

    await conn.end();
    console.log('\n[Migração Concluída] Banco MySQL inicializado e populado com sucesso!\n');
  } catch (err) {
    console.error('[ERRO na Migração]:', err.message);
  }
}

if (require.main === module) {
  executarMigracao();
}

module.exports = { executarMigracao };
