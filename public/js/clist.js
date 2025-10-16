// === Chekclist Script ===
document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".btn-add");
    const tableBody = document.getElementById("tableBody");
  
    // ADD NEW
    addBtn.addEventListener("click", () => {
      showPopup("Tambah Checklist", "", (nama) => {
        if (nama.trim() === "") {
          alert("Nama Chekclist wajib diisi!");
          return;
        }
        const newRow = document.createElement("tr");
        const newId = tableBody.children.length + 1;
        newRow.innerHTML = `
          <td>${newId}</td>
          <td>${nama}</td>
          <td>
            <i class="bi bi-pencil-square action-icon edit"></i>
            <i class="bi bi-trash-fill action-icon delete"></i>
          </td>
        `;
        tableBody.appendChild(newRow);
        showToast("Checklist berhasil ditambahkan!");
        attachActions(newRow);
      });
    });
  
    // Tambahkan event edit/delete ke semua baris awal
    document.querySelectorAll("#tableBody tr").forEach(row => attachActions(row));
  });
  
  // === FUNCTION: Tampilkan popup form tambah/edit ===
  function showPopup(title, currentName, onSubmit) {
    const overlay = document.createElement("div");
    overlay.classList.add("popup-overlay");
  
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `
      <h5>${title}</h5>
      <input type="text" id="namaLine" placeholder="Nama Chekclist" value="${currentName}">
      <div style="text-align: right;">
        <button class="btn btn-secondary" id="cancelBtn">Batal</button>
        <button class="btn btn-primary" id="saveBtn">Simpan</button>
      </div>
    `;
  
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
  
    popup.querySelector("#cancelBtn").addEventListener("click", () => {
      document.body.removeChild(overlay);
    });
  
    popup.querySelector("#saveBtn").addEventListener("click", () => {
      const nama = document.getElementById("namaLine").value.trim();
      if (nama === "") {
        alert("Nama Chekclist wajib diisi!");
        return;
      }
      onSubmit(nama);
      document.body.removeChild(overlay);
    });
  }
  
  // === FUNCTION: Attach Edit & Delete Action ===
  function attachActions(row) {
    const editBtn = row.querySelector(".edit");
    const deleteBtn = row.querySelector(".delete");
  
    // Edit
    editBtn.addEventListener("click", () => {
      const namaSekarang = row.children[1].textContent.trim();
      showPopup("Edit Checklist", namaSekarang, (namaBaru) => {
        row.children[1].textContent = namaBaru;
        showToast("Nama Checklist berhasil diperbarui!");
      });
    });
  
    // Delete
    deleteBtn.addEventListener("click", () => {
      if (confirm("Apakah kamu yakin ingin menghapus Checklist ini?")) {
        row.remove();
        showToast("Checklist berhasil dihapus!");
      }
    });
  }
  
  // === FUNCTION: Notifikasi kecil ===
  function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
  