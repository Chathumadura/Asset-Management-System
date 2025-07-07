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




// Open Create Modal
function openCreateModal() {
    document.getElementById("createModal").style.display = "flex";
}

// Close Create Modal
function closeCreateModal() {
    document.getElementById("createModal").style.display = "none";
    document.getElementById("createForm").reset();
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




