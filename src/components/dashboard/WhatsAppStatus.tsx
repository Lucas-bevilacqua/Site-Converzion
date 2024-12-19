import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export const WhatsAppStatus = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const { toast } = useToast();

  const checkConnectionStatus = async () => {
    try {
      console.log('🔍 Verificando status da conexão...');
      
      // Pega o usuário atual
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        console.log('❌ Usuário não autenticado');
        return;
      }

      const { data: empresa, error: empresaError } = await supabase
        .from('Empresas')
        .select('url_instance, instance_name, apikeyevo')
        .eq('emailempresa', session.user.email)
        .single();

      if (empresaError || !empresa?.url_instance || !empresa?.apikeyevo) {
        console.error('Erro ao buscar dados da empresa:', empresaError);
        return;
      }

      console.log('📱 Instance name:', empresa.instance_name);
      console.log('🔗 URL da instância:', empresa.url_instance);

      const { data, error } = await supabase.functions.invoke('evolution-status', {
        body: { email: session.user.email }
      });

      if (error) {
        console.error('❌ Erro ao verificar status:', error);
        return;
      }

      console.log('✅ Status da conexão:', data);
      setIsConnected(data.isConnected);

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error);
    }
  };

  useEffect(() => {
    checkConnectionStatus();
    // Verificar status a cada 30 segundos
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Iniciando processo de conexão...');
      
      // Pega o usuário atual
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

      if (empresaError || !empresa?.url_instance || !empresa?.apikeyevo) {
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
          description: "Não foi possível gerar o QR code. Tente novamente."
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
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
        <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
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
          ) : (
            <>
              <QrCode className="mr-2 h-4 w-4" />
              {isConnected ? 'Reconectar' : 'Conectar WhatsApp'}
            </>
          )}
        </Button>
      </div>

      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar WhatsApp</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-6">
            {qrCode && (
              <img
                src={qrCode}
                alt="QR Code para conexão do WhatsApp"
                className="w-64 h-64"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};