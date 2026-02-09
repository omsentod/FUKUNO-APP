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
                        // URL sudah include ?from= di data-url dari Blade template
                        window.location.href = url;
                    }
                }
            }
        });
    }

    // ============================================================
    // SERVER-SIDE SEARCH
    // ============================================================
    const searchInput = document.getElementById('archiveSearchInput');

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
    // ▼▼▼ SCROLL, SEARCH & HIGHLIGHT PERSISTENCE (ARCHIVE) ▼▼▼
    // ============================================================
    // Gunakan variabel unik agar tidak bentrok dengan scope lain
    const stateArchiveSearchInput = document.getElementById('archiveSearchInput');

    // [BARU] Smart Persistence: Hapus cache hanya jika benar-benar "fresh visit"
    // JANGAN hapus jika:
    // 1. Dari detail page (back button)
    // 2. Dari halaman archive itu sendiri (server-side search reload)
    const fromDetail = document.referrer && document.referrer.includes('/task/detail/');
    const fromArchive = document.referrer && document.referrer.includes('/archive');

    // Hapus state HANYA jika dari luar (dashboard, task page, dll)
    if (!fromDetail && !fromArchive) {
        sessionStorage.removeItem("archiveScrollPos");
        sessionStorage.removeItem("clickedArchiveId");
    }

    // 1. Restore State
    const savedArchiveScroll = sessionStorage.getItem("archiveScrollPos");
    const savedArchiveClickedId = sessionStorage.getItem("clickedArchiveId");

    // [BARU] Priority: Cek URL Param 'highlight' dulu (untuk deep linking)
    const urlParams = new URLSearchParams(window.location.search);
    const highlightId = urlParams.get('highlight');

    // Gunakan highlight ID dari URL jika ada, jika tidak gunakan dari session
    const targetId = highlightId || savedArchiveClickedId;

    // B. Restore Scroll & Highlight
    if (targetId) {
        setTimeout(() => {
            const targetRow = document.querySelector(`tr.clickable-row[data-url*="/task/detail/${targetId}"]`);

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