import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { GlucoseDisplay } from '@/components/GlucoseDisplay';
import { RecommendationCard } from '@/components/RecommendationCard';
import { ReadingHistory } from '@/components/ReadingHistory';
import { QuickStats } from '@/components/QuickStats';
import { Button } from '@/components/ui/button';
import { getLastReading, getTodayReadings, getPatientInfo } from '@/lib/storage';
import { calculateRecommendation, formatDate, GlucoseReading } from '@/lib/glucoseCalculator';
import { Plus, Clock, Heart } from 'lucide-react';

const Index = () => {
  const [lastReading, setLastReading] = useState<GlucoseReading | null>(null);
  const [todayReadings, setTodayReadings] = useState<GlucoseReading[]>([]);
  const [patientName, setPatientName] = useState<string>('');

  useEffect(() => {
    const reading = getLastReading();
    setLastReading(reading);
    setTodayReadings(getTodayReadings());
    
    const patient = getPatientInfo();
    if (patient) {
      setPatientName(patient.name);
    }
  }, []);

  const recommendation = lastReading 
    ? calculateRecommendation(lastReading.value)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        {/* Welcome Section */}
        <div className="mb-6 animate-fade-in">
          <h1 className="text-heading text-foreground mb-1">
            {patientName ? `Olá, ${patientName}!` : 'Bem-vindo ao GlicoGuia'}
          </h1>
          <p className="text-muted-foreground text-lg">
            Seu assistente de monitoramento de glicemia
          </p>
        </div>

        {/* Last Reading Display */}
        {lastReading ? (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Última Medição
              </h2>
              <span className="text-sm text-muted-foreground">
                {formatDate(lastReading.timestamp)}
              </span>
            </div>
            
            <GlucoseDisplay 
              value={lastReading.value} 
              status={lastReading.status} 
            />
            
            {recommendation && (
              <RecommendationCard recommendation={recommendation} />
            )}
          </div>
        ) : (
          <div className="card-elevated p-8 text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Nenhuma medição registrada
            </h2>
            <p className="text-muted-foreground mb-6">
              Faça sua primeira medição para receber orientações personalizadas
            </p>
            <Link to="/nova-medicao">
              <Button size="lg" className="gap-2">
                <Plus className="w-5 h-5" />
                Nova Medição
              </Button>
            </Link>
          </div>
        )}

        {/* Quick Action Button */}
        {lastReading && (
          <div className="mt-6">
            <Link to="/nova-medicao">
              <Button size="lg" className="w-full gap-2">
                <Plus className="w-5 h-5" />
                Nova Medição
              </Button>
            </Link>
          </div>
        )}

        {/* Today's Stats */}
        {todayReadings.length > 0 && (
          <div className="mt-8 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Resumo de Hoje
            </h2>
            <QuickStats readings={todayReadings} />
          </div>
        )}

        {/* Recent History */}
        {todayReadings.length > 1 && (
          <div className="mt-8 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">
                Medições de Hoje
              </h2>
              <Link to="/historico" className="text-primary font-semibold text-sm hover:underline">
                Ver todas
              </Link>
            </div>
            <ReadingHistory readings={todayReadings.slice(0, 3)} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
