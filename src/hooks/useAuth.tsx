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
      // First, try to sign in
      console.log('Tentando fazer login...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (signInError) {
        console.log('Login falhou, verificando se precisa criar conta:', signInError);
        
        if (signInError.message.includes('Invalid login credentials')) {
          // User doesn't exist, let's create one
          console.log('Criando nova conta...');
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: senha,
            options: {
              data: {
                empresa_id,
              },
            },
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

          if (signUpData.user) {
            // Create empresa record
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
              console.error('Erro ao criar empresa:', createEmpresaError);
              // Cleanup: remove auth user if empresa creation fails
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
        } else {
          console.error('Erro de autenticação:', signInError);
          toast({
            title: "Erro no Login",
            description: signInError.message,
            variant: "destructive",
          });
          return false;
        }
      }

      if (signInData.user) {
        console.log('Login bem-sucedido:', signInData.user.email);
        toast({
          title: "Login Realizado",
          description: "Bem-vindo de volta!",
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