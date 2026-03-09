const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const navShell = document.querySelector(".nav-shell");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const revealElements = document.querySelectorAll(".reveal");
const parallaxRoot = document.querySelector("[data-parallax]");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const rootNode = document.documentElement;

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

setScrolledState();
setCyberState();
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
