document.addEventListener("DOMContentLoaded", async () => {
    await loadLaptopData();
    setupFilters();
});

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

async function loadLaptopData() {
    try {
        const data = await window.electronAPI.getLaptopUsers();
        console.log("Laptop data received:", data);
        allRows = data;
        populateTable(data);
    } catch (err) {
        console.error("Error loading laptop data:", err);
    }
}

function populateTable(data) {
    const tbody = document.getElementById("data-body");
    tbody.innerHTML = "";

    if (!data || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="18" style="text-align:center; color:gray;">No data found</td></tr>`;
        return;
    }

    data.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.id || ''}</td>
            <td>${row.brand || ''}</td>
            <td>${row.model || ''}</td>
            <td>${row.sn || ''}</td>
            <td>${row.prn || ""}</td>
            <td>${row.division || ""}</td>
            <td>${row.user || ""}</td>
            <td>${row.year || ""}</td>
            <td>${row.cpu_moniter || ""}</td>
            <td>${row.ram_capacity || ""}</td>
            <td>${row.hdd_capacity || ""}</td>
            <td>${row.processor_speed || ""}</td>
            <td>${row.os_version || ""}</td>
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
}

function setupFilters() {
    document.getElementById("brand-filter").addEventListener("change", applyFilters);
    document.getElementById("division-filter").addEventListener("change", applyFilters);
    document.getElementById("year-filter").addEventListener("input", applyFilters);
}

function applyFilters() {
    const brandValue = document.getElementById("brand-filter").value.toLowerCase();
    const divisionValue = document.getElementById("division-filter").value.toLowerCase();
    const yearValue = document.getElementById("year-filter").value;

    const filteredData = allRows.filter(row => {
        const brand = (row.brand || "").toLowerCase();
        const division = (row.division || "").toLowerCase();
        const year = (row.year || "").toString();

        const matchesBrand = !brandValue || brand.includes(brandValue);
        const matchesDivision = !divisionValue || division.includes(divisionValue);
        const matchesYear = !yearValue || year.includes(yearValue);

        return matchesBrand && matchesDivision && matchesYear;
    });

    populateTable(filteredData);
}

function openCreateModal() {
    document.getElementById("createModal").style.display = "flex";
}

function closeCreateModal() {
    document.getElementById("createModal").style.display = "none";
    document.getElementById("createForm").reset();
}

async function createLaptop(event) {
    event.preventDefault();
    const data = {
        brand: document.getElementById("new-brand").value.trim(),
        model: document.getElementById("new-model").value.trim(),
        sn: document.getElementById("new-sn").value.trim(),
        division: document.getElementById("new-division").value.trim(),
        user: document.getElementById("new-user").value.trim(),
        prn: document.getElementById("new-PRN").value.trim(),
        year: document.getElementById("new-year").value.trim(),
        cpu_moniter: document.getElementById("new-cpu-moniter").value.trim(),
        ram_capacity: document.getElementById("new-ram-capacity").value.trim(),
        hdd_capacity: document.getElementById("new-hdd-capacity").value.trim(),
        processor_speed: document.getElementById("new-processor-speed").value.trim(),
        os_version: document.getElementById("new-os-version").value.trim(),
        repair_date_1: document.getElementById("new-repair-date-1").value.trim(),
        repair_date_2: document.getElementById("new-repair-date-2").value.trim(),
        repair_date_3: document.getElementById("new-repair-date-3").value.trim(),
        repair_date_4: document.getElementById("new-repair-date-4").value.trim(),
    };

    try {
        await window.electronAPI.createLaptopUser(data);
        closeCreateModal();
        await loadLaptopData();
    } catch (err) {
        alert("Failed to create record: " + err.message);
    }
}

function openEditModal(id) {
    const row = allRows.find(r => r.id == id);
    if (!row) return;

    document.getElementById("editModal").setAttribute("data-record-id", id);

    document.getElementById("edit-brand").value = row.brand || "";
    document.getElementById("edit-model").value = row.model || "";
    document.getElementById("edit-sn").value = row.sn || "";
    document.getElementById("edit-division").value = row.division || "";
    document.getElementById("edit-user").value = row.user || "";
    document.getElementById("edit-PRN").value = row.prn || "";
    document.getElementById("edit-year").value = row.year || "";
    document.getElementById("edit-cpu-moniter").value = row.cpu_moniter || "";
    document.getElementById("edit-ram-capacity").value = row.ram_capacity || "";
    document.getElementById("edit-hdd-capacity").value = row.hdd_capacity || "";
    document.getElementById("edit-processor-speed").value = row.processor_speed || "";
    document.getElementById("edit-os-version").value = row.os_version || "";
    document.getElementById("edit-repair-date-1").value = row.repair_date_1 || "";
    document.getElementById("edit-repair-date-2").value = row.repair_date_2 || "";
    document.getElementById("edit-repair-date-3").value = row.repair_date_3 || "";
    document.getElementById("edit-repair-date-4").value = row.repair_date_4 || "";

    document.getElementById("editModal").style.display = "flex";
}

function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    document.getElementById("editForm").reset();
}

document.getElementById('editForm').onsubmit = async function (e) {
    e.preventDefault();
    const modal = document.getElementById('editModal');
    const id = modal.getAttribute('data-record-id');

    const data = {
        id: id,
        brand: document.getElementById("edit-brand").value.trim(),
        model: document.getElementById("edit-model").value.trim(),
        sn: document.getElementById("edit-sn").value.trim(),
        division: document.getElementById("edit-division").value.trim(),
        user: document.getElementById("edit-user").value.trim(),
        prn: document.getElementById("edit-PRN").value.trim(),
        year: document.getElementById("edit-year").value.trim(),
        cpu_moniter: document.getElementById("edit-cpu-moniter").value.trim(),
        ram_capacity: document.getElementById("edit-ram-capacity").value.trim(),
        hdd_capacity: document.getElementById("edit-hdd-capacity").value.trim(),
        processor_speed: document.getElementById("edit-processor-speed").value.trim(),
        os_version: document.getElementById("edit-os-version").value.trim(),
        repair_date_1: document.getElementById("edit-repair-date-1").value.trim(),
        repair_date_2: document.getElementById("edit-repair-date-2").value.trim(),
        repair_date_3: document.getElementById("edit-repair-date-3").value.trim(),
        repair_date_4: document.getElementById("edit-repair-date-4").value.trim(),
    };

    try {
        await window.electronAPI.updateLaptopUser(data);
        alert('Laptop record updated successfully!');
        modal.style.display = 'none';
        await loadLaptopData();
    } catch (err) {
        alert("Failed to update record: " + err.message);
    }
};

async function deleteLaptop(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        await window.electronAPI.deleteLaptopUser(id);
        await loadLaptopData();
    } catch (err) {
        alert("Failed to delete record: " + err.message);
    }
}

document.getElementById('createBtn').onclick = openCreateModal;
document.getElementById('createForm').onsubmit = createLaptop;
document.getElementById('generateReportBtn').onclick = generateReport;

document.getElementById("data-body").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("edit-btn")) {
        const id = e.target.getAttribute("data-id");
        openEditModal(id);
    } else if (e.target && e.target.classList.contains("delete-btn")) {
        const id = e.target.getAttribute("data-id");
        deleteLaptop(id);
    }
});

// Report generation function
async function generateReport() {
    try {
        // Get filtered data
        const brandValue = document.getElementById("brand-filter").value.toLowerCase();
        const divisionValue = document.getElementById("division-filter").value.toLowerCase();
        const yearValue = document.getElementById("year-filter").value;

        const filteredData = allRows.filter(row => {
            const brand = (row.brand || "").toLowerCase();
            const division = (row.division || "").toLowerCase();
            const year = (row.year || "").toString();

            const matchesBrand = !brandValue || brand.includes(brandValue);
            const matchesDivision = !divisionValue || division.includes(divisionValue);
            const matchesYear = !yearValue || year.includes(yearValue);

            return matchesBrand && matchesDivision && matchesYear;
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
        doc.text("Laptop Computer Report", 105, 20, { align: 'center' });

        // Add date
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 30, { align: 'center' });

        // Add filter information
        doc.setFontSize(10);
        let filterInfo = "Filters: ";
        if (brandValue) filterInfo += `Brand: ${brandValue}, `;
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
            row.prn || '',
            row.division || '',
            row.user || '',
            row.year || '',
            row.cpu_moniter || '',
            row.ram_capacity || '',
            row.hdd_capacity || '',
            row.processor_speed || '',
            row.os_version || '',
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
            head: [['No', 'Brand', 'Model', 'S/N', 'PRN', 'Division', 'User', 'Year', 'CPU/Monitor', 'RAM', 'HDD', 'Processor', 'OS', '1st Repair', '2nd Repair', '3rd Repair', '4th Repair']],
            body: tableData,
            theme: 'grid',
            styles: { fontSize: 6, cellPadding: 1 },
            headStyles: { fillColor: [78, 84, 200] },
            margin: { top: 50 }
        });

        // Save PDF
        doc.save('Laptop_Computer_Report.pdf');

        alert('Report generated successfully!');

    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report: ' + error.message);
    }
}
