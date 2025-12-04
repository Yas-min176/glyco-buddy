import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ReadingHistory } from '@/components/ReadingHistory';
import { QuickStats } from '@/components/QuickStats';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { GlucoseReading } from '@/lib/glucoseCalculator';
import { printReport, exportToCSV } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CalendarDays, Printer, Download, FileText } from 'lucide-react';

type FilterType = 'all' | 'week' | 'today';

const Historico = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [patientName, setPatientName] = useState<string | undefined>();
  const [filter, setFilter] = useState<FilterType>('week');
  const [loading, setLoading] = useState(true);

  const loadReadings = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch patient profile for name
      const { data: profile } = await supabase
        .from('profiles')
        .select('name')
        .eq('user_id', user.id)
        .single();
      
      if (profile) {
        setPatientName(profile.name);
      }

      // Build query based on filter
      let query = supabase
        .from('glucose_readings')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // Apply date filters
      const now = new Date();
      if (filter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        query = query.gte('created_at', today.toISOString());
      } else if (filter === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte('created_at', weekAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching readings:', error);
        toast({
          title: 'Erro ao carregar',
          description: 'Não foi possível carregar o histórico.',
          variant: 'destructive',
        });
        return;
      }

      // Transform Supabase data to GlucoseReading format
      const transformedReadings: GlucoseReading[] = (data || []).map(reading => ({
        id: reading.id,
        value: reading.value,
        timestamp: new Date(reading.created_at),
        recommendation: reading.recommendation || '',
        status: reading.status as GlucoseReading['status'],
        insulinUnits: reading.insulin_units || undefined,
      }));

      setReadings(transformedReadings);
    } catch (error) {
      console.error('Error loading readings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReadings();
  }, [filter, user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('glucose_readings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadReadings();
      toast({
        title: "Medição excluída",
        description: "O registro foi removido do histórico.",
      });
    } catch (error) {
      console.error('Error deleting reading:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir a medição.',
        variant: 'destructive',
      });
    }
  };

  const filterLabels: Record<FilterType, string> = {
    today: 'Hoje',
    week: 'Última Semana',
    all: 'Todas'
  };

  const handlePrint = () => {
    printReport(readings, patientName);
  };

  const handleExportCSV = () => {
    exportToCSV(readings, patientName);
    toast({
      title: 'Exportado com sucesso!',
      description: 'O arquivo CSV foi baixado.',
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <p className="text-center text-muted-foreground">
            Faça login para ver seu histórico.
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-heading text-foreground mb-1">
            Histórico
          </h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe suas medições
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 animate-fade-in">
          {(['today', 'week', 'all'] as FilterType[]).map((f) => (
            <Button
              key={f}
              variant={filter === f ? 'default' : 'secondary'}
              size="sm"
              onClick={() => setFilter(f)}
              className="flex-1"
            >
              {f === 'today' && <Calendar className="w-4 h-4 mr-1" />}
              {f === 'week' && <CalendarDays className="w-4 h-4 mr-1" />}
              {filterLabels[f]}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Carregando...
          </div>
        ) : (
          <>
            {/* Stats */}
            {readings.length > 0 && (
              <div className="mb-6 animate-fade-in">
                <QuickStats readings={readings} />
              </div>
            )}

            {/* Export Buttons */}
            {readings.length > 0 && (
              <div className="mb-6 animate-fade-in">
                <div className="card-elevated p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    Exportar Relatório
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={handlePrint} variant="outline" className="gap-2">
                      <Printer className="w-4 h-4" />
                      Imprimir
                    </Button>
                    <Button onClick={handleExportCSV} variant="outline" className="gap-2">
                      <Download className="w-4 h-4" />
                      Baixar CSV
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Readings List */}
            <div className="animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-foreground">
                  {readings.length} {readings.length === 1 ? 'medição' : 'medições'}
                </h2>
              </div>
              
              <ReadingHistory 
                readings={readings} 
                onDelete={handleDelete}
                showDelete={true}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Historico;
