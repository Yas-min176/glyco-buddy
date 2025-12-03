import { GlucoseRecommendation, getStatusColor } from '@/lib/glucoseCalculator';
import { cn } from '@/lib/utils';
import { AlertTriangle, CheckCircle, Syringe, Candy } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: GlucoseRecommendation;
}

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const color = getStatusColor(recommendation.status);
  
  const containerClasses = {
    success: 'bg-success-bg border-success/30',
    warning: 'bg-warning-bg border-warning/30',
    danger: 'bg-danger-bg border-danger/30',
    muted: 'bg-muted border-border'
  };

  const iconClasses = {
    success: 'text-success',
    warning: 'text-warning',
    danger: 'text-danger',
    muted: 'text-muted-foreground'
  };

  const Icon = recommendation.isEmergency 
    ? AlertTriangle 
    : recommendation.insulinUnits 
      ? Syringe 
      : recommendation.status === 'normal' 
        ? CheckCircle 
        : Candy;

  return (
    <div 
      className={cn(
        "rounded-2xl border-2 p-6 transition-all duration-300 animate-fade-in",
        containerClasses[color as keyof typeof containerClasses]
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          "p-3 rounded-xl bg-background/50",
          iconClasses[color as keyof typeof iconClasses]
        )}>
          <Icon className="w-8 h-8" />
        </div>
        
        <div className="flex-1">
          <h3 className={cn(
            "text-xl md:text-2xl font-bold mb-2",
            iconClasses[color as keyof typeof iconClasses]
          )}>
            {recommendation.isEmergency ? 'ATENÇÃO!' : 'Recomendação'}
          </h3>
          
          <p className="text-lg md:text-xl text-foreground leading-relaxed">
            {recommendation.message}
          </p>
          
          {recommendation.insulinUnits && (
            <div className={cn(
              "mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg",
              "bg-background/50",
              iconClasses[color as keyof typeof iconClasses]
            )}>
              <Syringe className="w-5 h-5" />
              {recommendation.insulinUnits} unidades
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
