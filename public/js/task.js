document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.getElementById("addBtn");
    const notif = document.getElementById("notif");
    const tableBody = document.querySelector("tbody");
  
    // Menampilkan pop-up statis
    function showPopup() {
        const overlay = document.querySelector(".popup-overlay");
        const popup = overlay.querySelector(".popup");
  
        // Tampilkan pop-up
        overlay.style.display = "block";
  
        // Menambahkan event listener untuk tombol "Tambah Line"
        const addLineBtn = popup.querySelector("#addLine");
        addLineBtn.addEventListener("click", (e) => {
            e.preventDefault();
            addLine();  // Fungsi untuk menambahkan line pekerjaan
        });
  
        // Menambahkan event listener untuk tombol "Tambah Kolom"
        const addRowBtn = popup.querySelector("#addRow");
        addRowBtn.addEventListener("click", (e) => {
            e.preventDefault();
            addRow();  // Fungsi untuk menambahkan kolom size baru
        });
  
        // Menambahkan event listener untuk tombol "Tambah Checklist"
        const addChecklistBtns = popup.querySelectorAll(".addChecklist");
        addChecklistBtns.forEach((btn) => {
          btn.addEventListener("click", (e) => {
              e.preventDefault();
              addChecklist(e.target);  // Menambahkan checklist pada line yang sesuai
          });
        });
  
        // Menutup pop-up ketika klik tombol Cancel
        popup.querySelector("#cancelBtn").addEventListener("click", () => {
            overlay.style.display = "none";
        });
  
        // Form Submission
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
            // Logic untuk submit task, contoh menyimpan data
            showNotif("Task berhasil disimpan!");
            overlay.style.display = "none"; // Close popup
        });
    }
  
    // Fungsi untuk menambah line pekerjaan
    function addLine() {
        const lineContainer = document.querySelector("#lineContainer");
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
        
        // Tambahkan event listener untuk tombol tambah checklist
        const addChecklistBtn = lineDiv.querySelector(".addChecklist");
        addChecklistBtn.addEventListener("click", (e) => {
          e.preventDefault();
          addChecklist(e.target);  // Menambahkan checklist pada line yang sesuai
        });
    }
  
    // Fungsi untuk menambah checklist di dalam line
    function addChecklist(button) {
        const checklistContainer = button.previousElementSibling;  // Menyasar container checklist di line tersebut
        const checklistInput = document.createElement("input");
        checklistInput.type = "text";
        checklistInput.className = "form-control mb-2 checklist-item";
        checklistInput.placeholder = "Nama checklist...";
        checklistContainer.appendChild(checklistInput);
    }
  
    // Fungsi untuk menambah kolom size
    function addRow() {
        const sizeTableBody = document.querySelector("#sizeTable tbody");
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="text" class="form-control" placeholder="Jenis" value="Baju Anak"></td>
            <td><input type="text" class="form-control" placeholder="Size" value="L"></td>
            <td><input type="text" class="form-control" placeholder="Jumlah" value="10 Pcs"></td>
            <td><button type="button" class="btn btn-danger btn-sm btn-remove">Hapus</button></td>
        `;
        sizeTableBody.appendChild(newRow);
    }
  
    // Menampilkan notifikasi
    function showNotif(text) {
        if (!notif) return;
        notif.textContent = text;
        notif.style.display = "block";
        setTimeout(() => (notif.style.display = "none"), 2500);
    }
  
    // Tombol tambah task
    if (addBtn) {
        addBtn.addEventListener("click", showPopup);
    }
  });
  