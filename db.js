const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Kavishka@253',
    database: 'amila'
});

connection.connect(err => {
    if (err) {
        console.error("MySQL connection failed:", err);
    } else {
        console.log("MySQL connected.");
    }
});

function query(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function updateDesktop(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;

        const sql = `UPDATE desktop_computer SET
            \`Brand\`= ?,
            \`Model No\` = ?,
            \`PRN\` = ?,
            \`Division\` = ?,
            \`User\` = ?,
            \`YEAR\` = ?,
            \`CPU/MONITER\` = ?,
            \`1st Repair Date\` = ?,
            \`2nd Repair Date\` = ?,
            \`3rd Repair Date\` = ?,
            \`4th Repair Date\` = ?
            WHERE \`S/N\` = ?`;

        const params = [
            row.brand,
            row.model,
            row.prn,
            row.Division,
            row.user,
            row.year,
            row.cpu_moniter,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
            row.sn  // WHERE clause value
        ];

        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


function deleteDesktop(id) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM desktop_computer WHERE iddesktop_computer = ?', [id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getDesktopById(id) {
    return query('SELECT * FROM desktop_computer WHERE iddesktop_computer = ?', [id]);
}
function getDesktopComputers() {
    return query(
        'SELECT iddesktop_computer AS id, Brand as brand, `Model No` AS model,`CPU/MONITER` as cpu_moniter,`S/N` as sn, Division as division, User as user, PRN as prn, YEAR as year, `1st Repair Date`, `2nd Repair Date`, `3rd Repair Date`, `4th Repair Date` FROM desktop_computer'
    );
}


function create(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;

        const sql = `INSERT INTO desktop_computer
            (\`Brand\`, \`Model No\`, \`S/N\`, \`PRN\`, \`Division\`, \`User\`, \`YEAR\`, \`CPU/MONITER\`,
             \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`; // ✅ 12 placeholders now

        const params = [
            row.brand,
            row.model,
            row.sn,
            row.prn,
            row.Division,
            row.user,
            row.year,
            row.cpu_moniter,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
        ];

        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}



function getLaptopUsers() {
    return query('SELECT idlaptop AS id, SN as sn, Division as division, User as user, PRN as prn, Year as year, `1st Repair Date`, `2nd Repair Date`, `3rd Repair Date`, `4th Repair Date` FROM laptop_users');
}

function createScanner(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO scanner
            (\`Brand & Model No\`,\`S/N\`, \`PRN\`, \`Division\`, \`User\`, \`YEAR\`,
            \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            row.brand - model,
            row.sn,
            row.PRN,
            row.Division,
            row.User,
            row.YEAR,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
        ];
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function updateScanner(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `UPDATE scanner SET
            \`Brand & Model No\` = ?,
            \`PRN\` = ?,
            \`Division\` = ?,
            \`User\` = ?,
            \`YEAR\` = ?,
            \`1st Repair Date\` = ?,
            \`2nd Repair Date\` = ?,
            \`3rd Repair Date\` = ?,
            \`4th Repair Date\` = ?
            WHERE \`S/N\` = ?`;
        const params = [
            row.brand - model,
            row.sn,
            row.prn,
            row.Division,
            row.User,
            row.YEAR,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
            row.sn
        ];
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function deleteScanner(sn) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM scanner WHERE `S/N` = ?', [sn], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getScanners() {
    return query('SELECT * FROM scanner');
}

function createUPS(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO ups
            (\`Brand & Model No\`, \`S/N\`, \`Division\`, \`User\`, \`PRN\`, \`Year\`,
            \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            row.brand,
            row.model,
            row.sn,
            row.division,
            row.user,
            row.prn,
            row.year,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
        ];
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function deleteUPS(sn) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM ups WHERE `S/N` = ?', [sn], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getUPSs() {
    return query('SELECT * FROM ups');
}

function createPrinter(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO printers
            (\`Brand \`,\`Model No\`,\`S/N\`, \`Division\`, \`User\`, \`PRN\`, \`Year\`,
            \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            row.brand,
            row.model,
            row.sn,
            row.division,
            row.user,
            row.prn,
            row.year,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
        ];
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function deletePrinter(sn) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM printers WHERE `S/N` = ?', [sn], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getPrinters() {
    return query('SELECT * FROM printers');
}

function createPhotocopy(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO photocopy
            (\`Brand \`,\`Model No\`, \`S/N\`, \`Division\`, \`User\`, \`PRN\`, \`Year\`,
            \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            row.brand,
            row.model,
            row.sn,
            row.division,
            row.user,
            row.prn,
            row.year,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
        ];
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function deletePhotocopy(sn) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM photocopy WHERE `S/N` = ?', [sn], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getPhotocopy() {
    return query('SELECT * FROM photocopy');
}

function createLaptopUser(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO laptop_users
            (sn, division, user, prn, year, \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            row.sn,
            row.division,
            row.user,
            row.prn,
            row.year,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
        ];
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function deleteLaptopUser(id) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM laptop_users WHERE idlaptop = ?', [id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function updateLaptopUser(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `UPDATE laptop_users SET
            SN = ?,
            Division = ?,
            User = ?,
            PRN = ?,
            Year = ?,
            \`1st Repair Date\` = ?,
            \`2nd Repair Date\` = ?,
            \`3rd Repair Date\` = ?,
            \`4th Repair Date\` = ?
            WHERE idlaptop = ?`;
        const params = [
            row.sn,
            row.division,
            row.user,
            row.prn,
            row.year,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
            row.id
        ];
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

// Get all unique brands (Brand part before first space or delimiter)
function getAllDesktopBrands() {
    return query('SELECT DISTINCT SUBSTRING_INDEX(`Brand `, " ", 1) AS brand FROM desktop_computer');
}

// Get all unique models for a given brand (model part after brand)
function getModelsByBrand(brand) {
    return query('SELECT DISTINCT TRIM(SUBSTRING(`Brand`, LENGTH(?) + 2)) AS model FROM desktop_computer WHERE `Brand & Model No` LIKE ?', [brand, `${brand}%`]);
}

// Get all desktops filtered by brand and model


module.exports = {
    query,
    updateDesktop,
    deleteDesktop,
    create,
    getLaptopUsers,
    createScanner,
    updateScanner,
    deleteScanner,
    getScanners,
    createUPS,
    deleteUPS,
    getUPSs,
    createPrinter,
    deletePrinter,
    getPrinters,
    createPhotocopy,
    deletePhotocopy,
    getPhotocopy,
    createLaptopUser,
    deleteLaptopUser,
    updateLaptopUser,
    getAllDesktopBrands,
    getModelsByBrand,
    getDesktopComputers,
    getDesktopById

};
