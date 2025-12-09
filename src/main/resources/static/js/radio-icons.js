// radio-icons.js
// Toggles Bootstrap icon class inside label[for="..."] when radios change.
// Safe: only updates when a label + icon exists for the radio.
document.addEventListener('DOMContentLoaded', function () {
  const radios = document.querySelectorAll('input[type="radio"]');

  function updateRadioIcons() {
    radios.forEach(radio => {
      const label = document.querySelector(`label[for="${radio.id}"]`);
      if (!label) return;
      const icon = label.querySelector('i.bi');
      if (!icon) return;

      if (radio.checked) {
        icon.classList.remove('bi-circle', 'bi-record-circle', 'bi-circle-fill');
        icon.classList.add('bi-record-circle-fill', 'text-white');
      } else {
        icon.classList.remove('bi-record-circle-fill', 'bi-circle-fill', 'text-white');
        icon.classList.add('bi-circle');
      }
    });
  }

  // Listen for changes on the document to catch dynamically-added radios too.
  document.addEventListener('change', function (e) {
    if (e.target && e.target.matches('input[type="radio"]')) updateRadioIcons();
  });

  // Initialize based on server-side checked state
  updateRadioIcons();
});