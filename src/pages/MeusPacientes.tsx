import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePatientConnections } from '@/hooks/usePatientConnections';
import { supabase } from '@/integrations/supabase/client';
import { GlucoseReading, getStatusLabel, formatDate } from '@/lib/glucoseCalculator';
import { Users, Activity, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientReadings {
  patientId: string;
  patientName: string;
  readings: GlucoseReading[];
  lastReading?: GlucoseReading;
}

const MeusPacientes = () => {
  const navigate = useNavigate();
  const { connections } = usePatientConnections();
  const [patientsReadings, setPatientsReadings] = useState<PatientReadings[]>([]);
  const [loading, setLoading] = useState(true);

  const acceptedConnections = connections.filter(c => c.status === 'accepted');

  useEffect(() => {
    const fetchPatientsReadings = async () => {
      if (acceptedConnections.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const patientIds = acceptedConnections.map(c => c.patient_id);
        
        const { data, error } = await supabase
          .from('glucose_readings')
          .select('*')
          .in('user_id', patientIds)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Group readings by patient
        const groupedReadings: Record<string, GlucoseReading[]> = {};
        
        data?.forEach((reading) => {
          const glucoseReading: GlucoseReading = {
            id: reading.id,
            value: reading.value,
            timestamp: new Date(reading.created_at),
            recommendation: reading.recommendation || '',
            status: reading.status as any,
            insulinUnits: reading.insulin_units || undefined,
          };

          if (!groupedReadings[reading.user_id]) {
            groupedReadings[reading.user_id] = [];
          }
          groupedReadings[reading.user_id].push(glucoseReading);
        });

        // Create patient readings array
        const patientsData: PatientReadings[] = acceptedConnections.map(conn => {
          const readings = groupedReadings[conn.patient_id] || [];
          return {
            patientId: conn.patient_id,
            patientName: conn.patient_profile?.name || 'Paciente',
            readings,
            lastReading: readings[0],
          };
        });

        setPatientsReadings(patientsData);
      } catch (error) {
        console.error('Error fetching patients readings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientsReadings();
  }, [acceptedConnections]);

  const calculateTrend = (readings: GlucoseReading[]): 'up' | 'down' | 'stable' => {
    if (readings.length < 2) return 'stable';
    
    const recent = readings.slice(0, 3);
    const avgRecent = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;
    
    const older = readings.slice(3, 6);
    if (older.length === 0) return 'stable';
    
    const avgOlder = older.reduce((sum, r) => sum + r.value, 0) / older.length;
    
    const diff = avgRecent - avgOlder;
    if (Math.abs(diff) < 15) return 'stable';
    return diff > 0 ? 'up' : 'down';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
          <p className="text-center text-muted-foreground">Carregando...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24 max-w-4xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-heading text-foreground mb-1">
            Meus Pacientes
          </h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe a glicemia dos seus pacientes
          </p>
        </div>

        {patientsReadings.length === 0 ? (
          <Card className="p-8 text-center animate-fade-in">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground mb-4">
              Você ainda não tem pacientes conectados
            </p>
            <Button onClick={() => navigate('/conexoes')}>
              Gerenciar Conexões
            </Button>
          </Card>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {patientsReadings.map((patient) => {
              const trend = calculateTrend(patient.readings);
              const recentReadings = patient.readings.slice(0, 5);
              const avgGlucose = patient.readings.length > 0
                ? Math.round(patient.readings.reduce((sum, r) => sum + r.value, 0) / patient.readings.length)
                : 0;

              return (
                <Card key={patient.patientId} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                        {patient.patientName}
                        {trend === 'up' && <TrendingUp className="w-5 h-5 text-danger" />}
                        {trend === 'down' && <TrendingDown className="w-5 h-5 text-success" />}
                        {trend === 'stable' && <Minus className="w-5 h-5 text-muted-foreground" />}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {patient.readings.length} medições registradas
                      </p>
                    </div>
                    {patient.lastReading && (
                      <div className="text-right">
                        <div className="text-3xl font-bold text-primary">
                          {patient.lastReading.value}
                        </div>
                        <p className="text-xs text-muted-foreground">mg/dL</p>
                        <Badge 
                          variant={patient.lastReading.status === 'normal' ? 'default' : 'destructive'}
                          className="mt-1"
                        >
                          {getStatusLabel(patient.lastReading.status)}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {patient.lastReading && (
                    <div className="bg-accent p-3 rounded-lg mb-4">
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" />
                        Última medição: {formatDate(patient.lastReading.timestamp)}
                      </p>
                      <p className="text-sm">
                        <strong>Recomendação:</strong> {patient.lastReading.recommendation}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Média</div>
                      <div className="text-xl font-bold text-primary">{avgGlucose}</div>
                    </div>
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Mínima</div>
                      <div className="text-xl font-bold text-success">
                        {patient.readings.length > 0 ? Math.min(...patient.readings.map(r => r.value)) : 0}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-accent rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Máxima</div>
                      <div className="text-xl font-bold text-danger">
                        {patient.readings.length > 0 ? Math.max(...patient.readings.map(r => r.value)) : 0}
                      </div>
                    </div>
                  </div>

                  {recentReadings.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <Activity className="w-4 h-4" />
                        Últimas Medições
                      </h3>
                      <div className="space-y-2">
                        {recentReadings.map((reading) => (
                          <div key={reading.id} className="flex items-center justify-between text-sm p-2 bg-accent rounded">
                            <span className="text-muted-foreground">
                              {formatDate(reading.timestamp)}
                            </span>
                            <span className="font-semibold">{reading.value} mg/dL</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MeusPacientes;
