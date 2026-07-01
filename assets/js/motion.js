(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setPageReady() {
    var main = document.querySelector("main");
    if (main) main.classList.add("is-page-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setPageReady);
  } else {
    setPageReady();
  }

  if (reducedMotion) return;

  function createRipple(event, btn) {
    var rect = btn.getBoundingClientRect();
    var point = event.touches && event.touches.length > 0 ? event.touches[0] : event;
    var span = document.createElement("span");

    span.className = "ripple-effect";
    span.style.left = ((point.clientX || 0) - rect.left) + "px";
    span.style.top = ((point.clientY || 0) - rect.top) + "px";
    btn.appendChild(span);

    span.addEventListener("animationend", function () {
      if (span.parentNode) span.parentNode.removeChild(span);
    });
  }

  function handleRippleEvent(event) {
    var btn = event.target && event.target.closest ? event.target.closest(".btn") : null;
    if (btn) createRipple(event, btn);
  }

  document.addEventListener("click", handleRippleEvent);
  document.addEventListener("touchstart", handleRippleEvent, { passive: true });
})();
