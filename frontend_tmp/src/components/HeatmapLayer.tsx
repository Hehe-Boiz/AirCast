import { Report } from '../App';

type HeatmapLayerProps = {
  reports: Report[];
};

export function HeatmapLayer({ reports }: HeatmapLayerProps) {
  const getAQIValue = (level?: string): number => {
    switch (level) {
      case 'good': return 30;
      case 'moderate': return 75;
      case 'unhealthy': return 125;
      case 'very_unhealthy': return 175;
      case 'hazardous': return 225;
      default: return 50;
    }
  };

  const getColor = (aqi: number): string => {
    if (aqi <= 50) return 'rgba(34, 197, 94, 0.3)'; // green
    if (aqi <= 100) return 'rgba(234, 179, 8, 0.3)'; // yellow
    if (aqi <= 150) return 'rgba(249, 115, 22, 0.3)'; // orange
    if (aqi <= 200) return 'rgba(239, 68, 68, 0.3)'; // red
    return 'rgba(168, 85, 247, 0.3)'; // purple
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {reports.filter(r => r.type === 'air').map((report) => {
        const aqi = getAQIValue(report.airQuality);
        const color = getColor(aqi);
        
        return (
          <div
            key={report.id}
            className="absolute rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${((report.lng - 106.65) / 0.15) * 100}%`,
              top: `${((10.85 - report.lat) / 0.15) * 100}%`,
              width: '200px',
              height: '200px',
              background: `radial-gradient(circle, ${color}, transparent)`,
            }}
          />
        );
      })}
    </div>
  );
}
