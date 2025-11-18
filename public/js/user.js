// === Show & Hide Popup ===
function showPopup(mode, user = null) {
    const popup = document.getElementById('addUserPopup');
    const form = document.getElementById('addUserForm');
    const title = document.getElementById('popupTitle');
    const idField = document.getElementById('userId');

    popup.classList.remove('hidden');

    if (mode === 'edit' && user) {
        title.textContent = 'Edit User';
        idField.value = user.id;
        form.name.value = user.name;
        form.email.value = user.email;
        form.role.value = user.role;
        form.password.value = '';
        form.password_confirmation.value = '';
    } else {
        title.textContent = 'Add New User';
        form.reset();
        idField.value = '';
    }
}

document.getElementById('cancelAdd').addEventListener('click', () => {
    document.getElementById('addUserPopup').classList.add('hidden');
});

// === Toggle Password Visibility ===
document.addEventListener('click', function (e) {
    if (e.target.classList.contains('toggle-password')) {
        const input = e.target.previousElementSibling;
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
});

// === Handle Create or Update ===
document.getElementById('addUserForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('userId').value;
    const formData = new FormData(e.target);
    const url = id ? `/user/update/${id}` : '/user/store';
    const method = id ? 'POST' : 'POST';

    const response = await fetch(url, {
        method: method,
        headers: {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
        },
        body: formData
    });

    if (response.ok) {
        alert(id ? "User updated successfully!" : "User added successfully!");
        location.reload();
    } else {
        const data = await response.json();
        alert("Error:\n" + JSON.stringify(data.errors || data.message));
    }
});

// === Handle Delete ===
document.querySelectorAll('.delete').forEach(btn => {
    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        if (!confirm("Are you sure want to delete this user?")) return;

        const userId = btn.getAttribute('data-id');

        const response = await fetch(`/user/delete/${userId}`, {
            method: 'DELETE',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        });

        if (response.ok) {
            alert("User deleted successfully!");
            location.reload();
        } else {
            alert("Failed to delete user.");
        }
    });
});

// === Handle Edit ===
document.querySelectorAll('.edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const tr = btn.closest('tr');
        const user = {
            id: tr.dataset.id,
            name: tr.dataset.name,
            email: tr.dataset.email,
            role: tr.dataset.role
        };
        showPopup('edit', user);
    });
});
