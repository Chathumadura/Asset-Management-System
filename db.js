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
        // Test the connection with a simple query
        connection.query('SELECT 1 as test', (err, results) => {
            if (err) {
                console.error("Database test query failed:", err);
            } else {
                console.log("Database connection test successful");
            }
        });
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




// Desktop

function getDesktopById(id) {
    return query('SELECT * FROM desktop_computer WHERE iddesktop_computer = ?', [id]);
}
function getDesktopComputers() {
    return query(`
        SELECT 
            iddesktop_computer AS id, 
            Brand AS brand, 
            \`Model No\` AS model,
            \`CPU/MONITER\` AS cpu_moniter,
            \`S/N\` AS sn, 
            \`Division\` AS division, 
            \`User\` AS user, 
            \`PRN\` AS prn, 
            \`YEAR\` AS year, 
            \`1st Repair Date\` AS repair_date_1,
            \`2nd Repair Date\` AS repair_date_2,
            \`3rd Repair Date\` AS repair_date_3,
            \`4th Repair Date\` AS repair_date_4,
            \`RAM Capacity\` AS ram_capacity,
            \`HDD Capacity\` AS hdd_capacity,
            \`Processor Speed\` AS processor_speed,
            \`OS Version\` AS os_version
        FROM desktop_computer
    `).catch(err => {
        console.error('Error in getDesktopComputers:', err);
        throw err;
    });
}


function createDesktop(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO desktop_computer
            (\`Brand\`, \`Model No\`, \`S/N\`, \`PRN\`, \`Division\`, \`User\`, \`YEAR\`, \`CPU/MONITER\`,
             \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`,
             \`RAM Capacity\`, \`HDD Capacity\`, \`Processor Speed\`, \`OS Version\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
            row.ram_capacity,
            row.hdd_capacity,
            row.processor_speed,
            row.os_version
        ];
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
            \`Brand\` = ?,
            \`Model No\` = ?,
            \`PRN\` = ?,
            \`Division\` = ?,
            \`User\` = ?,
            \`YEAR\` = ?,
            \`CPU/MONITER\` = ?,
            \`1st Repair Date\` = ?,
            \`2nd Repair Date\` = ?,
            \`3rd Repair Date\` = ?,
            \`4th Repair Date\` = ?,
            \`RAM Capacity\` = ?,
            \`HDD Capacity\` = ?,
            \`Processor Speed\` = ?,
            \`OS Version\` = ?
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
            row.ram_capacity,
            row.hdd_capacity,
            row.processor_speed,
            row.os_version,
            row.id // WHERE clause
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







// LaptopUsers

function getLaptopUsers() {
    return query('SELECT idlaptop AS id, `SN` as sn, `Division` as division, `User` as user, `PRN` as prn, `Year` as year, `1st Repair Date` AS repair_date_1, `2nd Repair Date` AS repair_date_2, `3rd Repair Date` AS repair_date_3, `4th Repair Date` AS repair_date_4 FROM laptop_users').catch(err => {
        console.error('Error in getLaptopUsers:', err);
        throw err;
    });
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
            cleanDate(row.repair_date_4)
        ];
        connection.query(sql, params, (err, results) => {
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



function deleteLaptopUser(id) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM laptop_users WHERE idlaptop = ?', [id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}




// Scanner


function createScanner(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO scanner
            (\`Brand\`, \`Model No\`, \`S/N\`, \`PRN\`, \`Division\`, \`User\`, \`YEAR\`,
            \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            row.brand,
            row.model,
            row.sn,
            row.prn,
            row.division,
            row.user,
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

function getScanners() {
    return query('SELECT idscanner AS id,  Brand AS brand, `Model No` AS model, `S/N` AS sn, `Division` AS division, `User` AS user, `PRN` AS prn, `YEAR` AS year, `1st Repair Date` AS repair_date_1, `2nd Repair Date` AS repair_date_2, `3rd Repair Date` AS repair_date_3, `4th Repair Date` AS repair_date_4 FROM scanner').catch(err => {
        console.error('Error in getScanners:', err);
        throw err;
    }
    )
}






function updateScanner(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;

        // Check the incoming data
        console.log('Update data:', row);

        const sql = `UPDATE scanner SET
            Brand = ?,
            \`Model No\` = ?,
            \`S/N\` = ?,
            PRN = ?,
            Division = ?,
            User = ?,
            YEAR = ?,
            \`1st Repair Date\` = ?,
            \`2nd Repair Date\` = ?,
            \`3rd Repair Date\` = ?,
            \`4th Repair Date\` = ?
            WHERE idscanner = ?`;

        const params = [
            row.brand,
            row.model,
            row.sn,
            row.prn,
            row.division, // Changed from row.Division
            row.user,    // Changed from row.User
            row.year,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
            row.id
        ];

        // Log the SQL and parameters for debugging
        console.log('SQL:', sql);
        console.log('Parameters:', params);

        connection.query(sql, params, (err, results) => {
            if (err) {
                console.error('Update error:', err);
                reject(err);
            } else {
                console.log('Update results:', results);
                resolve(results);
            }
        });
    });
}

function deleteScanner(id) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM scanner WHERE idscanner = ?', [id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}





// UPS

function createUPS(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO ups
            (\`Brand\`, \`Model\`, \`S/N\`, \`Division\`, \`User\`, \`PRN\`, \`Year\`,
            \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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

function getUPSs() {
    return query('SELECT idups AS id, `S/N` AS sn,  Brand AS brand, `Model No` AS model, Division as division, User as user, PRN as prn, Year as year, `1st Repair Date` AS repair_date_1, `2nd Repair Date` AS repair_date_2, `3rd Repair Date` AS repair_date_3, `4th Repair Date` AS repair_date_4 FROM ups');
}


function deleteUPS(id) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM ups WHERE idups = ?', [id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function updateUPS(id, row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `UPDATE ups SET
            \`Brand \` = ?,
            \`Model No \` = ?,
            \`S/N\` = ?,
            \`Division\` = ?,
            \`User\` = ?,
            \`PRN\` = ?,
            \`Year\` = ?,
            \`1st Repair Date\` = ?,
            \`2nd Repair Date\` = ?,
            \`3rd Repair Date\` = ?,
            \`4th Repair Date\` = ?
            WHERE idups = ?`;

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
            id
        ];

        connection.query(sql, params, (err, results) => {
            if (err) {
                console.error('Error updating UPS:', err);
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
}






// Printer



function createPrinter(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO printers
            (\`Brand\`, \`Model No\`, \`S/N\`, \`Division\`, \`User\`, \`PRN\`, \`Year\`,
            \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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

function getPrinters() {
    return query(`
    SELECT
        idprinters AS id,
        \`Brand\` AS brand,
        \`Model No\` AS model_no,
        \`S/N\` AS sn,
        \`PRN\` AS prn,
        \`Year\` AS year,
        \`Division\` AS division,
        \`User\` AS user,
        \`IP Address\` AS ip_address,
        \`1st Repair Date\` AS repair_date_1,
        \`2nd Repair Date\` AS repair_date_2,
        \`3rd Repair Date\` AS repair_date_3,
        \`4th Repair Date\` AS repair_date_4
    FROM printers`)
        .catch(err => {
            console.error('Error in getPrinters:', err);
            throw err;
        });
}

function updatePrinter(id, row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `UPDATE printers SET
            \`Brand\` = ?,
            \`Model No\` = ?,
            \`S/N\` = ?,
            \`Division\` = ?,
            \`User\` = ?,
            \`PRN\` = ?,
            \`Year\` = ?,
            \`IP Address\` = ?,
            \`1st Repair Date\` = ?,
            \`2nd Repair Date\` = ?,
            \`3rd Repair Date\` = ?,
            \`4th Repair Date\` = ?
            WHERE idprinters = ?`;

        const params = [
            row.brand || row['Brand'],
            row.model || row['Model No'],
            row.sn,
            row.division,
            row.user,
            row.prn,
            row.year,
            row.ip_address || row['IP Address'],
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
            id
        ];

        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}


function deletePrinter(id) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM printers WHERE idprinters = ?', [id], (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}






// Photocopy

function createPhotocopy(row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `INSERT INTO photocopy
                (\`Brand\`, \`Model No\`, \`S/N\`, \`Division\`, \`PRN\`, \`Year\`,
                \`1st Repair Date\`, \`2nd Repair Date\`, \`3rd Repair Date\`, \`4th Repair Date\`)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [
            row['Brand'],
            row['Model No'],
            row.sn,
            row.division,
            row.prn,
            row.year,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4)
        ];
        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function getPhotocopy() {
    const sql = `
        SELECT 
            idphotocopy AS id,
            Brand AS brand,
            \`Model No\` AS model,
            \`S/N\` AS sn,
            Division AS division,
            PRN AS prn,
            Year AS year,
            \`1st Repair Date\` AS repair_date_1,
            \`2nd Repair Date\` AS repair_date_2,
            \`3rd Repair Date\` AS repair_date_3,
            \`4th Repair Date\` AS repair_date_4
        FROM photocopy;
    `;

    return query(sql).catch(err => {
        console.error('Error in getPhotocopy:', err);
        throw err;
    });
}

function updatePhotocopy(id, row) {
    return new Promise((resolve, reject) => {
        const cleanDate = date => (!date || date.trim() === '') ? null : date;
        const sql = `UPDATE photocopy SET
            \`Brand\` = ?,
            \`Model No\` = ?,
            \`S/N\` = ?,
            \`Division\` = ?,
            \`PRN\` = ?,
            \`Year\` = ?,
            \`1st Repair Date\` = ?,
            \`2nd Repair Date\` = ?,
            \`3rd Repair Date\` = ?,
            \`4th Repair Date\` = ?
            WHERE idphotocopy = ?`;

        const params = [
            row.brand,
            row.model,
            row.model,
            row.sn,
            row.division,
            row.prn,
            row.year,
            cleanDate(row.repair_date_1),
            cleanDate(row.repair_date_2),
            cleanDate(row.repair_date_3),
            cleanDate(row.repair_date_4),
            id // WHERE clause
        ];

        connection.query(sql, params, (err, results) => {
            if (err) reject(err);
            else resolve(results);
        });
    });
}

function deletePhotocopy(id) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM photocopy WHERE idphotocopy = ?', [id], (err, results) => {
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
    createDesktop,
    getLaptopUsers,
    createScanner,
    updateScanner,
    deleteScanner,
    getScanners,
    createUPS,
    deleteUPS,
    updateUPS,
    getUPSs,
    createPrinter,
    deletePrinter,
    updatePrinter,
    getPrinters,
    createPhotocopy,
    deletePhotocopy,
    updatePhotocopy,
    getPhotocopy,
    createLaptopUser,
    deleteLaptopUser,
    updateLaptopUser,
    getAllDesktopBrands,
    getModelsByBrand,
    getDesktopComputers,
    getDesktopById

};
