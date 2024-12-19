import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const { loading, handleEmailSignIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Iniciando submissão do formulário com email:', email);
    
    if (!email || !senha) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Tentando autenticar usuário...');
      const success = await handleEmailSignIn(email, senha, 1);
      
      if (success) {
        console.log('Login bem-sucedido, redirecionando...');
        toast({
          title: "Login bem-sucedido",
          description: "Você será redirecionado para o dashboard.",
        });
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      
      let errorMessage = "Ocorreu um erro durante o login. Por favor, tente novamente.";
      
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = "Email ou senha incorretos. Se você não possui uma conta, uma será criada automaticamente.";
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = "Por favor, confirme seu email antes de fazer login.";
      } else if (error.message?.includes('Email logins are disabled')) {
        errorMessage = "Login por email está desabilitado. Por favor, contate o suporte.";
      }
      
      toast({
        title: "Erro no login",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="email"
          placeholder="Seu email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full"
        />
      </div>

      <div>
        <Input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
          className="w-full"
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
  );
};