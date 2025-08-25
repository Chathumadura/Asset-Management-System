window.addEventListener('DOMContentLoaded', () => {
    let allRows = [];

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

    // Load all laptop users initially
    loadLaptops();

    // Fetch and render laptop users
    async function loadLaptops() {
        try {
            allRows = await window.electronAPI.getLaptopUsers(); // Ensure this matches your IPC call

            renderTable(allRows);
        } catch (error) {
            console.error("Error loading laptop data:", error);
        }
    }

    // Render laptop data rows in the table
    function renderTable(rows) {
        const tbody = document.getElementById('laptop-data-body');
        tbody.innerHTML = '';

        if (!rows || rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:gray;">No data found</td></tr>`;
            return;
        }



        rows.forEach((row) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.id || ''}</td>
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

        // Delete button handlers
        tbody.querySelectorAll('.delete-btn').forEach(btn => {
            btn.onclick = async () => {
                const id = btn.getAttribute('data-id');
                if (confirm('Are you sure you want to delete this record?')) {
                    await window.electronAPI.deleteLaptopUser(id); // Ensure this matches your IPC call
                    loadLaptops();
                }
            };
        });

        // Edit button handlers
        tbody.querySelectorAll('.edit-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                const row = allRows.find(r => r.id == id); // Find the row by its unique ID
                if (!row) return;

                // Fill the edit modal inputs with selected row data
                document.getElementById('laptop-edit-sn').value = row.sn || '';
                document.getElementById('laptop-edit-division').value = row.division || '';
                document.getElementById('laptop-edit-user').value = row.user || '';
                document.getElementById('laptop-edit-prn').value = row.prn || '';
                document.getElementById('laptop-edit-year').value = row.year || '';
                document.getElementById('laptop-edit-repair-date-1').value = row.repair_date_1 || '';
                document.getElementById('laptop-edit-repair-date-2').value = row.repair_date_2 || '';
                document.getElementById('laptop-edit-repair-date-3').value = row.repair_date_3 || '';
                document.getElementById('laptop-edit-repair-date-4').value = row.repair_date_4 || '';

                // Store id in modal attribute for update reference
                const modal = document.getElementById('laptopEditModal');
                modal.setAttribute('data-id', id);
                modal.style.display = 'flex'; // Show the modal
            };
        });
    }

    // Filter functionality
    function applyFilters() {
        const divisionValue = document.getElementById('laptop-division-filter').value.trim().toLowerCase();
        const yearValue = document.getElementById('laptop-year-filter').value.trim();

        const filtered = allRows.filter(row => {
            const divisionMatch = !divisionValue || (row.division || '').toLowerCase().includes(divisionValue);
            const yearMatch = !yearValue || (row.year || '').toString().includes(yearValue);
            return divisionMatch && yearMatch;
        });

        renderTable(filtered);
    }

    document.getElementById('laptop-division-filter').addEventListener('change', applyFilters); // Changed to 'change' for select
    document.getElementById('laptop-year-filter').addEventListener('input', applyFilters);

    // Create new laptop user form submission
    document.getElementById('laptopCreateForm').onsubmit = async function (e) {
        e.preventDefault();
        const form = e.target;

        const newRow = {
            sn: form.sn.value.trim(),
            division: form.division.value,
            user: form.user.value.trim(),
            prn: form.prn.value.trim(),
            year: form.year.value.trim(),
            repair_date_1: document.getElementById("laptop-edit-repair-date-1").value.trim(),
            repair_date_2: document.getElementById("laptop-edit-repair-date-2").value.trim(),
            repair_date_3: document.getElementById("laptop-edit-repair-date-3").value.trim(),
            repair_date_4: document.getElementById("laptop-edit-repair-date-4").value.trim(),
        };

        try {
            await window.electronAPI.createLaptopUser(newRow); // Ensure this matches your IPC call
            alert('Laptop user created successfully!');
            form.reset();
            document.getElementById('laptopCreateModal').style.display = 'none';
            loadLaptops(); // Reload data
        } catch (error) {
            console.error('Error creating laptop user:', error);
            alert('Failed to create laptop user: ' + error.message);
        }
    };

    // Cancel edit modal
    document.getElementById('laptop-cancelEdit').onclick = () => {
        document.getElementById('laptopEditModal').style.display = 'none';
        document.getElementById('laptopEditForm').reset(); // Reset form when cancelled
    };

    // Edit form submit (Update)
    document.getElementById('laptopEditForm').onsubmit = async function (e) {
        e.preventDefault();
        const modal = document.getElementById('laptopEditModal');
        const id = modal.getAttribute('data-id'); // Get the ID from the modal's data-id attribute

        const updatedRow = {
            id: id, // Pass the ID for identification in the backend
            sn: document.getElementById('laptop-edit-sn').value.trim(),
            division: document.getElementById('laptop-edit-division').value,
            user: document.getElementById('laptop-edit-user').value.trim(),
            prn: document.getElementById('laptop-edit-prn').value.trim(),
            year: document.getElementById('laptop-edit-year').value.trim(),
            repair_date_1: document.getElementById("laptop-edit-repair-date-1").value.trim(),
            repair_date_2: document.getElementById("laptop-edit-repair-date-2").value.trim(),
            repair_date_3: document.getElementById("laptop-edit-repair-date-3").value.trim(),
            repair_date_4: document.getElementById("laptop-edit-repair-date-4").value.trim(),
        };

        try {
            await window.electronAPI.updateLaptopUser(updatedRow); // Ensure this matches your IPC call
            alert('Laptop user updated successfully!');
            modal.style.display = 'none';
            // Reset form after successful update
            loadLaptops(); // Reload data to show changes
        } catch (err) {
            console.error('Failed to update laptop user:', err);
            alert('Update failed, please check the console for details.');
        }
    };

    // Generate PDF report function
    async function generateReport() {
        try {
            // Get the current filtered data
            const divisionValue = document.getElementById('laptop-division-filter').value.trim().toLowerCase();
            const yearValue = document.getElementById('laptop-year-filter').value.trim();

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
            doc.text('Laptop Users Report', 14, 15);
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
                row.sn || '',
                row.division || '',
                row.user || '',
                row.prn || '',
                row.year || '',
                formatDate(row.repair_date_1) || '',
                formatDate(row.repair_date_2) || '',
                formatDate(row.repair_date_3) || '',
                formatDate(row.repair_date_4) || ''
            ]);

            // Define table columns
            const tableColumns = [
                { header: 'No', dataKey: 'id' },
                { header: 'S/N', dataKey: 'sn' },
                { header: 'Division', dataKey: 'division' },
                { header: 'User', dataKey: 'user' },
                { header: 'PRN', dataKey: 'prn' },
                { header: 'Year', dataKey: 'year' },
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
            const fileName = `Laptop_Users_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
            doc.save(fileName);

        } catch (error) {
            console.error('Error generating report:', error);
            alert('Failed to generate report: ' + error.message);
        }
    }
});
