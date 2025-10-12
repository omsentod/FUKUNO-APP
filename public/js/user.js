document.addEventListener("DOMContentLoaded", function() {
    // warna tulisan berdasarkan "Urgent" atau "Normal" 
    document.querySelectorAll(".urgent").forEach(function(span) {
      const text = span.textContent.trim().toLowerCase();
      if (text === "urgent") {
        span.classList.add("urgent-high");
        span.classList.remove("urgent-normal");
      } else {
        span.classList.add("urgent-normal");
        span.classList.remove("urgent-high");
      }
    });
  
    //2. Dropdown Status 
    const statusOptions = ["On Progress", "Need Review", "Done and Ready", "Hold"];
    
    document.querySelectorAll(".dropdown-status").forEach(function(drop) {
      const caret = drop.querySelector("i");
      const currentStatus = drop.querySelector(".status");
  
      caret.addEventListener("click", function() {
        // Hapus dropdown lama jika ada
        const existingMenu = drop.querySelector(".dropdown-menu-status");
        if (existingMenu) {
          existingMenu.remove();
          return;
        }
  
        const menu = document.createElement("ul");
        menu.classList.add("dropdown-menu-status");
        statusOptions.forEach(option => {
          const li = document.createElement("li");
          li.textContent = option;
          li.addEventListener("click", function() {
            currentStatus.textContent = option;
            // ubah warna tergantung status
            currentStatus.className = "status";
            if (option.includes("Done")) currentStatus.classList.add("done");
            else if (option.includes("Hold")) currentStatus.classList.add("hold");
            else currentStatus.classList.add("need");
            menu.remove();
          });
          menu.appendChild(li);
        });
        drop.appendChild(menu);
      });
    });
  
    // Hitung Time Left otomatis
    function calculateTimeLeft(startDate, endDate) {
      const today = new Date();
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
      if (diff < 0) return "Deadline passed";
      return `${diff} hari lagi`;
    }
  
    // contoh data tanggal untuk setiap baris task
    const tasks = [
      { start: "2025-10-10", end: "2025-10-20" }, // bisa diganti, cuma contoh aja
    ];
  
    const timeLeftCells = document.querySelectorAll(".task-table tbody tr td:nth-child(7)");
    timeLeftCells.forEach((cell, index) => {
      const t = tasks[index];
      if (t) cell.textContent = calculateTimeLeft(t.start, t.end);
    });
  
    // Progress berdasarkan checklist
    function updateProgress(row, totalChecklist, checkedCount) {
      const progressCell = row.querySelector("td:nth-child(10)");
      const percent = Math.round((checkedCount / totalChecklist) * 100);
      progressCell.textContent = `${percent}%`;
    }
  
    // contohn dan nanti bisa di sambungkan di page checklist
    const rows = document.querySelectorAll(".task-table tbody tr");
    rows.forEach(row => {
      const total = 10;
      let checked = 7; // jika 7/10 sdh di centang
      updateProgress(row, total, checked);
    });
  
    // Action Buttons
    document.querySelectorAll(".action-yellow").forEach(icon => {
      icon.addEventListener("click", function() {
        alert("📋 Detail Task:\nJudul: Kaos SD SAIM\nStatus: Done and Ready\nDeadline: 20 Oktober 2025");
      });
    });
  
    document.querySelectorAll(".action-green").forEach(icon => {
      icon.addEventListener("click", function() {
        alert("⬇️ File Task sedang diunduh dalam format PDF...");
        // format nya bisa dianti sesuai yang diinginkan
      });
    });
  
    document.querySelectorAll(".action-red").forEach(icon => {
      icon.addEventListener("click", function() {
        const row = icon.closest("tr");
        const taskTitle = row.querySelector("td:nth-child(2)").textContent;
        if (confirm(`Yakin ingin menghapus task "${taskTitle}"?`)) {
          // simpan ke localStorage
          let trash = JSON.parse(localStorage.getItem("trashTasks") || "[]");
          trash.push(taskTitle);
          localStorage.setItem("trashTasks", JSON.stringify(trash));
  
          // hapus dari tabel
          row.remove();
          alert("🗑️ Task dipindahkan ke Trash!");
        }
      });
    });


    // Menambahkan kode yang saya berikan
    // Contoh penambahan fungsi pop-up dan form jika diperlukan
    document.querySelectorAll(".add-new-btn").forEach(button => {
      button.addEventListener("click", function() {
        // Menampilkan pop-up ketika tombol diklik
        document.getElementById('popupModal').classList.remove('hidden');
      });
    });

    // Pop-up modal untuk menambahkan anggota tim
    document.querySelector("#addTeamForm").addEventListener("submit", function(event) {
      event.preventDefault();
      const name = document.getElementById("name").value;
      const title = document.getElementById("title").value;
      const email = document.getElementById("email").value;
      const role = document.getElementById("role").value;

      alert(`Data berhasil ditambahkan!\nNama: ${name}\nTitle: ${title}\nEmail: ${email}\nRole: ${role}`);

      // Menyembunyikan pop-up
      document.getElementById('popupModal').classList.add('hidden');
    });
  });

  function closePopup() {
    document.getElementById('popupModal').classList.add('hidden');
  }
  
  // Fungsi untuk menampilkan pop-up
  document.querySelectorAll(".add-new-btn").forEach(button => {
    button.addEventListener("click", function() {
      // Menampilkan pop-up ketika tombol diklik
      document.getElementById('popupModal').classList.remove('hidden');
    });
  });





  
// === Team Page Script ===

// 1️⃣ GENERATE INITIALS OTOMATIS BERDASARKAN NAMA LENGKAP
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

// 2️⃣ INISIALISASI DATA TEAM SAAT PAGE DILOAD
document.addEventListener("DOMContentLoaded", () => {
  const rows = document.querySelectorAll(".team-table tbody tr");

  rows.forEach(row => {
    const nameCell = row.querySelector("td:first-child");
    const circleDiv = nameCell.querySelector(".circle");
    const fullName = nameCell.innerText.trim().split("\n").pop().trim(); // ambil nama dari cell
    circleDiv.textContent = getInitials(fullName);
  });

  // Tambahkan dropdown untuk kolom status
  setupStatusDropdown();

  // Tambahkan event untuk edit & delete
  setupActionButtons();
});

// 3️⃣ STATUS DROPDOWN (Active / Disabled)
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

// 4️⃣ TOMBOL EDIT DAN DELETE
function setupActionButtons() {
  const editButtons = document.querySelectorAll(".edit");
  const deleteButtons = document.querySelectorAll(".delete");

  // --- Edit ---
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

  // --- Delete ---
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

// 5️⃣ POPUP EDIT TANPA GANTI PAGE
function showEditPopup(row, data) {
  // Buat background blur
  const overlay = document.createElement("div");
  overlay.style.position = "fixed";
  overlay.style.top = "0";
  overlay.style.left = "0";
  overlay.style.width = "100vw";
  overlay.style.height = "100vh";
  overlay.style.background = "rgba(0,0,0,0.4)";
  overlay.style.display = "flex";
  overlay.style.justifyContent = "center";
  overlay.style.alignItems = "center";
  overlay.style.zIndex = "1000";

  // Form popup
  const popup = document.createElement("div");
  popup.style.background = "white";
  popup.style.padding = "25px";
  popup.style.borderRadius = "15px";
  popup.style.width = "400px";
  popup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.2)";
  popup.innerHTML = `
    <h4 style="margin-bottom: 15px;">Edit Team Member</h4>
    <label>Full Name</label>
    <input type="text" id="editName" class="form-control mb-2" value="${data.fullName}">
    <label>Email</label>
    <input type="email" id="editEmail" class="form-control mb-2" value="${data.email}">
    <label>Role</label>
    <input type="text" id="editRole" class="form-control mb-3" value="${data.role}">
    <div style="text-align:right;">
      <button id="cancelEdit" class="btn btn-secondary btn-sm">Cancel</button>
      <button id="saveEdit" class="btn btn-primary btn-sm">Save</button>
    </div>
  `;

  overlay.appendChild(popup);
  document.body.appendChild(overlay);

  // Tombol Cancel
  popup.querySelector("#cancelEdit").addEventListener("click", () => {
    document.body.removeChild(overlay);
  });

  // Tombol Save
  popup.querySelector("#saveEdit").addEventListener("click", () => {
    const newName = popup.querySelector("#editName").value.trim();
    const newEmail = popup.querySelector("#editEmail").value.trim();
    const newRole = popup.querySelector("#editRole").value.trim();

    if (!newName || !newEmail || !newRole) {
      alert("Semua kolom wajib diisi!");
      return;
    }

    // Update isi tabel
    const nameCell = row.children[0];
    const emailCell = row.children[1];
    const roleCell = row.children[2];

    nameCell.querySelector(".circle").textContent = getInitials(newName);
    nameCell.querySelector(".member-info").lastChild.textContent = " " + newName;
    emailCell.innerHTML = `<a href="mailto:${newEmail}">${newEmail}</a>`;
    roleCell.textContent = newRole;

    // Tutup popup
    document.body.removeChild(overlay);
  });
}








  