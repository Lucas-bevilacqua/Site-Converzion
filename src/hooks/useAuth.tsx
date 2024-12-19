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
        console.log('Login falhou, tentando criar novo usuário...', signInError);
        
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
            title: "Erro no Login",
            description: "Verifique suas credenciais e tente novamente.",
            variant: "destructive",
          });
          return false;
        }

        console.log('Usuário criado com sucesso:', signUpData);
        toast({
          title: "Conta Criada",
          description: "Tente fazer login agora com suas credenciais.",
        });
        return false;
      }

      if (!signInData.user?.email_confirmed_at) {
        console.log('Email não confirmado, tentando login direto...');
        toast({
          title: "Tentando Login",
          description: "Aguarde enquanto verificamos suas credenciais...",
        });
        
        // Tentar login novamente após pequeno delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (retryError || !retryData.user) {
          console.error('Erro no segundo login:', retryError);
          toast({
            title: "Erro no Login",
            description: "Verifique suas credenciais e tente novamente.",
            variant: "destructive",
          });
          return false;
        }

        console.log('Login bem sucedido após retry:', retryData);
        toast({
          title: "Sucesso",
          description: "Login realizado com sucesso",
        });
        return true;
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