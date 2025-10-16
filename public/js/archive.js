document.addEventListener("DOMContentLoaded", function () {
  // ==========================
  // SIDEBAR NAVIGATION
  // ==========================
  const sidebarCells = document.querySelectorAll('.sidebar-cell');

  sidebarCells.forEach(cell => {
    cell.addEventListener('click', function() {
      // hapus kelas active dari semua item
      sidebarCells.forEach(c => c.parentElement.classList.remove('active'));
      // tambahkan active ke item yang diklik
      this.parentElement.classList.add('active');

      // arahkan ke halaman sesuai href
      const href = this.getAttribute('href');
      if (href && href !== '#') {
        window.location.href = href;
      }
    });
  });

  // ==========================
  // ARCHIVE PAGE INTERACTION
  // ==========================
  // Tombol Pilih
  const selectBtn = document.querySelector('.select-toggle');
  const selectAll = document.getElementById('selectAll');
  const rowCheckboxes = document.querySelectorAll('.row-select');
  let selectionMode = false;

  if (selectBtn) {
    selectBtn.addEventListener('click', () => {
      selectionMode = !selectionMode;
      selectAll.style.display = selectionMode ? 'inline-block' : 'none';
      rowCheckboxes.forEach(cb => cb.style.display = selectionMode ? 'inline-block' : 'none');
      selectBtn.textContent = selectionMode ? 'Batal' : 'Pilih';
    });
  }

  if (selectAll) {
    selectAll.addEventListener('change', () => {
      rowCheckboxes.forEach(cb => cb.checked = selectAll.checked);
    });
  }

  // ==========================
  // ACTION ICONS (RESTORE / DELETE / DETAIL)
  // ==========================
  document.addEventListener('click', function(e) {
    // Restore satu baris
    if (e.target.classList.contains('bi-arrow-counterclockwise')) {
      showNotification('Data berhasil direstore!', 'success');
    }

    // Delete satu baris
    if (e.target.classList.contains('bi-trash-fill')) {
      const confirmed = confirm('Yakin ingin menghapus data ini?');
      if (confirmed) {
        e.target.closest('tr').remove();
        showNotification('Data berhasil dihapus!', 'delete');
      }
    }

    // Detail satu baris
    if (e.target.classList.contains('bi-file-earmark-text')) {
      showNotification('Fitur detail belum aktif.', 'info');
    }
  });

  // ==========================
  // BULK ACTIONS (atas kanan)
  // ==========================
  const bulkRestore = document.querySelector('.restore-all');
  const bulkDelete = document.querySelector('.delete-all');

  if (bulkRestore) {
    bulkRestore.addEventListener('click', () => {
      const checked = document.querySelectorAll('.row-select:checked');
      if (checked.length > 0) {
        showNotification(`${checked.length} data berhasil direstore!`, 'success');
      } else {
        showNotification('Tidak ada data yang dipilih.', 'info');
      }
    });
  }

  if (bulkDelete) {
    bulkDelete.addEventListener('click', () => {
      const checked = document.querySelectorAll('.row-select:checked');
      if (checked.length > 0) {
        const confirmed = confirm(`Hapus ${checked.length} data terpilih?`);
        if (confirmed) {
          checked.forEach(cb => cb.closest('tr').remove());
          showNotification(`${checked.length} data berhasil dihapus!`, 'delete');
        }
      } else {
        showNotification('Tidak ada data yang dipilih.', 'info');
      }
    });
  }

  // ==========================
  // NOTIFICATION POPUP
  // ==========================
  function showNotification(message, type = 'info') {
    const notif = document.createElement('div');
    notif.classList.add('notification');
    notif.textContent = message;

    if (type === 'success') notif.style.backgroundColor = '#2ecc71';
    if (type === 'delete') notif.style.backgroundColor = '#e74c3c';
    if (type === 'info') notif.style.backgroundColor = '#3498db';

    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.right = '20px';
    notif.style.color = '#fff';
    notif.style.padding = '12px 18px';
    notif.style.borderRadius = '8px';
    notif.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
    notif.style.fontSize = '14px';
    notif.style.zIndex = '9999';
    notif.style.opacity = '0';
    notif.style.transition = 'opacity 0.3s ease';

    document.body.appendChild(notif);
    setTimeout(() => notif.style.opacity = '1', 50);
    setTimeout(() => {
      notif.style.opacity = '0';
      setTimeout(() => notif.remove(), 300);
    }, 2500);
  }
});
