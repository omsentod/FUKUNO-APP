document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".btn-add");
    const popupForm = document.getElementById("popupForm");
    const closePopupBtn = document.getElementById("closePopup");
    const form = document.getElementById("pekerjaanForm");
    const tableBody = document.getElementById("tableBody");

    // Cek apakah CSRF token ada
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (!csrfToken) {
        console.error("CSRF token tidak ditemukan. Pastikan meta tag ada di <head>.");
        alert("Konfigurasi CSRF token tidak ditemukan. Hubungi admin.");
        return;
    }

    // Tampilkan popup saat tombol "Add new" diklik
    addBtn.addEventListener("click", () => {
        popupForm.style.display = "block";
        form.reset(); // Reset input form
        form.action = "{{ route('pekerjaan.store') }}"; // Pastikan action untuk tambah
        form.querySelector('input[name="_method"]')?.remove(); // Hapus _method jika ada (untuk edit)
    });

    // Tutup popup saat tombol "Batal" diklik
    closePopupBtn.addEventListener("click", () => {
        popupForm.style.display = "none";
        form.reset(); // Reset form
    });

    // Tangani submit form dengan AJAX
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // Cegah reload halaman

        const jobName = form.querySelector("#job_name").value.trim();
        if (jobName === "") {
            alert("Nama line pekerjaan wajib diisi!");
            return;
        }

        const formData = new FormData(form);

        fetch(form.action, {
            method: "POST",
            body: formData,
            headers: {
                "X-CSRF-TOKEN": csrfToken,
            },
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    // Tambahkan baris baru ke tabel
                    const newRow = document.createElement("tr");
                    newRow.innerHTML = `
                        <td>${data.pekerjaan.id}</td>
                        <td>${data.pekerjaan.job_name}</td>
                        <td>
                            <a href="{{ route('pekerjaan.edit', ':id') }}".replace(':id', data.pekerjaan.id) class="edit-link">
                                <i class="bi bi-pencil-square action-icon edit"></i>
                            </a>
                            <form action="{{ route('pekerjaan.destroy', ':id') }}".replace(':id', data.pekerjaan.id) method="POST" style="display:inline;">
                                <input type="hidden" name="_method" value="DELETE">
                                <input type="hidden" name="_token" value="${csrfToken}">
                                <button type="submit" class="btn-delete"><i class="bi bi-trash-fill action-icon delete"></i></button>
                            </form>
                        </td>
                    `;
                    tableBody.appendChild(newRow);
                    attachActions(newRow); // Tambahkan event listener ke baris baru
                    popupForm.style.display = "none"; // Tutup popup
                    form.reset(); // Reset form
                    showToast("Pekerjaan berhasil ditambahkan!");
                } else {
                    alert("Gagal menambahkan pekerjaan: " + (data.message || "Unknown error"));
                }
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("Terjadi kesalahan saat menyimpan data.");
            });
    });

    // Tambahkan event edit/delete ke setiap baris pekerjaan
    document.querySelectorAll("#tableBody tr").forEach(row => attachActions(row));
});

// Fungsi untuk menambahkan aksi edit dan delete ke baris tabel
function attachActions(row) {
    const editBtn = row.querySelector(".edit");
    const deleteBtn = row.querySelector(".delete");
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    // Edit action
    editBtn.addEventListener("click", (e) => {
        e.preventDefault(); // Cegah navigasi default
        const id = row.children[0].textContent;
        const namaSekarang = row.children[1].textContent.trim();
        const popupForm = document.getElementById("popupForm");
        const form = document.getElementById("pekerjaanForm");
        const jobNameInput = form.querySelector("#job_name");

        // Ubah form untuk edit
        form.action = `{{ route('pekerjaan.update', ':id') }}`.replace(':id', id);
        form.innerHTML = `
            <input type="hidden" name="_method" value="PUT">
            <input type="hidden" name="_token" value="${csrfToken}">
            <div class="mb-3">
                <label for="job_name" class="form-label">Nama Pekerjaan</label>
                <input type="text" name="job_name" id="job_name" class="form-control" value="${namaSekarang}" required>
            </div>
            <button type="submit" class="btn btn-primary">Simpan</button>
            <button type="button" id="closePopup" class="btn btn-secondary">Batal</button>
        `;
        popupForm.style.display = "block";

        // Tambahkan event listener baru untuk tombol batal
        form.querySelector("#closePopup").addEventListener("click", () => {
            popupForm.style.display = "none";
            form.reset();
            // Kembalikan form ke mode tambah
            form.action = "{{ route('pekerjaan.store') }}";
            form.innerHTML = `
                <input type="hidden" name="_token" value="${csrfToken}">
                <div class="mb-3">
                    <label for="job_name" class="form-label">Nama Pekerjaan</label>
                    <input type="text" name="job_name" id="job_name" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary">Simpan</button>
                <button type="button" id="closePopup" class="btn btn-secondary">Batal</button>
            `;
        });
    });

    // Delete action
    deleteBtn.addEventListener("click", () => {
        if (confirm("Apakah kamu yakin ingin menghapus line pekerjaan ini?")) {
            const form = deleteBtn.closest("form");
            fetch(form.action, {
                method: "POST",
                body: new FormData(form),
                headers: {
                    "X-CSRF-TOKEN": csrfToken,
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.success) {
                        row.remove(); // Hapus baris dari tabel
                        showToast("Pekerjaan berhasil dihapus!");
                    } else {
                        alert("Gagal menghapus pekerjaan: " + (data.message || "Unknown error"));
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                    alert("Terjadi kesalahan saat menghapus data.");
                });
        }
    });
}

// Fungsi notifikasi kecil (Toast)
function showToast(message) {
    const toast = document.createElement("div");
    toast.classList.add("toast");
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000); // Hapus setelah 3 detik
}