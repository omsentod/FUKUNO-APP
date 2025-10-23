// GANTI SELURUH ISI FILE JS ANDA DENGAN INI

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================
  // === 1. PILIH ELEMEN UTAMA
  // ==========================================================
  const addBtn = document.getElementById("addBtn");
  const notif = document.getElementById("notif");
  const mainTableBody = document.querySelector(".task table tbody.table-bg");
  let clickedCell = null; // Untuk menyimpan sel mana yang di-klik kanan
  let actionHistory = []; // Untuk menyimpan riwayat aksi


  // ==========================================================
  // === 2. DEFINISI SEMUA FUNGSI
  // ==========================================================

  /**
   * MENAMBAH KOLOM BARU SECARA HORIZONTAL
   */
  function insertSizeColumn(table, index) {
      const tHeadRow = table.querySelector("thead tr");
      const tBody = table.querySelector("tbody");

      // Catat Aksi
      actionHistory.push({
          type: 'add-column',
          columnIndex: index,
          table: table
      });

      // Tambah header (TH) baru
      const newTh = document.createElement('th');
      newTh.innerHTML = '<input type="text" class="form-control" placeholder="Size Baru">';
      tHeadRow.insertBefore(newTh, tHeadRow.children[index]);

      // Tambah sel (TD) baru di setiap baris body
      tBody.querySelectorAll('tr').forEach(row => {
          const newTd = document.createElement('td');
          newTd.innerHTML = '<input type="text" class="form-control" placeholder="Jumlah">';
          row.insertBefore(newTd, row.children[index]);
      });
  }

  /**
   * MENGHAPUS KOLOM SECARA HORIZONTAL (Versi dengan isUndo)
   */
  function deleteSizeColumn(table, index, isUndo = false) {
      const tHeadRow = table.querySelector("thead tr");
      const tBody = table.querySelector("tbody");

      // Jangan hapus kolom "Jenis"
      if (index === 0) {
          alert("Tidak bisa menghapus kolom 'Jenis'.");
          return;
      }

      // Catat Aksi (hanya jika bukan operasi Undo)
      if (!isUndo) {
          const columnData = Array.from(tBody.querySelectorAll('tr')).map(r => r.children[index].innerHTML);
          actionHistory.push({
              type: 'delete-column',
              columnIndex: index,
              headerHTML: tHeadRow.children[index].innerHTML,
              cellsHTML: columnData,
              table: table
          });
      }
      
      // Hapus header dan sel
      tHeadRow.children[index].remove();
      tBody.querySelectorAll('tr').forEach(row => {
          row.children[index].remove();
      });
  }

  /**
   * MENAMBAH BARIS BARU SECARA VERTIKAL
   */
  function insertJenisRow(table, referenceRow) {
      const tBody = table.querySelector("tbody");
      const columnCount = table.querySelector("thead tr").children.length;
      
      const newRow = document.createElement('tr');
      let rowHTML = '';

      // Buat HTML untuk baris baru
      rowHTML += '<td><input type="text" class="form-control" placeholder="Jenis"></td>';
      for (let i = 1; i < columnCount; i++) {
          rowHTML += '<td><input type="text" class="form-control" placeholder="Jumlah"></td>';
      }
      newRow.innerHTML = rowHTML;

      // Catat Aksi
      actionHistory.push({
          type: 'add-row',
          addedRow: newRow,
          table: table,
          referenceRow: referenceRow
      });

      // Masukkan baris baru
      tBody.insertBefore(newRow, referenceRow.nextElementSibling);
  }

  /**
   * MENGHAPUS BARIS (Versi dengan isUndo)
   */
  function deleteJenisRow(table, row, isUndo = false) {
      const normalRows = table.querySelectorAll("tbody tr");
      if (normalRows.length <= 1) {
          alert("Tidak bisa menghapus baris terakhir.");
          return;
      }
      
      // Catat Aksi (hanya jika bukan operasi Undo)
      if (!isUndo) {
          actionHistory.push({
              type: 'delete-row',
              deletedRowHTML: row.innerHTML,
              originalIndex: Array.from(row.parentNode.children).indexOf(row),
              table: table
          });
      }
      row.remove();
  }

  /**
   * Membatalkan aksi terakhir yang tercatat di history.
   */
  function undoLastAction() {
    if (actionHistory.length === 0) {
        console.log("Tidak ada aksi untuk di-undo.");
        return;
    }

    const lastAction = actionHistory.pop();
    console.log("Undoing action:", lastAction.type);

    switch (lastAction.type) {
        case 'add-row':
            deleteJenisRow(lastAction.table, lastAction.addedRow, true);
            break;
        case 'delete-row':
            const tBody = lastAction.table.querySelector("tbody");
            const newRow = document.createElement('tr');
            newRow.innerHTML = lastAction.deletedRowHTML;
            tBody.insertBefore(newRow, tBody.children[lastAction.originalIndex]);
            break;
        case 'add-column':
            deleteSizeColumn(lastAction.table, lastAction.columnIndex, true);
            break;
        case 'delete-column':
            const headRow = lastAction.table.querySelector("thead tr");
            const bodyRows = lastAction.table.querySelectorAll("tbody tr");
            const newTh = document.createElement('th');
            newTh.innerHTML = lastAction.headerHTML;
            headRow.insertBefore(newTh, headRow.children[lastAction.columnIndex]);
            bodyRows.forEach((row, rowIndex) => {
                const newTd = document.createElement('td');
                newTd.innerHTML = lastAction.cellsHTML[rowIndex];
                row.insertBefore(newTd, row.children[lastAction.columnIndex]);
            });
            break;
        case 'edit-header':
             lastAction.thElement.textContent = lastAction.oldText;
             break;
    }
  }

  /**
   * Mengubah header TH menjadi input saat di-double-click.
   * (FUNGSI INI DIPINDAHKAN KE SINI - LUAR showPopup)
   */
  function handleHeaderDoubleClick(thElement) {
    if (thElement.querySelector('input.header-edit-input')) return;

    const currentText = thElement.textContent.trim();
    thElement.dataset.originalText = currentText;

    thElement.innerHTML = `<input type="text" class="form-control header-edit-input" value="${currentText}">`;

    const inputElement = thElement.querySelector('input.header-edit-input');
    inputElement.focus();
    inputElement.select();

    const finishHeaderEdit = () => {
        const newValue = inputElement.value.trim();
        const finalValue = newValue || thElement.dataset.originalText;

        if (finalValue !== thElement.dataset.originalText) {
            actionHistory.push({
                type: 'edit-header',
                thElement: thElement,
                oldText: thElement.dataset.originalText,
                newText: finalValue
            });
        }

        thElement.textContent = finalValue;
        // Hapus listener secara eksplisit untuk mencegah kebocoran memori
        inputElement.removeEventListener('blur', finishHeaderEdit);
        inputElement.removeEventListener('keydown', handleKeyDown);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            finishHeaderEdit();
        } else if (event.key === 'Escape') {
            thElement.textContent = thElement.dataset.originalText;
            inputElement.removeEventListener('blur', finishHeaderEdit);
            inputElement.removeEventListener('keydown', handleKeyDown);
        }
    };

    inputElement.addEventListener('blur', finishHeaderEdit);
    inputElement.addEventListener('keydown', handleKeyDown);
  }

  /**
   * Menampilkan pop-up dan mengatur listener-nya.
   */
  function showPopup() {
    const overlay = document.querySelector(".popup-overlay");
    if (!overlay) return;
    const popup = overlay.querySelector(".popup");
    if (!popup) return;

    // Listener tombol Add Line
    popup.querySelector("#addLine").addEventListener("click", (e) => {
        e.preventDefault();
        addLine();
    });

    // Listener tombol Cancel
    popup.querySelector("#cancelBtn").addEventListener("click", () => {
        overlay.style.display = "none";
        actionHistory = []; // Kosongkan history saat popup ditutup
    });

    // Listener SUBMIT FORM
    popup.querySelector("#taskForm").addEventListener("submit", (e) => {
        e.preventDefault();
        const loggedInUserName = document.querySelector('.page').dataset.userName;
        const data = {
            noInvoice: popup.querySelector("#noInvoice").value,
            namaPelanggan: popup.querySelector("#namaPelanggan").value,
            judul: popup.querySelector("#judul").value,
            catatan: popup.querySelector("#catatan").value,
            penanggungJawab: loggedInUserName,
            urgensi: popup.querySelector("#urgensi").value,
            jumlah: popup.querySelector("#jumlah").value,
            warna: popup.querySelector("#warna").value,
            model: popup.querySelector("#model").value,
            bahan: popup.querySelector("#bahan").value
        };
        addTaskToTable(data);
        showNotif("Task berhasil disimpan!");
        overlay.style.display = "none";
        actionHistory = []; // Kosongkan history saat submit berhasil
    });

    // LOGIKA KLIK KANAN (CONTEXT MENU)
    const sizeTable = popup.querySelector("#sizeTable");
    const contextMenu = popup.querySelector("#customContextMenu");

    sizeTable.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        clickedCell = e.target.closest('td, th');
        if (!clickedCell) return;
        const popupRect = popup.getBoundingClientRect();
        const x = e.clientX - popupRect.left;
        const y = e.clientY - popupRect.top + popup.scrollTop;
        contextMenu.style.top = `${y}px`;
        contextMenu.style.left = `${x}px`;
        contextMenu.classList.add("show");
    });

    popup.addEventListener("click", (e) => {
        if (!e.target.closest('.context-menu-item')) {
            contextMenu.classList.remove("show");
        }
    });

    contextMenu.addEventListener("click", (e) => {
        if (!clickedCell) return;
        const action = e.target.dataset.action;
        const table = clickedCell.closest('table');
        const cellIndex = clickedCell.cellIndex;
        const parentRow = clickedCell.closest('tr');

        switch (action) {
            case 'insert-row-after': insertJenisRow(table, parentRow); break;
            case 'delete-row': deleteJenisRow(table, parentRow); break;
            case 'insert-col-left': insertSizeColumn(table, cellIndex); break;
            case 'insert-col-right': insertSizeColumn(table, cellIndex + 1); break;
            case 'delete-col': deleteSizeColumn(table, cellIndex); break;
        }
        clickedCell = null;
        contextMenu.classList.remove("show");
    });

    // LISTENER DOUBLE-CLICK HEADER
    const sizeTableHead = sizeTable.querySelector('thead');
    sizeTableHead.addEventListener('dblclick', (event) => {
        const thTarget = event.target.closest('th');
        if (thTarget) {
            handleHeaderDoubleClick(thTarget);
        }
    });

    // LISTENER KEYDOWN (UNDO)
    popup.addEventListener('keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
          event.preventDefault();
          undoLastAction();
      }
    });

    // TAMPILKAN POP-UP
    overlay.style.display = "block";
    actionHistory = []; // Kosongkan history setiap kali popup dibuka
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
          <div class="col-md-6"><label>Nama Pekerjaan</label><input type="text" class="form-control line-nama" placeholder="Nama pekerjaan..."></div>
          <div class="col-md-6"><label>Deadline</label><input type="datetime-local" class="form-control line-deadline"></div>
        </div>
        <div class="mb-2">
          <label>Checklist</label><div class="checklist-container"></div>
          <a href="#" class="text-primary small addChecklist">+ Tambah Checklist</a>
        </div>
      `;
      lineContainer.appendChild(lineDiv);
  }

  /**
   * Membuat baris <tr> baru dan menambahkannya ke tabel utama
   */
  function addTaskToTable(data) {
    if (!mainTableBody) {
        console.error("Elemen .task table tbody.table-bg tidak ditemukan!");
        return;
    }
    const newId = 'task-' + Date.now();
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${data.noInvoice}</td>
        <td>${data.judul}</td>
        <td>${data.jumlah}</td>
        <td><button class="line-btn">N/A</button></td>
        <td>${data.urgensi}</td>
        <td>
            <div class="dropdown">
                <button class="status-btn status-needs-work dropdown-toggle" type="button" id="status-${newId}" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="status-text">Needs Work</span>
                </button>
                <div class="dropdown-menu" aria-labelledby="status-${newId}">
                    <a class="dropdown-item" href="#" data-status="Done and Ready">Done and Ready</a>
                    <a class="dropdown-item" href="#" data-status="In Progress">In Progress</a>
                    <a class="dropdown-item" href="#" data-status="Hold">Hold</a>
                    <a class="dropdown-item" href="#" data-status="Needs Work">Needs Work</a>
                </div>
            </div>
        </td>
        <td>-</td>
        <td><img src="" class="mockup"></td>
        <td><div class="pic">${buatInisial(data.penanggungJawab)}</div></td>
        <td>
            <div class="dropdown">
                <button class="progress dropdown-toggle" type="button" id="progress-${newId}" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="progress-text">0%</span>
                </button>
                <div class="dropdown-menu p-3" aria-labelledby="progress-${newId}" style="width: 200px;">
                    <form class="progress-form">
                        <div class="form-check">
                            <input class="form-check-input progress-check" type="checkbox" id="check-design-${newId}">
                            <label class="form-check-label" for="check-design-${newId}">Design</label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input progress-check" type="checkbox" id="check-prod-${newId}">
                            <label class="form-check-label" for="check-prod-${newId}">Production</label>
                        </div>
                        <button type="button" class="btn btn-primary mt-3 done-btn" data-bs-toggle="dropdown">Done</button>
                    </form>
                </div>
            </div>
        </td>
        <td class="icon-cell">
            <i class="bi bi-pencil-square icon-edit"></i>
            <i class="bi bi-cloud-download-fill icon-download"></i>
            <i class="bi bi-trash3-fill icon-trash"></i>
        </td>
    `;
    mainTableBody.appendChild(newRow);
    const newProgressBar = newRow.querySelector('.dropdown-toggle.progress');
    const newMenu = newProgressBar.nextElementSibling;
    if (newMenu) {
        const firstCheck = newMenu.querySelector('.progress-check');
        if (firstCheck) updateProgress(firstCheck);
    }
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
      if (progressText) progressText.textContent = percentage.toFixed(0) + '%';
      const progressButton = dropdown.querySelector('.dropdown-toggle');
      if (!progressButton) return;
      progressButton.classList.remove('status-red', 'status-yellow', 'status-green');
      if (percentage === 0) progressButton.classList.add('status-red');
      else if (percentage === 100) progressButton.classList.add('status-green');
      else progressButton.classList.add('status-yellow');
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
      if (statusTextSpan) statusTextSpan.textContent = newStatus;
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

  /**
   * Membuka tab baru untuk print
   */
  function handlePrint(icon) {
    const row = icon.closest('tr');
    if (!row) return;
    const cells = row.querySelectorAll('td');
    const data = {
        noPo: cells[0].textContent.trim(),
        taskTitle: cells[1].textContent.trim(),
        jumlah: cells[2].textContent.trim(),
        mockupSrc: cells[7].querySelector('img').src,
    };
    const queryString = new URLSearchParams(data).toString();
    const printURL = '/print-po?' + queryString;
    window.open(printURL, '_blank');
  }

  /**
   * Membuat inisial dari nama
   */
  function buatInisial(nama) {
    if (!nama) return '??';
    const words = nama.split(' ');
    let initials = words[0].substring(0, 1);
    if (words.length > 1) initials += words[1].substring(0, 1);
    return initials.toUpperCase();
  }


  // ==========================================================
  // === 3. EVENT LISTENERS (Inisialisasi)
  // ==========================================================

  // Tombol "Add Task" utama
  if (addBtn) addBtn.addEventListener("click", showPopup);

  // Inisialisasi warna progress bar saat halaman dimuat
  document.querySelectorAll('.dropdown-toggle.progress').forEach(progressButton => {
      const dropdownMenu = progressButton.nextElementSibling;
      if (dropdownMenu) {
          const firstCheck = dropdownMenu.querySelector('.progress-check');
          if (firstCheck) updateProgress(firstCheck);
      }
  });

  // Listener untuk PERUBAHAN (change) - Khusus Checkbox
  document.body.addEventListener('change', function(event) {
      if (event.target.classList.contains('progress-check')) {
          updateProgress(event.target);
      }
  });

  // Listener untuk KLIK (click) - GABUNGAN SEMUA DELEGASI
  document.body.addEventListener('click', function(event) {
      const target = event.target;

      // 1. Hapus line pekerjaan (.btn-remove-line di dalam popup)
      if (target.classList.contains('btn-remove-line')) {
          event.preventDefault();
          target.closest('.border.p-3.mb-3.rounded')?.remove();
      }

      // 2. Tambah checklist (.addChecklist di dalam popup)
      if (target.classList.contains('addChecklist')) {
          event.preventDefault();
          addChecklist(target);
      }

      // 3. Ubah status (.dropdown-item dengan data-status)
      const statusItem = target.closest('.dropdown-item[data-status]');
      if (statusItem) {
          event.preventDefault();
          handleStatusChange(statusItem);
      }

      // 4. Download PO (.icon-download)
      if (target.classList.contains('icon-download')) {
        event.preventDefault();
        handlePrint(target);
      }

      // 5. Hapus Task Utama (.icon-trash)
      if (target.classList.contains('icon-trash')) {
          event.preventDefault();
          if (confirm('Apakah Anda yakin ingin menghapus task ini?')) {
              target.closest('tr')?.remove();
              showNotif('Task telah dihapus.');
          }
      }
  });

}); // <-- Penutup DOMContentLoaded