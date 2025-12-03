import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Droplet, Plus, Minus } from 'lucide-react';

interface GlucoseInputProps {
  onSubmit: (value: number) => void;
  isLoading?: boolean;
}

export function GlucoseInput({ onSubmit, isLoading }: GlucoseInputProps) {
  const [value, setValue] = useState<string>('');
  
  const numValue = parseInt(value) || 0;
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numValue > 0 && numValue <= 600) {
      onSubmit(numValue);
      setValue('');
    }
  };

  const adjustValue = (delta: number) => {
    const newValue = Math.max(0, Math.min(600, numValue + delta));
    setValue(newValue.toString());
  };

  const quickValues = [80, 100, 120, 150, 200, 250, 300, 350];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="card-elevated p-6 md:p-8">
        <label className="block text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Droplet className="w-6 h-6 text-primary" />
          Valor da Glicemia (mg/dL)
        </label>
        
        <div className="flex items-center gap-3">
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            className="h-16 w-16 text-2xl"
            onClick={() => adjustValue(-10)}
            disabled={numValue <= 0}
          >
            <Minus className="w-6 h-6" />
          </Button>
          
          <Input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Digite aqui"
            className={cn(
              "h-20 text-center text-4xl font-bold",
              "border-2 rounded-2xl",
              "focus:ring-4 focus:ring-primary/20"
            )}
            min={1}
            max={600}
          />
          
          <Button 
            type="button" 
            variant="outline" 
            size="icon"
            className="h-16 w-16 text-2xl"
            onClick={() => adjustValue(10)}
            disabled={numValue >= 600}
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>

        {/* Quick value buttons */}
        <div className="mt-6">
          <p className="text-sm font-semibold text-muted-foreground mb-3">Valores rápidos:</p>
          <div className="grid grid-cols-4 gap-2">
            {quickValues.map((qv) => (
              <Button
                key={qv}
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setValue(qv.toString())}
                className="text-base font-semibold"
              >
                {qv}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <Button 
        type="submit" 
        size="xl" 
        className="w-full"
        disabled={numValue <= 0 || numValue > 600 || isLoading}
      >
        {isLoading ? 'Calculando...' : 'Calcular Recomendação'}
      </Button>
    </form>
  );
}
