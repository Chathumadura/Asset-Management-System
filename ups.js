window.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('ups-data-body');
    const createForm = document.getElementById('upsCreateForm');
    const createModal = document.getElementById('upsCreateModal');
    const createBtn = document.getElementById('ups-createBtn');
    const cancelCreate = document.getElementById('ups-cancelCreate');
    const backBtn = document.getElementById('upsBackBtn');

    const editModal = document.getElementById('upsEditModal'); // Get edit modal
    const editForm = document.getElementById('upsEditForm');   // Get edit form
    const cancelEdit = document.getElementById('ups-cancelEdit'); // Get edit cancel button

    let allRows = [];

    // Function to load and render UPS data
    async function loadUPSData() {
        const rows = await window.electronAPI.getUPSs();
        allRows = rows;
        renderTable(rows);
    }

    // Function to render the table with UPS data
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
                <td>${row['Year'] || ''}</td>
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
        attachUPSEventListeners();
    }

    // Function to apply filters
    function applyFilters() {
        const divisionValue = document.getElementById('ups-division-filter').value.trim().toLowerCase();
        const yearValue = document.getElementById('ups-year-filter').value.trim();
        const filtered = allRows.filter(row => {
            const divisionMatch = !divisionValue || (row.division || row['Division'] || '').toLowerCase() === divisionValue;
            const yearMatch = !yearValue || (row.year || row['Year'] || '').toString().includes(yearValue);
            return divisionMatch && yearMatch;
        });
        renderTable(filtered);
    }

    // Attach filter event listeners
    document.getElementById('ups-division-filter').addEventListener('change', applyFilters);
    document.getElementById('ups-year-filter').addEventListener('input', applyFilters);

    // Function to attach event listeners for edit and delete buttons
    function attachUPSEventListeners() {
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = async e => {
                const sn = btn.getAttribute('data-sn');
                if (confirm('Are you sure you want to delete this record?')) {
                    await window.electronAPI.deleteUPS(sn);
                    loadUPSData();
                }
            };
        });

        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = async e => {
                const snToEdit = btn.getAttribute('data-sn');
                // Find the full row data from allRows using the S/N
                const upsToEdit = allRows.find(row => row['S/N'] === snToEdit);

                if (upsToEdit) {
                    // Populate the edit form fields
                    document.getElementById('ups-edit-no').value = upsToEdit['No'] || ''; // Auto-generated/disabled
                    document.getElementById('ups-edit-brand-model').value = upsToEdit['Brand & Model No'] || '';
                    document.getElementById('ups-edit-sn').value = upsToEdit['S/N'] || '';
                    document.getElementById('ups-edit-division').value = upsToEdit['Division'] || '';
                    document.getElementById('ups-edit-user').value = upsToEdit['User'] || '';
                    document.getElementById('ups-edit-prn').value = upsToEdit['PRN'] || '';
                    document.getElementById('ups-edit-year').value = upsToEdit['Year'] || '';
                    document.getElementById('ups-edit-repair-date-1').value = upsToEdit['1st Repair Date'] || '';
                    document.getElementById('ups-edit-repair-date-2').value = upsToEdit['2nd Repair Date'] || '';
                    document.getElementById('ups-edit-repair-date-3').value = upsToEdit['3rd Repair Date'] || '';
                    document.getElementById('ups-edit-repair-date-4').value = upsToEdit['4th Repair Date'] || '';

                    // Display the edit modal
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
        const newRecord = {
            brand_model: createForm.querySelector('input[name="brand_model"]').value.trim(),
            sn: createForm.querySelector('input[name="sn"]').value.trim(),
            division: createForm.querySelector('select[name="division"]').value,
            user: createForm.querySelector('input[name="user"]').value.trim(),
            prn: createForm.querySelector('input[name="prn"]').value.trim(),
            year: createForm.querySelector('input[name="year"]').value.trim(),
            repair_date_1: createForm.querySelector('input[name="repair_date_1"]').value || null,
            repair_date_2: createForm.querySelector('input[name="repair_date_2"]').value || null,
            repair_date_3: createForm.querySelector('input[name="repair_date_3"]').value || null,
            repair_date_4: createForm.querySelector('input[name="repair_date_4"]').value || null
        };
        try {
            await window.electronAPI.createUPS(newRecord);
            alert('UPS created successfully!');
            createModal.style.display = 'none';
            createForm.reset();
            loadUPSData(); // Reload data to show new entry
        } catch (error) {
            alert('Error creating UPS: ' + error.message);
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
        const originalSn = document.getElementById('ups-edit-sn').value; // Get the S/N to identify the record
        const updatedUPS = {
            // 'No' is disabled, so we don't need to send it if it's auto-generated
            'Brand & Model No': document.getElementById('ups-edit-brand-model').value.trim(),
            'S/N': document.getElementById('ups-edit-sn').value.trim(), // Send S/N again in case it's part of the update logic
            'Division': document.getElementById('ups-edit-division').value,
            'User': document.getElementById('ups-edit-user').value.trim(),
            'PRN': document.getElementById('ups-edit-prn').value.trim(),
            'Year': document.getElementById('ups-edit-year').value.trim(),
            '1st Repair Date': document.getElementById('ups-edit-repair-date-1').value || null,
            '2nd Repair Date': document.getElementById('ups-edit-repair-date-2').value || null,
            '3rd Repair Date': document.getElementById('ups-edit-repair-date-3').value || null,
            '4th Repair Date': document.getElementById('ups-edit-repair-date-4').value || null
        };

        try {
            // Assuming window.electronAPI.updateUPS takes the original S/N and the updated data object
            await window.electronAPI.updateUPS(originalSn, updatedUPS);
            alert('UPS updated successfully!');
            editModal.style.display = 'none';
            editForm.reset();
            loadUPSData(); // Reload data to show updated entry
        } catch (error) {
            alert('Error updating UPS: ' + error.message);
        }
    };

    // Back button functionality
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = 'index.html';
        };
    }

    // Initial load of data when the page loads
    loadUPSData();
});