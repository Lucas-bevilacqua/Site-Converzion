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
      // Primeiro, tenta fazer login diretamente
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      console.log('🔓 Tentativa de login direto:', { signInData, signInError });

      if (!signInError) {
        console.log('✅ Login bem-sucedido!');
        toast({
          title: "Login Realizado",
          description: "Bem-vindo de volta!",
        });
        return true;
      }

      // Se o login falhou, verifica se a empresa existe
      const { data: empresaExistente, error: empresaError } = await supabase
        .from('Empresas')
        .select('*')
        .eq('emailempresa', email)
        .single();

      console.log('🏢 Busca por empresa:', { empresaExistente, empresaError });

      if (empresaExistente) {
        // Se a empresa existe mas o login falhou, provavelmente está usando senha errada
        console.log('❌ Empresa existe mas credenciais inválidas');
        toast({
          title: "Erro no Login",
          description: "Credenciais inválidas. Use a senha: default123",
          variant: "destructive",
        });
        return false;
      }

      // Se chegou aqui, é um novo usuário - vamos criar conta
      console.log('📝 Criando nova conta');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: "default123",
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
            senha: "default123",
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
        description: "Sua conta foi criada com sucesso! Sua senha é: default123",
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