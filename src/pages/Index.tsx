import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { GlucoseDisplay } from '@/components/GlucoseDisplay';
import { QuickStats } from '@/components/QuickStats';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GlucoseStatus } from '@/hooks/useDosageRules';

interface GlucoseReading {
  id: string;
  value: number;
  recommendation: string | null;
  insulin_units: number | null;
  status: string;
  is_fasting: boolean;
  meal_description: string | null;
  created_at: string;
}

const Index = () => {
  const { user } = useAuth();
  const [lastReading, setLastReading] = useState<GlucoseReading | null>(null);
  const [weekReadings, setWeekReadings] = useState<GlucoseReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      if (!user) return;

      try {
        // Fetch last reading
        const { data: lastData } = await supabase
          .from('glucose_readings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setLastReading(lastData);

        // Fetch week readings
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        
        const { data: weekData } = await supabase
          .from('glucose_readings')
          .select('*')
          .eq('user_id', user.id)
          .gte('created_at', weekAgo.toISOString())
          .order('created_at', { ascending: false });

        setWeekReadings(weekData || []);
      } catch (error) {
        console.error('Error fetching readings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [user]);

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-background honeycomb-pattern">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        {/* Welcome */}
        <div className="mb-6 animate-fade-in">
          <h2 className="text-heading text-foreground mb-1">
            Olá! 🐝
          </h2>
          <p className="text-muted-foreground text-lg">
            Como está sua glicemia hoje?
          </p>
        </div>

        {/* Main Action */}
        <Link to="/nova-medicao" className="block mb-6">
          <div className="card-glow p-6 transition-all hover:scale-[1.02] active:scale-[0.98] animate-fade-in">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-foreground">Nova Medição</h3>
                <p className="text-muted-foreground">Registre sua glicemia agora</p>
              </div>
              <span className="text-4xl">💉</span>
            </div>
          </div>
        </Link>

        {/* Last Reading */}
        {loading ? (
          <div className="card-elevated p-6 mb-6 animate-pulse">
            <div className="h-20 bg-muted rounded-xl"></div>
          </div>
        ) : lastReading ? (
          <div className="mb-6 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Última Medição
            </h3>
            <GlucoseDisplay 
              value={lastReading.value} 
              status={lastReading.status as GlucoseStatus}
              timestamp={formatDate(lastReading.created_at)}
            />
          </div>
        ) : (
          <div className="card-elevated p-6 mb-6 text-center animate-fade-in">
            <span className="text-5xl mb-3 block">🐝</span>
            <p className="text-muted-foreground text-lg">
              Nenhuma medição registrada ainda.
            </p>
            <p className="text-muted-foreground">
              Faça sua primeira medição!
            </p>
          </div>
        )}

        {/* Quick Stats */}
        {weekReadings.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
              <Heart className="w-5 h-5 text-danger" />
              Resumo da Semana
            </h3>
            <QuickStats readings={weekReadings.map(r => ({
              id: r.id,
              value: r.value,
              timestamp: new Date(r.created_at),
              recommendation: r.recommendation || '',
              status: r.status as GlucoseStatus,
              insulinUnits: r.insulin_units || undefined,
            }))} />
          </div>
        )}

        {/* Motivational Card */}
        <div className="card-honey p-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-3xl">💛</span>
            <div>
              <h4 className="font-bold text-foreground mb-1">Dica do Dia</h4>
              <p className="text-muted-foreground">
                Manter um registro regular das medições ajuda você e seu médico 
                a entenderem melhor como está o controle da sua glicemia.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;