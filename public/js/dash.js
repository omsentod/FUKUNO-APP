// function getInitials(name) {
//     const names = name.split(' ');
//     const initials = names.map(n => n[0].toUpperCase()).join('');
//     return initials;
// }

// const userName = "";
// const initials = getInitials(userName);

// document.getElementById('initials').textContent = initials;

// document.getElementById('profile').addEventListener('click', function() {
//     this.classList.toggle('active');
// });
// Fungsi untuk mendapatkan inisial dari nama
function getInitials(name) {
    const names = name.split(' ');
    const initials = names.map(n => n[0].toUpperCase()).join('');
    return initials;
}

// Nama pengguna yang ingin diganti inisialnya
const userName = "Rifqi Widyadana";
const initials = getInitials(userName);

// Ganti inisial di dalam div dengan id 'initials'
document.getElementById('initials').textContent = initials;

// Menambahkan event listener untuk klik pada ikon profile untuk toggle tampilan
document.getElementById('profile').addEventListener('click', function() {
    this.classList.toggle('active'); // Toggle class 'active' untuk mengganti antara ikon dan inisial
});

// Menambahkan event listener untuk klik pada ikon bell untuk menampilkan notifikasi
const bellIcon = document.getElementById('bell-icon');
const notification = document.getElementById('notification');

// Tombol bell yang mengaktifkan notifikasi
bellIcon.addEventListener('click', function() {
  // Toggle kelas 'show' untuk menampilkan atau menyembunyikan notifikasi
  notification.classList.toggle('show');

  // Pastikan ikon bell bisa di klik lagi untuk menutup
  bellIcon.style.pointerEvents = 'auto';  // Pastikan ikon bell tetap bisa diklik setelah notifikasi ditampilkan
});
