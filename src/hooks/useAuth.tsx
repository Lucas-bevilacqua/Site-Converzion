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
      // First try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        console.log('Erro no login, verificando se usuário existe:', signInError);
        
        if (signInError.message.includes('Email not confirmed')) {
          toast({
            title: "Email não confirmado",
            description: "Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada e spam.",
            variant: "destructive",
          });
          return false;
        }

        // If login fails, try to create a new account
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: { empresa_id },
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (signUpError) {
          console.error('Erro ao criar conta:', signUpError);
          toast({
            title: "Erro no Cadastro",
            description: signUpError.message,
            variant: "destructive",
          });
          return false;
        }

        if (signUpData.user) {
          console.log('Conta criada com sucesso:', signUpData);
          
          // Try to resend confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
          });

          if (resendError) {
            console.error('Erro ao enviar email de confirmação:', resendError);
          } else {
            console.log('Email de confirmação enviado');
          }

          toast({
            title: "Conta Criada",
            description: "Um email de confirmação foi enviado para " + email + ". Por favor, verifique também sua pasta de spam.",
          });
          return false;
        }
      }

      if (signInData.user) {
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