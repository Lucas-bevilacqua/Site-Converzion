import { supabase } from "@/integrations/supabase/client";
import type { EmpresaData } from "./types";

export const removeExistingEmpresa = async (email: string) => {
  console.log('🗑️ Tentando remover empresa existente');
  const { error } = await supabase
    .from('Empresas')
    .delete()
    .eq('emailempresa', email);

  if (error) {
    console.log('⚠️ Erro ao tentar remover empresa ou empresa não existia:', error);
  } else {
    console.log('✅ Empresa removida com sucesso ou não existia');
  }
  
  return { error };
};

export const createEmpresa = async (empresaData: EmpresaData) => {
  console.log('📝 Criando registro da empresa');
  const { error } = await supabase
    .from('Empresas')
    .insert([empresaData]);

  if (error) {
    console.error('❌ Erro ao criar empresa:', error);
  }
  
  return { error };
};