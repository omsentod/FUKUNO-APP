document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const addPopup = document.getElementById("addPopup");
  const editPopup = document.getElementById("editPopup");
  const deletePopup = document.getElementById("deletePopup");
  const notif = document.getElementById("notif");
  const closeBtns = document.querySelectorAll(".close-popup");
  const checklistTable = document.getElementById("checklistsTable");
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  // Elemen baru untuk Item Dinamis
  const addItemBtn = document.getElementById("addItemInputBtn");
  const itemsContainer = document.getElementById("checklistItemsContainer");

  let currentRow = null;
  let deleteRow = null;

  // === Ambil data dari backend ===
  fetch("/checklist/all")
    .then(res => res.json())
    .then(data => {
      checklistTable.innerHTML = "";
      data.forEach((item, index) => {
        const row = document.createElement("tr");
        row.dataset.id = item.id; 
        
        // Hitung jumlah item anak
        const itemCount = item.items ? item.items.length : 0;

        row.innerHTML = `
          <td>${index + 1}</td> 
          <td>
             <strong>${item.name}</strong>
             <br>
             <small class="text-muted" style="font-size: 12px;">${itemCount} items</small>
          </td>
          <td class="action-icons">
            <i class="bi bi-pencil-square text-warning edit-btn"></i>
            <i class="bi bi-trash-fill text-danger delete-btn"></i>
          </td>
        `;
        checklistTable.appendChild(row);
        addRowListeners(row);
      });
    });

  // === Add New Checklist (Buka Popup) ===
  addBtn.addEventListener("click", () => {
      // Reset form saat buka
      document.getElementById("newChecklistInput").value = "";
      itemsContainer.innerHTML = `
          <div class="d-flex gap-2 mb-2 item-row">
              <input type="text" class="form-control item-input" placeholder="Item 1...">
          </div>`;
      addPopup.style.display = "flex";
  });

  // === Logika Tambah Input Item Baru ===
  if (addItemBtn) {
      addItemBtn.addEventListener("click", () => {
          const div = document.createElement("div");
          div.className = "d-flex gap-2 mb-2 item-row";
          div.innerHTML = `
            <input type="text" class="form-control item-input" placeholder="Item baru...">
            <button type="button" class="btn btn-danger btn-sm remove-item-btn" style="width:35px;">x</button>
          `;
          itemsContainer.appendChild(div);
          
          // Fokus ke input baru
          div.querySelector('input').focus();

          // Listener hapus item
          div.querySelector(".remove-item-btn").addEventListener("click", function() {
              div.remove();
          });
      });
  }

  // === Save Checklist (Kirim ke Server) ===
  document.getElementById("saveChecklist").addEventListener("click", () => {
    const name = document.getElementById("newChecklistInput").value.trim();
    
    // Ambil semua nilai dari input item
    const itemInputs = document.querySelectorAll(".item-input");
    const items = Array.from(itemInputs)
                       .map(input => input.value.trim())
                       .filter(val => val !== ""); // Hapus yang kosong

    if (!name) {
      alert("Judul Group wajib diisi!");
      return;
    }

    // Kirim data: { name: "Judul", items: ["A", "B", "C"] }
    fetch("/checklist/store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken
      },
      body: JSON.stringify({ name: name, items: items })
    })
    .then(res => res.json())
    .then(result => { 
      const newChecklist = result.data; 
      const newRow = document.createElement("tr");
      newRow.dataset.id = newChecklist.id; 
      
      const newRowNumber = checklistTable.rows.length + 1;
      const itemCount = newChecklist.items ? newChecklist.items.length : 0;

      newRow.innerHTML = `
        <td>${newRowNumber}</td> 
        <td>
            <strong>${newChecklist.name}</strong>
            <br>
            <small class="text-muted" style="font-size: 12px;">${itemCount} items</small>
        </td> 
        <td class="action-icons">
          <i class="bi bi-pencil-square text-warning edit-btn"></i>
          <i class="bi bi-trash-fill text-danger delete-btn"></i>
        </td>
      `;
      checklistTable.appendChild(newRow);
      addRowListeners(newRow);
      showNotif(result.message || "Checklist berhasil ditambahkan!");
      addPopup.style.display = "none";
    })
    .catch((err) => {
        console.error(err);
        alert("Gagal menambah Checklist!");
    });
  });

  // === Edit Checklist (Hanya Nama Group untuk saat ini) ===
  function editChecklist(row) {
    currentRow = row;
    // Ambil teks dari elemen strong (judul group)
    const nameText = row.cells[1].querySelector('strong').textContent;
    document.getElementById("editChecklistInput").value = nameText;
    editPopup.style.display = "flex";
  }

  document.getElementById("updateChecklist").addEventListener("click", () => {
    const updatedName = document.getElementById("editChecklistInput").value.trim();
    if (!updatedName) {
      alert("Nama Checklist wajib diisi!");
      return;
    }

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
      // Update tampilan nama group
      currentRow.cells[1].querySelector('strong').textContent = result.data.name; 
      showNotif(result.message || "Checklist berhasil diperbarui!");
      editPopup.style.display = "none";
    })
    .catch(() => alert("Gagal memperbarui Checklist!"));
  });

  // === Delete Checklist ===
  function deleteChecklist(row) {
    deleteRow = row;
    deletePopup.style.display = "flex";
  }

  document.getElementById("confirmDelete").addEventListener("click", () => {
    if (deleteRow) {
      const id = deleteRow.dataset.id; 

      fetch(`/checklist/delete/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": csrfToken
        }
      })
      .then(res => {
        if (!res.ok) {
            throw new Error('Gagal menghapus di server');
        }
        deleteRow.remove();
        showNotif("Checklist berhasil dihapus!");
        // Opsional: Refresh untuk merapikan nomor urut
        // location.reload(); 
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