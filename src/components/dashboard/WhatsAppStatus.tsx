import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { ConnectionStatus } from "./ConnectionStatus";
import { QRCodeDisplay } from "./QRCodeDisplay";

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

  useEffect(() => {
    const checkConnectionStatus = async () => {
      try {
        console.log('🔄 Verificando status de conexão...');
        
        const { data: empresa, error: empresaError } = await supabase
          .from('Empresas')
          .select('url_instance, apikeyevo, instance_name')
          .eq('id', 8) // TODO: Use dynamic empresa ID
          .single();

        if (empresaError || !empresa?.url_instance) {
          console.error('Erro ao buscar URL da instância:', empresaError);
          return;
        }

        if (!empresa.instance_name) {
          console.log('Nome da instância não configurado');
          return;
        }

        const baseUrl = empresa.url_instance.split('/message')[0].replace(/\/$/, '');
        
        console.log('Verificando status para instância:', empresa.instance_name);
        
        const statusResponse = await fetch(`${baseUrl}/instance/connectionState/${empresa.instance_name}`, {
          headers: {
            'apikey': empresa.apikeyevo
          }
        });

        if (statusResponse.status === 404) {
          console.log('⚠️ Instância não encontrada, tentando criar...');
          const created = await createInstance(baseUrl, empresa.instance_name, empresa.apikeyevo);
          if (!created) return;
        } else if (!statusResponse.ok) {
          console.error('Erro ao verificar status:', await statusResponse.text());
          return;
        }

        const statusData = await statusResponse.json();
        console.log('Status da conexão:', statusData);

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

    checkConnectionStatus();
    const interval = setInterval(checkConnectionStatus, 30000);
    return () => clearInterval(interval);
  }, [isConnected]);

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
      
      const { data: empresa, error: empresaError } = await supabase
        .from('Empresas')
        .select('url_instance, instance_name')
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

      if (!empresa.instance_name) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Nome da instância não configurado. Configure o nome da instância nas configurações."
        });
        return;
      }

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
        <ConnectionStatus isConnected={isConnected} />
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
      
      <QRCodeDisplay qrCodeUrl={qrCodeUrl} isGeneratingQR={isGeneratingQR} />
    </Card>
  );
};