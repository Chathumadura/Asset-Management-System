// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // ---------- Generic DB Operations ----------
    dbQuery: (sql, params) => ipcRenderer.invoke('db-query', sql, params),

    // ---------- Desktop Operations ----------

    getDesktopComputers: () => ipcRenderer.invoke('get-desktop-computers'),
    createDesktop: (data) => ipcRenderer.invoke('db-create-desktop', data),
    dbDeleteDesktop: (id) => ipcRenderer.invoke('db-delete-desktop', id),
    updateDesktop: (data) => ipcRenderer.invoke('db-update-desktop', data),
    getDesktopById: (id) => ipcRenderer.invoke('db-get-desktop-by-id', id),

    // ---------- Laptop Operations ----------
    getLaptopUsers: () => ipcRenderer.invoke('get-laptop-users'),
    createLaptopUser: (data) => ipcRenderer.invoke('create-laptop-user', data),
    deleteLaptopUser: (id) => ipcRenderer.invoke('delete-laptop-user', id),
    updateLaptopUser: (data) => ipcRenderer.invoke('update-laptop-user', data),
    getLaptopById: (id) => ipcRenderer.invoke('get-laptop-by-id', id),
    // ---------- Scanner Operations ----------
    getScanners: () => ipcRenderer.invoke('get-scanners'),
    createScanner: (data) => ipcRenderer.invoke('create-scanner', data),
    updateScanner: (data) => ipcRenderer.invoke('update-scanner', data),
    getScannerById: (id) => ipcRenderer.invoke('get-scanner-by-id', id),
    deleteScanner: (id) => ipcRenderer.invoke('delete-scanner', id),

    // ---------- UPS Operations ----------
    getUPSs: () => ipcRenderer.invoke('get-ups'),
    createUPS: (data) => ipcRenderer.invoke('create-ups', data),
    deleteUPS: (id) => ipcRenderer.invoke('delete-ups', id),
    updateUPS: (id, data) => ipcRenderer.invoke('update-ups', id, data),
    getUPSByID: (id) => ipcRenderer.invoke('get-ups-by-sn', id), // Optional

    // ---------- Printer Operations ----------
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    createPrinter: (data) => ipcRenderer.invoke('create-printer', data),
    deletePrinter: (id) => ipcRenderer.invoke('delete-printer', id),
    updatePrinter: (data) => ipcRenderer.invoke('update-printer', data),

    getPrinterByID: (id) => ipcRenderer.invoke('get-printer-by-sn', id), // Optional

    // ---------- Photocopy Operations ----------
    getPhotocopy: () => ipcRenderer.invoke('get-photocopy'),
    createPhotocopy: (data) => ipcRenderer.invoke('create-photocopy', data),
    deletePhotocopy: (id) => ipcRenderer.invoke('delete-photocopy', id),
    updatePhotocopy: (data) => ipcRenderer.invoke('update-photocopy', data),
    getPhotocopyByID: (id) => ipcRenderer.invoke('get-photocopy-by-sn', id), // Optional
});
