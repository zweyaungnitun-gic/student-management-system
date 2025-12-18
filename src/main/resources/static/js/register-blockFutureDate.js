(function () {
  const dob = document.getElementById('dob');
  if (!dob) return;
  const d = new Date();
  d.setDate(d.getDate() - 1); // yesterday
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  dob.max = `${yyyy}-${mm}-${dd}`;
})();