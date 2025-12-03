import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

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

  const fetchRules = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('dosage_rules')
        .select('*')
        .eq('user_id', user.id)
        .order('display_order', { ascending: true });

      if (error) throw error;
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
    // Sort rules to check in proper order (highest min_glucose first for high values)
    const sortedRules = [...rules].sort((a, b) => b.min_glucose - a.min_glucose);
    
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

    // Default fallback
    return {
      message: 'Glicemia estável. Continue monitorando normalmente.',
      status: 'normal',
      isEmergency: false,
      icon: '✅',
    };
  };

  return {
    rules,
    loading,
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