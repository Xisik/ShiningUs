(function () {
  const ui = window.__ui;
  if (!ui) return;

  function wirePointerBlur() {
    let pointerActivated = false;
    const selector = 'a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])';

    function markPointerActivation() {
      pointerActivated = true;
    }

    document.addEventListener('pointerdown', markPointerActivation, true);
    document.addEventListener('mousedown', markPointerActivation, true);
    document.addEventListener('touchstart', markPointerActivation, true);

    document.addEventListener('click', function (event) {
      if (!pointerActivated) return;
      pointerActivated = false;

      const target = event.target && event.target.nodeType === 1
        ? event.target
        : event.target && event.target.parentElement;
      const interactive = target && target.closest(selector);
      if (!interactive || typeof interactive.blur !== 'function') return;

      window.setTimeout(function () {
        interactive.blur();
      }, 0);
    }, true);
  }

  function init() {
    wirePointerBlur();
    if (ui.modal && ui.modal.wireMemberDiffModal) ui.modal.wireMemberDiffModal();
  }

  init();
})();
