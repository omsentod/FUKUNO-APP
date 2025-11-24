// ==========================================================
// === FILE ARCHIVE.JS (VERSI FINAL - SOFT DELETE)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
    
    // === 1. PILIH ELEMEN UTAMA ===
    const archiveTableBody = document.querySelector(".archive-table tbody");
    const archiveTable = document.getElementById('archiveTable');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // Tombol Aksi Header
    const selectToggleBtn = document.querySelector(".select-toggle");
    const bulkActionBar = document.querySelector('.archive-actions'); 
    const restoreAllBtn = document.querySelector(".restore-all");
    const deleteAllBtn = document.querySelector(".delete-all");
    const selectAllCheckbox = document.getElementById('selectAll');
  
    let selectMode = false;
  
    // === 2. FUNGSI HELPER ===
  
    /**
     * Menampilkan/menyembunyikan checkbox di tabel
     */
    function toggleSelectMode() {
        selectMode = !selectMode;
        if (!archiveTable) return;
        
        archiveTable.classList.toggle("selection-mode", selectMode);
  
        if (selectMode) {
            selectToggleBtn.textContent = "Batal Pilih";
            selectToggleBtn.classList.add("active");
            // Tampilkan bar aksi massal jika ada item tercentang (opsional)
        } else {
            selectToggleBtn.textContent = "Pilih";
            selectToggleBtn.classList.remove("active");
            // Uncheck semua saat batal
            archiveTable.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            if (bulkActionBar) bulkActionBar.style.display = 'none';
        }
    }
  
    /**
     * Update tampilan Bar Aksi Massal
     */
    function updateBulkActionBar() {
        const selectedCount = document.querySelectorAll('.row-select:checked').length;
        
        if (bulkActionBar) {
            bulkActionBar.style.display = (selectedCount > 0) ? 'flex' : 'none';
        }
        
        if (selectAllCheckbox) {
            const totalRows = document.querySelectorAll('.row-select').length;
            selectAllCheckbox.checked = (selectedCount > 0 && selectedCount === totalRows);
            selectAllCheckbox.indeterminate = (selectedCount > 0 && selectedCount < totalRows);
        }
    }
  
    /**
     * Mengirim request fetch untuk aksi massal
     */
    async function performBulkAction(action) {
        const selectedIds = Array.from(document.querySelectorAll(".row-select:checked"))
                                 .map(cb => cb.dataset.id);
  
        if (selectedIds.length === 0) {
            alert("Pilih minimal satu task!");
            return;
        }
  
        try {
            const response = await fetch('/tasks/bulk-action', { 
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ 
                    action: action, 
                    task_ids: selectedIds 
                })
            });
  
            const result = await response.json();
            if (result.success) {
                alert(result.message);
                location.reload(); 
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            alert('Gagal: ' + error.message);
        }
    }
  
    // === 3. EVENT LISTENERS ===
  
    // Listener Tombol Pilih
    if (selectToggleBtn) {
        selectToggleBtn.addEventListener("click", toggleSelectMode);
    }
  
    // Listener Select All Checkbox
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.row-select');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateBulkActionBar();
        });
    }
    
    // Listener Checkbox per Baris
    if (archiveTableBody) {
        archiveTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-select')) {
                updateBulkActionBar();
            }
        });
    }
  
    // Listener Aksi Massal - RESTORE (Unarchive)
    if (restoreAllBtn) {
        restoreAllBtn.addEventListener('click', () => {
            if (!selectMode) return alert("Aktifkan mode pilih dulu!");
            if (confirm("Pulihkan semua task yang dipilih ke halaman utama?")) {
                performBulkAction('unarchive_all');
            }
        });
    }
  
    // Listener Aksi Massal - DELETE (Pindah ke Trash)
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            if (!selectMode) return alert("Aktifkan mode pilih dulu!");
            // ▼▼▼ PERUBAHAN: Kirim aksi 'delete' (Soft Delete) ▼▼▼
            if (confirm("Pindahkan semua task yang dipilih ke Sampah (Trash)?")) {
                performBulkAction('delete'); 
            }
            // ▲▲▲ AKHIR PERUBAHAN ▲▲▲
        });
    }
  
    // Listener Klik Tabel (Aksi Satuan)
    if (archiveTableBody) {
        archiveTableBody.addEventListener('click', (e) => {
            const target = e.target;
            const row = target.closest('tr');
            
            // Abaikan jika klik di mode pilih (kecuali checkbox itu sendiri)
            if (!row || (selectMode && target.type !== 'checkbox')) return; 
  
            let id = target.dataset.id;
            if (!id) {
                const iconWithId = row.querySelector('.action-icons [data-id]') || target.closest('[data-id]');
                if (iconWithId) id = iconWithId.dataset.id;
            }
  
            // 1. Aksi UN-ARCHIVE (Restore Satuan)
            if (target.classList.contains('bi-arrow-counterclockwise') || target.closest('.restore-icon')) { 
                if (confirm('Pulihkan task ini ke halaman utama?')) {
                    fetch(`/task/unarchive/${id}`, { 
                        method: 'POST',
                        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }
                    })
                    .then(res => res.json())
                    .then(result => {
                        if (result.success) {
                            row.remove();
                            alert('Task berhasil dipulihkan.');
                        } else {
                            alert('Gagal: ' + result.message);
                        }
                    })
                    .catch(err => console.error(err));
                }
            }
            
            // 2. Aksi Detail
            if (target.classList.contains('bi-file-earmark-text') || target.closest('.detail-icon')) {
                window.location.href = `/task/detail/${id}`;
            }
  
            // 3. Aksi DELETE (Pindah ke Trash Satuan)
            // ▼▼▼ PERUBAHAN: Gunakan endpoint Soft Delete ▼▼▼
            if (target.classList.contains('bi-trash-fill') || target.closest('.delete-icon')) {
                 if (confirm('Pindahkan task ini ke Sampah?')) {
                    fetch(`/task/delete/${id}`, { 
                        method: 'DELETE', // Menggunakan method DELETE ke rute soft delete
                        headers: { 
                            'X-CSRF-TOKEN': csrfToken, 
                            'Accept': 'application/json' 
                        }
                    })
                    .then(res => res.json())
                    .then(result => {
                        if (result.success) {
                            row.remove();
                            alert('Task dipindahkan ke sampah.');
                        } else {
                            alert('Gagal menghapus: ' + result.message);
                        }
                    })
                    .catch(err => alert("Terjadi kesalahan server."));
                 }
            }
            // ▲▲▲ AKHIR PERUBAHAN ▲▲▲
        });
    }
  });