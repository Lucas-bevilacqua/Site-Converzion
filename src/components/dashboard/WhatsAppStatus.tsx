import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface WhatsAppStatusProps {
  isConnected: boolean;
  isGeneratingQR: boolean;
  qrCodeUrl: string | null;
  onGenerateQR: () => void;
  telefoneempresa: string | null;
}

export const WhatsAppStatus = ({ 
  isConnected, 
  isGeneratingQR, 
  qrCodeUrl, 
  onGenerateQR,
  telefoneempresa 
}: WhatsAppStatusProps) => {
  const { toast } = useToast();

  const createInstance = async (baseUrl: string, instanceName: string, apiKey: string) => {
    console.log('🔄 Tentando criar instância:', instanceName);
    
    try {
      const response = await fetch(`${baseUrl}/instance/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': apiKey
        },
        body: JSON.stringify({
          instanceName: instanceName,
          qrcode: true,
          integration: "WHATSAPP-BAILEYS",
          token: apiKey
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro ao criar instância:', errorText);
        return false;
      }

      console.log('✅ Instância criada com sucesso');
      return true;
    } catch (error) {
      console.error('❌ Erro ao criar instância:', error);
      return false;
    }
  };

  // Poll for connection status every 30 seconds
  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        console.log('🔄 Verificando status de conexão...');
        
        // First get the empresa data to get the instance URL
        const { data: empresa, error: empresaError } = await supabase
          .from('Empresas')
          .select('url_instance, apikeyevo, telefoneempresa')
          .eq('id', 8) // TODO: Use dynamic empresa ID
          .single();

        if (empresaError || !empresa?.url_instance) {
          console.error('Erro ao buscar URL da instância:', empresaError);
          return;
        }

        if (!empresa.telefoneempresa) {
          console.log('Telefone da empresa não configurado');
          return;
        }

        // Clean up the URL to ensure it's just the base URL without any trailing paths
        const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/$/, '');
        const instanceName = empresa.telefoneempresa.replace(/\D/g, '');
        
        console.log('Verificando status para instância:', instanceName);
        
        // Check instance status using the correct endpoint
        const statusResponse = await fetch(`${baseUrl}/instance/connectionState/${instanceName}`, {
          headers: {
            'apikey': empresa.apikeyevo
          }
        });

        // If instance doesn't exist, try to create it
        if (statusResponse.status === 404) {
          console.log('⚠️ Instância não encontrada, tentando criar...');
          const created = await createInstance(baseUrl, instanceName, empresa.apikeyevo);
          if (!created) return;
        } else if (!statusResponse.ok) {
          console.error('Erro ao verificar status:', await statusResponse.text());
          return;
        }

        const statusData = await statusResponse.json();
        console.log('Status da conexão:', statusData);

        // Update connection status in database if different
        const isNowConnected = statusData.state === 'open';
        if (isNowConnected !== isConnected) {
          console.log(`Atualizando status de conexão para: ${isNowConnected}`);
          await supabase
            .from('Empresas')
            .update({ is_connected: isNowConnected })
            .eq('id', 8); // TODO: Use dynamic empresa ID
        }
      } catch (error) {
        console.error('❌ Erro ao verificar status:', error);
      }
    };

    // Check immediately
    checkConnectionStatus();

    // Then check every 30 seconds
    const interval = setInterval(checkConnectionStatus, 30000);

    return () => clearInterval(interval);
  }, [isConnected]);

  // Poll for QR code updates every 20 seconds if not connected
  useEffect(() => {
    if (isConnected || !qrCodeUrl) return;

    const interval = setInterval(async () => {
      try {
        console.log('🔄 Atualizando QR code...');
        await onGenerateQR();
      } catch (error) {
        console.error('❌ Erro ao atualizar QR code:', error);
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [isConnected, qrCodeUrl, onGenerateQR]);

  const handleGenerateQR = async () => {
    try {
      if (!telefoneempresa) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "É necessário cadastrar um número de telefone para a empresa antes de gerar o QR code"
        });
        return;
      }

      console.log('Iniciando geração do QR code...');
      
      // First get the empresa data to get the instance URL
      const { data: empresa, error: empresaError } = await supabase
        .from('Empresas')
        .select('url_instance')
        .eq('id', 8) // TODO: Use dynamic empresa ID
        .single();

      if (empresaError || !empresa?.url_instance) {
        console.error('Erro ao buscar URL da instância:', empresaError);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "URL da instância não configurada. Configure a URL da instância nas configurações."
        });
        return;
      }

      // Clean up the URL to ensure it's just the base URL without any trailing paths
      const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/$/, '');
      console.log('URL base da instância:', baseUrl);
      
      const { data, error } = await supabase.functions.invoke('evolution-qr', {
        body: { 
          empresa_id: 8, // TODO: Use dynamic empresa ID
          instance_url: baseUrl
        }
      });

      if (error) {
        console.error('Erro ao gerar QR code:', error);
        throw error;
      }

      console.log('QR code gerado com sucesso:', data);
      await onGenerateQR();
      
    } catch (error: any) {
      console.error('Error generating QR code:', error);
      let errorMessage = "Não foi possível gerar o QR code";
      
      // If we have details from the API response, show them
      if (error.details) {
        errorMessage += `: ${error.details}`;
      }
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage
      });
    }
  };

  return (
    <Card className="bg-[#1A1F2C] border-gray-700 p-6 space-y-4">
      <h2 className="text-xl font-semibold text-white">Status do WhatsApp</h2>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm text-gray-300">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        {!isConnected && (
          <Button 
            onClick={handleGenerateQR}
            disabled={isGeneratingQR || !telefoneempresa}
            variant="secondary"
            className="bg-[#403E43] hover:bg-[#2D2B30] text-white"
          >
            {isGeneratingQR && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Gerar QR Code
          </Button>
        )}
      </div>
      
      {!telefoneempresa && !isConnected && (
        <p className="text-sm text-yellow-400">
          É necessário cadastrar um número de telefone para a empresa antes de gerar o QR code
        </p>
      )}
      
      {!isConnected && qrCodeUrl && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400">
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

      {!isConnected && !qrCodeUrl && isGeneratingQR && (
        <div className="flex justify-center items-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}
    </Card>
  );
};