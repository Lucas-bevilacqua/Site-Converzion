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
      // Primeiro, verificar se o usuário já existe
      const { data: { users }, error: getUserError } = await supabase.auth.admin.listUsers();
      const userExists = users?.some((user: User) => user.email === email);

      if (userExists) {
        // Se o usuário existe, tenta fazer login
        console.log('Usuário existente, tentando fazer login...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (signInError) {
          console.error('Erro no login:', signInError);
          toast({
            title: "Erro no Login",
            description: "Senha incorreta. Por favor, tente novamente.",
            variant: "destructive",
          });
          return false;
        }

        if (signInData?.user) {
          console.log('Login realizado com sucesso:', signInData);
          toast({
            title: "Sucesso",
            description: "Login realizado com sucesso!",
          });
          return true;
        }
      } else {
        // Se o usuário não existe, tenta criar uma nova conta
        console.log('Usuário não encontrado, criando nova conta...');
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
          let errorMessage = "Ocorreu um erro ao criar sua conta.";
          
          if (signUpError.message.includes('Password should be at least 6 characters')) {
            errorMessage = "A senha deve ter pelo menos 6 caracteres.";
          } else if (signUpError.message.includes('User already registered')) {
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