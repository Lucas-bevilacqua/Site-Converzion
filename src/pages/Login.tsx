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
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting to sign in with email:', email);
      
      // First, check if the email exists in the Empresas table
      const { data: empresa, error: empresaError } = await supabase
        .from('Empresas')
        .select('emailempresa')
        .eq('emailempresa', email)
        .single();

      if (empresaError || !empresa) {
        console.error('Email not found in Empresas table:', empresaError);
        toast({
          title: "Erro",
          description: "Email não encontrado no sistema",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Error sending magic link:', error);
        toast({
          title: "Erro",
          description: "Erro ao enviar o link de acesso",
          variant: "destructive",
        });
        return;
      }

      console.log('Magic link sent successfully');
      toast({
        title: "Sucesso",
        description: "Link de acesso enviado para seu email",
      });
    } catch (error) {
      console.error('Unexpected error during login:', error);
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
            Entre com seu email para receber o link de acesso
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

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar link de acesso"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Login;