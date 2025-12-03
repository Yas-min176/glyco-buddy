import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

/**
 * Garante que o profile do usuário existe no banco de dados.
 * Se não existir, cria um profile básico.
 */
export async function ensureUserProfile(user: User | null): Promise<boolean> {
  if (!user) return false;

  try {
    // Verifica se o profile já existe
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Se já existe, retorna sucesso
    if (existingProfile) {
      return true;
    }

    // Se não existe, cria um novo profile
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id,
        name: user.email?.split('@')[0] || 'Usuário',
        user_type: 'patient',
        dosage_calculation_type: 'rules',
      });

    if (insertError) {
      console.error('Error creating profile:', insertError);
      return false;
    }

    console.log('✅ Profile criado com sucesso para:', user.email);
    return true;
  } catch (error) {
    console.error('Error ensuring profile:', error);
    return false;
  }
}
