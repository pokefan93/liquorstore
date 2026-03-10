const root = document.documentElement;
const body = document.body;
const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a");
const openTodayNode = document.querySelector("[data-open-today]");
const revealNodes = document.querySelectorAll("[data-reveal]");
const yearNode = document.querySelector("[data-year]");
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const weeklyHours = {
  Sunday: "Closed today",
  Monday: "Open today: 10 AM - 8 PM",
  Tuesday: "Open today: 10 AM - 8 PM",
  Wednesday: "Open today: 10 AM - 8 PM",
  Thursday: "Open today: 10 AM - 9 PM",
  Friday: "Open today: 10 AM - 9 PM",
  Saturday: "Open today: 10 AM - 9 PM",
};

const closeMenu = () => {
  if (!header || !menuToggle) {
    return;
  }

  header.classList.remove("menu-open");
  body.classList.remove("menu-open");
  menuToggle.setAttribute("aria-expanded", "false");
};

const setOpenToday = () => {
  if (!openTodayNode) {
    return;
  }

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: "America/Chicago",
  }).format(new Date());

  openTodayNode.textContent = weeklyHours[weekday] ?? "Hours: Call the store";
};

const setScrolledState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const initReveal = () => {
  if (!revealNodes.length) {
    return;
  }

  if (reduceMotionQuery.matches || !("IntersectionObserver" in window)) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

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
      rootMargin: "0px 0px -48px",
    }
  );

  revealNodes.forEach((node) => observer.observe(node));
};

if (menuToggle && header && siteNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    body.classList.toggle("menu-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      closeMenu();
    });
  });

  document.addEventListener("click", (event) => {
    if (!header.classList.contains("menu-open")) {
      return;
    }

    if (!header.contains(event.target)) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 959) {
      closeMenu();
    }
  });
}

if (yearNode) {
  yearNode.textContent = new Date().getFullYear();
}

setOpenToday();
setScrolledState();
initReveal();

window.addEventListener("scroll", setScrolledState, { passive: true });

const handleReducedMotionChange = () => {
  if (reduceMotionQuery.matches) {
    revealNodes.forEach((node) => node.classList.add("is-visible"));
  }
};

if ("addEventListener" in reduceMotionQuery) {
  reduceMotionQuery.addEventListener("change", handleReducedMotionChange);
} else if ("addListener" in reduceMotionQuery) {
  reduceMotionQuery.addListener(handleReducedMotionChange);
}

root.classList.remove("no-js");
