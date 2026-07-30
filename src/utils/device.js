/**
 * Device capability helpers.
 *
 * Single source of truth for the "is this a phone/touch device" signal, so mobile-only
 * optimizations don't each re-implement (and drift on) their own detection.
 *
 * IMPORTANT: every consumer of these helpers is written so that the DESKTOP branch is the
 * pre-existing code path, unchanged. These helpers only ever gate *additional* mobile
 * short-circuits — on a desktop pointer they all resolve to the original behavior.
 */

// Matches phones/tablets driven by a finger rather than a precise pointer. This is the correct
// signal for "can a cursor-proximity effect ever be observed here?" — viewport width is not,
// because a narrow desktop window still has a mouse.
export function isCoarsePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(pointer: coarse)').matches;
}

// True for devices with no hover capability at all. Used for effects that are strictly
// hover-driven and therefore dead weight when hover is impossible.
export function isHoverless() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(hover: none)').matches;
}

/**
 * Treated as "mobile" for performance-gating purposes: a touch-first device.
 * Deliberately requires BOTH coarse pointer and no-hover so that hybrid laptops with a
 * touchscreen (coarse pointer available, but hover also available) keep the full desktop
 * experience rather than being silently downgraded.
 */
export function isTouchOnlyDevice() {
  return isCoarsePointer() && isHoverless();
}

// Caps the renderer's device pixel ratio on phones. High-DPR phones report 3, which costs 9x
// the fragment shading of DPR 1 for a difference that is essentially imperceptible at phone
// viewing distance on a small panel. Returns undefined on desktop so callers can spread it and
// leave the existing desktop behavior byte-identical.
export function getMobileDprCap() {
  if (!isTouchOnlyDevice()) return undefined;
  return [1, 1.5];
}
