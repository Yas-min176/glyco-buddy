import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { savePatientInfo, getPatientInfo, PatientInfo } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';
import { User, UserPlus, Save, Heart, Info } from 'lucide-react';

const Configuracoes = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PatientInfo>({
    name: '',
    birthDate: '',
    caregiverName: '',
    caregiverContact: ''
  });

  useEffect(() => {
    const saved = getPatientInfo();
    if (saved) {
      setFormData(saved);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    savePatientInfo(formData);
    toast({
      title: "Configurações salvas!",
      description: "Suas informações foram atualizadas.",
    });
  };

  const handleChange = (field: keyof PatientInfo, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-heading text-foreground mb-1">
            Configurações
          </h1>
          <p className="text-muted-foreground text-lg">
            Personalize o aplicativo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
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
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="caregiverName" className="text-base font-semibold">
                  Nome do Responsável
                </Label>
                <Input
                  id="caregiverName"
                  value={formData.caregiverName}
                  onChange={(e) => handleChange('caregiverName', e.target.value)}
                  placeholder="Digite o nome"
                  className="mt-2 h-14 text-lg"
                />
              </div>
              
              <div>
                <Label htmlFor="caregiverContact" className="text-base font-semibold">
                  Contato (telefone ou email)
                </Label>
                <Input
                  id="caregiverContact"
                  value={formData.caregiverContact}
                  onChange={(e) => handleChange('caregiverContact', e.target.value)}
                  placeholder="Digite o contato"
                  className="mt-2 h-14 text-lg"
                />
              </div>
            </div>
            
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
      </main>
    </div>
  );
};

export default Configuracoes;
