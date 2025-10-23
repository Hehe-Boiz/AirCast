import { InfoVariant, infoVariants } from "../data/StaticData";
export const InfoCard: React.FC<{
  value: React.ReactNode;
  label: React.ReactNode;
  icon?: React.ReactNode;
  variant?: InfoVariant;
}> = ({ value, label, icon, variant = "purple" }) => {
  const c = infoVariants[variant] ?? infoVariants.purple;

  return (
    <div
      className={`flex items-center gap-2.5 md:p-2 p-1.5 rounded-xl transition-all duration-200 group cursor-pointer border border-transparent ${c.hoverFrom} ${c.hoverTo} ${c.hoverBorderClass}`}
    >
      <div
        className={`md:w-14 md:h-14 i w-9 h-9 rounded-xl bg-linear-to-br ${c.colorFrom} ${c.colorVia} ${c.colorTo} flex items-center justify-center shadow-lg ${c.shadowBaseClass} ${c.shadowHoverClass} group-hover:scale-105 transition-all duration-200 shrink-0`}
      >
        <span className="text-white text-xs md:text-xs text-[10px] font-medium">
          {value}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`md:text-sm text-xs text-gray-900 transition-colors ${c.labelHoverClass}`}>
            {label}
          </span>
          <span className="md:text-lg text-base">{icon}</span>
        </div>
      </div>
    </div>
  );
};
