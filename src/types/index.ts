export type Role = "guitar" | "bass" | "drums" | "vocals" | "keyboard";

export interface TeamMember {
  name: string;
  roles: Role[];
  color: string;
}

export interface AppConfig {
  validDayOfWeek: string[];
  availableRoles: Role[];
  roleSlots: Record<Role, number>;
  availableTeamMembers: TeamMember[];
}

export interface ShiftAssignment {
  name: string;
  role: Role;
  // Transitional: legacy per-month data used to carry `color` inline.
  // The new schema resolves color by `name` from AppConfig (see mergeConfig,
  // introduced in a later issue). Optional so both shapes type-check.
  color?: string;
}

export interface Shift {
  date: string; // YYYY-MM-DD
  team: ShiftAssignment[];
}

export interface MonthData {
  title: string;
  month: string; // YYYY-MM
  shifts: Shift[];
  absences: Record<string, string[]>; // date → nomi assenti
}

/**
 * @deprecated Legacy shape of `public/turni.json` before the config/data
 * split (see docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md
 * sez. 3). Kept so App.tsx / ShiftCard.tsx keep type-checking until the
 * public-view refactor issue merges config + month data. Remove once App.tsx
 * is migrated to `AppConfig` + `MonthData`.
 */
export interface TurniData {
  shifts: Shift[];
  availableTeamMembers: TeamMember[];
  validDayOfWeek: string[];
  title: string;
  availableRoles: Role[];
}
