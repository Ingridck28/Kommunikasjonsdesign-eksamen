/*
  Form & Field
  Handles the mobile menu and the footer year.
  The layout itself is CSS. This file only adds behaviour.
*/

(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");
  const label = toggle ? toggle.querySelector(".sr-only") : null;
  const year = document.querySelector("[data-year]");

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (!toggle || !nav) {
    return;
  }

  function setOpen(isOpen) {
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));

    if (label) {
      label.textContent = isOpen ? "Close menu" : "Open menu";
    }
  }

  toggle.addEventListener("click", function (event) {
    event.stopPropagation();
    setOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      setOpen(false);
    });
  });

  document.addEventListener("click", function (event) {
    if (!nav.classList.contains("is-open")) {
      return;
    }

    /* The button handles its own toggle. Ignore clicks on it here. */
    if (toggle.contains(event.target) || nav.contains(event.target)) {
      return;
    }

    setOpen(false);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setOpen(false);
      toggle.focus();
    }
  });

  /* Close the panel if the window grows back to the desktop layout. */
  window.addEventListener("resize", function () {
    if (window.innerWidth > 860 && nav.classList.contains("is-open")) {
      setOpen(false);
    }
  });
})();

(function () {
  const root = document.querySelector("[data-carousel]");

  if (!root) {
    return;
  }

  const slides = Array.from(root.querySelectorAll(".carousel-slide"));
  const dots = Array.from(root.querySelectorAll(".carousel-dot"));
  const status = root.querySelector(".carousel-status");
  const viewport = root.querySelector(".carousel-viewport");
  let index = 0;

  function show(nextIndex) {
    index = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle("is-active", slideIndex === index);
    });

    dots.forEach(function (dot, dotIndex) {
      if (dotIndex === index) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    if (status) {
      status.textContent = (index + 1) + " / " + slides.length;
    }
  }

  root.querySelector(".carousel-prev").addEventListener("click", function () {
    show(index - 1);
  });

  root.querySelector(".carousel-next").addEventListener("click", function () {
    show(index + 1);
  });

  dots.forEach(function (dot, dotIndex) {
    dot.addEventListener("click", function () {
      show(dotIndex);
    });
  });

  root.addEventListener("keydown", function (event) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
    }
  });

  let startX = 0;
  let tracking = false;

  viewport.addEventListener("pointerdown", function (event) {
    if (event.target.closest(".carousel-control")) {
      return;
    }

    tracking = true;
    startX = event.clientX;
  });

  viewport.addEventListener("pointerup", function (event) {
    if (!tracking) {
      return;
    }

    tracking = false;
    const distance = event.clientX - startX;

    if (Math.abs(distance) < 40) {
      return;
    }

    show(distance < 0 ? index + 1 : index - 1);
  });

  viewport.addEventListener("pointercancel", function () {
    tracking = false;
  });

  show(0);
})();

(function () {
  const poll = document.querySelector(".poll");

  if (!poll) {
    return;
  }

  const options = Array.from(poll.querySelectorAll(".poll-option"));
  const thanks = poll.querySelector(".poll-thanks");

  options.forEach(function (option) {
    option.addEventListener("click", function () {
      options.forEach(function (item) {
        item.setAttribute("aria-pressed", String(item === option));
      });

      if (thanks) {
        thanks.hidden = false;
      }
    });
  });
})();
