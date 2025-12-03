import { GlucoseStatus, getStatusColor, getStatusLabel } from '@/hooks/useDosageRules';
import { cn } from '@/lib/utils';

interface GlucoseDisplayProps {
  value: number;
  status: GlucoseStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  timestamp?: string;
}

export function GlucoseDisplay({ value, status, showLabel = true, size = 'lg', timestamp }: GlucoseDisplayProps) {
  const color = getStatusColor(status);
  const label = getStatusLabel(status);
  
  const sizeClasses = {
    sm: 'text-3xl',
    md: 'text-5xl',
    lg: 'text-6xl md:text-7xl'
  };

  const containerClasses = {
    success: 'bg-success-bg border-success/30',
    warning: 'bg-warning-bg border-warning/30',
    danger: 'bg-danger-bg border-danger/30 animate-pulse-ring',
    muted: 'bg-muted border-border'
  };

  const textClasses = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    muted: 'text-muted-foreground'
  };

  return (
    <div className={cn("rounded-3xl border-2 p-6 md:p-8 text-center transition-all duration-300", containerClasses[color as keyof typeof containerClasses])}>
      <div className={cn("font-extrabold tracking-tight transition-colors", sizeClasses[size], textClasses[color as keyof typeof textClasses])}>
        {value}
        <span className="text-2xl md:text-3xl ml-2 font-semibold opacity-70">mg/dL</span>
      </div>
      
      {showLabel && (
        <div className={cn("mt-3 text-xl md:text-2xl font-bold", textClasses[color as keyof typeof textClasses])}>
          {label}
        </div>
      )}

      {timestamp && <p className="text-muted-foreground text-sm mt-3">{timestamp}</p>}
    </div>
  );
}