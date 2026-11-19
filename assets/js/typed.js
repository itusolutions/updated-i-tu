<!-- Typed.js & AOS Initialization -->
    document.addEventListener("DOMContentLoaded", function () {
      if (typeof Typed !== "undefined" && document.getElementById("hero-typed")) {
        new Typed("#hero-typed", {
          strings: [
            "Computer Repairs · Polokwane",
            "Hardware Upgrades & Diagnostics",
            "Software & OS Installation",
            "Responsive Website Development"
          ],
          typeSpeed: 45,
          backSpeed: 25,
          backDelay: 1800,
          loop: true
        });
      }
      if (typeof AOS !== "undefined") {
        AOS.init({ once: true, duration: 600 });
      }
    });

