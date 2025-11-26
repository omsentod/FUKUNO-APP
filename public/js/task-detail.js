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
    // 5. LOGIKA CHECKLIST (AUTO-SAVE & DROPDOWN)
    // =========================================
    const activityContainer = document.getElementById('activity-container');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');

    function calculateProgress() {
        if (!activityContainer) return;
        const allCheckboxes = activityContainer.querySelectorAll('.progress-check');
        const completedTasks = activityContainer.querySelectorAll('.progress-check:checked').length;
        const total = allCheckboxes.length;
        const percentage = (total > 0) ? Math.round((completedTasks / total) * 100) : 0;
        
        if (progressBarFill) progressBarFill.style.width = percentage + '%';
        if (progressText) progressText.textContent = percentage + '% complete';
    }

    if (activityContainer) {
        // A. Toggle Dropdown Line Pekerjaan
        activityContainer.addEventListener('click', (e) => {
            const dropdownBtn = e.target.closest('.dropdown-btn');
            if (dropdownBtn) {
                // Toggle tampilan dropdown content
                const content = dropdownBtn.nextElementSibling;
                // Toggle class active pada parent dropdown untuk styling (opsional)
                dropdownBtn.parentElement.classList.toggle('active');
                
                // Logika display sederhana
                if (content.style.display === 'block') {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                }
            }
        });

        // B. Auto-Save Checklist (Ganti 'change' listener yang hilang/error)
        activityContainer.addEventListener('change', (e) => {
            if (e.target.classList.contains('progress-check')) {
                const checkbox = e.target;
                const checklistId = checkbox.dataset.id;
                const isChecked = checkbox.checked;
                
                calculateProgress(); // Update UI langsung

                fetch(`/checklist/update/${checklistId}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                    body: JSON.stringify({ is_completed: isChecked })
                })
                .then(res => res.json())
                .then(result => {
                    if (result.success) {
                        console.log(`Checklist ${checklistId} saved.`);
                    } else {
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

    // =========================================
    // 6. LOGIKA KOMENTAR
    // =========================================
    const commentBox = document.getElementById('comment');
    const submitBtn = document.getElementById('submit-btn');

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const text = commentBox.value.trim();
            const taskId = submitBtn.dataset.taskId;
            
            if (!text) {
                alert('Tulis komentar terlebih dahulu!');
                return;
            }

            fetch(`/task/comment/${taskId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': csrfToken, 'Accept': 'application/json' },
                body: JSON.stringify({ body: text })
            })
            .then(res => res.json())
            .then(result => {
                if (result.success) {
                    addCommentBubble(result.comment);
                    commentBox.value = ''; 
                } else {
                    alert('Gagal mengirim komentar: ' + result.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error koneksi.');
            });
        });
    }

    // Fungsi membuat bubble chat baru
    function addCommentBubble(comment) {
        const noComments = document.getElementById('no-comments');
        if (noComments) noComments.remove();

        // Format waktu sederhana
        const dateObj = new Date(comment.created_at);
        const time = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        
        const bubble = document.createElement('div');
        // Komentar baru pasti milik user yang login ('own')
        bubble.className = 'comment-bubble own';
        // Beri ID untuk deep linking di masa depan
        bubble.id = `comment-${comment.id}`; 
        
        bubble.innerHTML = `
            <div class="comment-body">${comment.body}</div>
            <div class="comment-time">${time}</div>
        `;
        
        chatContainer.appendChild(bubble);
        scrollToBottom();
    }
});