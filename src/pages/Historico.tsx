import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { ReadingHistory } from '@/components/ReadingHistory';
import { QuickStats } from '@/components/QuickStats';
import { Button } from '@/components/ui/button';
import { getReadings, getWeekReadings, deleteReading, getPatientInfo } from '@/lib/storage';
import { GlucoseReading } from '@/lib/glucoseCalculator';
import { printReport, exportToCSV } from '@/lib/exportUtils';
import { useToast } from '@/hooks/use-toast';
import { Calendar, CalendarDays, Trash2, Printer, Download, FileText } from 'lucide-react';

type FilterType = 'all' | 'week' | 'today';

const Historico = () => {
  const { toast } = useToast();
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [filter, setFilter] = useState<FilterType>('week');

  const loadReadings = () => {
    let data: GlucoseReading[];
    
    switch (filter) {
      case 'today':
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        data = getReadings().filter(r => {
          const readingDate = new Date(r.timestamp);
          readingDate.setHours(0, 0, 0, 0);
          return readingDate.getTime() === today.getTime();
        });
        break;
      case 'week':
        data = getWeekReadings();
        break;
      default:
        data = getReadings();
    }
    
    setReadings(data);
  };

  useEffect(() => {
    loadReadings();
  }, [filter]);

  const handleDelete = (id: string) => {
    deleteReading(id);
    loadReadings();
    toast({
      title: "Medição excluída",
      description: "O registro foi removido do histórico.",
    });
  };

  const filterLabels: Record<FilterType, string> = {
    today: 'Hoje',
    week: 'Última Semana',
    all: 'Todas'
  };

  const handlePrint = () => {
    const patientInfo = getPatientInfo();
    printReport(readings, patientInfo?.name);
  };

  const handleExportCSV = () => {
    const patientInfo = getPatientInfo();
    exportToCSV(readings, patientInfo?.name);
    toast({
      title: 'Exportado com sucesso!',
      description: 'O arquivo CSV foi baixado.',
    });
  };

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
      </main>
    </div>
  );
};

export default Historico;
