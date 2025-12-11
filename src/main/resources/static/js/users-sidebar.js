document.addEventListener("DOMContentLoaded", function () {
  const layout = document.querySelector(".dashboard-layout");
  const toggles = document.querySelectorAll("[data-sidebar-toggle]");

  toggles.forEach((btn) =>
    btn.addEventListener("click", function (event) {
      event.preventDefault();
      layout?.classList.toggle("sidebar-open");
    })
  );
});
