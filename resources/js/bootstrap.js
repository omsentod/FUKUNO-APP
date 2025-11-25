import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_APP_KEY,
    cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
    forceTLS: true
});

const userId = document.querySelector('meta[name="user-id"]')?.getAttribute('content');
const notificationSound = new Audio('/assets/audio/notif.mp3');

if (userId) {
    console.log("Mendengarkan notifikasi untuk user:", userId);

    window.Echo.private(`notifications.${userId}`)
    .listen('.NewNotification', (e) => {
        console.log("Notifikasi Masuk:", e.data); 

        // 1. SUARA
        notificationSound.play().catch(() => {});

        // 2. BADGE
        const badge = document.getElementById('notification-badge'); 
        if (badge) {
            let currentCount = parseInt(badge.innerText) || 0;
            badge.innerText = currentCount + 1;
            badge.style.display = 'flex'; 
        }

        // 3. LONCENG GOYANG
        const bell = document.getElementById('bell-icon');
        if (bell) {
            bell.classList.remove('is-ringing');
            void bell.offsetWidth; 
            bell.classList.add('is-ringing');
        }

        // 4. UPDATE HTML DROPDOWN (UI BAGUS)
        const notifContainer = document.getElementById('notification');
        if (notifContainer) {
            const emptyMsg = notifContainer.querySelector('.notification-empty');
            if (emptyMsg) emptyMsg.remove();

            // Fungsi pemotong teks
            const limit = (str, length) => str.length > length ? str.substring(0, length) + '...' : str;

            // Susun Pesan HTML (Bold User & Title)
            let messageHtml = '';
            
            // Sekarang e.data.creator_name & task_title SUDAH ADA (karena kita update Controller)
            if (e.data.comment_body) {
                // Format Komentar
                messageHtml = `
                    mengomentari <strong>${limit(e.data.task_title, 20)}</strong>: 
                    "${limit(e.data.comment_body, 20)}"
                `;
            } else {
                // Format Task Baru
                messageHtml = `
                    telah membuat task: <strong>${limit(e.data.task_title, 25)}</strong>
                `;
            }

            const mockupHtml = e.data.first_mockup_url 
                ? `<img src="${e.data.first_mockup_url}" class="notification-mockup">` 
                : `<div class="notification-mockup placeholder"></div>`;

            const newItemHtml = `
              <a href="${e.data.url}" class="notification-item new-item" style="background-color: #f0f8ff; transition: background 1s;">
                  <div class="pic pic-sm" style="background-color: ${e.data.creator_color};">
                       ${e.data.creator_initials}
                  </div>
                  <div class="notification-content">
                      <p>
                        <strong>${e.data.creator_name}</strong>
                        ${messageHtml}
                      </p>
                      <small>${e.data.time}</small>
                  </div>
                  ${mockupHtml}
              </a>
            `;
            
            // Sisipkan di paling atas
            const firstHeader = notifContainer.querySelector('.notification-group-header');
            if (firstHeader) {
                firstHeader.insertAdjacentHTML('afterend', newItemHtml);
            } else {
                notifContainer.insertAdjacentHTML('afterbegin', newItemHtml);
            }
        }

        // 5. TOAST
        showToast(e.data.message); 
    });
}

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