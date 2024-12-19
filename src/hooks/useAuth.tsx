import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { removeExistingEmpresa, createEmpresa } from "@/services/auth/empresa.service";
import { signUpUser, signInUser } from "@/services/auth/auth.service";

export const useAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (email: string, senha: string, empresa_id: number) => {
    setLoading(true);
    console.log('🔐 Iniciando processo de autenticação/cadastro');
    console.log('📧 Email:', email);

    try {
      // Primeiro tenta fazer login
      const { success: signInSuccess, error: signInError } = await signInUser(email, senha);
      
      if (signInSuccess) {
        console.log('✅ Login bem-sucedido!');
        toast({
          title: "Bem-vindo de volta!",
          description: "Login realizado com sucesso.",
        });
        return true;
      }

      // Se o login falhar, tenta criar uma nova conta
      console.log('🆕 Tentando criar nova conta...');
      
      // Remove empresa existente
      const { error: removeError } = await removeExistingEmpresa(email);
      if (removeError) {
        console.log('⚠️ Erro ao tentar remover empresa:', removeError);
      }

      // Tenta criar nova conta
      const { success: signUpSuccess, error: signUpError } = await signUpUser(email, senha, empresa_id);
      
      if (!signUpSuccess) {
        toast({
          title: "Erro no Cadastro",
          description: signUpError || "Não foi possível criar sua conta. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      // Cria nova empresa
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