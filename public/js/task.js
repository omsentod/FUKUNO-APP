document.addEventListener("DOMContentLoaded", () => {
  const addBtn = document.getElementById("addBtn");
  const notif = document.getElementById("notif");
  const tableBody = document.querySelector("tbody");

  // Menampilkan pop-up statis
  function showPopup() {
      const overlay = document.querySelector(".popup-overlay");
      const popup = overlay.querySelector(".popup");

      // Tampilkan pop-up
      overlay.style.display = "block";

      // Menutup pop-up ketika klik tombol Cancel
      popup.querySelector("#cancelBtn").addEventListener("click", () => {
          overlay.style.display = "none";
      });

      // Form Submission
      popup.querySelector("#taskForm").addEventListener("submit", (e) => {
          e.preventDefault();
          const data = {
              noInvoice: popup.querySelector("#noInvoice").value,
              namaPelanggan: popup.querySelector("#namaPelanggan").value,
              judul: popup.querySelector("#judul").value,
              catatan: popup.querySelector("#catatan").value,
              penanggungJawab: popup.querySelector("#penanggungJawab").value,
              urgensi: popup.querySelector("#urgensi").value,
              jumlah: popup.querySelector("#jumlah").value,
              warna: popup.querySelector("#warna").value,
              model: popup.querySelector("#model").value,
              bahan: popup.querySelector("#bahan").value,
          };
          // Logic untuk submit task, contoh menyimpan data
          showNotif("Task berhasil disimpan!");
          overlay.style.display = "none"; // Close popup
      });
  }

  // Menampilkan notifikasi
  function showNotif(text) {
      if (!notif) return;
      notif.textContent = text;
      notif.style.display = "block";
      setTimeout(() => (notif.style.display = "none"), 2500);
  }

  // Tombol tambah task
  if (addBtn) {
      addBtn.addEventListener("click", showPopup);
  }
});
