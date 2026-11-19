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

  function parseStrings(el) {
    const raw = el.getAttribute("data-typed-strings");
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
    el.dataset.typedInitialized = "true";

    const strings = parseStrings(el);

    if (prefersReducedMotion()) {
      el.textContent = strings[0] || "";
      return;
    }

    if (typeof window.Typed === "function") {
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

  function initTyped() {
    const targets = new Set();

    const heroTarget = document.getElementById("hero-typed");
    if (heroTarget) targets.add(heroTarget);

    document.querySelectorAll("[data-typed]").forEach((el) => targets.add(el));

    targets.forEach(mountTyped);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTyped);
  } else {
    initTyped();
  }
})();
