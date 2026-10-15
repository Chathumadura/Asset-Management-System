document.addEventListener("DOMContentLoaded", async () => {
    await loadDesktopData();
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

async function loadDesktopData() {
    try {
        const data = await window.electronAPI.getDesktopComputers();
        console.log("Desktop data received:", data);
        allRows = data;
        populateTable(data);
    } catch (err) {
        console.error("Error loading desktop data:", err);
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
                <button class="update-btn" data-id="${row.id}">Update</button>
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

async function createDesktop(event) {
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
        await window.electronAPI.createDesktop(data);
        closeCreateModal();
        await loadDesktopData();
    } catch (err) {
        alert("Failed to create record: " + err.message);
    }
}



async function deleteDesktop(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        await window.electronAPI.dbDeleteDesktop(id);
        await loadDesktopData();
    } catch (err) {
        alert("Failed to delete record: " + err.message);
    }
}

async function openUpdateModal(id) {
    try {
        // Get the desktop data by ID
        const desktopData = await window.electronAPI.getDesktopById(id); // Ensure this retrieves the correct desktop data

        // Populate the edit modal with the data
        document.getElementById("edit-id").value = desktopData.id;
        document.getElementById("edit-brand").value = desktopData.brand || '';
        document.getElementById("edit-model").value = desktopData.model || '';
        document.getElementById("edit-sn").value = desktopData.sn || '';
        document.getElementById("edit-division").value = desktopData.division || '';
        document.getElementById("edit-user").value = desktopData.user || '';
        document.getElementById("edit-PRN").value = desktopData.prn || '';
        document.getElementById("edit-year").value = desktopData.year || '';
        document.getElementById("edit-cpu-moniter").value = desktopData.cpu_moniter || '';
        document.getElementById("edit-ram-capacity").value = desktopData.ram_capacity || '';
        document.getElementById("edit-hdd-capacity").value = desktopData.hdd_capacity || '';
        document.getElementById("edit-processor-speed").value = desktopData.processor_speed || '';
        document.getElementById("edit-os-version").value = desktopData.os_version || '';
        document.getElementById("edit-repair-date-1").value = desktopData.repair_date_1 || '';
        document.getElementById("edit-repair-date-2").value = desktopData.repair_date_2 || '';
        document.getElementById("edit-repair-date-3").value = desktopData.repair_date_3 || '';
        document.getElementById("edit-repair-date-4").value = desktopData.repair_date_4 || '';

        // Show the edit modal
        document.getElementById("editModal").style.display = "flex";

    } catch (err) {
        console.error("Error loading desktop data for update:", err);
        alert("Failed to load desktop data for update: " + err.message);
    }
}

// Handle edit form submission
document.getElementById("editForm").addEventListener("submit", async function (event) {
    event.preventDefault();

    const data = {
        id: document.getElementById("edit-id").value,
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
        await window.electronAPI.updateDesktop(data);
        document.getElementById("editModal").style.display = "none";
        await loadDesktopData();
    } catch (err) {
        alert("Failed to update record: " + err.message);
    }
});

document.getElementById('createBtn').onclick = openCreateModal;
document.getElementById('createForm').onsubmit = createDesktop;
document.getElementById('generateReportBtn').onclick = generateReport;

document.getElementById("data-body").addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("update-btn")) {
        const id = e.target.getAttribute("data-id");
        console.log("Update button clicked with ID:", id);
        openUpdateModal(id);
    } else if (e.target && e.target.classList.contains("delete-btn")) {
        const id = e.target.getAttribute("data-id");
        deleteDesktop(id);
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
        doc.text("Desktop Computer Report", 105, 20, { align: 'center' });

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
        doc.save('Desktop_Computer_Report.pdf');

        alert('Report generated successfully!');

    } catch (error) {
        console.error('Error generating report:', error);
        alert('Failed to generate report: ' + error.message);
    }
}

function closeUpdateModal() {
    document.getElementById("editModal").style.display = "none";
    document.getElementById("editForm").reset();
}
