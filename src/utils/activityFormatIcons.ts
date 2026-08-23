import {
  MessagesSquare,
  Flame,
  Shuffle,
  Swords,
  ArrowLeftRight,
  Users,
  RotateCw,
  GitBranch,
  Flag,
  Scale,
  Map,
  AlertTriangle,
  Lightbulb,
  Mic,
  Compass,
  type LucideIcon,
} from "lucide-react";

// Icônes disponibles pour un format d'activité — clé stockée en base (colonne
// `icon`), résolue ici côté admin (sélecteur) et public (rendu de la carte).
export const ACTIVITY_FORMAT_ICONS: Record<string, LucideIcon> = {
  discussion: MessagesSquare,
  flame: Flame,
  shuffle: Shuffle,
  duel: Swords,
  exchange: ArrowLeftRight,
  group: Users,
  rotation: RotateCw,
  mindmap: GitBranch,
  flag: Flag,
  judgment: Scale,
  map: Map,
  crisis: AlertTriangle,
  idea: Lightbulb,
  voice: Mic,
  compass: Compass,
};

export const ACTIVITY_FORMAT_ICON_LABELS: Record<string, string> = {
  discussion: "Discussion",
  flame: "Prise de position",
  shuffle: "Tirage au sort",
  duel: "Affrontement",
  exchange: "Échange / mouvement",
  group: "Groupe",
  rotation: "Rotation",
  mindmap: "Carte mentale",
  flag: "Positionnement",
  judgment: "Jugement / tribunal",
  map: "Cartographie",
  crisis: "Crise",
  idea: "Idée",
  voice: "Prise de parole",
  compass: "Exploration",
};

export function resolveActivityFormatIcon(icon: string | null | undefined): LucideIcon {
  return (icon && ACTIVITY_FORMAT_ICONS[icon]) || MessagesSquare;
}
