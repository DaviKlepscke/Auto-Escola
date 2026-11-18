// =====================================================================
// PROCESSO PRINCIPAL (MAIN PROCESS) - ELECTRON COM TYPESCRIPT
// Especialista em Electron: electron_core
// =====================================================================

import { app, BrowserWindow, session } from 'electron';
import * as path from 'path';
import { registerIpcHandlers } from './ipc/ipcHandlers';
import { db } from './database/db';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1024,
    minHeight: 700,
    title: 'AutoEscola Pro - Sistema de Gestão de CFC',
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    },
    show: false
  });

  // Configuração estrita de Content Security Policy (CSP) para Segurança Desktop
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; font-src 'self' https://cdn.jsdelivr.net; img-src 'self' data: https:;"
        ]
      }
    });
  });

  const rendererPath = path.join(__dirname, '../../src/renderer/index.html');
  mainWindow.loadFile(rendererPath);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Inicialização segura do Ciclo de Vida do Aplicativo
app.whenReady().then(async () => {
  console.log('[Main] Inicializando Sistema de Gestão de Autoescola...');
  
  // Registrar Handlers IPC Modulares
  registerIpcHandlers();

  // Tentar inicializar o banco MySQL local (com tolerância offline-first)
  await db.init();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
