import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAROUSEL_INTERVAL_MS,
  getOfficeStatus,
  wrapSlideIndex,
  shouldAutoRotateCarousel,
  findNearestSlideIndex,
} from '../script.js';

test('getOfficeStatus resolves Campinas BRT business hours across weekdays and weekends', () => {
  const monOpen = getOfficeStatus(new Date('2025-05-12T13:30:00Z')); // 10:30 BRT
  assert.equal(monOpen.isOpen, true);
  assert.equal(monOpen.label, 'Aberto agora');
  assert.equal(monOpen.weekdayIndex, 1);

  const tueEarly = getOfficeStatus(new Date('2025-05-13T11:15:00Z')); // 08:15 BRT
  assert.equal(tueEarly.isOpen, false);
  assert.equal(tueEarly.label, 'Fechado, abre hoje às 9h');

  const wedEvening = getOfficeStatus(new Date('2025-05-14T22:00:00Z')); // 19:00 BRT
  assert.equal(wedEvening.isOpen, false);
  assert.equal(wedEvening.label, 'Fechado, abre amanhã às 9h');

  const friEvening = getOfficeStatus(new Date('2025-05-16T21:30:00Z')); // 18:30 BRT
  assert.equal(friEvening.isOpen, false);
  assert.equal(friEvening.label, 'Fechado, abre segunda às 9h');

  const sat = getOfficeStatus(new Date('2025-05-17T15:00:00Z')); // Sat 12:00 BRT
  assert.equal(sat.isOpen, false);
  assert.equal(sat.label, 'Fechado, abre segunda às 9h');

  const sun = getOfficeStatus(new Date('2025-05-18T15:00:00Z')); // Sun 12:00 BRT
  assert.equal(sun.isOpen, false);
  assert.equal(sun.label, 'Fechado, abre amanhã às 9h');
});

test('wrapSlideIndex wraps forward and backward within gallery bounds', () => {
  assert.equal(wrapSlideIndex(0, 6), 0);
  assert.equal(wrapSlideIndex(6, 6), 0);
  assert.equal(wrapSlideIndex(-1, 6), 5);
  assert.equal(wrapSlideIndex(7, 6), 1);
  assert.equal(wrapSlideIndex(3, 0), 0);
});

test('carousel auto-rotation uses 4s interval, runs only on mobile when visible and active', () => {
  assert.equal(CAROUSEL_INTERVAL_MS, 4000);

  assert.equal(
    shouldAutoRotateCarousel({
      isMobile: true,
      isVisible: true,
      isTabHidden: false,
      reducedMotion: false,
      isInteracting: false,
    }),
    true
  );

  // Desktop uses grid, never auto-rotates carousel
  assert.equal(
    shouldAutoRotateCarousel({
      isMobile: false,
      isVisible: true,
      isTabHidden: false,
      reducedMotion: false,
      isInteracting: false,
    }),
    false
  );

  // Pauses when scrolled out of section
  assert.equal(
    shouldAutoRotateCarousel({
      isMobile: true,
      isVisible: false,
      isTabHidden: false,
      reducedMotion: false,
      isInteracting: false,
    }),
    false
  );

  // Pauses when leaving page / tab hidden
  assert.equal(
    shouldAutoRotateCarousel({
      isMobile: true,
      isVisible: true,
      isTabHidden: true,
      reducedMotion: false,
      isInteracting: false,
    }),
    false
  );
});

test('findNearestSlideIndex selects the card closest to the track center', () => {
  const centers = [195, 505, 815];
  assert.equal(findNearestSlideIndex(centers, 195), 0);
  assert.equal(findNearestSlideIndex(centers, 360), 1);
  assert.equal(findNearestSlideIndex(centers, 790), 2);
  assert.equal(findNearestSlideIndex([], 200), 0);
});
