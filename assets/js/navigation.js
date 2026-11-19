(function () {
  function normalizePath(pathname) {
    if (!pathname) return "/";
    const clean = pathname.split("?")[0].split("#")[0];
    if (clean === "/" || clean === "/index.html") return "/";
    return clean.replace(/\/+$/, "").toLowerCase() + "/";
  }

  function initMobileMenu() {
    const button = document.getElementById("mobile-menu-button");
    const menu = document.getElementById("mobile-menu");
    if (!button || !menu) return;

    function setOpen(isOpen) {
      menu.classList.toggle("hidden", !isOpen);
      button.setAttribute("aria-expanded", String(isOpen));
      button.setAttribute(
        "aria-label",
        isOpen ? "Close navigation menu" : "Open navigation menu"
      );
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      setOpen(!isExpanded);
    });

    menu.addEventListener("click", function (event) {
      const link = event.target.closest("a[href]");
      if (link) {
        setOpen(false);
      }
    });

    document.addEventListener("click", function (event) {
      const isExpanded = button.getAttribute("aria-expanded") === "true";
      if (!isExpanded) return;
      if (!menu.contains(event.target) && !button.contains(event.target)) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
        setOpen(false);
        button.focus();
      }
    });

    const desktopMedia = window.matchMedia("(min-width: 768px)");
    const handleViewportChange = function (e) {
      if (e.matches) {
        setOpen(false);
      }
    };
    if (typeof desktopMedia.addEventListener === "function") {
      desktopMedia.addEventListener("change", handleViewportChange);
    } else if (typeof desktopMedia.addListener === "function") {
      desktopMedia.addListener(handleViewportChange);
    }
  }

  function highlightActiveLinks() {
    const currentPath = normalizePath(window.location.pathname);
    const navLinks = document.querySelectorAll("header nav a[href]");

    navLinks.forEach((link) => {
      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
        return;
      }

      const linkPath = normalizePath(href);
      const isMatch = linkPath === currentPath;

      if (isMatch) {
        link.setAttribute("aria-current", "page");
        link.classList.add("bg-blue-50", "text-blue-700", "dark:bg-slate-900", "dark:text-blue-400");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function initSamePageAnchors() {
    const prefersReducedMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    document.addEventListener("click", function (event) {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;

      const targetId = link.getAttribute("href").slice(1);
      if (!targetId) return;

      const target = document.getElementById(targetId);
      if (!target) return;

      event.preventDefault();
      target.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start"
      });

      if (history.pushState) {
        history.pushState(null, "", "#" + targetId);
      }
    });
  }

  function onReady() {
    initMobileMenu();
    highlightActiveLinks();
    initSamePageAnchors();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady);
  } else {
    onReady();
  }
})();
