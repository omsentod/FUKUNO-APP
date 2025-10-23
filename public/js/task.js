// GANTI SELURUH ISI FILE JS ANDA DENGAN INI

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================
  // === 1. PILIH ELEMEN UTAMA
  // ==========================================================
  const addBtn = document.getElementById("addBtn");
  const notif = document.getElementById("notif");

  // ==========================================================
  // === 2. DEFINISI SEMUA FUNGSI
  // ==========================================================

  /**
   * Menampilkan pop-up dan mengatur listener-nya.
   */
  function showPopup() {
      const overlay = document.querySelector(".popup-overlay");
      const popup = overlay.querySelector(".popup");
      if (!overlay || !popup) return;

      overlay.style.display = "block";

      // Listener yang spesifik HANYA ada di dalam pop-up
      // Kita tidak bisa pakai delegasi untuk ini karena elemennya dicari saat itu juga
      popup.querySelector("#addLine").addEventListener("click", (e) => {
          e.preventDefault();
          addLine();
      });

      popup.querySelector("#addRow").addEventListener("click", (e) => {
          e.preventDefault();
          addRow();
      });

      popup.querySelector("#cancelBtn").addEventListener("click", () => {
          overlay.style.display = "none";
      });

      popup.querySelector("#taskForm").addEventListener("submit", (e) => {
          e.preventDefault();
          // ... (Logika submit Anda) ...
          const data = {
              noInvoice: popup.querySelector("#noInvoice").value,
              // ... (ambil data lainnya) ...
          };
          showNotif("Task berhasil disimpan!");
          overlay.style.display = "none";
      });
  }

  /**
   * Fungsi untuk menambah line pekerjaan
   */
  function addLine() {
      const lineContainer = document.querySelector("#lineContainer");
      if (!lineContainer) return;
      
      const lineDiv = document.createElement("div");
      lineDiv.classList.add("border", "p-3", "mb-3", "rounded");

      lineDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="line-title">Line</strong>
          <button type="button" class="btn btn-danger btn-sm btn-remove-line">Hapus</button>
        </div>
        <div class="row mb-2">
          <div class="col-md-6">
            <label>Nama Pekerjaan</label>
            <input type="text" class="form-control line-nama" placeholder="Nama pekerjaan...">
          </div>
          <div class="col-md-6">
            <label>Deadline</label>
            <input type="datetime-local" class="form-control line-deadline">
          </div>
        </div>
        <div class="mb-2">
          <label>Checklist</label>
          <div class="checklist-container"></div>
          <a href="#" class="text-primary small addChecklist">+ Tambah Checklist</a>
        </div>
      `;
      lineContainer.appendChild(lineDiv);
      // CATATAN: Listener untuk .addChecklist dan .btn-remove-line
      // sudah ditangani oleh delegasi klik di bawah.
  }

  /**
   * Fungsi untuk menambah checklist di dalam line
   */
  function addChecklist(button) {
      const checklistContainer = button.previousElementSibling;
      if (!checklistContainer) return;
      
      const checklistInput = document.createElement("input");
      checklistInput.type = "text";
      checklistInput.className = "form-control mb-2 checklist-item";
      checklistInput.placeholder = "Nama checklist...";
      checklistContainer.appendChild(checklistInput);
  }

  /**
   * Fungsi untuk menambah kolom size
   */
  function addRow() {
      const sizeTableBody = document.querySelector("#sizeTable tbody");
      if (!sizeTableBody) return;

      const newRow = document.createElement("tr");
      newRow.innerHTML = `
          <td><input type="text" class="form-control" placeholder="Jenis" value="Baju Anak"></td>
          <td><input type="text" class="form-control" placeholder="Size" value="L"></td>
          <td><input type="text" class="form-control" placeholder="Jumlah" value="10 Pcs"></td>
          <td><button type="button" class="btn btn-danger btn-sm btn-remove">Hapus</button></td>
      `;
      sizeTableBody.appendChild(newRow);
      // CATATAN: Listener untuk .btn-remove
      // sudah ditangani oleh delegasi klik di bawah.
  }

  /**
   * Menampilkan notifikasi
   */
  function showNotif(text) {
      if (!notif) return;
      notif.textContent = text;
      notif.style.display = "block";
      setTimeout(() => (notif.style.display = "none"), 2500);
  }

  /**
   * Menghitung ulang persentase progres dan warna
   */
  function updateProgress(checkbox) {
      const dropdown = checkbox.closest('.dropdown');
      if (!dropdown) return;

      const allCheckboxes = dropdown.querySelectorAll('.progress-check');
      const totalTasks = allCheckboxes.length;
      const completedTasks = dropdown.querySelectorAll('.progress-check:checked').length;
      const percentage = (totalTasks === 0) ? 0 : (completedTasks / totalTasks) * 100;

      const progressText = dropdown.querySelector('.progress-text');
      if (progressText) {
          progressText.textContent = percentage.toFixed(0) + '%';
      }

      const progressButton = dropdown.querySelector('.dropdown-toggle');
      if (!progressButton) return;

      progressButton.classList.remove('status-red', 'status-yellow', 'status-green');

      if (percentage === 0) {
          progressButton.classList.add('status-red');
      } else if (percentage === 100) {
          progressButton.classList.add('status-green');
      } else {
          progressButton.classList.add('status-yellow');
      }
  }

  /**
   * Mengganti teks dan warna status dropdown
   */
  function handleStatusChange(clickedItem) {
      const newStatus = clickedItem.dataset.status;
      const dropdown = clickedItem.closest('.dropdown');
      if (!dropdown) return;

      const statusButton = dropdown.querySelector('.dropdown-toggle');
      const statusTextSpan = dropdown.querySelector('.status-text');

      if (statusTextSpan) {
          statusTextSpan.textContent = newStatus;
      }

      if (statusButton) {
          const newClass = 'status-' + newStatus.toLowerCase().replace(/\s+/g, '-');
          statusButton.classList.forEach(className => {
              if (className.startsWith('status-') && className !== 'status-btn') {
                  statusButton.classList.remove(className);
              }
          });
          statusButton.classList.add(newClass);
      }
  }


 

function handlePrint(icon) {
  const row = icon.closest('tr');
  if (!row) return;

  const cells = row.querySelectorAll('td');

  // 1. Ekstrak data
  const data = {
      noPo: cells[0].textContent.trim(),
      taskTitle: cells[1].textContent.trim(),
      jumlah: cells[2].textContent.trim(),
      mockupSrc: cells[7].querySelector('img').src,
  };

  // 2. Buat URL Query String
  const queryString = new URLSearchParams(data).toString();

  // 3. Buat URL lengkap ke halaman print
  const printURL = '/print-po?' + queryString;

  // 4. Buka URL di tab baru
  window.open(printURL, '_blank');
}


  // ==========================================================
  // === 3. EVENT LISTENERS (Inisialisasi)
  // ==========================================================

  // Tombol "Add Task" utama
  if (addBtn) {
      addBtn.addEventListener("click", showPopup);
  }

  // Inisialisasi warna progress bar saat halaman dimuat
  document.querySelectorAll('.dropdown-toggle.progress').forEach(progressButton => {
      const dropdownMenu = progressButton.nextElementSibling;
      if (dropdownMenu) {
          const firstCheck = dropdownMenu.querySelector('.progress-check');
          if (firstCheck) {
              updateProgress(firstCheck);
          }
      }
  });

  // Listener untuk PERUBAHAN (change) - Khusus Checkbox
  document.body.addEventListener('change', function(event) {
      // Cek progress checkbox
      if (event.target.classList.contains('progress-check')) {
          updateProgress(event.target);
      }
  });

  // Listener untuk KLIK (click) - GABUNGAN SEMUA DELEGASI
  document.body.addEventListener('click', function(event) {
      const target = event.target;

      // 1. Hapus baris tabel (.btn-remove di dalam popup)
      if (target.classList.contains('btn-remove')) {
          event.preventDefault();
          target.closest('tr')?.remove(); // '?' untuk keamanan
      }

      // 2. Hapus line pekerjaan (.btn-remove-line di dalam popup)
      if (target.classList.contains('btn-remove-line')) {
          event.preventDefault();
          target.closest('.border.p-3.mb-3.rounded')?.remove();
      }

      // 3. Tambah checklist (.addChecklist di dalam popup)
      if (target.classList.contains('addChecklist')) {
          event.preventDefault();
          addChecklist(target);
      }

      // 4. Ubah status (.dropdown-item dengan data-status)
      const statusItem = target.closest('.dropdown-item[data-status]');
      if (statusItem) {
          event.preventDefault();
          handleStatusChange(statusItem);
      }

      // 5. Download PO (.icon-download)
      if (target.classList.contains('icon-download')) {
        event.preventDefault();
        handlePrint(target); 
    }
  });

}); // <-- Penutup DOMContentLoaded