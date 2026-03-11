// I keep the site clock locked to the store's timezone so the hours note and footer year do not drift for out-of-state visitors.
const root = document.documentElement;
const header = document.querySelector("[data-header]");
const openTodayNode = document.querySelector("[data-open-today]");
const revealNodes = document.querySelectorAll("[data-reveal]");
const yearNode = document.querySelector("[data-year]");
const facebookEmbed = document.querySelector("[data-facebook-embed]");
const facebookFrame = facebookEmbed?.closest(".facebook-frame") ?? null;
const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const siteTimeZone = "America/Chicago";
const revealInset = 56;
const revealVisibleClass = "is-visible";
const revealAboveClass = "is-hidden-above";
const revealBelowClass = "is-hidden-below";

// If store hours change later, update this object and the visible hours copy in the HTML so the site does not tell two different stories.
const weeklyHours = {
  Sunday: "Closed today",
  Monday: "Open today: 10 AM - 8 PM",
  Tuesday: "Open today: 10 AM - 8 PM",
  Wednesday: "Open today: 10 AM - 8 PM",
  Thursday: "Open today: 10 AM - 9 PM",
  Friday: "Open today: 10 AM - 9 PM",
  Saturday: "Open today: 10 AM - 9 PM",
};

// This fills the little top-bar line with the right day based on the store's local time.
const setOpenToday = () => {
  if (!openTodayNode) {
    return;
  }

  const weekday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    timeZone: siteTimeZone,
  }).format(new Date());

  openTodayNode.textContent = weeklyHours[weekday] ?? "Hours: Call the store";
};

const setScrolledState = () => {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 8);
};

const resetRevealClasses = (node) => {
  node.classList.remove(revealVisibleClass, revealAboveClass, revealBelowClass);
};

const setRevealState = (node, rect = node.getBoundingClientRect()) => {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const topBoundary = revealInset;
  const bottomBoundary = viewportHeight - revealInset;

  resetRevealClasses(node);

  if (rect.bottom > topBoundary && rect.top < bottomBoundary) {
    node.classList.add(revealVisibleClass);
    return;
  }

  if (rect.top >= bottomBoundary) {
    node.classList.add(revealBelowClass);
    return;
  }

  node.classList.add(revealAboveClass);
};

const showAllRevealNodes = () => {
  revealNodes.forEach((node) => {
    resetRevealClasses(node);
    node.classList.add(revealVisibleClass);
  });
};

let revealObserver = null;

const destroyRevealObserver = () => {
  if (!revealObserver) {
    return;
  }

  revealObserver.disconnect();
  revealObserver = null;
};

const initReveal = () => {
  if (!revealNodes.length) {
    return;
  }

  if (reduceMotionQuery.matches || !("IntersectionObserver" in window)) {
    showAllRevealNodes();
    return;
  }

  destroyRevealObserver();

  revealNodes.forEach((node) => setRevealState(node));

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        setRevealState(entry.target, entry.boundingClientRect);
      });
    },
    {
      threshold: 0,
      rootMargin: `-${revealInset}px 0px -${revealInset}px 0px`,
    }
  );

  revealNodes.forEach((node) => revealObserver.observe(node));
};

let lastFacebookWidth = 0;

// Facebook's embed wants a real width value. This keeps it from looking busted on phones without hardcoding a pile of breakpoints.
const syncFacebookEmbed = () => {
  if (!facebookEmbed || !facebookFrame) {
    return;
  }

  const nextWidth = Math.max(280, Math.min(Math.floor(facebookFrame.clientWidth), 500));

  if (Math.abs(nextWidth - lastFacebookWidth) < 8) {
    return;
  }

  lastFacebookWidth = nextWidth;

  const baseSrc = facebookEmbed.dataset.baseSrc;

  if (!baseSrc) {
    return;
  }

  const embedUrl = new URL(baseSrc);
  embedUrl.searchParams.set("width", String(nextWidth));
  facebookEmbed.width = String(nextWidth);
  facebookEmbed.src = embedUrl.toString();
};

// Leave the footer span in the HTML. This fills it in automatically every year using the store timezone.
if (yearNode) {
  yearNode.textContent = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    timeZone: siteTimeZone,
  }).format(new Date());
}

if (facebookEmbed && facebookFrame) {
  syncFacebookEmbed();

  if ("ResizeObserver" in window) {
    const facebookObserver = new ResizeObserver(() => {
      syncFacebookEmbed();
    });

    facebookObserver.observe(facebookFrame);
  } else {
    window.addEventListener("resize", syncFacebookEmbed, { passive: true });
  }
}

setOpenToday();
setScrolledState();
initReveal();

window.addEventListener("scroll", setScrolledState, { passive: true });
window.addEventListener("resize", initReveal, { passive: true });

// If somebody ever wants to kill the motion effects entirely, this is the switchboard for that behavior.
const handleReducedMotionChange = () => {
  if (reduceMotionQuery.matches) {
    destroyRevealObserver();
    showAllRevealNodes();
    return;
  }

  initReveal();
};

if ("addEventListener" in reduceMotionQuery) {
  reduceMotionQuery.addEventListener("change", handleReducedMotionChange);
} else if ("addListener" in reduceMotionQuery) {
  reduceMotionQuery.addListener(handleReducedMotionChange);
}

root.classList.remove("no-js");
