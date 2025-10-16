// === Sidebar Active untuk Trash ===
document.addEventListener("DOMContentLoaded", () => {
    const sidebarItems = document.querySelectorAll(".sidebar-item");
    sidebarItems.forEach(item => item.classList.remove("active"));
    const trashItem = Array.from(sidebarItems).find(item =>
      item.textContent.trim().includes("Trash")
    );
    if (trashItem) trashItem.classList.add("active");
  });
  
  // === Restore satuan ===
  document.querySelectorAll(".restore-icon").forEach(icon => {
    icon.addEventListener("click", () => {
      alert("Task berhasil direstore ke halaman Task!");
      window.location.href = "task.html";
    });
  });
  
  // === Delete satuan dengan popup ===
  document.querySelectorAll(".delete-icon").forEach(icon => {
    icon.addEventListener("click", (e) => {
      const row = e.target.closest("tr");
  
      const popup = document.createElement("div");
      popup.className = "confirm-popup";
      popup.innerHTML = `
        <p>Apakah yakin ingin menghapus task ini?</p>
        <button class="confirm-yes">Ya</button>
        <button class="confirm-no">Batal</button>
      `;
      document.body.appendChild(popup);
  
      popup.querySelector(".confirm-yes").addEventListener("click", () => {
        row.remove();
        popup.remove();
        alert("Task berhasil dihapus permanen!");
      });
  
      popup.querySelector(".confirm-no").addEventListener("click", () => {
        popup.remove();
      });
    });
  });
  
  // === Mode Pilih (Multi-select) ===
  const selectToggle = document.querySelector(".select-toggle");
  let selectMode = false;
  
  selectToggle.addEventListener("click", () => {
    selectMode = !selectMode;
    const table = document.querySelector(".trash-table");
    table.classList.toggle("checkbox-mode", selectMode);
  
    const rows = table.querySelectorAll("tbody tr");
  
    if (selectMode) {
      selectToggle.textContent = "Batal Pilih";
      rows.forEach(row => {
        const cell = row.querySelector("td:first-child");
        if (!cell.querySelector("input[type='checkbox']")) {
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          cell.prepend(checkbox);
        }
      });
    } else {
      selectToggle.textContent = "Pilih";
      rows.forEach(row => {
        const checkbox = row.querySelector("input[type='checkbox']");
        if (checkbox) checkbox.remove();
      });
    }
  });
  
  // === Restore All dan Delete All ===
  const restoreAllBtn = document.querySelector(".restore-all");
  const deleteAllBtn = document.querySelector(".delete-all");
  
  restoreAllBtn.addEventListener("click", () => {
    if (!selectMode) {
      alert("Aktifkan mode pilih terlebih dahulu!");
      return;
    }
  
    const checkedRows = document.querySelectorAll("tbody tr input[type='checkbox']:checked");
    if (checkedRows.length === 0) {
      alert("Pilih minimal satu task untuk direstore!");
      return;
    }
  
    checkedRows.forEach(checkbox => checkbox.closest("tr").remove());
    alert(`${checkedRows.length} task berhasil direstore ke halaman Task!`);
    window.location.href = "task.html";
  });
  
  deleteAllBtn.addEventListener("click", () => {
    if (!selectMode) {
      alert("Aktifkan mode pilih terlebih dahulu!");
      return;
    }
  
    const checkedRows = document.querySelectorAll("tbody tr input[type='checkbox']:checked");
    if (checkedRows.length === 0) {
      alert("Pilih minimal satu task untuk dihapus!");
      return;
    }
  
    const popup = document.createElement("div");
    popup.className = "confirm-popup";
    popup.innerHTML = `
      <p>Yakin ingin menghapus ${checkedRows.length} task secara permanen?</p>
      <button class="confirm-yes">Ya</button>
      <button class="confirm-no">Batal</button>
    `;
    document.body.appendChild(popup);
  
    popup.querySelector(".confirm-yes").addEventListener("click", () => {
      checkedRows.forEach(checkbox => checkbox.closest("tr").remove());
      popup.remove();
      alert(`${checkedRows.length} task berhasil dihapus permanen!`);
    });
  
    popup.querySelector(".confirm-no").addEventListener("click", () => {
      popup.remove();
    });
  });
  