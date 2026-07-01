(function () {
  "use strict";

  if (!window.IntersectionObserver) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var SELECTORS = ".slides, .card, .activity-card, .statement-card, .join-column-item, .join-item, .contact-item, .pill, .diff-col";
  var STAGGER_MS = 60;
  var elements = Array.from(document.querySelectorAll(SELECTORS));

  if (elements.length === 0) return;

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -32px 0px" }
  );

  elements.forEach(function (el, index) {
    var rect = el.getBoundingClientRect();
    var inView = rect.top < window.innerHeight && rect.bottom > 0;

    el.classList.add("scroll-reveal");

    if (inView) {
      window.setTimeout(function () {
        el.classList.add("is-visible");
      }, index * STAGGER_MS);
    } else {
      io.observe(el);
    }
  });
})();
