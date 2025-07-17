window.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('data-body');
    const divisionFilter = document.getElementById('division-filter');
    const yearFilter = document.getElementById('year-filter');
    const brandFilter = document.getElementById('brand-filter');
    const modelFilter = document.getElementById('model-filter');

    const createBtn = document.getElementById('createBtn');
    const createModal = document.getElementById('createModal');
    const cancelCreate = document.getElementById('cancelCreate');
    const createForm = document.getElementById('createForm');

    const newBrandModel = document.querySelector('input[name="brand_model"]');
    const newSN = document.querySelector('input[name="sn"]');
    const newPRN = document.querySelector('input[name="PRN"]');
    const newDivision = document.querySelector('select[name="Division"]');
    const newUser = document.querySelector('input[name="User"]');
    const newYear = document.querySelector('input[name="YEAR"]');
    const newCpuMonitor = document.querySelector('input[name="cpu_moniter"]');
    const newRepairDate1 = document.querySelector('input[name="repair_date_1"]');
    const newRepairDate2 = document.querySelector('input[name="repair_date_2"]');
    const newRepairDate3 = document.querySelector('input[name="repair_date_3"]');
    const newRepairDate4 = document.querySelector('input[name="repair_date_4"]');

    function formatDate(dateString) {
        if (!dateString || dateString === '1970-01-01') return '';
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
    }

    // Remove populateModelDropdown, since model filter is now a text input
    // Update event listeners for modelFilter
    brandFilter.addEventListener('change', () => {
        loadData(); // Filter table immediately when brand changes
    });
    modelFilter.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
            loadData();
        }
    });
    modelFilter.addEventListener('input', () => {
        if (modelFilter.value === '') loadData();
    });
    divisionFilter.addEventListener('change', loadData);
    yearFilter.addEventListener('input', loadData);

    async function loadData() {
        // If brand/model filter is used, use new API
        const brand = brandFilter.value;
        const model = modelFilter.value.trim();
        console.log('Brand filter:', brand, 'Model filter:', model); // Debug log
        if (brand || model) {
            const rows = await window.electronAPI.getDesktopsByBrandModel(brand, model);
            // Apply division/year filter client-side
            let filtered = rows;
            if (divisionFilter.value) {
                filtered = filtered.filter(row => (row.Division || '').toLowerCase() === divisionFilter.value.toLowerCase());
            }
            if (yearFilter.value.trim()) {
                filtered = filtered.filter(row => (row.YEAR || '').toString().includes(yearFilter.value.trim()));
            }
            renderTable(filtered);
            return;
        }
        let sql = `
            SELECT
                \`Brand & Model No\` AS brand_model,
                \`S/N\` AS sn,
                \`PRN\` AS PRN,
                \`Division\` AS Division,
                \`User\` AS User,
                \`YEAR\` AS YEAR,
                \`CPU/MONITER\` AS cpu_moniter,
                \`1st Repair Date\` AS repair_date_1,
                \`2nd Repair Date\` AS repair_date_2,
                \`3rd Repair Date\` AS repair_date_3,
                \`4th Repair Date\` AS repair_date_4
            FROM desktop_computer
            WHERE 1=1`;

        const params = [];
        if (yearFilter.value.trim()) {
            sql += ' AND YEAR LIKE ?';
            params.push('%' + yearFilter.value.trim() + '%');
        }
        if (divisionFilter.value) {
            sql += ' AND Division = ?';
            params.push(divisionFilter.value);
        }

        try {
            const rows = await window.electronAPI.dbQuery(sql, params);
            console.log('Fetched rows:', rows);
            tbody.innerHTML = '';

            if (rows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; color:gray;">No data found</td></tr>`;
                return;
            }

            rows.forEach((row, idx) => {
                console.log('Row PRN:', row.PRN);
                const tr = document.createElement('tr');
                tr.dataset.sn = row.sn;
                tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td>${row.brand_model}</td>
                    <td>${row.sn}</td>
                    <td>${row.PRN}</td>
                    <td>${row.Division}</td>
                    <td>${row.User}</td>
             
        <td>${row.YEAR}</td>
                    <td>${row.cpu_moniter}</td>
                    <td>${formatDate(row.repair_date_1)}</td>
                    <td>${formatDate(row.repair_date_2)}</td>
                    <td>${formatDate(row.repair_date_3)}</td>
                    <td>${formatDate(row.repair_date_4)}</td>
                    <td>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <button class="edit-btn" data-sn="${row.sn}">Edit</button>
                            <button class="delete-btn" data-sn="${row.sn}">Delete</button>
                        </div>
                    </td>`;
                tbody.appendChild(tr);
            });

            attachEventListeners();
        } catch (err) {
            console.error(err);
            tbody.innerHTML = `<tr><td colspan="12" style="color:red; text-align:center;">Error loading data</td></tr>`;
        }
    }

    function renderTable(rows) {
        tbody.innerHTML = '';
        if (!rows || rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; color:gray;">No data found</td></tr>`;
            return;
        }
        rows.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.dataset.sn = row.sn;
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${row.brand_model || row["Brand & Model No"]}</td>
                <td>${row.sn || row["S/N"]}</td>
                <td>${row.PRN}</td>
                <td>${row.Division}</td>
                <td>${row.User}</td>
                <td>${row.YEAR || row["Year"]}</td>
                <td>${row.cpu_moniter || row["CPU/MONITER"]}</td>
                <td>${formatDate(row.repair_date_1 || row["1st Repair Date"])} </td>
                <td>${formatDate(row.repair_date_2 || row["2nd Repair Date"])} </td>
                <td>${formatDate(row.repair_date_3 || row["3rd Repair Date"])} </td>
                <td>${formatDate(row.repair_date_4 || row["4th Repair Date"])} </td>
                <td>
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <button class="edit-btn" data-sn="${row.sn || row["S/N"]}">Edit</button>
                        <button class="delete-btn" data-sn="${row.sn || row["S/N"]}">Delete</button>
                    </div>
                </td>`;
            tbody.appendChild(tr);
        });
        attachEventListeners();
    }

    function attachEventListeners() {
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = e => {
                const tr = e.target.closest('tr');
                if (document.querySelector('tr.editing')) {
                    alert("Please save or cancel the current edit before editing another row.");
                    return;
                }
                startEdit(tr);
            };
        });

        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = async e => {
                const tr = e.target.closest('tr');
                const sn = tr.dataset.sn;
                if (confirm('Are you sure you want to delete this record?')) {
                    try {
                        await window.electronAPI.dbDelete(sn);
                        alert('Deleted successfully');
                        loadData();
                    } catch (err) {
                        alert('Delete failed: ' + err.message);
                    }
                }
            };
        });
    }

    function startEdit(tr) {
        tr.classList.add('editing');
        tr.style.position = 'relative';
        tr.style.zIndex = 10;
        const cells = tr.querySelectorAll('td');
        const original = [...cells].map(td => td.innerHTML);

        cells.forEach((td, idx) => {
            if (idx === 2) return; // S/N read only
            if (idx === 12) { // Actions column
                td.innerHTML = `
                    <button class="save-btn">Save</button>
                    <button class="cancel-btn">Cancel</button>`;
            } else if (idx >= 8 && idx <= 11) {
                const val = td.textContent.trim();
                // Only show date if value is in YYYY-MM-DD format
                td.innerHTML = `<input type="date" value="${/^[\d]{4}-[\d]{2}-[\d]{2}$/.test(val) ? val : ''}" />`;
            } else if (idx === 4) { // Division column (select)
                const val = td.textContent.trim();
                td.innerHTML = `
                    <select>
                        <option value="">Select Division</option>
                        <option value="IT" ${val === 'IT' ? 'selected' : ''}>IT</option>
                        <option value="admin" ${val === 'admin' ? 'selected' : ''}>admin</option>
                        <option value="Lab" ${val === 'Lab' ? 'selected' : ''}>Lab</option>
                        <option value="Export" ${val === 'Export' ? 'selected' : ''}>Export</option>
                        <option value="Finance" ${val === 'Finance' ? 'selected' : ''}>Finance</option>
                    </select>`;
            } else if (idx !== 0) { // No column is not editable
                td.innerHTML = `<input type="text" value="${td.textContent.trim()}" />`;
            }
        });

        // Force-enable all inputs/selects in edit mode
        tr.querySelectorAll('input, select').forEach(input => {
            input.removeAttribute('readonly');
            input.removeAttribute('disabled');
            input.style.pointerEvents = 'auto';
            input.style.opacity = 1;
            input.style.zIndex = 100;
            input.style.position = 'relative';
        });

        // Focus the first input field automatically for better UX
        const firstInput = tr.querySelector('td input, td select');
        if (firstInput) firstInput.focus();

        const actionTd = cells[12];
        actionTd.querySelector('.save-btn').onclick = async () => {
            const inputs = tr.querySelectorAll('td > input, td > select');
            const updated = {
                brand_model: inputs[0].value.trim(),      // Brand & Model No
                sn: cells[2].textContent.trim(),          // S/N
                PRN: inputs[1].value.trim(),              // PRN
                Division: inputs[2].value,                // Division
                User: inputs[3].value.trim(),             // User
                YEAR: inputs[4].value.trim(),             // Year
                cpu_moniter: inputs[5].value.trim(),      // CPU/MONITER
                repair_date_1: inputs[6].value || null,   // 1st Repair Date
                repair_date_2: inputs[7].value || null,   // 2nd Repair Date
                repair_date_3: inputs[8].value || null,   // 3rd Repair Date
                repair_date_4: inputs[9].value || null    // 4th Repair Date
            };

            function isValidDate(val) {
                return !val || /^\d{4}-\d{2}-\d{2}$/.test(val);
            }
            if (
                !isValidDate(updated.repair_date_1) ||
                !isValidDate(updated.repair_date_2) ||
                !isValidDate(updated.repair_date_3) ||
                !isValidDate(updated.repair_date_4)
            ) {
                alert('Please enter valid dates for repair date fields (YYYY-MM-DD).');
                return;
            }

            try {
                await window.electronAPI.updateDesktop(updated);
                alert('Updated successfully');
                loadData();
            } catch (err) {
                alert('Update failed: ' + err.message);
            }
        };

        actionTd.querySelector('.cancel-btn').onclick = () => {
            cells.forEach((td, i) => td.innerHTML = original[i]);
            tr.classList.remove('editing');
            tr.style.position = '';
            tr.style.zIndex = '';
            attachEventListeners();
        };
    }

    createBtn.onclick = () => createModal.classList.add('show');
    cancelCreate.onclick = () => {
        createModal.style.display = 'none';
        createForm.reset();
    };

    createForm.onsubmit = async e => {
        e.preventDefault();
        const newRecord = {
            brand_model: newBrandModel.value.trim(),
            sn: newSN.value.trim(),
            PRN: newPRN.value.trim(),
            Division: newDivision.value,
            User: newUser.value.trim(),
            YEAR: newYear.value.trim(),
            cpu_moniter: newCpuMonitor.value.trim(),
            repair_date_1: newRepairDate1.value || null,
            repair_date_2: newRepairDate2.value || null,
            repair_date_3: newRepairDate3.value || null,
            repair_date_4: newRepairDate4.value || null
        };

        try {
            await window.electronAPI.dbCreate(newRecord);
            alert('Record created successfully!');
            createModal.style.display = 'none';
            createForm.reset();
            loadData();
        } catch (err) {
            alert('Failed to create record: ' + err.message);
        }
    };

    // On page load
    loadData();

    document.getElementById('desktopBtn').addEventListener('click', () => {
        // Hide the create modal if open
        if (createModal) {
            createModal.classList.remove('show');
            createModal.style.display = 'none';
        }
        window.location.href = 'index.html';
    });

    // SCANNER PAGE LOGIC
    if (document.getElementById('scanner-data-body')) {
        const tbody = document.getElementById('scanner-data-body');
        const createForm = document.getElementById('scannerCreateForm');
        const createModal = document.getElementById('scannerCreateModal');
        const createBtn = document.getElementById('scanner-createBtn');
        const cancelCreate = document.getElementById('scanner-cancelCreate');

        async function loadScannerData() {
            const rows = await window.electronAPI.getScanners();
            tbody.innerHTML = '';
            if (!rows || rows.length === 0) {
                tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; color:gray;">No data found</td></tr>`;
                return;
            }
            rows.forEach((row, idx) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${idx + 1}</td>
                    <td>${row['Brand & Model No'] || ''}</td>
                    <td>${row['S/N'] || ''}</td>
                    <td>${row['Division'] || ''}</td>
                    <td>${row['User'] || ''}</td>
                    <td>${row['PRN'] || ''}</td>
                    <td>${row['YEAR'] || ''}</td>
                    <td>${row['1st Repair Date'] || ''}</td>
                    <td>${row['2nd Repair Date'] || ''}</td>
                    <td>${row['3rd Repair Date'] || ''}</td>
                    <td>${row['4th Repair Date'] || ''}</td>
                    <td>
                        <div style="display: flex; flex-direction: column; gap: 4px;">
                            <button class="edit-btn" data-sn="${row['S/N']}">Edit</button>
                            <button class="delete-btn" data-sn="${row['S/N']}">Delete</button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
            attachScannerEventListeners();
        }

        function attachScannerEventListeners() {
            tbody.querySelectorAll('.delete-btn').forEach(btn => {
                btn.onclick = async e => {
                    const sn = btn.getAttribute('data-sn');
                    if (confirm('Are you sure you want to delete this record?')) {
                        await window.electronAPI.deleteScanner(sn);
                        loadScannerData();
                    }
                };
            });
            // Edit logic can be added here if needed
        }

        createBtn.onclick = () => createModal.style.display = 'flex';
        cancelCreate.onclick = () => {
            createModal.style.display = 'none';
            createForm.reset();
        };
        createForm.onsubmit = async e => {
            e.preventDefault();
            const newRecord = {
                brand_model: createForm.querySelector('input[name="brand_model"]').value.trim(),
                sn: createForm.querySelector('input[name="sn"]').value.trim(),
                Division: createForm.querySelector('select[name="division"]').value,
                User: createForm.querySelector('input[name="user"]').value.trim(),
                PRN: createForm.querySelector('input[name="prn"]').value.trim(),
                YEAR: createForm.querySelector('input[name="year"]').value.trim(),
                repair_date_1: createForm.querySelector('input[name="repair_date_1"]').value || null,
                repair_date_2: createForm.querySelector('input[name="repair_date_2"]').value || null,
                repair_date_3: createForm.querySelector('input[name="repair_date_3"]').value || null,
                repair_date_4: createForm.querySelector('input[name="repair_date_4"]').value || null
            };
            await window.electronAPI.createScanner(newRecord);
            createModal.style.display = 'none';
            createForm.reset();
            loadScannerData();
        };
        loadScannerData();
    }

    // Show the create modal when Create New button is clicked
    if (createBtn && createModal) {
        createBtn.addEventListener('click', () => {
            createModal.style.display = 'flex';
        });
    }
    // Hide the create modal when Cancel is clicked
    if (cancelCreate && createModal && createForm) {
        cancelCreate.addEventListener('click', () => {
            createModal.style.display = 'none';
            createForm.reset();
        });
    }
    // Hide the create modal on page load
    if (createModal) {
        createModal.style.display = 'none';
    }

    // Handle form submit
    document.getElementById('createLaptopForm').onsubmit = async function (e) {
        e.preventDefault();
        const form = e.target;
        const row = {
            sn: form.sn.value,
            division: form.division.value,
            user: form.user.value,
            prn: form.prn.value,
            year: form.year.value,
            repair_date_1: form.repair_date_1.value,
            repair_date_2: form.repair_date_2.value,
            repair_date_3: form.repair_date_3.value,
            repair_date_4: form.repair_date_4.value
        };
        try {
            await window.electronAPI.createLaptopUser(row);
            alert('Laptop user created!');
            form.reset();
            document.getElementById('createModal').style.display = 'none';
            // Optionally refresh the table here
            window.location.reload();
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };
});
