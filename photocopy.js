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
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this record?')) {
                    await window.electronAPI.deletePhotocopy(id); // Ensure this matches your IPC call for deleting photocopy data
                    loadPhotocopyData();
                }
            };
        });

        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = async e => {
                const idToEdit = btn.getAttribute('data-id');
                // Find the full row data from allRows using the ID
                const photocopyToEdit = allRows.find(row => row.id === parseInt(idToEdit));

                if (photocopyToEdit) {
                    // Populate the edit form fields
                    document.getElementById('photocopy-edit-no').value = photocopyToEdit.id || ''; // Auto-generated/disabled
                    document.getElementById('photocopy-edit-brand').value = photocopyToEdit.brand || '';
                    document.getElementById('photocopy-edit-model').value = photocopyToEdit.model || '';
                    document.getElementById('photocopy-edit-sn').value = photocopyToEdit.sn || '';
                    document.getElementById('photocopy-edit-division').value = photocopyToEdit.diviion || '';

                    document.getElementById('photocopy-edit-prn').value = photocopyToEdit.prn || '';
                    document.getElementById('photocopy-edit-year').value = photocopyToEdit.year || '';
                    document.getElementById('photocopy-edit-repair-date-1').value = photocopyToEdit.repair_date_1 || '';
                    document.getElementById('photocopy-edit-repair-date-2').value = photocopyToEdit.repair_date_2 || '';
                    document.getElementById('photocopy-edit-repair-date-3').value = photocopyToEdit.repair_date_3 || '';
                    document.getElementById('photocopy-edit-repair-date-4').value = photocopyToEdit.repair_date_4 || '';

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
            'Brand ': createForm.querySelector('input[name="brand"]').value.trim(),
            'Model No': createForm.querySelector('input[name="model"]').value.trim(),
            sn: createForm.querySelector('input[name="sn"]').value.trim(),
            division: createForm.querySelector('select[name="division"]').value,
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
            'Brand `': document.getElementById('photocopy-edit-brand').value.trim(),
            'Model No': document.getElementById('photocopy-edit-model').value.trim(),
            'S/N': document.getElementById('photocopy-edit-sn').value.trim(), // Send S/N again in case it's part of the update logic
            'Division': photocopyToEdit.division || '',
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

    // Report generation function
    async function generateReport() {
        try {
            // Get filtered data
            const divisionValue = document.getElementById('photocopy-division-filter').value.trim().toLowerCase();
            const yearValue = document.getElementById('photocopy-year-filter').value.trim();

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
            doc.text("Photocopy Report", 105, 20, { align: 'center' });

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
                head: [['No', 'Brand', 'Model', 'S/N', 'Division', 'PRN', 'Year', '1st Repair', '2nd Repair', '3rd Repair', '4th Repair']],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 6, cellPadding: 1 },
                headStyles: { fillColor: [78, 84, 200] },
                margin: { top: 50 }
            });

            // Save PDF
            doc.save('Photocopy_Report.pdf');

            alert('Report generated successfully!');

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report: ' + error.message);
        }
    }

    // Add event listener for report generation button
    document.getElementById('photocopy-generateReportBtn').addEventListener('click', generateReport);
});
