import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode, Settings } from "lucide-react";
import { QRCodeDialog } from "./QRCodeDialog";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { useNavigate } from "react-router-dom";
import { useEvolution } from "@/hooks/useEvolution";

export const WhatsAppStatus = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isLoading, qrCode, handleConnect } = useEvolution();

  const checkConnectionStatus = async () => {
    try {
      console.log('🔍 Verificando status da conexão...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        console.log('❌ Usuário não autenticado');
        return;
      }

      const { data: empresa, error: empresaError } = await supabase
        .from('Empresas')
        .select('url_instance, instance_name, apikeyevo, is_connected')
        .eq('emailempresa', session.user.email)
        .maybeSingle();

      if (empresaError) {
        console.error('❌ Erro ao buscar dados da empresa:', empresaError);
        return;
      }

      if (!empresa || !empresa.url_instance || !empresa.apikeyevo || !empresa.instance_name) {
        console.log('❌ Credenciais não configuradas');
        setNeedsSetup(true);
        setIsConnected(false);
        toast({
          title: "Configuração necessária",
          description: "Configure suas credenciais do Evolution nas configurações.",
          variant: "destructive",
        });
        return;
      }

      setIsConnected(empresa.is_connected || false);

      try {
        const { data, error } = await supabase.functions.invoke('evolution-status', {
          body: { email: session.user.email }
        });

        if (error) {
          console.error('❌ Erro ao verificar status:', error);
          handleStatusError(error, session.user.email);
          return;
        }

        updateConnectionStatus(data, session.user.email);

      } catch (error: any) {
        console.error('❌ Erro ao verificar status na API:', error);
        if (error.message?.includes('404') || error.status === 404) {
          setNeedsSetup(true);
          setIsConnected(false);
          await supabase
            .from('Empresas')
            .update({ is_connected: false })
            .eq('emailempresa', session.user.email);
        }
      }

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível verificar o status da conexão."
      });
    }
  };

  const handleStatusError = async (error: any, email: string) => {
    try {
      let errorBody;
      if (typeof error.body === 'string') {
        errorBody = JSON.parse(error.body);
      } else {
        errorBody = error.body;
      }
      
      if (errorBody?.error?.includes('404') || 
          errorBody?.needsSetup === true || 
          errorBody?.error === 'Credenciais do Evolution não configuradas') {
        console.log('⚙️ Evolution precisa ser configurado');
        setNeedsSetup(true);
        setIsConnected(false);
        
        await supabase
          .from('Empresas')
          .update({ is_connected: false })
          .eq('emailempresa', email);
      }
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta do erro:', parseError);
    }
  };

  const updateConnectionStatus = async (data: any, email: string) => {
    console.log('✅ Status da conexão:', data);
    setIsConnected(data.isConnected);
    setNeedsSetup(data.needsSetup || false);

    if (data.isConnected !== isConnected) {
      console.log('🔄 Atualizando status no banco:', data.isConnected);
      const { error: updateError } = await supabase
        .from('Empresas')
        .update({ is_connected: data.isConnected })
        .eq('emailempresa', email);

      if (updateError) {
        console.error('❌ Erro ao atualizar status no banco:', updateError);
      }
    }
  };

  useEffect(() => {
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const onConnect = async () => {
    if (needsSetup) {
      navigate('/dashboard/settings');
      return;
    }

    const newQrCode = await handleConnect();
    if (newQrCode) {
      setShowQRCode(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ConnectionIndicator isConnected={isConnected} needsSetup={needsSetup} />
        <Button
          onClick={onConnect}
          disabled={isLoading}
          variant={isConnected ? "outline" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Conectando...
            </>
          ) : needsSetup ? (
            <>
              <Settings className="mr-2 h-4 w-4" />
              Configurar Evolution
            </>
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              {isConnected ? 'Reconectar' : 'Conectar WhatsApp'}
            </>
          )}
        </Button>
      </div>

      <QRCodeDialog
        showQRCode={showQRCode}
        setShowQRCode={setShowQRCode}
        qrCode={qrCode}
        needsSetup={needsSetup}
      />
    </div>
  );
};