window.addEventListener('load', function() {
  const preloader = document.getElementById('page-preloader');
  if (preloader) {
      preloader.classList.add('loaded');
  }
  
});
window.addEventListener('load', hidePreloader);

setTimeout(hidePreloader, 3000);


document.addEventListener('DOMContentLoaded', function () {
    
  // --- 1. Logika Notifikasi ---
  const bellIcon = document.getElementById('bell-icon');
  const notification = document.getElementById('notification');
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'); // Ambil CSRF

  if (bellIcon && notification) {
      bellIcon.addEventListener('click', function() {
          // a. Tampilkan/sembunyikan dropdown
          notification.classList.toggle('show');
          
          // b. Hentikan goyangan
          bellIcon.classList.remove('is-ringing'); 
          
          const badge = bellIcon.querySelector('.notification-badge');
          
          // c. Jika badge ada (artinya ada notif baru), sembunyikan & kirim request
          if (badge && badge.style.display !== 'none') { 
              
              // Sembunyikan badge-nya (tampilan)
              badge.style.display = 'none';

              // Kirim request ke server untuk tandai "read" (database)
              fetch('/notifications/mark-as-read', { // URL Rute baru Anda
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
                      console.log('Notifikasi ditandai telah dibaca.');
                  }
              })
              .catch(error => console.error('Gagal menandai notifikasi:', error));
          }
      });
  }

  // --- 2. Logika Toggle Sidebar ---
  const toggleBtn = document.getElementById("sidebar-toggle-btn");
  const body = document.body;
    
  // Tombol Panah (Desktop)
  const desktopToggleBtn = document.getElementById("sidebar-toggle-btn");
  if (desktopToggleBtn) {
      desktopToggleBtn.addEventListener("click", () => {
          // Ini untuk desktop
          body.classList.toggle("sidebar-closed"); 
      });
  }

  // Tombol Hamburger (Mobile/Tablet) - HANYA MEMBUKA
  const hamburgerBtn = document.getElementById("navbar-hamburger-btn");
  if (hamburgerBtn) {
      hamburgerBtn.addEventListener("click", () => {
          body.classList.add("sidebar-open-mobile"); 
      });
  }

  // Tombol Close 'X' (Di dalam sidebar) - HANYA MENUTUP
  const sidebarCloseBtn = document.getElementById("sidebar-close-btn");
  if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener("click", () => {
          body.classList.remove("sidebar-open-mobile"); 
      });
  }
});