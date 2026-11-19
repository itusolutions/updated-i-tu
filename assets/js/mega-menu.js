// Reserved for this feature; implement and test before enabling.
(function () {
  function initMegaMenus() {
    const desktopNav = document.querySelector('header nav[aria-label="Main navigation"]');
    if (!desktopNav) return;

    const triggers = Array.from(desktopNav.querySelectorAll(":scope > div > a, :scope > div > button"));
    const items = triggers
      .map((trigger) => ({
        trigger,
        wrapper: trigger.parentElement,
        panel: trigger.nextElementSibling
      }))
      .filter((entry) => entry.wrapper && entry.panel);

    let pinnedWrapper = null;

    function showPanel(entry) {
      entry.panel.classList.remove("invisible", "opacity-0", "translate-y-2");
      entry.panel.classList.add("visible", "opacity-100", "translate-y-0");
      entry.trigger.setAttribute("aria-expanded", "true");
    }

    function hidePanel(entry) {
      entry.panel.classList.add("invisible", "opacity-0", "translate-y-2");
      entry.panel.classList.remove("visible", "opacity-100", "translate-y-0");
      entry.trigger.setAttribute("aria-expanded", "false");
    }

    function closeAll(exceptWrapper) {
      items.forEach((entry) => {
        if (entry.wrapper !== exceptWrapper) {
          hidePanel(entry);
        }
      });
      if (!exceptWrapper) {
        pinnedWrapper = null;
      }
    }

    items.forEach((entry) => {
      entry.trigger.setAttribute("aria-haspopup", "true");
      entry.trigger.setAttribute("aria-expanded", "false");

      entry.wrapper.addEventListener("mouseenter", function () {
        closeAll(entry.wrapper);
        showPanel(entry);
      });

      entry.wrapper.addEventListener("mouseleave", function () {
        if (pinnedWrapper !== entry.wrapper) {
          hidePanel(entry);
        }
      });

      entry.wrapper.addEventListener("focusin", function () {
        closeAll(entry.wrapper);
        showPanel(entry);
      });

      entry.wrapper.addEventListener("focusout", function (event) {
        if (!entry.wrapper.contains(event.relatedTarget) && pinnedWrapper !== entry.wrapper) {
          hidePanel(entry);
        }
      });

      // Allow click toggle on touch devices or when a dropdown item has a sub-panel
      entry.trigger.addEventListener("click", function (event) {
        const isCoarsePointer =
          window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        const isPanelOpen = entry.trigger.getAttribute("aria-expanded") === "true";

        if (isCoarsePointer && (!isPanelOpen || pinnedWrapper !== entry.wrapper)) {
          event.preventDefault();
          closeAll(entry.wrapper);
          pinnedWrapper = entry.wrapper;
          showPanel(entry);
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (!desktopNav.contains(event.target)) {
        closeAll(null);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        const activeEntry = items.find((entry) => entry.wrapper.contains(document.activeElement));
        closeAll(null);
        if (activeEntry) {
          activeEntry.trigger.focus();
        }
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMegaMenus);
  } else {
    initMegaMenus();
  }
})();
