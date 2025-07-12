window.addEventListener('DOMContentLoaded', () => {
    const tbody = document.getElementById('printers-data-body');
    const createForm = document.getElementById('printersCreateForm');
    const createModal = document.getElementById('printersCreateModal');
    const createBtn = document.getElementById('printers-createBtn');
    const cancelCreate = document.getElementById('printers-cancelCreate');
    const backBtn = document.getElementById('printersBackBtn');

    // --- Elements for Edit functionality ---
    const editModal = document.getElementById('printersEditModal');
    const editForm = document.getElementById('printersEditForm');
    const cancelEdit = document.getElementById('printers-cancelEdit');
    // --- End elements for Edit functionality ---

    const divisionFilter = document.getElementById('printers-division-filter');
    const yearFilter = document.getElementById('printers-year-filter'); // Get reference to year filter

    let allRows = [];

    // --- Initial Data Load ---
    async function loadPrintersData() {
        try {
            // Assume getPrinters returns an array of objects where keys match table headers (e.g., 'S/N', 'Division')
            allRows = await window.electronAPI.getPrinters();
            renderTable(allRows);
            populateDivisionFilter(allRows); // Populate division filter with unique values
        } catch (error) {
            console.error('Error loading printers data:', error);
            tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; color:red;">Error loading data: ${error.message}</td></tr>`;
        }
    }

    // --- Populate Division Filter ---
    function populateDivisionFilter(rows) {
        divisionFilter.innerHTML = '<option value="">All</option>'; // Always start with 'All'

        const divisions = new Set();
        rows.forEach(row => {
            if (row['Division']) {
                divisions.add(row['Division']);
            }
        });

        // Add unique divisions from data to the dropdown
        divisions.forEach(division => {
            const option = document.createElement('option');
            option.value = division;
            option.textContent = division;
            divisionFilter.appendChild(option);
        });
    }

    // --- Render Table ---
    function renderTable(rows) {
        tbody.innerHTML = ''; // Clear existing rows

        if (!rows || rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; color:gray;">No data found</td></tr>`;
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
                <td>${row['IP Address'] || ''}</td>
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
        attachPrintersEventListeners(); // Re-attach listeners for new buttons
    }

    // --- Apply Filters ---
    function applyFilters() {
        const divisionValue = divisionFilter.value.trim().toLowerCase();
        const yearValue = yearFilter.value.trim(); // Use the yearFilter reference

        const filtered = allRows.filter(row => {
            const rowDivision = (row.division || row['Division'] || '').toLowerCase();
            const rowYear = (row.year || row['Year'] || '').toString();

            const divisionMatch = !divisionValue || rowDivision === divisionValue;
            // Use .includes for year filter to allow partial matches (e.g., "202" matches "2023")
            const yearMatch = !yearValue || rowYear.includes(yearValue);

            return divisionMatch && yearMatch;
        });
        renderTable(filtered);
    }

    // --- Filter Event Listeners ---
    divisionFilter.addEventListener('change', applyFilters);
    yearFilter.addEventListener('input', applyFilters); // Listen to input for immediate filtering

    // --- Attach Event Listeners for Actions (Edit/Delete) ---
    function attachPrintersEventListeners() {
        // Delete functionality
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = async () => {
                const sn = btn.getAttribute('data-sn'); // Get S/N from data attribute
                if (confirm('Are you sure you want to delete this record?')) {
                    try {
                        await window.electronAPI.deletePrinter(sn); // Pass S/N to delete API
                        loadPrintersData(); // Reload data
                        alert('Printer deleted successfully!');
                    } catch (error) {
                        console.error('Error deleting printer:', error);
                        alert('Failed to delete printer: ' + error.message);
                    }
                }
            };
        });

        // Edit functionality - Open Modal
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => {
                const sn = btn.getAttribute('data-sn'); // Get S/N from data attribute
                // Find the full row data using the S/N
                const printerToEdit = allRows.find(p => p['S/N'] == sn);

                if (!printerToEdit) {
                    console.error('Printer with S/N ' + sn + ' not found for editing.');
                    alert('Could not find printer data to edit.');
                    return;
                }

                // Populate the form fields in the edit modal
                document.getElementById('printers-edit-no').value = printerToEdit['No'] || '';
                document.getElementById('printers-edit-brand-model').value = printerToEdit['Brand & Model No'] || '';
                document.getElementById('printers-edit-sn').value = printerToEdit['S/N'] || ''; // S/N is readonly
                document.getElementById('printers-edit-division').value = printerToEdit['Division'] || '';
                document.getElementById('printers-edit-user').value = printerToEdit['User'] || '';
                document.getElementById('printers-edit-prn').value = printerToEdit['PRN'] || '';
                document.getElementById('printers-edit-year').value = printerToEdit['Year'] || '';
                document.getElementById('printers-edit-ip-address').value = printerToEdit['IP Address'] || '';
                document.getElementById('printers-edit-repair-date-1').value = printerToEdit['1st Repair Date'] || '';
                document.getElementById('printers-edit-repair-date-2').value = printerToEdit['2nd Repair Date'] || '';
                document.getElementById('printers-edit-repair-date-3').value = printerToEdit['3rd Repair Date'] || '';
                document.getElementById('printers-edit-repair-date-4').value = printerToEdit['4th Repair Date'] || '';

                // Store the S/N in a data attribute on the modal for easy access on form submission
                editModal.setAttribute('data-sn', sn);
                editModal.style.display = 'flex'; // Show the modal
            };
        });
    }

    // --- Create New Printer (Modal & Form) ---
    createBtn.onclick = () => createModal.style.display = 'flex'; // Show create modal
    cancelCreate.onclick = () => { // Cancel create
        createModal.style.display = 'none';
        createForm.reset();
    };

    createForm.onsubmit = async function (e) {
        e.preventDefault(); // Prevent default form submission
        const form = e.target; // Reference to the form

        const newRecord = {
            // Ensure these keys match what your createPrinter Electron API expects (database column names)
            'Brand & Model No': form.querySelector('input[name="brand_model"]').value.trim(),
            'S/N': form.querySelector('input[name="sn"]').value.trim(),
            'Division': form.querySelector('select[name="division"]').value,
            'User': form.querySelector('input[name="user"]').value.trim(),
            'PRN': form.querySelector('input[name="prn"]').value.trim(),
            'Year': form.querySelector('input[name="year"]').value.trim(),
            'IP Address': form.querySelector('input[name="ip_address"]').value.trim(),
            '1st Repair Date': form.querySelector('input[name="repair_date_1"]').value || null,
            '2nd Repair Date': form.querySelector('input[name="repair_date_2"]').value || null,
            '3rd Repair Date': form.querySelector('input[name="repair_date_3"]').value || null,
            '4th Repair Date': form.querySelector('input[name="repair_date_4"]').value || null
        };

        try {
            await window.electronAPI.createPrinter(newRecord); // Call Electron API to create
            createModal.style.display = 'none'; // Hide modal
            form.reset(); // Clear form
            loadPrintersData(); // Reload data to show new entry
            alert('Printer created successfully!');
        } catch (error) {
            console.error('Error creating printer:', error);
            alert('Failed to create printer: ' + error.message);
        }
    };

    // --- Edit Printer (Modal & Form) ---
    cancelEdit.onclick = () => { // Cancel edit
        editModal.style.display = 'none';
        editForm.reset();
    };

    editForm.onsubmit = async function (e) {
        e.preventDefault(); // Prevent default form submission

        const targetSn = editModal.getAttribute('data-sn'); // Get the S/N stored on the modal

        const updatedRecord = {
            // Keys should match your database column names / Electron API expected format
            'Brand & Model No': editForm.querySelector('input[name="brand_model"]').value.trim(),
            // 'S/N' is readonly in the form, but we send it back as the identifier, not as an updatable field value
            'Division': editForm.querySelector('select[name="division"]').value,
            'User': editForm.querySelector('input[name="user"]').value.trim(),
            'PRN': editForm.querySelector('input[name="prn"]').value.trim(),
            'Year': editForm.querySelector('input[name="year"]').value.trim(),
            'IP Address': editForm.querySelector('input[name="ip_address"]').value.trim(),
            '1st Repair Date': editForm.querySelector('input[name="repair_date_1"]').value || null,
            '2nd Repair Date': editForm.querySelector('input[name="repair_date_2"]').value || null,
            '3rd Repair Date': editForm.querySelector('input[name="repair_date_3"]').value || null,
            '4th Repair Date': editForm.querySelector('input[name="repair_date_4"]').value || null
        };

        try {
            // Pass the identifier (targetSn) and the updated data object
            await window.electronAPI.updatePrinter(targetSn, updatedRecord);
            editModal.style.display = 'none'; // Hide modal
            editForm.reset(); // Clear form
            loadPrintersData(); // Reload data to reflect changes
            alert('Printer updated successfully!');
        } catch (error) {
            console.error('Error updating printer:', error);
            alert('Failed to update printer: ' + error.message);
        }
    };

    // --- Back Button ---
    if (backBtn) {
        backBtn.onclick = () => {
            window.location.href = 'index.html';
        };
    }

    // Initial load of data when the page loads
    loadPrintersData();
});