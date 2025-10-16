<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Add Task</title>

<!-- Bootstrap -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<!-- Bootstrap Icons -->
<link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

<!-- Custom CSS -->
<link rel="stylesheet" href="{{ asset('css/addtask.css') }}">
</head>

<body class="bg-light">
  <!-- Navbar -->
  <nav class="navbar bg-white shadow-sm px-4">
    <div class="header-logo d-flex align-items-center">
      <img src="{{ asset('assets/img/web-logo.png') }}" alt="header logo" style="height: 40px;">
      <span class="ms-2 fw-semibold text-danger">Task Manager</span>
    </div>

    <div class="profile">
      <i class="bi bi-bell-fill icon-kanan mx-2"></i>
      <i class="bi bi-person-fill icon-kanan"></i>
    </div>
  </nav>

  <!-- Sidebar + Content -->
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar bg-dark text-white p-3" style="width: 220px; min-height: 100vh;">
      <div class="sidebar-menu">
        <a href="#" class="d-block py-2 text-white"><i class="bi bi-bar-chart-line-fill me-2"></i> Dashboard</a>
        <a href="#" class="d-block py-2 text-white"><i class="bi bi-list-task me-2"></i> Task</a>
        <a href="#" class="d-block py-2 text-white"><i class="bi bi-wrench-adjustable me-2"></i> Line Pekerjaan</a>
        <a href="#" class="d-block py-2 text-white"><i class="bi bi-arrow-repeat me-2"></i> Status</a>
        <a href="#" class="d-block py-2 text-white"><i class="bi bi-card-checklist me-2"></i> Checklist</a>
        <a href="#" class="d-block py-2 text-white"><i class="bi bi-people-fill me-2"></i> User</a>
        <a href="#" class="d-block py-2 text-white"><i class="bi bi-archive-fill me-2"></i> Archive</a>
        <a href="#" class="d-block py-2 text-white"><i class="bi bi-trash-fill me-2"></i> Trash</a>
      </div>
    </div>

    <!-- Main Page -->
    <div class="page flex-fill p-4">
      <div class="card shadow p-4">
        <h4 class="mb-3">Add Task</h4>

        <!-- Form Add Task -->
        <form action="{{ route('tasks.store') }}" method="POST" enctype="multipart/form-data">
          @csrf

          <div class="mb-3">
            <label class="form-label">No Invoice</label>
            <input type="text" class="form-control" name="invoice_number" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Nama Pelanggan</label>
            <input type="text" class="form-control" name="nama_pelanggan" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Judul</label>
            <input type="text" class="form-control" name="judul" required>
          </div>

          <div class="mb-3">
            <label class="form-label">Catatan</label>
            <textarea class="form-control" name="catatan" rows="3"></textarea>
          </div>

          <div class="row mb-3">
  <div class="col">
    <label class="form-label">Penanggung Jawab</label>
    <select name="penanggung_jawab" id="penanggung_jawab" class="form-select">
      <option value="">-- Pilih Penanggung Jawab --</option>
      @foreach ($users as $user)
        <option value="{{ $user->id }}" 
          {{ Auth::check() && Auth::user()->id == $user->id ? 'selected' : '' }}>
          {{ $user->name }}
        </option>
      @endforeach
    </select>
  </div>


            <div class="col">
              <label class="form-label">Urgensi</label>
              <select class="form-select" name="urgensi">
                <option selected>Pilih</option>
                <option value="Tinggi">Tinggi</option>
                <option value="Sedang">Sedang</option>
                <option value="Rendah">Rendah</option>
              </select>
            </div>
          </div>

          <hr>
          <h5 class="fw-semibold mb-3">Line Pekerjaan & Checklist</h5>

          <div id="lineContainer"></div>
          <button type="button" class="btn btn-link" id="addLine">+ Tambah Line Pekerjaan</button>

          <hr class="my-4">

          <h5 class="fw-semibold">Jenis & Size</h5>
          <div class="table-responsive">
            <table class="table table-bordered mt-2 text-center align-middle" id="sizeTable">
              <thead class="table-danger">
                <tr>
                  <th>Jenis size</th>
                  <th>Size</th>
                  <th>Jumlah</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><input type="text" name="jenis_size[]" class="form-control" value="Baju Anak"></td>
                  <td><input type="text" name="size[]" class="form-control" value="L"></td>
                  <td><input type="text" name="jumlah_size[]" class="form-control" value="10 Pcs"></td>
                  <td><button type="button" class="btn btn-sm btn-danger remove-row">Hapus</button></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="d-flex justify-content-between">
            <button type="button" id="addRow" class="btn btn-link">+ Tambah Kolom</button>
            <button type="button" class="btn btn-danger" id="confirmSize">Confirm</button>
          </div>

          <div class="row mt-3">
            <div class="col">
              <label class="form-label">Jumlah</label>
              <input type="text" name="jumlah" class="form-control">
            </div>
          </div>

          <div class="row mt-3">
            <div class="col">
              <label class="form-label">Warna</label>
              <input type="text" name="warna" class="form-control">
            </div>
            <div class="col">
              <label class="form-label">Model</label>
              <input type="text" name="model" class="form-control">
            </div>
          </div>

          <div class="mt-3">
            <label class="form-label">Bahan</label>
            <input type="text" name="bahan" class="form-control">
          </div>

          <div class="mt-3">
            <label class="form-label">Mockup</label>
            <input type="file" name="mockup[]" multiple class="form-control">
          </div>

          <div class="d-flex justify-content-end gap-2 mt-4">
            <button type="button" class="btn btn-outline-dark">Cancel</button>
            <button type="submit" class="btn btn-danger">Submit</button>
          </div>
        </form>
      </div>
    </div>
  </div>

  <!-- Script -->
  <script>
    document.addEventListener("DOMContentLoaded", function () {
      // === LINE PEKERJAAN & CHECKLIST ===
      const lineContainer = document.getElementById("lineContainer");
      const addLineBtn = document.getElementById("addLine");

      addLineBtn.addEventListener("click", function () {
        const lineIndex = document.querySelectorAll(".line-item").length;
        const lineItem = document.createElement("div");
        lineItem.classList.add("line-item", "border", "rounded", "p-3", "mb-3");
        lineItem.innerHTML = `
          <div class="d-flex justify-content-between align-items-center mb-2">
            <h6 class="mb-0">Line ${lineIndex + 1}</h6>
            <button type="button" class="btn btn-sm btn-danger remove-line">Hapus</button>
          </div>

          <div class="row mb-2">
            <div class="col">
              <label class="form-label">Nama Pekerjaan</label>
              <input type="text" name="line_pekerjaan[]" class="form-control" required>
            </div>
            <div class="col">
              <label class="form-label">Deadline</label>
              <input type="datetime-local" name="line_deadline[]" class="form-control">
            </div>
          </div>

          <div class="checklist-container">
            <label class="form-label fw-semibold">Checklist</label>
            <div class="checklist-items"></div>
            <button type="button" class="btn btn-link add-checklist">+ Tambah Checklist</button>
          </div>
        `;
        lineContainer.appendChild(lineItem);
      });

      lineContainer.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-line")) {
          e.target.closest(".line-item").remove();
        }

        if (e.target.classList.contains("add-checklist")) {
  const lineItem = e.target.closest(".line-item");
  const lineIndex = Array.from(lineContainer.children).indexOf(lineItem); // 🔥 ambil indeks line yang benar
  const checklistContainer = lineItem.querySelector(".checklist-items");
  const checklistCount = checklistContainer.querySelectorAll(".input-group").length;

  const checklistInput = document.createElement("div");
  checklistInput.classList.add("input-group", "mb-2");
  checklistInput.innerHTML = `
    <input type="text" name="checklist[${lineIndex}][]" class="form-control" placeholder="Checklist ${checklistCount + 1}">
    <button type="button" class="btn btn-outline-danger remove-checklist"><i class="bi bi-x"></i></button>
  `;
  checklistContainer.appendChild(checklistInput);
}


        if (e.target.classList.contains("remove-checklist") || e.target.closest(".remove-checklist")) {
          e.target.closest(".input-group").remove();
        }
      });

      // === JENIS & SIZE TABLE ===
      const sizeTable = document.querySelector("#sizeTable tbody");
      const addRowBtn = document.getElementById("addRow");

      addRowBtn.addEventListener("click", function () {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
          <td><input type="text" name="jenis_size[]" class="form-control"></td>
          <td><input type="text" name="size[]" class="form-control"></td>
          <td><input type="text" name="jumlah_size[]" class="form-control"></td>
          <td><button type="button" class="btn btn-sm btn-danger remove-row">Hapus</button></td>
        `;
        sizeTable.appendChild(newRow);
      });

      sizeTable.addEventListener("click", function (e) {
        if (e.target.classList.contains("remove-row")) {
          e.target.closest("tr").remove();
        }
      });
    });
  </script>
</body>
</html>
