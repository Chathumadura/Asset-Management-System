window.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('scanner-data-body');
    const createForm = document.getElementById('scannerCreateForm');
    const createModal = document.getElementById('scannerCreateModal');
    const createBtn = document.getElementById('scanner-createBtn');
    const cancelCreate = document.getElementById('scanner-cancelCreate');

    const editModal = document.getElementById('scannerEditModal');
    const editForm = document.getElementById('scannerEditForm');
    const cancelEdit = document.getElementById('scanner-cancelEdit');

    let allRows = [];

    // Function to load and render scanner data
    async function loadScannerData() {
        const rows = await window.electronAPI.getScanners();
        allRows = rows;
        renderTable(rows);
    }

    // Function to render the table with scanner data
    function renderTable(rows) {
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
                <td>${row['YEAR'] || row['Year'] || ''}</td>
                <td>${row['1st Repair Date'] || ''}</td>
                <td>${row['2nd Repair Date'] || ''}</td>
                <td>${row['3rd Repair Date'] || ''}</td>
                <td>${row['4th Repair Date'] || ''}</td>
                <td>
                    <button class="edit-btn" data-sn="${row['S/N']}">Edit</button>
                    <button class="delete-btn" data-sn="${row['S/N']}">Delete</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
        attachScannerEventListeners();
    }

    // Function to apply filters
    function applyFilters() {
        const divisionValue = document.getElementById('scanner-division-filter').value.trim().toLowerCase();
        const yearValue = document.getElementById('scanner-year-filter').value.trim();
        const filtered = allRows.filter(row => {
            const divisionMatch = !divisionValue || (row.division || row['Division'] || '').toLowerCase() === divisionValue;
            const yearMatch = !yearValue || (row.year || row['Year'] || row['YEAR'] || '').toString().includes(yearValue);
            return divisionMatch && yearMatch;
        });
        renderTable(filtered);
    }

    // Attach filter event listeners
    document.getElementById('scanner-division-filter').addEventListener('change', applyFilters);
    document.getElementById('scanner-year-filter').addEventListener('input', applyFilters);

    // Function to attach event listeners for edit and delete buttons
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

        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = async e => {
                const snToEdit = btn.getAttribute('data-sn');
                const scannerToEdit = allRows.find(row => row['S/N'] === snToEdit);

                if (scannerToEdit) {
                    document.getElementById('scanner-edit-sn').value = scannerToEdit['S/N'] || '';
                    document.getElementById('scanner-edit-brand-model').value = scannerToEdit['Brand & Model No'] || '';
                    document.getElementById('scanner-edit-division').value = scannerToEdit['Division'] || '';
                    document.getElementById('scanner-edit-user').value = scannerToEdit['User'] || '';
                    document.getElementById('scanner-edit-prn').value = scannerToEdit['PRN'] || '';
                    document.getElementById('scanner-edit-year').value = scannerToEdit['YEAR'] || scannerToEdit['Year'] || '';
                    document.getElementById('scanner-edit-repair-date-1').value = scannerToEdit['1st Repair Date'] || '';
                    document.getElementById('scanner-edit-repair-date-2').value = scannerToEdit['2nd Repair Date'] || '';
                    document.getElementById('scanner-edit-repair-date-3').value = scannerToEdit['3rd Repair Date'] || '';
                    document.getElementById('scanner-edit-repair-date-4').value = scannerToEdit['4th Repair Date'] || '';

                    editModal.style.display = 'flex';
                }
            };
        });
    }

    // Event listeners for Create Modal
    createBtn.onclick = () => {
        createModal.style.display = 'flex';
        createForm.reset(); // Clear form on open
    };
    cancelCreate.onclick = () => {
        createModal.style.display = 'none';
        createForm.reset();
    };

    // Handle Create Form submission
    createForm.onsubmit = async e => {
        e.preventDefault();
        const row = {
            sn: document.getElementById('scanner-new-sn').value,
            'Brand & Model No': document.getElementById('scanner-new-brand-model').value, // Added this field
            division: document.getElementById('scanner-new-division').value,
            user: document.getElementById('scanner-new-user').value,
            prn: document.getElementById('scanner-new-prn').value,
            year: document.getElementById('scanner-new-year').value,
            repair_date_1: document.getElementById('scanner-new-repair-date-1').value,
            repair_date_2: document.getElementById('scanner-new-repair-date-2').value,
            repair_date_3: document.getElementById('scanner-new-repair-date-3').value,
            repair_date_4: document.getElementById('scanner-new-repair-date-4').value
        };
        try {
            await window.electronAPI.createScanner(row);
            alert('Scanner created successfully!');
            createModal.style.display = 'none';
            createForm.reset();
            loadScannerData(); // Reload data to show new entry
        } catch (err) {
            alert('Error creating scanner: ' + err.message);
        }
    };

    // Event listener for Edit Modal Cancel button
    cancelEdit.onclick = () => {
        editModal.style.display = 'none';
        editForm.reset(); // Clear form on cancel
    };

    // Handle Edit Form submission
    editForm.onsubmit = async e => {
        e.preventDefault();
        const updatedScanner = {
            originalSn: document.getElementById('scanner-edit-sn').value, // Use this for identifying the record
            'S/N': document.getElementById('scanner-edit-sn').value,
            'Brand & Model No': document.getElementById('scanner-edit-brand-model').value,
            Division: document.getElementById('scanner-edit-division').value,
            User: document.getElementById('scanner-edit-user').value,
            PRN: document.getElementById('scanner-edit-prn').value,
            Year: document.getElementById('scanner-edit-year').value,
            '1st Repair Date': document.getElementById('scanner-edit-repair-date-1').value,
            '2nd Repair Date': document.getElementById('scanner-edit-repair-date-2').value,
            '3rd Repair Date': document.getElementById('scanner-edit-repair-date-3').value,
            '4th Repair Date': document.getElementById('scanner-edit-repair-date-4').value
        };

        try {
            // Assuming your updateScanner function takes the original S/N and the updated data
            await window.electronAPI.updateScanner(updatedScanner.originalSn, updatedScanner);
            alert('Scanner updated successfully!');
            editModal.style.display = 'none';
            editForm.reset();
            loadScannerData(); // Reload data to show updated entry
        } catch (err) {
            alert('Error updating scanner: ' + err.message);
        }
    };

    // Initial load of data
    loadScannerData();
});