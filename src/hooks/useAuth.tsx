import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_PASSWORD = "cliente123"; // Senha padrão para novos usuários

export const useAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (email: string, senha: string, empresa_id: number) => {
    setLoading(true);
    console.log('Iniciando processo de autenticação para:', email);

    try {
      // Primeiro, verifica se já existe uma empresa com este email
      const { data: empresaExistente } = await supabase
        .from('Empresas')
        .select('*')
        .eq('emailempresa', email)
        .single();

      if (empresaExistente) {
        console.log('Empresa encontrada, tentando fazer login');
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });

        if (signInError) {
          console.error('Erro ao fazer login:', signInError);
          toast({
            title: "Erro no Login",
            description: "Email ou senha incorretos.",
            variant: "destructive",
          });
          return false;
        }

        console.log('Login bem-sucedido!');
        toast({
          title: "Login Realizado",
          description: "Bem-vindo de volta!",
        });
        return true;
      }

      // Se não existe, cria uma nova conta com a senha padrão
      console.log('Empresa não encontrada, criando nova conta com senha padrão');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: DEFAULT_PASSWORD, // Usando a senha padrão para novos usuários
      });

      if (signUpError) {
        console.error('Erro ao criar conta:', signUpError);
        toast({
          title: "Erro no Cadastro",
          description: "Não foi possível criar sua conta. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      // Cria o registro da empresa
      const { error: createEmpresaError } = await supabase
        .from('Empresas')
        .insert([
          {
            id: empresa_id,
            emailempresa: email,
            senha: DEFAULT_PASSWORD, // Salvando a senha padrão no registro da empresa
            NomeEmpresa: 'Nova Empresa'
          }
        ]);

      if (createEmpresaError) {
        console.error('Erro ao criar empresa:', createEmpresaError);
        // Se falhar ao criar a empresa, remove o usuário criado
        if (signUpData.user) {
          await supabase.auth.admin.deleteUser(signUpData.user.id);
        }
        toast({
          title: "Erro ao Criar Empresa",
          description: "Ocorreu um erro ao criar sua empresa. Por favor, tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      console.log('Conta e empresa criadas com sucesso!');
      toast({
        title: "Conta Criada",
        description: `Sua conta foi criada com sucesso! Sua senha padrão é: ${DEFAULT_PASSWORD}`,
      });
      return true;

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