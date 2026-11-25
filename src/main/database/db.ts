// =====================================================================
// GERENCIADOR DE BANCO DE DADOS (MYSQL COM CARREGAMENTO DO .ENV)
// Especialistas: electron_core & database_mysql
// DIRETRIZ: Respeita o banco de dados configurado no .env e opera sobre tabelas ae_*
// =====================================================================

import mysql from 'mysql2/promise';
import * as fs from 'fs';
import * as path from 'path';

export interface DBConfig {
  host: string;
  user: string;
  password?: string;
  database: string;
  port: number;
}

function carregarEnvLocal(): DBConfig {
  const envPath = path.join(process.cwd(), '.env');
  const config: DBConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'autoescola',
    port: Number(process.env.DB_PORT) || 3306
  };

  if (fs.existsSync(envPath)) {
    try {
      const conteudo = fs.readFileSync(envPath, 'utf-8');
      const linhas = conteudo.split(/\r?\n/);
      for (const linha of linhas) {
        const trimmed = linha.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const [chave, ...resto] = trimmed.split('=');
        const valor = resto.join('=').trim();
        if (chave === 'DB_HOST') config.host = valor;
        if (chave === 'DB_PORT') config.port = Number(valor) || 3306;
        if (chave === 'DB_USER') config.user = valor;
        if (chave === 'DB_PASSWORD') config.password = valor;
        if (chave === 'DB_NAME') config.database = valor;
      }
      console.log(`[DB] Credenciais do .env carregadas com sucesso para o banco: ${config.database}@${config.host}`);
    } catch (err: any) {
      console.warn('[DB] Erro ao ler .env, utilizando padrões:', err.message);
    }
  }
  return config;
}

class DatabaseManager {
  private pool: mysql.Pool | null = null;
  private isConnected = false;
  private currentConfig: DBConfig = carregarEnvLocal();

  public async init(config: DBConfig = this.currentConfig): Promise<boolean> {
    this.currentConfig = config;
    try {
      this.pool = mysql.createPool({
        host: config.host,
        user: config.user,
        password: config.password,
        database: config.database,
        port: config.port,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 5000
      });

      const connection = await this.pool.getConnection();
      connection.release();
      this.isConnected = true;
      await this.garantirColunasAlunos();
      console.log(`[DB] Conexão ativa com o MySQL [${config.database}@${config.host}].`);
      return true;
    } catch (err: any) {
      console.warn(`[DB] Falha ao conectar no MySQL (${config.host}): ${err.message}. Ativando modo de resiliência local.`);
      this.isConnected = false;
      return false;
    }
  }

  public getPool(): mysql.Pool | null {
    return this.pool;
  }

  public hasConnection(): boolean {
    return this.isConnected;
  }

  public getConfig(): DBConfig {
    return this.currentConfig;
  }

  /**
   * Garante colunas de carga horária em bancos já existentes sem quebrar instalações antigas.
   */
  private async garantirColunasAlunos(): Promise<void> {
    if (!this.pool) return;
    const colunas = [
      'horas_teoricas_cumpridas',
      'horas_praticas_cumpridas',
      'horas_noturnas_cumpridas'
    ];
    try {
      const [rows]: any = await this.pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ae_alunos'`,
        [this.currentConfig.database]
      );
      if (!Array.isArray(rows) || rows.length === 0) return;

      const existentes = new Set(rows.map((r: any) => String(r.COLUMN_NAME)));
      for (const col of colunas) {
        if (!existentes.has(col)) {
          await this.pool.execute(
            `ALTER TABLE ae_alunos ADD COLUMN ${col} INT NOT NULL DEFAULT 0`
          );
        }
      }
    } catch (err: any) {
      console.warn('[DB] Aviso ao verificar colunas de carga horária em ae_alunos:', err.message);
    }
  }
}

export const db = new DatabaseManager();
