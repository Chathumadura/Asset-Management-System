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







