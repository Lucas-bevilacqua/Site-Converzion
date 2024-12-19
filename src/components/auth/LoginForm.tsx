import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const { loading, handleEmailSignIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Iniciando submissão do formulário');
    console.log('📧 Email:', email);
    
    if (!email) {
      console.log('❌ Email não fornecido');
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o email.",
        variant: "destructive",
      });
      return;
    }

    console.log('✨ Tentando login/cadastro com o email fornecido');
    const success = await handleEmailSignIn(email, "default123", 1);
    
    if (success) {
      console.log('🎉 Login/cadastro bem-sucedido, redirecionando...');
      window.location.href = "/dashboard";
    } else {
      console.log('❌ Login/cadastro falhou');
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

      <p className="text-sm text-muted-foreground mt-1">
        A senha padrão é: default123
      </p>

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? "Processando..." : "Entrar / Cadastrar"}
      </Button>
    </form>
  );
};