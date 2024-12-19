import { supabase } from "@/integrations/supabase/client";
import type { AuthResponse } from "./types";

export const signUpUser = async (email: string, password: string, empresa_id: number): Promise<AuthResponse> => {
  console.log('📝 Criando nova conta');
  
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
    return { success: false, error: error.message };
  }

  return { success: true };
};