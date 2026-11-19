(function () {
  function ensureTopNavAlwaysVisible(desktopNav) {
    const allTopItems = desktopNav.querySelectorAll(":scope > a, :scope > div, :scope > button");
    allTopItems.forEach((el) => {
      el.classList.remove("hidden", "invisible", "opacity-0");
      el.style.visibility = "visible";
      el.style.opacity = "1";
    });

    const directLinks = desktopNav.querySelectorAll(":scope > a, :scope > div > a, :scope > div > button");
    directLinks.forEach((ctrl) => {
      ctrl.classList.remove("hidden", "invisible", "opacity-0");
      ctrl.style.visibility = "visible";
      ctrl.style.opacity = "1";
    });
  }

  function initMegaMenus() {
    const desktopNav = document.querySelector('header nav[aria-label="Main navigation"]');
    if (!desktopNav) return;

    ensureTopNavAlwaysVisible(desktopNav);

    const candidateWrappers = Array.from(desktopNav.querySelectorAll(":scope > div"));
    const items = candidateWrappers
      .map((wrapper) => {
        const trigger = wrapper.querySelector(":scope > a, :scope > button");
        if (!trigger) return null;

        const panel =
          wrapper.querySelector("[data-mega-panel]") ||
          Array.from(wrapper.children).find(
            (el) => el !== trigger && (el.tagName === "DIV" || el.tagName === "UL")
          );

        if (!panel) return null;

        // Ensure smooth CSS transition on panel
        if (!panel.style.transition) {
          panel.style.transition = "opacity 160ms ease, transform 160ms ease, visibility 160ms ease";
        }

        return {
          trigger,
          wrapper,
          panel,
          closeTimer: null
        };
      })
      .filter(Boolean);

    if (!items.length) return;

    let pinnedWrapper = null;

    function clearTimer(entry) {
      if (entry.closeTimer) {
        window.clearTimeout(entry.closeTimer);
        entry.closeTimer = null;
      }
    }

    function keepTopItemVisible(entry) {
      entry.wrapper.classList.remove("hidden", "invisible", "opacity-0");
      entry.wrapper.style.visibility = "visible";
      entry.wrapper.style.opacity = "1";

      entry.trigger.classList.remove("hidden", "invisible", "opacity-0");
      entry.trigger.style.visibility = "visible";
      entry.trigger.style.opacity = "1";
    }

    function showPanel(entry) {
      clearTimer(entry);
      keepTopItemVisible(entry);

      entry.panel.classList.remove("hidden", "invisible", "opacity-0", "translate-y-2");
      entry.panel.classList.add("visible", "opacity-100", "translate-y-0");
      entry.panel.style.visibility = "visible";
      entry.panel.style.opacity = "1";
      entry.panel.style.pointerEvents = "auto";
      entry.trigger.setAttribute("aria-expanded", "true");
    }

    function hidePanel(entry) {
      clearTimer(entry);
      keepTopItemVisible(entry);

      entry.panel.classList.remove("visible", "opacity-100", "translate-y-0");
      entry.panel.classList.add("invisible", "opacity-0", "translate-y-2");
      entry.panel.style.opacity = "0";
      entry.panel.style.visibility = "hidden";
      entry.panel.style.pointerEvents = "none";
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
      hidePanel(entry);

      entry.wrapper.addEventListener("mouseenter", function () {
        clearTimer(entry);
        closeAll(entry.wrapper);
        showPanel(entry);
      });

      entry.wrapper.addEventListener("mouseleave", function () {
        if (pinnedWrapper === entry.wrapper) return;
        clearTimer(entry);
        entry.closeTimer = window.setTimeout(function () {
          hidePanel(entry);
        }, 140);
      });

      entry.panel.addEventListener("mouseenter", function () {
        clearTimer(entry);
        showPanel(entry);
      });

      entry.panel.addEventListener("mouseleave", function () {
        if (pinnedWrapper === entry.wrapper) return;
        clearTimer(entry);
        entry.closeTimer = window.setTimeout(function () {
          hidePanel(entry);
        }, 140);
      });

      entry.wrapper.addEventListener("focusin", function () {
        clearTimer(entry);
        closeAll(entry.wrapper);
        showPanel(entry);
      });

      entry.wrapper.addEventListener("focusout", function (event) {
        if (!entry.wrapper.contains(event.relatedTarget) && pinnedWrapper !== entry.wrapper) {
          clearTimer(entry);
          entry.closeTimer = window.setTimeout(function () {
            if (!entry.wrapper.contains(document.activeElement)) {
              hidePanel(entry);
            }
          }, 100);
        }
      });

      entry.trigger.addEventListener("click", function (event) {
        const isCoarsePointer =
          window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
        const isPanelOpen = entry.trigger.getAttribute("aria-expanded") === "true";

        if (isCoarsePointer && (!isPanelOpen || pinnedWrapper !== entry.wrapper)) {
          event.preventDefault();
          closeAll(entry.wrapper);
          pinnedWrapper = entry.wrapper;
          showPanel(entry);
        } else if (entry.trigger.tagName === "BUTTON") {
          event.preventDefault();
          if (isPanelOpen) {
            pinnedWrapper = null;
            hidePanel(entry);
          } else {
            closeAll(entry.wrapper);
            pinnedWrapper = entry.wrapper;
            showPanel(entry);
          }
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
