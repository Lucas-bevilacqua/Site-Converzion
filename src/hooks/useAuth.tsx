import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createEmpresa, recreateEmpresa } from "@/services/auth/empresa.service";
import { signUpUser, signInUser } from "@/services/auth/auth.service";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (email: string, senha: string, empresa_id: number) => {
    setLoading(true);
    console.log('🔐 Iniciando processo de autenticação/cadastro');
    console.log('📧 Email:', email);

    try {
      // First try to sign in
      const { success: signInSuccess, error: signInError } = await signInUser(email, senha);
      
      if (signInSuccess) {
        console.log('✅ Login bem-sucedido!');
        
        // Check if empresa exists
        const { data: empresa } = await supabase
          .from('Empresas')
          .select()
          .eq('emailempresa', email)
          .maybeSingle();
        
        if (!empresa) {
          console.log('⚠️ Empresa não encontrada, recriando...');
          await recreateEmpresa(email, senha);
        }
        
        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso.",
        });
        return true;
      }

      // If login failed because user doesn't exist, try to create a new account
      if (signInError === 'user_not_found') {
        console.log('🆕 Tentando criar nova conta...');
        
        const { success: signUpSuccess, error: signUpError } = await signUpUser(email, senha, empresa_id);
        
        if (!signUpSuccess) {
          toast({
            title: "Erro no Cadastro",
            description: signUpError || "Não foi possível criar sua conta. Tente novamente.",
            variant: "destructive",
          });
          return false;
        }

        // Create new empresa
        console.log('📝 Criando nova empresa...');
        const { error: createEmpresaError } = await createEmpresa({
          id: empresa_id,
          emailempresa: email,
          senha: senha,
          NomeEmpresa: 'Nova Empresa'
        });

        if (createEmpresaError) {
          console.error('❌ Erro ao criar empresa:', createEmpresaError);
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
      }

      // If we got here, it's an unexpected error
      toast({
        title: "Erro na Autenticação",
        description: signInError || "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
      return false;

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