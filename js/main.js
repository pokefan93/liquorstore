const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navShell = document.querySelector(".nav-shell");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const revealElements = document.querySelectorAll(".reveal");
const parallaxRoot = document.querySelector("[data-parallax]");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const rootNode = document.documentElement;
const starfieldRoot = document.querySelector("[data-starfield]");
const starsLayer = document.querySelector("[data-stars-layer]");
const shootingLayer = document.querySelector("[data-shooting-layer]");

const closeMenu = () => {
  if (!header || !menuToggle) {
    return;
  }

  header.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

if (menuToggle && header) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  document.addEventListener("click", (event) => {
    if (!header.classList.contains("menu-open")) {
      return;
    }

    if (navShell && !navShell.contains(event.target)) {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) {
      closeMenu();
    }

    setCyberState();
  });
}

const setScrolledState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

const setCyberState = () => {
  if (!rootNode) {
    return;
  }

  if (reduceMotionQuery.matches) {
    rootNode.style.setProperty("--cyber-shift-a", "0px");
    rootNode.style.setProperty("--cyber-shift-b", "0px");
    rootNode.style.setProperty("--cyber-shift-c", "0px");
    rootNode.style.setProperty("--cyber-shift-d", "0px");
    rootNode.style.setProperty("--cyber-shift-e", "0px");
    rootNode.style.setProperty("--cyber-shift-f", "0px");
    rootNode.style.setProperty("--cyber-shift-g", "0px");
    rootNode.style.setProperty("--cyber-opacity", "0.06");
    return;
  }

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  const scrollY = window.scrollY;

  rootNode.style.setProperty("--cyber-shift-a", `${Math.round(scrollY * -0.16)}px`);
  rootNode.style.setProperty("--cyber-shift-b", `${Math.round(scrollY * 0.12)}px`);
  rootNode.style.setProperty("--cyber-shift-c", `${Math.round(scrollY * 0.18)}px`);
  rootNode.style.setProperty("--cyber-shift-d", `${Math.round(scrollY * -0.1)}px`);
  rootNode.style.setProperty("--cyber-shift-e", `${Math.round(scrollY * -0.12)}px`);
  rootNode.style.setProperty("--cyber-shift-f", `${Math.round(scrollY * 0.08)}px`);
  rootNode.style.setProperty("--cyber-shift-g", `${Math.round(scrollY * 0.14)}px`);
  rootNode.style.setProperty("--cyber-opacity", (0.12 + progress * 0.08).toFixed(3));
};

const randomInRange = (min, max) => min + Math.random() * (max - min);

const initStarfield = () => {
  if (!starfieldRoot || !starsLayer || !shootingLayer) {
    return;
  }

  const saveDataEnabled = navigator.connection?.saveData ?? false;
  const isCompactViewport = window.matchMedia("(max-width: 760px)").matches;
  const starCount = saveDataEnabled ? 28 : isCompactViewport ? 42 : 74;
  const starFragment = document.createDocumentFragment();

  for (let index = 0; index < starCount; index += 1) {
    const star = document.createElement("span");
    const brightStar = Math.random() > 0.8;
    const size = brightStar ? randomInRange(1.8, 3.2) : randomInRange(0.9, 2.1);

    star.className = `starfield-star${brightStar ? " is-bright" : ""}`;
    star.style.left = `${randomInRange(0, 100).toFixed(2)}%`;
    star.style.top = `${randomInRange(0, 100).toFixed(2)}%`;
    star.style.setProperty("--size", `${size.toFixed(2)}px`);
    star.style.setProperty("--star-opacity", randomInRange(0.22, brightStar ? 0.92 : 0.66).toFixed(2));
    star.style.setProperty("--twinkle-duration", `${randomInRange(3.8, 8.6).toFixed(2)}s`);
    star.style.setProperty("--twinkle-delay", `${randomInRange(-8, 0).toFixed(2)}s`);
    starFragment.appendChild(star);
  }

  starsLayer.replaceChildren(starFragment);

  if (reduceMotionQuery.matches || saveDataEnabled) {
    return;
  }

  let shootTimer = 0;

  const pickShotProfile = (compact) => {
    const profiles = compact
      ? [
          { left: [4, 26], top: [6, 24], angle: [14, 24], travel: 1, distance: [160, 230], drop: [0.18, 0.28] },
          { left: [24, 52], top: [4, 18], angle: [12, 20], travel: 1, distance: [180, 250], drop: [0.2, 0.3] },
          { left: [56, 92], top: [6, 24], angle: [-24, -14], travel: -1, distance: [160, 230], drop: [0.18, 0.28] },
          { left: [10, 30], top: [24, 58], angle: [8, 16], travel: 1, distance: [140, 210], drop: [0.14, 0.24] },
          { left: [70, 94], top: [24, 58], angle: [-16, -8], travel: -1, distance: [140, 210], drop: [0.14, 0.24] },
        ]
      : [
          { left: [3, 24], top: [4, 22], angle: [14, 24], travel: 1, distance: [260, 380], drop: [0.18, 0.28] },
          { left: [22, 56], top: [3, 16], angle: [12, 20], travel: 1, distance: [300, 420], drop: [0.2, 0.3] },
          { left: [44, 78], top: [4, 18], angle: [-20, -12], travel: -1, distance: [300, 420], drop: [0.2, 0.3] },
          { left: [74, 97], top: [4, 22], angle: [-24, -14], travel: -1, distance: [260, 380], drop: [0.18, 0.28] },
          { left: [6, 22], top: [22, 66], angle: [7, 15], travel: 1, distance: [220, 320], drop: [0.14, 0.24] },
          { left: [78, 96], top: [22, 66], angle: [-15, -7], travel: -1, distance: [220, 320], drop: [0.14, 0.24] },
        ];

    return profiles[Math.floor(Math.random() * profiles.length)];
  };

  const scheduleShot = () => {
    const delay = isCompactViewport ? randomInRange(4200, 7200) : randomInRange(2800, 5600);
    shootTimer = window.setTimeout(spawnShot, delay);
  };

  const spawnShot = () => {
    if (document.hidden) {
      scheduleShot();
      return;
    }

    const star = document.createElement("span");
    const compact = window.matchMedia("(max-width: 760px)").matches;
    const profile = pickShotProfile(compact);
    const distance = randomInRange(profile.distance[0], profile.distance[1]) * profile.travel;
    const drop = Math.abs(distance) * randomInRange(profile.drop[0], profile.drop[1]);

    star.className = "shooting-star";
    star.style.left = `${randomInRange(profile.left[0], profile.left[1]).toFixed(2)}%`;
    star.style.top = `${randomInRange(profile.top[0], profile.top[1]).toFixed(2)}%`;
    star.style.setProperty("--shoot-angle", `${randomInRange(profile.angle[0], profile.angle[1]).toFixed(2)}deg`);
    star.style.setProperty("--shoot-distance", `${distance.toFixed(0)}px`);
    star.style.setProperty("--shoot-drop", `${drop.toFixed(0)}px`);
    star.style.setProperty("--shoot-duration", `${randomInRange(0.9, 1.5).toFixed(2)}s`);
    star.style.setProperty("--shoot-length", `${randomInRange(120, compact ? 150 : 190).toFixed(0)}px`);

    shootingLayer.appendChild(star);

    window.setTimeout(() => {
      star.remove();
    }, 1700);

    scheduleShot();
  };

  scheduleShot();

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      window.clearTimeout(shootTimer);
      shootTimer = 0;
      return;
    }

    if (!shootTimer) {
      scheduleShot();
    }
  });
};

setScrolledState();
setCyberState();
initStarfield();
window.addEventListener(
  "scroll",
  () => {
    setScrolledState();
    setCyberState();
  },
  { passive: true }
);

const smoothScrollToSection = (event, target) => {
  const targetElement = document.querySelector(target);

  if (!targetElement) {
    return;
  }

  event.preventDefault();

  const shouldOffset = target !== "#main-content";
  const offset = shouldOffset && header ? header.offsetHeight + 10 : 0;
  const y = targetElement.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: y,
    behavior: reduceMotionQuery.matches ? "auto" : "smooth",
  });

  closeMenu();

  if (target === "#home") {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  } else if (target !== "#main-content") {
    history.replaceState(null, "", target);
  }
};

anchorLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = link.getAttribute("href");

    if (!target || target === "#") {
      return;
    }

    smoothScrollToSection(event, target);
  });
});

if (reduceMotionQuery.matches) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        obs.unobserve(entry.target);
      });
    },
    {
      threshold: 0.2,
      rootMargin: "0px 0px -40px",
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

if (parallaxRoot && !reduceMotionQuery.matches) {
  parallaxRoot.addEventListener("pointermove", (event) => {
    const rect = parallaxRoot.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width - 0.5;
    const relativeY = (event.clientY - rect.top) / rect.height - 0.5;

    parallaxRoot.style.setProperty("--pointer-x", `${relativeX * 22}px`);
    parallaxRoot.style.setProperty("--pointer-y", `${relativeY * 16}px`);
  });

  parallaxRoot.addEventListener("pointerleave", () => {
    parallaxRoot.style.setProperty("--pointer-x", "0px");
    parallaxRoot.style.setProperty("--pointer-y", "0px");
  });
}

if (typeof reduceMotionQuery.addEventListener === "function") {
  reduceMotionQuery.addEventListener("change", setCyberState);
}

const yearNode = document.getElementById("year");

if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
