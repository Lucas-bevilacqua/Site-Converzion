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
      console.log('Verificando credenciais para:', email);
      
      // Primeiro, verificar se o email e senha correspondem a uma empresa
      const { data: empresa, error: empresaError } = await supabase
        .from('Empresas')
        .select('emailempresa, senha')
        .eq('emailempresa', email)
        .single();

      if (empresaError || !empresa) {
        console.error('Email não encontrado:', empresaError);
        toast({
          title: "Erro",
          description: "Email não encontrado no sistema",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (empresa.senha !== senha) {
        console.error('Senha incorreta');
        toast({
          title: "Erro",
          description: "Senha incorreta",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Verificar se o usuário já existe no Auth
      const { data: { user }, error: getUserError } = await supabase.auth.getUser();
      
      if (!user) {
        // Se o usuário não existe no Auth, criar
        console.log('Criando usuário no Auth...');
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password: senha,
        });

        if (signUpError) {
          console.error('Erro ao criar usuário:', signUpError);
          toast({
            title: "Erro",
            description: "Erro ao criar usuário no sistema",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      // Fazer login
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (authError) {
        console.error('Erro ao fazer login:', authError);
        toast({
          title: "Erro",
          description: "Erro ao fazer login",
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