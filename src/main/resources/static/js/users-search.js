document.addEventListener('DOMContentLoaded', function () {
  const filterForm = document.getElementById('userFilterForm');
  const searchInput = document.getElementById('searchInput');

  if (searchInput) {
    // Submit form when user presses Enter
    searchInput.addEventListener('keypress', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        filterForm.submit();
      }
    });

    // Optional: Real-time search with debounce (waits 1100ms after user stops typing)
    let searchTimeout;
    searchInput.addEventListener('input', function (e) {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(function() {
        filterForm.submit();
      }, 1100);
    });
  }
});
