// ==========================================
// 1. SETUP AXIOS
// ==========================================
import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// ==========================================
// 2. SETUP LARAVEL ECHO & PUSHER
// ==========================================
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true
});

// ==========================================
// 3. LOGIKA LISTEN NOTIFIKASI & UPDATE UI
// ==========================================

const userId = document.querySelector('meta[name="user-id"]')?.getAttribute('content');
const notificationSound = new Audio('/assets/audio/notif.mp3');

if (userId) {
    console.log("Mendengarkan notifikasi untuk user:", userId);

    window.Echo.private(`notifications.${userId}`)
    .listen('.NewNotification', (e) => {
        // Ambil data (support struktur e.data atau e langsung)
        const dataNotif = e.data || e;
        console.log("Notifikasi Masuk:", dataNotif.message); 

        // 1. MAINKAN SUARA
        notificationSound.play().catch(() => {});

        // 2. UPDATE BADGE ANGKA
        const badge = document.getElementById('notification-badge'); 
        if (badge) {
            let currentCount = parseInt(badge.innerText);
            if (isNaN(currentCount)) currentCount = 0;
            badge.innerText = currentCount + 1;
            badge.style.display = 'flex'; 
        }

        // 3. BUAT LONCENG BERGOYANG
        const bell = document.getElementById('bell-icon');
        if (bell) {
            bell.classList.remove('is-ringing');
            void bell.offsetWidth; 
            bell.classList.add('is-ringing');
        }

        // 4. UPDATE DROPDOWN NOTIFIKASI (HTML)
        const notifContainer = document.getElementById('notification-list'); // Pastikan ID ini benar di blade
        if (notifContainer) {
            const emptyMsg = notifContainer.querySelector('.notification-empty');
            if (emptyMsg) emptyMsg.remove();

            const limit = (str, length) => str.length > length ? str.substring(0, length) + '...' : str;

            let messageHtml = '';
            if (dataNotif.comment_body) {
                messageHtml = `mengomentari <strong>${limit(dataNotif.task_title, 20)}</strong>: "${limit(dataNotif.comment_body, 20)}"`;
            } else {
                messageHtml = `telah membuat task: <strong>${limit(dataNotif.task_title, 25)}</strong>`;
            }

            const mockupHtml = dataNotif.first_mockup_url 
                ? `<img src="${dataNotif.first_mockup_url}" class="notification-mockup">` 
                : `<div class="notification-mockup placeholder"></div>`;

            const newItemHtml = `
              <a href="${dataNotif.url}" class="notification-item new-item" style="background-color: #f0f8ff; transition: background 1s;">
                  <div class="pic pic-sm" style="background-color: ${dataNotif.creator_color};">
                       ${dataNotif.creator_initials}
                  </div>
                  <div class="notification-content">
                      <p><strong>${dataNotif.creator_name}</strong> ${messageHtml}</p>
                      <small>${dataNotif.time}</small>
                  </div>
                  ${mockupHtml}
              </a>
            `;
            
            const firstHeader = notifContainer.querySelector('.notification-group-header');
            if (firstHeader) {
                firstHeader.insertAdjacentHTML('afterend', newItemHtml);
            } else {
                notifContainer.insertAdjacentHTML('afterbegin', newItemHtml);
            }
            
            const clearBtn = document.getElementById('clear-notif-btn');
            if(clearBtn) clearBtn.style.display = 'block';
        }

        // 5. UPDATE TABEL TASK SECARA REAL-TIME 
        const taskTableBody = document.querySelector("#taskTable tbody");
        
        if (taskTableBody && dataNotif.type === 'new_task' && dataNotif.task_id) {
            
            fetch(`/task/get-row/${dataNotif.task_id}`)
                .then(response => response.json())
                .then(result => {
                    if (result.html) {
                        const emptyRow = taskTableBody.querySelector('tr td.text-center');
                        if (emptyRow && emptyRow.textContent.includes('Belum ada task')) {
                            emptyRow.closest('tr').remove();
                        }

                        taskTableBody.insertAdjacentHTML('afterbegin', result.html);
                        
                        const newRow = taskTableBody.firstElementChild;
                        newRow.style.backgroundColor = '#fff3cd'; 
                        
                        if (typeof window.initGalleryIndicator === 'function') {
                             window.initGalleryIndicator(newRow);
                        }

                        setTimeout(() => { 
                            newRow.style.transition = 'background-color 2s';
                            newRow.style.backgroundColor = 'transparent'; 
                        }, 2000);
                    }
                })
                .catch(err => console.error("Gagal update tabel task:", err));
        }
        
        // 6. TAMPILKAN TOAST
        showToast(dataNotif.message); 
    });
}

// --- FUNGSI HELPER TOAST ---
function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast-box';
    toast.innerHTML = `<i class="bi bi-bell-fill" style="color: #CF221B; font-size: 1.2em;"></i><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide'); 
        toast.addEventListener('animationend', () => toast.remove());
    }, 4000);
}