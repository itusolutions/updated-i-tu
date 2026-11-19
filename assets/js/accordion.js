(function () {
  function setPanelOpen(trigger, panel, open, instant) {
    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", String(open));
    panel.dataset.open = String(open);

    const icon = trigger.querySelector("[data-accordion-icon]");
    if (icon) {
      icon.classList.toggle("rotate-180", open);
    }

    if (instant) {
      panel.style.transition = "none";
    }

    if (open) {
      panel.classList.remove("hidden");
      panel.style.maxHeight = panel.scrollHeight + "px";
      panel.style.opacity = "1";
    } else {
      panel.style.maxHeight = panel.scrollHeight + "px";
      void panel.offsetHeight; // Force reflow before collapsing
      panel.style.maxHeight = "0px";
      panel.style.opacity = "0";

      if (instant) {
        panel.classList.add("hidden");
      } else {
        window.setTimeout(function () {
          if (panel.dataset.open !== "true") {
            panel.classList.add("hidden");
          }
        }, 260);
      }
    }

    if (instant) {
      void panel.offsetHeight;
      panel.style.transition = "";
    }
  }

  function findPanelForTrigger(trigger) {
    const panelId = trigger.getAttribute("aria-controls") || trigger.getAttribute("data-accordion-target");
    if (panelId) {
      return document.getElementById(panelId.replace(/^#/, ""));
    }

    const container = trigger.closest("[data-accordion-item]") || trigger.parentElement;
    return container ? container.querySelector("[data-accordion-panel]") : null;
  }

  function initAccordions() {
    const triggers = Array.from(document.querySelectorAll("[data-accordion-trigger]"));
    if (!triggers.length) return;

    triggers.forEach((trigger, index) => {
      const panel = findPanelForTrigger(trigger);
      if (!panel) return;

      if (!trigger.id) {
        trigger.id = "accordion-trigger-" + (index + 1);
      }
      if (!panel.id) {
        panel.id = "accordion-panel-" + (index + 1);
      }

      trigger.setAttribute("aria-controls", panel.id);
      panel.setAttribute("aria-labelledby", trigger.id);

      const startsOpen =
        trigger.getAttribute("aria-expanded") === "true" ||
        trigger.getAttribute("data-accordion-open") === "true";

      setPanelOpen(trigger, panel, startsOpen, true);

      trigger.addEventListener("click", function () {
        const isOpen = trigger.getAttribute("aria-expanded") === "true";
        const nextOpen = !isOpen;
        const group = trigger.closest("[data-accordion-group]");

        if (nextOpen && group && group.getAttribute("data-accordion-single") === "true") {
          group.querySelectorAll("[data-accordion-trigger]").forEach((otherTrigger) => {
            if (otherTrigger !== trigger) {
              const otherPanel = findPanelForTrigger(otherTrigger);
              setPanelOpen(otherTrigger, otherPanel, false, false);
            }
          });
        }

        setPanelOpen(trigger, panel, nextOpen, false);
      });
    });

    window.addEventListener(
      "resize",
      function () {
        document.querySelectorAll('[data-accordion-panel][data-open="true"]').forEach((panel) => {
          panel.style.maxHeight = panel.scrollHeight + "px";
        });
      },
      { passive: true }
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAccordions);
  } else {
    initAccordions();
  }
})();
