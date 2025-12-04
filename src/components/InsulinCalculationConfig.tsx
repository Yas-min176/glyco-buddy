import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calculator, List, Save, Info, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { DosageRuleEditor } from '@/components/DosageRuleEditor';
import { DosageRule } from '@/hooks/useDosageRules';
import { ensureUserProfile } from '@/lib/ensureProfile';
import { evaluateFormula, validateFormula } from '@/lib/safeFormulaEvaluator';
type CalculationType = 'rules' | 'formula';

interface InsulinCalculationConfigProps {
  rules: DosageRule[];
  loadingRules: boolean;
  onUpdateRule: (id: string, updates: Partial<DosageRule>) => Promise<void>;
  onAddRule: (rule: Omit<DosageRule, 'id' | 'user_id'>) => Promise<void>;
  onDeleteRule: (id: string) => Promise<void>;
}

export function InsulinCalculationConfig({ 
  rules, 
  loadingRules, 
  onUpdateRule, 
  onAddRule, 
  onDeleteRule 
}: InsulinCalculationConfigProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [calculationType, setCalculationType] = useState<CalculationType>('rules');
  const [formula, setFormula] = useState('(glucose - 100) / 30');
  const [insulinType, setInsulinType] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Garante que o profile existe
        const profileExists = await ensureUserProfile(user);
        if (!profileExists) {
          console.error('Não foi possível garantir o profile do usuário');
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('dosage_calculation_type, insulin_formula, insulin_type')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching config:', error);
        } else if (data) {
          setCalculationType((data.dosage_calculation_type || 'rules') as CalculationType);
          setFormula(data.insulin_formula || '(glucose - 100) / 30');
          setInsulinType(data.insulin_type || '');
        }
      } catch (error) {
        console.error('Error fetching config:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Validações
    if (calculationType === 'formula') {
      if (!insulinType.trim()) {
        toast({
          title: 'Tipo de insulina obrigatório',
          description: 'Digite o tipo de insulina (ex: Fiasp, Novorapid)',
          variant: 'destructive',
        });
        return;
      }
      if (!formula.trim()) {
        toast({
          title: 'Fórmula obrigatória',
          description: 'Digite a fórmula de cálculo',
          variant: 'destructive',
        });
        return;
      }
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          dosage_calculation_type: calculationType,
          insulin_formula: calculationType === 'formula' ? formula.trim() : null,
          insulin_type: calculationType === 'formula' ? insulinType.trim() : null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Configuração salva! ✅',
        description: calculationType === 'formula' 
          ? 'Fórmula matemática configurada com sucesso.'
          : 'Regras relacionais configuradas com sucesso.',
      });

      // Aguardar 1 segundo e recarregar
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast({
        title: 'Erro ao salvar',
        description: error.message || 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const testFormula = () => {
    const validation = validateFormula(formula);
    if (!validation.isValid) {
      toast({
        title: 'Fórmula inválida',
        description: validation.error || 'Verifique a sintaxe da fórmula.',
        variant: 'destructive',
      });
      return;
    }

    const testValue = 150;
    const result = evaluateFormula(formula, testValue);
    
    if (result === null) {
      toast({
        title: 'Fórmula inválida',
        description: 'A fórmula produziu um resultado inválido.',
        variant: 'destructive',
      });
      return;
    }
    
    toast({
      title: 'Teste da fórmula',
      description: `Para glicemia ${testValue} mg/dL: ${result.toFixed(2)} unidades`,
    });
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" />
          Método de Cálculo de Insulina
        </h2>
        <p className="text-muted-foreground">
          Escolha como deseja calcular a dose de insulina
        </p>
      </div>

      <RadioGroup 
        value={calculationType} 
        onValueChange={(value) => setCalculationType(value as CalculationType)}
        className="space-y-4"
      >
        {/* Rules Option */}
        <Card className={`p-4 cursor-pointer transition-all ${
          calculationType === 'rules' 
            ? 'border-primary border-2 bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="rules" id="rules" className="mt-1" />
            <Label htmlFor="rules" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <List className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg">Regras Relacionais</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Configure faixas de glicemia e doses correspondentes
              </p>
              <div className="text-xs bg-accent p-2 rounded">
                <strong>Exemplo:</strong> Se glicemia entre 250-350 → 2 unidades
              </div>
            </Label>
          </div>
        </Card>

        {/* Formula Option */}
        <Card className={`p-4 cursor-pointer transition-all ${
          calculationType === 'formula' 
            ? 'border-primary border-2 bg-primary/5' 
            : 'border-border hover:border-primary/50'
        }`}>
          <div className="flex items-start gap-3">
            <RadioGroupItem value="formula" id="formula" className="mt-1" />
            <Label htmlFor="formula" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-primary" />
                <span className="font-bold text-lg">Fórmula Matemática</span>
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                Use uma fórmula personalizada prescrita pelo seu médico
              </p>
              <div className="text-xs bg-accent p-2 rounded">
                <strong>Exemplo:</strong> (glicemia - 100) / 30 = doses
              </div>
            </Label>
          </div>
        </Card>
      </RadioGroup>

      {/* Rules Configuration */}
      {calculationType === 'rules' && (
        <Card className="p-6 border-primary/30 bg-primary/5">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-foreground mb-2">Gerenciar Regras de Dosagem</h3>
            <p className="text-sm text-muted-foreground">
              Configure as faixas de glicemia e as doses correspondentes de insulina
            </p>
          </div>
          {loadingRules ? (
            <div className="text-center py-8 text-muted-foreground">Carregando regras...</div>
          ) : (
            <DosageRuleEditor
              rules={rules}
              onUpdate={onUpdateRule}
              onAdd={onAddRule}
              onDelete={onDeleteRule}
            />
          )}
        </Card>
      )}

      {/* Formula Configuration */}
      {calculationType === 'formula' && (
        <Card className="p-6 border-primary/30 bg-primary/5">
          <div className="space-y-4">
            <div>
              <Label htmlFor="insulinType" className="text-base font-semibold">
                Tipo de Insulina
              </Label>
              <Input
                id="insulinType"
                value={insulinType}
                onChange={(e) => setInsulinType(e.target.value)}
                placeholder="Ex: Fiasp, Novorapid, Humalog"
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="formula" className="text-base font-semibold flex items-center gap-2">
                Fórmula de Cálculo
                <span className="text-xs text-muted-foreground font-normal">(use "glucose" para o valor)</span>
              </Label>
              <Input
                id="formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="(glucose - 100) / 30"
                className="mt-2 font-mono"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={testFormula} 
                variant="outline" 
                size="sm"
                className="flex-1"
              >
                Testar Fórmula
              </Button>
            </div>

            <div className="bg-accent p-4 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-semibold mb-1">Como usar a fórmula:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use <code className="bg-background px-1 rounded">glucose</code> para representar a medição</li>
                    <li>Operadores: + - * / ( )</li>
                    <li>Exemplo: <code className="bg-background px-1 rounded">(glucose - 100) / 30</code></li>
                    <li>Para 180 mg/dL: (180 - 100) / 30 = 2.67 unidades</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <Button 
        onClick={handleSave} 
        size="lg" 
        className="w-full gap-2"
        disabled={saving}
      >
        <Save className="w-5 h-5" />
        {saving ? 'Salvando...' : 'Salvar Configuração'}
      </Button>
    </div>
  );
}
