(function () {
  const ui = window.__ui;
  if (!ui) return;

  function showToast(message) {
    const toast = ui.$("#toast");
    if (!toast) return;

    // 퇴장 애니메이션 중이면 즉시 초기화
    window.clearTimeout(showToast._t);
    window.clearTimeout(showToast._hideT);
    toast.classList.remove("is-hiding");

    toast.textContent = message;
    toast.classList.add("is-show");

    // ease-in 퇴장: 2200ms 후 is-hiding 추가 → 220ms 후 완전히 숨김
    showToast._t = window.setTimeout(() => {
      toast.classList.add("is-hiding");
      showToast._hideT = window.setTimeout(() => {
        toast.classList.remove("is-show", "is-hiding");
      }, 240);
    }, 2200);
  }

  ui.showToast = showToast;
})();
