// ==========================================================
// === FILE ARCHIVE.JS (VERSI FINAL & SINKRON DENGAN TRASH)
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {

    // === 1. PILIH ELEMEN UTAMA ===
    const archiveTableBody = document.querySelector(".archive-table tbody");
    const archiveTable = document.getElementById('archiveTable');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

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

        if (selectMode) {
            // Gunakan innerHTML agar ikon tidak hilang
            selectToggleBtn.innerHTML = '<i class="bi bi-x-lg"></i> Batal';
            selectToggleBtn.classList.add("active");

            // Langsung tampilkan tombol aksi massal
            if (bulkActionBar) bulkActionBar.style.display = 'flex';
        } else {
            selectToggleBtn.innerHTML = '<i class="bi bi-check-square"></i> Pilih';
            selectToggleBtn.classList.remove("active");

            // Reset
            if (bulkActionBar) bulkActionBar.style.display = 'none';
            if (selectAllCheckbox) selectAllCheckbox.checked = false;
            document.querySelectorAll('.row-select').forEach(cb => cb.checked = false);
        }
    }

    function updateBulkActionBar() {
        const selectedCount = document.querySelectorAll('.row-select:checked').length;

        // Kita tidak perlu menyembunyikan bar di sini lagi (agar tombol tetap ada)
        // Cukup update checkbox Select All
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
            document.querySelectorAll('.row-select').forEach(cb => {
                cb.checked = e.target.checked;
            });
            updateBulkActionBar();
        });
    }

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
            if (confirm("Pindahkan task terpilih ke Sampah?")) {
                performBulkAction('delete');
            }
        });
    }

    // Listener Klik Tabel
    if (archiveTableBody) {
        archiveTableBody.addEventListener('click', (e) => {
            const target = e.target;
            const row = target.closest('tr');

            if (!row || (selectMode && target.type !== 'checkbox')) return;

            let id = target.dataset.id;
            if (!id) {
                const iconWithId = row.querySelector('.action-icons [data-id]') || target.closest('[data-id]');
                if (iconWithId) id = iconWithId.dataset.id;
            }

            // 1. RESTORE SATUAN
            if (target.classList.contains('bi-arrow-counterclockwise') || target.closest('.restore-icon')) {
                if (confirm('Pulihkan task ini?')) {
                    fetch(`/task/unarchive/${id}`, {
                        method: 'POST',
                        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }
                    })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success) {
                                row.remove();
                                alert('Task berhasil dipulihkan.');
                            } else { alert('Gagal: ' + result.message); }
                        })
                        .catch(err => console.error(err));
                }
                return;
            }

            // 2. DELETE SATUAN
            if (target.classList.contains('bi-trash-fill') || target.closest('.delete-icon')) {
                if (confirm('Pindahkan ke Sampah?')) {
                    fetch(`/task/delete/${id}`, {
                        method: 'DELETE',
                        headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' }
                    })
                        .then(res => res.json())
                        .then(result => {
                            if (result.success) {
                                row.remove();
                                alert('Task dipindahkan ke sampah.');
                            } else { alert('Gagal menghapus: ' + result.message); }
                        })
                        .catch(err => alert("Terjadi kesalahan server."));
                }
                return;
            }

            // 3. CEGAH KLIK CHECKBOX/INPUT
            if (target.closest('.select-col') || target.tagName === 'INPUT') {
                return;
            }

            // 4. PINDAH KE DETAIL
            if (row.classList.contains('clickable-row')) {
                // Pastikan tidak klik area action
                if (!target.closest('.action-icons')) {
                    const url = row.dataset.url;
                    if (url) {
                        window.location.href = url + '?from=archive';
                    }
                }
            }
        });
    }

    const searchInput = document.getElementById('archiveSearchInput');
    const tableRows = document.querySelectorAll("#archiveTable tbody tr");

    if (searchInput) {
        searchInput.addEventListener('keyup', function (e) {
            const searchTerm = e.target.value.toLowerCase();

            tableRows.forEach(row => {
                // Abaikan baris pesan "Tidak ada data"
                if (row.querySelector('td.text-center')) return;

                // Ambil seluruh teks dalam satu baris
                const rowText = row.textContent.toLowerCase();

                // Cek apakah kata kunci ada di dalam teks baris
                if (rowText.includes(searchTerm)) {
                    row.style.display = ""; // Tampilkan
                } else {
                    row.style.display = "none"; // Sembunyikan
                }
            });
        });
    }

    // ============================================================
    // ▼▼▼ SCROLL, SEARCH & HIGHLIGHT PERSISTENCE (ARCHIVE) ▼▼▼
    // ============================================================
    // Gunakan variabel unik agar tidak bentrok dengan scope lain
    const stateArchiveSearchInput = document.getElementById('archiveSearchInput');

    // 1. Restore State
    const savedArchiveScroll = sessionStorage.getItem("archiveScrollPos");
    const savedArchiveQuery = sessionStorage.getItem("archiveSearchQuery");
    const savedArchiveClickedId = sessionStorage.getItem("clickedArchiveId");

    // A. Restore Search
    // [BARU] Cek Referrer
    const fromDetail = document.referrer && document.referrer.includes('/task/detail/');

    if (!fromDetail) {
        sessionStorage.removeItem("archiveScrollPos");
        sessionStorage.removeItem("archiveSearchQuery");
        sessionStorage.removeItem("clickedArchiveId");
    }

    if (savedArchiveQuery && stateArchiveSearchInput) {
        stateArchiveSearchInput.value = savedArchiveQuery;
        // Trigger pencarian
        const event = new Event('keyup', { bubbles: true }); // Archive pakai 'keyup' listener
        stateArchiveSearchInput.dispatchEvent(event);
    }

    // B. Restore Scroll & Highlight
    if (savedArchiveClickedId) {
        setTimeout(() => {
            const targetRow = document.querySelector(`tr.clickable-row[data-url*="/task/detail/${savedArchiveClickedId}"]`);

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
                    sessionStorage.removeItem("clickedArchiveId");
                }, 8000);
            } else if (savedArchiveScroll) {
                window.scrollTo(0, parseInt(savedArchiveScroll));
            }
        }, 300);
    } else if (savedArchiveScroll) {
        setTimeout(() => {
            window.scrollTo(0, parseInt(savedArchiveScroll));
        }, 100);
    }

    // 2. Save State on Click
    if (archiveTableBody) {
        archiveTableBody.addEventListener("click", (e) => {
            const row = e.target.closest("tr.clickable-row");
            if (row) {
                sessionStorage.setItem("archiveScrollPos", window.scrollY);

                // Extract ID from URL
                const url = row.dataset.url;
                if (url) {
                    const matches = url.match(/\/task\/detail\/(\d+)/);
                    if (matches && matches[1]) {
                        sessionStorage.setItem("clickedArchiveId", matches[1]);
                    }
                }

                if (stateArchiveSearchInput) {
                    sessionStorage.setItem("archiveSearchQuery", stateArchiveSearchInput.value);
                }
            }
        });
    }

});