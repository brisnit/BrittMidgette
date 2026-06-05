/* ============================================================
   Britt N. Midgette, interactions
   - Client-side password gate (soft gate, not real security)
   - Scroll reveal, mobile nav, marquee duplication, year stamp
   ============================================================ */
(function () {
  "use strict";

  // Soft gate. Obfuscated, not encrypted, matching the original
  // WordPress page-password (a deterrent, not a vault).
  var PASSWORD = "Briz1234";
  var SESSION_KEY = "bnm_unlocked";

  var gate = document.getElementById("gate");
  var site = document.getElementById("site");
  var form = document.getElementById("gate-form");
  var input = document.getElementById("gate-input");
  var error = document.getElementById("gate-error");

  function stampYears() {
    var now = new Date();
    var y = String(now.getFullYear());
    var els = document.querySelectorAll(".year");
    for (var i = 0; i < els.length; i++) els[i].textContent = y;
  }

  function unlock() {
    gate.classList.add("is-hidden");
    gate.setAttribute("aria-hidden", "true");
    site.hidden = false;
    // allow paint before fading in
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        site.classList.add("is-visible");
      });
    });
    window.setTimeout(function () {
      gate.style.display = "none";
    }, 700);
    initSite();
  }

  function reject() {
    error.hidden = false;
    gate.classList.remove("is-shake");
    // reflow to restart animation
    void gate.offsetWidth;
    gate.classList.add("is-shake");
    input.value = "";
    input.focus();
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (input.value === PASSWORD) {
      try { sessionStorage.setItem(SESSION_KEY, "1"); } catch (err) {}
      unlock();
    } else {
      reject();
    }
  });

  // Already unlocked this session?
  var alreadyIn = false;
  try { alreadyIn = sessionStorage.getItem(SESSION_KEY) === "1"; } catch (err) {}

  stampYears();

  if (alreadyIn) {
    unlock();
  } else {
    input.focus();
  }

  /* -------- Site behaviors (run after unlock) -------- */
  var siteInitialized = false;
  function initSite() {
    if (siteInitialized) return;
    siteInitialized = true;

    /* Scroll reveal */
    var reveals = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach(function (el) { io.observe(el); });
    } else {
      reveals.forEach(function (el) { el.classList.add("is-in"); });
    }

    /* Kinetic word rotator in the About lead */
    var rotator = document.querySelector(".rotator");
    var reduceMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;
    if (rotator && !reduceMotion) {
      var words = rotator.querySelectorAll(".rotator__word");
      if (words.length > 1) {
        var ri = 0;
        window.setInterval(function () {
          words[ri].classList.remove("is-active");
          ri = (ri + 1) % words.length;
          words[ri].classList.add("is-active");
        }, 2300);
      }
    }

    /* Transparent header while over the hero video */
    var header = document.querySelector(".header");
    var hero = document.getElementById("hero");
    if (header && hero) {
      var ticking = false;
      function syncHeader() {
        var threshold = hero.offsetHeight - 90;
        header.classList.toggle("header--transparent", window.scrollY < threshold);
        ticking = false;
      }
      window.addEventListener(
        "scroll",
        function () {
          if (!ticking) {
            window.requestAnimationFrame(syncHeader);
            ticking = true;
          }
        },
        { passive: true }
      );
      syncHeader();
    }

    /* Mobile nav (present on the home page only) */
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("nav");
    if (toggle && nav) {
      var closeNav = function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      };
      toggle.addEventListener("click", function () {
        var open = nav.classList.toggle("is-open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
      });
      nav.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeNav);
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeNav();
      });
    }
  }
})();
