document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const addPopup = document.getElementById("addPopup");
  const editPopup = document.getElementById("editPopup");
  const deletePopup = document.getElementById("deletePopup");
  const notif = document.getElementById("notif");
  const closeBtns = document.querySelectorAll(".close-popup");
  const checklistTable = document.getElementById("checklistsTable");
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  let currentRow = null;
  let deleteRow = null;

  // === Ambil data dari backend ===
  fetch("/checklist/all")
    .then(res => res.json())
    .then(data => {
      checklistTable.innerHTML = "";
      data.forEach((item, index) => { // <-- [PERUBAHAN 1] Tambahkan 'index'
        const row = document.createElement("tr");
        
        // [PERUBAHAN 2] Simpan ID asli di 'data-id'
        row.dataset.id = item.id; 
        
        row.innerHTML = `
          <td>${index + 1}</td> <td>${item.name}</td>
          <td class="action-icons">
            <i class="bi bi-pencil-square text-warning edit-btn"></i>
            <i class="bi bi-trash-fill text-danger delete-btn"></i>
          </td>
        `;
        checklistTable.appendChild(row);
        addRowListeners(row);
      });
    });

  // === Add New Checklist ===
  addBtn.addEventListener("click", () => addPopup.style.display = "flex");

  document.getElementById("saveChecklist").addEventListener("click", () => {
    const newChecklist = document.getElementById("newChecklistInput").value.trim();
    if (!newChecklist) {
      alert("Nama Checklist wajib diisi!");
      return;
    }

    fetch("/checklist/store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken
      },
      body: JSON.stringify({ name: newChecklist })
    })
    .then(res => res.json())
    .then(result => { 
      const newChecklist = result.data; 
      const newRow = document.createElement("tr");
      
      // [PERUBAHAN 4] Simpan ID asli di 'data-id'
      newRow.dataset.id = newChecklist.id; 
      
      // [PERUBAHAN 5] Hitung nomor urut baru
      const newRowNumber = checklistTable.rows.length + 1;

      newRow.innerHTML = `
        <td>${newRowNumber}</td> <td>${newChecklist.name}</td> 
        <td class="action-icons">
          <i class="bi bi-pencil-square text-warning edit-btn"></i>
          <i class="bi bi-trash-fill text-danger delete-btn"></i>
        </td>
      `;
      checklistTable.appendChild(newRow);
      addRowListeners(newRow);
      showNotif(result.message || "Checklist berhasil ditambahkan!");
    })
    .catch(() => alert("Gagal menambah Checklist!"));

    document.getElementById("newChecklistInput").value = "";
    addPopup.style.display = "none";
  });

  // === Edit Checklist ===
  function editChecklist(row) {
    currentRow = row;
    document.getElementById("editChecklistInput").value = row.cells[1].textContent;
    editPopup.style.display = "flex";
  }

  document.getElementById("updateChecklist").addEventListener("click", () => {
    const updatedName = document.getElementById("editChecklistInput").value.trim();
    if (!updatedName) {
      alert("Nama Checklist wajib diisi!");
      return;
    }

    // [PERUBAHAN 6] Ambil ID dari 'data-id', bukan dari sel
    const id = currentRow.dataset.id; 

    fetch(`/checklist/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken
      },
      body: JSON.stringify({ name: updatedName })
    })
    .then(res => res.json())
    .then(result => {
      currentRow.cells[1].textContent = result.data.name; 
      showNotif(result.message || "Checklist berhasil diperbarui!");
    })
    .catch(() => alert("Gagal memperbarui Checklist!"));

    editPopup.style.display = "none";
  });

  // === Delete Checklist ===
  function deleteChecklist(row) {
    deleteRow = row;
    deletePopup.style.display = "flex";
  }

  document.getElementById("confirmDelete").addEventListener("click", () => {
    if (deleteRow) {
      // [PERUBAHAN 7] Ambil ID dari 'data-id', bukan dari sel
      const id = deleteRow.dataset.id; 

      fetch(`/checklist/delete/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": csrfToken
        }
      })
      .then(res => {
        // [PERUBAHAN 8] Periksa respons server sebelum menghapus
        if (!res.ok) {
            throw new Error('Gagal menghapus di server');
        }
        deleteRow.remove();
        showNotif("Checklist berhasil dihapus!");
        // (Kita perlu update penomoran, tapi refresh adalah cara termudah)
        // location.reload(); // <-- Opsional: Muat ulang agar penomoran rapi
      })
      .catch(() => alert("Gagal menghapus Checklist!"));
    }
    deletePopup.style.display = "none";
  });

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
    row.querySelector(".edit-btn").addEventListener("click", () => editChecklist(row));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteChecklist(row));
  }

  document.querySelectorAll("#checklistTable tr").forEach(row => addRowListeners(row));

  // Klik luar popup → tutup
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("popup")) e.target.style.display = "none";
  });
});