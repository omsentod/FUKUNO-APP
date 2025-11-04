// GANTI SELURUH ISI FILE JS ANDA DENGAN INI

document.addEventListener("DOMContentLoaded", () => {

  // ==========================================================
  // === 1. PILIH ELEMEN UTAMA
  // ==========================================================
  const addBtn = document.getElementById("addBtn");
  const notif = document.getElementById("notif");
  const mainTableBody = document.querySelector(".task table tbody.table-bg");
  
  // Variabel Global
  let clickedCell = null;
  let actionHistory = [];
  let mockupFiles = new Map();
  let currentGallerySources = [];
  let currentGalleryIndex = 0;
  
  // Variabel Modal Carousel
  let modal = null;
  let modalImg = null;
  let modalPrevBtn = null;
  let modalNextBtn = null;

  // ==========================================================
  // === 2. DEFINISI SEMUA FUNGSI
  // ==========================================================

  // --- FUNGSI TABEL SIZE (VERTIKAL) ---

  /**
   * Menghitung ulang SEMUA total (per baris, per kolom, dan grand total).
   */
  function calculateTotals() {
      const sizeTable = document.querySelector("#sizeTable");
      if (!sizeTable) return;
      const tBody = sizeTable.querySelector("tbody");
      const tFootRow = sizeTable.querySelector("tfoot tr");
      const headerCells = sizeTable.querySelectorAll("thead tr th");
      if (!tBody || !tFootRow || headerCells.length < 3) return; 

      const quantityColumnCount = headerCells.length - 2; // Kolom sebelum 'Jumlah'
      const columnTotals = Array(quantityColumnCount).fill(0);
      let grandTotal = 0;

      tBody.querySelectorAll('tr').forEach(row => {
          let rowTotal = 0;
          const quantityInputs = row.querySelectorAll('.quantity-input');
          quantityInputs.forEach((input, colIndex) => {
               if (colIndex < quantityColumnCount) {
                   const value = parseInt(input.value, 10);
                   if (!isNaN(value) && value > 0) {
                       rowTotal += value;
                       columnTotals[colIndex] += value;
                   }
               }
          });
          const rowTotalCell = row.querySelector('.row-total');
          if (rowTotalCell) rowTotalCell.textContent = rowTotal;
      });

      const footerColumnTotalCells = tFootRow.querySelectorAll('.column-total');
      footerColumnTotalCells.forEach((cell, index) => {
          if (index < columnTotals.length) cell.textContent = columnTotals[index];
      });

      grandTotal = columnTotals.reduce((sum, current) => sum + current, 0);
      const grandTotalCell = tFootRow.querySelector('.grand-total');
      if (grandTotalCell) grandTotalCell.textContent = grandTotal;
  }

  /**
   * MENAMBAH KOLOM TIPE BARU (e.g., Pendek, Panjang) SECARA HORIZONTAL
   */
  function insertTypeColumn(table, index) {
      const tHeadRow = table.querySelector("thead tr");
      const tBody = table.querySelector("tbody");
      const tFootRow = table.querySelector("tfoot tr");
      if (!tHeadRow || !tBody || !tFootRow) return;

      const targetIndex = Math.min(index, tHeadRow.children.length - 1); // Batasi sebelum 'Jumlah'
      actionHistory.push({ type: 'add-column', columnIndex: targetIndex, table: table });

      const newTh = document.createElement('th');
      newTh.innerHTML = '<input type="text" class="form-control" placeholder="Tipe Baru">';
      tHeadRow.insertBefore(newTh, tHeadRow.children[targetIndex]);

      tBody.querySelectorAll('tr').forEach(row => {
          const newTd = document.createElement('td');
          newTd.innerHTML = '<input type="text" class="form-control quantity-input" placeholder="0">';
          row.insertBefore(newTd, row.children[targetIndex]);
      });

      const newFt = document.createElement('td');
      newFt.classList.add('column-total');
      newFt.textContent = '0';
      tFootRow.insertBefore(newFt, tFootRow.children[targetIndex]);

      calculateTotals();
  }

  /**
   * MENGHAPUS KOLOM TIPE (e.g., Pendek, Panjang) SECARA HORIZONTAL (dengan isUndo)
   */
  function deleteTypeColumn(table, index, isUndo = false) {
      const tHeadRow = table.querySelector("thead tr");
      const tBody = table.querySelector("tbody");
      const tFootRow = table.querySelector("tfoot tr");

      // Jangan hapus kolom "Size" (index 0) atau "Jumlah" (index terakhir)
      if (index === 0 || index === tHeadRow.children.length - 1) {
          alert("Tidak bisa menghapus kolom 'Size' atau 'Jumlah'.");
          return;
      }
      if (!isUndo) {
          const columnData = Array.from(tBody.querySelectorAll('tr')).map(r => r.children[index].innerHTML);
          const footerData = tFootRow.children[index] ? tFootRow.children[index].innerHTML : '';
          actionHistory.push({ type: 'delete-column', columnIndex: index, headerHTML: tHeadRow.children[index].innerHTML, cellsHTML: columnData, footerHTML: footerData, table: table });
      }
      tHeadRow.children[index].remove();
      tBody.querySelectorAll('tr').forEach(row => { row.children[index].remove(); });
      if(tFootRow.children[index]) tFootRow.children[index].remove();
      calculateTotals();
  }

  /**
   * MENAMBAH BARIS UKURAN BARU (e.g., S, M, L) SECARA VERTIKAL
   */
  function insertSizeRow(table, referenceRow) {
      const tBody = table.querySelector("tbody");
      const columnCount = table.querySelector("thead tr").children.length - 1; 
      const newRow = document.createElement('tr');
      let rowHTML = '';
      rowHTML += '<td><input type="text" class="form-control size-name" placeholder="New Size"></td>';
      for (let i = 1; i < columnCount; i++) {
          rowHTML += '<td><input type="text" class="form-control quantity-input" placeholder="0"></td>';
      }
      rowHTML += '<td class="row-total">0</td>';
      newRow.innerHTML = rowHTML;
      actionHistory.push({ type: 'add-row', addedRow: newRow, table: table, referenceRow: referenceRow });
      tBody.insertBefore(newRow, referenceRow ? referenceRow.nextElementSibling : tBody.firstChild);
      calculateTotals();
  }

  /**
   * MENGHAPUS BARIS UKURAN (e.g., S, M, L) SECARA VERTIKAL (dengan isUndo)
   */
  function deleteSizeRow(table, row, isUndo = false) {
      const normalRows = table.querySelectorAll("tbody tr");
      if (normalRows.length <= 1) {
          alert("Tidak bisa menghapus baris ukuran terakhir.");
          return;
      }
      if (!isUndo) {
          actionHistory.push({ type: 'delete-row', deletedRowHTML: row.innerHTML, originalIndex: Array.from(row.parentNode.children).indexOf(row), table: table });
      }
      row.remove();
      calculateTotals();
  }

  /**
   * Membatalkan aksi terakhir yang tercatat di history (Versi Final).
   */
  function undoLastAction() {
      if (actionHistory.length === 0) return;
      const lastAction = actionHistory.pop();
      console.log("Undoing action:", lastAction.type);
      switch (lastAction.type) {
          case 'add-row':
              deleteSizeRow(lastAction.table, lastAction.addedRow, true);
              break;
          case 'delete-row':
              const tBodyUndo = lastAction.table.querySelector("tbody");
              if (tBodyUndo) {
                  const newRowUndo = document.createElement('tr');
                  newRowUndo.innerHTML = lastAction.deletedRowHTML;
                  tBodyUndo.insertBefore(newRowUndo, tBodyUndo.children[lastAction.originalIndex]);
                  calculateTotals();
              }
              break;
          case 'add-column':
              deleteTypeColumn(lastAction.table, lastAction.columnIndex, true);
              break;
          case 'delete-column':
              const headRowUndo = lastAction.table.querySelector("thead tr");
              const bodyRowsUndo = lastAction.table.querySelectorAll("tbody tr");
              const footRowUndo = lastAction.table.querySelector("tfoot tr");
              if (headRowUndo && bodyRowsUndo.length > 0 && footRowUndo) {
                  const newThUndo = document.createElement('th');
                  newThUndo.innerHTML = lastAction.headerHTML;
                  headRowUndo.insertBefore(newThUndo, headRowUndo.children[lastAction.columnIndex]);
                  bodyRowsUndo.forEach((row, rowIndex) => {
                      const newTdUndo = document.createElement('td');
                      newTdUndo.innerHTML = lastAction.cellsHTML[rowIndex] || '<td><input type="text" class="form-control quantity-input" placeholder="0"></td>';
                      row.insertBefore(newTdUndo, row.children[lastAction.columnIndex]);
                  });
                  const newFtUndo = document.createElement('td');
                  newFtUndo.innerHTML = lastAction.footerHTML || '<td class="column-total">0</td>';
                  newFtUndo.classList.add('column-total');
                  footRowUndo.insertBefore(newFtUndo, footRowUndo.children[lastAction.columnIndex]);
                  calculateTotals();
              }
              break;
          case 'edit-header':
              if (lastAction.thElement) {
                  lastAction.thElement.textContent = lastAction.oldText;
              }
              break;
      }
  }

  /**
   * Mengubah header TH menjadi input saat di-double-click.
   */
  function handleHeaderDoubleClick(thElement) {
      if (thElement.querySelector('input.header-edit-input')) return;
      
      // Izinkan edit semua kolom
      // (Blok 'if' yang membatasi sudah dihapus)
      
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
              actionHistory.push({ type: 'edit-header', thElement: thElement, oldText: thElement.dataset.originalText, newText: finalValue });
          }
          thElement.textContent = finalValue;
          inputElement.removeEventListener('blur', finishHeaderEdit);
          inputElement.removeEventListener('keydown', handleKeyDown);
      };
      const handleKeyDown = (event) => {
          if (event.key === 'Enter') finishHeaderEdit();
          else if (event.key === 'Escape') {
              thElement.textContent = thElement.dataset.originalText;
              inputElement.removeEventListener('blur', finishHeaderEdit);
              inputElement.removeEventListener('keydown', handleKeyDown);
          }
      };
      inputElement.addEventListener('blur', finishHeaderEdit);
      inputElement.addEventListener('keydown', handleKeyDown);
  }

  // --- FUNGSI CAROUSEL MOCKUP ---

  /**
   * Menampilkan daftar file yang dipilih di area preview.
   */
  function updateMockupPreview() {
      const previewArea = document.querySelector(".popup #mockup-preview-area");
      if (!previewArea) return;
      previewArea.innerHTML = '';
      if (mockupFiles.size > 0) {
          let fileListHTML = '<strong>File yang dipilih:</strong><ul class="list-unstyled mb-0">';
          mockupFiles.forEach((file, name) => {
              fileListHTML += `
                  <li class="text-muted">
                      <span><i class="bi bi-file-earmark"></i> ${name}</span>
                      <span class="remove-mockup-btn" data-key="${name}">&times;</span>
                  </li>
              `;
          });
          fileListHTML += '</ul>';
          previewArea.innerHTML = fileListHTML;
      }
  }

  /**
   * Inisialisasi indikator galeri untuk satu baris
   */
  function initGalleryIndicator(rowElement) {
      const wrapper = rowElement.querySelector('.mockup-wrapper');
      if (!wrapper) return;
      const images = wrapper.querySelectorAll('.mockup-image-data');
      const indicator = wrapper.querySelector('.gallery-indicator');
      if (images.length > 1) {
          indicator.classList.add('visible');
      } else {
          indicator.classList.remove('visible');
      }
  }

  /**
   * Membuka modal carousel
   */
  function openImageModal(wrapper) {
      const images = wrapper.querySelectorAll('.mockup-image-data');
      currentGallerySources = Array.from(images).map(img => img.src);
      currentGalleryIndex = 0;
      if (currentGallerySources.length === 0) return;
      if (!modal) modal = document.getElementById("imageCarouselModal"); // Pastikan modal ada
      if (!modal) return;
      modal.style.display = "flex";
      showModalImage(currentGalleryIndex);
  }

  /**
   * Menampilkan gambar di modal berdasarkan index
   */
  function showModalImage(index) {
      if (index < 0 || index >= currentGallerySources.length) return;
      if (!modalImg) modalImg = document.getElementById("modalImage"); // Pastikan img ada
      if (!modalPrevBtn) modalPrevBtn = document.getElementById("modalPrevBtn");
      if (!modalNextBtn) modalNextBtn = document.getElementById("modalNextBtn");
      if (!modalImg || !modalPrevBtn || !modalNextBtn) return;
      
      currentGalleryIndex = index;
      modalImg.src = currentGallerySources[index];
      modalPrevBtn.disabled = (index === 0);
      modalNextBtn.disabled = (index === currentGallerySources.length - 1);
  }

  function nextModalImage() { showModalImage(currentGalleryIndex + 1); }
  function prevModalImage() { showModalImage(currentGalleryIndex - 1); }

  // --- FUNGSI PENGUMPUL DATA UNTUK SUBMIT ---

  /**
   * Mengumpulkan semua data dari "Line Pekerjaan"
   */
  function getLineData(popup) {
      const lines = [];
      popup.querySelectorAll("#lineContainer .border").forEach(lineDiv => {
          const line = {
              nama: lineDiv.querySelector(".line-nama")?.value || '',
              deadline: lineDiv.querySelector(".line-deadline")?.value || null,
              checklists: []
          };
          lineDiv.querySelectorAll(".checklist-item").forEach(checkInput => {
              if(checkInput.value) line.checklists.push(checkInput.value);
          });
          if(line.nama) lines.push(line);
      });
      return lines;
  }

  /**
   * Mengumpulkan semua data dari tabel "Jenis & Size"
   */
  function getSizeTableData(popup) {
      const table = popup.querySelector("#sizeTable");
      if (!table) return { headers: [], rows: [] };

      const headers = [];
      table.querySelectorAll("thead th:not(:first-child):not(:last-child)").forEach(th => {
          headers.push(th.textContent.trim() || th.querySelector('input')?.value.trim() || 'Tipe');
      });

      const rows = [];
      table.querySelectorAll("tbody tr").forEach(tr => {
          const jenis = tr.querySelector('td:first-child input')?.value || '';
          if (!jenis) return; // Skip baris tanpa jenis
          
          const rowData = { jenis: jenis, quantities: {} };
          tr.querySelectorAll('.quantity-input').forEach((input, index) => {
              const headerName = headers[index] || `tipe_${index}`;
              rowData.quantities[headerName] = parseInt(input.value, 10) || 0;
          });
          rows.push(rowData);
      });
      return { headers: headers, rows: rows };
  }
// ▼▼▼  FUNGSI UPDATE TASK▼▼▼
/**
/**
 * Meng-update status (front-end & back-end) untuk sebuah Task.
 * @param {string} taskId - ID dari task yang akan diupdate.
 * @param {string} newStatusName - Nama status baru (e.g., "In Progress").
 */
 function updateTaskStatus(taskId, newStatusName) {
    // 1. Temukan tombol status di tabel utama
    const statusButton = document.querySelector(`#statusDropdown${taskId}`);
    if (!statusButton) return;

    const statusTextSpan = statusButton.querySelector('.status-text');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // 2. Update Tampilan Tombol (Kode Anda yang sudah ada)
    statusTextSpan.textContent = newStatusName;
    
    statusButton.classList.forEach(className => {
        if (className.startsWith('status-') && className !== 'status-btn') {
            statusButton.classList.remove(className);
        }
    });
    const newClass = 'status-' + newStatusName.toLowerCase().replace(/\s+/g, '-');
    statusButton.classList.add(newClass);

    // ▼▼▼ 3. TAMBAHAN: UPDATE TAMPILAN DROPDOWN MENU ▼▼▼
    const dropdownMenu = statusButton.nextElementSibling; // Dapatkan .dropdown-menu
    if (dropdownMenu) {
        let newMenuHTML = '';
        if (newStatusName === 'Hold') {
            // Jika status BARU adalah 'Hold', menu harus menampilkan "Resume"
            newMenuHTML = `
                <a class="dropdown-item" href="#" data-status="Resume Progress">
                    <i class="bi bi-play-circle"></i> Resume Progress
                </a>`;
        } else {
            // Jika status BARU adalah "In Progress", "Done", dll., menu harus menampilkan "Hold"
            newMenuHTML = `
                <a class="dropdown-item" href="#" data-status="Hold">
                    <i class="bi bi-pause-circle"></i> Set to Hold
                </a>`;
        }
        // Ganti isi HTML dari menu
        dropdownMenu.innerHTML = newMenuHTML;
    }
    // ▲▲▲ AKHIR TAMBAHAN ▲▲▲

    // 4. Kirim Update ke Server (Kode Anda yang sudah ada)
    fetch(`/task/status/update/${taskId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            status_name: newStatusName
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            console.log(`Task ${taskId} status updated to ${newStatusName}`);
        } else {
            console.error('Gagal update status di server:', result.message);
        }
    })
    .catch(error => console.error('Error:', error));
}
  // --- FUNGSI POPUP UTAMA ---

  /**
   * Menampilkan pop-up dan mengatur listener-nya.
   */
  function showPopup() {
      const overlay = document.querySelector(".popup-overlay");
      if (!overlay) return;
      
      // Clone popup untuk hapus semua listener lama
      const oldPopup = overlay.querySelector(".popup");
      if (!oldPopup) {
          console.error("Elemen .popup tidak ditemukan!");
          return;
      }
      const newPopup = oldPopup.cloneNode(true);
      overlay.replaceChild(newPopup, oldPopup);
      
      // Ambil referensi elemen dari 'newPopup' yang bersih
      const addLineBtn = newPopup.querySelector("#addLine");
      const cancelBtn = newPopup.querySelector("#cancelBtn");
      const taskForm = newPopup.querySelector("#taskForm");
      const addSizeRowBtn = newPopup.querySelector("#addSizeRow");
      const sizeTable = newPopup.querySelector("#sizeTable");
      const contextMenu = newPopup.querySelector("#customContextMenu");
      const sizeTableHead = newPopup.querySelector('#sizeTable thead');
      const sizeTableBody = newPopup.querySelector("#sizeTable tbody");
      const mockupInput = newPopup.querySelector("#mockups");
      const previewArea = newPopup.querySelector("#mockup-preview-area");

      // Listener tombol Add Line
      if (addLineBtn) {
          addLineBtn.addEventListener("click", (e) => { e.preventDefault(); addLine(); });
      } else { console.error("Tombol #addLine tidak ditemukan!"); }

      // Listener tombol Cancel
      if (cancelBtn) {
          cancelBtn.addEventListener("click", () => { overlay.style.display = "none"; actionHistory = []; mockupFiles.clear(); });
      }

      // Listener Tombol Tambah Ukuran (Baris)
      if (addSizeRowBtn) {
           addSizeRowBtn.addEventListener("click", (e) => {
               e.preventDefault();
               const lastRow = newPopup.querySelector("#sizeTable tbody tr:last-child");
               insertSizeRow(sizeTable, lastRow || sizeTable.querySelector('tbody'));
           });
      }

      // Listener Input Mockup
      if (mockupInput) {
          mockupInput.addEventListener('change', () => {
              if (mockupInput.files.length > 0) {
                  for (const file of mockupInput.files) {
                      mockupFiles.set(file.name, file);
                  }
                  updateMockupPreview();
                  mockupInput.value = ''; 
              }
          });
      }
      // Listener Hapus Mockup
      if (previewArea) {
          previewArea.addEventListener('click', (event) => {
              if (event.target.classList.contains('remove-mockup-btn')) {
                  const fileName = event.target.dataset.key;
                  mockupFiles.delete(fileName);
                  updateMockupPreview();
              }
          });
      }

      // Listener SUBMIT FORM (Fetch)
      if (taskForm) {
          taskForm.addEventListener("submit", async (e) => {
              e.preventDefault();
              const submitBtn = taskForm.querySelector('button[type="submit"]');
              if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Menyimpan...'; }
              
              try {
                  const csrfToken = document.querySelector('meta[name="csrf-token"]');
                  if (!csrfToken) throw new Error("CSRF token tidak ditemukan.");
                  
                  const formData = new FormData();
                  const loggedInUserName = document.querySelector('.page')?.dataset.userName || 'Unknown';
                  const grandTotalValue = newPopup.querySelector("#sizeTable tfoot .grand-total")?.textContent || '0';
                  
                  formData.append('noInvoice', newPopup.querySelector("#noInvoice")?.value || '');
                  formData.append('namaPelanggan', newPopup.querySelector("#namaPelanggan")?.value || '');
                  formData.append('judul', newPopup.querySelector("#judul")?.value || '');
                  formData.append('catatan', newPopup.querySelector("#catatan")?.value || '');
                  formData.append('penanggungJawab', loggedInUserName);
                  formData.append('urgensi', newPopup.querySelector("#urgensi")?.value || '');
                  formData.append('jumlah', grandTotalValue);
                  formData.append('warna', newPopup.querySelector("#warna")?.value || '');
                  formData.append('model', newPopup.querySelector("#model")?.value || '');
                  formData.append('bahan', newPopup.querySelector("#bahan")?.value || '');
                  
                  const lineData = getLineData(newPopup);
                  const sizeData = getSizeTableData(newPopup);
                  formData.append('lines', JSON.stringify(lineData));
                  formData.append('sizes', JSON.stringify(sizeData));
                  
                  if (mockupFiles.size > 0) {
                      mockupFiles.forEach(file => {
                          formData.append('mockups[]', file, file.name);
                      });
                  }

                  const response = await fetch('/task/store', {
                      method: 'POST',
                      headers: {
                          'X-CSRF-TOKEN': csrfToken.getAttribute('content'),
                          'Accept': 'application/json'
                      },
                      body: formData
                  });
                  
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                
                const result = await response.json();
                
                if (!result.success) {
                    throw new Error(result.message || 'Error server tidak diketahui');
                }
                
                // 10. SUKSES: Tampilkan notif dan REFRESH HALAMAN
                showNotif(result.message || "Task berhasil disimpan!");
                
                // Tunggu notif terlihat, lalu refresh
                setTimeout(() => {
                    location.reload(); // <-- REFRESH HALAMAN
                }, 1000); // Tunggu 1 detik
                
            } catch (error) {
                console.error('Error saat submit:', error);
                alert(`Gagal menyimpan task: ${error.message}`);
                // Re-enable tombol HANYA jika gagal
                const submitBtn = taskForm.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Submit';
                }
            } 
            // 'finally' tidak diperlukan lagi karena kita me-refresh
        });
      }

      // LOGIKA KLIK KANAN (CONTEXT MENU)
      if (sizeTable && contextMenu) {
          sizeTable.addEventListener("contextmenu", (e) => {
              e.preventDefault();
              clickedCell = e.target.closest('td, th');
              if (!clickedCell) return;
              const popupRect = newPopup.getBoundingClientRect();
              const x = e.clientX - popupRect.left;
              const y = e.clientY - popupRect.top + newPopup.scrollTop;
              contextMenu.style.top = `${y}px`;
              contextMenu.style.left = `${x}px`;
              contextMenu.classList.add("show");
          });
          newPopup.addEventListener("click", (e) => {
               if (!e.target.closest('.context-menu-item') && !e.target.closest('#sizeTable')) {
                   contextMenu.classList.remove("show");
               }
          });
          contextMenu.addEventListener("click", (e) => {
              if (!clickedCell) return;
              const targetItem = e.target.closest('.context-menu-item');
              if (!targetItem) return;
              const action = targetItem.dataset.action;
              const table = clickedCell.closest('table');
              const cellIndex = clickedCell.cellIndex;
              const parentRow = clickedCell.closest('tr');
              switch (action) {
                  case 'insert-row-after': insertSizeRow(table, parentRow); break;
                  case 'delete-row': deleteSizeRow(table, parentRow); break;
                  case 'insert-col-right': insertTypeColumn(table, cellIndex + 1); break;
                  case 'delete-col': deleteTypeColumn(table, cellIndex); break;
              }
              clickedCell = null;
              contextMenu.classList.remove("show");
          });
      }

      // LISTENER DOUBLE-CLICK HEADER
      if (sizeTableHead) {
          sizeTableHead.addEventListener('dblclick', (event) => {
              const thTarget = event.target.closest('th');
              if (thTarget) {
                  handleHeaderDoubleClick(thTarget);
              }
          });
      }

      // LISTENER KEYDOWN (UNDO)
      newPopup.addEventListener('keydown', (event) => {
          if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
              event.preventDefault();
              undoLastAction();
          }
      });

      // LISTENER INPUT JUMLAH
      if (sizeTableBody) {
          sizeTableBody.addEventListener('input', (event) => {
              if (event.target.classList.contains('quantity-input')) {
                  calculateTotals();
              }
          });
      }

// Listener untuk Hapus Line, Tambah Checklist, dan Hapus Checklist
const lineContainerArea = newPopup.querySelector("#lineContainer");
if (lineContainerArea) {
    lineContainerArea.addEventListener('click', (event) => {
        const target = event.target; // Elemen yang diklik

        // 1. Hapus line pekerjaan (mencari tombol .btn-remove-line)
        const removeLineBtn = target.closest('.btn-remove-line');
        if (removeLineBtn) {
            event.preventDefault();
            removeLineBtn.closest('.border.p-3.mb-3.rounded')?.remove();
        }

        // 2. Tambah checklist (mencari link .addChecklist)
        const addChecklistLink = target.closest('.addChecklist');
        if (addChecklistLink) {
            event.preventDefault();
            addChecklist(addChecklistLink);
        }

        // 3. Hapus checklist (mencari .btn-remove-checklist)
        const removeChecklistBtn = target.closest('.btn-remove-checklist'); 
        if (removeChecklistBtn) {
            event.preventDefault();
            // Hapus seluruh 'div' wrapper-nya
            removeChecklistBtn.closest('.d-flex.gap-2.mb-2')?.remove(); 
        }
    });
}

      // Panggil kalkulasi & kosongkan history saat popup dibuka
      calculateTotals();
      actionHistory = [];
      mockupFiles.clear();
      updateMockupPreview();

      // TAMPILKAN POP-UP
      overlay.style.display = "block";
  }

  // --- FUNGSI UTILITAS LAINNYA (TETAP SAMA) ---

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



   function addTaskToTable(task) {
    if (!mainTableBody) {
        console.error("Elemen .task table tbody.table-bg tidak ditemukan!");
        return; 
    }

    const newId = 'task-' + task.id;
    const picName = task.user ? task.user.name : '??';
    const statusName = task.status ? task.status.name : 'Needs Work';
    
    // [FIX #2] Logika Mockup (Tetap sama)
    const firstMockup = task.mockups && task.mockups.length > 0 ? task.mockups[0].file_path_url : 'assets/img/default.png'; 
    const mockupsHTML = task.mockups && task.mockups.length > 0 ? task.mockups.map(img => `<img src="${img.file_path_url}" class="mockup-image-data">`).join('') : '<img src="assets/img/default.png" class="mockup-image-data">';
    const indicatorVisible = task.mockups && task.mockups.length > 1 ? 'visible' : '';

    // ▼▼▼ [FIX #3] LOGIKA LINE & DEADLINE BARU (Tanpa Loop) ▼▼▼
    const lineCount = task.task_pekerjaans ? task.task_pekerjaans.length : 0;
    
    // (Kita masih ambil lineName dari yg pertama, karena task di-split)
    const linePekerjaan = (lineCount > 0) ? task.task_pekerjaans[0] : null; 
    const lineName = linePekerjaan ? linePekerjaan.nama_pekerjaan : 'N/A';
    let timeleft = '-';
    
    // (BARU) Cari deadline paling lama (max)
    let maxDeadline = null;
    if (lineCount > 0) {
        task.task_pekerjaans.forEach(line => {
            if (line.deadline) {
                const lineDate = new Date(line.deadline);
                if (maxDeadline === null || lineDate > maxDeadline) {
                    maxDeadline = lineDate;
                }
            }
        });
    }

    if (maxDeadline) { // Gunakan maxDeadline, bukan deadline line pertama
        const deadline = maxDeadline; 
        const now = new Date();
        deadline.setHours(0, 0, 0, 0);
        now.setHours(0, 0, 0, 0);

        const diffTime = deadline.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 0) {
            timeleft = `${diffDays} hari lagi`;
        } else if (diffDays === 0) {
            timeleft = 'Hari ini';
        } else {
            timeleft = `Lewat ${Math.abs(diffDays)} hari`;
        }
    }
    // ▲▲▲ AKHIR FIX #3 ▲▲▲

    // [FIX #4] Logika Checklist (dari line pertama)
    let checklistsHTML = '';
    let completed = 0;
    let totalChecklists = 0;
    if (linePekerjaan && linePekerjaan.checklists && linePekerjaan.checklists.length > 0) {
        // Kita tidak perlu loop 'line', langsung loop 'checklists' dari 1 line itu
        checklistsHTML += `<strong class="d-block mt-2 mb-1">${lineName}</strong>`;
        linePekerjaan.checklists.forEach(check => {
            totalChecklists++;
            if (check.is_completed) completed++;
            checklistsHTML += `
                <div class="form-check">
                    <input class="form-check-input progress-check" type="checkbox" 
                           id="check-${newId}-${check.id}" 
                           data-id="${check.id}" 
                           ${check.is_completed ? 'checked' : ''}>
                    <label class="form-check-label" for="check-${newId}-${check.id}">
                        ${check.nama_checklist}
                    </label>
                </div>
            `;
        });
    }
    if (checklistsHTML === '') checklistsHTML = '<p class="text-muted small">Belum ada checklist.</p>';
    const percentage = (totalChecklists > 0) ? Math.round((completed / totalChecklists) * 100) : 0;

    const newRow = document.createElement('tr');
    
    // HTML untuk baris baru
    newRow.innerHTML = `
        <td>${task.no_invoice}</td>
        <td>${task.judul}</td>
        <td>${task.total_jumlah}</td>
        <td><button class="line-btn" style="background-color: #eee; color: #333;">${lineName}</button></td>
        <td>${task.urgensi}</td>
        <td>
            <div class="dropdown">
                <button class="status-btn status-${statusName.toLowerCase().replace(' ','-')} dropdown-toggle" 
                        type="button" id="statusDropdown${newId}" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="status-text">${statusName}</span> 
                </button>
                <div class="dropdown-menu" aria-labelledby="statusDropdown${newId}">
                     <a class="dropdown-item" href="#" data-status="Hold"><i class="bi bi-pause-circle"></i> Set to Hold</a>
                </div>
            </div>
        </td>
        <td>${timeleft}</td>
        <td class="icon-cell">
            <div class="mockup-wrapper">
                ${mockupsHTML}
                <img src="${firstMockup}" class="mockup-display">
                <i class="bi bi-stack gallery-indicator ${indicatorVisible}"></i>
            </div>
        </td>
        <td><div class="pic">${buatInisial(picName)}</div></td> 
        <td>
            <div class="dropdown">
                <button class="progress dropdown-toggle" type="button" 
                        id="progressDropdown${newId}" data-task-id="${task.id}" data-bs-toggle="dropdown" aria-expanded="false">
                    <span class="progress-text">${percentage}%</span>
                </button>
                <div class="dropdown-menu p-3" aria-labelledby="progressDropdown${newId}" style="width: 250px;">
                    <form class="progress-form">
                        ${checklistsHTML}
                    </form>
                </div>
            </div>
        </td>
        <td class="icon-cell">
            <i class="bi bi-pencil-square icon-edit"></i>
            <i class="bi bi-cloud-download-fill icon-download" data-id="${task.id}"></i> 
            <i class="bi bi-trash3-fill icon-trash" data-id="${task.id}"></i>
        </td>
    `;
    
    mainTableBody.prepend(newRow); // Tambahkan ke atas
    initGalleryIndicator(newRow); // Init galeri
    
    // Init warna progress bar
    const newProgressBar = newRow.querySelector('.dropdown-toggle.progress');
    if (newProgressBar) {
        const newPercentage = percentage;
        newProgressBar.classList.remove('status-red', 'status-yellow', 'status-green');
        if (newPercentage === 0) newProgressBar.classList.add('status-red');
        else if (newPercentage === 100) newProgressBar.classList.add('status-green');
        else newProgressBar.classList.add('status-yellow');
    }
  }

/**
 * Fungsi untuk menambah checklist di dalam line
 * (VERSI BARU dengan tombol Hapus "x" tanpa latar)
 */
 function addChecklist(button) {
    const checklistContainer = button.previousElementSibling; 
    if (!checklistContainer) return;
    
    // 1. Buat wrapper 'div'
    const checklistRow = document.createElement("div");
    // Gunakan 'align-items-center' agar 'x' rata tengah
    checklistRow.className = "d-flex gap-2 mb-2 align-items-center"; 

    // 2. Buat Input Teks
    const checklistInput = document.createElement("input");
    checklistInput.type = "text";
    checklistInput.className = "form-control checklist-item";
    checklistInput.placeholder = "Nama checklist...";
    
    // 3. Buat Tombol Hapus (sebagai <span>)
    const deleteBtn = document.createElement("span"); 
    deleteBtn.className = "btn-remove-checklist"; 
    
    // ▼▼▼ GANTI IKON MENJADI HURUF 'x' ▼▼▼
    deleteBtn.innerHTML = 'x'; 
    // ▲▲▲ ▲▲▲ ▲▲▲
    
    // 4. Masukkan input dan tombol ke wrapper
    checklistRow.appendChild(checklistInput);
    checklistRow.appendChild(deleteBtn);
    
    // 5. Masukkan wrapper ke container
    checklistContainer.appendChild(checklistRow);
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
    const dropdown = checkbox.closest('.dropdown-menu');
    if (!dropdown) return;
    
    // Temukan tombol progress untuk mengambil Task ID
    const progressButton = dropdown.closest('.dropdown').querySelector('.progress.dropdown-toggle');
    if (!progressButton) return;

    const taskId = progressButton.dataset.taskId;

    // --- 1. Hitung Persentase (Kode lama Anda) ---
    const allCheckboxes = dropdown.querySelectorAll('.progress-check');
    const completedTasks = dropdown.querySelectorAll('.progress-check:checked').length;
    const percentage = (allCheckboxes.length === 0) ? 0 : (completedTasks / allCheckboxes.length) * 100;

    const progressText = progressButton.querySelector('.progress-text');
    if (progressText) {
        progressText.textContent = percentage.toFixed(0) + '%';
    }
    // ... (Kode ganti warna progress bar tetap sama) ...

    // --- 2. LOGIKA BARU: Update Status Utama ---
    const statusButton = document.querySelector(`#statusDropdown${taskId}`);
    if (!statusButton) return; // Keluar jika tidak ada tombol status

    const currentStatus = statusButton.querySelector('.status-text').textContent.trim();

    // JANGAN ganggu jika statusnya "Hold"
    if (currentStatus === 'Hold') {
        return;
    }

    // Tentukan status baru berdasarkan persentase
    let newStatusName = '';
    if (percentage === 100) {
        newStatusName = 'Done and Ready';
    } else if (percentage > 0) {
        newStatusName = 'In Progress';
    } else {
        newStatusName = 'Needs Work';
    }

    // Hanya panggil update jika statusnya berubah
    if (newStatusName !== currentStatus) {
        updateTaskStatus(taskId, newStatusName);
    }
}

  /**
   * Mengganti teks dan warna status dropdown
   */
   function handleStatusChange(clickedItem) {
    const newStatusName = clickedItem.dataset.status; // Akan berisi "Hold" atau "Resume Progress"
    const dropdown = clickedItem.closest('.dropdown');
    if (!dropdown) return;
    
    // Ambil ID Task dari tombol status
    const statusButton = dropdown.querySelector('.dropdown-toggle');
    const taskId = statusButton.id.replace('statusDropdown', '');

    if (newStatusName === 'Hold') {
        // --- Aksi: SET TO HOLD ---
        // Cukup panggil fungsi update universal
        updateTaskStatus(taskId, 'Hold');
    
    } else if (newStatusName === 'Resume Progress') {
        // --- Aksi: CANCEL HOLD / RESUME ---
        
        // 1. Temukan baris (tr) dari task ini
        const row = statusButton.closest('tr');
        if (!row) return;

        // 2. Temukan tombol progress bar di baris yang sama
        const progressButton = row.querySelector('.progress.dropdown-toggle');
        if (!progressButton) return;
        
        // 3. Baca persentase saat ini
        const progressText = progressButton.querySelector('.progress-text').textContent;
        const percentage = parseInt(progressText, 10);

        // 4. Tentukan status otomatis yang baru
        let autoStatusName = 'Needs Work'; // Default jika 0%
        if (percentage === 100) {
            autoStatusName = 'Done and Ready';
        } else if (percentage > 0) {
            autoStatusName = 'In Progress';
        }
        
        // 5. Panggil fungsi update universal
        updateTaskStatus(taskId, autoStatusName);
    }
}

  /**
   * Membuka tab baru untuk print
   */
  function handlePrint(icon) {
    const row = icon.closest('tr');
    if (!row) return;
    const cells = row.querySelectorAll('td');
    
    // Ambil data dari sel. Hati-hati index bisa berubah
    const data = {
        noPo: cells[0]?.textContent.trim() || '',
        taskTitle: cells[1]?.textContent.trim() || '',
        jumlah: cells[2]?.textContent.trim() || '',
        // Ambil src dari gambar pertama di wrapper
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

  // Inisialisasi Modal Carousel
  modal = document.getElementById("imageCarouselModal");
  modalImg = document.getElementById("modalImage");
  modalPrevBtn = document.getElementById("modalPrevBtn");
  modalNextBtn = document.getElementById("modalNextBtn");
  
  if (modal) {
      document.getElementById("modalCloseBtn").addEventListener("click", () => {
          modal.style.display = "none";
      });
      modalPrevBtn.addEventListener("click", prevModalImage);
      modalNextBtn.addEventListener("click", nextModalImage);
  }

  // Tombol "Add Task" utama
  if (addBtn) addBtn.addEventListener("click", showPopup);

// Inisialisasi progress bar & galeri untuk baris yang sudah ada
document.querySelectorAll('.task table tbody tr').forEach(row => {
    const progressButton = row.querySelector('.dropdown-toggle.progress');
    if (progressButton) {
        // ▼▼▼ GANTI DENGAN LOGIKA BARU INI ▼▼▼
        const progressText = progressButton.querySelector('.progress-text');
        if (progressText) {
            
            // 1. Baca persentase yang sudah dicetak oleh Blade (cth: "50%")
            const percentage = parseInt(progressText.textContent, 10);

            // 2. Hapus kelas warna lama (jika ada)
            progressButton.classList.remove('status-red', 'status-yellow', 'status-green');

            // 3. Tambahkan kelas yang benar berdasarkan persentase
            if (percentage === 0) {
                progressButton.classList.add('status-red');
            } else if (percentage === 100) {
                progressButton.classList.add('status-green');
            } else {
                // Ini untuk 1% - 99%
                progressButton.classList.add('status-yellow');
            }
        }
        // ▲▲▲ AKHIR LOGIKA BARU ▲▲▲
    }
    // Init galeri (INI BENAR, JANGAN DIHAPUS)
    initGalleryIndicator(row);
});

// ▼▼▼ GANTI BLOK 'change' LAMA ANDA DENGAN INI ▼▼▼

  // Listener untuk PERUBAHAN (change) - Khusus Checkbox
  document.body.addEventListener('change', function(event) {
    if (event.target.classList.contains('progress-check')) {
        
        // JANGAN PANGGIL updateProgress() DI SINI

        // 1. Ambil data dari checkbox yang diklik
        const checklistId = event.target.dataset.id;
        const isChecked = event.target.checked;
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // 2. Kirim "Auto-Save" ke server
        fetch(`/checklist/update/${checklistId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                is_completed: isChecked 
            })
        })
        .then(response => {
            // Cek jika server error (404, 500, dll)
            if (!response.ok) {
                // Jika error, langsung lempar ke .catch
                return response.json().then(err => { throw new Error(err.message || 'Server error'); });
            }
            return response.json(); // Jika sukses
        })
        .then(result => {
            if (result.success) {
                // --- SUKSES DISIMPAN ---
                console.log(`Checklist ${checklistId} updated to ${isChecked}`);
                
                // 3. BARU PANGGIL 'updateProgress' SEKARANG
                //    Tampilan UI diubah HANYA setelah DB sukses
                updateProgress(event.target); 

            } else {
                // --- GAGAL DISIMPAN (Logika Server) ---
                alert('Gagal menyimpan checklist: ' + result.message);
                event.target.checked = !isChecked; // Kembalikan centang
            }
        })
        .catch(error => {
            // --- GAGAL KONEKSI ATAU SERVER ERROR (404, 500) ---
            console.error('Error:', error);
            alert('Gagal menyimpan checklist. Periksa koneksi atau log server.');
            event.target.checked = !isChecked; // Kembalikan centang
        });
    }
});


const searchInput = document.getElementById("taskSearchInput");
  
  // Pastikan 'mainTableBody' sudah didefinisikan di Bagian 1 file Anda
  if (searchInput && mainTableBody) {
      
      // 'input' akan berjalan setiap kali Anda mengetik, menghapus, atau paste
      searchInput.addEventListener("input", function() {
          
          // 1. Ambil kata kunci pencarian (dan ubah ke huruf kecil)
          const searchTerm = searchInput.value.toLowerCase();
          
          // 2. Ambil semua baris (tr) yang ada di dalam <tbody>
          const rows = mainTableBody.querySelectorAll("tr");

          // 3. Loop setiap baris
          rows.forEach(row => {
              // Ambil semua teks dari baris itu (dan ubah ke huruf kecil)
              const rowText = row.textContent.toLowerCase();
              
              // 4. Cek apakah teks baris mengandung kata kunci pencarian
              if (rowText.includes(searchTerm)) {
                  // Jika ya, tampilkan barisnya
                  row.style.display = ""; // Mengembalikan ke display default (table-row)
              } else {
                  // Jika tidak, sembunyikan barisnya
                  row.style.display = "none";
              }
          });
      });
  }

  

  // 3.Listener untuk KLIK (click) - GABUNGAN SEMUA DELEGASI
  document.body.addEventListener('click', function(event) {
      const target = event.target;
      
      // Jangan jalankan delegasi ini jika klik ada di dalam popup
      if (target.closest('.popup-overlay')) return; 

      // Buka Modal Galeri
      const wrapper = target.closest('.mockup-wrapper');
      if (wrapper) {
          event.preventDefault();
          openImageModal(wrapper);
          return; // Hentikan agar tidak menjalankan listener lain
      }

      // Ubah status (.dropdown-item[data-status])
      const statusItem = target.closest('.dropdown-item[data-status]');
      if (statusItem) {
          event.preventDefault();
          handleStatusChange(statusItem);
      }
      // Download PO (.icon-download)
      if (target.classList.contains('icon-download')) {
        event.preventDefault();
        handlePrint(target);
      }

  // 4. Hapus Task Utama (.icon-trash) - VERSI BARU DENGAN FETCH
  if (target.classList.contains('icon-trash')) {
    event.preventDefault();

    const row = target.closest('tr');
    const taskId = target.dataset.id; // Ambil ID dari data-id
    
    // Ambil judul task untuk konfirmasi (opsional tapi bagus)
    const taskName = row ? row.querySelector('td:nth-child(2)').textContent : 'task ini'; 
    
    if (!taskId) {
        alert('Error: Task ID tidak ditemukan.');
        return;
    }

    // Tampilkan pop-up konfirmasi
    if (confirm(`Apakah Anda yakin ingin menghapus task: "${taskName}"?`)) {
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        // Kirim request DELETE ke server
        fetch(`/task/delete/${taskId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            }
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                // 1. Hapus baris dari tampilan HANYA JIKA server sukses
                row.remove();
                // 2. Tampilkan notifikasi
                showNotif(result.message || 'Task berhasil dihapus.');
            } else {
                // Tampilkan error jika gagal
                alert('Gagal menghapus task: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan. Gagal menghapus task.');
        });
    }
}
  });

}); // <-- Penutup DOMContentLoaded