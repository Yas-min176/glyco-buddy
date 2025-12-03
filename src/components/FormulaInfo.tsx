import { Info, Calculator } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FormulaInfoProps {
  formula: string;
  insulinType?: string | null;
}

export function FormulaInfo({ formula, insulinType }: FormulaInfoProps) {
  // Calculate example
  const exampleGlucose = 180;
  let exampleResult = 0;
  
  try {
    const testFormula = formula.replace(/glucose/gi, exampleGlucose.toString());
    // eslint-disable-next-line no-eval
    exampleResult = Math.round(eval(testFormula) * 10) / 10;
  } catch (error) {
    exampleResult = 0;
  }

  return (
    <Card className="p-4 bg-primary/5 border-primary/30">
      <div className="flex items-start gap-3">
        <Calculator className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Cálculo Personalizado Ativo
            </p>
            <p className="text-xs text-muted-foreground">
              Usando fórmula matemática prescrita pelo seu médico
            </p>
          </div>
          
          <div className="bg-background p-3 rounded-lg border border-border">
            <p className="text-xs text-muted-foreground mb-1">Fórmula:</p>
            <p className="font-mono text-sm text-foreground">{formula}</p>
            {insulinType && (
              <p className="text-xs text-primary mt-1">Insulina: {insulinType}</p>
            )}
          </div>

          <div className="bg-accent p-2 rounded text-xs">
            <div className="flex items-center gap-2">
              <Info className="w-3 h-3 text-primary flex-shrink-0" />
              <div>
                <span className="font-semibold">Exemplo:</span> Para {exampleGlucose} mg/dL → {exampleResult.toFixed(1)} unidades
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
