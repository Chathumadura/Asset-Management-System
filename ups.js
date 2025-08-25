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

    const tbody = document.getElementById('ups-data-body');
    const createForm = document.getElementById('upsCreateForm');
    const createModal = document.getElementById('upsCreateModal');
    const createBtn = document.getElementById('ups-createBtn');
    const cancelCreate = document.getElementById('ups-cancelCreate');
    const backBtn = document.getElementById('upsBackBtn');
    const editModal = document.getElementById('upsEditModal');
    const editForm = document.getElementById('upsEditForm');
    const cancelEdit = document.getElementById('ups-cancelEdit');

    let allRows = [];
    let isLoading = false;

    // Debounce function to prevent excessive API calls
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Function to load and render UPS data with loading state
    async function loadUPSData() {
        if (isLoading) return;

        try {
            isLoading = true;
            console.log('Loading UPS data...');
            const rows = await window.electronAPI.getUPSs();
            console.log('UPS data received:', rows);
            allRows = rows;
            renderTable(rows);
        } catch (error) {
            console.error('Error loading UPS data:', error);
            alert('Error loading data: ' + error.message);
        } finally {
            isLoading = false;
        }
    }

    // Function to render the table with UPS data - optimized
    function renderTable(rows) {
        console.log('Rendering UPS table with rows:', rows);

        // Clear existing content
        tbody.innerHTML = '';

        if (!rows || rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="13" style="text-align:center; color:gray;">No data found</td></tr>`;
            return;
        }

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();

        rows.forEach((row, index) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.id || ''}</td>
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
                    <button class="edit-btn" data-id="${row.id}" type="button">Edit</button>
                    <button class="delete-btn" data-id="${row.id}" type="button">Delete</button>
                </td>
            `;
            fragment.appendChild(tr);
        });

        tbody.appendChild(fragment);
    }

    // Function to apply filters - debounced
    const applyFilters = debounce(() => {
        const divisionValue = document.getElementById('ups-division-filter').value.trim().toLowerCase();
        const yearValue = document.getElementById('ups-year-filter').value.trim();

        const filtered = allRows.filter(row => {
            const divisionMatch = !divisionValue || (row.division || '').toLowerCase() === divisionValue;
            const yearMatch = !yearValue || (row.year || '').toString().includes(yearValue);
            return divisionMatch && yearMatch;
        });

        renderTable(filtered);
    }, 300);

    // Attach filter event listeners - only once
    document.getElementById('ups-division-filter').addEventListener('change', applyFilters);
    document.getElementById('ups-year-filter').addEventListener('input', applyFilters);

    // Event delegation for edit and delete buttons - single setup
    tbody.addEventListener('click', async (e) => {
        e.preventDefault();

        if (e.target.classList.contains('delete-btn')) {
            const id = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this record?')) {
                try {
                    await window.electronAPI.deleteUPS(id);
                    // Remove from local data and re-render
                    allRows = allRows.filter(row => row.id != id);
                    applyFilters(); // Re-apply filters to update view
                } catch (error) {
                    console.error('Error deleting UPS:', error);
                    alert('Error deleting UPS: ' + error.message);
                }
            }
        } else if (e.target.classList.contains('edit-btn')) {
            const id = e.target.getAttribute('data-id');
            const row = allRows.find(k => k.id == id);

            if (!row) {
                alert('UPS record not found');
                return;
            }

            // Populate the edit form fields
            document.getElementById('ups-edit-no').value = row.id || '';
            document.getElementById('ups-edit-brand').value = row.brand || '';
            document.getElementById('ups-edit-model').value = row.model || '';
            document.getElementById('ups-edit-sn').value = row.sn || '';
            document.getElementById('ups-edit-division').value = row.division || '';
            document.getElementById('ups-edit-user').value = row.user || '';
            document.getElementById('ups-edit-prn').value = row.prn || '';
            document.getElementById('ups-edit-year').value = row.year || '';
            document.getElementById('ups-edit-repair1').value = row.repair_date_1 || '';
            document.getElementById('ups-edit-repair2').value = row.repair_date_2 || '';
            document.getElementById('ups-edit-repair3').value = row.repair_date_3 || '';
            document.getElementById('ups-edit-repair4').value = row.repair_date_4 || '';

            editModal.setAttribute('data-id', id);
            editModal.style.display = 'flex';
        }
    });

    // Event listeners for Create Modal
    createBtn.addEventListener('click', () => {
        createModal.style.display = 'flex';
        createForm.reset();
    });

    cancelCreate.addEventListener('click', () => {
        createModal.style.display = 'none';
        createForm.reset();
    });

    // Handle Create Form submission
    createForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newRecord = {
            brand: createForm.querySelector('input[name="brand"]').value.trim(),
            model: createForm.querySelector('input[name="model"]').value.trim(),
            sn: createForm.querySelector('input[name="sn"]').value.trim(),
            division: createForm.querySelector('select[name="division"]').value,
            user: createForm.querySelector('input[name="user"]').value.trim(),
            prn: createForm.querySelector('input[name="prn"]').value.trim(),
            year: createForm.querySelector('input[name="year"]').value.trim(),
            repair_date_1: createForm.querySelector('input[name="repair_date_1"]').value,
            repair_date_2: createForm.querySelector('input[name="repair_date_2"]').value,
            repair_date_3: createForm.querySelector('input[name="repair_date_3"]').value,
            repair_date_4: createForm.querySelector('input[name="repair_date_4"]').value,
        };

        try {
            await window.electronAPI.createUPS(newRecord);
            alert('UPS created successfully!');
            createModal.style.display = 'none';
            createForm.reset();
            await loadUPSData(); // Reload data
        } catch (error) {
            alert('Error creating UPS: ' + error.message);
        }
    });

    // Event listener for Edit Modal Cancel button
    cancelEdit.addEventListener('click', () => {
        editModal.style.display = 'none';
        editForm.reset();
    });

    // Handle Edit Form submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const id = editModal.getAttribute('data-id');
        if (!id) {
            alert('Error: No UPS ID provided for update');
            return;
        }

        const updatedUPS = {
            id: id,
            brand: document.getElementById('ups-edit-brand').value.trim(),
            model: document.getElementById('ups-edit-model').value.trim(),
            sn: document.getElementById('ups-edit-sn').value.trim(),
            division: document.getElementById('ups-edit-division').value,
            user: document.getElementById('ups-edit-user').value.trim(),
            prn: document.getElementById('ups-edit-prn').value.trim(),
            year: document.getElementById('ups-edit-year').value.trim(),
            repair_date_1: document.getElementById('ups-edit-repair1').value || null,
            repair_date_2: document.getElementById('ups-edit-repair2').value || null,
            repair_date_3: document.getElementById('ups-edit-repair3').value || null,
            repair_date_4: document.getElementById('ups-edit-repair4').value || null
        };

        try {
            await window.electronAPI.updateUPS(id, updatedUPS);
            alert('UPS updated successfully!');
            editModal.style.display = 'none';
            editForm.reset();
            await loadUPSData(); // Reload data
        } catch (error) {
            console.error('Error updating UPS:', error);
            alert('Error updating UPS: ' + (error.message || 'Unknown error'));
        }
    });

    // Back button functionality
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }

    // Generate Report functionality
    document.getElementById('generateReportBtn').addEventListener('click', async () => {
        try {
            // Get filtered data (applies current filters)
            const divisionValue = document.getElementById('ups-division-filter').value.trim().toLowerCase();
            const yearValue = document.getElementById('ups-year-filter').value.trim();

            const filteredData = allRows.filter(row => {
                const divisionMatch = !divisionValue || (row.division || '').toLowerCase() === divisionValue;
                const yearMatch = !yearValue || (row.year || '').toString().includes(yearValue);
                return divisionMatch && yearMatch;
            });

            if (filteredData.length === 0) {
                alert('No data available to generate report!');
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
            doc.text("UPS Inventory Report", 105, 20, { align: 'center' });

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
                head: [['No', 'Brand', 'Model No', 'S/N', 'Division', 'User', 'PRN', 'Year', '1st Repair', '2nd Repair', '3rd Repair', '4th Repair']],
                body: tableData,
                theme: 'grid',
                styles: { fontSize: 7, cellPadding: 1 },
                headStyles: { fillColor: [78, 84, 200] },
                margin: { top: 50 }
            });

            // Save PDF
            doc.save('UPS_Inventory_Report.pdf');

            alert('Report generated successfully!');

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report: ' + error.message);
        }
    });

    // Initial load of data when the page loads
    loadUPSData();
});
