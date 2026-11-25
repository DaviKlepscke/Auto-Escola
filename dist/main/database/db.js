"use strict";
// =====================================================================
// GERENCIADOR DE BANCO DE DADOS (MYSQL COM CARREGAMENTO DO .ENV)
// Especialistas: electron_core & database_mysql
// DIRETRIZ: Respeita o banco de dados configurado no .env e opera sobre tabelas ae_*
// =====================================================================
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function carregarEnvLocal() {
    const envPath = path.join(process.cwd(), '.env');
    const config = {
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
                if (!trimmed || trimmed.startsWith('#'))
                    continue;
                const [chave, ...resto] = trimmed.split('=');
                const valor = resto.join('=').trim();
                if (chave === 'DB_HOST')
                    config.host = valor;
                if (chave === 'DB_PORT')
                    config.port = Number(valor) || 3306;
                if (chave === 'DB_USER')
                    config.user = valor;
                if (chave === 'DB_PASSWORD')
                    config.password = valor;
                if (chave === 'DB_NAME')
                    config.database = valor;
            }
            console.log(`[DB] Credenciais do .env carregadas com sucesso para o banco: ${config.database}@${config.host}`);
        }
        catch (err) {
            console.warn('[DB] Erro ao ler .env, utilizando padrões:', err.message);
        }
    }
    return config;
}
class DatabaseManager {
    pool = null;
    isConnected = false;
    currentConfig = carregarEnvLocal();
    async init(config = this.currentConfig) {
        this.currentConfig = config;
        try {
            this.pool = promise_1.default.createPool({
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
        }
        catch (err) {
            console.warn(`[DB] Falha ao conectar no MySQL (${config.host}): ${err.message}. Ativando modo de resiliência local.`);
            this.isConnected = false;
            return false;
        }
    }
    getPool() {
        return this.pool;
    }
    hasConnection() {
        return this.isConnected;
    }
    getConfig() {
        return this.currentConfig;
    }
    /**
     * Garante colunas de carga horária em bancos já existentes sem quebrar instalações antigas.
     */
    async garantirColunasAlunos() {
        if (!this.pool)
            return;
        const colunas = [
            'horas_teoricas_cumpridas',
            'horas_praticas_cumpridas',
            'horas_noturnas_cumpridas'
        ];
        try {
            const [rows] = await this.pool.query(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'ae_alunos'`, [this.currentConfig.database]);
            if (!Array.isArray(rows) || rows.length === 0)
                return;
            const existentes = new Set(rows.map((r) => String(r.COLUMN_NAME)));
            for (const col of colunas) {
                if (!existentes.has(col)) {
                    await this.pool.execute(`ALTER TABLE ae_alunos ADD COLUMN ${col} INT NOT NULL DEFAULT 0`);
                }
            }
        }
        catch (err) {
            console.warn('[DB] Aviso ao verificar colunas de carga horária em ae_alunos:', err.message);
        }
    }
}
exports.db = new DatabaseManager();
