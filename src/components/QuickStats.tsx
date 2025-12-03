import { GlucoseReading } from '@/lib/glucoseCalculator';
import { TrendingUp, TrendingDown, Activity, Syringe } from 'lucide-react';

interface QuickStatsProps {
  readings: GlucoseReading[];
}

export function QuickStats({ readings }: QuickStatsProps) {
  if (readings.length === 0) {
    return null;
  }

  const average = Math.round(
    readings.reduce((sum, r) => sum + r.value, 0) / readings.length
  );
  
  const highest = Math.max(...readings.map(r => r.value));
  const lowest = Math.min(...readings.map(r => r.value));
  
  const totalInsulin = readings.reduce((sum, r) => sum + (r.insulinUnits || 0), 0);

  const stats = [
    { 
      label: 'Média', 
      value: average, 
      unit: 'mg/dL', 
      icon: Activity,
      color: 'text-primary'
    },
    { 
      label: 'Maior', 
      value: highest, 
      unit: 'mg/dL', 
      icon: TrendingUp,
      color: 'text-warning'
    },
    { 
      label: 'Menor', 
      value: lowest, 
      unit: 'mg/dL', 
      icon: TrendingDown,
      color: 'text-success'
    },
    { 
      label: 'Insulina', 
      value: totalInsulin, 
      unit: 'unidades', 
      icon: Syringe,
      color: 'text-primary'
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map(({ label, value, unit, icon: Icon, color }) => (
        <div key={label} className="card-elevated p-4 text-center">
          <Icon className={`w-5 h-5 mx-auto mb-2 ${color}`} />
          <div className="text-2xl font-bold text-foreground">{value}</div>
          <div className="text-xs text-muted-foreground">{unit}</div>
          <div className="text-sm font-semibold text-muted-foreground mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
