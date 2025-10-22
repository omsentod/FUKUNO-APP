document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".btn-add");
    const tableBody = document.getElementById("tableBody");

    // ADD NEW (tampilkan popup untuk tambah pekerjaan)
    addBtn.addEventListener("click", () => {
        showPopup("Tambah Line Pekerjaan", "", (nama) => {
            if (nama.trim() === "") {
                alert("Nama line pekerjaan wajib diisi!");
                return;
            }

            // Buat form untuk submit ke Laravel
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/pekerjaan"; // rute untuk menyimpan pekerjaan
            form.innerHTML = `
                <input type="hidden" name="_token" value="${document.querySelector('meta[name=csrf-token]').content}">
                <input type="text" name="nama_pekerjaan" value="${nama}">
                <button type="submit">Simpan</button>
            `;
            document.body.appendChild(form);
            form.submit(); // kirim ke controller
        });
    });

    // Tambahkan event edit/delete ke setiap baris pekerjaan
    document.querySelectorAll("#tableBody tr").forEach(row => attachActions(row));
});

// === FUNCTION: Tampilkan popup form tambah/edit ===
function showPopup(title, currentName, onSubmit) {
    const overlay = document.createElement("div");
    overlay.classList.add("popup-overlay");

    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerHTML = `
      <h5>${title}</h5>
      <input type="text" id="nama_pekerjaan" placeholder="Nama line pekerjaan" value="${currentName}">
      <div style="text-align: right;">
        <button type="button" class="btn btn-secondary" id="cancelBtn">Batal</button>
        <button type="button" class="simpan-btn" id="saveBtn">Simpan</button>
      </div>
    `;

    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    const namaField = popup.querySelector("#nama_pekerjaan");

    // Cancel button
    popup.querySelector("#cancelBtn").addEventListener("click", () => {
        document.body.removeChild(overlay);
    });

    // Save button
    popup.querySelector("#saveBtn").addEventListener("click", () => {
        const namaInput = namaField.value.trim();
        if (namaInput === "") {
            alert("Nama line pekerjaan wajib diisi!");
            return;
        }
        onSubmit(namaInput);
        document.body.removeChild(overlay);
    });
}

// === FUNCTION: Attach Edit & Delete Action ===
function attachActions(row) {
    const editBtn = row.querySelector(".edit");
    const deleteBtn = row.querySelector(".delete");

    // Edit action (tampilkan popup untuk edit pekerjaan)
    editBtn.addEventListener("click", () => {
        const namaSekarang = row.children[1].textContent.trim();
        showPopup("Edit Line Pekerjaan", namaSekarang, (namaBaru) => {
            // Update table sementara
            row.children[1].textContent = namaBaru;

            // Buat form untuk submit update ke Laravel
            const form = document.createElement("form");
            form.method = "POST";
            form.action = `/pekerjaan/${row.children[0].textContent}`;
            form.innerHTML = `
                <input type="hidden" name="_method" value="PUT">
                <input type="hidden" name="_token" value="${document.querySelector('meta[name=csrf-token]').content}">
                <input type="text" name="nama_pekerjaan" value="${namaBaru}">
                <button type="submit">Simpan</button>
            `;
            document.body.appendChild(form);
            form.submit(); // kirim form update
        });
    });

    // Delete action (hapus pekerjaan)
    deleteBtn.addEventListener("click", () => {
        if (confirm("Apakah kamu yakin ingin menghapus line pekerjaan ini?")) {
            const rowId = row.children[0].textContent;

            // Buat form untuk submit delete ke Laravel
            const form = document.createElement("form");
            form.method = "POST";
            form.action = `/pekerjaan/${rowId}`;
            form.innerHTML = `
                <input type="hidden" name="_method" value="DELETE">
                <input type="hidden" name="_token" value="${document.querySelector('meta[name=csrf-token]').content}">
                <button type="submit">Hapus</button>
            `;
            document.body.appendChild(form);
            form.submit(); // kirim form delete
        }
    });
}

// === FUNCTION: Notifikasi kecil (Toast) ===
function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000); // Hapus setelah 3 detik
}