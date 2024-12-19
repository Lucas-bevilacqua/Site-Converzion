import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode, Settings } from "lucide-react";
import { QRCodeDialog } from "./QRCodeDialog";
import { ConnectionIndicator } from "./ConnectionIndicator";
import { useNavigate } from "react-router-dom";

export const WhatsAppStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
        console.error('Erro ao buscar dados da empresa:', empresaError);
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

      console.log('📱 Instance name:', empresa.instance_name);
      console.log('🔗 URL da instância:', empresa.url_instance);
      console.log('🔌 Status atual:', empresa.is_connected ? 'Conectado' : 'Desconectado');

      setIsConnected(empresa.is_connected || false);

      try {
        const { data, error } = await supabase.functions.invoke('evolution-status', {
          body: { email: session.user.email }
        });

        if (error) {
          console.error('❌ Erro ao verificar status:', error);
          
          try {
            const errorBody = JSON.parse(error.body || '{}');
            
            if (errorBody?.error === 'Credenciais do Evolution não configuradas' || 
                errorBody?.needsSetup === true) {
              console.log('⚙️ Evolution precisa ser configurado');
              setNeedsSetup(true);
              setIsConnected(false);
              
              const { error: updateError } = await supabase
                .from('Empresas')
                .update({ is_connected: false })
                .eq('emailempresa', session.user.email);

              if (updateError) {
                console.error('❌ Erro ao atualizar status no banco:', updateError);
              }
            }
          } catch (parseError) {
            console.error('❌ Erro ao parsear resposta do erro:', parseError);
          }
          return;
        }

        console.log('✅ Status da conexão:', data);
        setIsConnected(data.isConnected);
        setNeedsSetup(data.needsSetup || false);

        if (empresa.is_connected !== data.isConnected) {
          console.log('🔄 Atualizando status no banco:', data.isConnected);
          const { error: updateError } = await supabase
            .from('Empresas')
            .update({ is_connected: data.isConnected })
            .eq('emailempresa', session.user.email);

          if (updateError) {
            console.error('❌ Erro ao atualizar status no banco:', updateError);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao verificar status na API:', error);
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

  useEffect(() => {
    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    if (needsSetup) {
      navigate('/dashboard/settings');
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Iniciando processo de conexão...');
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        console.log('❌ Usuário não autenticado');
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Usuário não autenticado"
        });
        return;
      }

      const { data: empresa, error: empresaError } = await supabase
        .from('Empresas')
        .select('url_instance, instance_name, apikeyevo')
        .eq('emailempresa', session.user.email)
        .single();

      if (empresaError || !empresa?.url_instance || !empresa?.apikeyevo || !empresa?.instance_name) {
        console.error('Erro ao buscar dados da empresa:', empresaError);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Credenciais da Evolution não configuradas. Configure as credenciais nas configurações."
        });
        return;
      }

      console.log('📱 Instance name:', empresa.instance_name);
      console.log('🔗 URL da instância:', empresa.url_instance);

      const { data: qrData, error } = await supabase.functions.invoke('evolution-qr', {
        body: { email: session.user.email }
      });

      if (error) {
        console.error('❌ Erro ao gerar QR code:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: error.message || "Não foi possível gerar o QR code. Tente novamente."
        });
        return;
      }

      console.log('✅ QR code gerado com sucesso');
      setQrCode(qrData.qr);
      setShowQRCode(true);

    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao tentar conectar. Tente novamente."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <ConnectionIndicator isConnected={isConnected} needsSetup={needsSetup} />
        <Button
          onClick={handleConnect}
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