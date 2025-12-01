(() => {
  const API_URL = "/api/employees";

  const tableBody = document.querySelector("#employeeTableBody");
  const cacheChip = document.querySelector("#cacheStatusChip");
  const totalLabel = document.querySelector("#totalEmployees");
  const activeLabel = document.querySelector("#activeEmployees");
  const snapshotLabel = document.querySelector("#snapshotTime");
  const form = document.querySelector("#employeeForm");
  const modalElement = document.querySelector("#employeeModal");
  const modal = modalElement ? new bootstrap.Modal(modalElement) : null;
  const submitButton = form?.querySelector('button[type="submit"]');
  const defaultSubmitLabel = submitButton?.querySelector(".default-label");
  const loadingSubmitLabel = submitButton?.querySelector(".loading-label");

  let employees = [];
  let editingId = null;

  const currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  });

  async function fetchEmployees() {
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error("Unable to reach employee API");
      }

      const payload = await response.json();
      employees = payload.employees ?? [];
      renderTable(employees);
      renderStats(payload.stats);
    } catch (error) {
      console.error(error);
      if (tableBody) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="text-center text-danger py-5">
              Failed to load employees. Please refresh the page.
            </td>
          </tr>`;
      }
    }
  }

  function renderTable(data) {
    if (!tableBody) {
      return;
    }

    if (!data.length) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center text-muted py-5">
            No employees found. Start by adding one.
          </td>
        </tr>`;
      return;
    }

    tableBody.innerHTML = data
      .map(
        (employee) => `
        <tr>
          <td>
            <div class="fw-semibold">${employee.firstName} ${employee.lastName}</div>
            <small class="text-muted">${employee.email}</small>
          </td>
          <td>${employee.department}</td>
          <td>${employee.jobTitle}</td>
          <td>
            <span class="status-pill ${employee.status.toLowerCase()}">
              ${employee.status.replace("_", " ")}
            </span>
          </td>
          <td>${currencyFormatter.format(employee.salary)}</td>
          <td class="text-end">
            <button class="btn btn-link text-primary p-0 me-3" data-action="edit" data-id="${employee.id}">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-link text-danger p-0" data-action="delete" data-id="${employee.id}">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        </tr>`
      )
      .join("");
  }

  function renderStats(stats) {
    if (!stats) {
      return;
    }

    if (totalLabel) totalLabel.textContent = stats.totalEmployees ?? "--";
    if (activeLabel) activeLabel.textContent = stats.activeEmployees ?? "--";
    if (snapshotLabel && stats.snapshotTime) {
      const date = new Date(stats.snapshotTime);
      snapshotLabel.textContent = date.toLocaleString();
    }

    if (cacheChip) {
      cacheChip.classList.toggle("cache-chip--cache", stats.source === "redis");
      cacheChip.classList.toggle("cache-chip--db", stats.source === "database");
      const label = cacheChip.querySelector("span:last-child");
      if (label) {
        label.textContent =
          stats.source === "redis" ? "Served from Redis cache" : "Fresh from database";
      }
    }
  }

  function serializeFormData() {
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    payload.salary = Number(payload.salary ?? 0);
    payload.hireDate = payload.hireDate || null;
    payload.status = payload.status?.toUpperCase();
    return payload;
  }

  async function submitEmployee(event) {
    event.preventDefault();
    if (!form) return;

    toggleSubmitState(true);

    try {
      const payload = serializeFormData();
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.error || "Request failed");
      }

      await fetchEmployees();
      form.reset();
      editingId = null;
      updateModalTitle("Add employee");
      modal?.hide();
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      toggleSubmitState(false);
    }
  }

  function toggleSubmitState(isLoading) {
    if (!submitButton || !defaultSubmitLabel || !loadingSubmitLabel) return;
    submitButton.disabled = isLoading;
    defaultSubmitLabel.classList.toggle("d-none", isLoading);
    loadingSubmitLabel.classList.toggle("d-none", !isLoading);
  }

  function handleTableClick(event) {
    const actionButton = event.target.closest("button[data-action]");
    if (!actionButton) return;

    const id = Number(actionButton.dataset.id);
    const action = actionButton.dataset.action;
    if (Number.isNaN(id)) return;

    if (action === "edit") {
      startEdit(id);
    }
    if (action === "delete") {
      deleteEmployee(id);
    }
  }

  function startEdit(id) {
    const employee = employees.find((emp) => emp.id === id);
    if (!employee) return;

    editingId = id;
    updateModalTitle("Edit employee");

    form.firstName.value = employee.firstName;
    form.lastName.value = employee.lastName;
    form.email.value = employee.email;
    form.department.value = employee.department;
    form.jobTitle.value = employee.jobTitle;
    form.status.value = employee.status;
    form.salary.value = employee.salary;
    form.hireDate.value = employee.hireDate ?? "";

    modal?.show();
  }

  async function deleteEmployee(id) {
    const confirmation = confirm("Delete this employee?");
    if (!confirmation) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok) {
        throw new Error("Unable to delete employee");
      }
      await fetchEmployees();
    } catch (error) {
      console.error(error);
      alert("Failed to delete employee");
    }
  }

  function updateModalTitle(title) {
    const label = document.querySelector("#employeeModalLabel");
    if (label) label.textContent = title;
  }

  function init() {
    if (!tableBody || !form) {
      return;
    }
    form.addEventListener("submit", submitEmployee);
    tableBody.addEventListener("click", handleTableClick);
    modalElement?.addEventListener("hidden.bs.modal", () => {
      form.reset();
      editingId = null;
      updateModalTitle("Add employee");
    });

    fetchEmployees();
  }

  document.addEventListener("DOMContentLoaded", init);
})();


