// ==========================================
// 1. SETUP AXIOS
// ==========================================
import axios from 'axios';
window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

// ==========================================
// 2. SETUP LARAVEL ECHO & REVERB
// ==========================================
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

window.Echo = new Echo({
    broadcaster: 'reverb',
    key: import.meta.env.VITE_REVERB_APP_KEY,
    wsHost: import.meta.env.VITE_REVERB_HOST,
    wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
    wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
    forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'https') === 'https',
    enabledTransports: ['ws', 'wss'],
});

// ==========================================
// 3. LOGIKA LISTEN NOTIFIKASI
// ==========================================

// Ambil ID user
const userId = document.querySelector('meta[name="user-id"]')?.getAttribute('content');

// Siapkan audio di luar listener (agar file diload siap main)
// Pastikan file Anda bernama 'notif.mp3' dan ada di folder 'public/assets/audio/'
const notificationSound = new Audio('/assets/audio/notif.mp3');

if (userId) {
    console.log("Mendengarkan notifikasi untuk user:", userId);

    // Listen ke Channel Private
    // Pastikan di App/Events/NewNotification.php function broadcastAs() return 'NewNotification'
    window.Echo.private(`notifications.${userId}`)
    .listen('.NewNotification', (e) => {
        console.log("Notifikasi Masuk:", e.message);

        // 1. MAINKAN SUARA
        notificationSound.play().catch(error => {
            console.log("Audio autoplay blocked:", error);
        });

        // ▼▼▼ 2. UPDATE BADGE ANGKA ▼▼▼
        const badge = document.getElementById('notification-badge'); 
        if (badge) {
            // Ambil angka sekarang, ubah ke integer (atau 0 jika kosong)
            let currentCount = parseInt(badge.innerText);
            if (isNaN(currentCount)) currentCount = 0;

            // Tambah 1
            badge.innerText = currentCount + 1;
            
            // Pastikan badge terlihat
            badge.style.display = 'flex'; 
        }

        // ▼▼▼ 3. BUAT LONCENG BERGOYANG ▼▼▼
        const bell = document.getElementById('bell-icon');
        if (bell) {
            // Hapus dulu class-nya (jika sedang goyang) biar reset
            bell.classList.remove('is-ringing');
            
            // Trik kecil agar browser me-restart animasi
            void bell.offsetWidth; 

            // Tambahkan class animasi
            bell.classList.add('is-ringing');
        }

        // 4. Tampilkan Toast
        showToast(e.message);
    });
}

// --- FUNGSI HELPER TOAST (Di Luar Blok IF) ---
function showToast(message) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-box';
    toast.innerHTML = `
        <i class="bi bi-bell-fill" style="color: #CF221B; font-size: 1.2em;"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Hapus setelah 4 detik
    setTimeout(() => {
        toast.classList.add('hide'); 
        toast.addEventListener('animationend', () => {
            toast.remove(); 
        });
    }, 4000);
}