import { supabase } from "@/integrations/supabase/client";
import type { AuthResponse } from "./types";

export const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('🔐 Tentando login');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('❌ Erro ao fazer login:', error);
    if (error.message.includes('Invalid login credentials')) {
      return { success: false, error: 'Credenciais inválidas' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
};

export const signUpUser = async (email: string, password: string, empresa_id: number): Promise<AuthResponse> => {
  console.log('📝 Tentando criar nova conta');
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        empresa_id,
      }
    }
  });

  if (error) {
    console.error('❌ Erro ao criar conta:', error);
    if (error.message.includes('User already registered')) {
      return { success: false, error: 'Email já cadastrado. Por favor, faça login.' };
    }
    return { success: false, error: error.message };
  }

  return { success: true };
};