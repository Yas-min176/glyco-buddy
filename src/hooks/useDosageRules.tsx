import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { ensureUserProfile } from '@/lib/ensureProfile';
import { evaluateFormula } from '@/lib/safeFormulaEvaluator';
export interface DosageRule {
  id: string;
  user_id: string;
  min_glucose: number;
  max_glucose: number | null;
  insulin_units: number | null;
  recommendation: string;
  is_emergency: boolean;
  display_order: number;
}

export type GlucoseStatus = 'critical-low' | 'low' | 'normal' | 'high' | 'very-high' | 'critical-high';

export interface GlucoseRecommendation {
  message: string;
  status: GlucoseStatus;
  insulinUnits?: number;
  isEmergency: boolean;
  icon: string;
}

export function useDosageRules() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<DosageRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculationType, setCalculationType] = useState<'rules' | 'formula'>('rules');
  const [insulinFormula, setInsulinFormula] = useState<string | null>(null);
  const [insulinType, setInsulinType] = useState<string | null>(null);

  const fetchRules = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // Garante que o profile existe antes de buscar dados
      const profileExists = await ensureUserProfile(user);
      if (!profileExists) {
        console.error('Não foi possível garantir o profile do usuário');
        setLoading(false);
        return;
      }

      // Fetch user calculation preferences
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('dosage_calculation_type, insulin_formula, insulin_type')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
      } else {
        setCalculationType((profile?.dosage_calculation_type || 'rules') as 'rules' | 'formula');
        setInsulinFormula(profile?.insulin_formula || null);
        setInsulinType(profile?.insulin_type || null);
      }

      // Fetch dosage rules
      const { data, error } = await supabase
        .from('dosage_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching rules:', error);
      }
      
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching dosage rules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [user]);

  const updateRule = async (id: string, updates: Partial<DosageRule>) => {
    try {
      const { error } = await supabase
        .from('dosage_rules')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await fetchRules();
      toast({
        title: 'Regra atualizada!',
        description: 'A configuração de dosagem foi salva.',
      });
    } catch (error) {
      console.error('Error updating rule:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar a regra.',
        variant: 'destructive',
      });
    }
  };

  const addRule = async (rule: Omit<DosageRule, 'id' | 'user_id'>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('dosage_rules')
        .insert({
          ...rule,
          user_id: user.id,
        });

      if (error) throw error;
      
      await fetchRules();
      toast({
        title: 'Regra adicionada!',
        description: 'Nova configuração de dosagem criada.',
      });
    } catch (error) {
      console.error('Error adding rule:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a regra.',
        variant: 'destructive',
      });
    }
  };

  const deleteRule = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dosage_rules')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchRules();
      toast({
        title: 'Regra removida',
        description: 'A configuração foi excluída.',
      });
    } catch (error) {
      console.error('Error deleting rule:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a regra.',
        variant: 'destructive',
      });
    }
  };

  const calculateRecommendation = (glucoseValue: number): GlucoseRecommendation => {
    // MÉTODO 1: FÓRMULA MATEMÁTICA (uma única fórmula)
    if (calculationType === 'formula' && insulinFormula) {
      try {
        const calculatedUnits = evaluateFormula(insulinFormula, glucoseValue);
        
        if (calculatedUnits === null) {
          throw new Error('Invalid formula result');
        }
        
        const units = Math.round(calculatedUnits * 10) / 10;
        
        // Hipoglicemia crítica - NUNCA aplica insulina
        if (glucoseValue <= 60) {
          return {
            status: 'critical-low',
            message: '🆘 COMA ALGO DOCE IMEDIATAMENTE! Procure atendimento médico se não melhorar.',
            insulinUnits: undefined,
            isEmergency: true,
            icon: '🆘',
          };
        }
        
        // Hipoglicemia - NUNCA aplica insulina
        if (glucoseValue < 90) {
          return {
            status: 'low',
            message: 'Coma um alimento doce para elevar a glicemia.',
            insulinUnits: undefined,
            isEmergency: false,
            icon: '🍬',
          };
        }
        
        // Hiperglicemia crítica
        if (glucoseValue >= 450) {
          return {
            status: 'critical-high',
            message: `🚨 Tome ${units.toFixed(1)} unidades de ${insulinType || 'insulina'} e BUSQUE ATENDIMENTO MÉDICO IMEDIATAMENTE!`,
            insulinUnits: units > 0 ? units : undefined,
            isEmergency: true,
            icon: '🚨',
          };
        }
        
        // Hiperglicemia alta
        if (glucoseValue >= 350) {
          return {
            status: 'very-high',
            message: units > 0 
              ? `Tome ${units.toFixed(1)} unidades de ${insulinType || 'insulina'}.`
              : 'Continue monitorando. Consulte seu médico.',
            insulinUnits: units > 0 ? units : undefined,
            isEmergency: false,
            icon: '💉',
          };
        }
        
        // Hiperglicemia
        if (glucoseValue >= 250) {
          return {
            status: 'high',
            message: units > 0 
              ? `Tome ${units.toFixed(1)} unidades de ${insulinType || 'insulina'}.`
              : 'Continue monitorando. Consulte seu médico se persistir elevada.',
            insulinUnits: units > 0 ? units : undefined,
            isEmergency: false,
            icon: '💉',
          };
        }
        
        // Normal
        return {
          status: 'normal',
          message: 'Glicemia estável. Continue monitorando normalmente.',
          insulinUnits: undefined,
          isEmergency: false,
          icon: '✅',
        };
      } catch (error) {
        console.error('Erro ao calcular fórmula:', error);
        toast({
          title: 'Erro na fórmula',
          description: 'A fórmula configurada está inválida. Usando regras padrão.',
          variant: 'destructive',
        });
        // Continua para usar regras como fallback
      }
    }

    // MÉTODO 2: REGRAS RELACIONAIS (várias regras)
    if (rules.length === 0) {
      return {
        status: 'normal',
        message: 'Configure as regras de dosagem em Configurações.',
        insulinUnits: undefined,
        isEmergency: false,
        icon: '⚙️',
      };
    }

    // Ordena regras do maior para o menor (mais crítico primeiro)
    const sortedRules = [...rules].sort((a, b) => b.min_glucose - a.min_glucose);
    
    // Procura a regra que se aplica
    for (const rule of sortedRules) {
      const matchesMin = glucoseValue >= rule.min_glucose;
      const matchesMax = rule.max_glucose === null || glucoseValue <= rule.max_glucose;
      
      if (matchesMin && matchesMax) {
        return {
          message: rule.recommendation,
          status: getStatusFromRule(rule, glucoseValue),
          insulinUnits: rule.insulin_units || undefined,
          isEmergency: rule.is_emergency,
          icon: getIconFromRule(rule, glucoseValue),
        };
      }
    }

    // Fallback se nenhuma regra se aplicar
    return {
      status: 'normal',
      message: 'Glicemia estável. Continue monitorando normalmente.',
      insulinUnits: undefined,
      isEmergency: false,
      icon: '✅',
    };
  };

  return {
    rules,
    loading,
    calculationType,
    insulinFormula,
    insulinType,
    updateRule,
    addRule,
    deleteRule,
    calculateRecommendation,
    refetch: fetchRules,
  };
}

function getStatusFromRule(rule: DosageRule, value: number): GlucoseStatus {
  if (rule.is_emergency) {
    return value <= 60 ? 'critical-low' : 'critical-high';
  }
  if (value >= 350) return 'very-high';
  if (value >= 250) return 'high';
  if (value < 90) return 'low';
  return 'normal';
}

function getIconFromRule(rule: DosageRule, value: number): string {
  if (rule.is_emergency) {
    return value <= 60 ? '🆘' : '🚨';
  }
  if (rule.insulin_units) return '💉';
  if (value < 90) return '🍬';
  return '✅';
}

export function getStatusColor(status: GlucoseStatus): string {
  switch (status) {
    case 'critical-low':
    case 'critical-high':
      return 'danger';
    case 'low':
    case 'very-high':
    case 'high':
      return 'warning';
    case 'normal':
      return 'success';
    default:
      return 'muted';
  }
}

export function getStatusLabel(status: GlucoseStatus): string {
  switch (status) {
    case 'critical-low':
      return 'Hipoglicemia Grave';
    case 'low':
      return 'Hipoglicemia';
    case 'normal':
      return 'Normal';
    case 'high':
      return 'Hiperglicemia';
    case 'very-high':
      return 'Hiperglicemia Alta';
    case 'critical-high':
      return 'Hiperglicemia Grave';
    default:
      return 'Desconhecido';
  }
}