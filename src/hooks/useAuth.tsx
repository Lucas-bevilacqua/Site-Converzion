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
      // Tentar fazer login primeiro
      console.log('Tentando fazer login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

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
            toast({
              title: "Erro no Cadastro",
              description: signUpError.message,
              variant: "destructive",
            });
            return false;
          }

          if (signUpData.user) {
            console.log('Conta criada com sucesso:', signUpData);
            toast({
              title: "Conta Criada",
              description: "Sua conta foi criada com sucesso! Por favor, verifique seu email para confirmar o cadastro.",
            });
            return true;
          }
        } else {
          console.error('Erro não relacionado a credenciais:', signInError);
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
          description: "Login realizado com sucesso!",
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