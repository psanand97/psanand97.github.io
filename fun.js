// =========================================================
// Fun & animations layer — runs after script.js
// =========================================================
(() => {
  const $ = (id) => document.getElementById(id);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const rand = (min, max) => min + Math.random() * (max - min);
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const MATH = ["+", "×", "÷", "π", "√", "∑", "∞", "∫", "Δ", "λ", "Ω", "H₂O", "CO₂", "</>", "01", "⚛", "🧪", "🧬", "🔬"];
  const CELEBRATE = ["🎉", "⭐", "📚", "✏️", "📐", "🎓", "🌟", "✨"];
  const COLORS = ["#4f46e5", "#db2777", "#f59e0b", "#16a34a", "#0284c7", "#7c3aed"];

  // ---------- Particle bursts ----------
  const fxLayer = document.createElement("div");
  fxLayer.className = "fx-layer";
  fxLayer.setAttribute("aria-hidden", "true");
  document.body.appendChild(fxLayer);
  let liveParticles = 0;

  const burst = (x, y, symbols, count = 14, spread = 1) => {
    if (reduceMotion || !fxLayer.animate) return;
    for (let i = 0; i < count && liveParticles < 160; i++) {
      const p = document.createElement("span");
      p.className = "fx-particle";
      p.textContent = pick(symbols);
      p.style.color = pick(COLORS);
      fxLayer.appendChild(p);
      liveParticles++;
      const angle = rand(-Math.PI * 1.05, Math.PI * 0.05);
      const dist = rand(60, 170) * spread;
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;
      const at = (px, py, scale, rot) =>
        `translate(${px}px, ${py}px) translate(-50%, -50%) scale(${scale}) rotate(${rot}deg)`;
      const anim = p.animate(
        [
          { transform: at(x, y, 0.4, 0), opacity: 1 },
          { transform: at(x + dx, y + dy, 1.1, rand(-90, 90)), opacity: 1, offset: 0.55 },
          { transform: at(x + dx * 1.2, y + dy + 120, 0.9, rand(-200, 200)), opacity: 0 },
        ],
        { duration: rand(1100, 1700), easing: "cubic-bezier(.2,.7,.4,1)" }
      );
      const done = () => {
        p.remove();
        liveParticles--;
      };
      anim.onfinish = done;
      anim.oncancel = done;
    }
  };

  // ---------- Browser tab: title + icon change when you leave ----------
  const baseTitle = document.title;
  const iconLinks = [...document.querySelectorAll('link[rel="icon"]')];
  const iconHrefs = iconLinks.map((l) => l.getAttribute("href"));
  const sleepyIcon =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
        '<rect width="64" height="64" rx="14" fill="#f59e0b"/>' +
        '<path d="M14 32q7 7 14 0M36 32q7 7 14 0" stroke="#fff" stroke-width="4.5" fill="none" stroke-linecap="round"/>' +
        '<circle cx="32" cy="47" r="4.5" fill="#fff"/>' +
        '<path d="M44 8h10L44 20h10" stroke="#fff" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
        "</svg>"
    );
  let titleTimer;
  document.addEventListener("visibilitychange", () => {
    clearTimeout(titleTimer);
    if (document.hidden) {
      document.title = "📚 Psst… class is still on!";
      iconLinks.forEach((l) => l.setAttribute("href", sleepyIcon));
    } else {
      document.title = "🎉 Welcome back! | Anjaly Tution Centre";
      iconLinks.forEach((l, i) => l.setAttribute("href", iconHrefs[i]));
      titleTimer = setTimeout(() => (document.title = baseTitle), 2500);
    }
  });

  // ---------- Pencil scroll progress + rocket visibility ----------
  const ppLine = $("ppLine");
  const ppPencil = $("ppPencil");
  const rocket = $("rocketTop");
  let scrollQueued = false;
  const updateScrollFx = () => {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    ppLine.style.transform = `scaleX(${p})`;
    // Pencil tip sits 32.6px into the 34px-wide drawing
    ppPencil.style.transform = `translateX(${p * ppLine.offsetWidth - 32.6}px)`;
    ppPencil.style.opacity = p > 0.003 ? "1" : "0";
    if (!rocket.classList.contains("launch")) rocket.classList.toggle("show", window.scrollY > 700);
  };
  const queueScrollFx = () => {
    if (!scrollQueued) {
      scrollQueued = true;
      requestAnimationFrame(updateScrollFx);
    }
  };
  window.addEventListener("scroll", queueScrollFx, { passive: true });
  window.addEventListener("resize", queueScrollFx);
  updateScrollFx();

  // ---------- Rocket back-to-top ----------
  rocket.addEventListener("click", () => {
    document.querySelector(".logo").focus({ preventScroll: true });
    if (reduceMotion) {
      window.scrollTo({ top: 0 });
      return;
    }
    const r = rocket.getBoundingClientRect();
    burst(r.left + r.width / 2, r.bottom, ["💨", "✨", "⭐", "☁️"], 10, 0.6);
    rocket.classList.add("launch");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  rocket.addEventListener("animationend", (e) => {
    if (e.animationName !== "launch") return;
    // Reset without letting the CSS transition fly the rocket back down the screen
    rocket.style.transition = "none";
    rocket.classList.remove("launch", "show");
    void rocket.offsetWidth;
    rocket.style.transition = "";
    updateScrollFx();
  });

  // ---------- Hero ----------
  const hero = $("home");
  const doodles = hero.querySelector(".hero-doodles");

  // Typewriter: "We make ___"
  const typer = $("typerWord");
  const WORDS = ["Maths easy 🧮", "Physics fun 🧲", "Chemistry click 🧪", "Biology come alive 🧬", "Coding simple 💻"];
  if (!reduceMotion) {
    let wi = 0;
    let ci = Array.from(WORDS[0]).length;
    let dir = -1;
    const step = () => {
      const chars = Array.from(WORDS[wi]);
      ci += dir;
      typer.textContent = chars.slice(0, ci).join("");
      let delay = dir > 0 ? 85 : 40;
      if (dir > 0 && ci >= chars.length) {
        dir = -1;
        delay = 1900;
      } else if (dir < 0 && ci <= 0) {
        dir = 1;
        wi = (wi + 1) % WORDS.length;
        delay = 350;
      }
      setTimeout(step, delay);
    };
    setTimeout(step, 2400);
  }

  // Doodles drift gently away from the mouse
  if (finePointer && !reduceMotion) {
    let mx = 0;
    let my = 0;
    let queued = false;
    const apply = () => {
      queued = false;
      doodles.style.setProperty("--mx", mx.toFixed(3));
      doodles.style.setProperty("--my", my.toFixed(3));
    };
    hero.addEventListener("pointermove", (e) => {
      const r = hero.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!queued) {
        queued = true;
        requestAnimationFrame(apply);
      }
    });
    hero.addEventListener("pointerleave", () => {
      mx = 0;
      my = 0;
      apply();
    });
  }

  // Click / tap empty space in the hero for a burst of maths symbols
  hero.addEventListener("click", (e) => {
    if (e.target.closest("a, button, input, select, textarea")) return;
    burst(e.clientX, e.clientY, MATH, 12);
  });

  // Celebrate an enquiry being sent
  document.querySelectorAll("[data-enquiry-form]").forEach((form) =>
    form.addEventListener("submit", () => {
      const r = form.querySelector("[type=submit]").getBoundingClientRect();
      burst(r.left + r.width / 2, r.top, CELEBRATE, 26, 1.4);
    })
  );

  // ---------- Pause decorative animations off screen ----------
  const pauser = new IntersectionObserver((entries) =>
    entries.forEach((e) => e.target.classList.toggle("is-paused", !e.isIntersecting))
  );
  document.querySelectorAll(".hero, .fun-zone, .cta-banner").forEach((el) => pauser.observe(el));

  // ---------- Angle explorer (protractor) ----------
  const pr = $("protractor");
  const CX = 160;
  const CY = 170;
  const R = 150;
  const ARM = 138;
  const WEDGE = 42;
  const els = {
    arm: $("prArm"),
    knob: $("prKnob"),
    hit: $("prKnobHit"),
    wedge: $("prWedge"),
    value: $("angleValue"),
    type: $("angleType"),
    note: $("angleNote"),
  };

  // Tick marks every 5°, labels every 30°
  let ticks = "";
  for (let a = 0; a <= 180; a += 5) {
    const rad = (a * Math.PI) / 180;
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    const len = a % 30 === 0 ? 16 : a % 10 === 0 ? 11 : 6;
    const cls = a % 10 === 0 ? "pr-tick major" : "pr-tick";
    ticks += `<line class="${cls}" x1="${(CX + R * c).toFixed(1)}" y1="${(CY - R * s).toFixed(1)}" x2="${(CX + (R - len) * c).toFixed(1)}" y2="${(CY - (R - len) * s).toFixed(1)}"/>`;
    if (a % 30 === 0) {
      const lift = a % 180 === 0 ? 12 : 0; // keep 0 and 180 off the baseline
      ticks += `<text class="pr-label" x="${(CX + (R - 30) * c).toFixed(1)}" y="${(CY - (R - 30) * s - lift).toFixed(1)}">${a}</text>`;
    }
  }
  $("prTicks").innerHTML = ticks;

  const describe = (a) => {
    if (a === 0) return ["Zero angle", "Both arms lie on top of each other — that's 0°."];
    if (a < 90) return ["Acute angle", "Acute angles are smaller than 90° — like a slice of pizza! 🍕"];
    if (a === 90) return ["Right angle", "Exactly 90° — the corner of your notebook! 📘"];
    if (a < 180) return ["Obtuse angle", "Between 90° and 180° — like a reclining chair. 🪑"];
    return ["Straight angle", "A perfectly straight line — 180°! 📏"];
  };

  let angle = -1;
  let kind = "";
  const setAngle = (deg, snap = false) => {
    let a = Math.round(Math.min(180, Math.max(0, deg)));
    if (snap && Math.abs(a - 90) <= 2) a = 90;
    if (a === angle) return;
    angle = a;
    const rad = (a * Math.PI) / 180;
    const x = (CX + ARM * Math.cos(rad)).toFixed(1);
    const y = (CY - ARM * Math.sin(rad)).toFixed(1);
    els.arm.setAttribute("x2", x);
    els.arm.setAttribute("y2", y);
    els.knob.setAttribute("cx", x);
    els.knob.setAttribute("cy", y);
    els.hit.setAttribute("cx", x);
    els.hit.setAttribute("cy", y);
    const wx = (CX + WEDGE * Math.cos(rad)).toFixed(1);
    const wy = (CY - WEDGE * Math.sin(rad)).toFixed(1);
    els.wedge.setAttribute("d", a === 0 ? "" : `M${CX} ${CY}L${CX + WEDGE} ${CY}A${WEDGE} ${WEDGE} 0 0 0 ${wx} ${wy}Z`);
    pr.classList.toggle("is-right", a === 90);
    els.value.textContent = `${a}°`;
    const [name, note] = describe(a);
    if (name !== kind) {
      kind = name;
      els.type.textContent = name;
      els.note.textContent = note;
    }
    pr.setAttribute("aria-valuenow", a);
    pr.setAttribute("aria-valuetext", `${a} degrees, ${name.toLowerCase()}`);
  };

  // Gentle demo sweep until the visitor takes over
  let userTookOver = false;
  let sweepRaf = 0;
  let sweepT0 = 0;
  const sweep = (t) => {
    if (!sweepT0) sweepT0 = t - 1500; // start the cosine at 45°
    setAngle(90 - 90 * Math.cos(((t - sweepT0) / 9000) * 2 * Math.PI));
    sweepRaf = requestAnimationFrame(sweep);
  };
  const stopSweep = () => {
    cancelAnimationFrame(sweepRaf);
    sweepRaf = 0;
    sweepT0 = 0;
  };
  const takeOver = () => {
    if (userTookOver) return;
    userTookOver = true;
    stopSweep();
    els.note.setAttribute("aria-live", "polite");
  };
  if (!reduceMotion) {
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !userTookOver && !sweepRaf) sweepRaf = requestAnimationFrame(sweep);
      else if (!e.isIntersecting) stopSweep();
    }).observe(pr);
  }

  const angleFromEvent = (e) => {
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(pr.getScreenCTM().inverse());
    const dx = pt.x - CX;
    const dy = CY - pt.y;
    if (dy < 0) return dx >= 0 ? 0 : 180;
    return (Math.atan2(dy, dx) * 180) / Math.PI;
  };
  let dragging = false;
  els.hit.addEventListener("pointerdown", (e) => {
    takeOver();
    dragging = true;
    pr.classList.add("dragging");
    els.hit.setPointerCapture(e.pointerId);
    setAngle(angleFromEvent(e), true);
    e.preventDefault();
  });
  els.hit.addEventListener("pointermove", (e) => {
    if (dragging) setAngle(angleFromEvent(e), true);
  });
  const endDrag = () => {
    dragging = false;
    pr.classList.remove("dragging");
  };
  els.hit.addEventListener("pointerup", endDrag);
  els.hit.addEventListener("pointercancel", endDrag);
  // Stop the page scrolling while a finger drags the knob
  els.hit.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
  // Tap anywhere else on the protractor to jump the arm there
  pr.addEventListener("click", (e) => {
    if (e.target === els.hit) return;
    takeOver();
    setAngle(angleFromEvent(e), true);
  });
  pr.addEventListener("keydown", (e) => {
    const keys = { ArrowUp: 1, ArrowRight: 1, ArrowDown: -1, ArrowLeft: -1, PageUp: 10, PageDown: -10 };
    let next;
    if (e.key in keys) next = Math.max(0, angle) + keys[e.key] * (e.shiftKey ? 10 : 1);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = 180;
    else return;
    e.preventDefault();
    takeOver();
    setAngle(next);
  });
  setAngle(45);

  // ---------- Subject quiz ----------
  const SUBJECTS = [
    { key: "all", tab: "All" },
    { key: "maths", tab: "Maths", tag: "🧮 Maths" },
    { key: "physics", tab: "Physics", tag: "🧲 Physics" },
    { key: "chemistry", tab: "Chemistry", tag: "🧪 Chemistry" },
    { key: "biology", tab: "Biology", tag: "🧬 Biology" },
    { key: "cs", tab: "Comp Sci", tag: "💻 Computer Science" },
  ];
  const TEASERS = [
    { s: "maths", q: "If 3 pencils cost ₹15, how much do 7 pencils cost?", o: ["₹21", "₹30", "₹35", "₹45"], a: 2, why: "One pencil costs ₹15 ÷ 3 = ₹5, so 7 pencils cost 7 × ₹5 = ₹35." },
    { s: "maths", q: "What comes next? 2, 4, 8, 16, …", o: ["24", "30", "32", "64"], a: 2, why: "Each number doubles: 16 × 2 = 32." },
    { s: "maths", q: "I'm an odd number. Take away one letter and I become even. What am I?", o: ["Three", "Five", "Seven", "Nine"], a: 2, why: "Take the S away from SEVEN and you get EVEN!" },
    { s: "maths", q: "The three angles of a triangle always add up to…", o: ["90°", "180°", "270°", "360°"], a: 1, why: "Every triangle's angles add up to 180° — try it with the protractor!" },
    { s: "maths", q: "At 3 o'clock, what angle do a clock's hands make?", o: ["30°", "60°", "90°", "180°"], a: 2, why: "Hour marks are 30° apart, and 3 × 30° = 90° — a right angle!" },
    { s: "maths", q: "What is the square root of 144?", o: ["11", "12", "14", "72"], a: 1, why: "12 × 12 = 144." },
    { s: "physics", q: "What is the SI unit of force?", o: ["Joule", "Watt", "Newton", "Pascal"], a: 2, why: "1 newton is the force that gives a 1 kg mass an acceleration of 1 m/s²." },
    { s: "physics", q: "A bus travels 120 km in 2 hours. What is its average speed?", o: ["40 km/h", "60 km/h", "120 km/h", "240 km/h"], a: 1, why: "Speed = distance ÷ time = 120 km ÷ 2 h = 60 km/h." },
    { s: "physics", q: "Which colour of visible light has the longest wavelength?", o: ["Violet", "Blue", "Green", "Red"], a: 3, why: "Red light has the longest wavelength (about 700 nm); violet has the shortest." },
    { s: "physics", q: "Light travels fastest through…", o: ["Water", "Glass", "Air", "A vacuum"], a: 3, why: "In a vacuum light moves at about 3 × 10⁸ m/s — any material slows it down." },
    { s: "chemistry", q: "What is the chemical formula of water?", o: ["HO₂", "H₂O", "H₂O₂", "OH"], a: 1, why: "Two hydrogen atoms joined to one oxygen atom. (H₂O₂ is hydrogen peroxide!)" },
    { s: "chemistry", q: "What is the pH of pure water at 25 °C?", o: ["0", "7", "10", "14"], a: 1, why: "Pure water is neutral: below 7 is acidic, above 7 is basic." },
    { s: "chemistry", q: "Which element has the symbol Na?", o: ["Nitrogen", "Neon", "Sodium", "Nickel"], a: 2, why: "Na comes from sodium's Latin name, natrium." },
    { s: "chemistry", q: "How many elements are in the modern periodic table?", o: ["100", "108", "118", "128"], a: 2, why: "118 elements have been discovered and named so far." },
    { s: "biology", q: "Which part of the cell is called its “powerhouse”?", o: ["Nucleus", "Ribosome", "Mitochondria", "Cell wall"], a: 2, why: "Mitochondria release energy from food through cellular respiration." },
    { s: "biology", q: "Which gas do plants take in to make their food?", o: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], a: 2, why: "Plants use carbon dioxide, water and sunlight in photosynthesis." },
    { s: "biology", q: "How many chambers does the human heart have?", o: ["2", "3", "4", "5"], a: 2, why: "Two atria on top and two ventricles below." },
    { s: "biology", q: "What is the largest organ of the human body?", o: ["Liver", "Brain", "Skin", "Lungs"], a: 2, why: "Your skin! In adults it covers about 1.5–2 square metres." },
    { s: "cs", q: "What is the binary number 1010 in decimal?", o: ["8", "10", "12", "1010"], a: 1, why: "1010₂ = 8 + 0 + 2 + 0 = 10. Try it on the Binary Lights board!" },
    { s: "cs", q: "How many bits make one byte?", o: ["4", "8", "16", "32"], a: 1, why: "1 byte = 8 bits — enough for 256 different values." },
    { s: "cs", q: "Which of these is a programming language?", o: ["Excel", "Python", "Chrome", "Windows"], a: 1, why: "Python is a programming language. Excel and Chrome are apps, and Windows is an operating system." },
    { s: "cs", q: "In Python, what does print(2 ** 3) show?", o: ["6", "8", "9", "23"], a: 1, why: "** means “to the power of”, so 2³ = 2 × 2 × 2 = 8." },
    { s: "cs", q: "What does CPU stand for?", o: ["Central Processing Unit", "Computer Power Unit", "Central Program Utility", "Control Panel Unit"], a: 0, why: "The CPU is the computer's “brain” that carries out instructions." },
  ];
  const PRAISE = ["Genius! 🎉", "Brilliant! 🌟", "You nailed it! 🏆", "Super smart! 🚀", "Top of the class! 🎓"];
  const OOPS = ["Oops! Try again 🤔", "So close — have another go! 💪", "Not quite… think again 🧐"];

  const qEl = $("quizQ");
  const tagEl = $("quizTag");
  const optsEl = $("quizOpts");
  const fbEl = $("quizFb");
  const scoreEl = $("quizScore");
  const owl = $("owl");
  let subject = "all";
  const pool = () => [...TEASERS.keys()].filter((i) => subject === "all" || TEASERS[i].s === subject);
  let order = shuffle(pool());
  let pos = 0;
  let score = 0;
  let solved = false;

  const bump = (el) => {
    el.classList.remove("bump");
    void el.offsetWidth; // restart the animation
    el.classList.add("bump");
  };
  const owlMood = (mood) => {
    owl.classList.remove("happy", "sad");
    owl.getBoundingClientRect(); // restart the animation
    owl.classList.add(mood);
  };
  owl.addEventListener("animationend", (e) => {
    if (e.target === owl) owl.classList.remove("happy", "sad");
  });

  const answer = (btn, i, t) => {
    if (solved || btn.getAttribute("aria-disabled") === "true") return;
    if (i === t.a) {
      solved = true;
      btn.classList.add("correct");
      optsEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-disabled", "true"));
      score++;
      scoreEl.textContent = score;
      bump(scoreEl.parentElement);
      const strong = document.createElement("strong");
      strong.textContent = pick(PRAISE);
      fbEl.replaceChildren(strong, ` ${t.why}`);
      const r = btn.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, CELEBRATE, 22, 1.2);
      owlMood("happy");
    } else {
      btn.classList.add("wrong");
      btn.setAttribute("aria-disabled", "true");
      fbEl.textContent = pick(OOPS);
      owlMood("sad");
    }
  };

  const showTeaser = () => {
    const t = TEASERS[order[pos]];
    solved = false;
    tagEl.textContent = SUBJECTS.find((x) => x.key === t.s).tag;
    tagEl.dataset.subject = t.s;
    qEl.textContent = t.q;
    fbEl.textContent = "";
    optsEl.replaceChildren(
      ...t.o.map((text, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "quiz-opt";
        b.textContent = text;
        b.addEventListener("click", () => answer(b, i, t));
        return b;
      })
    );
  };

  // Subject tabs
  const tabs = SUBJECTS.map(({ key, tab }) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "quiz-tab";
    b.textContent = tab;
    b.setAttribute("aria-pressed", String(key === subject));
    b.addEventListener("click", () => {
      if (key === subject) return;
      subject = key;
      tabs.forEach((el, i) => el.setAttribute("aria-pressed", String(SUBJECTS[i].key === key)));
      order = shuffle(pool());
      pos = 0;
      showTeaser();
    });
    return b;
  });
  $("quizTabs").replaceChildren(...tabs);

  $("quizNext").addEventListener("click", () => {
    const last = order[pos];
    pos = (pos + 1) % order.length;
    if (pos === 0) {
      order = shuffle(order);
      // Don't repeat the question that was just shown
      if (order.length > 1 && order[0] === last) [order[0], order[1]] = [order[1], order[0]];
    }
    showTeaser();
  });
  showTeaser();

  // ---------- Binary lights ----------
  const BIT_VALUES = [128, 64, 32, 16, 8, 4, 2, 1];
  const binNote = $("binNote");
  const binScoreEl = $("binScore");
  let binValue = 0;
  let binTarget = 0;
  let binScore = 0;
  let binSolved = false;

  const bitBtns = BIT_VALUES.map((v) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "bit";
    b.setAttribute("aria-pressed", "false");
    b.setAttribute("aria-label", `Bulb worth ${v}`);
    b.innerHTML = `<span class="bulb" aria-hidden="true"></span><span class="bit-val" aria-hidden="true">${v}</span><span class="bit-digit" aria-hidden="true">0</span>`;
    b.addEventListener("click", () => toggleBit(v));
    return b;
  });
  $("bits").replaceChildren(...bitBtns);

  const renderBinary = () => {
    $("binCode").textContent = binValue.toString(2).padStart(8, "0");
    $("binDec").textContent = binValue;
    bitBtns.forEach((b, i) => {
      const on = (binValue & BIT_VALUES[i]) !== 0;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
      b.lastElementChild.textContent = on ? "1" : "0";
    });
  };
  const toggleBit = (v) => {
    binValue ^= v;
    renderBinary();
    if (binSolved) return;
    if (binValue === binTarget) {
      binSolved = true;
      binScore++;
      binScoreEl.textContent = binScore;
      bump(binScoreEl.parentElement);
      binNote.textContent = `🎉 Yes! ${binTarget} in binary is ${binTarget.toString(2).padStart(8, "0")}. Try a new number!`;
      const r = $("binDec").getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, ["💡", "⚡", "1", "0", "✨", "⭐"], 22, 1.2);
    } else if (binValue > binTarget) {
      binNote.textContent = `${binValue} is too big — switch a bulb off.`;
    } else {
      binNote.textContent = `${binValue} so far — you need ${binTarget - binValue} more.`;
    }
  };
  const newTarget = (t) => {
    binTarget = t;
    binSolved = false;
    $("binTarget").textContent = t;
    binNote.textContent = "Each lit bulb adds its value. Add them up to reach the target!";
  };
  $("binNew").addEventListener("click", () => {
    binValue = 0;
    renderBinary();
    let t;
    do t = 1 + Math.floor(Math.random() * 255);
    while (t === binTarget);
    newTarget(t);
  });
  renderBinary();
  newTarget(pick([5, 9, 12, 25, 42]));

  // Owl's eyes follow the pointer
  if (!reduceMotion) {
    const pupils = owl.querySelectorAll(".owl-pupil, .owl-shine");
    let owlVisible = false;
    let px = 0;
    let py = 0;
    let queued = false;
    new IntersectionObserver(([e]) => (owlVisible = e.isIntersecting)).observe(owl);
    const look = () => {
      queued = false;
      const r = owl.getBoundingClientRect();
      const dx = px - (r.left + r.width / 2);
      const dy = py - (r.top + r.height * 0.45);
      const dist = Math.hypot(dx, dy) || 1;
      const k = Math.min(5, dist / 40) / dist;
      pupils.forEach((el) => (el.style.transform = `translate(${(dx * k).toFixed(2)}px, ${(dy * k).toFixed(2)}px)`));
    };
    window.addEventListener(
      "pointermove",
      (e) => {
        px = e.clientX;
        py = e.clientY;
        if (owlVisible && !queued) {
          queued = true;
          requestAnimationFrame(look);
        }
      },
      { passive: true }
    );
  }

  // ---------- Did-you-know ticker: duplicate items for a seamless loop ----------
  const track = $("factsTrack");
  if (!reduceMotion) {
    [...track.children].forEach((li) => {
      const clone = li.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });
    const setTickerSpeed = () => (track.style.animationDuration = `${Math.round(track.scrollWidth / 2 / 45)}s`);
    setTickerSpeed();
    document.fonts?.ready.then(setTickerSpeed);
  }
})();
