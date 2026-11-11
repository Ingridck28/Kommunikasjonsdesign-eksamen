/*
  «Fra tanke til teknologi»
  Interactive timeline for the technology article only.
*/

(function () {
  const root = document.querySelector("[data-ai-timeline]");

  if (!root) {
    return;
  }

  const detail = root.querySelector("[data-timeline-detail]");
  const detailYear = root.querySelector("[data-timeline-detail-year]");
  const detailTitle = root.querySelector("[data-timeline-detail-title]");
  const detailText = root.querySelector("[data-timeline-detail-text]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let activeId = null;
  let fadeTimer = null;

  root.setAttribute("data-ready", "true");

  function getTriggers() {
    return Array.from(root.querySelectorAll("[data-timeline-trigger]"));
  }

  function renderDetail(year, title, text, animate) {
    if (!detail || !detailYear || !detailTitle || !detailText) {
      return;
    }

    function apply() {
      detailYear.textContent = year;
      detailTitle.textContent = title;
      detailText.textContent = text;
      detail.classList.remove("is-changing");
    }

    if (!animate || reduceMotion) {
      apply();
      return;
    }

    detail.classList.add("is-changing");
    window.clearTimeout(fadeTimer);
    fadeTimer = window.setTimeout(apply, 180);
  }

  function showMilestone(trigger, animate) {
    const id = trigger.getAttribute("data-timeline-trigger");
    const year = trigger.getAttribute("data-milestone-year") || "";
    const title = trigger.getAttribute("data-title") || "";
    const text = trigger.getAttribute("data-text") || "";

    if (activeId === id) {
      return;
    }

    activeId = id;

    getTriggers().forEach(function (btn) {
      const selected = btn === trigger;
      btn.setAttribute("aria-pressed", selected ? "true" : "false");
      const item = btn.closest(".ai-timeline-item");
      if (item) {
        item.classList.toggle("is-active", selected);
      }
    });

    renderDetail(year, title, text, animate !== false);
  }

  root.addEventListener("click", function (event) {
    const trigger = event.target.closest("[data-timeline-trigger]");

    if (!trigger || !root.contains(trigger)) {
      return;
    }

    event.preventDefault();
    showMilestone(trigger, true);
  });

  const first = getTriggers()[0];

  if (first) {
    showMilestone(first, false);
  }
})();
