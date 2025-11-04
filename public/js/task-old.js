// GANTI SELURUH ISI FILE JS ANDA DENGAN INI

document.addEventListener("DOMContentLoaded", () => {

    // ==========================================================
    // === 1. PILIH ELEMEN UTAMA
    // ==========================================================
    const addBtn = document.getElementById("addBtn");
    const notif = document.getElementById("notif");
    const mainTableBody = document.querySelector(".task table tbody.table-bg");
    let clickedCell = null; 
    let currentGallerySources = [];
    let currentGalleryIndex = 0;
    let modal = null ;
    let modalImg = null;
    let modalPrevBtn = null;
    let modalNextBtn = null;
    let mockupFiles = new Map();
    let actionHistory = [];
  
    
  
    // ==========================================================
    // === 2. DEFINISI SEMUA FUNGSI
    // ==========================================================
  
   /**
   * Inisialisasi indikator galeri untuk satu baris
   * @param {HTMLElement} rowElement - Elemen <tr> atau <td> yang berisi .mockup-wrapper
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
   * @param {HTMLElement} wrapper - Elemen .mockup-wrapper yang diklik
   */
  function openImageModal(wrapper) {
      const images = wrapper.querySelectorAll('.mockup-image-data');
      currentGallerySources = Array.from(images).map(img => img.src); // Ambil semua URL
      currentGalleryIndex = 0; // Mulai dari gambar pertama
  
      if (currentGallerySources.length === 0) return; // Jangan buka jika tidak ada gambar
  
      modal.style.display = "flex"; // Tampilkan modal
      showModalImage(currentGalleryIndex); // Tampilkan gambar pertama
  }
  
  /**
   * Menampilkan gambar di modal berdasarkan index
   * @param {number} index - Index gambar di array currentGallerySources
   */
  function showModalImage(index) {
      if (index < 0 || index >= currentGallerySources.length) return;
      
      currentGalleryIndex = index;
      modalImg.src = currentGallerySources[index]; // Ganti sumber gambar
  
      // Atur status tombol Prev/Next
      modalPrevBtn.disabled = (index === 0);
      modalNextBtn.disabled = (index === currentGallerySources.length - 1);
  }
  
  function nextModalImage() {
      showModalImage(currentGalleryIndex + 1);
  }
  
  function prevModalImage() {
      showModalImage(currentGalleryIndex - 1);
  }
  // === 3. EVENT LISTENERS (Inisialisasi) ===
  
    // Inisialisasi modal
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
  
  
    // Inisialisasi indikator untuk baris yang sudah ada
    document.querySelectorAll('.task table tbody tr').forEach(row => {
        initGalleryIndicator(row);
    });
    
  
  //   End logic carousel pop up
  
    /** MENAMBAH KOLOM BARU SECARA HORIZONTAL*/
  
   function insertSizeColumn(table, index) {
    const tHeadRow = table.querySelector("thead tr");
    const tBody = table.querySelector("tbody");
  
    // 1. Tambah header (TH) baru
    const newTh = document.createElement('th');
    newTh.innerHTML = '<input type="text" class="form-control" placeholder="Size Baru">';
    tHeadRow.insertBefore(newTh, tHeadRow.children[index]);
  
    // 2. Tambah sel (TD) baru di setiap baris body
    tBody.querySelectorAll('tr').forEach(row => {
        // Logika 'actions-row' sudah tidak ada, jadi lebih simpel
        const newTd = document.createElement('td');
        newTd.innerHTML = '<input type="text" class="form-control" placeholder="Jumlah">';
        row.insertBefore(newTd, row.children[index]);
    });
  }
  
  
    /**
     * MENGHAPUS KOLOM SECARA HORIZONTAL
     */
    function deleteSizeColumn(table, index) {
        const tHeadRow = table.querySelector("thead tr");
        const tBody = table.querySelector("tbody");
  
        if (index === 0) {
            alert("Tidak bisa menghapus kolom 'Jenis'.");
            return;
        }
        
        tHeadRow.children[index].remove();
  
        tBody.querySelectorAll('tr').forEach(row => {
            if (row.classList.contains('actions-row')) {
                const actionCell = row.querySelector('td[colspan]');
                if (actionCell) {
                    actionCell.colSpan = tHeadRow.children.length - 1;
                }
            } else {
                row.children[index].remove();
            }
        });
    }
  
    /**
     * MENAMBAH BARIS BARU SECARA VERTIKAL
     */
    /**
   * MENAMBAH BARIS BARU SECARA VERTIKAL
   */
  function insertJenisRow(table, referenceRow) {
      const tBody = table.querySelector("tbody");
      const columnCount = table.querySelector("thead tr").children.length;
      
      const newRow = document.createElement('tr');
      let rowHTML = '';
  
      // 1. Tambah sel "Jenis"
      rowHTML += '<td><input type="text" class="form-control" placeholder="Jenis"></td>';
  
      // 2. Tambah sel "Jumlah" sebanyak sisa kolom
      //    Loop-nya sekarang sederhana: dari 1 sampai akhir
      for (let i = 1; i < columnCount; i++) {
          rowHTML += '<td><input type="text" class="form-control" placeholder="Jumlah"></td>';
      }
      
      newRow.innerHTML = rowHTML;
  
      // 3. Masukkan baris baru di bawah baris yang diklik
      //    Logika 'actions-row' sudah tidak ada
      tBody.insertBefore(newRow, referenceRow.nextElementSibling);
  }
  
    /**
     * MENGHAPUS BARIS
     */
    function deleteJenisRow(table, row) {
        const normalRows = table.querySelectorAll("tbody tr:not(.actions-row)");
        if (normalRows.length <= 1) {
            alert("Tidak bisa menghapus baris terakhir.");
            return;
        }
        row.remove();
    }
  
    // ▼▼▼ TOTALFUNGSI T ▼▼▼
  
  /**
   * Menghitung ulang SEMUA total (per baris, per kolom, dan grand total).
   */
  function calculateTotals() {
      const sizeTable = document.querySelector("#sizeTable");
      if (!sizeTable) return;
      const tBody = sizeTable.querySelector("tbody");
      const tFootRow = sizeTable.querySelector("tfoot tr");
      const headerCells = sizeTable.querySelectorAll("thead tr th");
      if (!tBody || !tFootRow || headerCells.length < 3) return; // Min: Size, Qty1, Jumlah
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
  function insertTypeColumn(table, index) { // Ganti nama agar lebih jelas
      const tHeadRow = table.querySelector("thead tr");
      const tBody = table.querySelector("tbody");
      const tFootRow = table.querySelector("tfoot tr");
      if (!tHeadRow || !tBody || !tFootRow) return;
  
      // Index sisip (tidak bisa di index 0 atau terakhir)
      if (index === 0) index = 1; // Paksa sisip setelah 'Size'
      const targetIndex = Math.min(index, tHeadRow.children.length - 1); // Batasi di sebelum 'Jumlah'
  
      // Catat Aksi
      actionHistory.push({ type: 'add-column', columnIndex: targetIndex, table: table });
  
      // Tambah header (TH) baru
      const newTh = document.createElement('th');
      newTh.innerHTML = '<input type="text" class="form-control" placeholder="Tipe Baru">';
      tHeadRow.insertBefore(newTh, tHeadRow.children[targetIndex]);
  
      // Tambah sel input (TD) baru di setiap baris body
      tBody.querySelectorAll('tr').forEach(row => {
          const newTd = document.createElement('td');
          newTd.innerHTML = '<input type="text" class="form-control quantity-input" placeholder="0">';
          row.insertBefore(newTd, row.children[targetIndex]);
      });
  
      // Tambah Sel Total Kolom (TD) baru di footer
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
  
      // Catat Aksi
      if (!isUndo) {
          const columnData = Array.from(tBody.querySelectorAll('tr')).map(r => r.children[index].innerHTML);
          const footerData = tFootRow.children[index] ? tFootRow.children[index].innerHTML : '';
          actionHistory.push({
              type: 'delete-column',
              columnIndex: index,
              headerHTML: tHeadRow.children[index].innerHTML,
              cellsHTML: columnData,
              footerHTML: footerData,
              table: table
          });
      }
      
      // Hapus header, sel body, dan sel footer
      tHeadRow.children[index].remove();
      tBody.querySelectorAll('tr').forEach(row => { row.children[index].remove(); });
      if(tFootRow.children[index]) tFootRow.children[index].remove();
  
      calculateTotals();
  }
  
  /**
   * MENAMBAH BARIS UKURAN BARU (e.g., S, M, L) SECARA VERTIKAL
   */
  function insertSizeRow(table, referenceRow) { // Ganti nama
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
  
      // Catat Aksi
      actionHistory.push({ type: 'add-row', addedRow: newRow, table: table, referenceRow: referenceRow });
  
      // Masukkan baris baru
      tBody.insertBefore(newRow, referenceRow ? referenceRow.nextElementSibling : tBody.firstChild);
      calculateTotals();
  }
  
  /**
   * MENGHAPUS BARIS UKURAN (e.g., S, M, L) SECARA VERTIKAL (dengan isUndo)
   */
  function deleteSizeRow(table, row, isUndo = false) { // Ganti nama
      const normalRows = table.querySelectorAll("tbody tr");
      if (normalRows.length <= 1) {
          alert("Tidak bisa menghapus baris ukuran terakhir.");
          return;
      }
      
      // Catat Aksi
      if (!isUndo) {
          actionHistory.push({
              type: 'delete-row',
              deletedRowHTML: row.innerHTML,
              originalIndex: Array.from(row.parentNode.children).indexOf(row),
              table: table
          });
      }
      row.remove();
      calculateTotals();
  }
  
  // ▲▲▲ AKHIR FUNGSI CALCULATE TOTAL ▲▲▲
  // ▼▼▼ GANTI FUNGSI UNDO LAMA DENGAN INI ▼▼▼
  
  /**
   * Membatalkan aksi terakhir yang tercatat di history (Versi Baru).
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
              // Panggil deleteSizeRow (versi baru), tandai sebagai undo
              deleteSizeRow(lastAction.table, lastAction.addedRow, true); 
              break;
          case 'delete-row':
              // Buat ulang baris dan sisipkan kembali
              const tBodyUndo = lastAction.table.querySelector("tbody");
              if (tBodyUndo) {
                  const newRowUndo = document.createElement('tr');
                  newRowUndo.innerHTML = lastAction.deletedRowHTML;
                  tBodyUndo.insertBefore(newRowUndo, tBodyUndo.children[lastAction.originalIndex]);
                  calculateTotals(); // Hitung ulang setelah undo
              }
              break;
          case 'add-column':
              // Panggil deleteTypeColumn (versi baru), tandai sebagai undo
              deleteTypeColumn(lastAction.table, lastAction.columnIndex, true); 
              break;
          case 'delete-column':
              // Buat ulang header, sel body, dan sel footer
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
                  calculateTotals(); // Hitung ulang setelah undo
              }
              break;
          case 'edit-header':
              if (lastAction.thElement) {
                  lastAction.thElement.textContent = lastAction.oldText;
              }
              break;
      }
  }
  // ▲▲▲ AKHIR PENGGANTIAN UNDO ▲▲▲
  
  // MOCKUP 
  function updateMockupPreview() {
      const previewArea = document.querySelector(".popup #mockup-preview-area");
      if (!previewArea) return;
  
      previewArea.innerHTML = ''; // Kosongkan preview lama
  
      if (mockupFiles.size > 0) {
          let fileListHTML = '<strong>File yang dipilih:</strong><ul class="list-unstyled mb-0">';
          
          // Loop dari Map
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
  // ============================================
  // FUNGSI UNTUK MENGAMBIL DATA LINE PEKERJAAN
  // ============================================
  function getLineData(popup) {
      const lineData = [];
      const lineContainer = popup.querySelector("#lineContainer");
      
      if (!lineContainer) {
          console.warn("Line container tidak ditemukan");
          return lineData;
      }
      
      // Ambil semua line yang ada (div dengan class border p-3 mb-3 rounded)
      const lineItems = lineContainer.querySelectorAll(".border.p-3.mb-3.rounded");
      
      if (lineItems.length === 0) {
          console.log("Tidak ada line pekerjaan yang ditambahkan");
          return lineData;
      }
      
      lineItems.forEach((item, index) => {
          // Ambil nama pekerjaan
          const namaInput = item.querySelector(".line-nama");
          
          // Ambil deadline
          const deadlineInput = item.querySelector(".line-deadline");
          
          const lineObj = {
              nama: namaInput ? namaInput.value.trim() : '',
              deadline: deadlineInput ? deadlineInput.value : '',
              checklists: []
          };
          
          // Ambil semua checklist dalam line ini
          const checklistInputs = item.querySelectorAll(".checklist-item");
          checklistInputs.forEach(input => {
              const checklistName = input.value.trim();
              if (checklistName) {
                  lineObj.checklists.push(checklistName);
              }
          });
          
          // Hanya tambahkan jika ada nama pekerjaan
          if (lineObj.nama) {
              lineData.push(lineObj);
          } else {
              console.warn(`Line ${index + 1}: Nama pekerjaan kosong, dilewati`);
          }
      });
      
      console.log("✅ Line Data yang dikumpulkan:", lineData);
      return lineData;
  }
  
  // ============================================
  // FUNGSI UNTUK MENGAMBIL DATA SIZE TABLE
  // ============================================
  function getSizeTableData(popup) {
      const sizeTable = popup.querySelector("#sizeTable");
      
      if (!sizeTable) {
          console.warn("Size table tidak ditemukan");
          return { headers: [], rows: [] };
      }
      
      const sizeData = {
          headers: [],
          rows: []
      };
      
      // 1. Ambil headers (Size S, Size M, dll)
      // SKIP kolom pertama (Jenis) dan kolom terakhir (Jumlah)
      const headerRow = sizeTable.querySelector("thead tr");
      if (headerRow) {
          const headerCells = headerRow.querySelectorAll("th");
          headerCells.forEach((th, index) => {
              // Skip kolom pertama ("Jenis") dan kolom terakhir ("Jumlah")
              if (index > 0 && index < headerCells.length - 1) {
                  const headerText = th.textContent.trim();
                  // Jika header adalah input, ambil valuenya
                  const headerInput = th.querySelector("input");
                  const finalHeaderText = headerInput ? headerInput.value.trim() : headerText;
                  
                  if (finalHeaderText) {
                      sizeData.headers.push(finalHeaderText);
                  }
              }
          });
      }
      
      console.log("📋 Headers yang ditemukan:", sizeData.headers);
      
      // 2. Ambil data rows dari tbody
      const bodyRows = sizeTable.querySelectorAll("tbody tr");
      
      bodyRows.forEach((tr, rowIndex) => {
          // Ambil jenis dari kolom pertama
          const jenisCell = tr.querySelector("td:first-child");
          const jenisInput = jenisCell ? jenisCell.querySelector("input") : null;
          const jenis = jenisInput ? jenisInput.value.trim() : jenisCell?.textContent.trim() || '';
          
          if (!jenis) {
              console.warn(`⚠️ Baris ${rowIndex + 1}: Jenis kosong, dilewati`);
              return; // Skip jika tidak ada jenis
          }
          
          const rowData = {
              jenis: jenis,
              quantities: {}
          };
          
          // Ambil semua cell (td) dalam row ini
          const allCells = tr.querySelectorAll("td");
          
          // Loop melalui cell (skip kolom pertama dan terakhir)
          allCells.forEach((td, cellIndex) => {
              // Skip kolom pertama (Jenis) dan terakhir (Total)
              if (cellIndex > 0 && cellIndex < allCells.length - 1) {
                  // Cari input di dalam cell
                  const input = td.querySelector("input");
                  
                  if (input && sizeData.headers[cellIndex - 1]) {
                      const headerName = sizeData.headers[cellIndex - 1];
                      const quantity = parseInt(input.value) || 0;
                      rowData.quantities[headerName] = quantity;
                  }
              }
          });
          
          // Hanya tambahkan jika ada quantity > 0 ATAU tetap simpan semua baris
          // (Tergantung kebutuhan, saya pilih simpan semua)
          const hasQuantity = Object.values(rowData.quantities).some(q => q > 0);
          if (hasQuantity || Object.keys(rowData.quantities).length > 0) {
              sizeData.rows.push(rowData);
          } else {
              console.log(`ℹ️ Baris ${jenis}: Semua quantity 0 atau kosong, tetap disimpan`);
          }
      });
      
      console.log("✅ Size Data yang dikumpulkan:", sizeData);
      return sizeData;
  }// ============================================
  // FUNGSI UNTUK MENGAMBIL DATA LINE PEKERJAAN
  // ============================================
  function getLineData(popup) {
      const lineData = [];
      const lineContainer = popup.querySelector("#lineContainer");
      
      if (!lineContainer) {
          console.warn("Line container tidak ditemukan");
          return lineData;
      }
      
      // Ambil semua line yang ada (div dengan class border p-3 mb-3 rounded)
      const lineItems = lineContainer.querySelectorAll(".border.p-3.mb-3.rounded");
      
      if (lineItems.length === 0) {
          console.log("Tidak ada line pekerjaan yang ditambahkan");
          return lineData;
      }
      
      lineItems.forEach((item, index) => {
          // Ambil nama pekerjaan
          const namaInput = item.querySelector(".line-nama");
          
          // Ambil deadline
          const deadlineInput = item.querySelector(".line-deadline");
          
          const lineObj = {
              nama: namaInput ? namaInput.value.trim() : '',
              deadline: deadlineInput ? deadlineInput.value : '',
              checklists: []
          };
          
          // Ambil semua checklist dalam line ini
          const checklistInputs = item.querySelectorAll(".checklist-item");
          checklistInputs.forEach(input => {
              const checklistName = input.value.trim();
              if (checklistName) {
                  lineObj.checklists.push(checklistName);
              }
          });
          
          // Hanya tambahkan jika ada nama pekerjaan
          if (lineObj.nama) {
              lineData.push(lineObj);
          } else {
              console.warn(`Line ${index + 1}: Nama pekerjaan kosong, dilewati`);
          }
      });
      
      console.log("✅ Line Data yang dikumpulkan:", lineData);
      return lineData;
  }
  
  // ============================================
  // FUNGSI UNTUK MENGAMBIL DATA SIZE TABLE
  // ============================================
  function getSizeTableData(popup) {
      const sizeTable = popup.querySelector("#sizeTable");
      
      if (!sizeTable) {
          console.warn("Size table tidak ditemukan");
          return { headers: [], rows: [] };
      }
      
      const sizeData = {
          headers: [],
          rows: []
      };
      
      // 1. Ambil headers (Size S, Size M, dll)
      // SKIP kolom pertama (Jenis) dan kolom terakhir (Jumlah)
      const headerRow = sizeTable.querySelector("thead tr");
      if (headerRow) {
          const headerCells = headerRow.querySelectorAll("th");
          headerCells.forEach((th, index) => {
              // Skip kolom pertama ("Jenis") dan kolom terakhir ("Jumlah")
              if (index > 0 && index < headerCells.length - 1) {
                  const headerText = th.textContent.trim();
                  // Jika header adalah input, ambil valuenya
                  const headerInput = th.querySelector("input");
                  const finalHeaderText = headerInput ? headerInput.value.trim() : headerText;
                  
                  if (finalHeaderText) {
                      sizeData.headers.push(finalHeaderText);
                  }
              }
          });
      }
      
      console.log("📋 Headers yang ditemukan:", sizeData.headers);
      
      // 2. Ambil data rows dari tbody
      const bodyRows = sizeTable.querySelectorAll("tbody tr");
      
      bodyRows.forEach((tr, rowIndex) => {
          // Ambil jenis dari kolom pertama
          const jenisCell = tr.querySelector("td:first-child");
          const jenisInput = jenisCell ? jenisCell.querySelector("input") : null;
          const jenis = jenisInput ? jenisInput.value.trim() : jenisCell?.textContent.trim() || '';
          
          if (!jenis) {
              console.warn(`⚠️ Baris ${rowIndex + 1}: Jenis kosong, dilewati`);
              return; // Skip jika tidak ada jenis
          }
          
          const rowData = {
              jenis: jenis,
              quantities: {}
          };
          
          // Ambil semua cell (td) dalam row ini
          const allCells = tr.querySelectorAll("td");
          
          // Loop melalui cell (skip kolom pertama dan terakhir)
          allCells.forEach((td, cellIndex) => {
              // Skip kolom pertama (Jenis) dan terakhir (Total)
              if (cellIndex > 0 && cellIndex < allCells.length - 1) {
                  // Cari input di dalam cell
                  const input = td.querySelector("input");
                  
                  if (input && sizeData.headers[cellIndex - 1]) {
                      const headerName = sizeData.headers[cellIndex - 1];
                      const quantity = parseInt(input.value) || 0;
                      rowData.quantities[headerName] = quantity;
                  }
              }
          });
          
          // Hanya tambahkan jika ada quantity > 0 ATAU tetap simpan semua baris
          // (Tergantung kebutuhan, saya pilih simpan semua)
          const hasQuantity = Object.values(rowData.quantities).some(q => q > 0);
          if (hasQuantity || Object.keys(rowData.quantities).length > 0) {
              sizeData.rows.push(rowData);
          } else {
              console.log(`ℹ️ Baris ${jenis}: Semua quantity 0 atau kosong, tetap disimpan`);
          }
      });
      
      console.log("✅ Size Data yang dikumpulkan:", sizeData);
      return sizeData;
  }
  
  // FUNGSI POP UP
   function showPopup() {
      const overlay = document.querySelector(".popup-overlay");
      if (!overlay) return;
      const popup = overlay.querySelector(".popup");
      if (!popup) return;
  
      // --- PEMBERSIHAN & PEMASANGAN LISTENER ---
      // Cara aman: clone & replace elemen inti popup untuk hapus listener lama
      const newPopup = popup.cloneNode(true);
      overlay.replaceChild(newPopup, popup);
      
      // Ambil referensi elemen dari 'newPopup' yang bersih
      const addLineBtn = newPopup.querySelector("#addLine");
      const cancelBtn = newPopup.querySelector("#cancelBtn");
      const taskForm = newPopup.querySelector("#taskForm");
      const addSizeRowBtn = newPopup.querySelector("#addSizeRow"); // Tombol baru
      const sizeTable = newPopup.querySelector("#sizeTable");
      const contextMenu = newPopup.querySelector("#customContextMenu");
      const sizeTableHead = newPopup.querySelector('#sizeTable thead');
      const sizeTableBody = newPopup.querySelector("#sizeTable tbody");
  
      // Listener untuk input file mockup
      const mockupInput = newPopup.querySelector("#mockups");
      if (mockupInput) {
          mockupInput.addEventListener('change', () => {
              if (mockupInput.files.length > 0) {
                  // Salin file baru ke Map (mencegah duplikat)
                  for (const file of mockupInput.files) {
                      mockupFiles.set(file.name, file);
                  }
                  // Update tampilan
                  updateMockupPreview();
                  // Kosongkan input agar bisa pilih file yang sama lagi
                  mockupInput.value = ''; 
              }
          });
      }
  
      // Listener tombol Add Line
      if (addLineBtn) {
          addLineBtn.addEventListener("click", (e) => { e.preventDefault(); addLine(); });
      } else { console.error("Tombol #addLine tidak ditemukan!"); }
  
      // Listener tombol Cancel
      if (cancelBtn) {
          cancelBtn.addEventListener("click", () => { overlay.style.display = "none"; actionHistory = []; });
      }
  
      // Listener Tombol Tambah Ukuran (Baris)
      if (addSizeRowBtn) {
           addSizeRowBtn.addEventListener("click", (e) => {
               e.preventDefault();
               // Cari baris terakhir di tbody sebagai referensi
               const lastRow = newPopup.querySelector("#sizeTable tbody tr:last-child");
               // Panggil fungsi BARU untuk baris size
               insertSizeRow(sizeTable, lastRow); 
           });
      }
  
      // Listener SUBMIT FORM
      if (taskForm) {
          taskForm.addEventListener("submit", async (e) => {
              e.preventDefault();
              console.log("Form submit terdeteksi!");
              
              try {
                  // 1. Validasi CSRF Token
                  const csrfToken = document.querySelector('meta[name="csrf-token"]');
                  if (!csrfToken) {
                      throw new Error("CSRF token tidak ditemukan. Silakan refresh halaman.");
                  }
                  
                  // 2. Buat FormData
                  const formData = new FormData();
                  
                  // 3. Ambil data
                  const loggedInUserName = document.querySelector('.page')?.dataset.userName || 'Unknown';
                  const grandTotalValue = newPopup.querySelector("#sizeTable tfoot .grand-total")?.textContent || '0';
                  
                  // 4. Validasi element penting
                  const noInvoice = newPopup.querySelector("#noInvoice");
                  if (!noInvoice) {
                      throw new Error("Element #noInvoice tidak ditemukan!");
                  }
                  
                  // 5. Append data
                  formData.append('noInvoice', noInvoice.value || '');
                  formData.append('namaPelanggan', newPopup.querySelector("#namaPelanggan")?.value || '');
                  formData.append('judul', newPopup.querySelector("#judul")?.value || '');
                  formData.append('catatan', newPopup.querySelector("#catatan")?.value || '');
                  formData.append('penanggungJawab', loggedInUserName);
                  formData.append('urgensi', newPopup.querySelector("#urgensi")?.value || '');
                  formData.append('jumlah', grandTotalValue);
                  formData.append('warna', newPopup.querySelector("#warna")?.value || '');
                  formData.append('model', newPopup.querySelector("#model")?.value || '');
                  formData.append('bahan', newPopup.querySelector("#bahan")?.value || '');
                  
                  // 6. JSON data
                  const lineData = getLineData(newPopup);
                  const sizeData = getSizeTableData(newPopup);
                  formData.append('lines', JSON.stringify(lineData));
                  formData.append('sizes', JSON.stringify(sizeData));
                  
                  // 7. Files
                  if (mockupFiles.size > 0) {
                      mockupFiles.forEach(file => {
                          formData.append('mockups[]', file, file.name);
                      });
                  }
                  
                  console.log("Data yang akan dikirim:");
                  for (let [key, value] of formData.entries()) {
                      console.log(key, ":", value);
                  }
                  
                  // 8. Disable tombol submit untuk mencegah double-click
                  const submitBtn = taskForm.querySelector('button[type="submit"]');
                  if (submitBtn) {
                      submitBtn.disabled = true;
                      submitBtn.textContent = 'Menyimpan...';
                  }
                  
                  // 9. Kirim ke server
                  const response = await fetch('/task/store', {
                      method: 'POST',
                      headers: {
                          'X-CSRF-TOKEN': csrfToken.getAttribute('content'),
                          'Accept': 'application/json'
                      },
                      body: formData
                  });
                  
                  console.log("Response status:", response.status);
                  
                  if (!response.ok) {
                      const errorText = await response.text();
                      console.error("Response error:", errorText);
                      throw new Error(`HTTP error! status: ${response.status}`);
                  }
                  
                  const result = await response.json();
                  console.log("Server merespons:", result);
                  
                  if (!result.success) {
                      throw new Error(result.message || 'Error server tidak diketahui');
                  }
                  
                  // 10. Update UI
                  addTaskToTable(result.task);
                  showNotif(result.message || "Task berhasil disimpan!");
                  overlay.style.display = "none";
                  
                  // Reset form (opsional)
                  taskForm.reset();
                  mockupFiles.clear();
                  
              } catch (error) {
                  console.error('Error saat submit:', error);
                  alert(`Gagal menyimpan task: ${error.message}`);
              } finally {
                  // Re-enable tombol submit
                  const submitBtn = taskForm.querySelector('button[type="submit"]');
                  if (submitBtn) {
                      submitBtn.disabled = false;
                      submitBtn.textContent = 'Submit'; // Atau text aslinya
                  }
              }
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
              
              // Panggil fungsi BARU yang sudah diadaptasi
              switch (action) {
                  case 'insert-row-after': insertSizeRow(table, parentRow); break;
                  case 'delete-row': deleteSizeRow(table, parentRow); break;
                  case 'insert-col-left': insertTypeColumn(table, cellIndex); break;
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
      // LISTENER TOMBOL (X)
      const previewArea = newPopup.querySelector("#mockup-preview-area");
      if (previewArea) {
          previewArea.addEventListener('click', (event) => {
              if (event.target.classList.contains('remove-mockup-btn')) {
                  const fileName = event.target.dataset.key;
                  mockupFiles.delete(fileName); // Hapus file dari Map
                  updateMockupPreview(); // Update tampilan
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
            <div class="col-md-6">
              <label>Nama Pekerjaan</label>
              <input type="text" class="form-control line-nama" placeholder="Nama pekerjaan...">
            </div>
            <div class="col-md-6">
              <label>Deadline</label>
              <input type="datetime-local" class="form-control line-deadline">
            </div>
          </div>
          <div class="mb-2">
            <label>Checklist</label>
            <div class="checklist-container"></div>
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
          <td>-</td> 
          <td class="icon-cell">
              <div class="mockup-wrapper">
                  ${data.mockup_images_html || '<img src="assets/img/default.png" class="mockup-image-data">'}
                  <img src="${data.mockup_images_first || 'assets/img/default.png'}" class="mockup-display">
                  <i class="bi bi-stack gallery-indicator"></i>
              </div>
          </td>
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
      initGalleryIndicator(newRow);
  
      // Inisialisasi ulang progress bar untuk baris yang baru ditambahkan
      const newProgressBar = newRow.querySelector('.dropdown-toggle.progress');
      const newMenu = newProgressBar.nextElementSibling;
      if (newMenu) {
          const firstCheck = newMenu.querySelector('.progress-check');
          if (firstCheck) {
              updateProgress(firstCheck);
          }
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
  
    // CATATAN: addRow() yang lama sudah dihapus dan diganti dengan
    // insertJenisRow() dan insertSizeColumn()
  
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
   * Mengubah header TH menjadi input saat di-double-click
   * (VERSI BARU: Semua kolom bisa diedit).
   */
  function handleHeaderDoubleClick(thElement) {
    // Jangan lakukan apa-apa jika sudah dalam mode edit
    const thIndex = thElement.cellIndex;
      const totalTh = thElement.closest('tr').children.length;
      if (thIndex === 0 || thIndex === totalTh - 1) {
          return; // Keluar, jangan edit
      }
    if (thElement.querySelector('input.header-edit-input')) return;
  
  
  
    const currentText = thElement.textContent.trim();
    thElement.dataset.originalText = currentText; // Simpan teks asli
  
    // Ganti isi TH dengan input
    thElement.innerHTML = `<input type="text" class="form-control header-edit-input" value="${currentText}">`;
  
    const inputElement = thElement.querySelector('input.header-edit-input');
    if (!inputElement) return; // Pengaman
  
    inputElement.focus();
    inputElement.select(); // Pilih semua teks
  
    // Fungsi untuk menyelesaikan edit (didefinisikan di dalam agar punya akses ke variabel)
    const finishHeaderEdit = () => {
        const newValue = inputElement.value.trim();
        // Kembalikan teks asli jika input kosong
        const finalValue = newValue || thElement.dataset.originalText;
  
        // Catat aksi jika nilai berubah (fungsi Undo)
        // Pastikan actionHistory didefinisikan secara global
        if (finalValue !== thElement.dataset.originalText && typeof actionHistory !== 'undefined') {
            actionHistory.push({
                type: 'edit-header',
                thElement: thElement, // Simpan referensi ke elemen TH
                oldText: thElement.dataset.originalText, // Teks sebelum diedit
                newText: finalValue // Teks setelah diedit
            });
        }
  
        thElement.textContent = finalValue; // Ganti input kembali menjadi teks
        // Hapus listener agar tidak menumpuk saat double-click lagi
        inputElement.removeEventListener('blur', finishHeaderEdit);
        inputElement.removeEventListener('keydown', handleKeyDown);
    };
  
    // Fungsi untuk menghandle tombol Enter atau Escape di input
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            finishHeaderEdit(); // Selesaikan edit jika Enter
        } else if (event.key === 'Escape') {
            thElement.textContent = thElement.dataset.originalText; // Batalkan, kembalikan teks asli
            // Hapus listener
            inputElement.removeEventListener('blur', finishHeaderEdit);
            inputElement.removeEventListener('keydown', handleKeyDown);
        }
    };
  
    // Tambahkan listener ke input yang baru dibuat
    inputElement.addEventListener('blur', finishHeaderEdit); // Selesaikan saat klik di luar
    inputElement.addEventListener('keydown', handleKeyDown); // Selesaikan/Batalkan dengan keyboard
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
        if (progressText) {
            progressText.textContent = percentage.toFixed(0) + '%';
        }
  
        const progressButton = dropdown.querySelector('.dropdown-toggle');
        if (!progressButton) return;
  
        progressButton.classList.remove('status-red', 'status-yellow', 'status-green');
  
        if (percentage === 0) {
            progressButton.classList.add('status-red');
        } else if (percentage === 100) {
            progressButton.classList.add('status-green');
        } else {
            progressButton.classList.add('status-yellow');
        }
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
  
        if (statusTextSpan) {
            statusTextSpan.textContent = newStatus;
        }
  
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
  
      if (words.length > 1) {
          initials += words[1].substring(0, 1);
      }
  
      return initials.toUpperCase();
    }
  
  
    // ==========================================================
    // === 3. EVENT LISTENERS (Inisialisasi)
    // ==========================================================
  
    // Tombol "Add Task" utama
    if (addBtn) {
        addBtn.addEventListener("click", showPopup);
    }
  
    // Inisialisasi warna progress bar saat halaman dimuat
    document.querySelectorAll('.dropdown-toggle.progress').forEach(progressButton => {
        const dropdownMenu = progressButton.nextElementSibling;
        if (dropdownMenu) {
            const firstCheck = dropdownMenu.querySelector('.progress-check');
            if (firstCheck) {
                updateProgress(firstCheck);
            }
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
  
      //   // 1. Hapus baris tabel (.btn-remove ATAU .btn-remove-row)
      //   if (target.classList.contains('btn-remove') || target.classList.contains('btn-remove-row')) {
      //     event.preventDefault();
      //     const row = target.closest('tr');
      //     if (row) {
      //         // Periksa apakah ini tabel size atau tabel line
      //         const sizeTable = row.closest('#sizeTable');
      //         if (sizeTable) {
      //             deleteJenisRow(sizeTable, row);
      //         } else {
      //             // Logika hapus baris tabel utama (jika ada)
      //             row.remove();
      //         }
      //     }
      //   }
  
      //   // 2. Hapus line pekerjaan (.btn-remove-line di dalam popup)
      //   if (target.classList.contains('btn-remove-line')) {
      //       event.preventDefault();
      //       target.closest('.border.p-3.mb-3.rounded')?.remove();
      //   }
  
        // 3. Tambah checklist (.addChecklist di dalam popup)
        if (target.classList.contains('addChecklist')) {
            event.preventDefault();
            addChecklist(target);
        }
  
        // 4. Ubah status (.dropdown-item dengan data-status)
        const statusItem = target.closest('.dropdown-item[data-status]');
        if (statusItem) {
            event.preventDefault();
            handleStatusChange(statusItem);
        }
  
        // 5. Download PO (.icon-download)
        if (target.classList.contains('icon-download')) {
          event.preventDefault();
          handlePrint(target); 
        }
        // 6. Buka Modal Galeri
        const wrapper = target.closest('.mockup-wrapper');
        if (wrapper) {
            event.preventDefault();
            openImageModal(wrapper);
            return; // Hentikan agar tidak menjalankan listener lain
        }
    });
  
  }); // <-- Penutup DOMContentLoaded