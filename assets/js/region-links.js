(function () {
  'use strict';

  document.querySelectorAll('.branch-header .contact-phone .link').forEach(function (el) {
    el.addEventListener('click', function (event) {
      event.stopPropagation();
    });
  });
})();
