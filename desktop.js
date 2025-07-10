document.addEventListener("DOMContentLoaded", async () => {
    await loadDesktopData();
    setupFilters();
});
let allRows = [];

async function loadDesktopData() {
    try {
        const data = await window.electronAPI.getDesktopComputers();
        allRows = data; // Store all data globally
        populateTable(data);
    } catch (err) {
        console.error("Error loading desktop data:", err);
    }
}


// Populate the table body with desktop rows
function populateTable(data) {
    const tbody = document.getElementById("data-body");
    tbody.innerHTML = "";
    data.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.id}</td>
            <td>${row.brand}</td>
            <td>${row.model}</td>
            <td>${row.sn}</td>
            <td>${row.prn || ""}</td>
            <td>${row.division || ""}</td>
            <td>${row.user || ""}</td>
            <td>${row.year || ""}</td>
            <td>${row.cpu_moniter || ""}</td>
            <td>${row.ram_capacity || ""}</td>
            <td>${row.hdd_capacity || ""}</td>
            <td>${row.processor_speed || ""}</td>
            <td>${row.os_version || ""}</td>
            <td>${row.repair_date_1 || ""}</td>
            <td>${row.repair_date_2 || ""}</td>
            <td>${row.repair_date_3 || ""}</td>
            <td>${row.repair_date_4 || ""}</td>
            <td>
                <button onclick="openEditModal('${row.id}')">Edit</button>
                <button onclick="deleteDesktop('${row.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Filter setup
function setupFilters() {
    document.getElementById("brand-filter").addEventListener("change", applyFilters);
    document.getElementById("division-filter").addEventListener("change", applyFilters);
    document.getElementById("year-filter").addEventListener("change", applyFilters);
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
        const matchesYear = !yearValue || year === yearValue;

        return matchesBrand && matchesDivision && matchesYear;
    });

    populateTable(filteredData);
}



// Open Create Modal
function openCreateModal() {
    document.getElementById("createModal").style.display = "flex";
}

// Close Create Modal
function closeCreateModal() {
    document.getElementById("createModal").style.display = "none";
    document.getElementById("createForm").reset();
}

// Create desktop record
async function createDesktop(event) {
    event.preventDefault();
    const data = {
        brand: document.getElementById("new-brand").value,
        model: document.getElementById("new-model").value,
        sn: document.getElementById("new-sn").value,
        Division: document.getElementById("new-division").value,
        user: document.getElementById("new-user").value,
        PRN: document.getElementById("new-PRN").value,
        year: document.getElementById("new-year").value,
        cpu_moniter: document.getElementById("new-cpu-moniter").value,
        ram_capacity: document.getElementById("new-ram-capacity").value,
        hdd_capacity: document.getElementById("new-hdd-capacity").value,
        processor_speed: document.getElementById("new-processor-speed").value,
        os_version: document.getElementById("new-os-version").value,
        repair_date_1: document.getElementById("new-repair-date-1").value,
        repair_date_2: document.getElementById("new-repair-date-2").value,
        repair_date_3: document.getElementById("new-repair-date-3").value,
        repair_date_4: document.getElementById("new-repair-date-4").value,
    };

    try {
        await window.electronAPI.dbCreateDesktop(data);
        closeCreateModal();
        await loadDesktopData();
    } catch (err) {
        alert("Failed to create record: " + err.message);
    }
}

// Open Edit Modal and fill data
async function openEditModal(id) {
    try {
        const [row] = await window.electronAPI.getDesktopById(id);
        if (!row) {
            alert("Record not found");
            return;
        }

        document.getElementById("edit-brand").value = row.brand;
        document.getElementById("edit-model").value = row.model;
        document.getElementById("edit-sn").value = row.sn;
        document.getElementById("edit-division").value = row.Division || "";
        document.getElementById("edit-user").value = row.user || "";
        document.getElementById("edit-PRN").value = row.PRN || "";
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
    } catch (err) {
        alert("Failed to fetch record: " + err.message);
    }
}

// Close Edit Modal
function closeEditModal() {
    document.getElementById("editModal").style.display = "none";
    document.getElementById("editForm").reset();
}

// Update desktop record
async function updateDesktop(event) {
    event.preventDefault();

    const data = {
        brand: document.getElementById("edit-brand").value,
        model: document.getElementById("edit-model").value,
        sn: document.getElementById("edit-sn").value,
        Division: document.getElementById("edit-division").value,
        user: document.getElementById("edit-user").value,
        PRN: document.getElementById("edit-PRN").value,
        year: document.getElementById("edit-year").value,
        cpu_moniter: document.getElementById("edit-cpu-moniter").value,
        ram_capacity: document.getElementById("edit-ram-capacity").value,
        hdd_capacity: document.getElementById("edit-hdd-capacity").value,
        processor_speed: document.getElementById("edit-processor-speed").value,
        os_version: document.getElementById("edit-os-version").value,
        repair_date_1: document.getElementById("edit-repair-date-1").value,
        repair_date_2: document.getElementById("edit-repair-date-2").value,
        repair_date_3: document.getElementById("edit-repair-date-3").value,
        repair_date_4: document.getElementById("edit-repair-date-4").value,
    };

    try {
        await window.electronAPI.updateDesktop(data);
        closeEditModal();
        await loadDesktopData();
    } catch (err) {
        alert("Failed to update record: " + err.message);
    }
}

// Delete desktop record
async function deleteDesktop(id) {
    if (!confirm("Are you sure you want to delete this record?")) return;

    try {
        await window.electronAPI.dbDeleteDesktop(id);
        await loadDesktopData();
    } catch (err) {
        alert("Failed to delete record: " + err.message);
    }
}




