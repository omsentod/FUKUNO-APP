document.addEventListener("DOMContentLoaded", () => {
    
    // --- Helper: Scroll chat ke bawah ---
    const chatContainer = document.getElementById('chat-container');
    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }
    // Langsung scroll saat halaman dimuat
    // scrollToBottom();

    // --- 1. LOGIKA TAB ---
    const tabDetail = document.getElementById('tab-detail');
    const tabActivity = document.getElementById('tab-activity');
    const contentDetail = document.getElementById('content-detail');
    const contentActivity = document.getElementById('content-activity');

    if (tabDetail) {
        tabDetail.addEventListener('click', () => {
            tabDetail.classList.add('active');
            tabActivity.classList.remove('active');
            contentDetail.classList.add('active');
            contentActivity.classList.remove('active');
        });
    }
    if (tabActivity) {
        tabActivity.addEventListener('click', () => {
            tabActivity.classList.add('active');
            tabDetail.classList.remove('active');
            contentActivity.classList.add('active');
            contentDetail.classList.remove('active');
        });
    }

    if (window.location.hash === '#content-activity') {
        
        // 1. Pindahkan 'active' class dari Detail ke Activity
        if (tabDetail) tabDetail.classList.remove('active');
        if (contentDetail) contentDetail.classList.remove('active');
        
        if (tabActivity) tabActivity.classList.add('active');
        if (contentActivity) contentActivity.classList.add('active');

        // 2. Scroll ke chat container
        // (Kita beri sedikit delay agar tab-nya selesai di-render)
        setTimeout(() => {
            if (chatContainer) {
                chatContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center' // Posisikan di tengah layar
                });
            }
        }, 100); // 100ms delay

    } else {
        // Jika TIDAK ada hash, jalankan scroll normal (jika ada chat)
        scrollToBottom();
    }



  
    // --- 2. LOGIKA GALERI GAMBAR ---
    const imageGallery = document.getElementById('image-gallery');
    const popup = document.getElementById('image-popup');
    const popupImg = document.getElementById('popup-img');
    const closePopup = document.getElementById('close-popup');

    if (imageGallery) {
        imageGallery.addEventListener('click', (e) => {
            if (e.target.classList.contains('gallery-image')) {
                popup.style.display = 'flex'; // 'flex' agar rata tengah
                popupImg.src = e.target.src;
            }
        });
    }
    if (closePopup) {
        closePopup.addEventListener('click', () => { popup.style.display = 'none'; });
    }
    if (popup) {
        popup.addEventListener("click", e => {
          if (e.target === popup) { popup.style.display = "none"; }
        });
    }

    // --- 3. LOGIKA CHECKLIST (AUTO-SAVE & PROGRESS BAR) ---
    const activityContainer = document.getElementById('activity-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    const csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

    // Fungsi untuk menghitung progres
    function calculateProgress() {
        if (!activityContainer) return;
        const allCheckboxes = activityContainer.querySelectorAll('.progress-check');
        const completedTasks = activityContainer.querySelectorAll('.progress-check:checked').length;
        const total = allCheckboxes.length;
        const percentage = (total > 0) ? Math.round((completedTasks / total) * 100) : 0;
        
        if (progressBarFill) progressBarFill.style.width = percentage + '%';
        if (progressText) progressText.textContent = percentage + '% complete';
    }
    // (Kalkulasi awal sudah dilakukan oleh Blade)

    // Listener untuk auto-save checklist
    if (activityContainer) {
        activityContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('progress-check')) {
                const checkbox = e.target;
                const checklistId = checkbox.dataset.id;
                const isChecked = checkbox.checked;
                
                calculateProgress(); // Update UI langsung

                // Kirim auto-save
                fetch(`/checklist/update/${checklistId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                    body: JSON.stringify({ is_completed: isChecked })
                })
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        console.log(`Checklist ${checklistId} updated.`);
                    } else {
                        alert('Gagal menyimpan checklist: ' + result.message);
                        checkbox.checked = !isChecked;
                        calculateProgress();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Error koneksi saat menyimpan checklist.');
                    checkbox.checked = !isChecked;
                    calculateProgress();
                });
            }
        });
    }
    
    // --- 4. LOGIKA DROPDOWN CHECKLIST ---
    if(activityContainer) {
        activityContainer.addEventListener('click', (e) => {
            const dropdownBtn = e.target.closest('.dropdown-btn');
            if (dropdownBtn) {
                dropdownBtn.classList.toggle('active');
                const content = dropdownBtn.nextElementSibling;
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
            }
        });
    }

    // --- 5. LOGIKA SUBMIT KOMENTAR BARU ---
    const commentBox = document.getElementById('comment');
    const submitBtn = document.getElementById('submit-btn');

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const text = commentBox.value.trim();
            const taskId = submitBtn.dataset.taskId; // Ambil ID task dari tombol
            
            if (!text) {
                alert('Tulis komentar terlebih dahulu!');
                return;
            }

            // Kirim komentar ke server
            fetch(`/task/comment/${taskId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ body: text })
            })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    // Berhasil, tambahkan bubble chat baru secara dinamis
                    addCommentBubble(result.comment);
                    commentBox.value = ''; // Kosongkan input
                } else {
                    alert('Gagal mengirim komentar: ' + result.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error koneksi saat mengirim komentar.');
            });
        });
    }

    /**
     * Helper function untuk menambah bubble chat baru
     * @param {object} comment - Objek komentar dari server
     */
    function addCommentBubble(comment) {
        // Hapus 'Belum ada komentar' jika ada
        const noComments = document.getElementById('no-comments');
        if (noComments) noComments.remove();

        const time = new Date(comment.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        // Buat elemen bubble
        const bubble = document.createElement('div');
        // Tentukan apakah ini 'own' (milik user yg login)
        // Kita bandingkan user ID, tapi 'comment.user' mungkin tidak ada jika 'load' gagal
        // Cara aman: kita tahu yg baru disubmit pasti 'own'
        bubble.className = 'comment-bubble own';
        
        bubble.innerHTML = `
            <div class="comment-body">${comment.body}</div>
            <div class="comment-time">${time}</div>
        `;
        
        chatContainer.appendChild(bubble);
        scrollToBottom(); // Auto-scroll ke bawah
    }
    
    if (detailChecklistContainer) {
        detailChecklistContainer.addEventListener('change', function(event) {
            if (event.target.type === 'checkbox' && event.target.dataset.id) {
                // Sama seperti listener utama
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
                        console.log(`Checklist ${checklistId} updated (detail page)`);
                        
                    } else {
                        alert('Gagal menyimpan: ' + result.message);
                        event.target.checked = !isChecked;
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Gagal menyimpan checklist.');
                    event.target.checked = !isChecked;
                });
            }
        });
    }

});