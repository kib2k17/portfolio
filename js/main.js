(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  var navLinks = document.querySelectorAll(".float-nav-link");
  var sectionIds = ["top", "portfolio", "experience", "skills", "contact"];
  var sections = sectionIds
    .map(function (id) {
      return document.getElementById(id);
    })
    .filter(Boolean);

  function setActiveNav(hash) {
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href") || "";
      var isHome = href === "#top" || href === "#";
      var match =
        (hash === "#top" || hash === "" || hash === "#") && isHome
          ? true
          : href && href === hash;
      link.classList.toggle("is-active", !!match);
      if (match && isHome) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function onScroll() {
    var offset = 130;
    var activeId = "top";
    for (var i = sections.length - 1; i >= 0; i--) {
      var el = sections[i];
      if (!el) continue;
      if (el.getBoundingClientRect().top <= offset) {
        activeId = el.id;
        break;
      }
    }
    if ((window.scrollY || document.documentElement.scrollTop || 0) < 72) {
      activeId = "top";
    }
    setActiveNav("#" + activeId);
  }

  if (navLinks.length && sections.length && "IntersectionObserver" in window) {
    var ticking = false;
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(function () {
            onScroll();
            ticking = false;
          });
        }
      },
      { passive: true }
    );
    onScroll();
  }

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      var href = link.getAttribute("href") || "";
      if (href.startsWith("#")) {
        setActiveNav(href);
      }
    });
  });

  function initProjectLightbox() {
    var root = document.getElementById("project-lightbox");
    if (!root) return;

    var imgEl = root.querySelector(".project-lightbox__img");
    var captionEl = document.getElementById("project-lightbox-caption");
    var counterEl = root.querySelector(".project-lightbox__counter");
    var closeTargets = root.querySelectorAll("[data-lightbox-close]");
    var prevBtn = root.querySelector(".project-lightbox__prev");
    var nextBtn = root.querySelector(".project-lightbox__next");

    if (
      !imgEl ||
      !captionEl ||
      !counterEl ||
      !prevBtn ||
      !nextBtn ||
      !closeTargets.length
    ) {
      return;
    }

    var activeSlides = [];
    var index = 0;
    var lastFocus = null;
    var isOpen = false;

    var galleries = Array.prototype.slice.call(
      document.querySelectorAll("[data-lightbox-gallery]")
    );
    if (!galleries.length) return;

    function show(at) {
      if (!activeSlides.length) return;
      index =
        ((at % activeSlides.length) + activeSlides.length) % activeSlides.length;
      var slide = activeSlides[index];
      imgEl.src = slide.src;
      imgEl.alt = slide.alt;
      captionEl.textContent = slide.caption;
      counterEl.textContent = index + 1 + " / " + activeSlides.length;
    }

    function open(slides, at) {
      if (!slides.length) return;
      activeSlides = slides;
      lastFocus =
        document.activeElement && typeof document.activeElement.focus === "function"
          ? document.activeElement
          : null;

      show(at);

      root.removeAttribute("hidden");
      root.removeAttribute("aria-hidden");
      root.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      isOpen = true;

      window.requestAnimationFrame(function () {
        if (closeTargets[0] && closeTargets[0].focus) {
          closeTargets[0].focus({ preventScroll: true });
        }
      });
    }

    function close() {
      imgEl.removeAttribute("src");
      imgEl.alt = "";
      captionEl.textContent = "";
      counterEl.textContent = "";
      activeSlides = [];

      root.setAttribute("hidden", "");
      root.setAttribute("aria-hidden", "true");
      root.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      isOpen = false;

      if (lastFocus && typeof lastFocus.focus === "function") {
        lastFocus.focus({ preventScroll: true });
      }
    }

    function onKey(ev) {
      if (!isOpen) return;
      var k = ev.key;

      if (k === "Escape") {
        ev.preventDefault();
        close();
      } else if (k === "ArrowLeft") {
        ev.preventDefault();
        show(index - 1);
      } else if (k === "ArrowRight") {
        ev.preventDefault();
        show(index + 1);
      }
    }

    galleries.forEach(function (gallery) {
      var slides = [];
      var figures = gallery.querySelectorAll(".project-gallery__item");
      figures.forEach(function (fig) {
        var btn = fig.querySelector(".project-gallery__trigger");
        var thumb = fig.querySelector("img");
        var capFig = fig.querySelector(".project-gallery__cap");
        if (!btn || !thumb) return;

        var fullAlt =
          thumb.getAttribute("data-full-alt") ||
          (capFig && capFig.textContent.trim()) ||
          "Screenshot preview";
        var caption = capFig ? capFig.textContent.trim() : "";

        var slide = {
          src: thumb.getAttribute("src") || "",
          alt: fullAlt,
          caption: caption,
        };
        var slideIndex = slides.length;
        slides.push(slide);

        btn.setAttribute(
          "aria-label",
          "Open full-screen preview: " +
            (caption || "screenshot") +
            ". Browse with arrow keys inside the viewer."
        );

        btn.addEventListener("click", function () {
          open(slides, slideIndex);
        });
      });
    });

    root.setAttribute("aria-hidden", "true");

    prevBtn.addEventListener("click", function () {
      show(index - 1);
    });

    nextBtn.addEventListener("click", function () {
      show(index + 1);
    });

    closeTargets.forEach(function (el) {
      el.addEventListener("click", function () {
        close();
      });
    });

    document.addEventListener("keydown", onKey);
  }

  function initHeroRoleTypewriter() {
    var heroRole = document.querySelector(".hero-brand-role");
    var typedEl = heroRole ? heroRole.querySelector(".hero-brand-role__typed") : null;
    if (!heroRole || !typedEl) return;

    var full =
      heroRole.getAttribute("data-role-type") || "Full Stack Developer";
    var reduced =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var holdAfterFullMs = 2400;
    var holdAfterEraseMs = 500;
    var eraseMs = 42;

    function applyDone() {
      typedEl.textContent = full;
      heroRole.classList.add("is-done");
    }

    if (reduced) {
      applyDone();
      return;
    }

    function eraseNext(len) {
      if (len <= 0) {
        window.setTimeout(function () {
          typeNext(0);
        }, holdAfterEraseMs);
        return;
      }
      typedEl.textContent = full.slice(0, len - 1);
      window.setTimeout(function () {
        eraseNext(len - 1);
      }, eraseMs);
    }

    function typeNext(i) {
      if (i >= full.length) {
        typedEl.textContent = full;
        window.setTimeout(function () {
          eraseNext(full.length);
        }, holdAfterFullMs);
        return;
      }
      typedEl.textContent = full.slice(0, i + 1);
      var ch = full.charAt(i);
      var pause = ch === " " ? 130 : ch === "-" ? 80 : ch === "'" ? 40 : 60;
      window.setTimeout(function () {
        typeNext(i + 1);
      }, pause);
    }

    function startType() {
      heroRole.classList.remove("is-done");
      typedEl.textContent = "";
      typeNext(0);
    }

    var revealEl = document.querySelector(".hero-brand.reveal");
    var fired = false;
    function kickoff() {
      if (fired) return;
      fired = true;
      window.setTimeout(startType, 420);
    }

    if (!revealEl) {
      kickoff();
      return;
    }

    if (revealEl.classList.contains("is-visible")) {
      kickoff();
      return;
    }

    if ("MutationObserver" in window) {
      var mo = new MutationObserver(function () {
        if (revealEl.classList.contains("is-visible")) {
          mo.disconnect();
          kickoff();
        }
      });
      mo.observe(revealEl, {
        attributes: true,
        attributeFilter: ["class"],
      });
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (revealEl.classList.contains("is-visible")) {
            mo.disconnect();
            kickoff();
          }
        });
      });
    } else {
      kickoff();
    }
  }

  var reveals = document.querySelectorAll("[data-reveal]");
  if (!reveals.length || !("IntersectionObserver" in window)) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
    initHeroRoleTypewriter();
    initProjectLightbox();
    return;
  }

  var prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
    initHeroRoleTypewriter();
    initProjectLightbox();
    return;
  }

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );

  reveals.forEach(function (el) {
    observer.observe(el);
  });

  initHeroRoleTypewriter();
  initProjectLightbox();
})();
