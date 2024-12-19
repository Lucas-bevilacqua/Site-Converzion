import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WhatsAppStatus from "@/components/dashboard/WhatsAppStatus";
import AIAgentConfig from "@/components/dashboard/AIAgentConfig";

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [empresaId, setEmpresaId] = useState<number | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      console.log('Fetching empresa data for email:', session.user.email);
      
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
        console.log('Empresa data loaded:', { id: empresa.id, hasPrompt: !!empresa.prompt, hasQR: !!empresa.qr_code_url });
        setEmpresaId(empresa.id);
        setPrompt(empresa.prompt || "");
        setQrCodeUrl(empresa.qr_code_url);
        setIsConnected(empresa.is_connected || false);
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Check status periodically
  useEffect(() => {
    if (!empresaId) return;

    const checkStatus = async () => {
      try {
        console.log('Checking WhatsApp status for empresa:', empresaId);
        const { data, error } = await supabase.functions.invoke('evolution-status', {
          body: { empresaId }
        });

        if (error) {
          console.error('Error checking status:', error);
          return;
        }

        console.log('Status update received:', data);
        setIsConnected(data.isConnected);
      } catch (error) {
        console.error('Error checking status:', error);
      }
    };

    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [empresaId]);

  const handleGenerateQR = async () => {
    if (!empresaId || isGeneratingQR) return;

    setIsGeneratingQR(true);
    try {
      console.log('Generating QR code for empresa:', empresaId);
      const { data, error } = await supabase.functions.invoke('evolution-qr', {
        body: { empresaId }
      });

      if (error) {
        console.error('Error generating QR code:', error);
        toast({
          title: "Erro",
          description: "Não foi possível gerar o QR code",
          variant: "destructive",
        });
        return;
      }

      console.log('QR code generated successfully');
      setQrCodeUrl(data.qrcode);
      setIsConnected(false);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR code",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingQR(false);
    }
  };

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

        <WhatsAppStatus
          isConnected={isConnected}
          isGeneratingQR={isGeneratingQR}
          qrCodeUrl={qrCodeUrl}
          onGenerateQR={handleGenerateQR}
        />

        <AIAgentConfig
          prompt={prompt}
          loading={loading}
          onPromptChange={setPrompt}
          onSavePrompt={handleSavePrompt}
        />
      </div>
    </div>
  );
};

export default Dashboard;