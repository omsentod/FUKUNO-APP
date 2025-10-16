document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addBtn");
    const addPopup = document.getElementById("addPopup");
    const editPopup = document.getElementById("editPopup");
    const deletePopup = document.getElementById("deletePopup");
    const notif = document.getElementById("notif");
    const closeBtns = document.querySelectorAll(".close-popup");
    const statusTable = document.getElementById("statusTable");
  
    let currentRow = null;
  
    // === Add New Status ===
    addBtn.addEventListener("click", () => addPopup.style.display = "flex");
  
    document.getElementById("saveStatus").addEventListener("click", () => {
      const newStatus = document.getElementById("newStatusInput").value.trim();
      if (!newStatus) {
        alert("Nama status wajib diisi!");
        return;
      }
      const newRow = document.createElement("tr");
      const id = statusTable.rows.length + 1;
  
      newRow.innerHTML = `
        <td>${id}</td>
        <td>${newStatus}</td>
        <td class="action-icons">
          <i class="bi bi-pencil-square text-warning edit-btn"></i>
          <i class="bi bi-download text-success download-btn"></i>
          <i class="bi bi-trash-fill text-danger delete-btn"></i>
        </td>
      `;
  
      statusTable.appendChild(newRow);
      document.getElementById("newStatusInput").value = "";
      addPopup.style.display = "none";
      showNotif("Status berhasil ditambahkan!");
      addRowListeners(newRow);
    });
  
    // === Edit Status ===
    function editStatus(row) {
      currentRow = row;
      const currentName = row.cells[1].textContent;
      document.getElementById("editStatusInput").value = currentName;
      editPopup.style.display = "flex";
    }
  
    document.getElementById("updateStatus").addEventListener("click", () => {
      const updatedName = document.getElementById("editStatusInput").value.trim();
      if (!updatedName) {
        alert("Nama status wajib diisi!");
        return;
      }
      currentRow.cells[1].textContent = updatedName;
      editPopup.style.display = "none";
      showNotif("Status berhasil diperbarui!");
    });
  
    // === Delete Status ===
    let deleteRow = null;
    function deleteStatus(row) {
      deleteRow = row;
      deletePopup.style.display = "flex";
    }
  
    document.getElementById("confirmDelete").addEventListener("click", () => {
      if (deleteRow) {
        deleteRow.remove();
        showNotif("Status berhasil dihapus!");
      }
      deletePopup.style.display = "none";
    });
  
    // === Download (simulasi PDF) ===
    function downloadStatus(row) {
      const statusName = row.cells[1].textContent;
      const blob = new Blob([`Status: ${statusName}`], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${statusName}.txt`;
      a.click();
    }
  
    // === Popup Close ===
    closeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        addPopup.style.display = "none";
        editPopup.style.display = "none";
        deletePopup.style.display = "none";
      });
    });
  
    // === Notifikasi ===
    function showNotif(text) {
      notif.textContent = text;
      notif.style.display = "block";
      setTimeout(() => notif.style.display = "none", 2500);
    }
  
    // === Pasang Event di Icon ===
    function addRowListeners(row) {
      row.querySelector(".edit-btn").addEventListener("click", () => editStatus(row));
      row.querySelector(".delete-btn").addEventListener("click", () => deleteStatus(row));
      row.querySelector(".download-btn").addEventListener("click", () => downloadStatus(row));
    }
  
    document.querySelectorAll("#statusTable tr").forEach(row => addRowListeners(row));
  });
  
  // Agar tombol muncul jika diklik di luar popup (optional safety)
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("popup")) {
      e.target.style.display = "none";
    }
  });
  
  document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addBtn");
    const addPopup = document.getElementById("addPopup");
    const editPopup = document.getElementById("editPopup");
    const deletePopup = document.getElementById("deletePopup");
    const notif = document.getElementById("notif");
    const closeBtns = document.querySelectorAll(".close-popup");
    const statusTable = document.getElementById("statusTable");
  
    let currentRow = null;
  
    // === Add New Status ===
    addBtn.addEventListener("click", () => addPopup.style.display = "flex");
  
    document.getElementById("saveStatus").addEventListener("click", () => {
      const newStatus = document.getElementById("newStatusInput").value.trim();
      if (!newStatus) {
        alert("Nama status wajib diisi!");
        return;
      }
      const newRow = document.createElement("tr");
      const id = statusTable.rows.length + 1;
  
      newRow.innerHTML = `
        <td>${id}</td>
        <td>${newStatus}</td>
        <td class="action-icons">
          <i class="bi bi-pencil-square text-warning edit-btn"></i>
          <i class="bi bi-download text-success download-btn"></i>
          <i class="bi bi-trash-fill text-danger delete-btn"></i>
        </td>
      `;
  
      statusTable.appendChild(newRow);
      document.getElementById("newStatusInput").value = "";
      addPopup.style.display = "none";
      showNotif("Status berhasil ditambahkan!");
      addRowListeners(newRow);
    });
  
    // === Edit Status ===
    function editStatus(row) {
      currentRow = row;
      const currentName = row.cells[1].textContent;
      document.getElementById("editStatusInput").value = currentName;
      editPopup.style.display = "flex";
    }
  
    document.getElementById("updateStatus").addEventListener("click", () => {
      const updatedName = document.getElementById("editStatusInput").value.trim();
      if (!updatedName) {
        alert("Nama status wajib diisi!");
        return;
      }
      currentRow.cells[1].textContent = updatedName;
      editPopup.style.display = "none";
      showNotif("Status berhasil diperbarui!");
    });
  
    // === Delete Status ===
    let deleteRow = null;
    function deleteStatus(row) {
      deleteRow = row;
      deletePopup.style.display = "flex";
    }
  
    document.getElementById("confirmDelete").addEventListener("click", () => {
      if (deleteRow) {
        deleteRow.remove();
        showNotif("Status berhasil dihapus!");
      }
      deletePopup.style.display = "none";
    });
  
    // === Download (simulasi PDF) ===
    function downloadStatus(row) {
      const statusName = row.cells[1].textContent;
      const blob = new Blob([`Status: ${statusName}`], { type: "text/plain" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${statusName}.txt`;
      a.click();
    }
  
    // === Popup Close ===
    closeBtns.forEach(btn => {
      btn.addEventListener("click", () => {
        addPopup.style.display = "none";
        editPopup.style.display = "none";
        deletePopup.style.display = "none";
      });
    });
  
    // === Notifikasi ===
    function showNotif(text) {
      notif.textContent = text;
      notif.style.display = "block";
      setTimeout(() => notif.style.display = "none", 2500);
    }
  
    // === Pasang Event di Icon ===
    function addRowListeners(row) {
      row.querySelector(".edit-btn").addEventListener("click", () => editStatus(row));
      row.querySelector(".delete-btn").addEventListener("click", () => deleteStatus(row));
      row.querySelector(".download-btn").addEventListener("click", () => downloadStatus(row));
    }
  
    document.querySelectorAll("#statusTable tr").forEach(row => addRowListeners(row));
  });
  
  // Agar tombol muncul jika diklik di luar popup (optional safety)
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("popup")) {
      e.target.style.display = "none";
    }
  });
  
    