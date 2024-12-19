import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (email: string, senha: string, empresa_id: number) => {
    setLoading(true);
    console.log('🔐 Iniciando processo de autenticação');
    console.log('📧 Email:', email);
    console.log('🔑 Senha fornecida:', senha);

    try {
      // Primeiro, verifica se já existe uma empresa com este email
      const { data: empresaExistente, error: empresaError } = await supabase
        .from('Empresas')
        .select('*')
        .eq('emailempresa', email)
        .single();

      console.log('🏢 Resultado da busca por empresa:', { empresaExistente, empresaError });

      if (empresaExistente) {
        console.log('✅ Empresa encontrada, tentando fazer login');
        
        // Usa a senha armazenada no banco de dados
        const senhaParaLogin = empresaExistente.senha;
        console.log('🔑 Usando senha do banco:', senhaParaLogin);
        
        // Tenta fazer login com as credenciais fornecidas
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: senhaParaLogin,
        });

        console.log('🔓 Resultado do login:', { signInData, signInError });

        if (signInError) {
          console.error('❌ Erro ao fazer login:', signInError);
          toast({
            title: "Erro no Login",
            description: "Credenciais inválidas. Use a senha padrão: default123",
            variant: "destructive",
          });
          return false;
        }

        console.log('🎉 Login bem-sucedido!');
        toast({
          title: "Login Realizado",
          description: "Bem-vindo de volta!",
        });
        return true;
      }

      // Se não existe, cria uma nova conta
      console.log('📝 Empresa não encontrada, criando nova conta');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: "default123", // Sempre usa a senha padrão para novos usuários
        options: {
          data: {
            empresa_id: empresa_id,
          }
        }
      });

      console.log('👤 Resultado do cadastro:', { signUpData, signUpError });

      if (signUpError) {
        console.error('❌ Erro ao criar conta:', signUpError);
        toast({
          title: "Erro no Cadastro",
          description: `Não foi possível criar sua conta: ${signUpError.message}`,
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
            senha: "default123", // Usa a senha padrão
            NomeEmpresa: 'Nova Empresa'
          }
        ]);

      console.log('🏢 Resultado da criação da empresa:', { createEmpresaError });

      if (createEmpresaError) {
        console.error('❌ Erro ao criar empresa:', createEmpresaError);
        // Se falhar ao criar a empresa, remove o usuário criado
        if (signUpData.user) {
          await supabase.auth.admin.deleteUser(signUpData.user.id);
        }
        toast({
          title: "Erro ao Criar Empresa",
          description: `Ocorreu um erro ao criar sua empresa: ${createEmpresaError.message}`,
          variant: "destructive",
        });
        return false;
      }

      console.log('🎉 Conta e empresa criadas com sucesso!');
      toast({
        title: "Conta Criada",
        description: `Sua conta foi criada com sucesso! Sua senha padrão é: default123`,
      });
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
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