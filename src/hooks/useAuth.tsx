import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { removeExistingEmpresa, createEmpresa } from "@/services/auth/empresa.service";
import { signUpUser } from "@/services/auth/auth.service";

export const useAuth = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleEmailSignIn = async (email: string, senha: string, empresa_id: number) => {
    setLoading(true);
    console.log('🔐 Iniciando processo de autenticação/cadastro');
    console.log('📧 Email:', email);

    try {
      // Remove empresa existente
      const { error: removeError } = await removeExistingEmpresa(email);
      if (removeError) {
        console.log('⚠️ Erro ao tentar remover empresa:', removeError);
      }

      // Cria nova conta
      const { success, error: signUpError } = await signUpUser(email, "default123", empresa_id);
      
      if (!success) {
        toast({
          title: "Erro no Cadastro",
          description: "Não foi possível criar sua conta. Tente novamente.",
          variant: "destructive",
        });
        return false;
      }

      // Cria nova empresa
      const { error: createEmpresaError } = await createEmpresa({
        id: empresa_id,
        emailempresa: email,
        senha: "default123",
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