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


