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
      // Primeiro, verifica se já existe uma conta com este email
      console.log('Verificando se empresa existe...');
      const { data: empresaData, error: empresaError } = await supabase
        .from('Empresas')
        .select('*')
        .eq('emailempresa', email)
        .single();

      if (empresaError && empresaError.code === 'PGRST116') {
        // Empresa não existe, vamos criar uma nova conta
        console.log('Empresa não encontrada, criando nova conta...');
        
        // 1. Primeiro criamos o usuário no auth
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: { empresa_id },
            emailRedirectTo: window.location.origin + '/login'
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

        // 2. Se o usuário foi criado com sucesso, criamos o registro na tabela Empresas
        if (signUpData.user) {
          const { error: createEmpresaError } = await supabase
            .from('Empresas')
            .insert([
              { 
                emailempresa: email,
                senha: senha,
                NomeEmpresa: 'Nova Empresa',
                id: empresa_id
              }
            ]);

          if (createEmpresaError) {
            console.error('Erro ao criar registro da empresa:', createEmpresaError);
            // Se falhar ao criar a empresa, removemos o usuário criado
            await supabase.auth.admin.deleteUser(signUpData.user.id);
            toast({
              title: "Erro ao Criar Empresa",
              description: "Ocorreu um erro ao criar sua empresa. Por favor, tente novamente.",
              variant: "destructive",
            });
            return false;
          }

          toast({
            title: "Conta Criada",
            description: "Sua conta foi criada com sucesso! Você receberá um email de confirmação.",
          });
          return true;
        }
      } else if (empresaData) {
        // Empresa existe, tentamos fazer login
        console.log('Empresa encontrada, tentando login...');
        
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (signInError) {
          console.error('Erro no login:', signInError);
          toast({
            title: "Erro no Login",
            description: "Email ou senha incorretos. Por favor, tente novamente.",
            variant: "destructive",
          });
          return false;
        }

        if (signInData.user) {
          console.log('Login bem-sucedido:', signInData.user.email);
          toast({
            title: "Login Realizado",
            description: "Bem-vindo de volta!",
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