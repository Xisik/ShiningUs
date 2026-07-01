(function () {
  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }
  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function toggle(linkEl, targetId) {
    const box = $("#" + targetId);
    if (!box) return;

    const willOpen = !box.classList.contains("is-open");

    if (willOpen) {
      box.classList.add("is-open");
      box.setAttribute("aria-hidden", "false");
      linkEl.setAttribute("aria-expanded", "true");
    } else {
      box.classList.remove("is-open");
      box.setAttribute("aria-hidden", "true");
      linkEl.setAttribute("aria-expanded", "false");
    }
  }

  $all("[data-toggle]").forEach((a) => {
    a.addEventListener("click", (e) => {
      // 링크가 아닌 경우에만 preventDefault (div 등)
      if (a.tagName === "A") {
        e.preventDefault();
      }
      const targetId = a.getAttribute("data-toggle");
      if (!targetId) return;
      toggle(a, targetId);
    });
    
    // 키보드 접근성: Enter와 Space 키 지원
    a.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        const targetId = a.getAttribute("data-toggle");
        if (!targetId) return;
        toggle(a, targetId);
      }
    });
  });
})();
