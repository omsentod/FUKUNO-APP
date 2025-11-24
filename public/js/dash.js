// Preloader
window.addEventListener('load', function() {
    const preloader = document.getElementById('page-preloader');
    if (preloader) {
        preloader.classList.add('loaded');
    }
  });
  
  document.addEventListener('DOMContentLoaded', function () {
      
    // ==========================================
    // 1. LOGIKA NOTIFIKASI
    // ==========================================
    const bellIcon = document.getElementById('bell-icon');
    const notification = document.getElementById('notification');
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'); 
  
    if (bellIcon && notification) {
        bellIcon.addEventListener('click', function() {
            // a. Toggle dropdown
            notification.classList.toggle('show');
            
            // b. Hentikan animasi goyang (Langsung)
            bellIcon.classList.remove('is-ringing'); 
            
            // c. Handle Badge & Database
            const badge = document.getElementById('notification-badge'); // Gunakan ID biar lebih spesifik
            
            // Jika badge terlihat (artinya ada notif belum dibaca)
            if (badge && badge.style.display !== 'none') { 
                
                // 1. Sembunyikan badge secara visual (Instant Feedback)
                badge.style.display = 'none';
                badge.innerText = '0'; // Reset angka
  
                // 2. Kirim request ke server (Background Process)
                fetch('/notifications/mark-as-read', { 
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': csrfToken,
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                })
                .then(response => {
                    if (!response.ok) throw new Error('Server error');
                    return response.json();
                })
                .then(result => {
                    if (result.success) {
                        console.log('Database updated: Notifikasi dibaca.');
                    }
                })
                .catch(error => console.error('Gagal update database notifikasi:', error));
            }
        });
    }
  
    // ==========================================
    // 2. LOGIKA SIDEBAR (RESPONSIVE)
    // ==========================================
    const body = document.body;
      
    // A. Tombol Panah (Desktop) - Toggle biasa
    const desktopToggleBtn = document.getElementById("sidebar-toggle-btn");
    if (desktopToggleBtn) {
        desktopToggleBtn.addEventListener("click", () => {
            body.classList.toggle("sidebar-closed"); 
        });
    }
  
    // B. Tombol Hamburger (Mobile) - HANYA MEMBUKA
    const hamburgerBtn = document.getElementById("navbar-hamburger-btn");
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener("click", () => {
            body.classList.add("sidebar-open-mobile"); 
        });
    }
  
    // C. Tombol Close 'X' (Mobile) - HANYA MENUTUP
    const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener("click", () => {
            body.classList.remove("sidebar-open-mobile"); 
        });
    }
  });