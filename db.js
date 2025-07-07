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




module.exports = {
    query,
    updateDesktop,
    deleteDesktop,
    create,
    getDesktopComputers,
    getDesktopById

};
