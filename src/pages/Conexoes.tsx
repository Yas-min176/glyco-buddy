import { useState } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePatientConnections } from '@/hooks/usePatientConnections';
import { useToast } from '@/hooks/use-toast';
import { UserPlus, Users, Check, X, Trash2, Mail, Calendar } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Conexoes = () => {
  const { toast } = useToast();
  const { connections, loading, sendConnectionRequest, acceptConnection, rejectConnection, removeConnection } = usePatientConnections();
  const [caregiverEmail, setCaregiverEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null);

  const handleSendRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!caregiverEmail) {
      toast({
        title: 'Email obrigatório',
        description: 'Digite o email do cuidador ou médico.',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    const { error } = await sendConnectionRequest(caregiverEmail);
    setSending(false);

    if (error) {
      toast({
        title: 'Erro ao enviar convite',
        description: error,
        variant: 'destructive',
      });
    } else {
      setCaregiverEmail('');
    }
  };

  const pendingConnections = connections.filter(c => c.status === 'pending');
  const acceptedConnections = connections.filter(c => c.status === 'accepted');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-6 pb-24 max-w-2xl">
        <div className="mb-6 animate-fade-in">
          <h1 className="text-heading text-foreground mb-1">
            Conexões
          </h1>
          <p className="text-muted-foreground text-lg">
            Conecte-se com cuidadores e médicos
          </p>
        </div>

        {/* Send Connection Request */}
        <Card className="p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Adicionar Cuidador ou Médico
          </h2>
          
          <form onSubmit={handleSendRequest} className="space-y-4">
            <div>
              <Label htmlFor="caregiverEmail" className="text-base font-semibold">
                Email do Cuidador/Médico
              </Label>
              <Input
                id="caregiverEmail"
                type="email"
                value={caregiverEmail}
                onChange={(e) => setCaregiverEmail(e.target.value)}
                placeholder="medico@email.com"
                className="mt-2 h-14 text-lg"
              />
              <p className="text-sm text-muted-foreground mt-2">
                O cuidador ou médico receberá um convite para acompanhar suas medições
              </p>
            </div>

            <Button type="submit" size="lg" className="w-full gap-2" disabled={sending}>
              <Mail className="w-5 h-5" />
              {sending ? 'Enviando...' : 'Enviar Convite'}
            </Button>
          </form>
        </Card>

        {/* Pending Connections */}
        {pendingConnections.length > 0 && (
          <div className="mb-6 animate-fade-in">
            <h2 className="text-lg font-bold text-foreground mb-3">
              Convites Pendentes ({pendingConnections.length})
            </h2>
            <div className="space-y-3">
              {pendingConnections.map((connection) => (
                <Card key={connection.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">
                          {connection.caregiver_profile?.name || 'Usuário'}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {connection.caregiver_profile?.user_type === 'doctor' ? 'Médico' : 'Cuidador'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        Enviado em {new Date(connection.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => acceptConnection(connection.id)}
                        className="text-success hover:text-success"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => rejectConnection(connection.id)}
                        className="text-danger hover:text-danger"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Accepted Connections */}
        <div className="animate-fade-in">
          <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Conexões Ativas ({acceptedConnections.length})
          </h2>
          
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Carregando...</p>
          ) : acceptedConnections.length === 0 ? (
            <Card className="p-8 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Você ainda não tem conexões ativas
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {acceptedConnections.map((connection) => (
                <Card key={connection.id} className="p-4 border-success/30 bg-success/5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-foreground">
                          {connection.caregiver_profile?.name || 'Usuário'}
                        </span>
                        <Badge variant="default" className="text-xs bg-success">
                          {connection.caregiver_profile?.user_type === 'doctor' ? 'Médico' : 'Cuidador'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Pode visualizar suas medições em tempo real
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setRemoveConfirm(connection.id)}
                      className="text-danger hover:text-danger"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Remove Confirmation Dialog */}
        <AlertDialog open={!!removeConfirm} onOpenChange={() => setRemoveConfirm(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remover conexão?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta pessoa não poderá mais visualizar suas medições. Você pode enviar um novo convite depois.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  if (removeConfirm) removeConnection(removeConfirm);
                  setRemoveConfirm(null);
                }}
                className="bg-danger hover:bg-danger/90"
              >
                Remover
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Conexoes;
