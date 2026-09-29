/* ============================================================
   Britt N. Midgette, interactions
   - Scroll reveal, mobile nav, marquee, logo wobble, year stamp
   ============================================================ */
(function () {
  "use strict";

  var site = document.getElementById("site");

  function stampYears() {
    var now = new Date();
    var y = String(now.getFullYear());
    var els = document.querySelectorAll(".year");
    for (var i = 0; i < els.length; i++) els[i].textContent = y;
  }

  stampYears();

  // The page is no longer gated; the class only drives the fade-in.
  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      site.classList.add("is-visible");
    });
  });
  initSite();

  /* -------- Site behaviours -------- */
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

    /* Sequential highlight around the process loop (approach page) */
    if (!reduceMotion) {
      document.querySelectorAll(".ap-loop").forEach(function (loop) {
        // The seed step and the infinity mark are always-on, so only the
        // repeating steps take the travelling highlight.
        var items = loop.querySelectorAll(
          ".ap-loop__item:not(.ap-loop__item--seed):not(.ap-loop__item--inf)"
        );
        if (!items.length) return;
        var li = -1;
        window.setInterval(function () {
          if (li >= 0) items[li].classList.remove("is-lit");
          li = (li + 1) % items.length;
          items[li].classList.add("is-lit");
        }, 900);
      });
    }

    /* Case study videos: play automatically, loop, no controls.
       They start when scrolled into view rather than on page load, so a
       visitor who never reaches them never downloads them. Respects
       prefers-reduced-motion, which leaves the poster frame showing. */
    var autoVideos = document.querySelectorAll("video[data-autoplay]");
    if (autoVideos.length) {
      var noMotion = window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
      if (!noMotion) {
        if ("IntersectionObserver" in window) {
          var vio = new IntersectionObserver(
            function (entries) {
              entries.forEach(function (entry) {
                var v = entry.target;
                if (entry.isIntersecting) {
                  var play = v.play();
                  if (play && play.catch) play.catch(function () {});
                } else if (!v.paused) {
                  v.pause();
                }
              });
            },
            { threshold: 0.25 }
          );
          autoVideos.forEach(function (v) { vio.observe(v); });
        } else {
          autoVideos.forEach(function (v) {
            var play = v.play();
            if (play && play.catch) play.catch(function () {});
          });
        }
      }
    }

    /* Artifact lightbox (capabilities page). Works with real images and
       with the placeholders that stand in until those images exist. */
    var zoomables = document.querySelectorAll("[data-zoom]");
    if (zoomables.length) {
      var lb = document.createElement("div");
      lb.className = "lb";
      lb.setAttribute("role", "dialog");
      lb.setAttribute("aria-modal", "true");
      lb.setAttribute("aria-label", "Artifact viewer");
      lb.innerHTML =
        '<button class="lb__close" type="button" aria-label="Close">✕</button>' +
        '<div class="lb__inner"></div>';
      document.body.appendChild(lb);

      var lbInner = lb.querySelector(".lb__inner");
      var lbClose = lb.querySelector(".lb__close");
      var lastFocused = null;

      function openLb(media) {
        var img = media.querySelector("img");
        var cap = media.getAttribute("data-cap") || "";
        var ph = media.getAttribute("data-ph") || "";
        var loaded = img && img.naturalWidth > 0;

        lbInner.innerHTML = loaded
          ? '<img src="" alt="" />'
          : '<div class="lb__ph"></div>';
        if (loaded) {
          var full = lbInner.querySelector("img");
          full.src = img.currentSrc || img.src;
          full.alt = img.alt || cap;
        } else {
          lbInner.querySelector(".lb__ph").textContent = ph;
        }
        if (cap) {
          var c = document.createElement("p");
          c.className = "lb__cap";
          c.textContent = cap;
          lbInner.appendChild(c);
        }
        lastFocused = document.activeElement;
        lb.classList.add("is-open");
        document.body.style.overflow = "hidden";
        lbClose.focus();
      }

      function closeLb() {
        lb.classList.remove("is-open");
        document.body.style.overflow = "";
        if (lastFocused && lastFocused.focus) lastFocused.focus();
      }

      zoomables.forEach(function (media) {
        media.addEventListener("click", function () { openLb(media); });
        media.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openLb(media);
          }
        });
      });

      lbClose.addEventListener("click", closeLb);
      lb.addEventListener("click", function (e) {
        if (e.target === lb) closeLb();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && lb.classList.contains("is-open")) closeLb();
      });
    }

    /* Transparent header while over a dark hero */
    var header = document.querySelector(".header");
    var hero = document.getElementById("hero") || document.querySelector(".ap-hero, .cap-hero");
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


    /* One soft hello from the head mark shortly after the home page settles.
       Never repeats, and never runs when reduced motion is requested. */
    if (document.body.classList.contains("is-home")) {
      var mark = document.querySelector(".ed-head__logo");
      var calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (mark && !calm) {
        setTimeout(function () {
          mark.classList.add("is-greeting");
          mark.addEventListener("animationend", function done() {
            mark.classList.remove("is-greeting");
            mark.removeEventListener("animationend", done);
          });
        }, 700);
      }
    }

    /* Testimonials rail: trackpad and touch already work, this only adds
       mouse dragging. A click is suppressed solely once the pointer has
       actually travelled, so links keep working on a plain click. */
    var rail = document.querySelector(".t-rail");
    if (rail && window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      var down = false, moved = false, startX = 0, startLeft = 0;
      rail.classList.add("is-draggable");
      rail.addEventListener("pointerdown", function (e) {
        if (e.button !== 0) return;
        down = true; moved = false;
        startX = e.clientX; startLeft = rail.scrollLeft;
      });
      rail.addEventListener("pointermove", function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (!moved && Math.abs(dx) < 5) return;
        if (!moved) { moved = true; rail.classList.add("is-dragging"); rail.setPointerCapture(e.pointerId); }
        rail.scrollLeft = startLeft - dx;
      });
      var end = function (e) {
        if (!down) return;
        down = false;
        rail.classList.remove("is-dragging");
        if (moved && e && e.pointerId !== undefined && rail.hasPointerCapture(e.pointerId)) {
          rail.releasePointerCapture(e.pointerId);
        }
      };
      rail.addEventListener("pointerup", end);
      rail.addEventListener("pointercancel", end);
      rail.addEventListener("click", function (e) {
        if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; }
      }, true);
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
