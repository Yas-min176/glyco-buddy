import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GlucoseInput } from '@/components/GlucoseInput';
import { RecommendationCard } from '@/components/RecommendationCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useDosageRules, GlucoseRecommendation } from '@/hooks/useDosageRules';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Save, RotateCcw, Utensils } from 'lucide-react';
import { GlucoseDisplay } from '@/components/GlucoseDisplay';

const NovaMedicao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const { calculateRecommendation, loading: rulesLoading } = useDosageRules();
  
  const [glucoseValue, setGlucoseValue] = useState<number | null>(null);
  const [recommendation, setRecommendation] = useState<GlucoseRecommendation | null>(null);
  const [isFasting, setIsFasting] = useState(false);
  const [mealDescription, setMealDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCalculate = (value: number) => {
    setGlucoseValue(value);
    const rec = calculateRecommendation(value);
    setRecommendation(rec);
  };

  const handleSave = async () => {
    if (!glucoseValue || !recommendation || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('glucose_readings').insert({
        user_id: user.id,
        value: glucoseValue,
        recommendation: recommendation.message,
        insulin_units: recommendation.insulinUnits || null,
        status: recommendation.status,
        is_fasting: isFasting,
        meal_description: !isFasting && mealDescription ? mealDescription : null,
      });

      if (error) throw error;

      toast({
        title: 'Medição salva! 🐝',
        description: `Glicemia de ${glucoseValue} mg/dL registrada com sucesso.`,
      });

      navigate('/');
    } catch (error) {
      console.error('Error saving reading:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar a medição.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setGlucoseValue(null);
    setRecommendation(null);
    setIsFasting(false);
    setMealDescription('');
  };

  if (rulesLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
          <div className="card-elevated p-6 animate-pulse">
            <div className="h-40 bg-muted rounded-xl"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background honeycomb-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-heading text-foreground mb-1">
            Nova Medição
          </h1>
          <p className="text-muted-foreground text-lg">
            Digite o valor da sua glicemia
          </p>
        </div>

        {/* Glucose Input */}
        {!glucoseValue ? (
          <div className="mb-6 animate-fade-in">
            <GlucoseInput onSubmit={handleCalculate} />
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            {/* Show current value */}
            <GlucoseDisplay 
              value={glucoseValue} 
              status={recommendation?.status || 'normal'}
            />

            {/* Meal info */}
            <div className="card-elevated p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Utensils className="w-5 h-5 text-primary" />
                  <Label htmlFor="fasting" className="text-base font-semibold cursor-pointer">
                    Em jejum?
                  </Label>
                </div>
                <Switch
                  id="fasting"
                  checked={isFasting}
                  onCheckedChange={setIsFasting}
                />
              </div>

              {!isFasting && (
                <div>
                  <Label htmlFor="meal" className="text-base font-semibold mb-2 block">
                    O que comeu? (opcional)
                  </Label>
                  <Textarea
                    id="meal"
                    value={mealDescription}
                    onChange={(e) => setMealDescription(e.target.value)}
                    placeholder="Ex: Arroz, feijão e frango grelhado"
                    className="min-h-[80px]"
                  />
                </div>
              )}
            </div>

            {/* Recommendation */}
            {recommendation && (
              <RecommendationCard recommendation={recommendation} />
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleReset}
                className="flex-1 gap-2"
              >
                <RotateCcw className="w-5 h-5" />
                Nova
              </Button>
              <Button
                size="lg"
                onClick={handleSave}
                disabled={saving}
                className="flex-1 gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default NovaMedicao;