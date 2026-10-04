import { BookOpen, Building2, CalendarClock, House, Users } from "lucide-react";

export const NAV_ITEMS = [
  { label: "Início", to: "/", icon: House },
  { label: "Alocações", to: "/allocations", icon: CalendarClock },
  { label: "Professores", to: "/professors", icon: Users },
  { label: "Cursos", to: "/courses", icon: BookOpen },
  { label: "Departamentos", to: "/departments", icon: Building2 },
] as const;
