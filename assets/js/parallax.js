(function () {
  function initParallax() {
    const elements = Array.from(document.querySelectorAll("[data-parallax]"));
    if (!elements.length) return;

    const reducedMotionQuery =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)");
    const desktopQuery =
      window.matchMedia && window.matchMedia("(min-width: 768px)");

    let ticking = false;

    function resetTransforms() {
      elements.forEach((el) => {
        el.style.transform = "";
      });
    }

    function shouldAnimate() {
      if (reducedMotionQuery && reducedMotionQuery.matches) return false;
      return true;
    }

    function updatePositions() {
      ticking = false;

      if (!shouldAnimate()) {
        resetTransforms();
        return;
      }

      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const isDesktop = desktopQuery ? desktopQuery.matches : true;

      elements.forEach((el) => {
        const allowMobile = el.getAttribute("data-parallax-mobile") === "true";
        if (!isDesktop && !allowMobile) {
          el.style.transform = "";
          return;
        }

        const speed = parseFloat(el.getAttribute("data-parallax-speed"));
        const factor = Number.isFinite(speed) ? speed : 0.15;
        const rect = el.getBoundingClientRect();

        // Only compute offset when near or inside viewport
        if (rect.bottom < -150 || rect.top > viewportHeight + 150) {
          return;
        }

        const elementCenter = rect.top + rect.height / 2;
        const viewportCenter = viewportHeight / 2;
        const delta = elementCenter - viewportCenter;
        const offset = Math.round(-delta * factor * 100) / 100;

        el.style.transform = "translate3d(0, " + offset + "px, 0)";
      });
    }

    function onScrollOrResize() {
      if (!ticking) {
        window.requestAnimationFrame(updatePositions);
        ticking = true;
      }
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize, { passive: true });

    if (reducedMotionQuery) {
      const handleMotionChange = function () {
        if (reducedMotionQuery.matches) {
          resetTransforms();
        } else {
          updatePositions();
        }
      };
      if (typeof reducedMotionQuery.addEventListener === "function") {
        reducedMotionQuery.addEventListener("change", handleMotionChange);
      } else if (typeof reducedMotionQuery.addListener === "function") {
        reducedMotionQuery.addListener(handleMotionChange);
      }
    }

    updatePositions();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initParallax);
  } else {
    initParallax();
  }
})();
