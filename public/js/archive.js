// ==========================================================
// === FILE ARCHIVE.JS (VERSI FINAL & FIX TARGET ERROR)
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
  
    function toggleSelectMode() {
        selectMode = !selectMode;
        if (!archiveTable) return;
        
        archiveTable.classList.toggle("selection-mode", selectMode);
  
        const rows = archiveTable.querySelectorAll("tbody tr");
  
        if (selectMode) {
            selectToggleBtn.textContent = "Batal Pilih";
            selectToggleBtn.classList.add("active");
            if (bulkActionBar) bulkActionBar.style.display = 'flex'; 
        } else {
            selectToggleBtn.textContent = "Pilih";
            selectToggleBtn.classList.remove("active");
            // Uncheck semua saat batal
            archiveTable.querySelectorAll("input[type='checkbox']").forEach(cb => cb.checked = false);
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            if (bulkActionBar) bulkActionBar.style.display = 'none';
        }
    }
  
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
  
    if (selectToggleBtn) {
        selectToggleBtn.addEventListener("click", toggleSelectMode);
    }
  
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            const checkboxes = document.querySelectorAll('.row-select');
            checkboxes.forEach(cb => cb.checked = e.target.checked);
            updateBulkActionBar();
        });
    }
  
    // Update checkbox per baris
    if (archiveTableBody) {
        archiveTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-select')) {
                updateBulkActionBar();
            }
        });
    }
  
    if (restoreAllBtn) {
        restoreAllBtn.addEventListener('click', () => {
            if (!selectMode) return alert("Aktifkan mode pilih dulu!");
            if (confirm("Pulihkan semua task yang dipilih?")) {
                performBulkAction('unarchive_all');
            }
        });
    }
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            if (!selectMode) return alert("Aktifkan mode pilih dulu!");
            if (confirm("Hapus permanen semua task yang dipilih?")) {
                performBulkAction('delete_permanent_all');
            }
        });
    }
  
    // Listener Klik Tabel (Satuan)
    if (archiveTableBody) {
        archiveTableBody.addEventListener('click', (e) => {
            const target = e.target; // <--- DISINI 'target' DIDEFINISIKAN
            const row = target.closest('tr');
            
            if (!row || (selectMode && target.type !== 'checkbox')) return; 
  
            let id = target.dataset.id;
            if (!id) {
                const iconWithId = row.querySelector('.action-icons [data-id]') || target.closest('[data-id]');
                if (iconWithId) id = iconWithId.dataset.id;
            }
  
            // 1. Aksi Restore Satuan
            if (target.classList.contains('bi-arrow-counterclockwise') || target.closest('.restore-icon')) { 
                if (confirm('Keluarkan task ini dari arsip?')) {
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
                return; // Stop disini
            }
            
            // 2. Aksi Detail (Tombol Mata/File)
            if (target.classList.contains('bi-file-earmark-text') || target.closest('.detail-icon')) {
                window.location.href = `/task/detail/${id}`;
                return;
            }
  
            // 3. Aksi Delete Permanent Satuan
            if (target.classList.contains('bi-trash-fill') || target.closest('.delete-icon')) {
                 if (confirm('Hapus permanen task ini?')) {
                    performBulkAction('delete_permanent_all', [id]); // Pakai helper bulk dgn 1 ID
                 }
                 return;
            }
  
            // 4. Cegah Pindah Halaman jika klik Checkbox/Input
            if (target.closest('.select-col') || target.tagName === 'INPUT' || target.tagName === 'I') {
                return;
            }
  
            // ▼▼▼ 5. PINDAH KE DETAIL (Klik Baris) - SEKARANG DI DALAM FUNGSI ▼▼▼
            // Karena di dalam fungsi, variabel 'target' dan 'row' dikenali
            if (row.classList.contains('clickable-row')) {
                const url = row.dataset.url;
                if (url) {
                    window.location.href = url + '?from=archive';
                }
            }
            // ▲▲▲ ▲▲▲ ▲▲▲
  
        }); // <--- Penutup Listener Tabel
    }
  });