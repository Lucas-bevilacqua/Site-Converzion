import { supabase } from "@/integrations/supabase/client";
import type { AuthResponse } from "./types";

export const signInUser = async (email: string, password: string): Promise<AuthResponse> => {
  console.log('🔐 Tentando login');
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('❌ Erro ao fazer login:', error);
      
      // Check if user doesn't exist
      if (error.message.includes('Invalid login credentials')) {
        console.log('👤 Usuário não encontrado, tentando criar conta');
        return { success: false, error: 'user_not_found' };
      }
      
      return { success: false, error: error.message };
    }

    console.log('✅ Login bem-sucedido');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro inesperado ao fazer login:', error);
    return { success: false, error: 'Erro inesperado ao fazer login' };
  }
};

export const signUpUser = async (email: string, password: string, empresa_id: number): Promise<AuthResponse> => {
  console.log('📝 Tentando criar nova conta');
  
  try {
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

    console.log('✅ Conta criada com sucesso');
    return { success: true };
  } catch (error) {
    console.error('❌ Erro inesperado ao criar conta:', error);
    return { success: false, error: 'Erro inesperado ao criar conta' };
  }
};