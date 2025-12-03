import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { ensureUserProfile } from '@/lib/ensureProfile';

export interface PatientConnection {
  id: string;
  patient_id: string;
  caregiver_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  patient_profile?: {
    name: string;
    birth_date: string | null;
  };
  caregiver_profile?: {
    name: string;
    user_type: string;
  };
}

export function usePatientConnections() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [connections, setConnections] = useState<PatientConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConnections = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    try {
      // Garante que o profile existe
      const profileExists = await ensureUserProfile(user);
      if (!profileExists) {
        console.error('Não foi possível garantir o profile do usuário');
        setLoading(false);
        return;
      }

      // Get user profile to determine type
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      if (!profile) {
        setLoading(false);
        return;
      }

      let query = supabase.from('patient_connections').select('*');

      if (profile.user_type === 'patient') {
        query = query.eq('patient_id', user.id);
      } else {
        query = query.eq('caregiver_id', user.id);
      }

      const { data, error } = await query;
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching connections:', error);
      }
      
      // Fetch profiles separately for each connection
      const connectionsWithProfiles: PatientConnection[] = [];
      if (data) {
        for (const conn of data) {
          const { data: patientProfile } = await supabase
            .from('profiles')
            .select('name, birth_date')
            .eq('user_id', conn.patient_id)
            .single();
          
          const { data: caregiverProfile } = await supabase
            .from('profiles')
            .select('name, user_type')
            .eq('user_id', conn.caregiver_id)
            .single();
          
          connectionsWithProfiles.push({
            ...conn,
            status: conn.status as 'pending' | 'accepted' | 'rejected',
            patient_profile: patientProfile || undefined,
            caregiver_profile: caregiverProfile || undefined,
          });
        }
      }
      
      setConnections(connectionsWithProfiles);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, [user]);

  const sendConnectionRequest = async (caregiverEmail: string) => {
    if (!user) return { error: 'Not authenticated' };

    try {
      // Note: Cannot search users by email directly from client
      // This would require an edge function or different approach
      toast({
        title: 'Funcionalidade em desenvolvimento',
        description: 'A busca por email requer configuração adicional do servidor.',
        variant: 'destructive',
      });
      return { error: 'Funcionalidade em desenvolvimento' };
    } catch (error) {
      console.error('Error sending connection request:', error);
      return { error: 'Erro ao enviar convite' };
    }
  };

  const acceptConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('patient_connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) throw error;

      await fetchConnections();
      toast({
        title: 'Conexão aceita!',
        description: 'Você agora pode acompanhar este paciente.',
      });
    } catch (error) {
      console.error('Error accepting connection:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível aceitar a conexão.',
        variant: 'destructive',
      });
    }
  };

  const rejectConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('patient_connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) throw error;

      await fetchConnections();
      toast({
        title: 'Conexão recusada',
        description: 'A solicitação foi rejeitada.',
      });
    } catch (error) {
      console.error('Error rejecting connection:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível recusar a conexão.',
        variant: 'destructive',
      });
    }
  };

  const removeConnection = async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('patient_connections')
        .delete()
        .eq('id', connectionId);

      if (error) throw error;

      await fetchConnections();
      toast({
        title: 'Conexão removida',
        description: 'A conexão foi excluída.',
      });
    } catch (error) {
      console.error('Error removing connection:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a conexão.',
        variant: 'destructive',
      });
    }
  };

  return {
    connections,
    loading,
    sendConnectionRequest,
    acceptConnection,
    rejectConnection,
    removeConnection,
    refetch: fetchConnections,
  };
}
