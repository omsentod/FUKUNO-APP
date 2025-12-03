document.addEventListener("DOMContentLoaded", () => {
    
    // === 1. PILIH ELEMEN UTAMA ===
    const archiveTableBody = document.querySelector(".archive-table tbody");
    const archiveTable = document.getElementById('archiveTable');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    
    // Tombol Aksi Header
    const selectToggleBtn = document.querySelector(".select-toggle");
    const bulkActionBar = document.querySelector('.archive-actions'); 
    const selectAllCheckbox = document.getElementById('selectAll');
    const restoreAllBtn = document.querySelector(".restore-all");
    const deleteAllBtn = document.querySelector(".delete-all");
  
    let selectMode = false;
  
    // === 2. FUNGSI HELPER ===
  
    // A. Mengatur Mode Pilih (Toggle UI)
    function toggleSelectMode() {
        selectMode = !selectMode;
        
        if (!archiveTable) return;
        archiveTable.classList.toggle("selection-mode", selectMode);
  
        if (selectMode) {
            // Masuk Mode Pilih
            selectToggleBtn.innerHTML = '<i class="bi bi-x-lg"></i> Batal';
            selectToggleBtn.classList.add("active");
        } else {
            // Keluar Mode Pilih (Reset Semua)
            selectToggleBtn.innerHTML = '<i class="bi bi-check-square"></i> Pilih';
            selectToggleBtn.classList.remove("active");
            
            // Uncheck semua checkbox
            const checkboxes = document.querySelectorAll('.row-select');
            checkboxes.forEach(cb => cb.checked = false);
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            
            // Sembunyikan tombol aksi massal
            if (bulkActionBar) bulkActionBar.style.display = 'none';
        }
    }
  
    // B. Update Tombol Aksi Massal (Muncul jika ada yang dicentang)
    function updateBulkActionBar() {
        const selectedCount = document.querySelectorAll('.row-select:checked').length;
        
        if (bulkActionBar) {
            // Tampilkan jika ada >= 1 item dipilih, Sembunyikan jika 0
            bulkActionBar.style.display = (selectedCount > 0) ? 'flex' : 'none';
        }
        
        // Update status checkbox "Select All"
        if (selectAllCheckbox) {
            const totalRows = document.querySelectorAll('.row-select').length;
            selectAllCheckbox.checked = (selectedCount > 0 && selectedCount === totalRows);
            selectAllCheckbox.indeterminate = (selectedCount > 0 && selectedCount < totalRows);
        }
    }
  
    // C. Eksekusi Aksi Massal
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
  
    // Tombol Pilih
    if (selectToggleBtn) {
        selectToggleBtn.addEventListener("click", toggleSelectMode);
    }
  
    // Select All
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            document.querySelectorAll('.row-select').forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateBulkActionBar();
        });
    }
  
    // Checkbox per Baris (Delegasi)
    if (archiveTableBody) {
        archiveTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-select')) {
                updateBulkActionBar();
            }
        });
    }
  
    // --- TOMBOL MASSAL ---
    if (restoreAllBtn) {
        restoreAllBtn.addEventListener('click', () => {
            if (confirm("Pulihkan semua task yang dipilih?")) {
                performBulkAction('unarchive_all');
            }
        });
    }
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            // Kirim aksi 'delete' (Soft Delete) ke Bulk Action
            if (confirm("Pindahkan task yang dipilih ke Sampah?")) {
                performBulkAction('delete'); 
            }
        });
    }
  
    // --- INTERAKSI TABEL (KLIK BARIS & TOMBOL) ---
    if (archiveTableBody) {
        archiveTableBody.addEventListener('click', (e) => {
            const target = e.target;
            const row = target.closest('tr');
            
            if (!row) return;
  
            // Ambil ID dari data-id (bisa di checkbox atau tombol)
            let id = target.dataset.id;
            if (!id) {
               const elWithId = target.closest('[data-id]');
               if (elWithId) id = elWithId.dataset.id;
            }
  
            // 1. AKSI RESTORE SATUAN (Unarchive)
            if (target.classList.contains('bi-arrow-counterclockwise') || target.closest('.restore-icon')) { 
                if (confirm('Pulihkan task ini?')) {
                    fetch(`/task/unarchive/${id}`, { 
                        method: 'POST',
                        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }
                    })
                    .then(res => res.json())
                    .then(result => {
                        if (result.success) {
                            row.remove(); // Hapus baris visual
                            alert('Task berhasil dipulihkan.');
                        } else { alert('Gagal: ' + result.message); }
                    });
                }
                return; // Stop
            }
            
            // 2. AKSI DELETE SATUAN (Soft Delete)
            if (target.classList.contains('bi-trash-fill') || target.closest('.delete-icon')) {
                 if (confirm('Pindahkan ke Sampah?')) {
                    // Panggil route DELETE satuan
                    fetch(`/task/delete/${id}`, { 
                        method: 'DELETE', 
                        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }
                    })
                    .then(res => res.json())
                    .then(result => {
                        if (result.success) {
                            row.remove(); // Hapus baris visual
                            alert('Task dipindahkan ke sampah.');
                        } else { alert('Gagal: ' + result.message); }
                    });
                 }
                 return; // Stop
            }
  
            // 3. AKSI DETAIL (Tombol Mata/File)
            if (target.classList.contains('bi-file-earmark-text') || target.closest('.detail-icon')) {
            }
  
            // 4. CEGAH PINDAH HALAMAN (Jika klik checkbox/input)
            if (target.closest('.select-col') || target.tagName === 'INPUT') {
                return; 
            }
  
            // 5. KLIK BARIS (Pindah ke Detail)
            if (row.classList.contains('clickable-row')) {
                // Pastikan tidak sedang klik tombol aksi
                if (!target.closest('.action-icons')) {
                    const url = row.dataset.url;
                    if (url) window.location.href = url + '?from=archive';
                }
            }
        });
    }
  });