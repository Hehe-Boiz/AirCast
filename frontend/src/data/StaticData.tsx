export const infoVariants = {
  green: {
    colorFrom: "from-green-400",
    colorVia: "via-green-500",
    colorTo: "to-emerald-600",
    hoverFrom: "hover:from-green-50/80",
    hoverTo: "hover:to-emerald-50/60",
    hoverBorderClass: "hover:border-green-200/50",
    labelHoverClass: "group-hover:text-green-700",
    shadowBaseClass: "shadow-green-500/25",
    shadowHoverClass: "group-hover:shadow-green-500/35",
  },
  yellow: {
    colorFrom: "from-yellow-400",
    colorVia: "via-yellow-500",
    colorTo: "to-amber-600",
    hoverFrom: "hover:from-yellow-50/80",
    hoverTo: "hover:to-amber-50/60",
    hoverBorderClass: "hover:border-yellow-200/50",
    labelHoverClass: "group-hover:text-yellow-700",
    shadowBaseClass: "shadow-yellow-500/25",
    shadowHoverClass: "group-hover:shadow-yellow-500/35",
  },
  orange: {
    colorFrom: "from-orange-400",
    colorVia: "via-orange-500",
    colorTo: "to-red-600",
    hoverFrom: "hover:from-orange-50/80",
    hoverTo: "hover:to-red-50/60",
    hoverBorderClass: "hover:border-orange-200/50",
    labelHoverClass: "group-hover:text-orange-700",
    shadowBaseClass: "shadow-orange-500/25",
    shadowHoverClass: "group-hover:shadow-orange-500/35",
  },
  red: {
    colorFrom: "from-red-500",
    colorVia: "via-red-600",
    colorTo: "to-rose-700",
    hoverFrom: "hover:from-red-50/80",
    hoverTo: "hover:to-rose-50/60",
    hoverBorderClass: "hover:border-red-200/50",
    labelHoverClass: "group-hover:text-red-700",
    shadowBaseClass: "shadow-red-500/25",
    shadowHoverClass: "group-hover:shadow-red-500/35",
  },
  purple: {
    colorFrom: "from-purple-500",
    colorVia: "via-purple-600",
    colorTo: "to-purple-800",
    hoverFrom: "hover:from-purple-50/80",
    hoverTo: "hover:to-pink-50/60",
    hoverBorderClass: "hover:border-purple-200/50",
    labelHoverClass: "group-hover:text-purple-700",
    shadowBaseClass: "shadow-purple-500/25",
    shadowHoverClass: "group-hover:shadow-purple-500/35",
  },
} as const;

export const statVariants = {
  cyan: {
    fromColor: "from-blue-50",
    toColor: "to-cyan-50",
    borderColor: "border-cyan-200",
    valueColor: "text-cyan-900",
    subtitleColor: "text-cyan-600",
    iconFrom: "from-cyan-400",
    iconTo: "to-cyan-600",
  },
  emerald: {
    fromColor: "from-green-50",
    toColor: "to-emerald-50",
    borderColor: "border-emerald-200",
    valueColor: "text-emerald-900",
    subtitleColor: "text-emerald-600",
    iconFrom: "from-emerald-400",
    iconTo: "to-emerald-600",
  },
  orange: {
    fromColor: "from-orange-50",
    toColor: "to-red-50",
    borderColor: "border-orange-200",
    valueColor: "text-orange-900",
    subtitleColor: "text-orange-600",
    iconFrom: "from-orange-400",
    iconTo: "to-red-500",
  },
} as const;
export type StatVariant = keyof typeof statVariants;
export type InfoVariant = keyof typeof infoVariants;



