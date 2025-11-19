document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const addPopup = document.getElementById("addPopup");
  const editPopup = document.getElementById("editPopup");
  const deletePopup = document.getElementById("deletePopup");
  const notif = document.getElementById("notif");
  const closeBtns = document.querySelectorAll(".close-popup");
  const checklistTable = document.getElementById("checklistsTable");
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  // Elemen Add
  const addItemBtn = document.getElementById("addItemInputBtn");
  const itemsContainer = document.getElementById("checklistItemsContainer");

  // Elemen Edit
  const addEditItemBtn = document.getElementById("addEditItemBtn");
  const editItemsContainer = document.getElementById("editItemsContainer");

  let allChecklistsData = []; // Simpan data lokal untuk akses cepat
  let currentRow = null;
  let deleteRow = null;

  // === 1. Load Data ===
  function loadTable() {
      fetch("/checklist/all")
        .then(res => res.json())
        .then(data => {
          allChecklistsData = data; // Simpan ke variabel global
          renderTable();
        });
  }

  function renderTable() {
      checklistTable.innerHTML = "";
      allChecklistsData.forEach((item, index) => {
        const row = document.createElement("tr");
        row.dataset.id = item.id; 
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
        
        // Pasang listener langsung di sini
        row.querySelector(".edit-btn").addEventListener("click", () => openEditPopup(item.id));
        row.querySelector(".delete-btn").addEventListener("click", () => deleteChecklist(row));
      });
  }

  loadTable(); // Panggil saat start

  // === 2. Add New Logic ===
  
  // Buka Popup Add
  addBtn.addEventListener("click", () => {
      document.getElementById("newChecklistInput").value = "";
      itemsContainer.innerHTML = `
          <div class="d-flex gap-2 mb-2 item-row">
              <input type="text" class="form-control item-input">
          </div>`;
      addPopup.style.display = "flex";
  });

  // Tambah Input Item (Add Mode)
  if (addItemBtn) {
      addItemBtn.addEventListener("click", () => {
          createItemInput(itemsContainer);
      });
  }

  // Save New
  document.getElementById("saveChecklist").addEventListener("click", () => {
    const name = document.getElementById("newChecklistInput").value.trim();
    const items = getItemsFromContainer(itemsContainer);

    if (!name) { alert("Judul Group wajib diisi!"); return; }

    fetch("/checklist/store", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken },
      body: JSON.stringify({ name: name, items: items })
    })
    .then(res => res.json())
    .then(result => { 
      showNotif("Berhasil disimpan!");
      addPopup.style.display = "none";
      loadTable(); // Reload tabel
    })
    .catch(() => alert("Gagal menambah!"));
  });

  // === 3. Edit Logic ===

  // Buka Popup Edit & Isi Data
  function openEditPopup(id) {
    // Cari data dari array global
    const data = allChecklistsData.find(c => c.id == id);
    if (!data) return;

    currentRow = document.querySelector(`tr[data-id='${id}']`);
    
    // Isi Judul
    document.getElementById("editChecklistInput").value = data.name;
    
    // Isi Item-item lama
    editItemsContainer.innerHTML = '';
    if (data.items && data.items.length > 0) {
        data.items.forEach(item => {
            createItemInput(editItemsContainer, item.name);
        });
    } else {
        // Jika kosong, kasih 1 input kosong
        createItemInput(editItemsContainer);
    }

    editPopup.style.display = "flex";
  }

  // Tambah Input Item (Edit Mode)
  if (addEditItemBtn) {
      addEditItemBtn.addEventListener("click", () => {
          createItemInput(editItemsContainer);
      });
  }

  // Update Checklist
  document.getElementById("updateChecklist").addEventListener("click", () => {
    const updatedName = document.getElementById("editChecklistInput").value.trim();
    const items = getItemsFromContainer(editItemsContainer);

    if (!updatedName) { alert("Nama Checklist wajib diisi!"); return; }

    const id = currentRow.dataset.id; 

    fetch(`/checklist/update/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", "X-CSRF-TOKEN": csrfToken },
      body: JSON.stringify({ name: updatedName, items: items })
    })
    .then(res => res.json())
    .then(result => {
      showNotif("Berhasil diperbarui!");
      editPopup.style.display = "none";
      loadTable(); // Reload tabel agar data item terupdate
    })
    .catch(() => alert("Gagal memperbarui Checklist!"));
  });


  // === Helper Functions ===

  // Membuat input item baru (bisa kosong atau terisi valuenya)
  function createItemInput(container, value = '') {
      const div = document.createElement("div");
      div.className = "d-flex gap-2 mb-2 item-row";
      div.innerHTML = `
        <input type="text" class="form-control item-input" value="${value}" placeholder="Item...">
        <button type="button" class="btn btn-danger btn-sm remove-item-btn" style="width:35px;">x</button>
      `;
      container.appendChild(div);
      
      // Listener hapus
      div.querySelector(".remove-item-btn").addEventListener("click", function() {
          div.remove();
      });
  }

  // Mengambil array string dari container input
  function getItemsFromContainer(container) {
      const inputs = container.querySelectorAll('.item-input');
      return Array.from(inputs)
                  .map(input => input.value.trim())
                  .filter(val => val !== "");
  }

  // === Delete Logic ===
  function deleteChecklist(row) {
    deleteRow = row;
    deletePopup.style.display = "flex";
  }

  document.getElementById("confirmDelete").addEventListener("click", () => {
    if (deleteRow) {
      const id = deleteRow.dataset.id; 
      fetch(`/checklist/delete/${id}`, {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": csrfToken }
      })
      .then(res => {
        if (!res.ok) throw new Error('Gagal');
        deleteRow.remove();
        showNotif("Berhasil dihapus!");
        loadTable(); // Re-index nomor urut
      })
      .catch(() => alert("Gagal menghapus!"));
    }
    deletePopup.style.display = "none";
  });

  // === Umum ===
  closeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      addPopup.style.display = "none";
      editPopup.style.display = "none";
      deletePopup.style.display = "none";
    });
  });

  function showNotif(text) {
    notif.textContent = text;
    notif.style.display = "block";
    setTimeout(() => notif.style.display = "none", 2500);
  }

  // Klik luar popup tutup
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("popup")) e.target.style.display = "none";
  });
});