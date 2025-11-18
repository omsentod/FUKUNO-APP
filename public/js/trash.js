// ==========================================================
// === FILE TRASH.JS (VERSI FINAL & BERSIH)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    
  // === 1. PILIH ELEMEN ===
  const trashTableBody = document.querySelector(".trash-table tbody");
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  
  // Elemen Aksi Massal
  const selectToggleBtn = document.querySelector(".select-toggle");
  const trashTable = document.getElementById('trashTable');
  const selectAllCheckbox = document.getElementById('selectAllTrash');
  const rowCheckboxes = document.querySelectorAll('.row-select-trash');
  const bulkActionBar = document.querySelector('.trash-actions'); // (Sesuaikan jika ID beda)
  const restoreAllBtn = document.querySelector(".restore-all");
  const deleteAllBtn = document.querySelector(".delete-all");

  let selectMode = false; // Status mode pilih

  // === 2. FUNGSI HELPER ===

  /**
   * Menampilkan/menyembunyikan bar aksi massal & update centang
   */
  function updateBulkActionBar() {
      const selectedCount = document.querySelectorAll('.row-select-trash:checked').length;
      
      if (selectedCount > 0) {
          if(bulkActionBar) bulkActionBar.style.display = 'flex'; // Tampilkan bar
      } else {
          if(bulkActionBar) bulkActionBar.style.display = 'none'; // Sembunyikan bar
      }
      
      // Update checkbox "Select All"
      if(selectAllCheckbox) {
          selectAllCheckbox.checked = (selectedCount > 0 && selectedCount === rowCheckboxes.length);
          selectAllCheckbox.indeterminate = (selectedCount > 0 && selectedCount < rowCheckboxes.length);
      }
  }

  /**
   * Mengirim request fetch untuk aksi massal
   */
  async function performBulkAction(action) {
      const selectedIds = Array.from(document.querySelectorAll('.row-select-trash:checked'))
                               .map(cb => cb.dataset.id);

      if (selectedIds.length === 0) {
          alert("Pilih minimal satu task!");
          return;
      }

      // Tentukan URL berdasarkan aksi (Controller Anda sudah punya ini)
      const url = '/trash/bulk-action'; 

      try {
          const response = await fetch(url, {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json', 
                  'X-CSRF-TOKEN': csrfToken,
                  'Accept': 'application/json'
              },
              body: JSON.stringify({ 
                  action: action, // 'restore_all' or 'delete_permanent_all'
                  task_ids: selectedIds 
              })
          });

          const result = await response.json();
          if (result.success) {
              alert(result.message);
              location.reload(); // Muat ulang halaman
          } else {
              throw new Error(result.message);
          }
      } catch (error) {
          alert('Gagal: ' + error.message);
      }
  }

  /**
   * Menampilkan popup konfirmasi
   */
  function showConfirmPopup(message, onConfirm) {
      // (Anda bisa ganti 'alert'/'confirm' bawaan dengan popup kustom jika mau)
      if (confirm(message)) {
          onConfirm();
      }
  }

  // === 3. EVENT LISTENERS ===

  // Listener untuk Tombol "Pilih / Batal"
  if (selectToggleBtn && trashTable) {
      selectToggleBtn.addEventListener('click', () => {
          // Toggle class utama di tabel
          trashTable.classList.toggle('selection-mode');
          selectMode = trashTable.classList.contains('selection-mode');

          if (selectMode) {
              selectToggleBtn.textContent = "Batal";
              selectToggleBtn.classList.add('active'); 
          } else {
              selectToggleBtn.textContent = "Pilih";
              selectToggleBtn.classList.remove('active');
              
              // Sembunyikan Bar Aksi dan batalkan centang
              if (bulkActionBar) bulkActionBar.style.display = 'none';
              if (selectAllCheckbox) selectAllCheckbox.checked = false;
              rowCheckboxes.forEach(cb => { cb.checked = false; });
          }
      });
  }

  // Listener untuk "Select All"
  if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('click', (e) => {
          rowCheckboxes.forEach(cb => {
              cb.checked = e.target.checked;
          });
          updateBulkActionBar();
      });
  }

  // Listener untuk setiap checkbox baris
  rowCheckboxes.forEach(cb => {
      cb.addEventListener('change', (e) => { // Gunakan 'change'
          e.stopPropagation(); 
          updateBulkActionBar();
      });
  });

  // Listener untuk Aksi Massal "Restore All"
  if (restoreAllBtn) {
      restoreAllBtn.addEventListener('click', () => {
          showConfirmPopup(`Yakin ingin me-restore task yang dipilih?`, () => {
              performBulkAction('restore_all');
          });
      });
  }

  // Listener untuk Aksi Massal "Delete All"
  if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', () => {
          showConfirmPopup(`Yakin ingin menghapus task yang dipilih secara permanen?`, () => {
              performBulkAction('delete_permanent_all');
          });
      });
  }

  // Listener untuk Aksi di dalam Tabel (Restore Satuan / Delete Satuan)
  if (trashTableBody) {
      trashTableBody.addEventListener('click', (e) => {
          const target = e.target;
          const row = target.closest('tr');
          if (!row || !target.dataset.id || selectMode) return; // Abaikan jika mode pilih aktif

          const id = target.dataset.id;

          // Aksi RESTORE (Pulihkan)
          if (target.classList.contains('restore-icon')) {
              showConfirmPopup('Pulihkan task ini?', () => {
                  fetch(`/task/restore/${id}`, {
                      method: 'POST',
                      headers: {
                          'X-CSRF-TOKEN': csrfToken,
                          'Accept': 'application/json'
                      }
                  })
                  .then(res => res.json())
                  .then(result => {
                      if (result.success) {
                          row.remove();
                          alert('Task berhasil dipulihkan.');
                          window.location.href = '/task'; // Arahkan ke halaman task
                      } else {
                          alert('Gagal memulihkan task: ' + result.message);
                      }
                  })
                  .catch(err => alert('Gagal memulihkan: ' + err.message));
              });
          }

          // Aksi DELETE PERMANENT
          if (target.classList.contains('delete-icon')) {
              showConfirmPopup('Yakin ingin menghapus task ini secara permanen?', () => {
                  // Panggil fungsi massal dengan ID tunggal
                  performBulkAction('delete_permanent_all', [id]);
              });
          }
      });
  }
});