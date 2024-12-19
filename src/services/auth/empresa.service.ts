import { supabase } from "@/integrations/supabase/client";
import type { EmpresaData } from "./types";

export const recreateEmpresa = async (email: string, senha: string) => {
  console.log('🔄 Verificando se precisa recriar empresa');
  
  // Verifica se o usuário existe no auth mas não tem empresa
  const { data: authUser } = await supabase.auth.getUser();
  
  if (!authUser?.user) {
    console.log('👤 Usuário não está autenticado, pulando recriação');
    return;
  }

  // Verifica se já existe empresa para este email
  const { data: existingEmpresa, error: checkError } = await supabase
    .from('Empresas')
    .select()
    .eq('emailempresa', email)
    .maybeSingle();

  if (checkError) {
    console.error('❌ Erro ao verificar empresa:', checkError);
    return;
  }

  if (existingEmpresa) {
    console.log('✅ Empresa já existe, não precisa recriar');
    return;
  }

  // Se não existe empresa mas existe usuário, recria
  console.log('🔄 Recriando empresa perdida');
  const { error } = await supabase
    .from('Empresas')
    .insert([{
      id: Date.now(),
      emailempresa: email,
      senha: senha,
      NomeEmpresa: 'Empresa Recuperada'
    }]);

  if (error) {
    console.error('❌ Erro ao recriar empresa:', error);
  } else {
    console.log('✅ Empresa recriada com sucesso');
  }
};

export const createEmpresa = async (empresaData: EmpresaData) => {
  console.log('📝 Verificando/criando registro da empresa');
  
  // Primeiro verifica se a empresa já existe
  const { data: existingEmpresa, error: checkError } = await supabase
    .from('Empresas')
    .select()
    .eq('emailempresa', empresaData.emailempresa)
    .maybeSingle();

  if (checkError) {
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