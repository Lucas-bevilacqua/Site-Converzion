import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (email: string, senha: string, empresa_id: number) => {
    setLoading(true);
    console.log('Iniciando processo de autenticação para:', email);

    try {
      // Try to sign in first
      console.log('Tentando fazer login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        console.error('Erro ao fazer login:', signInError);
        
        // If error is about invalid credentials, try to sign up
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('Credenciais inválidas, tentando criar conta...');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
              data: { empresa_id },
              emailRedirectTo: `${window.location.origin}/login`
            }
          });

          if (signUpError) {
            console.error('Erro ao criar usuário:', signUpError);
            toast({
              title: "Erro no Cadastro",
              description: "Não foi possível criar sua conta. Por favor, tente novamente.",
              variant: "destructive",
            });
            return false;
          }

          if (signUpData.user) {
            console.log('Usuário criado com sucesso:', signUpData);
            toast({
              title: "Conta Criada",
              description: "Sua conta foi criada com sucesso. Você já pode fazer login.",
            });
            
            // Try to sign in immediately after signup
            const { data: immediateSignIn, error: immediateSignInError } = await supabase.auth.signInWithPassword({
              email,
              password: senha,
            });

            if (immediateSignInError) {
              console.error('Erro ao fazer login após criar conta:', immediateSignInError);
              return false;
            }

            if (immediateSignIn.user) {
              console.log('Login realizado com sucesso após criar conta:', immediateSignIn);
              return true;
            }
          }
        } else {
          toast({
            title: "Erro no Login",
            description: signInError.message,
            variant: "destructive",
          });
          return false;
        }
      }

      if (signInData?.user) {
        console.log('Login realizado com sucesso:', signInData);
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso",
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Por favor, tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    handleEmailSignIn
  };
};