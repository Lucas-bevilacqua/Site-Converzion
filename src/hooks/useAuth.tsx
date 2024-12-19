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
      // First check if user exists
      const { data: { user: existingUser }, error: getUserError } = await supabase.auth.getUser();
      console.log('Verificando usuário existente:', existingUser);

      if (!existingUser) {
        console.log('Usuário não encontrado, tentando criar conta...');
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
            title: "Verifique seu Email",
            description: "Um email de confirmação foi enviado para " + email + ". Por favor, verifique também sua pasta de spam.",
          });

          // Try to resend confirmation email after a short delay
          setTimeout(async () => {
            const { error: resendError } = await supabase.auth.resend({
              type: 'signup',
              email: email,
            });
            if (resendError) {
              console.error('Erro ao reenviar email:', resendError);
            } else {
              console.log('Email de confirmação reenviado');
            }
          }, 2000);

          return false;
        }
      } else {
        // User exists, try to sign in
        console.log('Usuário existe, tentando fazer login...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (signInError) {
          console.error('Erro ao fazer login:', signInError);
          if (signInError.message.includes('Email not confirmed')) {
            toast({
              title: "Email não Confirmado",
              description: "Por favor confirme seu email antes de fazer login. Verifique sua caixa de entrada e spam.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Erro no Login",
              description: "Credenciais inválidas. Por favor, verifique seu email e senha.",
              variant: "destructive",
            });
          }
          return false;
        }

        if (signInData.user) {
          console.log('Login realizado com sucesso:', signInData);
          toast({
            title: "Sucesso",
            description: "Login realizado com sucesso",
          });
          return true;
        }
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