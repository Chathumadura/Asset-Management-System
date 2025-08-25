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

    // Function to format dates for display
    function formatDate(dateValue) {
        if (!dateValue) return '';
        try {
            const date = new Date(dateValue);
            if (isNaN(date.getTime())) return dateValue; // Return original if invalid date
            return date.toLocaleDateString('en-GB'); // Format as DD/MM/YYYY
        } catch (error) {
            return dateValue; // Return original if error
        }
    }

    // Function to render the table with scanner data
    function renderTable(rows) {
        tbody.innerHTML = '';
        if (!rows || rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="12" style="text-align:center; color:gray;">No data found</td></tr>`;
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
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this record?')) {
                    await window.electronAPI.deleteScanner(id);
                    loadScannerData();
                }
            };
        });

        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => {
                const idToEdit = btn.getAttribute('data-id');
                const row = allRows.find(row => row.id == idToEdit);

                if (!row) return;
                document.getElementById('scanner-edit-sn').value = row.sn || '';
                document.getElementById('scanner-edit-brand').value = row.brand || '';
                document.getElementById('scanner-edit-model').value = row.model || '';
                document.getElementById('scanner-edit-division').value = row.division || '';
                document.getElementById('scanner-edit-user').value = row.user || '';
                document.getElementById('scanner-edit-prn').value = row.prn || '';
                document.getElementById('scanner-edit-year').value = row.year || '';
                document.getElementById('scanner-edit-repair-date-1').value = row.repair_date_1 || '';
                document.getElementById('scanner-edit-repair-date-2').value = row.repair_date_2 || '';
                document.getElementById('scanner-edit-repair-date-3').value = row.repair_date_3 || '';
                document.getElementById('scanner-edit-repair-date-4').value = row.repair_date_4 || '';

                const editModal = document.getElementById('scannerEditModal');
                editModal.setAttribute('data-id', idToEdit);
                editModal.style.display = 'flex'; // Store id in modal attribute for update reference
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
            brand: document.getElementById('scanner-new-brand').value,
            model: document.getElementById('scanner-new-model').value,
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
    document.getElementById('scannerEditForm').onsubmit = async function (e) {
        e.preventDefault();
        const editModal = document.getElementById('scannerEditModal');
        const id = editModal.getAttribute('data-id'); // ✅ Get the stored ID

        const updatedScanner = {
            id: id, // Include ID for update
            sn: document.getElementById('scanner-edit-sn').value,
            brand: document.getElementById('scanner-edit-brand').value,
            model: document.getElementById('scanner-edit-model').value,
            division: document.getElementById('scanner-edit-division').value,
            user: document.getElementById('scanner-edit-user').value,
            prn: document.getElementById('scanner-edit-prn').value,
            year: document.getElementById('scanner-edit-year').value,
            repair_date_1: document.getElementById('scanner-edit-repair-date-1').value,
            repair_date_2: document.getElementById('scanner-edit-repair-date-2').value,
            repair_date_3: document.getElementById('scanner-edit-repair-date-3').value,
            repair_date_4: document.getElementById('scanner-edit-repair-date-4').value
        };

        try {
            await window.electronAPI.updateScanner(updatedScanner);
            alert('Scanner updated successfully!');
            editModal.style.display = 'none';
            editForm.reset();
            loadScannerData();
        } catch (err) {
            console.error('Failed to update scanner:', err);
            alert('Error updating scanner: ' + err.message);
        }
    };


    // Report generation function
    async function generateReport() {
        try {
            // Get filtered data
            const divisionValue = document.getElementById('scanner-division-filter').value.trim().toLowerCase();
            const yearValue = document.getElementById('scanner-year-filter').value.trim();

            const filteredData = allRows.filter(row => {
                const division = (row.division || "").toLowerCase();
                const year = (row.year || "").toString();

                const matchesDivision = !divisionValue || division.includes(divisionValue);
                const matchesYear = !yearValue || year.includes(yearValue);

                return matchesDivision && matchesYear;
            });

            if (filteredData.length === 0) {
                alert("No data available to generate report!");
                return;
            }

            // Create PDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Add logo
            const logo = new Image();
            logo.src = 'tealogo.jpg';

            // Wait for logo to load
            await new Promise((resolve) => {
                logo.onload = resolve;
            });

            // Add logo to PDF
            doc.addImage(logo, 'JPEG', 10, 10, 30, 30);

            // Add title
            doc.setFontSize(20);
            doc.text("Scanner Report", 105, 20, { align: 'center' });

            // Add date
            doc.setFontSize(12);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

            // Add filter information
            doc.setFontSize(10);
            let filterInfo = "Filters: ";
            if (divisionValue) filterInfo += `Division: ${divisionValue}, `;
            if (yearValue) filterInfo += `Year: ${yearValue}, `;
            filterInfo = filterInfo.replace(/, $/, '');
            doc.text(filterInfo, 105, 40, { align: 'center' });

            // Create table data
            const tableData = filteredData.map(row => [
                row.id || '',
                row.brand || '',
                row.model || '',
                row.sn || '',
                row.division || '',
                row.user || '',
                row.prn || '',
                row.year || '',
                formatDate(row.repair_date_1),
                formatDate(row.repair_date_2),
                formatDate(row.repair_date_3),
                formatDate(row.repair_date_4)
            ]);

            // Check if autoTable is available
            if (typeof doc.autoTable !== 'function') {
                alert('AutoTable is not available. Please check the jsPDF AutoTable plugin.');
                return;
            }

            // Add table
            doc.autoTable({
                startY: 50,
                head: [['No', 'Brand', 'Model', 'S/N', 'Division', 'User', 'PRN', 'Year', '1st Repair', '2nd Repair', '3rd Repair', '4th Repair']],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 6, cellPadding: 1 },
                headStyles: { fillColor: [78, 84, 200] },
                margin: { top: 50 }
            });

            // Save PDF
            doc.save('Scanner_Report.pdf');

            alert('Report generated successfully!');

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report: ' + error.message);
        }
    }

    // Add event listener for report generation button
    document.getElementById('scanner-generateReportBtn').addEventListener('click', generateReport);

    // Initial load of data
    loadScannerData();

});
