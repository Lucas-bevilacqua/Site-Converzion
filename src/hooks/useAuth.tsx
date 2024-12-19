import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (email: string, senha: string, empresa_id: number) => {
    setLoading(true);
    console.log('Iniciando processo de autenticação para:', email);

    try {
      // First check if user exists
      const { data, error: getUserError } = await supabase.auth.admin.listUsers();
      
      if (getUserError) {
        console.error('Erro ao buscar usuários:', getUserError);
        toast({
          title: "Erro",
          description: "Erro ao verificar usuário. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      const users = data?.users as User[] || [];
      const existingUser = users.find(user => user.email === email);
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
          
          // Immediately try to resend confirmation email
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
            title: "Verifique seu Email",
            description: "Um email de confirmação foi enviado para " + email + ". Por favor, verifique também sua pasta de spam.",
          });
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
            // Try to resend confirmation email
            const { error: resendError } = await supabase.auth.resend({
              type: 'signup',
              email: email,
            });

            if (resendError) {
              console.error('Erro ao reenviar email de confirmação:', resendError);
            } else {
              console.log('Email de confirmação reenviado');
            }

            toast({
              title: "Email não Confirmado",
              description: "Por favor confirme seu email antes de fazer login. Um novo email de confirmação foi enviado. Verifique sua caixa de entrada e spam.",
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