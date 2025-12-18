(function () {
  const tuitionPaymentDate = document.getElementById('tuitionPaymentDate');
  if (!tuitionPaymentDate) return;

  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  tuitionPaymentDate.min = `${yyyy}-${mm}-${dd}`;
})();
