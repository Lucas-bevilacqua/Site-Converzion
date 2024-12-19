import { supabase } from "@/integrations/supabase/client";
import type { EvolutionCredentials } from "./auth/types";

export const getEvolutionCredentials = async (email: string): Promise<EvolutionCredentials | null> => {
  console.log('🔍 Buscando credenciais do Evolution para:', email);
  
  const { data: empresa, error } = await supabase
    .from('Empresas')
    .select('url_instance, instance_name, apikeyevo')
    .eq('emailempresa', email)
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao buscar credenciais:', error);
    return null;
  }

  if (!empresa?.url_instance || !empresa?.apikeyevo || !empresa?.instance_name) {
    console.log('⚠️ Credenciais incompletas ou não encontradas');
    return null;
  }

  console.log('✅ Credenciais encontradas');
  return {
    url_instance: empresa.url_instance,
    instance_name: empresa.instance_name,
    apikeyevo: empresa.apikeyevo
  };
};

export const validateEvolutionCredentials = (credentials: EvolutionCredentials | null): boolean => {
  if (!credentials) return false;
  
  const { url_instance, instance_name, apikeyevo } = credentials;
  return Boolean(url_instance && instance_name && apikeyevo);
};