import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("default123"); // Inicializa com a senha padrão correta
  const { loading, handleEmailSignIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Iniciando submissão do formulário');
    console.log('📧 Email:', email);
    console.log('🔑 Senha:', senha);
    
    if (!email) {
      console.log('❌ Email não fornecido');
      toast({
        title: "Campo obrigatório",
        description: "Por favor, preencha o email.",
        variant: "destructive",
      });
      return;
    }

    console.log('✨ Tentando login com as credenciais fornecidas');
    const success = await handleEmailSignIn(email, senha, 1);
    
    if (success) {
      console.log('🎉 Login bem-sucedido, redirecionando...');
      window.location.href = "/dashboard";
    } else {
      console.log('❌ Login falhou');
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
        <p className="text-sm text-muted-foreground mt-1">
          Senha padrão pré-preenchida: default123
        </p>
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