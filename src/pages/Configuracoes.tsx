import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDosageRules } from '@/hooks/useDosageRules';
import { InsulinCalculationConfig } from '@/components/InsulinCalculationConfig';
import { User, UserPlus, Save, Heart, Info, Calculator } from 'lucide-react';

interface PatientFormData {
  name: string;
  birthDate: string;
}

const Configuracoes = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { rules, loading, updateRule, addRule, deleteRule } = useDosageRules();
  const [formData, setFormData] = useState<PatientFormData>({
    name: '',
    birthDate: '',
  });
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoadingProfile(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('name, birth_date')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
        } else if (data) {
          setFormData({
            name: data.name || '',
            birthDate: data.birth_date || '',
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para salvar.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          birth_date: formData.birthDate || null,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Configurações salvas!",
        description: "Suas informações foram atualizadas.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar as configurações.',
        variant: 'destructive',
      });
    }
  };

  const handleChange = (field: keyof PatientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-4xl">
          <p className="text-center text-muted-foreground">
            Faça login para acessar as configurações.
          </p>
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
            Configurações
          </h1>
          <p className="text-muted-foreground text-lg">
            Personalize o aplicativo
          </p>
        </div>

        {loadingProfile ? (
          <div className="text-center py-8 text-muted-foreground">Carregando...</div>
        ) : (
        <Tabs defaultValue="personal" className="animate-fade-in">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="personal" className="gap-2">
              <User className="w-4 h-4" />
              Pessoais
            </TabsTrigger>
            <TabsTrigger value="calculation" className="gap-2">
              <Calculator className="w-4 h-4" />
              Cálculo de Insulina
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Info */}
          <div className="card-elevated p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Dados do Paciente
            </h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base font-semibold">
                  Nome
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Digite o nome do paciente"
                  className="mt-2 h-14 text-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="birthDate" className="text-base font-semibold">
                  Data de Nascimento
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleChange('birthDate', e.target.value)}
                  className="mt-2 h-14 text-lg"
                />
              </div>
            </div>
          </div>

          {/* Caregiver Info */}
          <div className="card-elevated p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-primary" />
              Responsável / Cuidador
            </h2>
            
            <div className="mt-4 p-4 bg-accent rounded-xl">
              <p className="text-sm text-accent-foreground flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  Para que o cuidador receba as medições em tempo real, 
                  será necessário conectar ao sistema na nuvem. 
                  Fale com o desenvolvedor para ativar essa funcionalidade.
                </span>
              </p>
            </div>
          </div>

          {/* Info Card */}
          <div className="card-elevated p-6 bg-primary/5 border-primary/20">
            <h2 className="text-xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Heart className="w-5 h-5 text-danger" />
              Sobre o GlicoGuia
            </h2>
            <p className="text-muted-foreground">
              Este aplicativo foi desenvolvido para ajudar pacientes diabéticos, 
              especialmente crianças e idosos, a calcular a dose correta de insulina 
              baseado na medição de glicemia.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
              <strong>Importante:</strong> Este app é apenas um guia. 
              Sempre consulte seu médico para ajustes no tratamento.
            </p>
          </div>

          <Button type="submit" size="lg" className="w-full gap-2">
            <Save className="w-5 h-5" />
            Salvar Configurações
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="calculation">
        <div className="card-elevated p-6">
          <InsulinCalculationConfig 
            rules={rules}
            loadingRules={loading}
            onUpdateRule={updateRule}
            onAddRule={addRule}
            onDeleteRule={deleteRule}
          />
        </div>
      </TabsContent>
    </Tabs>
        )}
      </main>
    </div>
  );
};

export default Configuracoes;
