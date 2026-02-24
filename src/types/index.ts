export type Role = "guitar" | "bass" | "drums" | "vocals" | "keyboard";

export interface TeamMember {
  memberName: string;
  roles: Role[];
  color: string;
}

export interface Shift {
  date: string;
  team: {
    memberName: string;
    role: Role;
    color: string;
  }[];
}

export interface TurniData {
  shifts: Shift[];
  availableTeamMembers: TeamMember[];
  validDayOfWeek: string[];
  title: string;
  availableRoles: Role[];
}
