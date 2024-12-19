import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Iniciando processo de login para:', email);
      
      // Primeiro, verificar se o email e senha correspondem a uma empresa
      const { data: empresa, error: empresaError } = await supabase
        .from('Empresas')
        .select('*')
        .eq('emailempresa', email)
        .single();

      if (empresaError) {
        console.error('Erro ao buscar empresa:', empresaError);
        toast({
          title: "Erro",
          description: "Email não encontrado no sistema",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Empresa encontrada:', empresa);

      if (empresa.senha !== senha) {
        console.error('Senha incorreta para o email:', email);
        toast({
          title: "Erro",
          description: "Senha incorreta",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Tentar fazer login primeiro
      console.log('Tentando fazer login direto');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      // Se o login falhar, verificar se é porque o usuário não existe
      if (signInError) {
        console.log('Login falhou, tentando criar usuário:', signInError);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              empresa_id: empresa.id
            },
            emailRedirectTo: `${window.location.origin}/login`
          }
        });

        if (signUpError) {
          console.error('Erro ao criar usuário:', signUpError);
          toast({
            title: "Erro",
            description: "Erro ao criar usuário no sistema: " + signUpError.message,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
        
        console.log('Usuário criado com sucesso:', signUpData);
        
        // Mostrar mensagem de confirmação de email
        toast({
          title: "Sucesso",
          description: "Um email de confirmação foi enviado. Por favor, verifique sua caixa de entrada e confirme seu email antes de fazer login.",
        });
        setLoading(false);
        return;
      }

      // Se chegou aqui, o login foi bem sucedido
      // Verificar se o email foi confirmado
      if (!signInData.user?.email_confirmed_at) {
        console.log('Email ainda não confirmado');
        toast({
          title: "Erro",
          description: "Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      console.log('Login realizado com sucesso');
      toast({
        title: "Sucesso",
        description: "Login realizado com sucesso",
      });
      navigate("/dashboard");
    } catch (error) {
      console.error('Erro inesperado durante login:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Login</h2>
          <p className="text-muted-foreground mt-2">
            Entre com suas credenciais para acessar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <Input
              type="password"
              placeholder="Sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;