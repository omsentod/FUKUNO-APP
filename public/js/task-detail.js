document.addEventListener("DOMContentLoaded", () => {
    
    // =========================================
    // 1. SETUP VARIABEL UTAMA
    // =========================================
    const chatContainer = document.getElementById('chat-container');
    const tabDetail = document.getElementById('tab-detail');
    const tabActivity = document.getElementById('tab-activity');
    const contentDetail = document.getElementById('content-detail');
    const contentActivity = document.getElementById('content-activity');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // --- Helper: Scroll chat ke bawah ---
    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }
    }

    // --- Helper: Pindah Tab ---
    function activateActivityTab() {
        if (tabDetail) tabDetail.classList.remove('active');
        if (contentDetail) contentDetail.classList.remove('active');
        if (tabActivity) tabActivity.classList.add('active');
        if (contentActivity) contentActivity.classList.add('active');
    }

    // =========================================
    // 2. LOGIKA SCROLL PINTAR (DEEP LINKING)
    // =========================================
    const hash = window.location.hash; 

    if (hash && hash.startsWith('#comment-')) {
        // SKENARIO A: Buka dari Notifikasi Komentar
        activateActivityTab();

        setTimeout(() => {
            const targetComment = document.querySelector(hash);
            if (targetComment && chatContainer) {
                // Scroll container utama agar chat terlihat
                chatContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Scroll di dalam chat box menuju komentar spesifik
                const topPos = targetComment.offsetTop - chatContainer.offsetTop;
                chatContainer.scrollTo({
                    top: topPos - 20, 
                    behavior: 'smooth'
                });

                // Efek Kedip
                targetComment.classList.add('highlight-target');
            }
        }, 300);

    } else if (hash === '#content-activity') {
        // SKENARIO B: Buka Tab Activity Umum
        activateActivityTab();
        scrollToBottom();
    } else {
        // SKENARIO C: Buka Halaman Biasa
        scrollToBottom();
    }

    // =========================================
    // 3. EVENT LISTENER TABS
    // =========================================
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
            setTimeout(scrollToBottom, 50); 
        });
    }

    // =========================================
    // 4. LOGIKA GALERI GAMBAR
    // =========================================
    const imageGallery = document.getElementById('image-gallery');
    const popup = document.getElementById('image-popup');
    const popupImg = document.getElementById('popup-img');
    const closePopup = document.getElementById('close-popup');

    if (imageGallery) {
        imageGallery.addEventListener('click', (e) => {
            if (e.target.classList.contains('gallery-image')) {
                popup.style.display = 'flex'; 
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

   // =========================================
    // 5. LOGIKA CHECKLIST & BAHAN (GABUNGAN)
    // =========================================
    const activityContainer = document.getElementById('activity-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    
    // Elemen Bahan
    const bahanInputs = document.querySelectorAll('.bahan-input');
    const bahanTerpakai = document.getElementById('bahan-terpakai');
    const bahanReject = document.getElementById('bahan-reject');

    // --- A. Auto-Save Bahan ---
 if (bahanInputs.length > 0) {
    bahanInputs.forEach(input => {
        input.addEventListener('blur', function() {
            const taskId = this.dataset.taskId;
            
            // 1. Simpan Data Bahan (Logika Lama)
            fetch(`/task/update-bahan/${taskId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken
                },
                body: JSON.stringify({
                    bahan_terpakai: bahanTerpakai.value,
                    bahan_reject: bahanReject.value
                })
            })
            .then(response => response.json())
            .then(data => {
                if(data.success) console.log('Bahan tersimpan.');
            })
            .catch(err => console.error('Gagal simpan bahan:', err));

          
            const valTerpakai = bahanTerpakai.value.trim();
            const valReject = bahanReject.value.trim();

            // Jika salah satu kosong...
            if (valTerpakai === '' || valReject === '') {
                // ...Cari checklist terakhir
                const finalCheckbox = document.querySelector('.final-checklist');
                
                // Jika checklist terakhir sedang tercentang
                if (finalCheckbox && finalCheckbox.checked) {
                    
                    // A. Lepas Centang secara Visual
                    finalCheckbox.checked = false;
                    
                    // B. Beri Peringatan
                    alert("⚠️ PERINGATAN SISTEM:\n\nChecklist terakhir otomatis dilepas karena Anda menghapus data Bahan.\nHarap isi kembali bahan sebelum menyelesaikan tugas.");

                    // C. Update Progress Bar UI
                    if (typeof calculateProgress === 'function') {
                        calculateProgress();
                    }

                    fetch(`/checklist/update/${finalCheckbox.dataset.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                        body: JSON.stringify({ is_completed: false }) // Set ke FALSE
                    })
                    .then(res => res.json())
                    .then(res => console.log("System auto-unchecked final list"))
                    .catch(err => console.error("Auto-uncheck error", err));
                }
            }

        });
    });
}

    // --- B. Listener Klik Activity Container (Satu Pintu) ---
    if (activityContainer) {
        activityContainer.addEventListener('click', (e) => {
            
            // 1. Logika Dropdown
            const dropdownBtn = e.target.closest('.dropdown-btn');
            if (dropdownBtn) {
                const content = dropdownBtn.nextElementSibling;
                dropdownBtn.parentElement.classList.toggle('active');
                content.style.display = content.style.display === 'block' ? 'none' : 'block';
                return; // Selesai
            }

            // 2. Logika Validasi Checklist Terakhir
            if (e.target.classList.contains('final-checklist')) {
                const valTerpakai = bahanTerpakai ? bahanTerpakai.value.trim() : '';
                const valReject = bahanReject ? bahanReject.value.trim() : '';

                if (valTerpakai === '' || valReject === '') {
                    e.preventDefault(); // Batalkan centang
                    alert("⚠️ PERHATIAN:\n\nHarap isi 'Bahan Terpakai' dan 'Bahan Reject' sebelum menyelesaikan pekerjaan ini!");
                    
                    bahanTerpakai.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    bahanTerpakai.classList.add('is-invalid');
                    bahanReject.classList.add('is-invalid');
                    
                    setTimeout(() => {
                         bahanTerpakai.classList.remove('is-invalid');
                         bahanReject.classList.remove('is-invalid');
                    }, 3000);
                    return; // Stop, jangan lanjut auto-save
                }
            }
        });

        // --- C. Listener Change (Auto-Save Checklist) ---
        activityContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('progress-check')) {
                const checkbox = e.target;
                const checklistId = checkbox.dataset.id;
                const isChecked = checkbox.checked;
                
                calculateProgress();

                fetch(`/checklist/update/${checklistId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                    body: JSON.stringify({ is_completed: isChecked })
                })
                .then(res => res.json())
                .then(result => {
                    if (!result.success) {
                        alert('Gagal menyimpan: ' + result.message);
                        checkbox.checked = !isChecked;
                        calculateProgress();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    checkbox.checked = !isChecked;
                    calculateProgress();
                });
            }
        });
    }

    function calculateProgress() {
        // ... (fungsi hitung progress Anda tetap sama) ...
        if (!activityContainer) return;
        const allCheckboxes = activityContainer.querySelectorAll('.progress-check');
        const completedTasks = activityContainer.querySelectorAll('.progress-check:checked').length;
        const total = allCheckboxes.length;
        const percentage = (total > 0) ? Math.round((completedTasks / total) * 100) : 0;
        
        if (progressBarFill) progressBarFill.style.width = percentage + '%';
        if (progressText) progressText.textContent = percentage + '% complete';
    }
    // 6. LOGIKA KOMENTAR (ENTER = KIRIM, SHIFT+ENTER = BARIS BARU)
  
    const commentBox = document.getElementById('comment');
    const submitBtn = document.getElementById('submit-btn');

   
    function postComment() {
        const text = commentBox.value.trim();
        // Pastikan submitBtn ada sebelum akses dataset
        if (!submitBtn) return;
        
        const taskId = submitBtn.dataset.taskId;
        
        if (!text) return; // Jangan kirim jika kosong

        // Matikan tombol sementara agar tidak double submit
        submitBtn.disabled = true;

        fetch(`/task/comment/${taskId}`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json', 
                'X-CSRF-TOKEN': csrfToken, // Pastikan variabel ini ada di scope atas (DOMContentLoaded)
                'Accept': 'application/json' 
            },
            body: JSON.stringify({ body: text })
        })
        .then(res => res.json())
        .then(result => {
            if (result.success) {
                addCommentBubble(result.comment);
                commentBox.value = ''; // Kosongkan textarea
                commentBox.focus();    // Kembalikan fokus ke textarea
            } else {
                alert('Gagal mengirim komentar: ' + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error koneksi.');
        })
        .finally(() => {
            submitBtn.disabled = false; // Hidupkan tombol kembali
        });
    }

    // --- B. Listener Klik Tombol Pesawat ---
    if (submitBtn) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            postComment();
        });
    }

    // --- C. Listener Keyboard (Enter vs Shift+Enter) ---
    if (commentBox) {
        commentBox.addEventListener('keydown', (e) => {
            // Cek jika tombol adalah ENTER
            if (e.key === 'Enter') {
                // Cek jika SHIFT TIDAK ditekan
                if (!e.shiftKey) {
                    e.preventDefault(); // Cegah enter membuat baris baru
                    postComment();      // Kirim komentar
                }
                // Jika Shift+Enter, biarkan default browser (buat baris baru)
            }
        });
    }

    // Fungsi helper bubble (Sama seperti sebelumnya)
    function addCommentBubble(comment) {
        const noComments = document.getElementById('no-comments');
        if (noComments) noComments.remove();

        const dateObj = new Date(comment.created_at);
        const time = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        const bubble = document.createElement('div');
        bubble.className = 'comment-bubble own';
        bubble.id = `comment-${comment.id}`; 
        
        // Ganti newline (\n) menjadi <br> agar baris baru terlihat di bubble
        const formattedBody = comment.body.replace(/\n/g, '<br>');

        bubble.innerHTML = `
            <div class="comment-body">${formattedBody}</div>
            <div class="comment-time">${time}</div>
        `;
        
        chatContainer.appendChild(bubble);
        scrollToBottom();
    }
   
});