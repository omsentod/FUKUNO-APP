document.addEventListener("DOMContentLoaded", () => {
  // 1️⃣ Menambahkan Anggota Tim
  const addBtn = document.querySelector(".add-new-btn");
  const popup = document.getElementById("addUserPopup");
  const cancelBtn = document.getElementById("cancelAdd");
  const saveBtn = document.getElementById("saveAdd");

  // Tampilkan pop-up saat tombol Add New diklik
  addBtn.addEventListener("click", (e) => {
    e.preventDefault();
    popup.classList.remove("hidden"); // Menghilangkan kelas hidden, menampilkan pop-up
  });

  // Tutup pop-up saat tombol Cancel diklik
  cancelBtn.addEventListener("click", () => {
    popup.classList.add("hidden"); // Menambahkan kelas hidden untuk menyembunyikan pop-up
    clearForm(); // Mengosongkan form
  });

  // Simpan data baru dan tambahkan ke tabel
  saveBtn.addEventListener("click", () => {
    const name = document.getElementById("newName").value.trim();
    const email = document.getElementById("newEmail").value.trim();
    const role = document.getElementById("newRole").value.trim();

    if (!name || !email || !role) {
      alert("Semua kolom wajib diisi!");
      return;
    }

    const initials = getInitials(name); // Mendapatkan inisial dari nama
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
      <td>
        <div class="member-info">
          <div class="circle blue">${initials}</div>
          ${name}
        </div>
      </td>
      <td><a href="mailto:${email}">${email}</a></td>
      <td>${role}</td>
      <td><select class="status-dropdown"><option value="Active" selected>Active</option><option value="Disabled">Disabled</option></select></td>
      <td>
        <a href="#" class="edit">Edit</a>
        <a href="#" class="delete">Delete</a>
      </td>
    `;

    document.querySelector(".team-table tbody").appendChild(newRow);
    setupStatusDropdown(); // Setup dropdown status untuk baris baru
    setupActionButtons(); // Setup tombol edit dan delete untuk baris baru
    alert("✅ User baru berhasil ditambahkan!");

    popup.classList.add("hidden"); // Menyembunyikan pop-up
    clearForm(); // Mengosongkan form input
  });

  // Fungsi untuk membersihkan form input setelah selesai
  function clearForm() {
    document.getElementById("newName").value = "";
    document.getElementById("newEmail").value = "";
    document.getElementById("newRole").value = "";
  }
});

// Fungsi untuk mendapatkan inisial berdasarkan nama lengkap
function getInitials(fullName) {
  if (!fullName) return "";
  const words = fullName.trim().split(" ");
  if (words.length === 1) {
    const name = words[0];
    return (name[0] + name[name.length - 1]).toUpperCase(); // contoh: Rifqi → RI
  } else {
    return (words[0][0] + words[1][0]).toUpperCase(); // contoh: Kartika Azizah → KA
  }
}

// 2️⃣ Setup Dropdown Status
function setupStatusDropdown() {
  const statusCells = document.querySelectorAll(".team-table tbody td:nth-child(4)");
  
  statusCells.forEach(cell => {
    const currentStatus = cell.textContent.trim();
    const select = document.createElement("select");
    select.classList.add("status-dropdown");

    const activeOpt = new Option("Active", "Active");
    const disabledOpt = new Option("Disabled", "Disabled");
    select.add(activeOpt);
    select.add(disabledOpt);

    // Set default value sesuai data awal
    select.value = currentStatus.includes("Active") ? "Active" : "Disabled";

    // Styling sederhana agar selaras
    select.style.padding = "4px 8px";
    select.style.borderRadius = "8px";
    select.style.border = "1px solid #ccc";
    select.style.fontSize = "13px";

    // Ganti warna otomatis sesuai status
    select.addEventListener("change", () => {
      if (select.value === "Active") {
        select.style.background = "#2ecc71";
        select.style.color = "white";
      } else {
        select.style.background = "#f1c40f";
        select.style.color = "black";
      }
    });

    // Terapkan warna awal
    if (select.value === "Active") {
      select.style.background = "#2ecc71";
      select.style.color = "white";
    } else {
      select.style.background = "#f1c40f";
      select.style.color = "black";
    }

    // Ganti elemen lama dengan dropdown
    cell.innerHTML = "";
    cell.appendChild(select);
  });
}

// 3️⃣ Setup Action Buttons (Edit and Delete)
function setupActionButtons() {
  const editButtons = document.querySelectorAll(".edit");
  const deleteButtons = document.querySelectorAll(".delete");

  // Edit button functionality
  editButtons.forEach(editBtn => {
    editBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const row = e.target.closest("tr");
      const fullName = row.children[0].innerText.trim().split("\n").pop().trim();
      const email = row.children[1].innerText.trim();
      const role = row.children[2].innerText.trim();

      showEditPopup(row, { fullName, email, role });
    });
  });

  // Delete button functionality
  deleteButtons.forEach(delBtn => {
    delBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const row = e.target.closest("tr");
      const confirmDelete = confirm("Apakah kamu yakin ingin menghapus data ini?");
      if (confirmDelete) {
        row.remove();
      }
    });
  });
}
