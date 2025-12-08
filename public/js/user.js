document.addEventListener("DOMContentLoaded", () => {

    // === 1. SETUP TOKEN CSRF ===
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');


    window.showPopup = function(mode, user = null) {
        const popup = document.getElementById('addUserPopup');
        const form = document.getElementById('addUserForm');
        const title = document.getElementById('popupTitle');
        const idField = document.getElementById('userId');

        if (!popup || !form) return;

        // Tampilkan Popup (Sesuaikan dengan style di Blade: display block/flex)
        popup.style.display = 'flex'; 

        if (mode === 'edit' && user) {
            title.textContent = 'Edit User';
            idField.value = user.id;
            
            if (form.name) form.name.value = user.name;
            if (form.email) form.email.value = user.email;
            if (form.role) form.role.value = user.role;
            
            // Password dikosongkan saat edit (hanya diisi jika ingin ubah)
            if (form.password) form.password.value = '';
            if (form.password_confirmation) form.password_confirmation.value = '';
        } else {
            title.textContent = 'Add New User';
            form.reset();
            idField.value = '';
        }
    };

    /**
     * Menangani Klik Tombol Edit
     * @param {HTMLElement} element - Tag <a> yang diklik
     */
    window.editUser = function(element) {
        const tr = element.closest('tr');
        if (!tr) return;

        const user = {
            id: tr.dataset.id,
            name: tr.dataset.name,
            email: tr.dataset.email,
            role: tr.dataset.role
        };
        showPopup('edit', user);
    };

    /**
     * Menangani Klik Tombol Delete
     */
    window.deleteUser = async function(userId) {
        if (!confirm("Are you sure want to delete this user?")) return;

        try {
            const response = await fetch(`/user/delete/${userId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                alert("User deleted successfully!");
                location.reload();
            } else {
                const data = await response.json();
                alert(data.message || "Failed to delete user.");
            }
        } catch (error) {
            console.error(error);
            alert("Terjadi kesalahan jaringan.");
        }
    };

    // =========================================================
    // === 3. EVENT LISTENERS (Elemen Statis) ===
    // =========================================================

    // --- Tombol Cancel Popup ---
    const cancelBtn = document.getElementById('cancelAdd');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            const popup = document.getElementById('addUserPopup');
            if (popup) popup.style.display = 'none';
        });
    }

    // --- Toggle Password Visibility ---
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('toggle-password')) {
            const wrapper = e.target.closest('.password-cell');
            const input = wrapper ? wrapper.querySelector('input') : null;
            
            if (input) {
                if (input.type === "password") {
                    input.type = "text";
                    e.target.classList.remove('bi-eye-slash');
                    e.target.classList.add('bi-eye');
                } else {
                    input.type = "password";
                    e.target.classList.remove('bi-eye');
                    e.target.classList.add('bi-eye-slash');
                }
            }
        }
    });

    // --- Handle Submit Form (Create / Update) ---
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const id = document.getElementById('userId').value;
            const formData = new FormData(e.target);
            
            // Tentukan URL berdasarkan apakah ini Edit (ada ID) atau Baru
            const url = id ? `/user/update/${id}` : '/user/store';

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken
                    },
                    body: formData
                });

                const data = await response.json();

                if (response.ok) {
                    alert(id ? "User updated successfully!" : "User added successfully!");
                    location.reload();
                } else {
                    // Tampilkan error validasi jika ada
                    const errorMsg = data.errors ? JSON.stringify(data.errors) : (data.message || "Unknown error");
                    alert("Gagal:\n" + errorMsg);
                }
            } catch (error) {
                console.error(error);
                alert("Terjadi kesalahan pada server.");
            }
        });
    }

    // --- Logika Pencarian (Search) ---
    const searchInput = document.getElementById('userSearchInput');
    const tableRows = document.querySelectorAll("#userTableBody tr"); // Pastikan ID tbody di blade adalah userTableBody

    if (searchInput && tableRows.length > 0) {
        searchInput.addEventListener('keyup', function(e) {
            const searchTerm = e.target.value.toLowerCase();

            tableRows.forEach(row => {
                const rowText = row.textContent.toLowerCase();
                if (rowText.includes(searchTerm)) {
                    row.style.display = ""; 
                } else {
                    row.style.display = "none"; 
                }
            });
        });
    }

});