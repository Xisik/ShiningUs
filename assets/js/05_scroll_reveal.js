(function () {
  // IntersectionObserver 미지원 또는 모션 감소 설정 시 스킵
  if (!window.IntersectionObserver) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var SELECTORS = ".slides, .card, .activity-card, .statement-card, .join-item, .contact-item, .pill, .diff-col";
  var STAGGER_MS = 80;

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

  function observe(el, delayOverride) {
    if (el.dataset.revealDone) return;
    el.dataset.revealDone = "1";

    var rect = el.getBoundingClientRect();
    var inView = rect.top < window.innerHeight && rect.bottom > 0;

    el.classList.add("scroll-reveal");

    if (inView) {
      // 이미 뷰포트 안에 있으면 딜레이만큼 기다린 후 즉시 등장
      var delay = typeof delayOverride === "number" ? delayOverride : 0;
      window.setTimeout(function () {
        el.classList.add("is-visible");
      }, delay);
    } else {
      // 뷰포트 밖이면 스크롤 시 등장
      io.observe(el);
    }
  }

  // 페이지 로드 시 정적 요소 등록 (스태거)
  document.querySelectorAll(SELECTORS).forEach(function (el, i) {
    observe(el, i * STAGGER_MS);
  });

  // 동적으로 추가되는 요소 (활동/성명 카드 등) 감지
  var mo = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (node) {
        if (node.nodeType !== 1) return;
        if (node.matches && node.matches(SELECTORS)) {
          observe(node, 0);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll(SELECTORS).forEach(function (el, i) {
            observe(el, i * STAGGER_MS);
          });
        }
      });
    });
  });

  mo.observe(document.body, { childList: true, subtree: true });
})();
