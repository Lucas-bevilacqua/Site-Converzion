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
      // Primeiro verifica se existe uma empresa com esse email
      console.log('Verificando se empresa existe...');
      const { data: empresaData, error: empresaError } = await supabase
        .from('Empresas')
        .select('*')
        .eq('emailempresa', email)
        .single();

      if (empresaError) {
        console.log('Erro ao verificar empresa:', empresaError);
        if (empresaError.code === 'PGRST116') {
          console.log('Empresa não encontrada, tentando criar conta...');
          // Se não existe, tenta criar uma nova conta
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
              data: { empresa_id },
              emailRedirectTo: window.location.origin + '/login'
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

          // Cria o registro na tabela Empresas
          const { error: createEmpresaError } = await supabase
            .from('Empresas')
            .insert([
              { 
                emailempresa: email,
                senha: senha,
                NomeEmpresa: 'Nova Empresa' // Nome temporário
              }
            ]);

          if (createEmpresaError) {
            console.error('Erro ao criar empresa:', createEmpresaError);
            toast({
              title: "Erro ao Criar Empresa",
              description: "Não foi possível criar o registro da empresa.",
              variant: "destructive",
            });
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
        }
        return false;
      }

      // Se a empresa existe, tenta fazer login
      console.log('Empresa encontrada, tentando fazer login...');
      if (empresaData.senha !== senha) {
        console.log('Senha incorreta');
        toast({
          title: "Erro no Login",
          description: "Senha incorreta. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        console.error('Erro no login:', signInError);
        toast({
          title: "Erro no Login",
          description: "Ocorreu um erro ao fazer login. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
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