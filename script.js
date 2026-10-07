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
            /* A short element can be carried clean past the 12% threshold
               by one fast scroll, and would then never reveal. If it has
               ended up above the viewport, it has been read past: show it. */
            if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
              entry.target.classList.add("is-in");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach(function (el) { io.observe(el); });

      /* Safety net. A short element can be carried clean through the
         observer's threshold by one fast scroll, so no entry is ever
         delivered and it stays invisible for good. On each scroll,
         reveal anything that has reached the point the observer would
         have fired at anyway. The observer still does the normal work;
         this only catches what it missed. */
      var sweeping = false;
      var sweep = function () {
        var left = 0;
        reveals.forEach(function (el) {
          if (el.classList.contains("is-in")) return;
          if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
            el.classList.add("is-in");
            io.unobserve(el);
          } else { left += 1; }
        });
        sweeping = false;
        if (!left) window.removeEventListener("scroll", onScroll);
      };
      var onScroll = function () {
        if (!sweeping) { sweeping = true; window.requestAnimationFrame(sweep); }
      };
      window.addEventListener("scroll", onScroll, { passive: true });
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

    /* Copy the address to the clipboard, and say so. The label returns on its
       own, and the live region announces it for anyone not watching the button. */
    var copyBtn = document.querySelector(".header__copy");
    if (copyBtn) {
      var label = copyBtn.querySelector(".header__copy-label");
      var original = label.textContent;
      var status = document.createElement("span");
      status.className = "sr-only";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      copyBtn.parentNode.insertBefore(status, copyBtn.nextSibling);
      var resetTimer;

      function say(text, ok) {
        label.textContent = text;
        status.textContent = text;
        copyBtn.classList.toggle("is-done", !!ok);
        window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(function () {
          label.textContent = original;
          status.textContent = "";
          copyBtn.classList.remove("is-done");
        }, 2200);
      }

      copyBtn.addEventListener("click", function () {
        var email = copyBtn.getAttribute("data-email");
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(email).then(
            function () { say("Copied", true); },
            function () { say(email, false); }
          );
          return;
        }
        // older browsers, or a page served without https
        try {
          var ta = document.createElement("textarea");
          ta.value = email;
          ta.setAttribute("readonly", "");
          ta.style.position = "fixed";
          ta.style.top = "-1000px";
          document.body.appendChild(ta);
          ta.select();
          var ok = document.execCommand("copy");
          document.body.removeChild(ta);
          say(ok ? "Copied" : email, ok);
        } catch (err) {
          say(email, false);
        }
      });
    }

    /* ------------------------------------------------------------
       MOTION
       Everything here is additive: if any of it fails the page is
       still readable, and each piece checks for reduced motion.
       ------------------------------------------------------------ */
    var calmMotion = window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

    /* Media fades up once it has actually decoded, which matters now
       that almost everything below the fold loads lazily. The flag on
       <html> is what lets the stylesheet hide un-decoded media, so it
       is only set once this code is running. */
    (function fadeMediaIn() {
      var media = document.querySelectorAll(
        ".ed-media img, .ed-proj__media img, .ed-portrait img, .t-face img, .ed-media video"
      );
      if (!media.length) return;
      document.documentElement.setAttribute("data-fade-media", "");
      media.forEach(function (el) {
        var done = function () { el.classList.add("is-loaded"); };
        if (el.tagName === "VIDEO") { done(); return; }
        if (el.complete && el.naturalWidth > 0) { done(); return; }
        el.addEventListener("load", done, { once: true });
        /* A broken file must not stay invisible. */
        el.addEventListener("error", done, { once: true });
      });
      /* Backstop: never leave media hidden, whatever the events do. */
      window.setTimeout(function () {
        media.forEach(function (el) { el.classList.add("is-loaded"); });
      }, 6000);
    })();

    /* Number the children of a few groups so they can come in one
       after another. Numbering restarts on each visual row, because a
       card that scrolls into view by itself should not sit waiting out
       the delay earned by the eleven cards above it. Index only; the
       delay itself lives in the CSS. */
    (function stagger() {
      [".ed-work", ".t-track", ".ed-case__meta", ".home-hero__role"].forEach(function (sel) {
        var group = document.querySelector(sel);
        if (!group) return;
        var rowTop = null, col = 0;
        Array.prototype.forEach.call(group.children, function (child) {
          var top = child.offsetTop;
          if (rowTop === null || Math.abs(top - rowTop) > 4) { rowTop = top; col = 0; }
          child.style.setProperty("--i", col);
          col += 1;
        });
      });
    })();

    /* Anchor links must clear the sticky header. Its height changes when
       it wraps on a narrow screen, so measure it rather than guessing:
       the stylesheet's fixed scroll-padding was 12px short on desktop
       and 55px short once the header wrapped. */
    (function clearStickyHeader() {
      var head = document.querySelector(".ed-head");
      if (!head) return;
      var sync = function () {
        var h = Math.round(head.getBoundingClientRect().height);
        document.documentElement.style.scrollPaddingTop = (h + 16) + "px";
      };
      sync();
      window.addEventListener("resize", sync, { passive: true });
      if (window.ResizeObserver) new ResizeObserver(sync).observe(head);
    })();

    /* The editorial header lifts off the page once you leave the top. */
    (function stickHeader() {
      var head = document.querySelector(".ed-head");
      if (!head) return;
      var pending = false;
      var sync = function () {
        head.classList.toggle("is-stuck", window.scrollY > 4);
        pending = false;
      };
      window.addEventListener("scroll", function () {
        if (!pending) { pending = true; window.requestAnimationFrame(sync); }
      }, { passive: true });
      sync();
    })();

    /* Reading progress, on the long case studies only. */
    (function readingBar() {
      if (calmMotion || !document.body.hasAttribute("data-case")) return;
      var bar = document.createElement("div");
      bar.className = "read-bar";
      bar.setAttribute("aria-hidden", "true");
      document.body.appendChild(bar);
      var pending = false;
      var sync = function () {
        var run = document.documentElement.scrollHeight - window.innerHeight;
        var p = run > 0 ? window.scrollY / run : 0;
        bar.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
        pending = false;
      };
      window.addEventListener("scroll", function () {
        if (!pending) { pending = true; window.requestAnimationFrame(sync); }
      }, { passive: true });
      window.addEventListener("resize", sync, { passive: true });
      sync();
    })();

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
