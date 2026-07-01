(function () {
  const toggleBtn = document.querySelector("[data-nav-toggle]");
  const nav = document.getElementById("siteNav");
  if (!toggleBtn || !nav) return;

  function setOpen(isOpen) {
    nav.classList.toggle("is-open", isOpen);
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  function toggle() {
    setOpen(!nav.classList.contains("is-open"));
  }

  toggleBtn.addEventListener("click", toggle);

  /* 메뉴 링크 클릭 시 자동 닫기(모바일 UX) */
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    setOpen(false);
  });

  /* ESC로 닫기 */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });

  /* 화면이 커지면(데스크탑) 열린 상태 제거 */
  const mq = window.matchMedia("(max-width: 640px)");
  mq.addEventListener("change", () => {
    if (!mq.matches) setOpen(false);
  });
})();
