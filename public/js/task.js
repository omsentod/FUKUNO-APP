
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
  function initSortableChecklist(containerElement) {
    if (!containerElement || containerElement.classList.contains('sortable-initialized')) return;

    new Sortable(containerElement, {
        animation: 150,
        handle: '.checklist-drag-handle', // Hanya bisa geser kalau pegang icon
        ghostClass: 'sortable-ghost',
    });

    containerElement.classList.add('sortable-initialized');
}

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
                const status = checkInput.dataset.isCompleted || 0;
                console.log(`Checklist: ${checkInput.value} | Status: ${status}`);
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

function getSizeTableData(popup) {
    const table = popup.querySelector("#sizeTable");
    if (!table) return { headers: [], rows: [] };

    const firstTh = table.querySelector("thead tr th:first-child");
    
    let sizeTitle = 'Size'; 
    
    if (firstTh) {
        const firstThInput = firstTh.querySelector('input');
        sizeTitle = firstThInput ? firstThInput.value.trim() : firstTh.textContent.trim();
    }

    const headers = [];
    const thElements = Array.from(table.querySelectorAll("thead tr th"));
    const contentThs = thElements.slice(1, -1); 
    
    contentThs.forEach(th => {
        const input = th.querySelector('input');
        headers.push(input ? input.value.trim() : th.textContent.trim());
    });

    const rows = [];
    table.querySelectorAll("tbody tr").forEach(tr => {
        const jenisInput = tr.querySelector('td:first-child input');
        const jenis = jenisInput ? jenisInput.value.trim() : '';
        
        if (!jenis) return; 
        
        const rowData = { jenis: jenis, quantities: {} };
        const qtyInputs = tr.querySelectorAll('.quantity-input');
        
        headers.forEach((headerName, index) => {
             if (qtyInputs[index]) {
                 const val = parseInt(qtyInputs[index].value, 10);
                 rowData.quantities[headerName] = isNaN(val) ? 0 : val;
             }
        });
        rows.push(rowData);
    });

    return { 
        size_title: sizeTitle, 
        headers: headers, 
        rows: rows 
    };
}



/**
 * @param {string|number} taskId 
 * @param {string} newStatusName 
 */
 function updateTaskStatus(taskId, newStatusName) {
    const statusButton = document.querySelector(`#statusDropdown${taskId}`);
    if (!statusButton) return;

    const statusTextSpan = statusButton.querySelector('.status-text');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // --- 1. HANDLING RESUME PROGRESS ---
    // Jika user klik "Resume Progress", tampilan tombol harusnya "In Progress" (atau sesuai DB)
    let displayStatusName = newStatusName;
    if (newStatusName === 'Resume Progress') {
        displayStatusName = 'In Progress'; // Sesuaikan tampilan tombol
    }

    // --- 2. UPDATE TAMPILAN TOMBOL ---
    statusTextSpan.textContent = displayStatusName;
    
    // Hapus class warna lama
    statusButton.classList.forEach(className => {
        if (className.startsWith('status-') && className !== 'status-btn') {
            statusButton.classList.remove(className);
        }
    });
    // Tambah class warna baru (ganti spasi jadi dash & lowercase)
    const newClass = 'status-' + displayStatusName.toLowerCase().replace(/\s+/g, '-');
    statusButton.classList.add(newClass);

    // --- 3. UPDATE DROPDOWN MENU ---
    const dropdownMenu = statusButton.nextElementSibling;
    if (dropdownMenu) {
        let newMenuHTML = '';
        
        // Logika Dropdown
        if (displayStatusName === 'Hold' || displayStatusName === 'Delivered') {
            // Perhatikan: data-status tetap dikirim sebagai 'Resume Progress' agar Controller menangkap logic-nya
            newMenuHTML += `<a class="dropdown-item status-action" href="#" data-id="${taskId}" data-status="Resume Progress"><i class="bi bi-play-circle"></i> Resume Progress</a>`;
        }

        if (displayStatusName !== 'Hold') {
            newMenuHTML += `<a class="dropdown-item status-action" href="#" data-id="${taskId}" data-status="Hold"><i class="bi bi-pause-circle"></i> Set to Hold</a>`;
        }

        if (displayStatusName !== 'Delivered') {
            newMenuHTML += `<a class="dropdown-item status-action" href="#" data-id="${taskId}" data-status="Delivered"><i class="bi bi-truck"></i> Set to Delivered</a>`;
        }
        
        // Pastikan opsi Done and Ready selalu ada jika belum Done
        if (displayStatusName !== 'Done and Ready' && displayStatusName !== 'Delivered') {
             newMenuHTML += `<a class="dropdown-item status-action" href="#" data-id="${taskId}" data-status="Done and Ready"><i class="bi bi-check-circle"></i> Set to Done</a>`;
        }

        dropdownMenu.innerHTML = newMenuHTML;
        

    }

    // --- 4. UPDATE TIME LEFT LIVE ---
    const timeLeftSpan = document.querySelector(`#time-left-${taskId}`);
    if (timeLeftSpan) {
        const deadlineString = timeLeftSpan.dataset.deadline; 
        const isDone = (displayStatusName === 'Done and Ready' || displayStatusName === 'Delivered');

        // Reset Class
        timeLeftSpan.className = 'timeClass'; // Hapus class warna, sisakan badge dasar (jika pakai bootstrap)

        if (isDone) {
            if (displayStatusName === 'Delivered') {
                const now = new Date();
                const options = { day: 'numeric', month: 'short', year: 'numeric' };
                const dateString = now.toLocaleDateString('en-GB', options); 
            
                timeLeftSpan.textContent = dateString; 
                timeLeftSpan.classList.add('time-delivered');
            } else {
                timeLeftSpan.textContent = "Selesai";
                timeLeftSpan.classList.add('time-completed');
            }
        } else if (deadlineString) {
            // Parsing Tanggal
            const deadline = new Date(deadlineString);
            const now = new Date();
            
            // Set jam ke 00:00:00 agar hitungan murni berdasarkan tanggal kalender
            deadline.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);

            const diffTime = deadline.getTime() - now.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays > 0) {
                timeLeftSpan.textContent = `${diffDays} hari lagi`;
                // Logic warna mendekati deadline (H-2)
                if (diffDays <= 2) {
                    timeLeftSpan.classList.add('time-mustdo');
                }
            } else if (diffDays === 0) {
                timeLeftSpan.textContent = 'Hari ini';
                timeLeftSpan.classList.add('time-mustdo');
            } else {
                timeLeftSpan.textContent = `Lewat ${Math.abs(diffDays)} hari`;
                timeLeftSpan.classList.add('time-late');
            }
        } else {
            timeLeftSpan.textContent = '-';
        }
    }

    // --- 5. KIRIM KE SERVER ---
    // Gunakan newStatusName (apa yang diklik user), controller yang akan handle mappingnya
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
            console.log(`Task ${taskId} updated successfully.`);
        } else {
            alert('Gagal update status: ' + result.message);
            // Opsional: Reload halaman jika gagal agar UI sinkron kembali
            // location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Terjadi kesalahan jaringan.');
    });
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



 function resetForm() {
    const popup = document.querySelector(".popup");
    const taskForm = popup.querySelector("#taskForm");
    
    // 1. Reset Input Standar (Text, Select)
    taskForm.reset();
    
    // 2. Hapus ID Editing (PENTING: Agar tidak dianggap update)
    delete taskForm.dataset.editingId;
    
    // 3. Reset Input Readonly (No Invoice)
    const noInvoiceInput = popup.querySelector("#noInvoice");
    noInvoiceInput.disabled = false;
    noInvoiceInput.style.backgroundColor = "";
    
    // 4. Bersihkan Line Pekerjaan (Hapus semua, lalu tambah 1 kosong)
    const lineContainer = popup.querySelector("#lineContainer");
    lineContainer.innerHTML = '';
    addLine(); 
    
    // 5. Bersihkan Mockup
    mockupFiles.clear();
    mockupsToDelete = [];
    document.querySelector("#mockup-preview-area").innerHTML = '';
    
    // 6. Reset Tabel Size ke Default
    const sizeTable = popup.querySelector("#sizeTable");
    const tHeadRow = sizeTable.querySelector("thead tr");
    const tBody = sizeTable.querySelector("tbody");
    const tFootRow = sizeTable.querySelector("tfoot tr");

    // Kembalikan Header Standar
    tHeadRow.innerHTML = `
        <th>Size</th>
        <th>Panjang</th>
        <th>Pendek</th>
        <th>Jumlah</th>
    `;
    
    // Kembalikan Body Kosong (1 Baris)
    tBody.innerHTML = `
        <tr>
            <td><input type="text" class="form-control" placeholder="Input size"></td>
            <td><input type="text" class="form-control quantity-input" placeholder="0"></td>
            <td><input type="text" class="form-control quantity-input" placeholder="0"></td>
            <td class="row-total">0</td>
        </tr>
    `;

    // Kembalikan Footer
    tFootRow.innerHTML = `
        <td>Total</td>
        <td class="column-total">0</td>
        <td class="column-total">0</td>
        <td class="grand-total">0</td>
    `;

    // 7. Hapus Pesan Error (Validasi)
    popup.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    popup.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
}



function populateForm(mainTask, allTasks, sizeData) {
    const popup = document.querySelector(".popup-overlay .popup");
    if (!popup) return;
    
    const taskForm = popup.querySelector("#taskForm");
    
    taskForm.dataset.editingId = mainTask.id; 

    const noInvoiceInput = popup.querySelector("#noInvoice");
    noInvoiceInput.value = mainTask.no_invoice;
    noInvoiceInput.disabled = true; 
    noInvoiceInput.style.backgroundColor = "#e9ecef"; 

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
        const line = (task.task_pekerjaans && task.task_pekerjaans.length > 0) ? task.task_pekerjaans[0] : null;
        
        if (!line) return; 
        addLine(); 
        const newLineDiv = lineContainer.lastElementChild; 
        
        // Isi input
        newLineDiv.querySelector(".line-nama").value = line.nama_pekerjaan;
        newLineDiv.querySelector(".line-deadline").value = line.deadline ? line.deadline.substring(0, 16) : '';

        // Isi checklists
        if (line.checklists) {
            line.checklists.forEach(check => {
                // 1. Klik tombol tambah checklist
                const addChecklistBtn = newLineDiv.querySelector(".addChecklist");
                addChecklist(addChecklistBtn);

                // 2. Cari container checklist yang baru saja dibuat
                const checklistContainer = newLineDiv.querySelector(".checklist-container");
                const newWidget = checklistContainer.lastElementChild; 

                if (newWidget) {
                    // 3. Cari input di dalam widget tersebut
                    const newCheckInput = newWidget.querySelector(".checklist-item");
                    
                    if (newCheckInput) {
                        newCheckInput.value = check.nama_checklist;
                        const status = (check.is_completed == 1 || check.is_completed === true) ? '1' : '0';
                        newCheckInput.dataset.isCompleted = status;
                    }
                }
            });
        }
    });

    // --- 4. Isi Tabel Size (Data dari mainTask) ---
    const sizeTable = popup.querySelector("#sizeTable");
    const tHeadRow = sizeTable.querySelector("thead tr");
    const tBody = sizeTable.querySelector("tbody");
    const tFootRow = sizeTable.querySelector("tfoot tr");
    
    // Reset konten tabel
    tHeadRow.innerHTML = ''; // Kosongkan header dulu
    tBody.innerHTML = ''; 
    tFootRow.innerHTML = '<td>Total</td>'; 

    const firstTh = document.createElement('th');
    firstTh.textContent = mainTask.size_title || 'Size'; 
    tHeadRow.appendChild(firstTh);

    sizeData.headers.forEach(header => {
        tHeadRow.innerHTML += `<th>${header}</th>`;
        tFootRow.innerHTML += `<td class="column-total">0</td>`;
    });
    
    tHeadRow.innerHTML += '<th>Jumlah</th>';
    tFootRow.innerHTML += '<td class="grand-total">0</td>';
    
    for (const jenis in sizeData.rows) {
        const rowData = sizeData.rows[jenis]; 
        
        insertSizeRow(sizeTable, tBody.lastElementChild); 
        
        const newTr = tBody.lastElementChild; 
        newTr.querySelector("td:first-child input").value = jenis;

        const qtyInputs = newTr.querySelectorAll('.quantity-input');
        sizeData.headers.forEach((header, index) => {
            const sizeInfo = rowData.find(s => s.tipe === header);
            const jumlah = sizeInfo ? sizeInfo.jumlah : 0;
            if (qtyInputs[index]) {
                qtyInputs[index].value = jumlah;
            }
        });
    }
    calculateTotals(); 

    // 5. Isi Mockup (Data dari mainTask) 
    if (mainTask.mockups) { 
        mainTask.mockups.forEach(mockup => {
            const fileName = mockup.file_path.split('/').pop();
            mockupFiles.set(fileName, { 
                 name: fileName, 
                 is_existing: true, 
                 path: mockup.file_path_url 
            }); 
        });
    }
    updateMockupPreview(); 
}

// --- FUNGSI DUPLICATE TASK ---
async function handleDuplicate(icon) {
    const taskId = icon.dataset.id;
    if (!taskId) {
        alert("Task ID tidak ditemukan untuk duplicate!");
        return;
    }

    const preloader = document.getElementById('page-preloader');
    if (preloader) preloader.classList.remove('loaded');

    try {
        // 1. Ambil data task asli
        const response = await fetch(`/task/edit/${taskId}`);
        if (!response.ok) throw new Error("Gagal mengambil data task untuk duplicate.");

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.message || "Gagal memuat data duplicate.");
        }

        // 2. Tampilkan popup (segar)
        showPopup();

        // 3. Isi form seperti edit
        populateForm(result.task, result.allTasks, result.sizeData);    

        // 4. UBAH NO INVOICE menjadi duplikat
        const newInvoice = generateDuplicateInvoice(result.task.no_invoice);
        const invoiceInput = document.querySelector("#noInvoice");

        invoiceInput.value = newInvoice;
        invoiceInput.disabled = false; 
        invoiceInput.style.backgroundColor = ""; 

        // 5. Pastikan form dianggap "CREATE", bukan edit
        const taskForm = document.querySelector("#taskForm");
        delete taskForm.dataset.editingId;  

        showNotif("Task berhasil disalin. Silakan perbarui sebelum menyimpan.");

    } catch (error) {
        console.error("Error Duplicate:", error);
        alert(error.message);
    } finally {
        if (preloader) preloader.classList.add('loaded');
    }
}

function generateDuplicateInvoice(original) {
    // Jika belum ada "-angka" → tambahkan "-1"
    if (!original.match(/-\d+$/)) {
        return original + "-1";
    }

    // Jika sudah ada, tingkatkan angkanya
    return original.replace(/-(\d+)$/, (_, num) => `-${parseInt(num) + 1}`);
}


//  function handleDelete(icon) {
//     const row = icon.closest('tr');
//     const taskId = icon.dataset.id;
    
//     if (!taskId || !row) {
//         alert('Error: Task ID tidak ditemukan.');
//         return;
//     }
    
//     const taskName = row.querySelector('td:nth-child(2)')?.textContent || 'task ini'; 
    
//     if (confirm(`Apakah Anda yakin ingin menghapus task: "${taskName}"?`)) {
        
//         const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

//         fetch(`/task/delete/${taskId}`, {
//             method: 'DELETE',
//             headers: {
//                 'X-CSRF-TOKEN': csrfToken,
//                 'Accept': 'application/json'
//             }
//         })
//         .then(response => response.json())
//         .then(result => {
//             if (result.success) {
//                 row.remove();
//                 showNotif(result.message || 'Task berhasil dihapus.');
//             } else {
//                 alert('Gagal menghapus task: ' + result.message);
//             }
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             alert('Terjadi kesalahan. Gagal menghapus task.');
//         });
//     }
// }




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
function showPopup() {
    const overlay = document.querySelector(".popup-overlay");
    if (!overlay) return;

    // 1. Ambil referensi ke popup
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

    let mockupsToDelete = [];

    // Reset dataset editing jika ada sisa
    if (taskForm && taskForm.dataset.editingId) {
        delete taskForm.dataset.editingId;
    }

    // Listener Tombol
    if (addLineBtn) {
        addLineBtn.onclick = (e) => { e.preventDefault(); addLine(); };
    } else { console.error("Tombol #addLine tidak ditemukan!"); }

    if (cancelBtn) {
        cancelBtn.onclick = () => { 
            overlay.style.display = "none"; 
            resetForm();
        };
    }

    if (addSizeRowBtn) {
        addSizeRowBtn.onclick = (e) => {
            e.preventDefault();
            const lastRow = popup.querySelector("#sizeTable tbody tr:last-child");
            insertSizeRow(sizeTable, lastRow || sizeTable.querySelector('tbody'));
        };
    }

    // Listener Mockup Input
    if (mockupInput) {
        mockupInput.onchange = () => {
            if (mockupInput.files.length > 0) {
                const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
                for (const file of mockupInput.files) {
                    if (!validTypes.includes(file.type)) {
                        alert(`File "${file.name}" bukan gambar yang didukung!`);
                        continue;
                    }
                    if (file.size > 5 * 1024 * 1024) {
                        alert(`File "${file.name}" terlalu besar! Maksimal 5MB.`);
                        continue;
                    }
                    mockupFiles.set(file.name, file);
                }
                updateMockupPreview();
                mockupInput.value = ''; 
            }
        };
    }
    
    // Listener Mockup Preview (Hapus)
    if (previewArea) {
        previewArea.onclick = (event) => { 
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

    // ============================================================
    // ▼▼▼ LOGIKA SUBMIT FORM (BARU) ▼▼▼
    // ============================================================
    if (taskForm) {
        taskForm.onsubmit = async (e) => { 
            e.preventDefault();
            const submitBtn = taskForm.querySelector('button[type="submit"]');
            const loadingOverlay = popup.querySelector('.loading-overlay');
            
            // Bersihkan error lama
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
                
                // Append Data Standar
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
                
                // Append Data Kompleks (Lines & Sizes)
                const lineData = getLineData(popup);
                const sizeData = getSizeTableData(popup);
                formData.append('lines', JSON.stringify(lineData));
                formData.append('sizes', JSON.stringify(sizeData));
                
                // Append Mockups
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
                
                // Tentukan URL (Edit atau Store)
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
                
                // --- SUKSES ---
                showNotif(result.message || "Aksi berhasil!");

                // [UPDATE] Logika: Reload jika Edit, Update Tabel jika Baru
                if (editingId) {
                    // KASUS EDIT: Refresh halaman (aman untuk update relasi kompleks)
                    setTimeout(() => { location.reload(); }, 1000);
                } else {
                    // KASUS CREATE: Update tabel tanpa refresh (Instant)
                    
                    // 1. Tutup Popup
                    overlay.style.display = "none";
                    
                    // 2. Reset Form
                    resetForm();

                    // 3. Masukkan Task Baru ke Tabel
                    if (result.tasks && result.tasks.length > 0) {
                        // Loop array tasks (jaga-jaga jika split task)
                        result.tasks.forEach(task => {
                            addTaskToTable(task); 
                        });
                    }

                    // 4. Reset Button & Loading (Karena halaman tidak direfresh)
                    if (loadingOverlay) loadingOverlay.style.display = 'none';
                    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
                }
                
            } catch (error) {
                console.error('Error saat submit:', error);
                alert(`Gagal: ${error.message}`); 
                // Reset button jika error
                if (loadingOverlay) loadingOverlay.style.display = 'none';
                if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Submit'; }
            } 
        };
    }

    // ============================================================
    // ▼▼▼ LOGIKA INTERFACE LAINNYA (Table, Context Menu) ▼▼▼
    // ============================================================
    
    // LOGIKA KLIK KANAN (CONTEXT MENU)
    if (sizeTable && contextMenu) {
        sizeTable.oncontextmenu = (e) => {
            e.preventDefault(); 
            clickedCell = e.target.closest('td, th');
            if (!clickedCell) return;
            contextMenu.style.top = `${e.clientY}px`;
            contextMenu.style.left = `${e.clientX}px`;
            contextMenu.classList.add("show");
        };
        window.addEventListener('click', () => {
             if (contextMenu.classList.contains("show")) contextMenu.classList.remove("show");
        });
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
        };
    }

    // LISTENER HEADER & UNDO
    if (sizeTableHead) {
        sizeTableHead.ondblclick = (event) => {
            const thTarget = event.target.closest('th');
            if (thTarget) handleHeaderDoubleClick(thTarget);
        };
    }
    popup.onkeydown = (event) => {
        if ((event.ctrlKey || event.metaKey) && event.key === 'z') {
            event.preventDefault(); undoLastAction();
        }
    };
    if (sizeTableBody) {
        sizeTableBody.oninput = (event) => {
            if (event.target.classList.contains('quantity-input')) calculateTotals();
        };
    }

    // ============================================================
    // ▼▼▼ LOGIKA LINE CONTAINER (Dropdown & Autocomplete) ▼▼▼
    // ============================================================
    // Ini bagian yang tadi hilang, sekarang sudah dikembalikan UTUH.
    
    const lineContainerArea = popup.querySelector("#lineContainer");
    if (lineContainerArea) {
        
        // 1. LISTENER KLIK (Event Delegation)
        lineContainerArea.onclick = async (event) => {
            const target = event.target;

            // A. Hapus Line
            const removeLineBtn = target.closest('.btn-remove-line');
            if (removeLineBtn) { 
                event.preventDefault(); 
                removeLineBtn.closest('.border.p-3.mb-3.rounded')?.remove(); 
                updateLineNumbers(); 
            }

            // B. Tambah Checklist
            const addChecklistLink = target.closest('.addChecklist');
            if (addChecklistLink) { 
                event.preventDefault(); 
                addChecklist(addChecklistLink); 
            }

            // C. Hapus Checklist
            const removeChecklistBtn = target.closest('.btn-remove-checklist'); 
            if (removeChecklistBtn) { 
                event.preventDefault(); 
                removeChecklistBtn.closest('.d-flex.gap-2.mb-2')?.remove(); 
            }

            // D. TOGGLE BUTTON (DROPDOWN)
            const toggleBtn = target.closest('.toggle-search-btn');
            if (toggleBtn) {
                event.preventDefault(); 
                
                const wrapper = toggleBtn.closest('.position-relative');
                const input = wrapper.querySelector('input');
                const resultsContainer = wrapper.querySelector('.autocomplete-results');
                
                // Toggle: Kalau sudah buka, tutup.
                if (resultsContainer.innerHTML.trim() !== '') {
                    resultsContainer.innerHTML = '';
                    return;
                }

                // Kalau tutup, ambil data (Trigger fetch)
                try {
                    let url = '';
                    if (input.classList.contains('line-nama')) {
                        url = `/pekerjaan/search?query=`; 
                    } else {
                        url = `/checklists/search?query=`;
                    }

                    const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
                    const data = await response.json();

                    let html = '';
                    if (data.length === 0) {
                        html = '<div class="p-2 text-muted small">Tidak ada data.</div>';
                    } else {
                        data.forEach(item => {
                            if (input.classList.contains('line-nama')) {
                                html += `<div class="autocomplete-item">${item.nama_pekerjaan}</div>`;
                            } else {
                                const itemsJson = JSON.stringify(item.items || []).replace(/"/g, '&quot;');
                                let subInfo = (item.items && item.items.length > 0) ? 
                                    `<small class="text-muted d-block" style="font-size:10px;">Isi: ${item.items.map(i => i.name).join(', ')}</small>` : '';
                                html += `<div class="autocomplete-item" data-items="${itemsJson}"><strong>${item.name}</strong>${subInfo}</div>`;
                            }
                        });
                    }
                    resultsContainer.innerHTML = html;
                    input.focus(); 

                } catch (error) {
                    console.error('Gagal load dropdown:', error);
                }
            }

            // E. KLIK ITEM AUTOCOMPLETE
            const resultItem = target.closest('.autocomplete-item');
            if (resultItem) {
                const wrapper = resultItem.closest('.position-relative');
                const inputField = wrapper.querySelector('input');
                const resultsContainer = wrapper.querySelector('.autocomplete-results');

                if (inputField.classList.contains('line-nama')) {
                    // Kasus Nama Pekerjaan
                    inputField.value = resultItem.textContent.trim();
                    resultsContainer.innerHTML = '';
                
                } else if (inputField.classList.contains('checklist-item')) {
                    // Kasus Checklist (Bisa Grup)
                    const itemsData = JSON.parse(resultItem.dataset.items || '[]');
                    
                    if (itemsData.length > 0) {
                        // Pecah jadi banyak input
                        const checklistContainer = wrapper.closest('.checklist-container');
                        const currentWidget = wrapper.closest('.d-flex'); 

                        itemsData.forEach(item => {
                            const newWidget = document.createElement("div");
                            newWidget.className = "d-flex gap-2 mb-2 align-items-center checklist-row"; // Tambah checklist-row
                            newWidget.innerHTML = `
                                 <i class="bi bi-grip-vertical checklist-drag-handle"></i>
                                 <div class="position-relative input-with-toggle" style="flex-grow: 1;">
                                    <input type="search" class="form-control checklist-item" value="${item.name}">
                                    <button class="toggle-search-btn" type="button"><i class="bi bi-chevron-down"></i></button>
                                    <div class="autocomplete-results checklist-results"></div>
                                 </div>
                                 <span class="btn-remove-checklist text-danger" style="cursor:pointer;"><i class="bi bi-x-lg"></i></span>
                            `;
                            checklistContainer.insertBefore(newWidget, currentWidget);
                        });
                        currentWidget.remove(); // Hapus input awal

                    } else {
                        // Single Item
                        const nameText = resultItem.querySelector('strong') ? resultItem.querySelector('strong').textContent : resultItem.textContent;
                        inputField.value = nameText.trim(); 
                        resultsContainer.innerHTML = '';
                    }
                }
            }
        };

        // 2. LISTENER KEYBOARD (Autocomplete Search)
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

        // 3. LISTENER FOCUS OUT
        lineContainerArea.onfocusout = (event) => {
             if (event.target.classList.contains('checklist-item') || event.target.classList.contains('line-nama')) {
                 setTimeout(() => {
                    const results = event.target.parentElement.querySelector('.autocomplete-results');
                    if(results) results.innerHTML = '';
                 }, 200); 
             }
        };
    }

    // Inisialisasi Awal Popup
    calculateTotals();
    actionHistory = [];
    mockupFiles.clear();
    mockupsToDelete = [];
    updateMockupPreview();

    // TAMPILKAN POP-UP
    overlay.style.display = "block";
}

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

    const checklistContainer = lineDiv.querySelector(".checklist-container");
    
    initSortableChecklist(checklistContainer);
    updateLineNumbers();
}

function updateLineNumbers() {
    const container = document.querySelector("#lineContainer");
    if (!container) return;
    
    const lines = container.querySelectorAll(".border.p-3.mb-3.rounded");
    
    lines.forEach((line, index) => {
        const title = line.querySelector(".line-title");
        if (title) {
            title.textContent = `Line ${index + 1}`;
        }
    });
}



function addTaskToTable(task) {
    const mainTableBody = document.querySelector(".task table tbody");
    if (!mainTableBody) return;

    const emptyRow = mainTableBody.querySelector('tr td.text-center');
    if (emptyRow && emptyRow.textContent.includes('Belum ada task')) {
        emptyRow.closest('tr').remove();
    }

    fetch(`/task/get-row/${task.id}`)
        .then(response => {
            if (!response.ok) throw new Error("Gagal mengambil HTML task");
            return response.json();
        })
        .then(data => {
            if (data.html) {
                mainTableBody.insertAdjacentHTML('beforeend', data.html);
                const newRow = mainTableBody.firstElementChild;

                newRow.style.backgroundColor = '#fff3cd'; 
                newRow.style.transition = 'background-color 1.5s ease';
                
                if (typeof initGalleryIndicator === 'function') {
                    initGalleryIndicator(newRow);
                }

                setTimeout(() => {
                    newRow.style.backgroundColor = 'transparent';
                }, 1500);
            }
        })
        .catch(error => console.error("Error adding task row:", error));
}


 function addChecklist(button) {
    const checklistContainer = button.previousElementSibling; 
    if (!checklistContainer) return;
    
    const checklistWidget = document.createElement("div");
    checklistWidget.className = "d-flex gap-2 mb-2 align-items-center"; 

    // 1. Icon Drag Handle
    const dragHandle = document.createElement("i");
    dragHandle.className = "bi bi-grip-vertical checklist-drag-handle";

    // 2. Wrapper Input
    const inputWrapper = document.createElement("div");
    inputWrapper.className = "position-relative input-with-toggle"; 
    inputWrapper.style.flexGrow = "1"; 

    // 3. Input 
    const checklistInput = document.createElement("input");
    checklistInput.type = "search";
    checklistInput.className = "form-control checklist-item";
    checklistInput.placeholder = "Ketik untuk mencari checklist...";
    
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "toggle-search-btn"; 
    toggleBtn.type = "button";
    toggleBtn.innerHTML = '<i class="bi bi-chevron-down"></i>';


    // 4. Container Hasil
    const resultsContainer = document.createElement("div");
    resultsContainer.className = "autocomplete-results checklist-results";

    // 5. Tombol Hapus (X)
    const deleteBtn = document.createElement("span"); 
    deleteBtn.className = "btn-remove-checklist"; 
    deleteBtn.innerHTML = 'x';
    
    // Rakit elemen (JANGAN LUPA appendChild toggleBtn)
    inputWrapper.appendChild(checklistInput);
    inputWrapper.appendChild(toggleBtn); 
    inputWrapper.appendChild(resultsContainer);

    checklistWidget.appendChild(dragHandle);
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
    const newStatusName = clickedItem.dataset.status; // "Hold", "Delivered", atau "Resume Progress"
    const dropdown = clickedItem.closest('.dropdown');
    if (!dropdown) return;
    
    const statusButton = dropdown.querySelector('.dropdown-toggle');
    const taskId = statusButton.dataset.taskId; // Pastikan ID Task diambil dengan benar

    // === LOGIKA RESUME (PENTING) ===
    if (newStatusName === 'Resume Progress') {
        
        let percentage = 0; // Default 0 jika tidak ketemu
        
        // 1. Cari baris tabel (tr) tempat tombol ini berada
        const row = statusButton.closest('tr');
        
        if (row) {
 
            const progressTextEl = row.querySelector('.progress-text');
            
            if (progressTextEl) {
                // Ambil angkanya saja (parseInt membuang simbol %)
                percentage = parseInt(progressTextEl.textContent, 10);
            }
        }

        // 3. Tentukan status baru berdasarkan persentase yang ditemukan
        let autoStatusName = 'Needs Work'; // Default (0%)
        
        if (percentage === 100) {
            autoStatusName = 'Done and Ready';
        } else if (percentage > 0) {
            autoStatusName = 'In Progress';
        }
        
        console.log(`Resuming Task ${taskId}: Progress ${percentage}% -> Status ${autoStatusName}`);

        // 4. Update status ke hasil hitungan (BUKAN "Resume Progress")
        updateTaskStatus(taskId, autoStatusName);
    
    } else {

        updateTaskStatus(taskId, newStatusName);
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
if (addBtn) {
    addBtn.addEventListener("click", () => {
        resetForm(); 
        showPopup();
    });
}

// Inisialisasi progress bar & galeri untuk baris yang sudah ada
document.querySelectorAll('.task table tbody tr').forEach(row => {
    const progressButton = row.querySelector('.dropdown-toggle.progress');
    if (progressButton) {
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
  
  if (searchInput && mainTableBody) {
      
      searchInput.addEventListener("input", function() {
          
          const searchTerm = searchInput.value.toLowerCase();
          
          const rows = mainTableBody.querySelectorAll("tr");

          rows.forEach(row => {
              const rowText = row.textContent.toLowerCase();
              
              if (rowText.includes(searchTerm)) {
                  row.style.display = ""; 
              } else {
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
  const bulkExportBtn = document.getElementById('bulkExportBtn');



  function updateBulkActionBar() {
      const selectedCount = document.querySelectorAll('.row-checkbox:checked').length;
      
      if (selectedCount > 0) {
          if(bulkActionBar) bulkActionBar.style.display = 'flex';
          if(bulkSelectCount) bulkSelectCount.textContent = `${selectedCount} Task terpilih`;
      } else {
          if(bulkActionBar) bulkActionBar.style.display = 'none';
      }
      
      if(selectAllCheckbox) {
          selectAllCheckbox.checked = (selectedCount > 0 && selectedCount === rowCheckboxes.length);
          selectAllCheckbox.indeterminate = (selectedCount > 0 && selectedCount < rowCheckboxes.length);
      }
  }



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
              showNotif(result.message);
              location.reload(); 
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

  // Listener untuk tombol "Excel (import)"
  if (bulkExportBtn) {
    bulkExportBtn.addEventListener('click', () => {
        const selectedIds = Array.from(document.querySelectorAll('.row-checkbox:checked'))
                                 .map(cb => cb.dataset.id);
        
        if (selectedIds.length === 0) {
            alert('Pilih minimal satu task untuk diexport!');
            return;
        }


        const url = `/task/export?ids=${selectedIds.join(',')}`;
        window.location.href = url;
    });
}
  

// 3. Listener untuk KLIK (click) - GABUNGAN SEMUA DELEGASI
document.body.addEventListener('click', function(event) {
    const target = event.target;
    
    if (target.closest('.popup-overlay')) return; 


    if (target.closest('.icon-edit')) {
        event.preventDefault();
        handleEdit(target.closest('.icon-edit')); 
        return; 
    }
    if (target.closest('.icon-download')) {
        event.preventDefault();
        handlePrint(target.closest('.icon-download')); 
        return; 
    }
    if (target.classList.contains('icon-duplicate')) {
        event.preventDefault();
        handleDuplicate(target);
        return;
        }


    if (target.closest('.mockup-wrapper') || 
        target.closest('.dropdown-toggle') || 
        target.closest('.dropdown-menu') || 
        target.closest('.line-btn') || 
        target.closest('input') ||           
        target.closest('label') ||           
        target.closest('.select-col')) {     
        
        
        const wrapper = target.closest('.mockup-wrapper');
        if (wrapper) {
            event.preventDefault();
            openImageModal(wrapper);
        }
        
    const statusItem = target.closest('.dropdown-item[data-status]');
    if (statusItem) {
        event.preventDefault();
        
        if (statusItem.dataset.id) {
            const taskId = statusItem.dataset.id;
            const newStatus = statusItem.dataset.status;
            updateTaskStatus(taskId, newStatus);
        } 
        else {
            handleStatusChange(statusItem);
        }
    }

        return; 
    }

    const row = target.closest('tr.clickable-row');
    if (row) {
        const url = row.dataset.url;
        if (url) {
            window.location.href = url; 
        }
    }
});


}); // END DOC
