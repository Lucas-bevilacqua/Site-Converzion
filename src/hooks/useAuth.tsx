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
      // Tentar login primeiro
      console.log('Tentando fazer login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        console.log('Login falhou, erro:', signInError);
        console.log('Tentando criar novo usuário...');
        
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
        console.log('Enviando email de confirmação...');
        
        // Tentar enviar email de confirmação novamente
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (resendError) {
          console.error('Erro ao reenviar email:', resendError);
          toast({
            title: "Atenção",
            description: "Conta criada, mas houve um problema ao enviar o email. Verifique se o email está correto.",
            variant: "destructive",
          });
        } else {
          console.log('Email de confirmação enviado com sucesso');
          toast({
            title: "Cadastro Realizado",
            description: "Você receberá um email de confirmação do no-reply@mail.app.supabase.io. Por favor, verifique também sua pasta de spam.",
          });
        }
        return false;
      }

      if (!signInData.user?.email_confirmed_at) {
        console.log('Email não confirmado, tentando reenviar...');
        
        const { error: resendError } = await supabase.auth.resend({
          type: 'signup',
          email,
          options: {
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (resendError) {
          console.error('Erro ao reenviar email:', resendError);
        } else {
          console.log('Email de confirmação reenviado com sucesso');
        }

        toast({
          title: "Email Não Confirmado",
          description: "Um novo email de confirmação foi enviado para " + email + ". Por favor, verifique também sua pasta de spam.",
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