import { supabase } from "@/integrations/supabase/client";
import type { EmpresaData } from "./types";

export const createEmpresa = async (empresaData: EmpresaData) => {
  console.log('📝 Verificando/criando registro da empresa');
  
  // Primeiro verifica se a empresa já existe
  const { data: existingEmpresa, error: checkError } = await supabase
    .from('Empresas')
    .select()
    .eq('emailempresa', empresaData.emailempresa)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('❌ Erro ao verificar empresa:', checkError);
    return { error: checkError };
  }

  // Se a empresa já existe, retorna sem erro
  if (existingEmpresa) {
    console.log('✅ Empresa já existe, mantendo registro');
    return { error: null };
  }

  // Se não existe, cria uma nova empresa
  console.log('📝 Criando nova empresa');
  const { error } = await supabase
    .from('Empresas')
    .insert([empresaData]);

  if (error) {
    console.error('❌ Erro ao criar empresa:', error);
  }
  
  return { error };
};