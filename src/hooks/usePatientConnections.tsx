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

      let query = supabase.from('patient_connections').select(`
        *,
        patient_profile:profiles!patient_connections_patient_id_fkey(name, birth_date),
        caregiver_profile:profiles!patient_connections_caregiver_id_fkey(name, user_type)
      `);

      if (profile.user_type === 'patient') {
        query = query.eq('patient_id', user.id);
      } else {
        query = query.eq('caregiver_id', user.id);
      }

      const { data, error } = await query;
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching connections:', error);
      }
      
      setConnections(data || []);
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
      // Find caregiver by email
      const { data: caregiverProfile, error: searchError } = await supabase
        .from('profiles')
        .select('user_id, name, user_type')
        .eq('user_id', supabase.auth.getUser().then(res => res.data.user?.email === caregiverEmail ? res.data.user.id : null))
        .single();

      if (searchError) {
        // Try alternative approach - search via auth
        const { data: users } = await supabase.auth.admin.listUsers();
        const caregiver = users?.users.find(u => u.email === caregiverEmail);
        
        if (!caregiver) {
          return { error: 'Usuário não encontrado' };
        }

        // Check if caregiver or doctor
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('user_id', caregiver.id)
          .single();

        if (profile?.user_type === 'patient') {
          return { error: 'Este usuário é um paciente, não um cuidador ou médico' };
        }

        const { error: insertError } = await supabase
          .from('patient_connections')
          .insert({
            patient_id: user.id,
            caregiver_id: caregiver.id,
            status: 'pending',
          });

        if (insertError) {
          if (insertError.message.includes('duplicate')) {
            return { error: 'Conexão já existe' };
          }
          throw insertError;
        }

        await fetchConnections();
        toast({
          title: 'Convite enviado!',
          description: 'O cuidador/médico receberá sua solicitação.',
        });
        return { error: null };
      }

      return { error: 'Método não implementado completamente' };
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
