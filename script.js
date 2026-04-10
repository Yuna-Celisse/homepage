const revealElements = document.querySelectorAll('.reveal');

for (const element of revealElements) {
  const delay = Number.parseInt(element.dataset.delay || '0', 10);
  element.style.setProperty('--delay', `${delay}ms`);
}

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  },
  { threshold: 0.15 }
);

for (const element of revealElements) {
  observer.observe(element);
}

const yearElement = document.getElementById('year');
if (yearElement) {
  yearElement.textContent = new Date().getFullYear().toString();
}
