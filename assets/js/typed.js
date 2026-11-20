(function () {
  const DEFAULT_STRINGS = [
    "Computer Repairs · Polokwane",
    "Hardware Upgrades & Diagnostics",
    "Software & OS Installation",
    "Responsive Website Development"
  ];

  function prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function isElementHidden(el) {
    if (!el) return true;
    const style = window.getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden") return true;
    // Check ancestors for display: none
    let parent = el.parentElement;
    while (parent && parent !== document.body) {
      const pStyle = window.getComputedStyle(parent);
      if (pStyle.display === "none") return true;
      parent = parent.parentElement;
    }
    return false;
  }

  function parseStrings(el) {
    const raw =
      el.getAttribute("data-typed-strings") ||
      (el.closest("[data-typed-strings]") &&
        el.closest("[data-typed-strings]").getAttribute("data-typed-strings"));

    if (!raw) return DEFAULT_STRINGS.slice();

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(String);
      }
    } catch (e) {
      const split = raw.split("|").map((s) => s.trim()).filter(Boolean);
      if (split.length > 0) return split;
    }

    return DEFAULT_STRINGS.slice();
  }

  function mountTyped(el) {
    if (!el || el.dataset.typedInitialized === "true") return;
    if (isElementHidden(el)) return;

    const strings = parseStrings(el);

    if (prefersReducedMotion()) {
      el.dataset.typedInitialized = "true";
      el.textContent = strings[0] || "";
      return;
    }

    if (typeof window.Typed === "function") {
      el.dataset.typedInitialized = "true";
      new window.Typed(el, {
        strings: strings,
        typeSpeed: Number(el.getAttribute("data-type-speed")) || 45,
        backSpeed: Number(el.getAttribute("data-back-speed")) || 25,
        backDelay: Number(el.getAttribute("data-back-delay")) || 1800,
        startDelay: Number(el.getAttribute("data-start-delay")) || 200,
        loop: el.getAttribute("data-loop") !== "false",
        smartBackspace: true
      });
    } else {
      el.textContent = strings[0] || "";
    }
  }

  function collectTargets() {
    const targets = new Set();
    // Support multiple [data-typed] elements (mobile, tablet, desktop)
    document.querySelectorAll("[data-typed]").forEach((el) => targets.add(el));
    // Fallback if only #hero-typed is used
    if (targets.size === 0) {
      document.querySelectorAll("#hero-typed").forEach((el) => targets.add(el));
    }
    return Array.from(targets);
  }

  function initTyped(attempt) {
    const tries = attempt || 0;
    const targets = collectTargets();

    targets.forEach(mountTyped);

    // If Typed CDN script hasn't finished loading yet, retry briefly
    if (typeof window.Typed !== "function" && tries < 25) {
      window.setTimeout(function () {
        initTyped(tries + 1);
      }, 120);
    }
  }

  function refreshOnViewportChange() {
    collectTargets().forEach(mountTyped);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initTyped(0);
    });
  } else {
    initTyped(0);
  }

  window.addEventListener("resize", refreshOnViewportChange, { passive: true });
  window.addEventListener("orientationchange", refreshOnViewportChange, { passive: true });
})();
