
  // Tambah Kolom
  document.getElementById("addRow").addEventListener("click", function () {
    let table = document.getElementById("sizeTable").getElementsByTagName("tbody")[0];
    let row = table.insertRow();
    row.innerHTML = `
      <td><input type="text" class="form-control" value="Baju Anak"></td>
      <td><input type="text" class="form-control" value="L"></td>
      <td><input type="text" class="form-control" value="10 Pcs"></td>
      <td><button type="button" class="btn btn-sm btn-danger remove-row">Hapus</button></td>
    `;
  });

  // Hapus Kolom
  document.addEventListener("click", function (e) {
    if (e.target && e.target.classList.contains("remove-row")) {
      e.target.closest("tr").remove();
    }
  });

  // File Upload Drag & Drop + Preview + Hapus Gambar
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");
  const preview = document.getElementById("preview");
  let uploadedFiles = [];

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.classList.add("dragover");
  });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener("change", () => handleFiles(fileInput.files));

  function handleFiles(files) {
    [...files].forEach(file => {
      uploadedFiles.push(file);
    });
    updatePreview();
  }

  function updatePreview() {
    preview.innerHTML = "";
    uploadedFiles.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = e => {
        const wrapper = document.createElement("div");
        wrapper.classList.add("position-relative", "me-2", "mb-2");
        wrapper.style.display = "inline-block";

        const img = document.createElement("img");
        img.src = e.target.result;
        img.classList.add("img-thumbnail");
        img.style.maxWidth = "100px";
        img.style.height = "100px";
        img.style.objectFit = "cover";

        const removeBtn = document.createElement("button");
        removeBtn.innerHTML = "&times;";
        removeBtn.classList.add("btn", "btn-sm", "btn-danger");
        removeBtn.style.position = "absolute";
        removeBtn.style.top = "2px";
        removeBtn.style.right = "2px";
        removeBtn.style.borderRadius = "50%";
        removeBtn.style.width = "24px";
        removeBtn.style.height = "24px";
        removeBtn.style.padding = "0";
        removeBtn.addEventListener("click", () => removeImage(index));

        wrapper.appendChild(img);
        wrapper.appendChild(removeBtn);
        preview.appendChild(wrapper);
      };
      reader.readAsDataURL(file);
    });
  }

  function removeImage(index) {
    uploadedFiles.splice(index, 1);
    updatePreview();
  }