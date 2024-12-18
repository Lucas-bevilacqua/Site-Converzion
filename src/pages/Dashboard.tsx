import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      // Fetch empresa data
      const { data: empresa, error } = await supabase
        .from('empresas')
        .select('id, prompt, qr_code_url, is_connected')
        .eq('telefoneempresa', session.user.email)
        .single();

      if (error) {
        console.error('Error fetching empresa:', error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da empresa",
          variant: "destructive",
        });
        return;
      }

      if (empresa) {
        setEmpresaId(empresa.id);
        setPrompt(empresa.prompt || "");
        setQrCodeUrl(empresa.qr_code_url);
        setIsConnected(empresa.is_connected || false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  const handleSavePrompt = async () => {
    if (!empresaId) return;
    
    setLoading(true);
    const { error } = await supabase
      .from('empresas')
      .update({ prompt })
      .eq('id', empresaId);

    setLoading(false);

    if (error) {
      console.error('Error updating prompt:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o prompt",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sucesso",
      description: "Prompt salvo com sucesso!",
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Painel de Controle</h1>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>

        {/* QR Code Section */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Status do WhatsApp</h2>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-foreground">
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
          
          {!isConnected && qrCodeUrl && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Escaneie o QR Code abaixo com seu WhatsApp para conectar:
              </p>
              <div className="flex justify-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code WhatsApp" 
                  className="max-w-[300px] h-auto"
                />
              </div>
            </div>
          )}
        </Card>

        <div className="bg-card p-6 rounded-lg border border-border space-y-4">
          <h2 className="text-xl font-semibold text-foreground">Configuração do Agente IA</h2>
          <p className="text-muted-foreground">
            Configure o prompt que seu agente IA utilizará para interagir com seus clientes.
          </p>
          
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium text-foreground">
              Prompt do Agente
            </label>
            <Textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Digite aqui o prompt para seu agente IA..."
              className="min-h-[200px]"
            />
          </div>

          <Button 
            onClick={handleSavePrompt} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar Prompt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;