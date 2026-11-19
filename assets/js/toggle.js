(function () {
  var STORAGE_KEY = "itu-theme";
  var MODES = ["light", "dark", "system"];
  var LIGHT_CHROME = "#ffffff";
  var DARK_CHROME = "#020617";
  var root = document.documentElement;
  var tooltipHideTimer = null;

  function getSystemDark() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  }

  function getSavedMode() {
    try {
      var saved = localStorage.getItem(STORAGE_KEY);
      return MODES.indexOf(saved) !== -1 ? saved : "system";
    } catch (e) {
      return "system";
    }
  }

  function saveMode(mode) {
    try {
      if (mode === "system") {
        localStorage.removeItem(STORAGE_KEY);
      } else {
        localStorage.setItem(STORAGE_KEY, mode);
      }
    } catch (e) {}
  }

  function resolveIsDark(mode) {
    if (mode === "dark") return true;
    if (mode === "light") return false;
    return getSystemDark();
  }

  function getNextMode(currentMode) {
    var idx = MODES.indexOf(currentMode);
    return MODES[(idx + 1) % MODES.length];
  }

  function formatLabel(mode) {
    if (mode === "light") return "Light";
    if (mode === "dark") return "Dark";
    return "System";
  }

  function syncThemeColorMeta(isDark) {
    var meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;

    if (!meta.dataset.lightColor) {
      meta.dataset.lightColor = meta.getAttribute("content") || LIGHT_CHROME;
    }
    meta.setAttribute("content", isDark ? DARK_CHROME : meta.dataset.lightColor);
  }

  function flashTooltip(tooltip) {
    if (!tooltip) return;
    tooltip.classList.remove("invisible", "opacity-0", "translate-y-1");
    tooltip.classList.add("visible", "opacity-100", "translate-y-0");

    if (tooltipHideTimer) {
      window.clearTimeout(tooltipHideTimer);
    }

    tooltipHideTimer = window.setTimeout(function () {
      tooltip.classList.remove("visible", "opacity-100", "translate-y-0");
      tooltip.classList.add("invisible", "opacity-0", "translate-y-1");
    }, 1500);
  }

  function syncToggleButtons(mode, isDark, showFeedback) {
    var nextMode = getNextMode(mode);
    var labelText = "Theme: " + formatLabel(mode);
    var ariaText =
      labelText + " (click to switch to " + formatLabel(nextMode) + ")";

    var buttons = document.querySelectorAll("[data-theme-toggle]");
    buttons.forEach(function (btn) {
      btn.dataset.themeState = mode;
      btn.setAttribute("aria-label", ariaText);
      btn.setAttribute("title", ariaText);

      var icons = btn.querySelectorAll("[data-theme-icon]");
      icons.forEach(function (icon) {
        var iconMode = icon.getAttribute("data-theme-icon");
        icon.classList.toggle("hidden", iconMode !== mode);
      });

      var wrapper = btn.parentElement;
      var tooltip = wrapper ? wrapper.querySelector("[data-theme-tooltip]") : null;
      if (tooltip) {
        tooltip.textContent = labelText;
        if (showFeedback) {
          flashTooltip(tooltip);
        }
      }
    });
  }

  function applyThemeMode(mode, persist, showFeedback) {
    var validMode = MODES.indexOf(mode) !== -1 ? mode : "system";
    var isDark = resolveIsDark(validMode);

    root.classList.toggle("dark", isDark);
    root.dataset.theme = isDark ? "dark" : "light";
    root.dataset.themeMode = validMode;
    root.style.colorScheme = isDark ? "dark" : "light";

    if (persist) {
      saveMode(validMode);
    }

    syncThemeColorMeta(isDark);
    syncToggleButtons(validMode, isDark, Boolean(showFeedback));

    window.dispatchEvent(
      new CustomEvent("itu:themechange", {
        detail: {
          mode: validMode,
          theme: isDark ? "dark" : "light",
          isDark: isDark
        }
      })
    );
  }

  function initThemeToggle() {
    var initialMode = getSavedMode();
    applyThemeMode(initialMode, false, false);

    var buttons = document.querySelectorAll("[data-theme-toggle]");
    buttons.forEach(function (btn) {
      if (btn.dataset.toggleBound === "true") return;
      btn.dataset.toggleBound = "true";

      btn.addEventListener("click", function (event) {
        event.preventDefault();
        var currentMode = root.dataset.themeMode || getSavedMode();
        var nextMode = getNextMode(currentMode);
        applyThemeMode(nextMode, true, true);
      });
    });

    // Live-update when OS theme changes while in System mode
    if (window.matchMedia) {
      var media = window.matchMedia("(prefers-color-scheme: dark)");
      var onSystemChange = function () {
        if ((root.dataset.themeMode || getSavedMode()) === "system") {
          applyThemeMode("system", false, false);
        }
      };

      if (typeof media.addEventListener === "function") {
        media.addEventListener("change", onSystemChange);
      } else if (typeof media.addListener === "function") {
        media.addListener(onSystemChange);
      }
    }

    // Sync across open tabs
    window.addEventListener("storage", function (event) {
      if (event.key !== STORAGE_KEY) return;
      var syncedMode = getSavedMode();
      applyThemeMode(syncedMode, false, false);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initThemeToggle);
  } else {
    initThemeToggle();
  }
})();
