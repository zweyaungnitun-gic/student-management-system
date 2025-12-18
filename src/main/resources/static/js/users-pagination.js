document.addEventListener("DOMContentLoaded", function () {
  const rows = Array.from(document.querySelectorAll("#userTableBody tr"))
    .filter(r => !r.querySelector("td[colspan]"));

  const rowsPerPage = 10;
  let currentPage = 1;

  function displayPage(page) {
    currentPage = page;

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    rows.forEach((row, index) => {
      row.style.display = index >= start && index < end ? "" : "none";
    });

    renderPagination();
  }

  function renderPagination() {
    const pageCount = Math.ceil(rows.length / rowsPerPage);
    const paginationDiv = document.getElementById("pagination");
    paginationDiv.innerHTML = "";

    function createBtn(text, page, disabled = false, active = false) {
      const btn = document.createElement("button");
      btn.textContent = text;

      btn.className = `btn btn-sm mx-1 ${active ? "btn-primary" : "btn-outline-primary"}`;

      btn.disabled = disabled;

      if (!disabled) {
        btn.addEventListener("click", () => displayPage(page));
      }

      paginationDiv.appendChild(btn);
    }

    // First page button
    createBtn("<<", 1, currentPage === 1);

    // Previous page button
    createBtn("<", currentPage - 1, currentPage === 1);

    // Calculate page range to display
    let start = currentPage - 2;
    let end = currentPage + 2;

    if (start < 1) {
      start = 1;
      end = Math.min(5, pageCount);
    }

    if (end > pageCount) {
      end = pageCount;
      start = Math.max(1, pageCount - 4);
    }

    // Page number buttons
    for (let i = start; i <= end; i++) {
      createBtn(i, i, false, i === currentPage);
    }

    // Next page button
    createBtn(">", currentPage + 1, currentPage === pageCount);

    // Last page button
    createBtn(">>", pageCount, currentPage === pageCount);
  }

  displayPage(1);
});
