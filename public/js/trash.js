// ==========================================================
// === FILE TRASH.JS (VERSI FINAL & FIX)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    // === 1. PILIH ELEMEN ===
    const trashTableBody = document.querySelector(".trash-table tbody");
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    const selectToggleBtn = document.querySelector(".select-toggle");
    const selectAllCheckbox = document.getElementById('selectAllTrash');
    const bulkActionBar = document.querySelector('.trash-actions');
    const restoreAllBtn = document.querySelector(".restore-all");
    const deleteAllBtn = document.querySelector(".delete-all");

    let selectMode = false;


    // === 2. FUNGSI HELPER ===
    function toggleSelectMode() {
        selectMode = !selectMode;
        const table = document.querySelector(".trash-table");
        if (!table) return;
        table.classList.toggle("checkbox-mode", selectMode);
        table.classList.toggle("selection-mode", selectMode);


        if (selectMode) {
            selectToggleBtn.innerHTML = '<i class="bi bi-x-lg"></i> Batal';
            selectToggleBtn.classList.add("active");

            if (bulkActionBar) bulkActionBar.style.display = 'flex';


        } else {
            selectToggleBtn.innerHTML = '<i class="bi bi-check-square"></i> Pilih';

            selectToggleBtn.classList.remove("active");

            // Sembunyikan Bar
            if (bulkActionBar) bulkActionBar.style.display = 'none';

            // Reset checkbox
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            document.querySelectorAll('.row-select-trash').forEach(cb => cb.checked = false);
        }
    }

    function updateBulkActionBar() {
        const selectedCount = document.querySelectorAll('.row-select-trash:checked').length;


        if (selectAllCheckbox) {
            const totalRows = document.querySelectorAll('.row-select-trash').length;
            selectAllCheckbox.checked = (selectedCount > 0 && selectedCount === totalRows);
            selectAllCheckbox.indeterminate = (selectedCount > 0 && selectedCount < totalRows);
        }
    }

    /**
     * Mengirim request fetch (Bisa Massal atau Satuan)
     * @param {string} action - 'restore_all' atau 'delete_permanent_all'
     * @param {Array} ids - (Opsional) Array ID task. Jika null, ambil dari checkbox.
     */
    async function performBulkAction(action, ids = null) {
        let selectedIds = ids;

        // Jika ID tidak diberikan, ambil dari checkbox (Aksi Massal)
        if (!selectedIds) {
            selectedIds = Array.from(document.querySelectorAll(".row-select-trash:checked"))
                .map(cb => cb.dataset.id);
        }

        if (selectedIds.length === 0) {
            alert("Pilih minimal satu task!");
            return;
        }

        try {
            const response = await fetch('/trash/bulk-action', {
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

    function showConfirmPopup(message, onConfirm) {
        if (confirm(message)) {
            onConfirm();
        }
    }

    // === 3. EVENT LISTENERS ===

    if (selectToggleBtn) {
        selectToggleBtn.addEventListener("click", toggleSelectMode);
    }

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', (e) => {
            document.querySelectorAll('.row-select-trash').forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateBulkActionBar();
        });
    }

    if (trashTableBody) {
        trashTableBody.addEventListener('change', (e) => {
            if (e.target.classList.contains('row-select-trash')) {
                updateBulkActionBar();
            }
        });
    }

    // Restore All (Massal)
    if (restoreAllBtn) {
        restoreAllBtn.addEventListener('click', () => {
            if (!selectMode) return alert("Aktifkan mode pilih dulu!");
            showConfirmPopup(`Yakin ingin me-restore task yang dipilih?`, () => {
                performBulkAction('restore_all');
            });
        });
    }

    // Delete All (Massal)
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', () => {
            if (!selectMode) return alert("Aktifkan mode pilih dulu!");
            showConfirmPopup(`Yakin ingin menghapus permanen task yang dipilih?`, () => {
                performBulkAction('delete_permanent_all');
            });
        });
    }

    // Listener Tabel (Aksi Satuan)
    if (trashTableBody) {
        trashTableBody.addEventListener('click', (e) => {
            const target = e.target;
            const row = target.closest('tr');

            // Validasi
            if (!row || !target.dataset.id || selectMode) return;

            const id = target.dataset.id;

            // 1. RESTORE SATUAN
            if (target.classList.contains('restore-icon')) {
                showConfirmPopup('Pulihkan task ini?', () => {
                    // Gunakan fetch manual agar UI lebih responsif (hapus baris saja)
                    fetch(`/task/restore/${id}`, {
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
                        .catch(err => alert('Error: ' + err.message));
                });
                return;
            }

            // 2. DELETE PERMANENT SATUAN
            if (target.classList.contains('delete-icon')) {
                showConfirmPopup('Yakin ingin menghapus permanen?', () => {
                    // Gunakan fungsi helper kita, kirim ID sebagai array
                    performBulkAction('delete_permanent_all', [id]);
                });
                return;
            }

            // 3. PINDAH KE DETAIL
            if (row.classList.contains('clickable-row')) {
                if (target.closest('.select-col') ||
                    target.closest('.actions') ||
                    target.tagName === 'INPUT'
                ) {
                    return;
                }
                const url = row.dataset.url;
                if (url) {

                    window.location.href = url + '?from=trash';
                }
            }
        });
    }

    // ============================================================
    // SERVER-SIDE SEARCH
    // ============================================================
    const searchInput = document.getElementById('taskSearchInput');

    if (searchInput) {
        let timeout = null;

        searchInput.addEventListener("input", function () {
            clearTimeout(timeout);
            const query = this.value.trim();

            timeout = setTimeout(() => {
                const url = new URL(window.location.href);
                if (query.length > 0) {
                    url.searchParams.set('search', query);
                } else {
                    url.searchParams.delete('search');
                }
                url.searchParams.delete('page');

                window.location.href = url.toString();
            }, 800);
        });
    }

    // ============================================================
    // ▼▼▼ SCROLL, SEARCH & HIGHLIGHT PERSISTENCE (TRASH) ▼▼▼
    // ============================================================
    const stateTrashSearchInput = document.getElementById('taskSearchInput');

    // [BARU] Cek Referrer
    const fromDetail = document.referrer && document.referrer.includes('/task/detail/');

    if (!fromDetail) {
        sessionStorage.removeItem("trashScrollPos");
        sessionStorage.removeItem("trashSearchQuery");
        sessionStorage.removeItem("clickedTrashId");
    }

    // 1. Restore State
    const savedTrashScroll = sessionStorage.getItem("trashScrollPos");
    const savedTrashQuery = sessionStorage.getItem("trashSearchQuery");
    const savedTrashClickedId = sessionStorage.getItem("clickedTrashId");

    // A. Restore Search
    if (savedTrashQuery && stateTrashSearchInput) {
        stateTrashSearchInput.value = savedTrashQuery;
        // Trigger pencarian
        const event = new Event('keyup', { bubbles: true }); // Trash pakai 'keyup' listener
        stateTrashSearchInput.dispatchEvent(event);
    }

    // B. Restore Scroll & Highlight
    if (savedTrashClickedId) {
        setTimeout(() => {
            const targetRow = document.querySelector(`tr.clickable-row[data-url*="/task/detail/${savedTrashClickedId}"]`);

            if (targetRow) {
                targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Highlight
                const oldHighlight = document.getElementById('highlight-task');
                if (oldHighlight) oldHighlight.removeAttribute('id');
                targetRow.setAttribute('id', 'highlight-task');

                setTimeout(() => {
                    if (targetRow.id === 'highlight-task') {
                        targetRow.removeAttribute('id');
                    }
                    sessionStorage.removeItem("clickedTrashId");
                }, 8000);
            } else if (savedTrashScroll) {
                window.scrollTo(0, parseInt(savedTrashScroll));
            }
        }, 300);
    } else if (savedTrashScroll) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedTrashScroll));
        }, 100);
    }

    // 2. Save State on Click
    if (trashTableBody) {
        trashTableBody.addEventListener("click", (e) => {
            const row = e.target.closest("tr.clickable-row");

            // Pastikan bukan klik checkbox/icon action (sudah dihandle di atas, tapi double check safety)
            if (row && !e.target.closest('.select-col') && !e.target.closest('.actions')) {
                sessionStorage.setItem("trashScrollPos", window.scrollY);

                // Extract ID from URL
                const url = row.dataset.url;
                if (url) {
                    const matches = url.match(/\/task\/detail\/(\d+)/);
                    if (matches && matches[1]) {
                        sessionStorage.setItem("clickedTrashId", matches[1]);
                    }
                }

                if (stateTrashSearchInput) {
                    sessionStorage.setItem("trashSearchQuery", stateTrashSearchInput.value);
                }
            }
        });
    }

});