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
      // Primeiro tenta fazer login
      console.log('Tentando fazer login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        console.log('Erro no login:', signInError);
        
        // Se o erro for de credenciais inválidas, verifica se o usuário existe
        if (signInError.message?.includes('Invalid login credentials')) {
          console.log('Credenciais inválidas, verificando se usuário existe...');
          const { data: userExists } = await supabase
            .from('auth.users')
            .select('email')
            .eq('email', email)
            .single();

          if (userExists) {
            toast({
              title: "Erro no Login",
              description: "Senha incorreta. Por favor, tente novamente.",
              variant: "destructive",
            });
            return false;
          }

          // Se o usuário não existe, tenta criar uma nova conta
          console.log('Usuário não existe, tentando criar conta...');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
              data: { empresa_id },
              emailRedirectTo: window.location.origin + '/login'
            }
          });

          if (signUpError) {
            if (signUpError.message?.includes('User already registered')) {
              toast({
                title: "Usuário Existente",
                description: "Este email já está registrado. Por favor, tente fazer login.",
                variant: "destructive",
              });
            } else {
              console.error('Erro ao criar conta:', signUpError);
              toast({
                title: "Erro no Cadastro",
                description: signUpError.message,
                variant: "destructive",
              });
            }
            return false;
          }

          if (signUpData?.user) {
            console.log('Conta criada com sucesso:', signUpData);
            toast({
              title: "Conta Criada",
              description: "Sua conta foi criada com sucesso! Você será redirecionado para o dashboard.",
            });
            return true;
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
        console.log('Login bem-sucedido:', signInData);
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