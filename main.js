const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const db = require('./db'); // Assuming db.js contains your database logic

function createWindow() {
    const win = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

// Handle app closing
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});

// --- Generic Database IPC Handlers (if still used by other parts of your app) ---
// These are general purpose and might be used by other tables if not specific handlers exist.

ipcMain.handle('get-desktop-computers', async () => {
    return await db.getDesktopComputers();
});


ipcMain.handle('db-get-desktop-by-id', async (event, id) => {
    return await db.getDesktopById(id);
});

ipcMain.handle('db-query', async (event, sql, params = []) => {
    try {
        return await db.query(sql, params);
    } catch (err) {
        console.error('Error in generic db-query:', err);
        throw err;
    }
});




ipcMain.handle('db-create', async (event, row) => {
    try {
        // This generic create handler needs to know which table to create in.
        // It's generally safer to have table-specific create handlers.
        // Assuming 'db.create' in db.js handles table selection based on 'row' content.
        await db.create(row);
        return { success: true, message: 'Generic create successful.' };
    } catch (err) {
        console.error('Error in generic db-create:', err);
        throw err;
    }
});


// --- Desktop Computer Specific IPC Handlers (ADDED/CORRECTED) ---

ipcMain.handle('db-create-desktop', async (event, data) => {
    try {
        const result = await db.createDesktop(data); // Calls db.createDesktop
        return { success: true, ...result };
    } catch (err) {
        console.error('Error in db-create-desktop:', err);
        throw err;
    }
});

ipcMain.handle('db-delete-desktop', async (event, id) => {
    try {
        const result = await db.deleteDesktop(id); // Calls db.deleteDesktop
        return { success: true, ...result };
    } catch (err) {
        console.error('Error in db-delete-desktop:', err);
        throw err;
    }
});



ipcMain.handle('db-update-desktop', async (event, data) => { // Matches preload.js
    try {
        const result = await db.updateDesktop(data); // Calls db.updateDesktop
        return { success: true, ...result };
    } catch (err) {
        console.error('Error in db-update-desktop:', err);
        throw err;
    }
});


// --- Laptop Users IPC Handlers ---
// These seem correct and match your laptop.js and preload.js.
ipcMain.handle('get-laptop-users', async () => {
    try {
        return await db.getLaptopUsers(); // Assuming db.getLaptopUsers exists
    } catch (err) {
        console.error('Error in get-laptop-users:', err);
        throw err;
    }
});

ipcMain.handle('create-laptop-user', async (event, row) => {
    try {
        return await db.createLaptopUser(row);
    } catch (err) {
        console.error('Error in create-laptop-user:', err);
        throw err;
    }
});

ipcMain.handle('delete-laptop-user', async (event, sn) => {
    try {
        return await db.deleteLaptopUser(sn);
    } catch (err) {
        console.error('Error in delete-laptop-user:', err);
        throw err;
    }
});

ipcMain.handle('update-laptop-user', async (event, row) => {
    try {
        return await db.updateLaptopUser(row);
    } catch (err) {
        console.error('Error in update-laptop-user:', err);
        throw err;
    }
});


// --- Scanners IPC Handlers ---
ipcMain.handle('get-scanners', async () => {
    try {
        return await db.getScanners(); // Assuming db.getScanners exists
    } catch (err) {
        console.error('Error in get-scanners:', err);
        throw err;
    }
});

ipcMain.handle('create-scanner', async (event, row) => {
    try {
        return await db.createScanner(row);
    } catch (err) {
        console.error('Error in create-scanner:', err);
        throw err;
    }
});

ipcMain.handle('update-scanner', async (event, row) => {
    try {
        return await db.updateScanner(row);
    } catch (err) {
        console.error('Error in update-scanner:', err);
        throw err;
    }
});

ipcMain.handle('delete-scanner', async (event, sn) => {
    try {
        return await db.deleteScanner(sn);
    } catch (err) {
        console.error('Error in delete-scanner:', err);
        throw err;
    }
});

// --- UPS IPC Handlers ---
ipcMain.handle('get-ups', async () => {
    try {
        return await db.getUPSs(); // Assuming db.getUPSs exists
    } catch (err) {
        console.error('Error in get-ups:', err);
        throw err;
    }
});

ipcMain.handle('create-ups', async (event, row) => {
    try {
        return await db.createUPS(row);
    } catch (err) {
        console.error('Error in create-ups:', err);
        throw err;
    }
});

ipcMain.handle('delete-ups', async (event, sn) => {
    try {
        return await db.deleteUPS(sn);
    } catch (err) {
        console.error('Error in delete-ups:', err);
        throw err;
    }
});

// --- Printers IPC Handlers ---
ipcMain.handle('get-printers', async () => {
    try {
        return await db.getPrinters(); // Assuming db.getPrinters exists
    } catch (err) {
        console.error('Error in get-printers:', err);
        throw err;
    }
});

ipcMain.handle('create-printer', async (event, row) => {
    try {
        return await db.createPrinter(row);
    } catch (err) {
        console.error('Error in create-printer:', err);
        throw err;
    }
});

ipcMain.handle('delete-printer', async (event, sn) => {
    try {
        return await db.deletePrinter(sn);
    } catch (err) {
        console.error('Error in delete-printer:', err);
        throw err;
    }
});

// --- Photocopy IPC Handlers ---
ipcMain.handle('get-photocopy', async () => {
    try {
        return await db.getPhotocopy(); // Assuming db.getPhotocopy exists
    } catch (err) {
        console.error('Error in get-photocopy:', err);
        throw err;
    }
});

ipcMain.handle('create-photocopy', async (event, row) => {
    try {
        return await db.createPhotocopy(row);
    } catch (err) {
        console.error('Error in create-photocopy:', err);
        throw err;
    }
});

ipcMain.handle('delete-photocopy', async (event, sn) => {
    try {
        return await db.deletePhotocopy(sn);
    } catch (err) {
        console.error('Error in delete-photocopy:', err);
        throw err;
    }
});

