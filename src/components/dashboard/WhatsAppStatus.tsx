import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      
      const { data, error } = await supabase.functions.invoke('evolution-qr', {
        body: { empresa_id: 8 } // TODO: Passar o ID correto da empresa
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