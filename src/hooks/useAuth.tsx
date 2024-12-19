import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (email: string, senha: string, empresa_id: number) => {
    setLoading(true);
    console.log('🔐 Iniciando processo de autenticação/cadastro');
    console.log('📧 Email:', email);

    try {
      // Primeiro, tenta fazer login diretamente
      console.log('🔑 Tentando login direto com as credenciais fornecidas');
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (!signInError) {
        console.log('✅ Login bem-sucedido!');
        toast({
          title: "Login Realizado",
          description: "Bem-vindo de volta!",
        });
        return true;
      }

      // Se o login falhou, verifica se a empresa existe
      console.log('🔍 Verificando se a empresa existe');
      const { data: empresaExistente } = await supabase
        .from('Empresas')
        .select('*')
        .eq('emailempresa', email)
        .single();

      if (empresaExistente) {
        console.log('❌ Empresa existe mas login falhou. Senha incorreta.');
        toast({
          title: "Erro no Login",
          description: "Use a senha: default123",
          variant: "destructive",
        });
        return false;
      }

      // Se não existe, cria uma nova conta
      console.log('📝 Criando nova conta e empresa');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: senha,
        options: {
          data: {
            empresa_id: empresa_id,
          }
        }
      });

      if (signUpError) {
        console.error('❌ Erro ao criar conta:', signUpError);
        toast({
          title: "Erro no Cadastro",
          description: "Não foi possível criar sua conta. Tente novamente.",
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
            senha: senha,
            NomeEmpresa: 'Nova Empresa'
          }
        ]);

      if (createEmpresaError) {
        console.error('❌ Erro ao criar empresa:', createEmpresaError);
        if (signUpData.user) {
          await supabase.auth.admin.deleteUser(signUpData.user.id);
        }
        toast({
          title: "Erro ao Criar Empresa",
          description: "Ocorreu um erro ao criar sua empresa. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      console.log('🎉 Conta e empresa criadas com sucesso!');
      toast({
        title: "Cadastro Realizado",
        description: "Sua conta foi criada com sucesso!",
      });
      return true;

    } catch (error) {
      console.error('❌ Erro inesperado:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
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