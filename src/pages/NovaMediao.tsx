import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GlucoseInput } from '@/components/GlucoseInput';
import { GlucoseDisplay } from '@/components/GlucoseDisplay';
import { RecommendationCard } from '@/components/RecommendationCard';
import { Button } from '@/components/ui/button';
import { saveReading } from '@/lib/storage';
import { calculateRecommendation, GlucoseReading, GlucoseRecommendation } from '@/lib/glucoseCalculator';
import { useToast } from '@/hooks/use-toast';
import { Check, RotateCcw } from 'lucide-react';

const NovaMedicao = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [result, setResult] = useState<{
    reading: GlucoseReading;
    recommendation: GlucoseRecommendation;
  } | null>(null);

  const handleSubmit = (value: number) => {
    const reading = saveReading(value);
    const recommendation = calculateRecommendation(value);
    
    setResult({ reading, recommendation });
    
    toast({
      title: "Medição registrada!",
      description: `Glicemia de ${value} mg/dL salva com sucesso.`,
    });
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-heading text-foreground mb-1">
            Nova Medição
          </h1>
          <p className="text-muted-foreground text-lg">
            Digite o valor da sua glicemia atual
          </p>
        </div>

        {!result ? (
          <div className="animate-fade-in">
            <GlucoseInput onSubmit={handleSubmit} />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <GlucoseDisplay 
              value={result.reading.value} 
              status={result.reading.status}
            />
            
            <RecommendationCard recommendation={result.recommendation} />
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 gap-2"
                onClick={handleReset}
              >
                <RotateCcw className="w-5 h-5" />
                Nova Medição
              </Button>
              
              <Button 
                size="lg" 
                className="flex-1 gap-2"
                onClick={() => navigate('/')}
              >
                <Check className="w-5 h-5" />
                Concluir
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NovaMedicao;
