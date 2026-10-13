(function () {
  var d = document,
    root = d.documentElement,
    rm = matchMedia("(prefers-reduced-motion:reduce)").matches;
  var $ = function (s, c) {
    return (c || d).querySelectorAll(s);
  };

  /* intro curtain */
  var pre = d.getElementById("pre");
  if (rm) pre.remove();
  else
    setTimeout(function () {
      pre.classList.add("off");
      setTimeout(function () {
        pre.remove();
      }, 1900);
    }, 900);

  /* theme */
  try {
    var s = localStorage.getItem("theme");
    if (s) root.setAttribute("data-theme", s);
  } catch (e) {}
  d.getElementById("theme").addEventListener("click", function () {
    var t = root.getAttribute("data-theme"),
      light =
        t === "light" ||
        (!t && matchMedia("(prefers-color-scheme:light)").matches),
      n = light ? "dark" : "light";
    root.setAttribute("data-theme", n);
    try {
      localStorage.setItem("theme", n);
    } catch (e) {}
  });

  /* hero name: letter-by-letter entrance */
  var h = d.getElementById("name"),
    txt = h.textContent;
  h.textContent = "";
  txt.split("").forEach(function (c, i) {
    if (c === " ") {
      h.appendChild(d.createTextNode(" "));
      return;
    }
    var sp = d.createElement("span");
    sp.className = "ch" + (c === "." ? " dot" : "");
    sp.textContent = c;
    sp.style.setProperty("--i", i);
    h.appendChild(sp);
  });

  /* typewriter */
  var role = d.getElementById("role"),
    words = [
      "Java applications.",
      "React interfaces.",
      "JavaFX desktop tools.",
      "clean, usable designs.",
    ],
    wi = 0,
    ci = 0,
    del = false;
  function tick() {
    var w = words[wi];
    ci += del ? -1 : 1;
    role.textContent = w.slice(0, ci);
    var t = del ? 35 : 75;
    if (!del && ci === w.length) {
      del = true;
      t = 1600;
    } else if (del && ci === 0) {
      del = false;
      wi = (wi + 1) % words.length;
      t = 350;
    }
    setTimeout(tick, t);
  }
  if (rm) role.textContent = words[0];
  else setTimeout(tick, 2000);

  /* scroll progress + active nav link */
  var bar = d.getElementById("bar");
  addEventListener(
    "scroll",
    function () {
      var m = root.scrollHeight - innerHeight;
      bar.style.width = (m > 0 ? (scrollY / m) * 100 : 0) + "%";
      root.style.setProperty("--sy", scrollY);
    },
    { passive: true },
  );
  var links = $(".links a.l"),
    secs = $("main section");
  var so = new IntersectionObserver(
    function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting)
          links.forEach(function (l) {
            l.classList.toggle(
              "on",
              l.getAttribute("href") === "#" + x.target.id,
            );
          });
      });
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  secs.forEach(function (e) {
    so.observe(e);
  });

  /* reveal, chip stagger and counters */
  $(".chips").forEach(function (c) {
    $("span", c).forEach(function (s, i) {
      s.style.setProperty("--k", i);
    });
  });
  function count(el) {
    var n = +el.dataset.n,
      i = 0;
    var id = setInterval(
      function () {
        i++;
        el.textContent = i;
        if (i >= n) clearInterval(id);
      },
      rm ? 0 : 260,
    );
  }
  var els = $(".rv");
  var io = new IntersectionObserver(
    function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        x.target.classList.add("in");
        io.unobserve(x.target);
        $("[data-n]", x.target).forEach(count);
      });
    },
    { threshold: 0.15 },
  );
  els.forEach(function (e, i) {
    e.style.transitionDelay = (i % 3) * 90 + "ms";
    io.observe(e);
  });

  /* cursor glow, card spotlight + tilt, magnetic buttons (mouse only) */
  if (matchMedia("(pointer:fine)").matches && !rm) {
    var hero = d.querySelector(".hero"),
      pimg = d.querySelector(".photo img");
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      pimg.style.transform =
        "translate(" +
        ((e.clientX - r.left) / r.width - 0.5) * -16 +
        "px," +
        ((e.clientY - r.top) / r.height - 0.5) * -16 +
        "px) scale(1.04)";
    });
    hero.addEventListener("pointerleave", function () {
      pimg.style.transform = "";
    });
    var g = d.getElementById("glow");
    addEventListener(
      "pointermove",
      function (e) {
        g.style.opacity = 1;
        g.style.transform =
          "translate(" + (e.clientX - 210) + "px," + (e.clientY - 210) + "px)";
      },
      { passive: true },
    );
    $(".card").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect(),
          x = e.clientX - r.left,
          y = e.clientY - r.top;
        c.style.setProperty("--mx", x + "px");
        c.style.setProperty("--my", y + "px");
        if (c.classList.contains("tilt"))
          c.style.transform =
            "perspective(800px) rotateX(" +
            (y / r.height - 0.5) * -8 +
            "deg) rotateY(" +
            (x / r.width - 0.5) * 8 +
            "deg) translateY(-4px)";
      });
      c.addEventListener("pointerleave", function () {
        c.style.transform = "";
      });
    });
    $(".mag").forEach(function (b) {
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform =
          "translate(" +
          (e.clientX - r.left - r.width / 2) * 0.18 +
          "px," +
          (e.clientY - r.top - r.height / 2) * 0.3 +
          "px)";
      });
      b.addEventListener("pointerleave", function () {
        b.style.transform = "";
      });
    });
  }

  /* hero particle network */
  var cv = d.getElementById("net"),
    cx = cv.getContext("2d"),
    P = [],
    W,
    H,
    run = true;
  function size() {
    var r = cv.getBoundingClientRect();
    W = cv.width = r.width;
    H = cv.height = r.height;
    P = [];
    for (var i = 0; i < Math.min(55, W / 22); i++)
      P.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
      });
  }
  function draw() {
    if (run) {
      var col =
        getComputedStyle(root).getPropertyValue("--a").trim() || "#8b7bff";
      cx.clearRect(0, 0, W, H);
      cx.fillStyle = cx.strokeStyle = col;
      P.forEach(function (p, i) {
        if (!rm) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        cx.globalAlpha = 0.8;
        cx.beginPath();
        cx.arc(p.x, p.y, 1.8, 0, 6.3);
        cx.fill();
        for (var j = i + 1; j < P.length; j++) {
          var q = P[j],
            dx = p.x - q.x,
            dy = p.y - q.y,
            dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            cx.globalAlpha = (1 - dist / 130) * 0.35;
            cx.beginPath();
            cx.moveTo(p.x, p.y);
            cx.lineTo(q.x, q.y);
            cx.stroke();
          }
        }
      });
    }
    if (!rm) requestAnimationFrame(draw);
  }
  size();
  draw();
  addEventListener("resize", size);
  new IntersectionObserver(function (en) {
    run = en[0].isIntersecting;
  }).observe(cv);
})();
