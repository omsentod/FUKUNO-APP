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
      data.forEach(item => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${item.id}</td>
          <td>${item.name}</td>
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
    .then(data => {
      const newRow = document.createElement("tr");
      newRow.innerHTML = `
        <td>${data.id}</td>
        <td>${data.name}</td>
        <td class="action-icons">
          <i class="bi bi-pencil-square text-warning edit-btn"></i>
          <i class="bi bi-trash-fill text-danger delete-btn"></i>
        </td>
      `;
      checklistTable.appendChild(newRow);
      addRowListeners(newRow);
      showNotif("Checklist berhasil ditambahkan!");
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

    const id = currentRow.cells[0].textContent;

    fetch(`/checklist/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken
      },
      body: JSON.stringify({ name: updatedName })
    })
    .then(res => res.json())
    .then(() => {
      currentRow.cells[1].textContent = updatedName;
      showNotif("Checklist berhasil diperbarui!");
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
      const id = deleteRow.cells[0].textContent;

      fetch(`/checklist/delete/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": csrfToken
        }
      })
      .then(() => {
        deleteRow.remove();
        showNotif("Checklist berhasil dihapus!");
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
