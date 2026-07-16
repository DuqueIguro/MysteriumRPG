/* ============================================================
   Academia Mysterium — index.js
   Ambient particle field, scroll reveal, motto typewriter,
   cursor sparkle trail. No dependencies.
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. Ambient particle canvas — drifting arcane motes
     ---------------------------------------------------------- */
  function initParticles() {
    var canvas = document.getElementById("arcane-canvas");
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext("2d");
    var w, h, dpr;
    var palette = ["#eec253", "#9b6bff", "#52e0c4"];
    var particles = [];
    var COUNT = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 16000));

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function Particle() {
      this.reset(true);
    }
    Particle.prototype.reset = function (initial) {
      this.x = Math.random() * w;
      this.y = initial ? Math.random() * h : h + 10;
      this.r = Math.random() * 1.8 + 0.6;
      this.speed = Math.random() * 0.35 + 0.08;
      this.drift = (Math.random() - 0.5) * 0.3;
      this.color = palette[(Math.random() * palette.length) | 0];
      this.alpha = Math.random() * 0.5 + 0.25;
      this.twinkle = Math.random() * Math.PI * 2;
    };
    Particle.prototype.step = function () {
      this.y -= this.speed;
      this.x += this.drift;
      this.twinkle += 0.05;
      if (this.y < -10) this.reset(false);
    };
    Particle.prototype.draw = function () {
      var a = this.alpha * (0.6 + 0.4 * Math.sin(this.twinkle));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.globalAlpha = a;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 6;
      ctx.fill();
    };

    resize();
    for (var i = 0; i < COUNT; i++) particles.push(new Particle());

    var frame;
    function tick() {
      ctx.clearRect(0, 0, w, h);
      ctx.globalAlpha = 1;
      for (var i = 0; i < particles.length; i++) {
        particles[i].step();
        particles[i].draw();
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      frame = requestAnimationFrame(tick);
    }
    tick();

    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
  }

  /* ----------------------------------------------------------
     2. Scroll reveal for .panel blocks
     ---------------------------------------------------------- */
  function initReveal() {
    var panels = document.querySelectorAll(".panel");
    if (!panels.length) return;
    if (!("IntersectionObserver" in window)) {
      panels.forEach(function (p) { p.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    panels.forEach(function (p) { io.observe(p); });
  }

  /* ----------------------------------------------------------
     3. Typewriter effect for the motto
     ---------------------------------------------------------- */
  function initTypewriter() {
    var el = document.querySelector("[data-typewriter]");
    if (!el) return;
    var full = el.getAttribute("data-typewriter");
    if (reduceMotion) {
      el.textContent = full;
      return;
    }
    el.textContent = "";
    var cursor = document.createElement("span");
    cursor.className = "type-cursor";
    cursor.textContent = "▍";

    var i = 0;
    function typeNext() {
      if (i <= full.length) {
        el.textContent = full.slice(0, i);
        el.appendChild(cursor);
        i++;
        setTimeout(typeNext, 55);
      }
    }
    var startTyping = function () {
      typeNext();
      window.removeEventListener("scroll", onScrollStart);
    };
    var started = false;
    function onScrollStart() {
      if (started) return;
      var rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        started = true;
        startTyping();
      }
    }
    window.addEventListener("scroll", onScrollStart);
    onScrollStart();
  }

  /* ----------------------------------------------------------
     4. Cursor sparkle trail
     ---------------------------------------------------------- */
  function initCursorTrail() {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;
    var last = 0;
    window.addEventListener("mousemove", function (e) {
      var now = performance.now();
      if (now - last < 45) return;
      last = now;
      var spark = document.createElement("span");
      spark.className = "spark-trail";
      spark.style.left = e.clientX + "px";
      spark.style.top = e.clientY + "px";
      document.body.appendChild(spark);
      setTimeout(function () { spark.remove(); }, 900);
    });
  }

  /* ----------------------------------------------------------
     5. Quick access buttons — placeholder navigation feedback
     ---------------------------------------------------------- */
  function initAccessButtons() {
    document.querySelectorAll(".access-btn[data-target]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        var target = btn.getAttribute("data-target");
        if (!target || target === "#") {
          e.preventDefault();
          btn.animate(
            [
              { transform: "translateY(-4px) scale(1)" },
              { transform: "translateY(-4px) scale(1.05)" },
              { transform: "translateY(-4px) scale(1)" },
            ],
            { duration: 300 }
          );
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initParticles();
    initReveal();
    initTypewriter();
    initCursorTrail();
    initAccessButtons();
  });
})();