const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const anchorLinks = document.querySelectorAll('a[href^="#"]');
const revealElements = document.querySelectorAll(".reveal");
const parallaxRoot = document.querySelector("[data-parallax]");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

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

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });
}

const setScrolledState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 18);
};

setScrolledState();
window.addEventListener("scroll", setScrolledState, { passive: true });

const smoothScrollToSection = (event, target) => {
  const targetElement = document.querySelector(target);
  if (!targetElement) {
    return;
  }

  event.preventDefault();

  const offset = header ? header.offsetHeight + 10 : 0;
  const y = targetElement.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: y,
    behavior: reduceMotionQuery.matches ? "auto" : "smooth",
  });

  closeMenu();

  if (target === "#home") {
    history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  } else {
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
      threshold: 0.18,
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

const yearNode = document.getElementById("year");
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
