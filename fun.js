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
  const COSMIC = ["★", "✦", "✧", "☄️", "🪐", "🌟", "✨", "🌙", "🚀", "☀️"];
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
      document.title = "🎉 Welcome back! | Anjaly Tuition Centre";
      iconLinks.forEach((l, i) => l.setAttribute("href", iconHrefs[i]));
      titleTimer = setTimeout(() => (document.title = baseTitle), 2500);
    }
  });

  // ---------- Pencil scroll progress + rocket visibility ----------
  const ppLine = $("ppLine");
  const ppPencil = $("ppPencil");
  const rocket = $("rocketTop");
  let landing = false; // true from launch until the page is back near the top
  let scrollQueued = false;
  const scrollHooks = []; // more scroll-driven effects register here (see bottom of file)
  const updateScrollFx = () => {
    scrollQueued = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    ppLine.style.transform = `scaleX(${p})`;
    // Pencil tip sits 32.6px into the 34px-wide drawing
    ppPencil.style.transform = `translateX(${p * ppLine.offsetWidth - 32.6}px)`;
    ppPencil.style.opacity = p > 0.003 ? "1" : "0";
    if (landing && window.scrollY <= 700) landing = false;
    if (!landing && !rocket.classList.contains("launch")) rocket.classList.toggle("show", window.scrollY > 700);
    scrollHooks.forEach((fn) => fn(p));
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
    landing = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  window.addEventListener("scrollend", () => {
    landing = false; // in case the visitor interrupts the trip up
    queueScrollFx();
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
      if (hero.classList.contains("is-paused") || document.hidden) {
        setTimeout(step, 500);
        return;
      }
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
    burst(e.clientX, e.clientY, hero.classList.contains("space") ? COSMIC : MATH, 12);
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
    armHit: $("prArmHit"),
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
    els.armHit.setAttribute("x2", x);
    els.armHit.setAttribute("y2", y);
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
  // Stop the demo once the slider has focus (screen readers would read every value) or a mouse is over it
  pr.addEventListener("focus", takeOver);
  pr.addEventListener("pointerenter", (e) => {
    if (e.pointerType === "mouse") takeOver();
  });
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
  const endDrag = () => {
    dragging = false;
    pr.classList.remove("dragging");
  };
  // Both the knob and the whole arm can be grabbed and dragged
  [els.hit, els.armHit].forEach((handle) => {
    handle.addEventListener("pointerdown", (e) => {
      takeOver();
      dragging = true;
      pr.classList.add("dragging");
      handle.setPointerCapture(e.pointerId);
      setAngle(angleFromEvent(e), true);
      e.preventDefault();
    });
    handle.addEventListener("pointermove", (e) => {
      if (dragging) setAngle(angleFromEvent(e), true);
    });
    handle.addEventListener("pointerup", endDrag);
    handle.addEventListener("pointercancel", endDrag);
  });
  // Stop the page scrolling while a finger drags the knob (a swipe along the arm can still scroll)
  els.hit.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
  // Tap anywhere else on the protractor to jump the arm there
  pr.addEventListener("click", (e) => {
    if (e.target === els.hit || e.target === els.armHit) return;
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
    { s: "maths", q: "If 2x + 5 = 17, what is x?", o: ["5", "6", "7", "11"], a: 1, why: "Subtract 5 from both sides: 2x = 12, then divide by 2: x = 6." },
    { s: "maths", q: "What is the value of sin 30°?", o: ["0", "1/2", "√3/2", "1"], a: 1, why: "sin 30° = 1/2 — one of the standard angles worth remembering for board exams." },
    { s: "maths", q: "What comes next? 2, 4, 8, 16, …", o: ["24", "30", "32", "64"], a: 2, why: "Each number doubles: 16 × 2 = 32." },
    { s: "maths", q: "I'm an odd number. Take away one letter and I become even. What am I?", o: ["Three", "Five", "Seven", "Nine"], a: 2, why: "Take the S away from SEVEN and you get EVEN!" },
    { s: "maths", q: "The three angles of a triangle always add up to…", o: ["90°", "180°", "270°", "360°"], a: 1, why: "Every triangle's angles add up to 180° — try it with the protractor!" },
    { s: "maths", q: "At 3 o'clock, what angle do a clock's hands make?", o: ["30°", "60°", "90°", "180°"], a: 2, why: "Hour marks are 30° apart, and 3 × 30° = 90° — a right angle!" },
    { s: "maths", q: "What is the square root of 144?", o: ["11", "12", "14", "72"], a: 1, why: "12 × 12 = 144." },
    { s: "physics", q: "What is the SI unit of force?", o: ["Joule", "Watt", "Newton", "Pascal"], a: 2, why: "1 newton is the force that gives a 1 kg mass an acceleration of 1 m/s²." },
    { s: "physics", q: "A bus travels 120 km in 2 hours. What is its average speed?", o: ["40 km/h", "60 km/h", "120 km/h", "240 km/h"], a: 1, why: "Speed = distance ÷ time = 120 km ÷ 2 h = 60 km/h." },
    { s: "physics", q: "A 2 Ω resistor carries a current of 3 A. What is the voltage across it?", o: ["1.5 V", "5 V", "6 V", "9 V"], a: 2, why: "Ohm's law: V = I × R = 3 A × 2 Ω = 6 V." },
    { s: "physics", q: "Which colour of visible light has the longest wavelength?", o: ["Violet", "Blue", "Green", "Red"], a: 3, why: "Red light has the longest wavelength (about 700 nm); violet has the shortest." },
    { s: "physics", q: "Light travels fastest through…", o: ["Water", "Glass", "Air", "A vacuum"], a: 3, why: "In a vacuum light moves at about 3 × 10⁸ m/s — any material slows it down." },
    { s: "chemistry", q: "What is the chemical formula of water?", o: ["HO₂", "H₂O", "H₂O₂", "OH"], a: 1, why: "Two hydrogen atoms joined to one oxygen atom. (H₂O₂ is hydrogen peroxide!)" },
    { s: "chemistry", q: "What is the pH of pure water at 25 °C?", o: ["0", "7", "10", "14"], a: 1, why: "Pure water is neutral: below 7 is acidic, above 7 is basic." },
    { s: "chemistry", q: "Which element has the symbol Na?", o: ["Nitrogen", "Neon", "Sodium", "Nickel"], a: 2, why: "Na comes from sodium's Latin name, natrium." },
    { s: "chemistry", q: "Avogadro's number is approximately…", o: ["3.0 × 10⁸", "6.022 × 10²³", "9.8", "1.6 × 10⁻¹⁹"], a: 1, why: "One mole of any substance contains about 6.022 × 10²³ particles." },
    { s: "chemistry", q: "How many elements are in the modern periodic table?", o: ["100", "108", "118", "128"], a: 2, why: "118 elements have been discovered and named so far." },
    { s: "biology", q: "Which part of the cell is called its “powerhouse”?", o: ["Nucleus", "Ribosome", "Mitochondria", "Cell wall"], a: 2, why: "Mitochondria release energy from food through cellular respiration." },
    { s: "biology", q: "Which gas do plants take in to make their food?", o: ["Oxygen", "Nitrogen", "Carbon dioxide", "Helium"], a: 2, why: "Plants use carbon dioxide, water and sunlight in photosynthesis." },
    { s: "biology", q: "How many chambers does the human heart have?", o: ["2", "3", "4", "5"], a: 2, why: "Two atria on top and two ventricles below." },
    { s: "biology", q: "Which blood cells help the body fight infections?", o: ["Red blood cells", "White blood cells", "Platelets", "Plasma"], a: 1, why: "White blood cells (leucocytes) attack germs and help defend the body." },
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
  let announceQuestions = false; // stay quiet on the first question at page load

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
    if (announceQuestions) $("quizAnnounce").textContent = `New ${tagEl.textContent.replace(/^\S+\s/, "")} question: ${t.q}`;
    announceQuestions = true;
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
      const current = order[pos];
      subject = key;
      tabs.forEach((el, i) => el.setAttribute("aria-pressed", String(SUBJECTS[i].key === key)));
      order = shuffle(pool());
      if (order.length > 1 && order[0] === current) [order[0], order[1]] = [order[1], order[0]];
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
  const bitsEl = $("bits");
  let bitsTouched = false;
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
  bitsEl.replaceChildren(...bitBtns);
  bitBtns.forEach((b, i) => b.style.setProperty("--n", BIT_VALUES.length - 1 - i));
  if (!reduceMotion) {
    new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || bitsTouched) return;
        bitsEl.classList.remove("chase");
        void bitsEl.offsetWidth;
        bitsEl.classList.add("chase");
      },
      { threshold: 0.6 }
    ).observe(bitsEl);
  }

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
    bitsTouched = true;
    bitsEl.classList.remove("chase");
    binValue ^= v;
    renderBinary();
    if (binValue === binTarget) {
      if (!binSolved) {
        binSolved = true;
        binScore++;
        binScoreEl.textContent = binScore;
        bump(binScoreEl.parentElement);
        const r = $("binDec").getBoundingClientRect();
        burst(r.left + r.width / 2, r.top + r.height / 2, ["💡", "⚡", "1", "0", "✨", "⭐"], 22, 1.2);
      }
      binNote.textContent = `🎉 Yes! ${binTarget} in binary is ${binTarget.toString(2).padStart(8, "0")}. Try a new number!`;
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
    // Touch screens have no pointer to follow, so the owl watches you scroll instead
    if (!finePointer) {
      let lastY = window.scrollY;
      let rest;
      window.addEventListener(
        "scroll",
        () => {
          const dy = Math.sign(window.scrollY - lastY) * 4.5;
          lastY = window.scrollY;
          if (!owlVisible) return;
          pupils.forEach((el) => (el.style.transform = `translate(0px, ${dy}px)`));
          clearTimeout(rest);
          rest = setTimeout(() => pupils.forEach((el) => (el.style.transform = "")), 260);
        },
        { passive: true }
      );
    }
  }

  // ---------- Did-you-know ticker: duplicate items for a seamless loop ----------
  const track = $("factsTrack");
  const factsToggle = $("factsToggle");
  factsToggle.addEventListener("click", () => {
    const paused = track.closest(".facts").classList.toggle("paused");
    factsToggle.setAttribute("aria-pressed", String(paused));
    factsToggle.setAttribute("aria-label", paused ? "Play fun facts" : "Pause fun facts");
    factsToggle.innerHTML = `<i class="fa-solid fa-${paused ? "play" : "pause"}" aria-hidden="true"></i>`;
  });
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
  // =========================================================
  // Scroll-driven fun
  // =========================================================
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const svgEl = (tag, attrs = {}) => {
    const el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    return el;
  };

  // ---------- Staggered entrances: cards flip, pop and swing in ----------
  const funRevealer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("visible");
        funRevealer.unobserve(e.target);
      }),
    { threshold: 0.15 }
  );
  const stagger = (selector, effect, perRow) => {
    document.querySelectorAll(selector).forEach((el, i) => {
      el.style.setProperty("--i", i % perRow);
      el.style.setProperty("--stagger", i % perRow);
      el.classList.add(effect);
      if (!el.classList.contains("reveal")) {
        el.classList.add("reveal");
        funRevealer.observe(el);
      }
    });
  };
  if (!reduceMotion) {
    stagger(".course-card", "reveal-flip", 3);
    stagger(".why", "reveal-pop", 3);
    stagger(".fun-grid .board", "reveal-swing", 2);
    stagger(".loc-info .info-item", "reveal-right", 6);
    stagger(".contact-quick .quick", "reveal-left", 4);
    // Once an element has arrived, drop its stagger delay so hover effects stay snappy
    document.addEventListener("transitionend", (e) => {
      const el = e.target;
      if (e.propertyName === "opacity" && el.classList.contains("visible") && el.style.getPropertyValue("--i")) {
        el.style.setProperty("--i", "0");
      }
    });
  }

  // ---------- Cards come alive in the middle of the screen (phones have no hover) ----------
  if (!reduceMotion) {
    const focusBand = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.target.classList.toggle("in-focus", e.isIntersecting)),
      { rootMargin: "-38% 0px -38% 0px" }
    );
    document.querySelectorAll(".course-card, .why").forEach((el) => focusBand.observe(el));

    // Section labels drop in letter by letter (screen readers get the plain text)
    document.querySelectorAll(".eyebrow").forEach((eb) => {
      const text = eb.textContent;
      const sr = document.createElement("span");
      sr.className = "sr-only";
      sr.textContent = text;
      const letters = Array.from(text).map((ch, i) => {
        const span = document.createElement("span");
        span.className = "ch";
        span.setAttribute("aria-hidden", "true");
        span.style.setProperty("--c", i);
        span.textContent = ch === " " ? "\u00a0" : ch;
        return span;
      });
      eb.replaceChildren(sr, ...letters);
    });
  }

  // ---------- Science lines that draw themselves as you scroll ----------
  const DIVIDER_COLORS = { sine: "#4f46e5", benzene: "#16a34a", ecg: "#db2777", circuit: "#0284c7" };
  const benzeneCentres = (w, h) => {
    const out = [];
    for (let cx = 75; cx + h * 0.36 <= w - 20; cx += 150) out.push(cx);
    return out;
  };
  const dividerPath = (kind, w, h) => {
    const mid = h / 2;
    const f = (n) => n.toFixed(1);
    let d = `M0 ${f(mid)}`;
    if (kind === "sine") {
      const amp = h * 0.32;
      for (let x = 3; x <= w; x += 3) d += `L${x} ${f(mid - amp * Math.sin((x / 180) * 2 * Math.PI))}`;
      return d;
    }
    if (kind === "ecg") {
      const beat = [[60, 0], [72, -0.1], [84, 0], [96, 0], [102, 0.12], [112, -0.42], [122, 0.32], [130, 0], [148, 0], [162, -0.14], [178, 0], [200, 0]];
      for (let x0 = 0; x0 + 200 <= w; x0 += 200) beat.forEach(([dx, dy]) => (d += `L${x0 + dx} ${f(mid + dy * h)}`));
      return d + `L${w} ${f(mid)}`;
    }
    if (kind === "benzene") {
      // Keep it one continuous stroke: dash-based drawing restarts at every "M"
      const r = h * 0.36;
      const k = r * 0.866;
      for (const cx of benzeneCentres(w, h)) {
        const top = `L${f(cx - r / 2)} ${f(mid - k)}L${f(cx + r / 2)} ${f(mid - k)}L${f(cx + r)} ${f(mid)}`;
        d += `L${f(cx - r)} ${f(mid)}${top}L${f(cx + r / 2)} ${f(mid + k)}L${f(cx - r / 2)} ${f(mid + k)}L${f(cx - r)} ${f(mid)}${top}`;
      }
      return d + `L${w} ${f(mid)}`;
    }
    // circuit: a trace with steps and a resistor zig-zag
    const a = h * 0.28;
    for (let x = 0; x + 160 <= w; x += 160) {
      d += `H${x + 40}V${f(mid - a)}H${x + 70}V${f(mid + a)}H${x + 100}V${f(mid)}H${x + 110}`;
      [115, 122, 129, 136, 143].forEach((dx, i) => (d += `L${x + dx} ${f(mid + (i % 2 ? a : -a) * 0.6)}`));
      d += `L${x + 150} ${f(mid)}H${x + 160}`;
    }
    return d + `H${w}`;
  };

  const dividers = [...document.querySelectorAll(".sci-divider")].map((host) => {
    host.style.setProperty("--c", DIVIDER_COLORS[host.dataset.kind]);
    const svg = svgEl("svg", { focusable: "false" });
    const ghost = svgEl("path", { class: "sd-ghost" });
    const line = svgEl("path", { class: "sd-line" });
    const dot = svgEl("circle", { class: "sd-dot", r: 5 });
    svg.append(ghost, line, dot);
    const label = document.createElement("span");
    label.className = "sd-label";
    label.textContent = host.dataset.label;
    host.append(svg, label);
    return { host, kind: host.dataset.kind, svg, ghost, line, dot, label, rings: [], w: 0, h: 0, len: 0, p: -1 };
  });
  const layoutDivider = (dv) => {
    const w = Math.round(dv.host.clientWidth);
    const h = Math.round(dv.host.clientHeight);
    if (!w || !h || (w === dv.w && h === dv.h)) return;
    dv.w = w;
    dv.h = h;
    dv.svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const path = dividerPath(dv.kind, w, h);
    dv.ghost.setAttribute("d", path);
    dv.line.setAttribute("d", path);
    dv.len = dv.line.getTotalLength();
    dv.line.style.strokeDasharray = `${dv.len}`;
    dv.p = -1;
    if (dv.kind === "benzene") {
      // Aromatic inner rings pop in as the drawing dot passes each hexagon
      dv.rings.forEach((c) => c.remove());
      dv.rings = benzeneCentres(w, h).map((cx) => {
        const c = svgEl("circle", { class: "sd-ring", cx, cy: (h / 2).toFixed(1), r: (h * 0.2).toFixed(1) });
        dv.line.after(c);
        return c;
      });
    }
  };
  const drawDivider = (dv, top, vh) => {
    // 0 when the line enters at the bottom of the screen, 1 once it reaches 40% from the top
    const p = reduceMotion ? 1 : clamp01((vh - top) / (vh * 0.6));
    if (Math.abs(p - dv.p) < 0.001) return;
    dv.p = p;
    dv.line.style.strokeDashoffset = `${dv.len * (1 - p)}`;
    const pt = dv.line.getPointAtLength(dv.len * p);
    dv.dot.setAttribute("cx", pt.x.toFixed(1));
    dv.dot.setAttribute("cy", pt.y.toFixed(1));
    dv.dot.style.opacity = p > 0 ? "1" : "0";
    dv.rings.forEach((c) => c.classList.toggle("on", pt.x >= +c.getAttribute("cx") + 4));
    dv.label.classList.toggle("show", p > 0.97);
  };
  dividers.forEach(layoutDivider);

  // ---------- Section doodles that drift and turn with the scroll ----------
  const gear = (teeth, R = 28, r = 22) => {
    const step = (Math.PI * 2) / teeth;
    let d = "";
    for (let i = 0; i < teeth; i++) {
      const a = i * step;
      [[r, a], [R, a + step * 0.15], [R, a + step * 0.45], [r, a + step * 0.6]].forEach(([rad, ang], j) => {
        d += `${i === 0 && j === 0 ? "M" : "L"}${(32 + rad * Math.cos(ang)).toFixed(1)} ${(32 + rad * Math.sin(ang)).toFixed(1)}`;
      });
    }
    return `<path d="${d}Z"/><circle cx="32" cy="32" r="8"/>`;
  };
  const DOODLE = {
    atom: '<ellipse cx="32" cy="32" rx="27" ry="10"/><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(60 32 32)"/><ellipse cx="32" cy="32" rx="27" ry="10" transform="rotate(120 32 32)"/><circle cx="32" cy="32" r="4" class="fill"/>',
    flask: '<path d="M24 6h16M27 6v18L12 52a4 4 0 0 0 3.6 6h32.8a4 4 0 0 0 3.6-6L37 24V6"/><path d="M17 44h30"/>',
    dna: '<path d="M20 4c0 14 24 14 24 28S20 46 20 60"/><path d="M44 4c0 14-24 14-24 28s24 14 24 28"/><path d="M23 11h18M23 25h18M23 39h18M23 53h18"/>',
    magnet: '<path d="M14 8v24a18 18 0 0 0 36 0V8H40v24a8 8 0 0 1-16 0V8z"/><path d="M14 16h10M40 16h10"/>',
    compass: '<circle cx="32" cy="32" r="27"/><path d="M32 7 38 32 32 57 26 32Z"/><path d="M32 7 38 32H26Z" class="fill"/><path d="M5 32h6M53 32h6M32 1v4"/>',
    globe: '<circle cx="32" cy="28" r="20"/><path d="M12 28h40M32 8c8 8 8 32 0 40M32 8c-8 8-8 32 0 40"/><path d="M32 48v8M22 58h20"/>',
    bulb: '<path d="M24 42c0-6-8-9-8-19a16 16 0 0 1 32 0c0 10-8 13-8 19z"/><path d="M25 48h14M27 54h10"/>',
    plane: '<path d="M58 6 4 28l20 6 6 20 8-14 14 8z"/><path d="M24 34 58 6"/>',
    gearBig: gear(12),
    gearSmall: gear(9),
  };
  // speed: px of drift per px of scroll; spin: degrees per px of scroll
  // m: [left, top, size] on phones/tablets — they peek in from the screen edges (omit = desktop only)
  const SECTION_DOODLES = {
    courses: [
      { k: "atom", x: "1.5%", y: "16%", s: 92, m: ["-30px", "5%", 72], speed: 0.12, spin: 0.25 },
      { t: "π", x: "94.5%", y: "12%", s: 70, m: ["calc(100% - 30px)", "30%", 56], speed: -0.1, spin: -0.04 },
      { k: "flask", x: "95%", y: "60%", s: 70, m: ["calc(100% - 34px)", "68%", 64], speed: 0.18, spin: 0.05, c: "#16a34a" },
      { t: "x²", x: "2.5%", y: "72%", s: 54, m: ["-16px", "50%", 46], speed: -0.15, spin: 0.06, c: "#db2777" },
    ],
    why: [
      { k: "gearBig", x: "1.5%", y: "34%", s: 96, m: ["-36px", "8%", 78], speed: 0.08, spin: 0.3 },
      { k: "gearSmall", x: "calc(1.5% + 68px)", y: "calc(34% + 47px)", s: 70, m: ["calc(-36px + 55px)", "calc(8% + 38px)", 57], speed: 0.08, spin: -0.4 },
      { k: "magnet", x: "94%", y: "22%", s: 64, m: ["calc(100% - 32px)", "42%", 60], speed: -0.12, spin: 0.1, c: "#db2777" },
      { k: "dna", x: "95%", y: "66%", s: 72, m: ["calc(100% - 30px)", "76%", 62], speed: 0.15, spin: 0.03, c: "#0284c7" },
    ],
    fun: [
      { t: "Δ", x: "4%", y: "5%", s: 70, m: ["-14px", "1.5%", 50], speed: -0.1, spin: 0.12, c: "#f59e0b" },
      { k: "bulb", x: "93%", y: "4%", s: 74, m: ["calc(100% - 34px)", "2.5%", 60], speed: 0.1, spin: 0.04, c: "#f59e0b" },
    ],
    location: [
      { k: "compass", x: "1.5%", y: "24%", s: 96, m: ["calc(100% - 42px)", "4%", 80], speed: 0.1, spin: 0.4, c: "#f59e0b" },
      { k: "globe", x: "94%", y: "58%", s: 80, m: ["-30px", "55%", 66], speed: -0.12, spin: 0 },
    ],
    contact: [
      { k: "plane", x: "3%", y: "18%", s: 70, m: ["-20px", "3%", 56], speed: -0.14, spin: 0.05, c: "#0284c7" },
      { t: "{ }", x: "94%", y: "62%", s: 60, m: ["calc(100% - 30px)", "40%", 48], speed: 0.12, spin: -0.05, c: "#7c3aed" },
    ],
  };
  const sectionDoodles = Object.entries(SECTION_DOODLES).flatMap(([id, items]) => {
    const section = document.getElementById(id);
    if (!section) return [];
    const layer = document.createElement("div");
    layer.className = "sec-doodles";
    layer.setAttribute("aria-hidden", "true");
    const els = items.map((it) => {
      const el = document.createElement("div");
      el.className = `sd-item${it.t ? " sd-text" : ""}${it.m ? "" : " desk-only"}`;
      const [mx, my, ms] = it.m || [it.x, it.y, it.s];
      el.style.cssText = `--x:${it.x};--y:${it.y};--s:${it.s}px;--mx:${mx};--my:${my};--ms:${ms}px;color:${it.c || "var(--primary)"}`;
      if (it.t) {
        el.textContent = it.t;
      } else {
        el.innerHTML = `<svg viewBox="0 0 64 64">${DOODLE[it.k]}</svg>`;
      }
      layer.appendChild(el);
      return { el, speed: it.speed, spin: it.spin };
    });
    section.prepend(layer);
    return [{ section, items: els }];
  });

  // ---------- Test-tube meter that fills (and changes colour) as you scroll ----------
  const tubeMeter = $("tubeMeter");
  const tubeLiquid = $("tubeLiquid");
  const tubeLabel = $("tubeLabel");
  const heroVisual = hero.querySelector(".hero-visual");
  const orbitEl = hero.querySelector(".orbit");
  const rocketRing = $("rocketRing");

  scrollHooks.push((p) => {
    const vh = window.innerHeight;
    const y = window.scrollY;
    // Read everything first…
    const dividerTops = dividers.map((dv) => dv.host.getBoundingClientRect().top);
    const sectionRects = sectionDoodles.map((sd) => sd.section.getBoundingClientRect());
    const heroH = hero.offsetHeight;
    // …then write
    dividers.forEach((dv, i) => drawDivider(dv, dividerTops[i], vh));
    tubeLiquid.style.clipPath = `inset(${((1 - p) * 100).toFixed(2)}% 0 0 0)`;
    tubeLiquid.style.setProperty("--h", Math.round(262 - p * 222)); // purple → blue → green → amber
    tubeLabel.textContent = `${Math.round(p * 100)}%`;
    tubeMeter.classList.toggle("show", y > 200);
    rocketRing.style.strokeDashoffset = `${(100 - p * 100).toFixed(1)}`;
    rocket.classList.toggle("full", p > 0.985);
    if (reduceMotion) return;
    sectionDoodles.forEach((sd, i) => {
      const r = sectionRects[i];
      if (r.bottom < -100 || r.top > vh + 100) return;
      const d = r.top + r.height / 2 - vh / 2;
      sd.items.forEach(({ el, speed, spin }) => {
        el.style.transform = `translate3d(0, ${(-d * speed).toFixed(1)}px, 0) rotate(${(-d * spin).toFixed(1)}deg)`;
      });
    });
    // Hero depth: doodles lag behind, the card floats up a little faster
    if (y < heroH) {
      doodles.style.translate = `0 ${(y * 0.35).toFixed(1)}px`;
      heroVisual.style.translate = `0 ${(y * -0.06).toFixed(1)}px`;
      orbitEl.style.setProperty("--boost", `${(y * 0.25).toFixed(1)}deg`); // scrolling spins the subject planets faster
    }
  });

  // ---------- Universe mode: hovering the hero (or tapping it on phones) turns it into space ----------
  const canvas = $("cosmos");
  const ctx = canvas.getContext("2d");
  const hint = $("spaceHint");
  const STAR_COLORS = [[255, 255, 255], [199, 210, 254], [249, 168, 212], [253, 230, 138], [165, 243, 252]];
  const HINTS = finePointer
    ? ["✨ Hover to explore the universe", "🪐 Click anywhere for a supernova!"]
    : ["✨ Tap to explore the universe", "🪐 Tap again for a supernova!"];
  let stars = [];
  let shooting = [];
  let ripples = [];
  let cw = 0;
  let chh = 0;
  let spaceOn = false;
  let heroInView = true;
  let cosmosRaf = 0;
  let lastT = 0;
  let nextShoot = 0;
  const cursor = { x: 0, y: 0, active: false };
  hint.textContent = HINTS[0];

  const sizeCosmos = () => {
    const r = hero.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cw = r.width;
    chh = r.height;
    canvas.width = Math.round(cw * dpr);
    canvas.height = Math.round(chh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(260, Math.round((cw * chh) / 5200));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * cw,
      y: Math.random() * chh,
      z: rand(0.25, 1),
      r: rand(0.5, 1.8),
      ph: rand(0, Math.PI * 2),
      sp: rand(0.8, 2.4),
      c: pick(STAR_COLORS),
    }));
  };

  const drawCosmos = (t) => {
    cosmosRaf = 0;
    const dt = Math.min(50, t - (lastT || t));
    lastT = t;
    ctx.clearRect(0, 0, cw, chh);
    const hue = (t / 60) % 360; // constellation colours keep shifting
    const ox = cursor.active ? (cursor.x - cw / 2) / cw : 0;
    const oy = cursor.active ? (cursor.y - chh / 2) / chh : 0;
    const near = [];
    for (const st of stars) {
      st.x += 0.004 * dt * st.z;
      if (st.x > cw + 20) st.x = -20;
      let x = st.x - ox * 50 * st.z;
      let y = st.y - oy * 50 * st.z;
      if (cursor.active) {
        const dx = cursor.x - x;
        const dy = cursor.y - y;
        const d = Math.hypot(dx, dy) || 1;
        if (d < 150) {
          const pull = (1 - d / 150) * 16; // a little gravity towards the cursor
          x += (dx / d) * pull;
          y += (dy / d) * pull;
          near.push([x, y, d]);
        }
      }
      const a = reduceMotion ? 0.8 : 0.4 + 0.6 * Math.abs(Math.sin(t * 0.001 * st.sp + st.ph));
      ctx.fillStyle = `rgba(${st.c[0]},${st.c[1]},${st.c[2]},${a.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(x, y, st.r * (0.6 + st.z * 0.7), 0, Math.PI * 2);
      ctx.fill();
    }
    // Constellations around the cursor
    ctx.lineWidth = 0.8;
    for (let i = 0; i < near.length; i++) {
      const [x1, y1, d1] = near[i];
      ctx.strokeStyle = `hsla(${hue}, 90%, 82%, ${((1 - d1 / 150) * 0.65).toFixed(2)})`;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(cursor.x, cursor.y);
      ctx.stroke();
      for (let j = i + 1; j < near.length; j++) {
        const [x2, y2] = near[j];
        const dd = Math.hypot(x2 - x1, y2 - y1);
        if (dd < 70) {
          ctx.strokeStyle = `hsla(${(hue + 60) % 360}, 90%, 80%, ${((1 - dd / 70) * 0.5).toFixed(2)})`;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
      }
    }
    // Shooting stars
    if (!reduceMotion && t > nextShoot) {
      shooting.push({ x: rand(0.05, 0.8) * cw, y: rand(0, 0.35) * chh, vx: rand(0.5, 0.9), vy: rand(0.18, 0.38), life: 0 });
      nextShoot = t + rand(1600, 4000);
    }
    ctx.lineWidth = 2;
    shooting = shooting.filter((sh) => {
      sh.life += dt;
      sh.x += sh.vx * dt;
      sh.y += sh.vy * dt;
      const tx = sh.x - sh.vx * 110;
      const ty = sh.y - sh.vy * 110;
      const g = ctx.createLinearGradient(sh.x, sh.y, tx, ty);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.strokeStyle = g;
      ctx.beginPath();
      ctx.moveTo(sh.x, sh.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      return sh.life < 1500 && sh.x < cw + 150 && sh.y < chh + 150;
    });
    // Supernova ripples
    ripples = ripples.filter((rp) => {
      rp.life += dt;
      const k = rp.life / 900;
      ctx.strokeStyle = `hsla(${(hue + 180) % 360}, 90%, 80%, ${(1 - k).toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(rp.x, rp.y, 8 + k * 170, 0, Math.PI * 2);
      ctx.stroke();
      return k < 1;
    });
    if (spaceOn && heroInView && !reduceMotion) cosmosRaf = requestAnimationFrame(drawCosmos);
  };
  const startCosmos = () => {
    if (!cosmosRaf && spaceOn && heroInView) cosmosRaf = requestAnimationFrame(drawCosmos);
  };

  const setSpace = (on) => {
    if (on === spaceOn) return;
    spaceOn = on;
    hero.classList.toggle("space", on);
    hint.textContent = HINTS[on ? 1 : 0];
    if (on) {
      if (!stars.length) sizeCosmos();
      lastT = 0;
      startCosmos();
    }
  };

  if (finePointer) {
    let leaveTimer;
    hero.addEventListener("pointerenter", () => {
      clearTimeout(leaveTimer);
      setSpace(true);
    });
    hero.addEventListener("pointerleave", () => {
      cursor.active = false;
      leaveTimer = setTimeout(() => setSpace(false), 400);
    });
  }
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    cursor.x = e.clientX - r.left;
    cursor.y = e.clientY - r.top;
    cursor.active = true;
  });
  hero.addEventListener("click", (e) => {
    if (e.target.closest("a, button, input, select, textarea")) return;
    if (!spaceOn) {
      setSpace(true); // phones: first tap opens the universe
      return;
    }
    if (reduceMotion) return;
    const r = hero.getBoundingClientRect();
    ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, life: 0 });
    startCosmos();
  });
  new IntersectionObserver(([e]) => {
    heroInView = e.isIntersecting;
    if (!heroInView && !finePointer) setSpace(false); // phones: scrolling away brings daylight back
    startCosmos();
  }).observe(hero);

  let relayoutTimer;
  window.addEventListener("resize", () => {
    clearTimeout(relayoutTimer);
    relayoutTimer = setTimeout(() => {
      dividers.forEach(layoutDivider);
      if (stars.length) sizeCosmos();
      queueScrollFx();
    }, 150);
  });
  document.fonts?.ready.then(() => {
    dividers.forEach(layoutDivider);
    queueScrollFx();
  });
  queueScrollFx();
})();
