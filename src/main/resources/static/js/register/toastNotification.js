(function () {
  // Ensure toast container exists (keep existing HTML if present)
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  // Create backdrop if not present
  let toastBackdrop = document.getElementById('toastBackdrop');
  if (!toastBackdrop) {
    toastBackdrop = document.createElement('div');
    toastBackdrop.className = 'toast-backdrop';
    toastBackdrop.id = 'toastBackdrop';
    document.body.appendChild(toastBackdrop);
  }

  // Expose global function
  window.showToast = function (message, type = 'error') {
    const toastId = 'toast-' + Date.now();
    const bgClass = type === 'success' ? 'bg-success' : 'bg-danger';
    const toastClass = type === 'success' ? 'toast-success' : 'toast-error';

    const toastHTML = `
      <div id="${toastId}" class="toast custom-toast ${toastClass}" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header ${bgClass} text-white">
          <strong class="me-auto">
            ${type === 'success' ? '✓ 成功' : '⚠ エラー'}
          </strong>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body bg-white">
          ${message}
        </div>
      </div>
    `;

    // Clear previous toast and show backdrop
    toastContainer.innerHTML = toastHTML;
    toastBackdrop.classList.add('show');

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
      autohide: true,
      delay: 5000
    });

    toast.show();

    // Remove toast and backdrop after hide
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastContainer.innerHTML = '';
      toastBackdrop.classList.remove('show');
    });

    // clicking backdrop hides toast
    toastBackdrop.onclick = () => {
      toast.hide();
    };
  };
})();