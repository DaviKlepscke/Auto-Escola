"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;

const fs = require("fs");
const path = require("path");

let mysql = null;
try {
    mysql = require('mysql2/promise');
} catch (e) {
    // Modo offline resiliente se mysql2 não estiver presente
}

function carregarEnvLocal() {
    const envPath = path.join(process.cwd(), '.env');
    const config = {
        host: '143.106.241.4',
        user: 'cl205461',
        password: 'cl*13052010',
        database: 'cl205461',
        port: 3306
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
        } catch (err) {
            console.warn('[DB] Erro ao ler .env, utilizando padrões:', err.message);
        }
    }
    return config;
}

class DatabaseManager {
    constructor() {
        this.pool = null;
        this.isConnected = false;
        this.currentConfig = carregarEnvLocal();
    }

    async init(config = this.currentConfig) {
        this.currentConfig = config;
        if (!mysql) {
            console.log('[DB] Operando em modo de resiliência local (Offline-first).');
            return false;
        }
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
            const conn = await this.pool.getConnection();
            conn.release();
            this.isConnected = true;
            console.log(`[DB] Conexão ativa com o MySQL [${config.database}@${config.host}].`);
            return true;
        } catch (err) {
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
}

exports.db = new DatabaseManager();
