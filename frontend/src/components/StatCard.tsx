import { StatVariant, statVariants } from "../data/StaticData";
import { Card } from "./ui/card";

export const StatCard: React.FC<{
  title: React.ReactNode;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon?: React.ReactNode;
  variant?: StatVariant;
}> = ({ title, value, subtitle, icon, variant = "cyan" }) => {
  const c = statVariants[variant] ?? statVariants.cyan;

  return (
    <Card className={`md:p-4 p-3 bg-linear-to-br ${c.fromColor} ${c.toColor} ${c.borderColor} hover:shadow-lg transition-shadow cursor-pointer group`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="md:text-sm text-xs text-gray-600 md:mb-1 mb-0.5">{title}</p>
          <p className={`${c.valueColor} md:text-base text-sm`}>{value}</p>
          {subtitle ? <p className={`md:text-xs text-[10px] ${c.subtitleColor} md:mt-1 mt-0.5`}>{subtitle}</p> : null}
        </div>
        <div className={`bg-linear-to-br ${c.iconFrom} ${c.iconTo} md:p-3 p-2 md:rounded-xl rounded-lg group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};
