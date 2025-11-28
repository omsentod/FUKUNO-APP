
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
   /**
 * Menampilkan daftar file dari Map global di area preview.
 * (VERSI BARU - Memeriksa properti file, bukan parameter)
 */
    function updateMockupPreview() {
        const previewArea = document.querySelector(".popup #mockup-preview-area");
        if (!previewArea) return;
    
        previewArea.innerHTML = ''; 
    
        if (mockupFiles.size > 0) {
            let fileListHTML = '<strong>File yang dipilih:</strong><ul class="list-unstyled mb-0">';
            
            mockupFiles.forEach((file, name) => {
                fileListHTML += `<li class="text-muted">`;
                
                if (file.is_existing) { 
                    // Skenario 1: File Lama (Tampilkan thumbnail)
                    fileListHTML += `
                        <a href="${file.path}" target="_blank" class="mockup-preview-item">
                            <img src="${file.path}" class="mockup-thumbnail" alt="${name}">
                            <span>${name}</span>
                        </a>`;
                } else {
                    // Skenario 3: File Baru (Tampilkan ikon)
                    fileListHTML += `
                        <span class="mockup-preview-item">
                            <i class="bi bi-file-earmark-plus"></i>
                            <span>${name} (Baru)</span>
                        </span>`;
                }
    
                // Skenario 2: Tombol Hapus
                fileListHTML += `<span class="remove-mockup-btn" data-key="${name}">&times;</span></li>`;
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

  
  function getLineData(popup) {
    const lines = [];
    popup.querySelectorAll("#lineContainer .border").forEach(lineDiv => {
        const line = {
            nama: lineDiv.querySelector(".line-nama")?.value || '',
            deadline: lineDiv.querySelector(".line-deadline")?.value || null,
            checklists: []
        };
        
        // Loop setiap input checklist
        lineDiv.querySelectorAll(".checklist-item").forEach(checkInput => {
            if (checkInput.value) {
           
                line.checklists.push({
                    name: checkInput.value,
           
                    is_completed: checkInput.dataset.isCompleted || 0 
                });
            }
        });
        
        if (line.nama) lines.push(line);
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
 * @param {string} taskId - ID dari task yang akan diupdate.
 * @param {string} newStatusName - Nama status baru (e.g., "In Progress").
 */
 function updateTaskStatus(taskId, newStatusName) {
    // 1. Temukan tombol status di tabel utama
    const statusButton = document.querySelector(`#statusDropdown${taskId}`);
    if (!statusButton) return;

    const statusTextSpan = statusButton.querySelector('.status-text');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // 2. Update Tampilan Tombol Status (Kode Anda yang sudah ada)
    statusTextSpan.textContent = newStatusName;
    statusButton.classList.forEach(className => {
        if (className.startsWith('status-') && className !== 'status-btn') {
            statusButton.classList.remove(className);
        }
    });
    const newClass = 'status-' + newStatusName.toLowerCase().replace(/\s+/g, '-');
    statusButton.classList.add(newClass);

    // 3. Update Tampilan Dropdown Menu (Kode Anda yang sudah ada)
    const dropdownMenu = statusButton.nextElementSibling;
    if (dropdownMenu) {
        let newMenuHTML = '';
        if (newStatusName === 'Hold') {
            newMenuHTML = `<a class="dropdown-item" href="#" data-status="Resume Progress"><i class="bi bi-play-circle"></i> Resume Progress</a>`;
        } else {
            newMenuHTML = `<a class="dropdown-item" href="#" data-status="Hold"><i class="bi bi-pause-circle"></i> Set to Hold</a>`;
        }
        dropdownMenu.innerHTML = newMenuHTML;
    }

    // ▼▼▼ 4. [TAMBAHKAN BLOK INI] LOGIKA BARU: UPDATE TIME LEFT LIVE ▼▼▼
    const timeLeftSpan = document.querySelector(`#time-left-${taskId}`);
    if (timeLeftSpan) {
        
        const isDone = (newStatusName === 'Done and Ready');
        
        if (isDone) {
            // --- LOGIKA JIKA SELESAI (LIVE) ---
            const deadlineString = timeLeftSpan.dataset.deadline; // Ambil data ISO
            
            if (deadlineString) {
                const deadline = new Date(deadlineString); // Waktu deadline
                const now = new Date(); // Waktu selesai (sekarang)

                if (now < deadline) {
                    timeLeftSpan.textContent = "Selesai (Lebih Awal)";
                    timeLeftSpan.className = 'time-completed'; // Hijau
                } else {
                    timeLeftSpan.textContent = "Selesai (Terlambat)";
                    timeLeftSpan.className = 'time-overdue'; // Merah
                }
            } else {
                timeLeftSpan.textContent = "Selesai"; // Fallback
                timeLeftSpan.className = 'time-completed';
            }
        
        } else if (newStatusName === 'Hold') {
            // --- LOGIKA JIKA HOLD ---
            timeLeftSpan.className = 'text-muted'; 
            timeLeftSpan.textContent = 'Paused';
            // (Biarkan teksnya apa adanya)
        
        } else {
            // --- LOGIKA JIKA "RESUME" (Needs Work / In Progress) ---
            // Hitung ulang dari data-deadline
            const deadlineString = timeLeftSpan.dataset.deadline;
            
            if (deadlineString) {
                const deadline = new Date(deadlineString);
                const now = new Date();
                deadline.setHours(0, 0, 0, 0);
                now.setHours(0, 0, 0, 0);

                const diffTime = deadline.getTime() - now.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays > 0) {
                    timeLeftSpan.textContent = `${diffDays} hari lagi`;
                    timeLeftSpan.className = '';
                } else if (diffDays === 0) {
                    timeLeftSpan.textContent = 'Hari ini';
                    timeLeftSpan.className = '';
                } else {
                    timeLeftSpan.textContent = `Lewat ${Math.abs(diffDays)} hari`;
                    timeLeftSpan.className = 'time-overdue'; // Merah
                }
            } else {
                timeLeftSpan.textContent = '-';
                timeLeftSpan.className = '';
            }
        }
    }

    // 5. Kirim Update ke Server (Kode Anda yang sudah ada)
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


/**
 * Mengambil data task dan membuka popup untuk mode Edit.
 * (Dipanggil saat ikon pensil diklik)
 */
 async function handleEdit(icon) {
    const taskId = icon.dataset.id;
    if (!taskId) {
        alert("Task ID tidak ditemukan!");
        return;
    }

    const preloader = document.getElementById('page-preloader');
    if (preloader) preloader.classList.remove('loaded'); // Tampilkan loading

    try {
        // 1. Ambil data lengkap dari server
        const response = await fetch(`/task/edit/${taskId}`); // Panggil Rute 'task.edit'
        if (!response.ok) throw new Error('Gagal mengambil data task.');
        
        const result = await response.json();
        
        if (result.success) {
            // 2. Panggil 'showPopup' (ini akan membersihkan listener lama)
            showPopup(); 
            
            // 3. Panggil fungsi baru untuk MENGISI form
            populateForm(result.task, result.allTasks, result.sizeData);
                } else {
            throw new Error(result.message || 'Gagal memuat data.');
        }

    } catch (error) {
        console.error('Error handleEdit:', error);
        alert(error.message);
    } finally {
        if (preloader) preloader.classList.add('loaded'); // Sembunyikan loading
    }
}

/**
 * Mengisi form popup dengan data dari task yang diedit.
 * (VERSI PERBAIKAN: Menggunakan JS Array [0] bukan .first())
 */
 function populateForm(mainTask, allTasks, sizeData) {
    const popup = document.querySelector(".popup-overlay .popup");
    if (!popup) return;
    
    const taskForm = popup.querySelector("#taskForm");
    
    taskForm.dataset.editingId = mainTask.id; 

    const noInvoiceInput = popup.querySelector("#noInvoice");
    noInvoiceInput.value = mainTask.no_invoice;
    noInvoiceInput.disabled = true; // Nonaktifkan field
    noInvoiceInput.style.backgroundColor = "#e9ecef"; // (Opsional) Beri warna abu-abu

    // --- 2. Isi Field Sederhana ---
    popup.querySelector("#noInvoice").value = mainTask.no_invoice;
    popup.querySelector("#namaPelanggan").value = mainTask.nama_pelanggan;
    popup.querySelector("#judul").value = mainTask.judul;
    popup.querySelector("#catatan").value = mainTask.catatan;
    popup.querySelector("#urgensi").value = mainTask.urgensi;
    popup.querySelector("#warna").value = mainTask.warna;
    popup.querySelector("#model").value = mainTask.model;
    popup.querySelector("#bahan").value = mainTask.bahan;

    // --- 3. Isi Line Pekerjaan (Looping dari 'allTasks') ---
    const lineContainer = popup.querySelector("#lineContainer");
    lineContainer.innerHTML = ''; 
    
    allTasks.forEach(task => {
        // ▼▼▼ PERBAIKAN DI SINI ▼▼▼
        // Ambil line pertama (dan satu-satunya) menggunakan [0]
        const line = (task.task_pekerjaans && task.task_pekerjaans.length > 0) ? task.task_pekerjaans[0] : null;
        // ▲▲▲ AKHIR PERBAIKAN ▲▲▲
        
        if (!line) return; // Lewati jika task tidak punya line

        addLine(); 
        const newLineDiv = lineContainer.lastElementChild; 
        
        // Isi input
        newLineDiv.querySelector(".line-nama").value = line.nama_pekerjaan;
        newLineDiv.querySelector(".line-deadline").value = line.deadline ? line.deadline.substring(0, 16) : '';

        // Isi checklists
        if (line.checklists) { // Pastikan checklists ada
            line.checklists.forEach(check => {
                const addChecklistBtn = newLineDiv.querySelector(".addChecklist");
                addChecklist(addChecklistBtn);
                const newCheckInput = newLineDiv.querySelector(".d-flex:last-child .checklist-item");
                if (newCheckInput) {
                    newCheckInput.value = check.nama_checklist;
                    newCheckInput.dataset.isCompleted = check.is_completed;
                }
            });
        }
    });

    // --- 4. Isi Tabel Size (Data dari mainTask) ---
    const sizeTable = popup.querySelector("#sizeTable");
    const tHeadRow = sizeTable.querySelector("thead tr");
    const tBody = sizeTable.querySelector("tbody");
    const tFootRow = sizeTable.querySelector("tfoot tr");
    
    // Reset tabel
    tHeadRow.innerHTML = '<th>Jenis</th>'; 
    tBody.innerHTML = ''; 
    tFootRow.innerHTML = '<td>Total</td>'; 

    // Bangun ulang Headers & Footer
    sizeData.headers.forEach(header => {
        tHeadRow.innerHTML += `<th>${header}</th>`;
        tFootRow.innerHTML += `<td class="column-total">0</td>`;
    });
    tHeadRow.innerHTML += '<th>Jumlah</th>';
    tFootRow.innerHTML += '<td class="grand-total">0</td>';

    // Bangun ulang Body
    for (const jenis in sizeData.rows) {
        const rowData = sizeData.rows[jenis]; 
        
        insertSizeRow(sizeTable, tBody.lastElementChild); 
        
        const newTr = tBody.lastElementChild; 
        newTr.querySelector("td:first-child input").value = jenis;

        const qtyInputs = newTr.querySelectorAll('.quantity-input');
        sizeData.headers.forEach((header, index) => {
            // 'rowData' adalah array dari objek size
            const sizeInfo = rowData.find(s => s.tipe === header);
            const jumlah = sizeInfo ? sizeInfo.jumlah : 0;
            if (qtyInputs[index]) {
                qtyInputs[index].value = jumlah;
            }
        });
    }
    calculateTotals(); 

    // --- 5. Isi Mockup (Data dari mainTask) ---
    if (mainTask.mockups) { 
        mainTask.mockups.forEach(mockup => {
            const fileName = mockup.file_path.split('/').pop();
            mockupFiles.set(fileName, { 
                 name: fileName, 
                 is_existing: true, 
                 path: mockup.file_path_url // <-- Ini sekarang akan ada
            }); 
        });
    }
    updateMockupPreview(); // Update tampilan
}



 function handleDelete(icon) {
    const row = icon.closest('tr');
    const taskId = icon.dataset.id;
    
    if (!taskId || !row) {
        alert('Error: Task ID tidak ditemukan.');
        return;
    }
    
    const taskName = row.querySelector('td:nth-child(2)')?.textContent || 'task ini'; 
    
    if (confirm(`Apakah Anda yakin ingin menghapus task: "${taskName}"?`)) {
        
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

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
                row.remove();
                showNotif(result.message || 'Task berhasil dihapus.');
            } else {
                alert('Gagal menghapus task: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Terjadi kesalahan. Gagal menghapus task.');
        });
    }
}




function showValidationErrors(popup, errors) {
    // Sembunyikan semua error lama dulu
    popup.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
    popup.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

    for (const field in errors) {
        // 'errors' memiliki key seperti 'namaPelanggan', 'judul'
        // Kita cari input yang sesuai.
        // (Kita perlu memetakan 'namaPelanggan' ke '#namaPelanggan', dll.)
        
        let inputId = '';
        if (field === 'noInvoice') inputId = '#noInvoice';
        if (field === 'namaPelanggan') inputId = '#namaPelanggan';
        if (field === 'judul') inputId = '#judul';
        if (field === 'urgensi') inputId = '#urgensi';
        // (Tambahkan field lain jika perlu)

        if (inputId) {
            const inputElement = popup.querySelector(inputId);
            if (inputElement) {
                // Tambahkan class error Bootstrap
                inputElement.classList.add('is-invalid');
                
                // Buat div untuk pesan error
                const errorElement = document.createElement('div');
                errorElement.className = 'invalid-feedback d-block'; // 'd-block' untuk memaksa tampil
                errorElement.textContent = errors[field][0]; // Ambil pesan error pertama
                
                // Masukkan pesan error setelah input
                inputElement.parentNode.appendChild(errorElement);
            }
        }
    }
}
  // --- FUNGSI POPUP UTAMA ---

 function showPopup() {
    const overlay = document.querySelector(".popup-overlay");
    if (!overlay) return;
    
    // 1. Ambil referensi ke popup (tanpa cloneNode)
    const popup = overlay.querySelector(".popup");
    if (!popup) {
        console.error("Elemen .popup tidak ditemukan!");
        return;
    }

    // 2. Ambil referensi semua elemen
    const addLineBtn = popup.querySelector("#addLine");
    const cancelBtn = popup.querySelector("#cancelBtn");
    const taskForm = popup.querySelector("#taskForm");
    const addSizeRowBtn = popup.querySelector("#addSizeRow");
    const sizeTable = popup.querySelector("#sizeTable");
    const contextMenu = popup.querySelector("#customContextMenu");
    const sizeTableHead = popup.querySelector('#sizeTable thead');
    const sizeTableBody = popup.querySelector("#sizeTable tbody");
    const mockupInput = popup.querySelector("#mockups");
    const previewArea = popup.querySelector("#mockup-preview-area");

    // Variabel untuk file hapus (direset setiap kali)
    let mockupsToDelete = [];

    // --- 3. PASANG LISTENER (Menggunakan .onclick = ... untuk MENCEGAH DUPLIKAT) ---

    // Hapus ID Edit lama (jika ada) saat "Add New"
    if (taskForm && taskForm.dataset.editingId) {
        delete taskForm.dataset.editingId;
    }

    if (addLineBtn) {
        addLineBtn.onclick = (e) => { e.preventDefault(); addLine(); };
    } else { console.error("Tombol #addLine tidak ditemukan!"); }

    if (cancelBtn) {
        cancelBtn.onclick = () => { overlay.style.display = "none"; actionHistory = []; mockupFiles.clear(); };
    }

    if (addSizeRowBtn) {
         addSizeRowBtn.onclick = (e) => {
             e.preventDefault();
             const lastRow = popup.querySelector("#sizeTable tbody tr:last-child");
             insertSizeRow(sizeTable, lastRow || sizeTable.querySelector('tbody'));
         };
    }

    if (mockupInput) {
        mockupInput.onchange = () => {
            if (mockupInput.files.length > 0) {
                // Daftar tipe file yang diizinkan
                const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

                for (const file of mockupInput.files) {
                    // Cek apakah tipe file valid
                    if (!validTypes.includes(file.type)) {
                        alert(`File "${file.name}" bukan gambar yang didukung! Harap upload JPG, PNG, atau WEBP.`);
                        continue; // Lewati file ini
                    }
                    
                    // Cek ukuran file (opsional, misal max 2MB)
                    if (file.size > 2 * 1024 * 1024) {
                        alert(`File "${file.name}" terlalu besar! Maksimal 2MB.`);
                        continue;
                    }

                    mockupFiles.set(file.name, file);
                }
                updateMockupPreview();
                mockupInput.value = ''; 
            }
        };
    }
    
    if (previewArea) {
        previewArea.onclick = (event) => { // Gunakan .onclick
            if (event.target.classList.contains('remove-mockup-btn')) {
                const fileName = event.target.dataset.key;
                const file = mockupFiles.get(fileName);
                if (file && file.is_existing) {
                    mockupsToDelete.push(file.path); 
                }
                mockupFiles.delete(fileName);
                updateMockupPreview();
            }
        };
    }

    // Listener SUBMIT FORM (Fetch) - Gunakan .onsubmit
    if (taskForm) {
        taskForm.onsubmit = async (e) => { // Gunakan .onsubmit
            e.preventDefault();
            const submitBtn = taskForm.querySelector('button[type="submit"]');
            const loadingOverlay = popup.querySelector('.loading-overlay');
            
            popup.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
            popup.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));

            if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Menyimpan...'; }
            if (loadingOverlay) loadingOverlay.style.display = 'flex';

            try {
                const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                if (!csrfToken) throw new Error("CSRF token tidak ditemukan.");
                
                const formData = new FormData();
                
                const loggedInUserName = document.querySelector('.page')?.dataset.userName || 'Unknown';
                const grandTotalValue = popup.querySelector("#sizeTable tfoot .grand-total")?.textContent || '0';
                formData.append('noInvoice', popup.querySelector("#noInvoice")?.value || '');
                formData.append('namaPelanggan', popup.querySelector("#namaPelanggan")?.value || '');
                formData.append('judul', popup.querySelector("#judul")?.value || '');
                formData.append('catatan', popup.querySelector("#catatan")?.value || '');
                formData.append('penanggungJawab', loggedInUserName);
                formData.append('urgensi', popup.querySelector("#urgensi")?.value || '');
                formData.append('jumlah', grandTotalValue);
                formData.append('warna', popup.querySelector("#warna")?.value || '');
                formData.append('model', popup.querySelector("#model")?.value || '');
                formData.append('bahan', popup.querySelector("#bahan")?.value || '');
                
                const lineData = getLineData(popup);
                const sizeData = getSizeTableData(popup);
                formData.append('lines', JSON.stringify(lineData));
                formData.append('sizes', JSON.stringify(sizeData));
                
                let existingMockupUrls = [];
                if (mockupFiles.size > 0) {
                    mockupFiles.forEach(file => {
                        if (file.is_existing) {
                            existingMockupUrls.push(file.path); 
                        } else {
                            formData.append('mockups[]', file, file.name);
                        }
                    });
                }
                formData.append('existing_mockup_urls', JSON.stringify(existingMockupUrls));
                formData.append('mockups_to_delete', JSON.stringify(mockupsToDelete));
                
                // Tentukan URL
                const editingId = taskForm.dataset.editingId;
                let url = '/task/store'; 
                formData.append('_token', csrfToken);
                if (editingId) {
                    url = `/task/update/${editingId}`;
                }

                // Kirim ke server
                const response = await fetch(url, {
                    method: 'POST', 
                    headers: { 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                    body: formData
                });
                
                const result = await response.json(); 

                if (!response.ok) {
                    if (response.status === 422) {
                        showValidationErrors(popup, result.errors);
                        throw new Error('Data yang Anda masukkan tidak valid.');
                    }
                    throw new Error(result.message || `HTTP error! status: ${response.status}`);
                }
                
                if (!result.success) {
                    throw new Error(result.message || 'Error server tidak diketahui');
                }
                
                // Sukses
                showNotif(result.message || "Aksi berhasil!");
                setTimeout(() => { location.reload(); }, 1000); 
                
            } catch (error) {
                console.error('Error saat submit:', error);
                alert(`Gagal: ${error.message}`); 
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
            } finally {
                if (loadingOverlay) loadingOverlay.style.display = 'none';
            } 
        };
    }

    // LOGIKA KLIK KANAN (CONTEXT MENU) - Gunakan .oncontextmenu
    if (sizeTable && contextMenu) {
        sizeTable.oncontextmenu = (e) => {
            e.preventDefault();
            clickedCell = e.target.closest('td, th');
            if (!clickedCell) return;
            const popupRect = popup.getBoundingClientRect();
            const x = e.clientX - popupRect.left;
            const y = e.clientY - popupRect.top + popup.scrollTop;
            contextMenu.style.top = `${y}px`;
            contextMenu.style.left = `${x}px`;
            contextMenu.classList.add("show");
        };
        popup.onclick = (e) => {
             if (!e.target.closest('.context-menu-item') && !e.target.closest('#sizeTable')) {
                 contextMenu.classList.remove("show");
             }
        };
        contextMenu.onclick = (e) => {
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
        };
    }

    // LISTENER DOUBLE-CLICK HEADER - Gunakan .ondblclick
    if (sizeTableHead) {
        sizeTableHead.ondblclick = (event) => {
            const thTarget = event.target.closest('th');
            if (thTarget) {
                handleHeaderDoubleClick(thTarget);
            }
        };
    }

    // LISTENER KEYDOWN (UNDO) - Gunakan .onkeydown
    popup.onkeydown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            event.preventDefault();
            undoLastAction();
        }
    };

    // LISTENER INPUT JUMLAH - Gunakan .oninput
    if (sizeTableBody) {
        sizeTableBody.oninput = (event) => {
            if (event.target.classList.contains('quantity-input')) {
                calculateTotals();
            }
        };
    }

    // Listener untuk Hapus Line, Tambah Checklist, dan Autocomplete
    const lineContainerArea = popup.querySelector("#lineContainer");
    if (lineContainerArea) {
        
        // --- 1. LISTENER UNTUK KLIK (Event Delegation) ---
        lineContainerArea.onclick = async (event) => {
            const target = event.target;

            // A. Hapus line pekerjaan
            const removeLineBtn = target.closest('.btn-remove-line');
            if (removeLineBtn) {
                event.preventDefault();
                removeLineBtn.closest('.border.p-3.mb-3.rounded')?.remove();
            }

            // B. Tambah checklist (membuat widget baru)
            const addChecklistLink = target.closest('.addChecklist');
            if (addChecklistLink) {
                event.preventDefault();
                addChecklist(addChecklistLink);
            }

            // C. Hapus checklist (menghapus widget)
            const removeChecklistBtn = target.closest('.btn-remove-checklist'); 
            if (removeChecklistBtn) {
                event.preventDefault();
                removeChecklistBtn.closest('.d-flex.gap-2.mb-2')?.remove(); 
            }

            //  D.  LOGIKA TOMBOL TOGGLE
            const toggleBtn = target.closest('.toggle-search-btn');
            
            if (toggleBtn) {
                event.preventDefault(); // Mencegah submit form
                
                // 1. Cari elemen terkait (input & container hasil)
                const wrapper = toggleBtn.closest('.position-relative');
                const input = wrapper.querySelector('input');
                const resultsContainer = wrapper.querySelector('.autocomplete-results');
                
                // 2. Toggle: Jika sudah ada isinya (terbuka), kosongkan (tutup).
                if (resultsContainer.innerHTML.trim() !== '') {
                    resultsContainer.innerHTML = '';
                    return;
                }

                // 3. Jika tertutup, ambil data dari server (Query kosong = semua data)
                try {
                    let url = '';
                    // Cek jenis input (Nama Pekerjaan atau Checklist)
                    if (input.classList.contains('line-nama')) {
                        url = `/pekerjaan/search?query=`; 
                    } else {
                        url = `/checklists/search?query=`;
                    }

                    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
                    const data = await response.json();

                    // 4. Tampilkan Hasil
                    let html = '';
                    if (data.length === 0) {
                        html = '<div class="p-2 text-muted small">Tidak ada data.</div>';
                    } else {
                        data.forEach(item => {
                            if (input.classList.contains('line-nama')) {
                                // Render Item Pekerjaan
                                html += `<div class="autocomplete-item">${item.nama_pekerjaan}</div>`;
                            } else {
                                // Render Item Checklist (dengan data items tersembunyi)
                                const itemsJson = JSON.stringify(item.items || []).replace(/"/g, '&quot;');
                                let subInfo = (item.items && item.items.length > 0) ? 
                                    `<small class="text-muted d-block" style="font-size:10px;">Isi: ${item.items.map(i => i.name).join(', ')}</small>` : '';
                                html += `<div class="autocomplete-item" data-items="${itemsJson}"><strong>${item.name}</strong>${subInfo}</div>`;
                            }
                        });
                    }
                    resultsContainer.innerHTML = html;
                    input.focus(); // Kembalikan fokus ke input

                } catch (error) {
                    console.error('Gagal load dropdown:', error);
                }
                return; // Selesai
            }
   
            

            // E. Klik pada item hasil autocomplete
            const resultItem = target.closest('.autocomplete-item');
            if (resultItem) {
                // 1. Cari wrapper & input terdekat (Aman untuk Job & Checklist)
                const wrapper = resultItem.closest('.position-relative');
                const inputField = wrapper.querySelector('input');
                const resultsContainer = wrapper.querySelector('.autocomplete-results');

                if (inputField.classList.contains('line-nama')) {
                    // --- KASUS NAMA PEKERJAAN ---
                    // Cukup isi valuenya dan tutup dropdown
                    inputField.value = resultItem.textContent.trim();
                    resultsContainer.innerHTML = '';
                
                } else if (inputField.classList.contains('checklist-item')) {
                    // --- KASUS CHECKLIST ---
                    const itemsData = JSON.parse(resultItem.dataset.items || '[]');
                    
                    if (itemsData.length > 0) {
                        // KASUS GRUP: Pecah jadi banyak input
                        const checklistContainer = wrapper.closest('.checklist-container');
                        const currentWidget = wrapper.closest('.d-flex'); // Widget saat ini

                        itemsData.forEach(item => {
                            // PENTING: Gunakan struktur HTML baru (dengan toggle)
                            const newWidget = document.createElement("div");
                            newWidget.className = "d-flex gap-2 mb-2 align-items-center"; 
                            newWidget.innerHTML = `
                                 <div class="position-relative input-with-toggle" style="flex-grow: 1;">
                                    <input type="search" class="form-control checklist-item" value="${item.name}">
                                    <button class="toggle-search-btn" type="button"><i class="bi bi-chevron-down"></i></button>
                                    <div class="autocomplete-results checklist-results"></div>
                                 </div>
                                 <span class="btn-remove-checklist">x</span>
                            `;
                            checklistContainer.insertBefore(newWidget, currentWidget);
                        });
                        currentWidget.remove(); // Hapus input pencarian awal

                    } else {
                        // KASUS SINGLE: Isi saja
                        const nameText = resultItem.querySelector('strong') ? resultItem.querySelector('strong').textContent : resultItem.textContent;
                        inputField.value = nameText.trim(); 
                        resultsContainer.innerHTML = '';
                    }
                }
            }
        };

        // --- 2. LISTENER UNTUK KEYBOARD (Autocomplete Fetch) ---
        lineContainerArea.onkeyup = async (event) => {
            const input = event.target;
            
            if (input.classList.contains('checklist-item')) {
                const query = input.value.trim();
                const resultsContainer = input.parentElement.querySelector('.autocomplete-results');
                if (!resultsContainer) return; 
                
                if (event.key === 'Escape') {
                    resultsContainer.innerHTML = ''; 
                    input.blur(); 
                    return;
                }
                if (query.length < 1) { 
                    resultsContainer.innerHTML = '';
                    return;
                }

                try {
                    const response = await fetch(`/checklists/search?query=${query}`, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });
                    const checklists = await response.json();

                    let html = '';
                    checklists.forEach(check => {
                        const itemsJson = JSON.stringify(check.items || []).replace(/"/g, '&quot;');
                        let subInfo = '';
                        if (check.items && check.items.length > 0) {
                            const itemNames = check.items.map(i => i.name).join(', ');
                            subInfo = `<small class="text-muted d-block" style="font-size:10px; margin-top:-2px;">Isi: ${itemNames}</small>`;
                        }

                        html += `<div class="autocomplete-item" data-items="${itemsJson}">
                                    <strong>${check.name}</strong>
                                    ${subInfo}
                                 </div>`;
                    });
                    resultsContainer.innerHTML = html;
                    
                } catch (error) {
                    console.error('Pencarian checklist gagal:', error);
                }
            }
            else if (input.classList.contains('line-nama')) {
                const query = input.value.trim();
                const resultsContainer = input.parentElement.querySelector('.autocomplete-results');
                if (!resultsContainer) return;
                if (event.key === 'Escape') {
                    resultsContainer.innerHTML = '';
                    input.blur();
                    return;
                }
                if (query.length < 1) { 
                    resultsContainer.innerHTML = '';
                    return;
                }
                try {
                    const response = await fetch(`/pekerjaan/search?query=${query}`, {
                        method: 'GET',
                        headers: { 'Accept': 'application/json' }
                    });
                    const pekerjaan = await response.json(); 
                    let html = '';
                    pekerjaan.forEach(job => {
                        html += `<div class="autocomplete-item">${job.nama_pekerjaan}</div>`;
                    });
                    resultsContainer.innerHTML = html;
                } catch (error) {
                    console.error('Pencarian pekerjaan gagal:', error);
                }
            }
        };

        // --- 3. LISTENER UNTUK FOKUS HILANG ---
        lineContainerArea.onfocusout = (event) => {
             if (event.target.classList.contains('checklist-item') || event.target.classList.contains('line-nama')) {
                 setTimeout(() => {
                    const resultsContainer = event.target.parentElement.querySelector('.autocomplete-results');
                    if(resultsContainer) resultsContainer.innerHTML = '';
                 }, 200); 
             }
        };
    }

    // Panggil kalkulasi & kosongkan history saat popup dibuka
    calculateTotals();
    actionHistory = [];
    mockupFiles.clear();
    mockupsToDelete = [];
    updateMockupPreview();

    // TAMPILKAN POP-UP
    overlay.style.display = "block";
}

// Add Line Function


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
          
          <div class="position-relative input-with-toggle">
             <input type="search" class="form-control line-nama" placeholder="Ketik untuk mencari pekerjaan...">
             
             <button class="toggle-search-btn" type="button">
                <i class="bi bi-chevron-down"></i>
             </button>
             
             <div class="autocomplete-results job-results"></div>
          </div>
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
/**
 * Fungsi untuk menambah 'widget' checklist baru
 * (VERSI BARU dengan autocomplete)
 */
/**
   * Fungsi untuk menambah checklist di dalam line
   */
 function addChecklist(button) {
    const checklistContainer = button.previousElementSibling; 
    if (!checklistContainer) return;
    
    const checklistWidget = document.createElement("div");
    checklistWidget.className = "d-flex gap-2 mb-2 align-items-center"; 

    // 1. Wrapper Input
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "position-relative input-with-toggle"; 
    inputWrapper.style.flexGrow = "1"; 

    // 2. Input Field
    const checklistInput = document.createElement("input");
    checklistInput.type = "search";
    checklistInput.className = "form-control checklist-item";
    checklistInput.placeholder = "Ketik untuk mencari checklist...";
    
    // ▼▼▼ 3. BUAT TOMBOL TOGGLE ▼▼▼
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-search-btn"; 
    toggleBtn.type = "button";
    toggleBtn.innerHTML = '<i class="bi bi-chevron-down"></i>';
    // ▲▲▲ ▲▲▲ ▲▲▲

    // 4. Container Hasil
    const resultsContainer = document.createElement("div");
    resultsContainer.className = "autocomplete-results checklist-results";

    // 5. Tombol Hapus (X)
    const deleteBtn = document.createElement("span"); 
    deleteBtn.className = "btn-remove-checklist"; 
    deleteBtn.innerHTML = 'x';
    
    // Rakit elemen (JANGAN LUPA appendChild toggleBtn)
    inputWrapper.appendChild(checklistInput);
    inputWrapper.appendChild(toggleBtn); // <--- Masukkan tombol
    inputWrapper.appendChild(resultsContainer);
    
    checklistWidget.appendChild(inputWrapper);
    checklistWidget.appendChild(deleteBtn);
    
    checklistContainer.appendChild(checklistWidget);
    checklistInput.focus();
}

function showNotif(text) {
    const notif = document.getElementById("notif");
    if (!notif) return;
    
    notif.textContent = text;
    notif.style.display = "block";
    
    // Sembunyikan setelah 2.5 detik
    setTimeout(() => {
        notif.style.display = "none";
    }, 2500);
}

function updateProgress(checkbox) {
    const dropdown = checkbox.closest('.dropdown-menu');
    if (!dropdown) return;
    
    const progressButton = dropdown.closest('.dropdown').querySelector('.progress.dropdown-toggle');
    if (!progressButton) return;

    const taskId = progressButton.dataset.taskId;

    // --- 1. Hitung Persentase (DENGAN PEMBULATAN) ---
    const allCheckboxes = dropdown.querySelectorAll('.progress-check');
    const completedTasks = dropdown.querySelectorAll('.progress-check:checked').length;
    

    const percentage = (allCheckboxes.length === 0) ? 0 : Math.round((completedTasks / allCheckboxes.length) * 100);

    const progressText = progressButton.querySelector('.progress-text');
    if (progressText) {
        // Gunakan angka yang sudah dibulatkan
        progressText.textContent = percentage + '%'; 
    }
    
    // Perbarui warna progress bar
    progressButton.classList.remove('status-red', 'status-yellow', 'status-green');
    if (percentage === 0) {
        progressButton.classList.add('status-red');
    } else if (percentage === 100) {
        progressButton.classList.add('status-green');
    } else {
        progressButton.classList.add('status-yellow');
    }

    // --- 2. LOGIKA BARU: Update Status Utama ---
    const statusButton = document.querySelector(`#statusDropdown${taskId}`);
    if (!statusButton) return; 

    const currentStatus = statusButton.querySelector('.status-text').textContent.trim();

    if (currentStatus === 'Hold') {
        return;
    }

    // Tentukan status baru (sekarang 'percentage' sudah dibulatkan)
    let newStatusName = '';
    if (percentage === 100) { // <-- Perbandingan ini sekarang akan BERHASIL
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
    const taskId = statusButton.dataset.taskId;

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
    const taskId = icon.dataset.id; // Ambil ID Task dari data-id
    if (!taskId) {
        alert("Task ID tidak ditemukan!");
        return;
    }

    const printURL = `/print-po/${taskId}`; 
    
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




  // Listener untuk PERUBAHAN (change) - Khusus Checkbox
document.body.addEventListener('change', function(event) {
    if (event.target.classList.contains('progress-check')){
        
        const checklistId = event.target.dataset.id;
        const isChecked = event.target.checked;
        const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

        fetch(`/checklist/update/${checklistId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken,
                'Accept': 'application/json'
            },
            body: JSON.stringify({ is_completed: isChecked })
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.message || 'Server error'); });
            }
            return response.json();
        })
        .then(result => {
            if (result.success) {
                console.log(`Checklist ${checklistId} updated to ${isChecked}`);
                
                // ▼▼▼ HANYA panggil updateProgress jika di halaman task (ada dropdown) ▼▼▼
                if (event.target.classList.contains('progress-check')) {
                    updateProgress(event.target); 
                }
                // ▲▲▲ Jika tidak ada class 'progress-check', abaikan updateProgress ▲▲▲

            } else {
                alert('Gagal menyimpan checklist: ' + result.message);
                event.target.checked = !isChecked;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Gagal menyimpan checklist. Periksa koneksi atau log server.');
            event.target.checked = !isChecked;
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

  const highlightedTask = document.getElementById('highlight-task');
  if (highlightedTask) {
      highlightedTask.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
      });
  }
  
  // --- LOGIKA SELEKSI MASSAL (BULK ACTION) ---
  const selectToggleBtn = document.getElementById('selectToggleBtn');
  const taskTable = document.getElementById('taskTable');
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  const rowCheckboxes = document.querySelectorAll('.row-checkbox');
  const bulkActionBar = document.getElementById('bulkActionBar');
  const bulkSelectCount = document.getElementById('bulkSelectCount');
  const bulkArchiveBtn = document.getElementById('bulkArchiveBtn');
  const bulkDeleteBtn = document.getElementById('bulkDeleteBtn');

/**
   * Helper untuk update tampilan bar aksi massal
   */
  function updateBulkActionBar() {
      const selectedCount = document.querySelectorAll('.row-checkbox:checked').length;
      
      if (selectedCount > 0) {
          if(bulkActionBar) bulkActionBar.style.display = 'flex';
          if(bulkSelectCount) bulkSelectCount.textContent = `${selectedCount} Task terpilih`;
      } else {
          if(bulkActionBar) bulkActionBar.style.display = 'none';
      }
      
      // Update checkbox "Select All"
      if(selectAllCheckbox) {
          selectAllCheckbox.checked = (selectedCount > 0 && selectedCount === rowCheckboxes.length);
          selectAllCheckbox.indeterminate = (selectedCount > 0 && selectedCount < rowCheckboxes.length);
      }
  }

  /**
   * Helper untuk mengirim 'fetch' aksi massal
   */
  async function performBulkAction(action) {
      const selectedIds = Array.from(document.querySelectorAll('.row-checkbox:checked'))
                               .map(cb => cb.dataset.id);
      
      if (selectedIds.length === 0) {
          alert('Tidak ada task yang dipilih.');
          return;
      }

      const preloader = document.getElementById('page-preloader');
      if (preloader) preloader.classList.remove('loaded');
      const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

      try {
          const response = await fetch('/tasks/bulk-action', { // Rute yang kita buat
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-CSRF-TOKEN': csrfToken,
                  'Accept': 'application/json'
              },
              body: JSON.stringify({
                  action: action, // 'archive' or 'delete'
                  task_ids: selectedIds
              })
          });
          
          const result = await response.json();

          if (result.success) {
              showNotif(result.message);
              location.reload(); // Muat ulang halaman
          } else {
              throw new Error(result.message || 'Aksi massal gagal.');
          }
      } catch (error) {
          alert(error.message);
          if (preloader) preloader.classList.add('loaded');
      }
  }

  // Listener untuk Tombol "Pilih / Batal"
  if (selectToggleBtn && taskTable) {
      selectToggleBtn.addEventListener('click', () => {
          taskTable.classList.toggle('selection-mode');
          const isInSelectionMode = taskTable.classList.contains('selection-mode');

          if (isInSelectionMode) {
              selectToggleBtn.innerHTML = '<i class="bi bi-x-lg"></i> Batal';
              selectToggleBtn.classList.add('active'); 
          } else {
              selectToggleBtn.innerHTML = '<i class="bi bi-check-square"></i> Pilih';
              selectToggleBtn.classList.remove('active');
              
              if (bulkActionBar) bulkActionBar.style.display = 'none';
              if (selectAllCheckbox) selectAllCheckbox.checked = false;
              rowCheckboxes.forEach(cb => { cb.checked = false; });
          }
      });
  }

  // Listener untuk "Select All"
  if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('click', (e) => {
          rowCheckboxes.forEach(cb => {
              cb.checked = e.target.checked;
          });
          updateBulkActionBar();
      });
  }

  // Listener untuk setiap checkbox baris
  rowCheckboxes.forEach(cb => {
      cb.addEventListener('click', (e) => {
          // Mencegah klik baris (pindah halaman) saat klik checkbox
          e.stopPropagation(); 
          updateBulkActionBar();
      });
  });

  // Listener untuk tombol "Arsipkan"
  if (bulkArchiveBtn) {
      bulkArchiveBtn.addEventListener('click', () => {
          if (confirm('Apakah Anda yakin ingin mengarsipkan task yang dipilih?')) {
              performBulkAction('archive');
          }
      });
  }
  
  // Listener untuk tombol "Hapus (Trash)"
  if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener('click', () => {
          if (confirm('Apakah Anda yakin ingin memindahkan task ke sampah?')) {
              performBulkAction('delete');
          }
      });
  }
  

  // 3.Listener untuk KLIK (click) - GABUNGAN SEMUA DELEGASI
  document.body.addEventListener('click', function(event) {
    const target = event.target;
    
    // 1. Jangan jalankan jika di dalam popup
    if (target.closest('.popup-overlay')) return; 

    // 2. Cek Aksi Prioritas Tinggi (Ikon Aksi)
    // Cek apakah kita mengklik IKON di dalam .icon-cell
    const iconCell = target.closest('.icon-cell');
    if (iconCell) {
        // Aksi Edit (Membuka popup)
        if (target.classList.contains('icon-edit')) {
            event.preventDefault();
            handleEdit(target); // Panggil fungsi edit
            return; // Berhenti di sini
        }
        // Aksi Download (Print)
        if (target.classList.contains('icon-download')) {
            event.preventDefault();
            handlePrint(target); // Panggil fungsi print
            return; // Berhenti di sini
        }
        // Aksi Hapus (Fetch Delete)
        if (target.classList.contains('icon-trash')) {
            event.preventDefault();
            handleDelete(target); // Panggil fungsi delete
            return; // Berhenti di sini
        }
    }

    // 3. Cek Aksi Prioritas Sedang (Elemen Interaktif Lain)
    // (Dropdown, Mockup, Checklist, Status)
    if (target.closest('.mockup-wrapper') || 
        target.closest('.dropdown-item[data-status]') || 
        target.closest('.dropdown-toggle') || 
        target.closest('.line-btn') || 
        target.closest('.form-check')) {
        
        // Buka Modal Galeri
        const wrapper = target.closest('.mockup-wrapper');
        if (wrapper) {
            event.preventDefault();
            openImageModal(wrapper);
            return; // Berhenti
        }
        // Ubah status
        const statusItem = target.closest('.dropdown-item[data-status]');
        if (statusItem) {
            event.preventDefault();
            handleStatusChange(statusItem);
            return; // Berhenti
        }
        
        // Jika hanya .dropdown-toggle atau .form-check,
        // biarkan event default (Bootstrap/centang) bekerja
        return; 
    }
    
    // 4. Aksi Prioritas Rendah (Klik Baris)
    // Kode ini hanya akan berjalan jika kita TIDAK mengklik
    // elemen-elemen prioritas di atas.
    const row = target.closest('tr.clickable-row');
    if (row) {
        const url = row.dataset.url;
        if (url) {
            window.location.href = url; // Pindah ke halaman detail
        }
    }


    // // buka popup
    // document.querySelector(".popup-wrapper").classList.add("active");

    // // tutup popup
    // document.querySelector(".popup-wrapper").classList.remove("active");


});




});