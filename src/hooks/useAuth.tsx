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
        console.log('Usuário não encontrado, tentando criar...');
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
            description: "Não foi possível criar sua conta. Verifique suas credenciais.",
            variant: "destructive",
          });
          return false;
        }

        console.log('Usuário criado com sucesso:', signUpData);
        if (!signUpData.user?.email_confirmed_at) {
          toast({
            title: "Confirme seu Email",
            description: "Enviamos um link de confirmação para seu email. Por favor verifique sua caixa de entrada e spam.",
          });
          return false;
        }
      }

      // Try to sign in
      console.log('Tentando fazer login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        console.error('Erro no login:', signInError);
        
        if (signInError.message.includes('Email not confirmed')) {
          toast({
            title: "Email não Confirmado",
            description: "Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada e spam.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Erro no Login",
            description: "Credenciais inválidas. Verifique seu email e senha.",
            variant: "destructive",
          });
        }
        return false;
      }

      if (signInData.user) {
        console.log('Login realizado com sucesso');
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
        description: "Ocorreu um erro inesperado. Tente novamente.",
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