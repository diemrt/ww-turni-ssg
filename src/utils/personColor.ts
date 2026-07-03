// Single source of truth for mapping a "person color" name (Call Sheet) to the
// Tailwind class strings used across the UI (dot / tint background / focus
// ring / text). Colors map onto the `person-<name>-{50,100,500}` token
// families declared in tailwind.config.js.
//
// NOTE: class strings are written as full literals (not composed via string
// interpolation) so Tailwind's JIT scanner can statically discover them.

export const PERSON_COLORS = [
  "yellow",
  "blue",
  "green",
  "red",
  "orange",
  "pink",
  "purple",
  "cyan",
  "brown",
  "gray",
] as const;

export type PersonColorName = (typeof PERSON_COLORS)[number];

export interface PersonColorClasses {
  /** Solid dot / swatch background (person-<name>-500). */
  dot: string;
  /** Soft tint background suitable behind ink text (person-<name>-50). */
  tint: string;
  /** Focus/selection ring color (person-<name>-500). */
  ring: string;
  /** Text color to pair with the tint background. */
  text: string;
}

const PERSON_COLOR_MAP: Record<PersonColorName, PersonColorClasses> = {
  yellow: {
    dot: "bg-person-yellow-500",
    tint: "bg-person-yellow-50",
    ring: "ring-person-yellow-500",
    text: "text-ink-800",
  },
  blue: {
    dot: "bg-person-blue-500",
    tint: "bg-person-blue-50",
    ring: "ring-person-blue-500",
    text: "text-ink-800",
  },
  green: {
    dot: "bg-person-green-500",
    tint: "bg-person-green-50",
    ring: "ring-person-green-500",
    text: "text-ink-800",
  },
  red: {
    dot: "bg-person-red-500",
    tint: "bg-person-red-50",
    ring: "ring-person-red-500",
    text: "text-ink-800",
  },
  orange: {
    dot: "bg-person-orange-500",
    tint: "bg-person-orange-50",
    ring: "ring-person-orange-500",
    text: "text-ink-800",
  },
  pink: {
    dot: "bg-person-pink-500",
    tint: "bg-person-pink-50",
    ring: "ring-person-pink-500",
    text: "text-ink-800",
  },
  purple: {
    dot: "bg-person-purple-500",
    tint: "bg-person-purple-50",
    ring: "ring-person-purple-500",
    text: "text-ink-800",
  },
  cyan: {
    dot: "bg-person-cyan-500",
    tint: "bg-person-cyan-50",
    ring: "ring-person-cyan-500",
    text: "text-ink-800",
  },
  brown: {
    dot: "bg-person-brown-500",
    tint: "bg-person-brown-50",
    ring: "ring-person-brown-500",
    text: "text-ink-800",
  },
  gray: {
    dot: "bg-person-gray-500",
    tint: "bg-person-gray-50",
    ring: "ring-person-gray-500",
    text: "text-ink-800",
  },
};

/**
 * Resolve a person color name to its Tailwind class strings. Unknown/missing
 * names fall back to the `gray` group so callers never need to guard.
 */
export function personColor(color: string): PersonColorClasses {
  return PERSON_COLOR_MAP[color as PersonColorName] ?? PERSON_COLOR_MAP.gray;
}

export function isPersonColorName(color: string): color is PersonColorName {
  return (PERSON_COLORS as readonly string[]).includes(color);
}
