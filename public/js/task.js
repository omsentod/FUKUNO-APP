document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const notif = document.getElementById("notif");
  const tableBody = document.querySelector("tbody");

  // ==============================
  // POPUP FORM
  // ==============================
  function showPopup(title, currentTask = {}, onSubmit) {
    const overlay = document.createElement("div");
    overlay.classList.add("popup-overlay");

    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.style.maxWidth = "850px";
    popup.style.width = "95%";
    popup.style.maxHeight = "90vh";
    popup.style.overflowY = "auto";

    popup.innerHTML = `
      <h5 class="mb-3">${title}</h5>
      <form id="taskForm">

        <div class="mb-2">
          <label>No Invoice</label>
          <input type="text" id="noInvoice" class="form-control" placeholder="No. Invoice" value="${currentTask.noInvoice || ''}" required>
        </div>

        <div class="mb-2">
          <label>Nama Pelanggan</label>
          <input type="text" id="namaPelanggan" class="form-control" placeholder="Nama Pelanggan" value="${currentTask.namaPelanggan || ''}" required>
        </div>

        <div class="mb-2">
          <label>Judul</label>
          <input type="text" id="judul" class="form-control" placeholder="Judul" value="${currentTask.judul || ''}" required>
        </div>

        <div class="mb-2">
          <label>Catatan</label>
          <textarea id="catatan" class="form-control" placeholder="Catatan" rows="3">${currentTask.catatan || ''}</textarea>
        </div>

        <div class="row mb-3">
          <div class="col-md-6">
            <label>Penanggung Jawab</label>
            <select id="penanggungJawab" class="form-select">
              <option value="">-- Pilih Penanggung Jawab --</option>
              <option value="Raka">Raka</option>
              <option value="Tito">Tito</option>
              <option value="Arya">Arya</option>
            </select>
          </div>
          <div class="col-md-6">
            <label>Urgensi</label>
            <select id="urgensi" class="form-select">
              <option value="">Pilih</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Sedang">Sedang</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>
        </div>

        <hr>

        <h6>Line Pekerjaan & Checklist</h6>
        <a href="#" id="addLine" class="text-primary small mb-2 d-inline-block">+ Tambah Line Pekerjaan</a>
        <div id="lineContainer"></div>

        <hr>

        <h6>Jenis & Size</h6>
        <table class="table table-bordered text-center align-middle" id="sizeTable">
          <thead class="table-danger">
            <tr>
              <th>Jenis Size</th>
              <th>Size</th>
              <th>Jumlah</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><input type="text" class="form-control" placeholder="Jenis" value="Baju Anak"></td>
              <td><input type="text" class="form-control" placeholder="Size" value="L"></td>
              <td><input type="text" class="form-control" placeholder="Jumlah" value="10 Pcs"></td>
              <td><button type="button" class="btn btn-danger btn-sm btn-remove">Hapus</button></td>
            </tr>
          </tbody>
        </table>
        <a href="#" id="addRow" class="text-primary small mb-2 d-inline-block">+ Tambah Kolom</a>

        <div class="mb-2">
          <label>Jumlah</label>
          <input type="text" id="jumlah" class="form-control" value="${currentTask.jumlah || ''}">
        </div>

        <div class="row mb-2">
          <div class="col-md-6">
            <label>Warna</label>
            <input type="text" id="warna" class="form-control" value="${currentTask.warna || ''}">
          </div>
          <div class="col-md-6">
            <label>Model</label>
            <input type="text" id="model" class="form-control" value="${currentTask.model || ''}">
          </div>
        </div>

        <div class="mb-2">
          <label>Bahan</label>
          <input type="text" id="bahan" class="form-control" value="${currentTask.bahan || ''}">
        </div>

        <div class="mb-3">
          <label>Mockup</label>
          <input type="file" id="mockup" class="form-control">
        </div>

        <div class="d-flex justify-content-end gap-2">
          <button type="button" class="btn btn-secondary" id="cancelBtn">Cancel</button>
          <button type="submit" class="btn btn-primary">Submit</button>
        </div>

      </form>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    const lineContainer = popup.querySelector("#lineContainer");
    let lineCount = 0;

    function addLine() {
      lineCount++;
      const lineDiv = document.createElement("div");
      lineDiv.classList.add("border", "p-3", "mb-3", "rounded");

      lineDiv.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-2">
          <strong class="line-title">Line ${lineCount}</strong>
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

    // fungsi untuk mengurutkan ulang nomor line
    function reorderLines() {
      const lines = lineContainer.querySelectorAll(".border");
      lines.forEach((line, index) => {
        const title = line.querySelector(".line-title");
        title.textContent = `Line ${index + 1}`;
      });
      lineCount = lines.length;
    }

    addLine();

    popup.querySelector("#addLine").addEventListener("click", (e) => {
      e.preventDefault();
      addLine();
    });

    popup.addEventListener("click", (e) => {
      if (e.target.classList.contains("addChecklist")) {
        e.preventDefault();
        const checklistContainer = e.target.previousElementSibling;
        const checklistInput = document.createElement("input");
        checklistInput.type = "text";
        checklistInput.className = "form-control mb-2 checklist-item";
        checklistInput.placeholder = "Nama checklist...";
        checklistContainer.appendChild(checklistInput);
      }

      if (e.target.classList.contains("btn-remove-line")) {
        e.preventDefault();
        e.target.closest(".border").remove();
        reorderLines(); // panggil fungsi urut ulang setelah hapus line
      }

      if (e.target.classList.contains("btn-remove")) {
        e.preventDefault();
        e.target.closest("tr").remove();
      }
    });

    popup.querySelector("#cancelBtn").addEventListener("click", () => {
      document.body.removeChild(overlay);
    });

    popup.querySelector("#taskForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        noInvoice: popup.querySelector("#noInvoice").value,
        namaPelanggan: popup.querySelector("#namaPelanggan").value,
        judul: popup.querySelector("#judul").value,
        catatan: popup.querySelector("#catatan").value,
        penanggungJawab: popup.querySelector("#penanggungJawab").value,
        urgensi: popup.querySelector("#urgensi").value,
        jumlah: popup.querySelector("#jumlah").value,
        warna: popup.querySelector("#warna").value,
        model: popup.querySelector("#model").value,
        bahan: popup.querySelector("#bahan").value,
      };
      onSubmit(data);
      document.body.removeChild(overlay);
      showNotif("Task berhasil disimpan!");
    });
  }

  // ==============================
  // NOTIFIKASI
  // ==============================
  function showNotif(text) {
    if (!notif) return;
    notif.textContent = text;
    notif.style.display = "block";
    setTimeout(() => (notif.style.display = "none"), 2500);
  }

  // ==============================
  // ADD NEW TASK
  // ==============================
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      showPopup("Tambah Task Baru", {}, (data) => {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td>${data.noInvoice}</td>
          <td>${data.namaPelanggan}</td>
          <td>${data.judul}</td>
          <td>${data.penanggungJawab || '-'}</td>
          <td>${data.urgensi || 'Normal'}</td>
          <td class="icon-cell">
            <i class="bi bi-pencil-square text-warning icon-edit"></i>
            <i class="bi bi-trash3-fill text-danger icon-trash"></i>
          </td>
        `;
        tableBody.appendChild(newRow);
      });
    });
  }
});
