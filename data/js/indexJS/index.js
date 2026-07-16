/* ============================================================
   Academia Mysterium — index.js
   Campo de partículas ambiente, revelação ao rolar a página,
   efeito de digitação no mote e trilha de faísca do cursor.
   Sem dependências externas.
   ============================================================ */

(function () {
  "use strict";

  // Define se o usuário preferiu reduzir as animações da interface.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ----------------------------------------------------------
     1. Campo de partículas ambiente — motas arcanas flutuantes
     ---------------------------------------------------------- */
  // Inicializa o campo de partículas visíveis no fundo da página.
  function initParticles() {
    // Obtém o canvas usado para renderizar as partículas ambientais.
    var canvas = document.getElementById("arcane-canvas");
    if (!canvas || reduceMotion) return;

    // Obtém o contexto bidimensional do canvas para desenho das partículas.
    var ctx = canvas.getContext("2d");

    // Armazena as dimensões e a razão de pixel do canvas.
    var w, h, dpr;
    var palette = ["#eec253", "#9b6bff", "#52e0c4"];
    var particles = [];

    // Calcula a quantidade de partículas conforme o tamanho da tela.
    var COUNT = Math.min(90, Math.floor((window.innerWidth * window.innerHeight) / 16000));

    // Ajusta o tamanho do canvas conforme a resolução da tela.
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

    // Reinicia os valores de uma partícula, definindo sua posição inicial ou reaparecimento.
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

    // Move a partícula no cenário e atualiza seu brilho.
    Particle.prototype.step = function () {
      this.y -= this.speed;
      this.x += this.drift;
      this.twinkle += 0.05;
      if (this.y < -10) this.reset(false);
    };

    // Desenha a partícula no canvas com efeito de brilho.
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

    // Atualiza o quadro da animação a cada ciclo do navegador.
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

    // Controla o redimensionamento da cena após mudanças na janela.
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(resize, 150);
    });
  }

  /* ----------------------------------------------------------
     2. Revelação ao rolar a página para os painéis
     ---------------------------------------------------------- */
  // Inicializa o efeito de revelação de cada painel ao entrar na tela.
  function initReveal() {
    // Seleciona todos os painéis da página.
    var panels = document.querySelectorAll(".panel");
    if (!panels.length) return;
    if (!("IntersectionObserver" in window)) {
      panels.forEach(function (p) { p.classList.add("in-view"); });
      return;
    }

    // Observa os painéis e adiciona a classe quando eles entrarem em vista.
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
     3. Efeito de digitação para o mote principal
     ---------------------------------------------------------- */
  function initTypewriter() {
    // Busca o elemento que contém o texto do mote.
    var el = document.querySelector("[data-typewriter]");
    if (!el) return;

    // Armazena o texto completo que será digitado.
    var full = el.getAttribute("data-typewriter");
    if (reduceMotion) {
      el.textContent = full;
      return;
    }
    el.textContent = "";

    // Cria o cursor visual do efeito de digitação.
    var cursor = document.createElement("span");
    cursor.className = "type-cursor";
    cursor.textContent = "▍";
    var i = 0;

    // Escreve o próximo caractere do mote.
    function typeNext() {
      if (i <= full.length) {
        el.textContent = full.slice(0, i);
        el.appendChild(cursor);
        i++;
        setTimeout(typeNext, 55);
      }
    }

    // Inicia a digitação assim que o elemento entrar na área visível.
    var startTyping = function () {
      typeNext();
      window.removeEventListener("scroll", onScrollStart);
    };

    var started = false;

    // Verifica se o elemento entrou na viewport e inicia a animação.
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
     4. Trilha de faísca sob o cursor
     ---------------------------------------------------------- */
  function initCursorTrail() {
    if (reduceMotion || window.matchMedia("(pointer: coarse)").matches) return;

    // Guarda o último instante em que uma faísca foi criada.
    var last = 0;
    window.addEventListener("mousemove", function (e) {
      var now = performance.now();
      if (now - last < 45) return;
      last = now;

      // Cria um elemento visual temporário para representar a faísca.
      var spark = document.createElement("span");
      spark.className = "spark-trail";
      spark.style.left = e.clientX + "px";
      spark.style.top = e.clientY + "px";
      document.body.appendChild(spark);
      setTimeout(function () { spark.remove(); }, 900);
    });
  }

  /* ----------------------------------------------------------
     5. Botões de acesso rápido — feedback de navegação
     ---------------------------------------------------------- */
  function initAccessButtons() {
    document.querySelectorAll(".access-btn[data-target]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        // Armazena o alvo configurado no botão.
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

  // Inicializa todos os efeitos da página após o carregamento do DOM.
  document.addEventListener("DOMContentLoaded", function () {
    initParticles();
    initReveal();
    initTypewriter();
    initCursorTrail();
    initAccessButtons();
  });
})();