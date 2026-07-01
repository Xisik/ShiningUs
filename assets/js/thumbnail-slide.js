// 슬라이드
(function () {
  const slideTrack = document.querySelector("[data-slide-track]");
  if (!slideTrack) return;

  const slides = Array.from(slideTrack.querySelectorAll(".slide"));
  if (slides.length <= 1) return;

  let currentIdx = 0;

  setInterval(function () {
    currentIdx = (currentIdx + 1) % slides.length;
    slideTrack.style.transform = "translateX(-" + currentIdx * 100 + "%)";
  }, 3000);
})();