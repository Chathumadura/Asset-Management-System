// preload.js

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // ---------- Generic DB Operations ----------
    dbQuery: (sql, params) => ipcRenderer.invoke('db-query', sql, params),

    // ---------- Desktop Operations ----------

    getDesktopComputers: () => ipcRenderer.invoke('get-desktop-computers'),
    dbCreateDesktop: (data) => ipcRenderer.invoke('db-create-desktop', data),
    dbDeleteDesktop: (id) => ipcRenderer.invoke('db-delete-desktop', id),
    updateDesktop: (data) => ipcRenderer.invoke('db-update-desktop', data),
    getDesktopById: (id) => ipcRenderer.invoke('db-get-desktop-by-id', id),

    // ---------- Laptop Operations ----------
    getLaptopUsers: () => ipcRenderer.invoke('get-laptop-users'),
    createLaptopUser: (data) => ipcRenderer.invoke('create-laptop-user', data),
    deleteLaptopUser: (sn) => ipcRenderer.invoke('delete-laptop-user', sn),
    updateLaptopUser: (data) => ipcRenderer.invoke('update-laptop-user', data),
    getLaptopBySN: (sn) => ipcRenderer.invoke('get-laptop-by-sn', sn), // Optional: if you need get by SN

    // ---------- Scanner Operations ----------
    getScanners: () => ipcRenderer.invoke('get-scanners'),
    createScanner: (data) => ipcRenderer.invoke('create-scanner', data),
    updateScanner: (data) => ipcRenderer.invoke('update-scanner', data),
    deleteScanner: (sn) => ipcRenderer.invoke('delete-scanner', sn),
    getScannerBySN: (sn) => ipcRenderer.invoke('get-scanner-by-sn', sn), // Optional

    // ---------- UPS Operations ----------
    getUPSs: () => ipcRenderer.invoke('get-ups'),
    createUPS: (data) => ipcRenderer.invoke('create-ups', data),
    deleteUPS: (sn) => ipcRenderer.invoke('delete-ups', sn),
    updateUPS: (data) => ipcRenderer.invoke('update-ups', data),
    getUPSBySN: (sn) => ipcRenderer.invoke('get-ups-by-sn', sn), // Optional

    // ---------- Printer Operations ----------
    getPrinters: () => ipcRenderer.invoke('get-printers'),
    createPrinter: (data) => ipcRenderer.invoke('create-printer', data),
    deletePrinter: (sn) => ipcRenderer.invoke('delete-printer', sn),
    updatePrinter: (data) => ipcRenderer.invoke('update-printer', data),
    getPrinterBySN: (sn) => ipcRenderer.invoke('get-printer-by-sn', sn), // Optional

    // ---------- Photocopy Operations ----------
    getPhotocopy: () => ipcRenderer.invoke('get-photocopy'),
    createPhotocopy: (data) => ipcRenderer.invoke('create-photocopy', data),
    deletePhotocopy: (sn) => ipcRenderer.invoke('delete-photocopy', sn),
    updatePhotocopy: (data) => ipcRenderer.invoke('update-photocopy', data),
    getPhotocopyBySN: (sn) => ipcRenderer.invoke('get-photocopy-by-sn', sn), // Optional
});
