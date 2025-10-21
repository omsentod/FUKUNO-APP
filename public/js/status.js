document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const addPopup = document.getElementById("addPopup");
  const editPopup = document.getElementById("editPopup");
  const deletePopup = document.getElementById("deletePopup");
  const notif = document.getElementById("notif");
  const closeBtns = document.querySelectorAll(".close-popup");
  const statusTable = document.getElementById("statusesTable");
  const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

  let currentRow = null;
  let deleteRow = null;

  // === Ambil data dari backend ===
  fetch("/status/all")
    .then(res => res.json())
    .then(data => {
      statusTable.innerHTML = "";
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
        statusTable.appendChild(row);
        addRowListeners(row);
      });
    });

  // === Add New Status ===
  addBtn.addEventListener("click", () => addPopup.style.display = "flex");

  document.getElementById("saveStatus").addEventListener("click", () => {
    const newStatus = document.getElementById("newStatusInput").value.trim();
    if (!newStatus) {
      alert("Nama status wajib diisi!");
      return;
    }

    fetch("/status/store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-TOKEN": csrfToken
      },
      body: JSON.stringify({ name: newStatus })
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
      statusTable.appendChild(newRow);
      addRowListeners(newRow);
      showNotif("Status berhasil ditambahkan!");
    })
    .catch(() => alert("Gagal menambah status!"));

    document.getElementById("newStatusInput").value = "";
    addPopup.style.display = "none";
  });

  // === Edit Status ===
  function editStatus(row) {
    currentRow = row;
    document.getElementById("editStatusInput").value = row.cells[1].textContent;
    editPopup.style.display = "flex";
  }

  document.getElementById("updateStatus").addEventListener("click", () => {
    const updatedName = document.getElementById("editStatusInput").value.trim();
    if (!updatedName) {
      alert("Nama status wajib diisi!");
      return;
    }

    const id = currentRow.cells[0].textContent;

    fetch(`/status/update/${id}`, {
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
      showNotif("Status berhasil diperbarui!");
    })
    .catch(() => alert("Gagal memperbarui status!"));

    editPopup.style.display = "none";
  });

  // === Delete Status ===
  function deleteStatus(row) {
    deleteRow = row;
    deletePopup.style.display = "flex";
  }

  document.getElementById("confirmDelete").addEventListener("click", () => {
    if (deleteRow) {
      const id = deleteRow.cells[0].textContent;

      fetch(`/status/delete/${id}`, {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": csrfToken
        }
      })
      .then(() => {
        deleteRow.remove();
        showNotif("Status berhasil dihapus!");
      })
      .catch(() => alert("Gagal menghapus status!"));
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
    row.querySelector(".edit-btn").addEventListener("click", () => editStatus(row));
    row.querySelector(".delete-btn").addEventListener("click", () => deleteStatus(row));
  }

  document.querySelectorAll("#statusTable tr").forEach(row => addRowListeners(row));

  // Klik luar popup → tutup
  window.addEventListener("click", (e) => {
    if (e.target.classList.contains("popup")) e.target.style.display = "none";
  });
});
