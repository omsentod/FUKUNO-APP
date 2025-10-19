document.addEventListener("DOMContentLoaded", () => {
    const addBtn = document.querySelector(".btn-add");
    const popupForm = document.getElementById("popupForm");
    const closePopupBtn = document.getElementById("closePopup");
    const form = document.getElementById("pekerjaanForm");
    const popupTitle = document.getElementById("popupTitle");
    const jobNameInput = document.getElementById("job_name");
    const formMethod = document.getElementById("formMethod");
    const pekerjaanId = document.getElementById("pekerjaanId");

    // Cek CSRF token
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content;
    if (!csrfToken) {
        console.error("CSRF token tidak ditemukan!");
        alert("Konfigurasi CSRF token tidak ditemukan. Hubungi admin.");
        return;
    }

    // Base URL untuk routes
    const baseUrl = window.location.origin;

    // === FUNGSI: Buka Popup untuk ADD ===
    addBtn.addEventListener("click", () => {
        resetForm();
        popupTitle.textContent = "Tambah Pekerjaan Baru";
        formMethod.value = "POST";
        form.action = `${baseUrl}/pekerjaan`;
        popupForm.style.display = "block";
    });

    // === FUNGSI: Tutup Popup ===
    closePopupBtn.addEventListener("click", () => {
        popupForm.style.display = "none";
        resetForm();
    });

    // === FUNGSI: Reset Form ===
    function resetForm() {
        form.reset();
        pekerjaanId.value = "";
        formMethod.value = "POST";
    }

    // === FUNGSI: Submit Form (ADD/EDIT) dengan AJAX ===
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const jobName = jobNameInput.value.trim();
        if (jobName === "") {
            alert("Nama line pekerjaan wajib diisi!");
            return;
        }

        const formData = new FormData(form);
        const method = formMethod.value === "PUT" ? "POST" : "POST"; // Laravel pakai POST + _method

        fetch(form.action, {
            method: method,
            body: formData,
            headers: {
                "X-CSRF-TOKEN": csrfToken,
                "Accept": "application/json"
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                if (formMethod.value === "POST") {
                    // Mode ADD - Tambah baris baru
                    addRowToTable(data.pekerjaan);
                } else {
                    // Mode EDIT - Update baris yang ada
                    updateRowInTable(data.pekerjaan);
                }
                popupForm.style.display = "none";
                resetForm();
                showToast(data.message);
            } else {
                alert("Gagal: " + (data.message || "Unknown error"));
            }
        })
        .catch(error => {
            console.error("Error:", error);
            alert("Terjadi kesalahan saat menyimpan data.");
        });
    });

    // === FUNGSI: Tambah Baris Baru ke Tabel ===
    function addRowToTable(pekerjaan) {
        const tableBody = document.getElementById("tableBody");
        const newRow = document.createElement("tr");
        newRow.dataset.id = pekerjaan.id;
        newRow.innerHTML = `
            <td>${pekerjaan.id}</td>
            <td>${pekerjaan.job_name}</td>
            <td>
                <button type="button" class="btn-icon edit-btn" data-id="${pekerjaan.id}" data-name="${pekerjaan.job_name}">
                    <i class="bi bi-pencil-square action-icon edit"></i>
                </button>
                <form action="${baseUrl}/pekerjaan/${pekerjaan.id}" method="POST" style="display:inline;" class="delete-form">
                    <input type="hidden" name="_method" value="DELETE">
                    <input type="hidden" name="_token" value="${csrfToken}">
                    <button type="submit" class="btn-delete">
                        <i class="bi bi-trash-fill action-icon delete"></i>
                    </button>
                </form>
            </td>
        `;
        tableBody.appendChild(newRow);
        attachRowActions(newRow);
    }

    // === FUNGSI: Update Baris yang Ada di Tabel ===
    function updateRowInTable(pekerjaan) {
        const row = document.querySelector(`tr[data-id="${pekerjaan.id}"]`);
        if (row) {
            row.children[1].textContent = pekerjaan.job_name;
            // Update juga data attribute di button edit
            const editBtn = row.querySelector(".edit-btn");
            editBtn.dataset.name = pekerjaan.job_name;
        }
    }

    // === FUNGSI: Attach Event ke Baris (Edit & Delete) ===
    function attachRowActions(row) {
        const editBtn = row.querySelector(".edit-btn");
        const deleteForm = row.querySelector(".delete-form");

        // Event: Edit Button
        editBtn.addEventListener("click", () => {
            const id = editBtn.dataset.id;
            const name = editBtn.dataset.name;

            // Set form untuk mode EDIT
            popupTitle.textContent = "Edit Pekerjaan";
            jobNameInput.value = name;
            formMethod.value = "PUT";
            pekerjaanId.value = id;
            form.action = `${baseUrl}/pekerjaan/${id}`;
            popupForm.style.display = "block";
        });

        // Event: Delete Form
deleteForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    if (!confirm("Apakah kamu yakin ingin menghapus line pekerjaan ini?")) {
        return;
    }

    const formData = new FormData(deleteForm);

    fetch(deleteForm.action, {
        method: "POST",
        body: formData,
        headers: {
            "X-CSRF-TOKEN": csrfToken,
            "Accept": "application/json"
        },
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            row.remove(); // Hapus baris dari tabel
            showToast(data.message);
            // TIDAK PERLU RELOAD!
        } else {
            alert("Gagal menghapus: " + (data.message || "Unknown error"));
        }
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Terjadi kesalahan saat menghapus data: " + error.message);
    });
});
    }

    // === FUNGSI: Toast Notification ===
    function showToast(message) {
        const toast = document.createElement("div");
        toast.classList.add("toast");
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = "slideOut 0.3s ease-in";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // === Attach Actions ke Semua Baris yang Sudah Ada ===
    document.querySelectorAll("#tableBody tr").forEach(row => {
        row.dataset.id = row.children[0].textContent; // Set data-id
        attachRowActions(row);
    });
});

// CSS Animation untuk Toast
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);