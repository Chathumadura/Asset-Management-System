window.addEventListener('DOMContentLoaded', () => {

    // Date formatting utility functions
    function formatDate(dateString) {
        if (!dateString || dateString === '') return '';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return dateString;
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (e) {
            return dateString;
        }
    }




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
            tbody.innerHTML = `<tr><td colspan="14" style="text-align:center; color:red;">Error loading data: ${error.message}</td></tr>`;
        }
    }

    // --- Populate Division Filter ---
    function populateDivisionFilter(rows) {
        divisionFilter.innerHTML = '<option value="">All</option>'; // Always start with 'All'

        const divisions = new Set();
        rows.forEach(row => {
            if (row.division) {
                divisions.add(row.division);
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

        rows.forEach((row) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.id}</td>
                <td>${row.brand || ''}</td>
                <td>${row.model || ''}</td>
                <td>${row.sn || ''}</td>
                <td>${row.division || ''}</td>
                <td>${row.user || ''}</td>
                <td>${row.prn || ''}</td>
                <td>${row.year || ''}</td>
                <td>${row.ip_address || ''}</td>
                <td>${formatDate(row.repair_date_1)}</td>
                <td>${formatDate(row.repair_date_2)}</td>
                <td>${formatDate(row.repair_date_3)}</td>
                <td>${formatDate(row.repair_date_4)}</td>
                <td>
                    <button class="edit-btn" data-id="${row.id}">Edit</button>
                    <button class="delete-btn" data-id="${row.id}">Delete</button>
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
            const rowDivision = (row.division || '').toLowerCase();
            const rowYear = (row.year || '').toString();

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
                const id = btn.getAttribute('data-id'); // Get ID from data attribute
                if (confirm('Are you sure you want to delete this record?')) {
                    try {
                        await window.electronAPI.deletePrinter(id); // Pass ID to delete API
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
                const id = btn.getAttribute('data-id'); // Get ID from data attribute
                // Find the full row data using the ID
                const printerToEdit = allRows.find(p => p.id == parseInt(id));

                if (!printerToEdit) {
                    console.error('Printer with ID ' + id + ' not found for editing.');
                    alert('Could not find printer data to edit.');
                    return;
                }

                // Populate the form fields in the edit modal
                document.getElementById('printers-edit-no').value = printerToEdit.id || '';
                document.getElementById('printers-edit-brand').value = printerToEdit.brand || '';
                document.getElementById('printers-edit-model').value = printerToEdit.model || '';
                document.getElementById('printers-edit-sn').value = printerToEdit.sn || ''; // S/N is readonly
                document.getElementById('printers-edit-division').value = printerToEdit.division || '';
                document.getElementById('printers-edit-user').value = printerToEdit.user || '';
                document.getElementById('printers-edit-prn').value = printerToEdit.prn || '';
                document.getElementById('printers-edit-year').value = printerToEdit.year || '';
                document.getElementById('printers-edit-ip-address').value = printerToEdit.ip_address || '';
                document.getElementById('printers-edit-repair-date-1').value = printerToEdit.repair_date_1 || '';
                document.getElementById('printers-edit-repair-date-2').value = printerToEdit.repair_date_2 || '';
                document.getElementById('printers-edit-repair-date-3').value = printerToEdit.repair_date_3 || '';
                document.getElementById('printers-edit-repair-date-4').value = printerToEdit.repair_date_4 || '';

                // Store the ID in a data attribute on the modal for easy access on form submission
                editModal.setAttribute('data-id', id);
                editModal.classList.add('show'); // Show the modal
            };
        });
    }

    // --- Create New Printer (Modal & Form) ---
    createBtn.onclick = () => createModal.classList.add('show'); // Show create modal
    cancelCreate.onclick = () => { // Cancel create
        createModal.classList.remove('show');
        createForm.reset();
    };

    createForm.onsubmit = async function (e) {
        e.preventDefault(); // Prevent default form submission
        const form = e.target; // Reference to the form

        const newRecord = {
            // Ensure these keys match what your createPrinter Electron API expects (database column names)
            brand: form.querySelector('input[name="brand"]').value.trim(),
            model: form.querySelector('input[name="model"]').value.trim(),
            sn: form.querySelector('input[name="sn"]').value.trim(),
            division: form.querySelector('select[name="division"]').value,
            user: form.querySelector('input[name="user"]').value.trim(),
            prn: form.querySelector('input[name="prn"]').value.trim(),
            year: form.querySelector('input[name="year"]').value.trim(),
            ip_address: form.querySelector('input[name="ip_address"]').value.trim(),
            repair_date_1: form.querySelector('input[name="repair_date_1"]').value || null,
            repair_date_2: form.querySelector('input[name="repair_date_2"]').value || null,
            repair_date_3: form.querySelector('input[name="repair_date_3"]').value || null,
            repair_date_4: form.querySelector('input[name="repair_date_4"]').value || null
        };

        try {
            await window.electronAPI.createPrinter(newRecord); // Call Electron API to create
            createModal.classList.remove('show'); // Hide modal
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
        editModal.classList.remove('show');
        editForm.reset();
    };

    editForm.onsubmit = async function (e) {
        e.preventDefault(); // Prevent default form submission

        const targetId = editModal.getAttribute('data-id'); // Get the ID stored on the modal

        const updatedRecord = {
            brand: document.getElementById('printers-edit-brand').value.trim(),
            model: document.getElementById('printers-edit-model').value.trim(),
            sn: document.getElementById('printers-edit-sn').value.trim(),
            division: editForm.querySelector('select[name="division"]').value,
            user: editForm.querySelector('input[name="user"]').value.trim(),
            prn: editForm.querySelector('input[name="prn"]').value.trim(),
            year: editForm.querySelector('input[name="year"]').value.trim(),
            ip_address: editForm.querySelector('input[name="ip_address"]').value.trim(),
            repair_date_1: editForm.querySelector('input[name="repair_date_1"]').value || null,
            repair_date_2: editForm.querySelector('input[name="repair_date_2"]').value || null,
            repair_date_3: editForm.querySelector('input[name="repair_date_3"]').value || null,
            repair_date_4: editForm.querySelector('input[name="repair_date_4"]').value || null
        };

        try {
            // Pass the identifier (targetId) and the updated data object
            await window.electronAPI.updatePrinter(targetId, updatedRecord);
            editModal.classList.remove('show'); // Hide modal
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

    // Generate PDF report function
    async function generateReport() {
        try {
            // Get the current filtered data
            const divisionValue = document.getElementById('printers-division-filter').value.trim().toLowerCase();
            const yearValue = document.getElementById('printers-year-filter').value.trim();

            const filtered = allRows.filter(row => {
                const divisionMatch = !divisionValue || (row.division || '').toLowerCase().includes(divisionValue);
                const yearMatch = !yearValue || (row.year || '').toString().includes(yearValue);
                return divisionMatch && yearMatch;
            });

            if (filtered.length === 0) {
                alert('No data available to generate report!');
                return;
            }

            // Create PDF document
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(16);
            doc.text('Printers Report', 14, 15);
            doc.setFontSize(10);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

            // Add filter information if any filters are applied
            let filterInfo = '';
            if (divisionValue) {
                filterInfo += `Division: ${divisionValue} `;
            }
            if (yearValue) {
                filterInfo += `Year: ${yearValue}`;
            }
            if (filterInfo) {
                doc.text(`Filters: ${filterInfo}`, 14, 29);
            }

            // Prepare table data
            const tableData = filtered.map(row => [
                row.id || '',
                row.brand || '',
                row.model || '',
                row.sn || '',
                row.division || '',
                row.user || '',
                row.prn || '',
                row.year || '',
                row.ip_address || '',
                formatDate(row.repair_date_1) || '',
                formatDate(row.repair_date_2) || '',
                formatDate(row.repair_date_3) || '',
                formatDate(row.repair_date_4) || ''
            ]);

            // Define table columns
            const tableColumns = [
                { header: 'No', dataKey: 'id' },
                { header: 'Brand', dataKey: 'brand' },
                { header: 'Model', dataKey: 'model' },
                { header: 'S/N', dataKey: 'sn' },
                { header: 'Division', dataKey: 'division' },
                { header: 'User', dataKey: 'user' },
                { header: 'PRN', dataKey: 'prn' },
                { header: 'Year', dataKey: 'year' },
                { header: 'IP Address', dataKey: 'ip_address' },
                { header: '1st Repair Date', dataKey: 'repair_date_1' },
                { header: '2nd Repair Date', dataKey: 'repair_date_2' },
                { header: '3rd Repair Date', dataKey: 'repair_date_3' },
                { header: '4th Repair Date', dataKey: 'repair_date_4' }
            ];

            // Add table to PDF
            doc.autoTable({
                head: [tableColumns.map(col => col.header)],
                body: tableData,
                startY: 35,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [66, 139, 202] },
                alternateRowStyles: { fillColor: [240, 240, 240] },
                margin: { top: 35 }
            });

            // Add page numbers
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width / 2,
                    doc.internal.pageSize.height - 10, { align: 'center' });
            }

            // Save the PDF
            const fileName = `Printers_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
            doc.save(fileName);

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report: ' + error.message);
        }
    }
});
