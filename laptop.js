window.addEventListener('DOMContentLoaded', () => {
    let allRows = [];

    // Load all laptop users initially
    loadLaptops();

    // Fetch and render laptop users
    async function loadLaptops() {
        allRows = await window.electronAPI.getLaptopUsers(); // Ensure this matches your IPC call
        renderTable(allRows);
    }

    // Render laptop data rows in the table
    function renderTable(rows) {
        const tbody = document.getElementById('laptop-data-body');
        tbody.innerHTML = '';

        if (!rows || rows.length === 0) {
            tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; color:gray;">No data found</td></tr>`;
            return;
        }

        rows.forEach((row, idx) => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx + 1}</td>
                <td>${row.sn || ''}</td>
                <td>${row.division || ''}</td>
                <td>${row.user || ''}</td>
                <td>${row.prn || ''}</td>
                <td>${row.year || ''}</td>
                <td>${row['1st Repair Date'] || ''}</td>
                <td>${row['2nd Repair Date'] || ''}</td>
                <td>${row['3rd Repair Date'] || ''}</td>
                <td>${row['4th Repair Date'] || ''}</td>
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
                document.getElementById('laptop-edit-repair-date-1').value = row['1st Repair Date'] || '';
                document.getElementById('laptop-edit-repair-date-2').value = row['2nd Repair Date'] || '';
                document.getElementById('laptop-edit-repair-date-3').value = row['3rd Repair Date'] || '';
                document.getElementById('laptop-edit-repair-date-4').value = row['4th Repair Date'] || '';

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
            "1st Repair Date": form.repair_date_1.value || null,
            "2nd Repair Date": form.repair_date_2.value || null,
            "3rd Repair Date": form.repair_date_3.value || null,
            "4th Repair Date": form.repair_date_4.value || null,
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
            "1st Repair Date": document.getElementById('laptop-edit-repair-date-1').value || null,
            "2nd Repair Date": document.getElementById('laptop-edit-repair-date-2').value || null,
            "3rd Repair Date": document.getElementById('laptop-edit-repair-date-3').value || null,
            "4th Repair Date": document.getElementById('laptop-edit-repair-date-4').value || null,
        };

        try {
            await window.electronAPI.updateLaptopUser(updatedRow); // Ensure this matches your IPC call
            alert('Laptop user updated successfully!');
            modal.style.display = 'none';
            document.getElementById('laptopEditForm').reset(); // Reset form after successful update
            loadLaptops(); // Reload data to show changes
        } catch (err) {
            console.error('Failed to update laptop user:', err);
            alert('Update failed, please check the console for details.');
        }
    };
});