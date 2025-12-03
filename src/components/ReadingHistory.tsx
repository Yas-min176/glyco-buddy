import { GlucoseReading, getStatusColor, getStatusLabel, formatDate } from '@/lib/glucoseCalculator';
import { cn } from '@/lib/utils';
import { Clock, Syringe, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ReadingHistoryProps {
  readings: GlucoseReading[];
  onDelete?: (id: string) => void;
  showDelete?: boolean;
}

export function ReadingHistory({ readings, onDelete, showDelete = false }: ReadingHistoryProps) {
  if (readings.length === 0) {
    return (
      <div className="card-elevated p-8 text-center">
        <p className="text-muted-foreground text-lg">
          Nenhuma medição registrada ainda.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {readings.map((reading) => {
        const color = getStatusColor(reading.status);
        
        const bgClasses = {
          success: 'border-l-success bg-success-bg/30',
          warning: 'border-l-warning bg-warning-bg/30',
          danger: 'border-l-danger bg-danger-bg/30',
          muted: 'border-l-muted bg-muted/30'
        };

        const textClasses = {
          success: 'text-success',
          warning: 'text-warning',
          danger: 'text-danger',
          muted: 'text-muted-foreground'
        };

        return (
          <div 
            key={reading.id}
            className={cn(
              "card-elevated border-l-4 p-4 transition-all hover:scale-[1.01]",
              bgClasses[color as keyof typeof bgClasses]
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "text-3xl font-extrabold",
                  textClasses[color as keyof typeof textClasses]
                )}>
                  {reading.value}
                  <span className="text-sm ml-1 opacity-70">mg/dL</span>
                </div>
                
                <div className="border-l border-border pl-4">
                  <div className={cn(
                    "font-bold",
                    textClasses[color as keyof typeof textClasses]
                  )}>
                    {getStatusLabel(reading.status)}
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(reading.timestamp)}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                {reading.insulinUnits && (
                  <div className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-bold",
                    "bg-background/50",
                    textClasses[color as keyof typeof textClasses]
                  )}>
                    <Syringe className="w-4 h-4" />
                    {reading.insulinUnits}u
                  </div>
                )}
                
                {showDelete && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(reading.id)}
                    className="text-muted-foreground hover:text-danger"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
