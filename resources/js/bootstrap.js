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
const chatContainer = document.getElementById('chat-container');

if (userId) {
    console.log("Mendengarkan notifikasi untuk user:", userId);

    window.Echo.private(`notifications.${userId}`)
    .listen('.NewNotification', (e) => {
        const dataNotif = e.data || e;
        console.log("Notifikasi Masuk:", dataNotif.message); 

        // Cek apakah ini update diam-diam (Status/Checklist)
        const isSilent = (dataNotif.message === 'silent_update');

        // ------------------------------------------
        // 1. SOUND, BADGE, & LONCENG (Hanya jika BUKAN silent)
        // ------------------------------------------
        if (!isSilent) {
            notificationSound.play().catch(() => {});
            
            const badge = document.getElementById('notification-badge'); 
            if (badge) {
                let currentCount = parseInt(badge.innerText) || 0;
                badge.innerText = currentCount + 1;
                badge.style.display = 'flex'; 
            }

            const bell = document.getElementById('bell-icon');
            if (bell) {
                bell.classList.remove('is-ringing');
                void bell.offsetWidth; 
                bell.classList.add('is-ringing');
            }

            // UPDATE DROPDOWN NOTIFIKASI
            const notifContainer = document.getElementById('notification-list'); 
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
        }

        // ------------------------------------------
        // 2. UPDATE TABEL TASK (TETAP JALAN MAU SILENT ATAU TIDAK)
        // ------------------------------------------
        const taskTableBody = document.querySelector("#taskTable tbody");

        // A. KASUS: TASK BARU / RESTORE
        if (taskTableBody && (dataNotif.type === 'new_task' || dataNotif.type === 'task_restored') && dataNotif.task_id) {
            fetch(`/task/get-row/${dataNotif.task_id}`)
                .then(response => response.json())
                .then(result => {
                    if (result.html) {
                        const emptyRow = taskTableBody.querySelector('tr td.text-center');
                        if (emptyRow && emptyRow.textContent.includes('Belum ada')) emptyRow.closest('tr').remove();

                        const existingRow = document.getElementById(`task-row-${dataNotif.task_id}`);
                        if (existingRow) existingRow.remove();

                        taskTableBody.insertAdjacentHTML('beforeend', result.html);
                        const newRow = taskTableBody.lastElementChild;
                        newRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        newRow.style.transition = 'background-color 2s ease-out';
                        newRow.style.backgroundColor = '#d4edda'; // Hijau muda
                        
                        if (typeof window.initGalleryIndicator === 'function') window.initGalleryIndicator(newRow);
                        setTimeout(() => { newRow.style.backgroundColor = ''; }, 2000);
                    }
                })
                .catch(err => console.error("Gagal update tabel task:", err));
        }

        // B. KASUS: UPDATE STATUS / PROGRESS (Silent Update Masuk Sini)
        else if (taskTableBody && dataNotif.type === 'task_updated_row' && dataNotif.task_id) {
            const existingRow = document.getElementById(`task-row-${dataNotif.task_id}`);
            if (existingRow) {
                fetch(`/task/get-row/${dataNotif.task_id}`)
                    .then(res => res.json())
                    .then(result => {
                        if (result.html) {
                            existingRow.outerHTML = result.html;
                            const newRow = document.getElementById(`task-row-${dataNotif.task_id}`);
                            if (newRow) {
                                newRow.style.transition = 'background-color 1.5s ease-out';
                                newRow.style.backgroundColor = '#fff3cd'; // Highlight Kuning
                                if (typeof window.initGalleryIndicator === 'function') window.initGalleryIndicator(newRow);
                                setTimeout(() => { newRow.style.backgroundColor = ''; }, 1500);
                            }
                        }
                    });
            }
        }

        // C. KASUS: DELETE / ARCHIVE
        else if (taskTableBody && (dataNotif.type === 'task_deleted' || dataNotif.type === 'task_archived') && dataNotif.task_id) {
            const rowToRemove = document.getElementById(`task-row-${dataNotif.task_id}`);
            if (rowToRemove) {
                rowToRemove.style.transition = 'background-color 0.5s';
                rowToRemove.style.backgroundColor = '#f8d7da'; // Merah muda
                setTimeout(() => {
                    rowToRemove.remove();
                    if (taskTableBody.children.length === 0) {
                        taskTableBody.innerHTML = '<tr><td colspan="10" class="text-center p-4">Belum ada task.</td></tr>';
                    }
                }, 500); 
            }
        }
        
        // ------------------------------------------
        // 3. UPDATE CHAT (Jika ada komentar baru)
        // ------------------------------------------
        if (chatContainer && dataNotif.type === 'new_comment' && chatContainer.dataset.taskId == dataNotif.task_id) {
            const noComments = document.getElementById('no-comments');
            if (noComments) noComments.remove();

            const bubble = document.createElement('div');
            bubble.className = 'comment-bubble'; 
            const formattedBody = dataNotif.comment_body.replace(/\n/g, '<br>');
            bubble.innerHTML = `
                <div class="comment-header" style="font-size: 12px; margin-bottom: 2px; color: #666;">
                    <strong>${dataNotif.creator_name}</strong>
                </div>
                <div class="comment-body">${formattedBody}</div>
                <div class="comment-time" style="font-size: 10px; color: #999; text-align: right; margin-top: 5px;">
                    Baru saja
                </div>
            `;
            chatContainer.appendChild(bubble);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // ------------------------------------------
        // 4. TAMPILKAN TOAST (Hanya jika BUKAN silent)
        // ------------------------------------------
        if (!isSilent) {
            showToast(dataNotif.message); 
        }
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