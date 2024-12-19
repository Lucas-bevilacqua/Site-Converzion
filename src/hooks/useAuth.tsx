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
      // Primeiro, tenta remover a empresa existente
      console.log('🗑️ Tentando remover empresa existente');
      const { error: deleteError } = await supabase
        .from('Empresas')
        .delete()
        .eq('emailempresa', email);

      if (deleteError) {
        console.log('⚠️ Erro ao tentar remover empresa ou empresa não existia:', deleteError);
      } else {
        console.log('✅ Empresa removida com sucesso ou não existia');
      }

      // Agora vamos criar uma nova conta
      console.log('📝 Criando nova conta e empresa');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: "default123",
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
            senha: "default123",
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