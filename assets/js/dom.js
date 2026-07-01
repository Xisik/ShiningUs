(function () {
  // JS 사용 가능 여부를 CSS에서 판별할 수 있도록 표시
  document.documentElement.classList.add("js");

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $all(sel, root) {
    return Array.from((root || document).querySelectorAll(sel));
  }

  window.__ui = window.__ui || {};
  window.__ui.$ = $;
  window.__ui.$all = $all;
})();
