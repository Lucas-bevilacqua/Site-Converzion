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
      // Primeiro, tentar fazer login
      console.log('Tentando fazer login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      // Se o login for bem-sucedido
      if (signInData?.user) {
        console.log('Login realizado com sucesso:', signInData);
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso!",
        });
        return true;
      }

      // Se houver erro no login
      if (signInError) {
        console.log('Erro no login:', signInError);
        
        // Se o erro for de credenciais inválidas, tentar criar conta
        if (signInError.message.includes('Invalid login credentials')) {
          console.log('Credenciais inválidas, tentando criar conta...');
          
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
              data: { empresa_id },
              emailRedirectTo: 'https://preview--engage-convert-ai.lovable.app/login'
            }
          });

          if (signUpError) {
            console.error('Erro ao criar conta:', signUpError);
            let errorMessage = signUpError.message;
            
            // Tratamento específico para erros comuns
            if (errorMessage.includes('Password should be at least 6 characters')) {
              errorMessage = "A senha deve ter pelo menos 6 caracteres.";
            } else if (errorMessage.includes('User already registered')) {
              errorMessage = "Este email já está registrado. Por favor, tente fazer login.";
            }
            
            toast({
              title: "Erro no Cadastro",
              description: errorMessage,
              variant: "destructive",
            });
            return false;
          }

          if (signUpData?.user) {
            console.log('Conta criada com sucesso:', signUpData);
            toast({
              title: "Conta Criada",
              description: "Sua conta foi criada com sucesso! Por favor, verifique seu email para confirmar o cadastro.",
            });
            return true;
          }
        } else {
          // Outros erros de login
          console.error('Erro não relacionado a credenciais:', signInError);
          let errorMessage = signInError.message;
          
          // Tratamento específico para erros comuns
          if (errorMessage.includes('Email not confirmed')) {
            errorMessage = "Por favor, confirme seu email antes de fazer login.";
          }
          
          toast({
            title: "Erro no Login",
            description: errorMessage,
            variant: "destructive",
          });
          return false;
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