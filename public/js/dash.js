document.addEventListener('DOMContentLoaded', function () {
  // Hanya untuk notifikasi
  const bellIcon = document.getElementById('bell-icon');
  const notification = document.getElementById('notification');

  if (bellIcon && notification) {
      bellIcon.addEventListener('click', function() {
          notification.classList.toggle('show');
          bellIcon.style.pointerEvents = 'auto';
      });
  }

});