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
      // Tentar enviar email de confirmação primeiro
      console.log('Tentando enviar email de confirmação...');
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      });

      if (resendError) {
        console.log('Erro ao reenviar, tentando criar novo usuário...');
        // Tentar criar novo usuário
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

        console.log('Usuário criado com sucesso:', signUpData);
        toast({
          title: "Cadastro Realizado",
          description: "Aguarde alguns minutos e tente fazer login novamente. O email será enviado do endereço no-reply@mail.app.supabase.io",
        });
        return false;
      }

      // Se chegou aqui, vamos tentar fazer login
      console.log('Tentando fazer login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        console.log('Login falhou, erro:', signInError);
        toast({
          title: "Erro no Login",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      if (!signInData.user?.email_confirmed_at) {
        console.log('Email não confirmado');
        toast({
          title: "Email Não Confirmado",
          description: "Por favor aguarde alguns minutos e tente novamente. O email será enviado do endereço no-reply@mail.app.supabase.io",
          variant: "destructive",
        });
        return false;
      }

      console.log('Login realizado com sucesso');
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso",
      });
      return true;
    } catch (error) {
      console.error('Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
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