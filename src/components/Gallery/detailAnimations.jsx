import { gsap } from '../../utils/gsap';

// Shared pieces of the split-screen detail views (projects and About)

const getTitleParts = (overlayElement) => ({
  number: overlayElement.querySelector('.image-slide-number span'),
  title: overlayElement.querySelector('.image-slide-title h1'),
  description: overlayElement.querySelector('.description-line')
});

// Stagger in category -> title -> description
export function animateTitleIn(overlayElement, delay = 0) {
  const { number, title, description } = getTitleParts(overlayElement);

  gsap.set(number, { y: 20, opacity: 0 });
  gsap.set(title, { y: 60, opacity: 0 });
  gsap.set(description, { y: 20, opacity: 0 });

  gsap.to(number, { duration: 0.6, y: 0, opacity: 1, ease: 'power2.out', delay });
  gsap.to(title, { duration: 0.6, y: 0, opacity: 1, ease: 'power2.out', delay: delay + 0.15 });
  gsap.to(description, { duration: 0.6, y: 0, opacity: 1, ease: 'power2.out', delay: delay + 0.3 });
  gsap.to(overlayElement, { opacity: 1, duration: 0.3 });
}

export function animateTitleOut(overlayElement) {
  if (!overlayElement) return;
  const { number, title, description } = getTitleParts(overlayElement);

  gsap.to(overlayElement, { opacity: 0, duration: 0.3, ease: 'power2.out' });
  gsap.to(number, { duration: 0.4, y: -20, opacity: 0, ease: 'power2.out' });
  gsap.to(title, { duration: 0.4, y: -60, opacity: 0, ease: 'power2.out' });
  gsap.to(description, { duration: 0.4, y: -20, opacity: 0, ease: 'power2.out' });
}

export function CloseIcon() {
  return (
    <svg width="64" height="64" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7.89873 16L6.35949 14.48L11.8278 9.08H0V6.92H11.8278L6.35949 1.52L7.89873 0L16 8L7.89873 16Z" fill="white" />
    </svg>
  );
}
