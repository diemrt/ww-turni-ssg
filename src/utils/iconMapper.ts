import { Guitar, Piano, Drum, Mic } from "lucide-react";
import type { Role } from "@/types";

export const roleIconMap = {
  guitar: Guitar,
  bass: Guitar, // Using Guitar icon for bass as well
  keyboard: Piano,
  drums: Drum,
  vocals: Mic,
};

export const getRoleIcon = (role: Role) => {
  return roleIconMap[role];
};
