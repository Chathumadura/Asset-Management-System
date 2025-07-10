window.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('photocopy-data-body');
    const createForm = document.getElementById('photocopyCreateForm');
    const createModal = document.getElementById('photocopyCreateModal');
    const createBtn = document.getElementById('photocopy-createBtn');
    const cancelCreate = document.getElementById('photocopy-cancelCreate');
    const backBtn = document.getElementById('photocopyBackBtn');

    const editModal = document.getElementById('photocopyEditModal'); // Get edit modal
    const editForm = document.getElementById('photocopyEditForm');   // Get edit form
    const cancelEdit = document.getElementById('photocopy-cancelEdit'); // Get edit cancel button

    let allRows = [];

    // Function to load and render Photocopy data
    async function loadPhotocopyData() {
        const rows = await window.electronAPI.getPhotocopy(); // Ensure this matches your IPC call for fetching photocopy data
        allRows = rows;
        renderTable(rows);
    }

    // Function to render the table with Photocopy data
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
        attachPhotocopyEventListeners();
    }

    // Function to apply filters
    function applyFilters() {
        const divisionValue = document.getElementById('photocopy-division-filter').value.trim().toLowerCase();
        const yearValue = document.getElementById('photocopy-year-filter').value.trim();
        const filtered = allRows.filter(row => {
            const divisionMatch = !divisionValue || (row.division || row['Division'] || '').toLowerCase() === divisionValue;
            const yearMatch = !yearValue || (row.year || row['Year'] || '').toString().includes(yearValue);
            return divisionMatch && yearMatch;
        });
        renderTable(filtered);
    }

    // Attach filter event listeners
    document.getElementById('photocopy-division-filter').addEventListener('change', applyFilters);
    document.getElementById('photocopy-year-filter').addEventListener('input', applyFilters);

    // Function to attach event listeners for edit and delete buttons
    function attachPhotocopyEventListeners() {
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = async e => {
                const sn = btn.getAttribute('data-sn');
                if (confirm('Are you sure you want to delete this record?')) {
                    await window.electronAPI.deletePhotocopy(sn); // Ensure this matches your IPC call for deleting photocopy data
                    loadPhotocopyData();
                }
            };
        });

        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = async e => {
                const snToEdit = btn.getAttribute('data-sn');
                // Find the full row data from allRows using the S/N
                const photocopyToEdit = allRows.find(row => row['S/N'] === snToEdit);

                if (photocopyToEdit) {
                    // Populate the edit form fields
                    document.getElementById('photocopy-edit-no').value = photocopyToEdit['No'] || ''; // Auto-generated/disabled
                    document.getElementById('photocopy-edit-brand-model').value = photocopyToEdit['Brand & Model No'] || '';
                    document.getElementById('photocopy-edit-sn').value = photocopyToEdit['S/N'] || '';
                    document.getElementById('photocopy-edit-division').value = photocopyToEdit['Division'] || '';
                    document.getElementById('photocopy-edit-user').value = photocopyToEdit['User'] || '';
                    document.getElementById('photocopy-edit-prn').value = photocopyToEdit['PRN'] || '';
                    document.getElementById('photocopy-edit-year').value = photocopyToEdit['Year'] || '';
                    document.getElementById('photocopy-edit-repair-date-1').value = photocopyToEdit['1st Repair Date'] || '';
                    document.getElementById('photocopy-edit-repair-date-2').value = photocopyToEdit['2nd Repair Date'] || '';
                    document.getElementById('photocopy-edit-repair-date-3').value = photocopyToEdit['3rd Repair Date'] || '';
                    document.getElementById('photocopy-edit-repair-date-4').value = photocopyToEdit['4th Repair Date'] || '';

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
            brand: createForm.querySelector('input[name="brand"]').value.trim(),
            model: createForm.querySelector('input[name="model"]').value.trim(),
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
            await window.electronAPI.createPhotocopy(newRecord); // Ensure this matches your IPC call for creating photocopy data
            alert('Photocopy record created successfully!');
            createModal.style.display = 'none';
            createForm.reset();
            loadPhotocopyData(); // Reload data to show new entry
        } catch (error) {
            alert('Error creating photocopy record: ' + error.message);
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
        const originalSn = document.getElementById('photocopy-edit-sn').value; // Get the S/N to identify the record
        const updatedPhotocopy = {
            // 'No' is disabled, so we don't need to send it if it's auto-generated
            'Brand & Model No': document.getElementById('photocopy-edit-brand-model').value.trim(),
            'S/N': document.getElementById('photocopy-edit-sn').value.trim(), // Send S/N again in case it's part of the update logic
            'Division': document.getElementById('photocopy-edit-division').value,
            'User': document.getElementById('photocopy-edit-user').value.trim(),
            'PRN': document.getElementById('photocopy-edit-prn').value.trim(),
            'Year': document.getElementById('photocopy-edit-year').value.trim(),
            '1st Repair Date': document.getElementById('photocopy-edit-repair-date-1').value || null,
            '2nd Repair Date': document.getElementById('photocopy-edit-repair-date-2').value || null,
            '3rd Repair Date': document.getElementById('photocopy-edit-repair-date-3').value || null,
            '4th Repair Date': document.getElementById('photocopy-edit-repair-date-4').value || null
        };

        try {
            // Assuming window.electronAPI.updatePhotocopy takes the original S/N and the updated data object
            await window.electronAPI.updatePhotocopy(originalSn, updatedPhotocopy); // Ensure this matches your IPC call for updating photocopy data
            alert('Photocopy record updated successfully!');
            editModal.style.display = 'none';
            editForm.reset();
            loadPhotocopyData(); // Reload data to show updated entry
        } catch (error) {
            alert('Error updating photocopy record: ' + error.message);
        }
    };

    // Back button functionality
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = 'index.html';
        };
    }

    // Initial load of data when the page loads
    loadPhotocopyData();
});