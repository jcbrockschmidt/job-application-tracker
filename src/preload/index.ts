import { contextBridge, ipcRenderer } from 'electron'
import type { WindowAPI, SourceDocType, DocumentType } from '../shared/types'

const api: WindowAPI = {
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    save: (settings) => ipcRenderer.invoke('settings:save', settings),
    validateApiKey: (apiKey) => ipcRenderer.invoke('settings:validateApiKey', apiKey),
    getAvailableModels: () => ipcRenderer.invoke('settings:getAvailableModels')
  },

  applications: {
    getAll: () => ipcRenderer.invoke('applications:getAll'),
    update: (id, updates) => ipcRenderer.invoke('applications:update', id, updates),
    delete: (id) => ipcRenderer.invoke('applications:delete', id)
  },

  sessions: {
    create: (jobDescription) => ipcRenderer.invoke('sessions:create', jobDescription),
    get: (id) => ipcRenderer.invoke('sessions:get', id),
    getAll: () => ipcRenderer.invoke('sessions:getAll'),
    update: (id, updates) => ipcRenderer.invoke('sessions:update', id, updates),
    close: (id) => ipcRenderer.invoke('sessions:close', id)
  },

  docs: {
    ingest: (filePath: string, type: SourceDocType) =>
      ipcRenderer.invoke('docs:ingest', filePath, type),
    getAll: () => ipcRenderer.invoke('docs:getAll'),
    delete: (id) => ipcRenderer.invoke('docs:delete', id)
  },

  generate: {
    resume: (sessionId) => ipcRenderer.invoke('generate:resume', sessionId),
    coverLetter: (sessionId) => ipcRenderer.invoke('generate:coverLetter', sessionId),
    revise: (sessionId, section, instruction) =>
      ipcRenderer.invoke('generate:revise', sessionId, section, instruction)
  },

  export: {
    pdf: (sessionId: string, type: DocumentType) =>
      ipcRenderer.invoke('export:pdf', sessionId, type),
    docx: (sessionId: string, type: DocumentType) =>
      ipcRenderer.invoke('export:docx', sessionId, type)
  },

  backup: {
    trigger: () => ipcRenderer.invoke('backup:trigger'),
    import: (backupPath) => ipcRenderer.invoke('backup:import', backupPath)
  }
}

contextBridge.exposeInMainWorld('api', api)
