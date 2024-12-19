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
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o email.",
        variant: "destructive",
      });
      return;
    }

    // Se for um novo usuário, a senha será definida como padrão
    const success = await handleEmailSignIn(email, senha || "cliente123", 1);
    if (success) {
      console.log('Login bem-sucedido, redirecionando...');
      window.location.href = "/dashboard";
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
          placeholder="Sua senha (opcional para novo cadastro)"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
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