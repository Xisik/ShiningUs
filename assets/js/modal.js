(function () {
  const ui = window.__ui;
  if (!ui) return;

  function openModal(modalId) {
    const modal = ui.$("#" + modalId);
    if (!modal) return;

    // 닫힘 애니메이션 중이면 취소
    if (modal._closeTid) {
      window.clearTimeout(modal._closeTid);
      modal._closeTid = null;
      modal.classList.remove("is-closing");
    }

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");

    const focusable = modal.querySelector("button, a, input, [tabindex]:not([tabindex='-1'])");
    if (focusable) focusable.focus();
  }

  function closeModal(modalId) {
    const modal = ui.$("#" + modalId);
    if (!modal) return;
    if (!modal.classList.contains("is-open")) return;

    // ease-in 퇴장: is-closing 추가 → 220ms 후 is-open 제거
    modal.classList.add("is-closing");
    modal._closeTid = window.setTimeout(() => {
      modal.classList.remove("is-open", "is-closing");
      modal.setAttribute("aria-hidden", "true");
      modal._closeTid = null;
    }, 220);
  }

  function wireMemberDiffModal() {
    ui.$all("[data-open-modal='memberDiff']").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        openModal("memberDiffModal");

        if (ui.showToast) ui.showToast("회원 구분 안내를 열었다.");
      });
    });

    ui.$all("[data-close-modal='memberDiff']").forEach((el) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal("memberDiffModal");
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeModal("memberDiffModal");
    });
  }

  ui.modal = {
    openModal,
    closeModal,
    wireMemberDiffModal
  };
})();
