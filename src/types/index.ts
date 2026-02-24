export type Role = "guitar" | "bass" | "drums" | "vocals" | "keyboard";

export interface TeamMember {
  name: string;
  roles: Role[];
  color: string;
}

export interface Shift {
  date: string;
  team: {
    memberName: string;
    role: Role;
  }[];
}

export interface TurniData {
  shifts: Shift[];
  availableTeamMembers: TeamMember[];
  validDayOfWeek: string[];
  title: string;
  availableRoles: Role[];
}
