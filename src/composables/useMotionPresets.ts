import { computed } from 'vue';
import { useReducedMotion } from 'motion-v';

// Shared motion-v presets, matching the conventions established in ReadingView.vue
// so every screen animates with the same feel.
export function useMotionPresets() {
  const prefersReducedMotion = useReducedMotion();

  // Spring used for bottom sheets/modals that slide or scale in.
  const sheetSpring = { type: 'spring', stiffness: 380, damping: 32 } as const;

  const tapScale = computed(() => (prefersReducedMotion.value ? {} : { scale: 0.96 }));

  // Simple opacity fade for overlay/backdrop tints.
  const overlayFade = computed(() => ({ duration: prefersReducedMotion.value ? 0 : 0.18 }));

  // Capped stagger entrance for list/grid items — avoids runaway delay on long lists.
  function staggerTransition(index: number) {
    if (prefersReducedMotion.value) return { duration: 0 };
    return { duration: 0.28, delay: Math.min(index, 12) * 0.025, ease: [0.4, 0, 0.2, 1] };
  }

  return { prefersReducedMotion, sheetSpring, tapScale, overlayFade, staggerTransition };
}
